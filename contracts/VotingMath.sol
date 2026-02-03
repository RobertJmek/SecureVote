// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

library VotingMath {
    // Calculates percentage (basis points: 10000 = 100%)
    function calculatePercentage(
        uint256 part,
        uint256 total
    ) internal pure returns (uint256) {
        if (total == 0) return 0;
        return (part * 10000) / total;
    }

    // Checks if quorum is met
    function meetsQuorum(
        uint256 votes,
        uint256 /* supply */,
        uint256 quorumThreshold
    ) internal pure returns (bool) {
        // Logic simplified for direct amount comparison
        return votes >= quorumThreshold;
    }
}
