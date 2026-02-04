// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GovernanceToken is ERC20 {
    uint256 public constant TOKENS_PER_ETH = 100;

    constructor(uint256 initialSupply) ERC20("GovernanceToken", "GT") {
        _mint(msg.sender, initialSupply);
    }

    function buyTokens() external payable {
        require(msg.value > 0, "Send ETH to buy tokens");
        uint256 amountToBuy = msg.value * TOKENS_PER_ETH;
        _mint(msg.sender, amountToBuy);
    }
}
