// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAgentJobs {
    enum Status { Open, Funded, Submitted, Completed, Rejected, Expired }

    struct Job {
        uint256 id;
        address client;
        address provider;
        address evaluator;
        uint256 budget;
        uint256 expiredAt;
        string description;
        bytes32 deliverable;
        Status status;
    }

    event JobCreated(
        uint256 indexed jobId,
        address indexed client,
        address provider,
        address evaluator
    );
    event JobFunded(uint256 indexed jobId, uint256 budget);
    event JobSubmitted(uint256 indexed jobId, bytes32 deliverable);
    event JobCompleted(uint256 indexed jobId, bytes32 reason);
    event JobRejected(uint256 indexed jobId, bytes32 reason);
    event JobRefunded(uint256 indexed jobId);

    function createJob(
        address provider,
        address evaluator,
        uint256 expiredAt,
        string calldata description,
        address hook
    ) external returns (uint256 jobId);

    function fund(uint256 jobId, uint256 expectedBudget) external;
    function submit(uint256 jobId, bytes32 deliverable) external;
    function complete(uint256 jobId, bytes32 reason) external;
    function reject(uint256 jobId, bytes32 reason) external;
    function claimRefund(uint256 jobId) external;
    function getJob(uint256 jobId) external view returns (Job memory);
    function jobCount() external view returns (uint256);
}
