// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {AgentJobs} from "../src/AgentJobs.sol";
import {IAgentJobs} from "../src/interfaces/IAgentJobs.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

contract AgentJobsTest is Test {
    AgentJobs internal jobs;
    MockUSDC internal usdc;

    address internal client = makeAddr("client");
    address internal provider = makeAddr("provider");
    address internal evaluator = makeAddr("evaluator");

    uint256 internal constant BUDGET = 100e6; // 100 USDC (6 decimals)
    uint256 internal constant EXPIRY_DELTA = 7 days;

    function setUp() public {
        usdc = new MockUSDC();
        jobs = new AgentJobs(address(usdc));

        usdc.mint(client, BUDGET * 10);

        vm.prank(client);
        usdc.approve(address(jobs), type(uint256).max);
    }

    // ---------------------------------------------------------------
    // Full lifecycle: create -> fund -> submit -> complete
    // ---------------------------------------------------------------

    function test_fullLifecycle_complete() public {
        uint256 jobId = _createDefaultJob();

        // Fund
        vm.prank(client);
        jobs.fund(jobId, BUDGET);

        IAgentJobs.Job memory job = jobs.getJob(jobId);
        assertEq(uint8(job.status), uint8(IAgentJobs.Status.Funded));
        assertEq(usdc.balanceOf(address(jobs)), BUDGET);

        // Submit
        bytes32 deliverable = keccak256("ipfs://Qm...");
        vm.prank(provider);
        jobs.submit(jobId, deliverable);

        job = jobs.getJob(jobId);
        assertEq(uint8(job.status), uint8(IAgentJobs.Status.Submitted));
        assertEq(job.deliverable, deliverable);

        // Complete
        bytes32 reason = keccak256("good work");
        vm.prank(evaluator);
        jobs.complete(jobId, reason);

        job = jobs.getJob(jobId);
        assertEq(uint8(job.status), uint8(IAgentJobs.Status.Completed));
        assertEq(usdc.balanceOf(provider), BUDGET);
        assertEq(usdc.balanceOf(address(jobs)), 0);
    }

    // ---------------------------------------------------------------
    // Reject flow: create -> fund -> submit -> reject
    // ---------------------------------------------------------------

    function test_rejectFlow() public {
        uint256 jobId = _createDefaultJob();

        vm.prank(client);
        jobs.fund(jobId, BUDGET);

        vm.prank(provider);
        jobs.submit(jobId, keccak256("deliverable"));

        uint256 clientBalBefore = usdc.balanceOf(client);

        bytes32 reason = keccak256("insufficient quality");
        vm.prank(evaluator);
        jobs.reject(jobId, reason);

        IAgentJobs.Job memory job = jobs.getJob(jobId);
        assertEq(uint8(job.status), uint8(IAgentJobs.Status.Rejected));
        assertEq(usdc.balanceOf(client), clientBalBefore + BUDGET);
        assertEq(usdc.balanceOf(address(jobs)), 0);
    }

    // ---------------------------------------------------------------
    // Expiry refund: create -> fund -> warp past expiry -> claimRefund
    // ---------------------------------------------------------------

    function test_expiryRefund_fromFunded() public {
        uint256 jobId = _createDefaultJob();

        vm.prank(client);
        jobs.fund(jobId, BUDGET);

        uint256 clientBalBefore = usdc.balanceOf(client);

        // Warp past expiry
        vm.warp(block.timestamp + EXPIRY_DELTA + 1);

        vm.prank(client);
        jobs.claimRefund(jobId);

        IAgentJobs.Job memory job = jobs.getJob(jobId);
        assertEq(uint8(job.status), uint8(IAgentJobs.Status.Expired));
        assertEq(usdc.balanceOf(client), clientBalBefore + BUDGET);
    }

    function test_expiryRefund_fromSubmitted() public {
        uint256 jobId = _createDefaultJob();

        vm.prank(client);
        jobs.fund(jobId, BUDGET);

        vm.prank(provider);
        jobs.submit(jobId, keccak256("deliverable"));

        uint256 clientBalBefore = usdc.balanceOf(client);

        vm.warp(block.timestamp + EXPIRY_DELTA + 1);

        vm.prank(client);
        jobs.claimRefund(jobId);

        IAgentJobs.Job memory job = jobs.getJob(jobId);
        assertEq(uint8(job.status), uint8(IAgentJobs.Status.Expired));
        assertEq(usdc.balanceOf(client), clientBalBefore + BUDGET);
    }

    // ---------------------------------------------------------------
    // Access control checks
    // ---------------------------------------------------------------

    function test_revert_submitByNonProvider() public {
        uint256 jobId = _createDefaultJob();

        vm.prank(client);
        jobs.fund(jobId, BUDGET);

        vm.prank(client);
        vm.expectRevert(AgentJobs.OnlyProvider.selector);
        jobs.submit(jobId, keccak256("deliverable"));
    }

    function test_revert_completeByNonEvaluator() public {
        uint256 jobId = _createDefaultJob();

        vm.prank(client);
        jobs.fund(jobId, BUDGET);

        vm.prank(provider);
        jobs.submit(jobId, keccak256("deliverable"));

        vm.prank(client);
        vm.expectRevert(AgentJobs.OnlyEvaluator.selector);
        jobs.complete(jobId, keccak256("reason"));
    }

    function test_revert_refundBeforeExpiry() public {
        uint256 jobId = _createDefaultJob();

        vm.prank(client);
        jobs.fund(jobId, BUDGET);

        vm.prank(client);
        vm.expectRevert(AgentJobs.NotExpired.selector);
        jobs.claimRefund(jobId);
    }

    function test_revert_fundZeroBudget() public {
        uint256 jobId = _createDefaultJob();

        vm.prank(client);
        vm.expectRevert(AgentJobs.ZeroBudget.selector);
        jobs.fund(jobId, 0);
    }

    function test_jobCount() public {
        assertEq(jobs.jobCount(), 0);
        _createDefaultJob();
        assertEq(jobs.jobCount(), 1);
        _createDefaultJob();
        assertEq(jobs.jobCount(), 2);
    }

    // ---------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------

    function _createDefaultJob() internal returns (uint256) {
        vm.prank(client);
        return jobs.createJob(
            provider,
            evaluator,
            block.timestamp + EXPIRY_DELTA,
            "Analyze DeFi yield strategies",
            address(0) // hook ignored for MVP
        );
    }
}
