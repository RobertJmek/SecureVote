// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IVoterRegistry {
    function isWhitelisted(address voter) external view returns (bool);
}
