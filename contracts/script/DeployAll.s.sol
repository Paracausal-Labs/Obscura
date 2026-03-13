// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {AgentJobs} from "../src/AgentJobs.sol";
import {MockUSDC} from "../test/mocks/MockUSDC.sol";

contract DeployAll is Script {
    function run() external {
        vm.startBroadcast();

        MockUSDC usdc = new MockUSDC();
        console2.log("MockUSDC deployed at:", address(usdc));

        AgentJobs jobs = new AgentJobs(address(usdc));
        console2.log("AgentJobs deployed at:", address(jobs));

        // Mint 10,000 USDC to deployer for testing
        usdc.mint(msg.sender, 10_000e6);
        console2.log("Minted 10,000 USDC to deployer:", msg.sender);

        vm.stopBroadcast();
    }
}
