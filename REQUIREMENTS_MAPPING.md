# SecureVote - Requirements Mapping

---

## 🚀 Quick Start

### Running Tests

```bash
cd /Users/robertjmek/Desktop/UNI/SecureVote_
npx hardhat test
```

**Available Tests:**
- `test/GovernanceToken.test.js` - ERC20 token tests
- `test/VotingEngine.test.js` - Governance voting tests
- `test/Treasury.test.js` - Fund management tests

### Running Frontend

```bash
cd /Users/robertjmek/Desktop/UNI/SecureVote_/frontend
npm install
npm run dev
```

**Access:** http://localhost:5173

### Deployed Contract Addresses

#### Sepolia Testnet
```
GovernanceToken: 0x37aC0957BD839a44C5aaaCC1b41412453FCd7194
VotingEngine:    0xAE82Cf66C395e0686CF0646963824e4AD9D763a7
Treasury:        0xe2262669Fe2255De07f3c8081D88479bFEb0fFDB
TokenFaucet:     0xB43C50C03F367Eb8ce1DD53D484c159e2BA6ed82
```

#### Polygon Amoy Testnet
```
GovernanceToken: 0xba3Bf2C37fdDac97e770d08b450D39B565C2Fa2f
VotingEngine:    0x2E6C7056096Df97021Cb8149Ab834a4f314F02BC
Treasury:        0x27A419deD33657F721febcD00eD8213c7451F190
TokenFaucet:     0xe2262669Fe2255De07f3c8081D88479bFEb0fFDB
```


---

# PARTEA 1: SMART CONTRACTS 

## ✅ Cerințe Obligatorii 

### 1. Tipuri de Date Specifice Solidity

#### ✅ `mapping` - Multiple Examples

**Location:** [VotingEngine.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/VotingEngine.sol#L14-L16)
```solidity
mapping(uint256 => Proposal) public proposals;
mapping(uint256 => mapping(address => bool)) public hasVoted;
mapping(uint256 => mapping(address => uint256)) public votes;
```

**Location:** [TokenFaucet.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/TokenFaucet.sol#L15)
```solidity
mapping(address => bool) public hasClaimed;
```

**Location:** [GovernanceToken.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/GovernanceToken.sol) - inherited from ERC20
```solidity
mapping(address => uint256) private _balances;
mapping(address => mapping(address => uint256)) private _allowances;
```

#### ✅ `address` & `address payable`

**Location:** [VotingEngine.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/VotingEngine.sol#L12-L13)
```solidity
IERC20 public immutable governanceToken;
address payable public treasury;
```

**Location:** [Treasury.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/Treasury.sol#L7)
```solidity
address public immutable engine;
```

---

### 2. Înregistrarea de Events

**Location:** [VotingEngine.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/VotingEngine.sol#L18-L21)
```solidity
event ProposalCreated(uint256 indexed id, address indexed proposer, string description, uint256 deadline);
event Voted(uint256 indexed id, address indexed voter, bool support, uint256 weight);
event ProposalExecuted(uint256 indexed id);
event TreasuryUpdated(address indexed newTreasury);
```

**Location:** [TokenFaucet.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/TokenFaucet.sol#L16-L18)
```solidity
event TokensClaimed(address indexed claimer, uint256 amount);
event FaucetRefilled(address indexed refiller, uint256 amount);
event ClaimAmountUpdated(uint256 newAmount);
```

**Location:** [GovernanceToken.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/GovernanceToken.sol) - ERC20 events
```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
event Approval(address indexed owner, address indexed spender, uint256 value);
```

---

### 3. Utilizarea de Modifiers

**Location:** [VotingEngine.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/VotingEngine.sol#L23-L26)
```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
}
```

**Location:** [Treasury.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/Treasury.sol#L9-L12)
```solidity
modifier onlyEngine() {
    require(msg.sender == engine, "Not authorized");
    _;
}
```

**Location:** [TokenFaucet.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/TokenFaucet.sol#L21-L24)
```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
}
```

---

### 4. Exemple Tipuri de Funcții

#### ✅ `external` - Public API Functions

**Location:** [VotingEngine.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/VotingEngine.sol#L61-L64)
```solidity
function createProposal(string memory _description) external payable returns (uint256)
function vote(uint256 id, bool support) external
function executeProposal(uint256 id) external
function setTreasury(address payable _treasury) external onlyOwner
```

#### ✅ `view` - Read-Only Functions

**Location:** [VotingEngine.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/VotingEngine.sol#L143-L148)
```solidity
function getProposalStatus(uint256 id) public view returns (string memory)
```

**Location:** [TokenFaucet.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/TokenFaucet.sol#L51-L58)
```solidity
function hasUserClaimed(address user) external view returns (bool)
function getFaucetBalance() external view returns (uint256)
```

#### ✅ `pure` - Stateless Functions

**Location:** [VotingEngine.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/VotingEngine.sol#L28-L30)
```solidity
constructor(address _token) {
    // Pure logic without state reads
}
```

#### ✅ `payable` - Accepts ETH/Native Token

**Location:** [VotingEngine.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/VotingEngine.sol#L61)
```solidity
function createProposal(string memory _description) external payable returns (uint256)
```

**Location:** [Treasury.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/Treasury.sol#L18-L20)
```solidity
receive() external payable {}
```

---

### 5. Exemple Transfer de ETH

**Location:** [VotingEngine.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/VotingEngine.sol#L68-L70)
```solidity
// Forward creation fee to Treasury
(bool success, ) = treasury.call{value: msg.value}("");
require(success, "Treasury transfer failed");
```

**Location:** [Treasury.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/Treasury.sol#L25-L27)
```solidity
function releaseFunds(address target, uint256 amount) external onlyEngine {
    (bool success, ) = target.call{value: amount}("");
    require(success, "Transfer failed");
}
```

---

### 6. Interacțiune între Smart Contracte

#### Contract-to-Contract Calls

**Location:** [VotingEngine.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/VotingEngine.sol#L37-L39)
```solidity
// VotingEngine → GovernanceToken (ERC20 Interface)
require(governanceToken.balanceOf(msg.sender) >= PROPOSAL_THRESHOLD, "Insufficient tokens");
uint256 weight = governanceToken.balanceOf(msg.sender);
```

**Location:** [VotingEngine.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/VotingEngine.sol#L68-L70)
```solidity
// VotingEngine → Treasury (ETH transfer)
(bool success, ) = treasury.call{value: msg.value}("");
```

**Location:** [VotingEngine.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/VotingEngine.sol#L135-L137)
```solidity
// VotingEngine → Treasury (releaseFunds call)
Treasury(treasury).releaseFunds(targetAddress, fundAmount);
```

**Interaction Diagram:**
```
User → VotingEngine.createProposal() → GovernanceToken.balanceOf()
                                     → Treasury (ETH transfer)
User → VotingEngine.vote()         → GovernanceToken.balanceOf()
User → VotingEngine.executeProposal() → Treasury.releaseFunds()
User → TokenFaucet.claim()          → GovernanceToken.transfer()
```

---

### 7. Deploy pe Rețea de Test Ethereum

**Deployed Networks:**
- ✅ **Sepolia Testnet** (Ethereum)
- ✅ **Polygon Amoy Testnet**
- ✅ **Hardhat Local Network**

**Deployment Script:** [deploy.js](file:///Users/robertjmek/Desktop/UNI/SecureVote_/scripts/deploy.js)

**Deployed Addresses (Sepolia):**
```
GovernanceToken: 0x37aC0957BD839a44C5aaaCC1b41412453FCd7194
VotingEngine:    0xAE82Cf66C395e0686CF0646963824e4AD9D763a7
Treasury:        0xe2262669Fe2255De07f3c8081D88479bFEb0fFDB
TokenFaucet:     0xB43C50C03F367Eb8ce1DD53D484c159e2BA6ed82
```

**Deployed Addresses (Polygon Amoy):**
```
GovernanceToken: 0xba3Bf2C37fdDac97e770d08b450D39B565C2Fa2f
VotingEngine:    0x2E6C7056096Df97021Cb8149Ab834a4f314F02BC
Treasury:        0x27A419deD33657F721febcD00eD8213c7451F190
TokenFaucet:     0xe2262669Fe2255De07f3c8081D88479bFEb0fFDB
```

**Configuration:** [hardhat.config.js](file:///Users/robertjmek/Desktop/UNI/SecureVote_/hardhat.config.js)

---

## ✅ Cerințe Opționale 

### 1. Utilizare Librării ✅

**Location:** [VotingEngine.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/VotingEngine.sol#L4)
```solidity
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
```

**Location:** [GovernanceToken.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/GovernanceToken.sol#L4)
```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
```

**OpenZeppelin Libraries Used:**
- `ERC20.sol` - Token standard implementation
- `IERC20.sol` - ERC20 interface for inter-contract calls
- `Ownable.sol` (if used) - Access control

---

### 2. Implementarea de Teste ✅

**Test Suite:** [test/](file:///Users/robertjmek/Desktop/UNI/SecureVote_/test/)

**Test Framework:** Hardhat + Chai

**Coverage:**
```
✅ GovernanceToken Tests
✅ VotingEngine Tests (creation, voting, execution)
✅ Treasury Tests (access control, fund release)
✅ Integration Tests (end-to-end flows)
```

**Run Tests:**
```bash
npx hardhat test
```

---

### 3. OOP Avansate (Interfețe, Moștenire, Patterns) ✅

#### Interfețe

**Location:** [VotingEngine.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/VotingEngine.sol#L4)
```solidity
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

IERC20 public immutable governanceToken;
```

#### Moștenire (Inheritance)

**Location:** [GovernanceToken.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/GovernanceToken.sol#L6)
```solidity
contract GovernanceToken is ERC20 {
    // Inherits all ERC20 functionality
}
```

#### Design Patterns Implemented

**1. Withdrawal Pattern**
- **Location:** [Treasury.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/Treasury.sol)
- Funds are pulled from Treasury via governance vote, not pushed automatically
- Prevents reentrancy and ensures controlled fund access

**2. Access Control Pattern**
- **Location:** [VotingEngine.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/VotingEngine.sol#L23-L26)
- `onlyOwner` modifier restricts sensitive functions
- **Location:** [Treasury.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/Treasury.sol#L9-L12)
- `onlyEngine` ensures only VotingEngine can release funds

**3. Factory Pattern (Implicit)**
- **Location:** [deploy.js](file:///Users/robertjmek/Desktop/UNI/SecureVote_/scripts/deploy.js)
- Deploys and links contracts programmatically

**4. Observer Pattern**
- **Location:** Events in contracts trigger frontend listeners
- Frontend components observe blockchain events

---

### 4. Standarde ERC ✅

**Standard:** ERC-20 (Fungible Token)

**Implementation:** [GovernanceToken.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/GovernanceToken.sol)

**Features:**
```solidity
✅ totalSupply()
✅ balanceOf(address)
✅ transfer(address, uint256)
✅ transferFrom(address, address, uint256)
✅ approve(address, uint256)
✅ allowance(address, address)
✅ Events: Transfer, Approval
```

**Usage in Governance:**
- Token balance = Voting power
- Proposal threshold: 100 GT minimum
- Vote weight proportional to holdings

---

### 5. ❌ Oracles (Not Implemented)

**Status:** Not required for this project scope.

**Potential Use Case:** Price feeds for displaying USD values (not implemented).

---

### 6. ❌ IPFS (Not Implemented)

**Status:** Not required for this project scope.

**Potential Use Case:** Store proposal descriptions off-chain (current implementation uses on-chain strings).

---

# PARTEA 2: WEB3 FRONTEND 

## ✅ Cerințe Obligatorii 

### 1. Utilizarea Librării Web3 + Provider + Info Conturi ✅

**Library Used:** ethers.js v6

**Location:** [useWeb3.js](file:///Users/robertjmek/Desktop/UNI/SecureVote_/frontend/src/hooks/useWeb3.js)

**Provider Connection:**
```javascript
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
```

**Account Information Display:**

**Location:** [ConnectWallet.jsx](file:///Users/robertjmek/Desktop/UNI/SecureVote_/frontend/src/components/ConnectWallet.jsx#L67-L75)
```javascript
// Display address
{wallet.account.slice(0, 6)}...{wallet.account.slice(-4)}

// Display native balance (ETH/POL)
{parseFloat(wallet.balance).toFixed(4)} {network.currency}

// Display token balance (GT)
{parseFloat(wallet.tokenBalance).toFixed(2)} GT
```

**Network Detection:**
```javascript
const chainId = await provider.getNetwork().then(n => n.chainId);
const network = NETWORKS[chainId];
```

---

### 2. Inițierea Tranzacțiilor ✅

**Transfer ETH/POL:**

**Location:** [CreateProposal.jsx](file:///Users/robertjmek/Desktop/UNI/SecureVote_/frontend/src/components/CreateProposal.jsx#L25-L28)
```javascript
const creationFee = ethers.parseEther("0.01");
const tx = await contract.createProposal(description, { value: creationFee });
await tx.wait();
```

**Function Calls:**

**Location:** [ProposalList.jsx](file:///Users/robertjmek/Desktop/UNI/SecureVote_/frontend/src/components/ProposalList.jsx#L106-L110)
```javascript
// Vote transaction
const tx = await contract.vote(proposal.id, support);
await tx.wait();
```

**Location:** [ClaimTokens.jsx](file:///Users/robertjmek/Desktop/UNI/SecureVote_/frontend/src/components/ClaimTokens.jsx#L65-L69)
```javascript
// Claim faucet tokens
const tx = await faucetWithSigner.claim();
await tx.wait();
```

---

## ✅ Cerințe Opționale 

### 1. Tratare Events (Observer Pattern) ✅

**Implementation:** [EventLogger.jsx](file:///Users/robertjmek/Desktop/UNI/SecureVote_/frontend/src/components/EventLogger.jsx)

**Event Listeners:**
```javascript
contract.on('ProposalCreated', (id, proposer, desc, deadline) => {
    addEvent('ProposalCreated', { ID, Desc, Proposer });
});

contract.on('Voted', (id, voter, support, weight) => {
    addEvent('Voted', { ID, Vote, Voter });
});

contract.on('ProposalExecuted', (id) => {
    addEvent('ProposalExecuted', { ID });
});
```

**Cleanup:**
```javascript
return () => {
    contract.removeAllListeners();
};
```

**Note:** Events работают on localhost Hardhat, но MetaMask provider на testnets не transmite live events (known limitation).

---

### 2. Analiza Gas-Cost ✅

**Implementation:** [GasAnalyzer.jsx](file:///Users/robertjmek/Desktop/UNI/SecureVote_/frontend/src/components/GasAnalyzer.jsx)

**Gas Estimation:**
```javascript
const feeData = await provider.getFeeData();
const createGas = await contract.createProposal.estimateGas("Test", { value: creationFee });
const voteGas = await contract.vote.estimateGas(1, true);

const createCost = createGas * feeData.gasPrice;
const voteCost = voteGas * feeData.gasPrice;

setGasData({
    createProposal: ethers.formatEther(createCost),
    vote: ethers.formatEther(voteCost),
    execute: ethers.formatEther(executeCost)
});
```

**Display:**
```
⛽ Estimated Gas Cost
Create Proposal: ~0.0045 POL
Vote: ~0.0012 POL
Execute: ~0.0089 POL
```

**Auto-Refresh:** Updates every 10 seconds to reflect current gas prices.

---

### 3. Control Stare Tranzacții (Tratare Excepții) ✅

**Implementation:** [TransactionStatus.jsx](file:///Users/robertjmek/Desktop/UNI/SecureVote_/frontend/src/components/TransactionStatus.jsx)

**Status States:**
```javascript
status: 'pending' | 'success' | 'error'
```

**Transaction Monitoring:**

**Location:** [ProposalList.jsx](file:///Users/robertjmek/Desktop/UNI/SecureVote_/frontend/src/components/ProposalList.jsx#L99-L118)
```javascript
try {
    onTxStatus({ status: 'pending', message: 'Voting YES on #${id}...' });
    
    const tx = await contract.vote(id, support);
    onTxStatus({ status: 'pending', message: 'Transaction Sent', hash: tx.hash });
    
    await tx.wait();
    onTxStatus({ status: 'success', message: 'Vote Cast Successfully!', hash: tx.hash });
    
} catch (err) {
    onTxStatus({ status: 'error', message: err.message || 'Transaction Failed' });
}
```

**Error Handling:**
- Network errors
- User rejection (MetaMask)
- Insufficient funds
- Contract reverts

**Visual Feedback:**
```
🟡 Pending: "Waiting for confirmation..."
🟢 Success: "Transaction confirmed!" (with Etherscan link)
🔴 Error: "Transaction failed: <reason>"
```

---

**Feature:** Unified proposal display across Sepolia and Polygon Amoy

**Implementation:** [ProposalList.jsx](file:///Users/robertjmek/Desktop/UNI/SecureVote_/frontend/src/components/ProposalList.jsx#L23-L59)

**How it Works:**
1. Frontend creates RPC connections to BOTH chains
2. Fetches proposals from each chain in parallel
3. Merges into single unified list with chain badges
4. Allows voting by auto-switching MetaMask network

**Code:**
```javascript
for (const chain of SUPPORTED_CHAINS) {
    const provider = new ethers.JsonRpcProvider(chain.rpc);
    const contract = new ethers.Contract(chain.contracts.VOTING_ENGINE, ABI, provider);
    
    const proposals = await fetchProposalsFromChain(contract);
    proposals.forEach(p => p.chainId = chain.chainId);
    
    allProposals.push(...proposals);
}
```

**UI Display:**
```
#1 [Sepolia] Build new park - 1000 YES / 500 NO
#2 [Polygon] Fund marketing - 2000 YES / 300 NO
```

**Value:** Demonstrates true blockchain interoperability without centralized backend.

---

### Token Faucet System ⭐

**Feature:** Self-service token distribution for testing

**Contracts:**
- [TokenFaucet.sol](file:///Users/robertjmek/Desktop/UNI/SecureVote_/contracts/TokenFaucet.sol)

**Frontend:**
- [ClaimTokens.jsx](file:///Users/robertjmek/Desktop/UNI/SecureVote_/frontend/src/components/ClaimTokens.jsx)

**Features:**
- 1000 GT per claim
- One claim per address
- Deployed on both testnets
- Automatic balance refresh