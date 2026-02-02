// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IVoterRegistry.sol";

contract VotingEngine is Ownable {
    
    struct Proposal {
        uint id;
        string description;
        uint voteCount;
        address creator;
        bool active;
    }

    IVoterRegistry public voterRegistry;
    uint256 public proposalCount;
    uint256 public creationFee = 0.001 ether;

    mapping(uint => Proposal) public proposals;
    mapping(address => mapping(uint => bool)) public hasVoted;

    event ProposalCreated(uint indexed id, string description, address indexed creator);
    event Voted(address indexed voter, uint indexed proposalId);
    event FeeUpdated(uint256 newFee);

    modifier onlyWhitelisted() {
        require(voterRegistry.isWhitelisted(msg.sender), "User not whitelisted");
        _;
    }

    modifier notVoted(uint proposalId) {
        require(!hasVoted[msg.sender][proposalId], "User already voted on this proposal");
        _;
    }

    constructor(address _voterRegistryAddress) Ownable(msg.sender) {
        voterRegistry = IVoterRegistry(_voterRegistryAddress);
    }

    function setCreationFee(uint256 _fee) external onlyOwner {
        creationFee = _fee;
        emit FeeUpdated(_fee);
    }

    // Payable function to create a proposal
    function createProposal(string memory _description) external payable onlyWhitelisted {
        require(msg.value >= creationFee, "Insufficient fee");

        proposalCount++;
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            description: _description,
            voteCount: 0,
            creator: msg.sender,
            active: true
        });

        emit ProposalCreated(proposalCount, _description, msg.sender);
    }

    function vote(uint _proposalId) external onlyWhitelisted notVoted(_proposalId) {
        require(proposals[_proposalId].active, "Proposal is not active");
        
        proposals[_proposalId].voteCount++;
        hasVoted[msg.sender][_proposalId] = true;

        emit Voted(msg.sender, _proposalId);
    }

    function getProposal(uint _proposalId) external view returns (Proposal memory) {
        return proposals[_proposalId];
    }

    function toggleProposal(uint _proposalId) external onlyOwner {
        proposals[_proposalId].active = !proposals[_proposalId].active;
    }

    function withdrawFees() external onlyOwner {
        (bool sent, ) = owner().call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");
    }
}
