/// SPDX-License-Identifier: MIT

// Contract for voting on proposals. People that HOLD tokens can vote on proposals and their voting power is proportional to the number of tokens they hold.
// The contract will be deployed by the owner of the token.
// The contract will hold the tokens and will send them to the target address if the proposal is executed.
// The contract will also have a timelock mechanism to prevent malicious proposals from being executed immediately.

pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./VotingMath.sol";

contract VotingEngine {
    IERC20 public governanceToken;
    address public owner;
    address payable public treasury; // Reference to Treasury contract

    using VotingMath for uint256; // Library usage

    uint256 public constant MIN_VOTING_PERIOD = 3 days;
    uint256 public constant MAX_VOTING_PERIOD = 7 days;
    uint256 public constant MIN_QUORUM = 1000000 * 10 ** 18;
    uint256 public constant PROPOSAL_THRESHOLD = 100 * 10 ** 18;
    uint256 public constant CREATION_FEE = 0.01 ether; // Fee to create proposal
    uint256 public constant MIN_GAS_EXECUTE = 50000; // Minimum gas required for execution

    struct Proposal {
        uint256 id;
        string description;
        uint256 deadline;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 maxDeadline; // Absolute limit for extensions
        bool executed;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    uint256 public proposalCount;

    event ProposalCreated(
        uint256 indexed id,
        address indexed proposer,
        string description,
        uint256 deadline
    );
    event Voted(
        uint256 indexed id,
        address indexed voter,
        bool vote, // true or false
        uint256 weight
    );
    event ProposalExecuted(uint256 indexed id);
    event DeadlineExtended(uint256 indexed id, uint256 newDeadline);

    constructor(address _governanceToken) {
        governanceToken = IERC20(_governanceToken);
        owner = msg.sender;
    }

    function setTreasury(address payable _treasury) external onlyOwner {
        treasury = _treasury;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier activeProposal(uint256 id) {
        require(id > 0 && id <= proposalCount, "Invalid proposal");
        require(block.timestamp < proposals[id].deadline, "Proposal ended");
        require(!proposals[id].executed, "Already executed");
        _;
    }

    function createProposal(
        string memory _description
    ) external payable returns (uint256) {
        require(msg.value >= CREATION_FEE, "Fee required");
        require(
            governanceToken.balanceOf(msg.sender) >= PROPOSAL_THRESHOLD,
            "Insufficient tokens"
        );
        require(bytes(_description).length > 0, "Description required");

        // Forward fee to Treasury
        (bool success, ) = treasury.call{value: msg.value}("");
        require(success, "Treasury transfer failed");

        proposalCount++;

        Proposal storage newProposal = proposals[proposalCount];
        newProposal.id = proposalCount;
        newProposal.description = _description;
        newProposal.deadline = block.timestamp + MIN_VOTING_PERIOD;
        newProposal.maxDeadline = block.timestamp + MAX_VOTING_PERIOD;
        newProposal.executed = false;

        emit ProposalCreated(
            proposalCount,
            msg.sender,
            _description,
            newProposal.deadline
        );

        return proposalCount;
    }

    function vote(uint256 id, bool support) external activeProposal(id) {
        uint256 voterBalance = governanceToken.balanceOf(msg.sender);
        require(voterBalance > 0, "No tokens");
        require(!hasVoted[id][msg.sender], "Already voted");

        hasVoted[id][msg.sender] = true;

        if (support) {
            proposals[id].yesVotes += voterBalance;
        } else {
            proposals[id].noVotes += voterBalance;
        }

        emit Voted(id, msg.sender, support, voterBalance);

        _checkExtension(id);
    }

    function _checkExtension(uint256 id) private {
        Proposal storage p = proposals[id];
        uint256 totalVotes = p.yesVotes + p.noVotes;

        if (totalVotes < MIN_QUORUM && p.deadline < p.maxDeadline) {
            // If less than 24h remaining and no quorum, extend
            if (p.deadline - block.timestamp < 12 hours) {
                p.deadline += 12 hours;
                // Cap at maxDeadline if we exceeded it (though strict check above helps)
                if (p.deadline > p.maxDeadline) {
                    p.deadline = p.maxDeadline;
                }
                emit DeadlineExtended(id, p.deadline);
            }
        }
    }
    function executeProposal(uint256 id) external {
        // Gas limit check
        require(gasleft() >= MIN_GAS_EXECUTE, "Insufficient gas");

        require(id > 0 && id <= proposalCount, "Invalid proposal");
        Proposal storage p = proposals[id];
        require(block.timestamp >= p.deadline, "Voting active");
        require(!p.executed, "Already executed");
        require(p.yesVotes > p.noVotes, "Vote failed");
        require(p.yesVotes + p.noVotes >= MIN_QUORUM, "Quorum not met");

        p.executed = true;

        emit ProposalExecuted(id);
    }

    // VIEW: Reads state but doesn't modify it
    function getProposalStatus(uint256 id) public view returns (string memory) {
        if (proposals[id].executed) return "Executed";
        if (block.timestamp >= proposals[id].deadline) return "Ended";
        return "Active";
    }

    // PURE: Does not read or modify state (Calculation only)

    // PURE: Does not read or modify state (Calculation only)
    function calculateVotePercentage(
        uint256 votes,
        uint256 total
    ) external pure returns (uint256) {
        return votes.calculatePercentage(total);
    }
}
