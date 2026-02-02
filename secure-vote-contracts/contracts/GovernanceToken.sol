// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GovernanceToken is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("SecureVote Token", "SVT") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    // Function to mint more tokens (only owner/admin)
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
