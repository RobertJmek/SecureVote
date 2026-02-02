// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IVoterRegistry.sol";

contract VoterRegistry is IVoterRegistry, Ownable {
    
    mapping(address => bool) public whitelist;

    event VoterAdded(address indexed voter);
    event VoterRemoved(address indexed voter);

    constructor() Ownable(msg.sender) {}

    modifier onlyWhitelisted(address voter) {
        require(whitelist[voter], "Address is not whitelisted");
        _;
    }

    function addVoter(address voter) external onlyOwner {
        require(!whitelist[voter], "Voter already whitelisted");
        whitelist[voter] = true;
        emit VoterAdded(voter);
    }

    function removeVoter(address voter) external onlyOwner {
        require(whitelist[voter], "Voter not in whitelist");
        whitelist[voter] = false;
        emit VoterRemoved(voter);
    }

    function isWhitelisted(address voter) external view override returns (bool) {
        return whitelist[voter];
    }
}
