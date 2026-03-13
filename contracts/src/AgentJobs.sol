// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IAgentJobs} from "./interfaces/IAgentJobs.sol";

contract AgentJobs is IAgentJobs {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    uint256 private _jobCount;
    mapping(uint256 => Job) private _jobs;

    error InvalidAddress();
    error InvalidExpiry();
    error JobNotFound();
    error InvalidStatus(Status expected, Status actual);
    error OnlyClient();
    error OnlyProvider();
    error OnlyEvaluator();
    error NotExpired();
    error ZeroBudget();

    modifier onlyClient(uint256 jobId) {
        if (msg.sender != _jobs[jobId].client) revert OnlyClient();
        _;
    }

    modifier onlyProvider(uint256 jobId) {
        if (msg.sender != _jobs[jobId].provider) revert OnlyProvider();
        _;
    }

    modifier onlyEvaluator(uint256 jobId) {
        if (msg.sender != _jobs[jobId].evaluator) revert OnlyEvaluator();
        _;
    }

    constructor(address _usdc) {
        if (_usdc == address(0)) revert InvalidAddress();
        usdc = IERC20(_usdc);
    }

    function createJob(
        address provider,
        address evaluator,
        uint256 expiredAt,
        string calldata description,
        address /* hook — ignored for MVP */
    ) external returns (uint256 jobId) {
        if (provider == address(0) || evaluator == address(0)) {
            revert InvalidAddress();
        }
        if (expiredAt <= block.timestamp) revert InvalidExpiry();

        jobId = _jobCount++;

        Job storage job = _jobs[jobId];
        job.id = jobId;
        job.client = msg.sender;
        job.provider = provider;
        job.evaluator = evaluator;
        job.expiredAt = expiredAt;
        job.description = description;
        job.status = Status.Open;

        emit JobCreated(jobId, msg.sender, provider, evaluator);
    }

    function fund(uint256 jobId, uint256 expectedBudget) external onlyClient(jobId) {
        _requireExists(jobId);
        Job storage job = _jobs[jobId];
        _requireStatus(job, Status.Open);
        if (expectedBudget == 0) revert ZeroBudget();

        job.budget = expectedBudget;
        job.status = Status.Funded;

        usdc.safeTransferFrom(msg.sender, address(this), expectedBudget);

        emit JobFunded(jobId, expectedBudget);
    }

    function submit(
        uint256 jobId,
        bytes32 deliverable
    ) external onlyProvider(jobId) {
        _requireExists(jobId);
        Job storage job = _jobs[jobId];
        _requireStatus(job, Status.Funded);

        job.deliverable = deliverable;
        job.status = Status.Submitted;

        emit JobSubmitted(jobId, deliverable);
    }

    function complete(
        uint256 jobId,
        bytes32 reason
    ) external onlyEvaluator(jobId) {
        _requireExists(jobId);
        Job storage job = _jobs[jobId];
        _requireStatus(job, Status.Submitted);

        job.status = Status.Completed;

        usdc.safeTransfer(job.provider, job.budget);

        emit JobCompleted(jobId, reason);
    }

    function reject(
        uint256 jobId,
        bytes32 reason
    ) external onlyEvaluator(jobId) {
        _requireExists(jobId);
        Job storage job = _jobs[jobId];
        _requireStatus(job, Status.Submitted);

        job.status = Status.Rejected;

        usdc.safeTransfer(job.client, job.budget);

        emit JobRejected(jobId, reason);
    }

    function claimRefund(uint256 jobId) external onlyClient(jobId) {
        _requireExists(jobId);
        Job storage job = _jobs[jobId];

        if (
            job.status != Status.Funded && job.status != Status.Submitted
        ) {
            revert InvalidStatus(Status.Funded, job.status);
        }
        if (block.timestamp <= job.expiredAt) revert NotExpired();

        job.status = Status.Expired;

        usdc.safeTransfer(job.client, job.budget);

        emit JobRefunded(jobId);
    }

    function getJob(uint256 jobId) external view returns (Job memory) {
        _requireExists(jobId);
        return _jobs[jobId];
    }

    function jobCount() external view returns (uint256) {
        return _jobCount;
    }

    function _requireExists(uint256 jobId) private view {
        if (jobId >= _jobCount) revert JobNotFound();
    }

    function _requireStatus(Job storage job, Status expected) private view {
        if (job.status != expected) {
            revert InvalidStatus(expected, job.status);
        }
    }
}
