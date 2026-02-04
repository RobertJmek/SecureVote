// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title TokenFaucet
 * @notice Distributes governance tokens to users (one-time claim per address)
 * @dev Simple faucet for testnet token distribution
 */
contract TokenFaucet {
    IERC20 public immutable token;
    address public owner;
    uint256 public claimAmount;

    mapping(address => bool) public hasClaimed;

    event TokensClaimed(address indexed claimer, uint256 amount);
    event FaucetRefilled(address indexed refiller, uint256 amount);
    event ClaimAmountUpdated(uint256 newAmount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _token, uint256 _claimAmount) {
        require(_token != address(0), "Invalid token");
        require(_claimAmount > 0, "Invalid claim amount");

        token = IERC20(_token);
        owner = msg.sender;
        claimAmount = _claimAmount;
    }

    /**
     * @notice Claim free tokens (one-time per address)
     */
    function claim() external {
        require(!hasClaimed[msg.sender], "Already claimed");
        require(token.balanceOf(address(this)) >= claimAmount, "Faucet empty");

        hasClaimed[msg.sender] = true;
        require(token.transfer(msg.sender, claimAmount), "Transfer failed");

        emit TokensClaimed(msg.sender, claimAmount);
    }

    /**
     * @notice Check if address has already claimed
     */
    function hasUserClaimed(address user) external view returns (bool) {
        return hasClaimed[user];
    }

    /**
     * @notice Get faucet balance
     */
    function getFaucetBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    /**
     * @notice Owner can update claim amount
     */
    function setClaimAmount(uint256 newAmount) external onlyOwner {
        require(newAmount > 0, "Invalid amount");
        claimAmount = newAmount;
        emit ClaimAmountUpdated(newAmount);
    }

    /**
     * @notice Owner can refill faucet
     */
    function refill(uint256 amount) external onlyOwner {
        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        emit FaucetRefilled(msg.sender, amount);
    }

    /**
     * @notice Emergency withdraw (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(token.transfer(owner, balance), "Transfer failed");
    }
}
