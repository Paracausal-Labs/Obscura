// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {AgentJobs} from "../src/AgentJobs.sol";

contract DeployAgentJobs is Script {
    function run() external {
        address usdc = vm.envAddress("USDC_ADDRESS");
        vm.startBroadcast();
        new AgentJobs(usdc);
        vm.stopBroadcast();
    }
}
