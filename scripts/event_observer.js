const hre = require("hardhat");

async function main() {
    console.log("--------------------------------------------------");
    console.log("👀 Event Observer (Observer Pattern)");
    console.log("--------------------------------------------------");

    const [owner, other] = await hre.ethers.getSigners();

    // 1. Deploy Logic (Setup)
    console.log("Deploying contracts...");
    const GovernanceToken = await hre.ethers.getContractFactory("GovernanceToken");
    const token = await GovernanceToken.deploy(hre.ethers.parseEther("1000"));
    await token.waitForDeployment();

    const VotingEngine = await hre.ethers.getContractFactory("VotingEngine");
    const engine = await VotingEngine.deploy(await token.getAddress());
    await engine.waitForDeployment();

    const Treasury = await hre.ethers.getContractFactory("Treasury");
    const treasury = await Treasury.deploy(await engine.getAddress());
    await treasury.waitForDeployment();

    // Link Treasury
    await engine.setTreasury(await treasury.getAddress());

    console.log(`VotingEngine deployed at: ${await engine.getAddress()}`);

    // 2. SETUP OBSERVER (LISTENER)
    console.log("\n🎧 Setting up Event Listener for 'ProposalCreated'...");

    // This is the Observer Pattern in action: Script is observing the Contract
    engine.on("ProposalCreated", (id, proposer, desc, deadline) => {
        console.log("\n🔔 EVENT RECEIVED: ProposalCreated");
        console.log(`   - ID: ${id}`);
        console.log(`   - Proposer: ${proposer}`);
        console.log(`   - Description: "${desc}"`);
        console.log(`   - Deadline: ${new Date(Number(deadline) * 1000).toLocaleString()}`);
        console.log("--------------------------------------------------");
    });

    console.log("✅ Listener active. Waiting for events...");

    // 3. TRIGGER EVENT (SUBJECT)
    console.log("\n🚀 Triggering event by creating a proposal...");
    // Need tokens to propose
    // Owner has 1000 tokens (threshold is 100)
    // Fee is 0.01 ETH

    const tx = await engine.createProposal("Observer Test Proposal", {
        value: hre.ethers.parseEther("0.01")
    });

    console.log(`Transaction sent: ${tx.hash}`);
    await tx.wait(); // Wait for block confirmation

    // Give a moment for the event to be picked up by the listener
    // (Localhost is fast, but let's be safe)
    await new Promise(r => setTimeout(r, 2000));

    console.log("\n✅ Script Complete. (Press Ctrl+C if script stays open due to listener)");
    process.exit(0);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
