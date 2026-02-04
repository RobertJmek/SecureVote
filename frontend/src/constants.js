// Supported chains for cross-chain proposal aggregation
export const SUPPORTED_CHAINS = [
    {
        chainId: 11155111,
        name: "Sepolia",
        currency: "SepoliaETH",
        rpc: "https://ethereum-sepolia-rpc.publicnode.com",
        contracts: {
            GOVERNANCE_TOKEN: "0x37aC0957BD839a44C5aaaCC1b41412453FCd7194", // New deployment
            VOTING_ENGINE: "0xAE82Cf66C395e0686CF0646963824e4AD9D763a7",
            TREASURY: "0xe2262669Fe2255De07f3c8081D88479bFEb0fFDB",
            FAUCET: "0xB43C50C03F367Eb8ce1DD53D484c159e2BA6ed82"
        },
        color: "#3B82F6" // Blue
    },
    {
        chainId: 80002,
        name: "Polygon Amoy",
        currency: "POL",
        rpc: "https://rpc-amoy.polygon.technology",
        contracts: {
            GOVERNANCE_TOKEN: "0xba3Bf2C37fdDac97e770d08b450D39B565C2Fa2f",
            VOTING_ENGINE: "0x2E6C7056096Df97021Cb8149Ab834a4f314F02BC",
            TREASURY: "0x27A419deD33657F721febcD00eD8213c7451F190",
            FAUCET: "0xe2262669Fe2255De07f3c8081D88479bFEb0fFDB" // TODO: Update after deployment
        },
        color: "#8B5CF6" // Purple
    }
];

export const NETWORKS = {
    // Hardhat Local
    31337: {
        name: "Hardhat Local",
        currency: "ETH",
        contracts: {
            GOVERNANCE_TOKEN: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
            VOTING_ENGINE: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
            TREASURY: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
        }
    },
    // Polygon Amoy
    80002: {
        name: "Polygon Amoy",
        currency: "POL",
        contracts: {
            GOVERNANCE_TOKEN: "0xba3Bf2C37fdDac97e770d08b450D39B565C2Fa2f",
            VOTING_ENGINE: "0x2E6C7056096Df97021Cb8149Ab834a4f314F02BC",
            TREASURY: "0x27A419deD33657F721febcD00eD8213c7451F190"
        }
    },
    // Sepolia
    11155111: {
        name: "Sepolia Testnet",
        currency: "SepoliaETH",
        contracts: {
            GOVERNANCE_TOKEN: "0x37aC0957BD839a44C5aaaCC1b41412453FCd7194",
            VOTING_ENGINE: "0xAE82Cf66C395e0686CF0646963824e4AD9D763a7",
            TREASURY: "0xe2262669Fe2255De07f3c8081D88479bFEb0fFDB"
        }
    }
};

export const TOKEN_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)"
];

export const VOTING_ABI = [
    "function createProposal(string description) payable returns (uint256)",
    "function vote(uint256 id, bool support)",
    "function executeProposal(uint256 id)",
    "function proposals(uint256) view returns (uint256 id, string description, uint256 deadline, uint256 yesVotes, uint256 noVotes, uint256 maxDeadline, bool executed)",
    "function proposalCount() view returns (uint256)",
    "function hasVoted(uint256, address) view returns (bool)",
    "function getProposalStatus(uint256) view returns (string)",
    "function CREATION_FEE() view returns (uint256)",
    "function MIN_GAS_EXECUTE() view returns (uint256)",
    "event ProposalCreated(uint256 indexed id, address indexed proposer, string description, uint256 deadline)",
    "event Voted(uint256 indexed id, address indexed voter, bool vote, uint256 weight)",
    "event ProposalExecuted(uint256 indexed id)"
];
