const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying SecureVote to", hre.network.name);
    console.log("--------------------------------------------------");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Balance:", hre.ethers.formatEther(balance), "ETH/NEON");

    // 1. Deploy GovernanceToken
    console.log("\n📜 Deploying GovernanceToken...");
    const GovernanceToken = await hre.ethers.getContractFactory("GovernanceToken");
    const token = await GovernanceToken.deploy(hre.ethers.parseEther("1000000")); // 1M tokens
    await token.waitForDeployment();
    const tokenAddr = await token.getAddress();
    console.log("✅ GovernanceToken:", tokenAddr);

    // 2. Deploy VotingEngine
    console.log("\n📜 Deploying VotingEngine...");
    const VotingEngine = await hre.ethers.getContractFactory("VotingEngine");
    const engine = await VotingEngine.deploy(tokenAddr);
    await engine.waitForDeployment();
    const engineAddr = await engine.getAddress();
    console.log("✅ VotingEngine:", engineAddr);

    // 3. Deploy Treasury
    console.log("\n📜 Deploying Treasury...");
    const Treasury = await hre.ethers.getContractFactory("Treasury");
    const treasury = await Treasury.deploy(engineAddr);
    await treasury.waitForDeployment();
    const treasuryAddr = await treasury.getAddress();
    console.log("✅ Treasury:", treasuryAddr);

    // 4. Link Treasury to Engine
    console.log("\n🔗 Linking Treasury to VotingEngine...");
    await engine.setTreasury(treasuryAddr);
    console.log("✅ Treasury linked!");

    // Summary
    console.log("\n--------------------------------------------------");
    console.log("🎉 Deployment Complete!");
    console.log("--------------------------------------------------");
    console.log("GovernanceToken:", tokenAddr);
    console.log("VotingEngine:   ", engineAddr);
    console.log("Treasury:       ", treasuryAddr);
    console.log("--------------------------------------------------");
    console.log(`Network: ${hre.network.name} (Chain ID: ${hre.network.config.chainId || 'local'})`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
