const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying TokenFaucet to", hre.network.name);
    console.log("--------------------------------------------------");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer:", deployer.address);

    // Use existing token address on Sepolia (from previous deploy)
    const sepoliaTokenAddr = "0x37aC0957BD839a44C5aaaCC1b41412453FCd7194";
    const polygonTokenAddr = "0xba3Bf2C37fdDac97e770d08b450D39B565C2Fa2f";

    const tokenAddr = hre.network.name === "sepolia" ? sepoliaTokenAddr : polygonTokenAddr;

    console.log("\nUsing GovernanceToken:", tokenAddr);

    // Deploy TokenFaucet
    console.log("\n📜 Deploying TokenFaucet...");
    const TokenFaucet = await hre.ethers.getContractFactory("TokenFaucet");
    const faucet = await TokenFaucet.deploy(
        tokenAddr,
        hre.ethers.parseEther("1000") // 1000 GT per claim
    );
    await faucet.waitForDeployment();
    const faucetAddr = await faucet.getAddress();
    console.log("✅ TokenFaucet:", faucetAddr);

    // Fund Faucet
    console.log("\n💰 Funding Faucet with 100,000 GT...");
    const token = await hre.ethers.getContractAt("GovernanceToken", tokenAddr);
    const fundAmount = hre.ethers.parseEther("100000");
    const tx = await token.transfer(faucetAddr, fundAmount);
    await tx.wait();
    console.log("✅ Faucet funded! Balance:", hre.ethers.formatEther(await token.balanceOf(faucetAddr)), "GT");

    console.log("\n--------------------------------------------------");
    console.log("🎉 TokenFaucet Deployment Complete!");
    console.log("--------------------------------------------------");
    console.log("TokenFaucet:", faucetAddr);
    console.log("--------------------------------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
