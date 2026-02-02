import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // 1. Deploy GovernanceToken
    const initialSupply = 1000000;
    const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    const token = await GovernanceToken.deploy(initialSupply);
    await token.waitForDeployment();
    console.log("GovernanceToken deployed to:", await token.getAddress());

    // 2. Deploy VoterRegistry
    const VoterRegistry = await ethers.getContractFactory("VoterRegistry");
    const registry = await VoterRegistry.deploy();
    await registry.waitForDeployment();
    console.log("VoterRegistry deployed to:", await registry.getAddress());

    // 3. Deploy VotingEngine
    const VotingEngine = await ethers.getContractFactory("VotingEngine");
    const votingEngine = await VotingEngine.deploy(await registry.getAddress());
    await votingEngine.waitForDeployment();
    console.log("VotingEngine deployed to:", await votingEngine.getAddress());

    // Whitelist deployer for testing convenience
    await registry.addVoter(deployer.address);
    console.log("Admin added to whitelist");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
