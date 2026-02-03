// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Treasury {
    address public votingEngine;

    modifier onlyEngine() {
        require(msg.sender == votingEngine, "Only Engine");
        _;
    }

    constructor(address _votingEngine) {
        votingEngine = _votingEngine;
    }

    // Allow receiving ETH (from proposal fees or donations)
    receive() external payable {}

    // Function called by VotingEngine to spend money
    function releaseFunds(address target, uint256 amount) external onlyEngine {
        require(address(this).balance >= amount, "Insufficient funds");
        (bool success, ) = target.call{value: amount}("");
        require(success, "Transfer failed");
    }

    // Helper to check balance
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
