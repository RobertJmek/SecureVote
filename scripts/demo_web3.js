const hre = require("hardhat");

async function main() {
    // 1. Get the Web3 Provider (Ethers.js provider wrapped by Hardhat)
    const provider = hre.ethers.provider;

    console.log("--------------------------------------------------");
    console.log("📡 Connected to Web3 Provider");
    console.log("--------------------------------------------------");

    // 2. Network Info
    const network = await provider.getNetwork();
    console.log(`🌐 Network Name: ${network.name}`);
    console.log(`🆔 Chain ID:     ${network.chainId}`);

    console.log("\n--------------------------------------------------");
    console.log("👤 Accounts & Balances");
    console.log("--------------------------------------------------");

    // 3. Get Signers (Accounts)
    const signers = await hre.ethers.getSigners();

    // 4. Loop through first 3 accounts and print info
    for (const signer of signers.slice(0, 3)) {
        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);

        // Convert BigInt Wei to Ether String
        const balanceEth = hre.ethers.formatEther(balance);

        console.log(`Address: ${address}`);
        console.log(`Balance: ${balanceEth} ETH`);
        console.log("---");
    }

    // 5. Initiate a Transaction (ETH Transfer)
    console.log("\n--------------------------------------------------");
    console.log("💸 Initiating ETH Transfer (Transaction)");
    console.log("--------------------------------------------------");

    const sender = signers[0];
    const receiver = signers[1];
    const amountToSend = hre.ethers.parseEther("1.0");

    console.log(`Sending 1 ETH from ${sender.address} to ${receiver.address}...`);

    const tx = await sender.sendTransaction({
        to: receiver.address,
        value: amountToSend
    });

    console.log(`Transaction Hash: ${tx.hash}`);
    await tx.wait(); // Wait for confirmation
    console.log("✅ Transfer confirmed!");

    // Verify new balance
    const newBalance = await provider.getBalance(receiver.address);
    console.log(`Receiver New Balance: ${hre.ethers.formatEther(newBalance)} ETH`);

    // 6. Contract Function Call (Deploy Token & Mint/Transfer)
    console.log("\n--------------------------------------------------");
    console.log("📜 Contract Interaction (Function Calls)");
    console.log("--------------------------------------------------");

    // Deploy Token for demo
    const GovernanceToken = await hre.ethers.getContractFactory("GovernanceToken");
    const token = await GovernanceToken.deploy(hre.ethers.parseEther("1000")); // Mint 1000 to deployer
    await token.waitForDeployment();
    const tokenAddr = await token.getAddress();
    console.log(`GovernanceToken Deployed at: ${tokenAddr}`);

    // Call "transfer" function
    console.log("Calling 'transfer' function on Token Contract...");
    const transferTx = await token.transfer(receiver.address, hre.ethers.parseEther("50"));
    await transferTx.wait();
    console.log("✅ Tokens Transferred!");

    // Call "balanceOf" (View Function)
    const tokenBalance = await token.balanceOf(receiver.address);
    console.log(`Receiver Token Balance: ${hre.ethers.formatEther(tokenBalance)} GT`);

    // 7. Gas Estimation (Cost Analysis)
    console.log("\n--------------------------------------------------");
    console.log("⛽ Gas Cost Analysis");
    console.log("--------------------------------------------------");

    // Estimate gas for a transfer
    const estimatedGas = await token.transfer.estimateGas(
        receiver.address,
        hre.ethers.parseEther("10")
    );
    console.log(`Estimated Gas for transfer: ${estimatedGas} units`);

    // Get current gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;
    console.log(`Current Gas Price: ${hre.ethers.formatUnits(gasPrice, "gwei")} Gwei`);

    // Calculate total cost
    const totalCost = estimatedGas * gasPrice;
    console.log(`Estimated Total Cost: ${hre.ethers.formatEther(totalCost)} ETH`);

    // Send with explicit gas limit (10% buffer)
    console.log("\nSending transaction with explicit gas limit...");
    const gasLimit = (estimatedGas * 110n) / 100n; // 10% buffer
    const txWithLimit = await token.transfer(receiver.address, hre.ethers.parseEther("10"), {
        gasLimit: gasLimit
    });
    await txWithLimit.wait();
    console.log(`✅ Transaction sent with gasLimit: ${gasLimit}`);

    console.log("\n✅ Web3 Demo Complete");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
