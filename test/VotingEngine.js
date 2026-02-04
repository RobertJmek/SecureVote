const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("VotingEngine System", function () {
    let GovernanceToken, VotingEngine;
    let token, engine;
    let owner, addr1, addr2;

    const TOKENS_PER_ETH = 1000n;
    const PROPOSAL_THRESHOLD = ethers.parseEther("100"); // 100 Tokens
    const MIN_QUORUM = ethers.parseEther("1000000"); // 1M Tokens (High quorum from contract)

    // Helper to parse ETH amounts easily
    const parseEther = ethers.parseEther;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        // 1. Deploy Token
        GovernanceToken = await ethers.getContractFactory("GovernanceToken");
        token = await GovernanceToken.deploy(parseEther("1000000"));
        await token.waitForDeployment();

        // 2. Deploy Engine (Without Treasury initially)
        VotingEngine = await ethers.getContractFactory("VotingEngine");
        engine = await VotingEngine.deploy(await token.getAddress());
        await engine.waitForDeployment();

        // 3. Deploy Treasury (With Engine address)
        const Treasury = await ethers.getContractFactory("Treasury");
        const treasury = await Treasury.deploy(await engine.getAddress());
        await treasury.waitForDeployment();

        // 4. Link Treasury to Engine
        await engine.setTreasury(await treasury.getAddress());

        // Expose treasury for tests
        this.treasury = treasury;
    });



    describe("GovernanceToken", function () {
        it("Should allow owner to transfer tokens", async function () {
            // Owner transfers 1000 tokens to addr1
            await token.transfer(addr1.address, parseEther("1000"));
            // Expect addr1 to have 1000 Tokens
            expect(await token.balanceOf(addr1.address)).to.equal(parseEther("1000"));
        });
    });

    describe("Proposal Creation", function () {
        it("Should revert if user has insufficient tokens", async function () {
            // addr2 has 0 tokens
            // Provide fee but still fail on tokens
            await expect(
                engine.connect(addr2).createProposal("Test Proposal", { value: parseEther("0.01") })
            ).to.be.revertedWith("Insufficient tokens");
        });

        it("Should revert if fee is not paid", async function () {
            await expect(
                engine.createProposal("Free Proposal")
            ).to.be.revertedWith("Fee required");
        });

        it("Should create proposal if user has enough tokens and pays fee", async function () {
            const treasury = this.treasury;
            const treasuryAddr = await treasury.getAddress();
            const initialBalance = await ethers.provider.getBalance(treasuryAddr);

            // Owner pays 0.01 ETH fee
            await expect(engine.createProposal("Valid Proposal", { value: parseEther("0.01") }))
                .to.emit(engine, "ProposalCreated")
                .withArgs(1, owner.address, "Valid Proposal", (await time.latest()) + 3 * 86400 + 1);

            const p = await engine.proposals(1);
            expect(p.description).to.equal("Valid Proposal");
            expect(p.id).to.equal(1);

            // Verify fee transfer
            const finalBalance = await ethers.provider.getBalance(treasuryAddr);
            expect(finalBalance).to.equal(initialBalance + parseEther("0.01"));
        });
    });

    describe("Voting", function () {
        beforeEach(async function () {
            await engine.createProposal("Vote Me", { value: parseEther("0.01") });
        });

        it("Should allow voting and track weights", async function () {
            // owner votes YES
            await engine.vote(1, true);

            const p = await engine.proposals(1);
            expect(p.yesVotes).to.equal(parseEther("1000000")); // All owner tokens
            expect(p.noVotes).to.equal(0);
        });

        it("Should update hasVoted", async function () {
            await engine.vote(1, true);
            expect(await engine.hasVoted(1, owner.address)).to.be.true;
        });

        it("Should revert double voting", async function () {
            await engine.vote(1, true);
            await expect(engine.vote(1, false)).to.be.revertedWith("Already voted");
        });
    });

    describe("Deadline Extension (Auto)", function () {
        it("Should extend deadline if quorum not met and close to end", async function () {
            // 1. Create proposal
            await engine.createProposal("Extension Test", { value: parseEther("0.01") });
            let p = await engine.proposals(1);
            const originalDeadline = p.deadline;

            // 2. Buy some small amount of tokens for addr1 so they can vote (but not meet quorum)
            await token.connect(addr1).buyTokens({ value: parseEther("1") }); // 1000 tokens

            // 3. Time travel to near end (2 days 23 hours passed) - less than 12h remaining
            // Quorum is 1M, we only have 1000 votes coming.
            await time.increaseTo(originalDeadline - BigInt(3600)); // 1 hour remaining

            // 4. Vote
            await expect(engine.connect(addr1).vote(1, true))
                .to.emit(engine, "DeadlineExtended");

            // 5. Check new deadline
            p = await engine.proposals(1);
            expect(p.deadline).to.be.gt(originalDeadline);
            // Should be extended by 12 hours (43200 seconds)
            expect(p.deadline).to.equal(originalDeadline + 43200n);
        });
    });

    describe("Execution (Pure Governance)", function () {
        it("Should execute successfully if passes", async function () {
            await engine.createProposal("Exec Test", { value: parseEther("0.01") });

            // Owner holds 1M tokens, which equals MIN_QUORUM
            await engine.vote(1, true);

            // Time travel past deadline
            const p = await engine.proposals(1);
            await time.increaseTo(p.deadline + 1n);

            await expect(engine.executeProposal(1))
                .to.emit(engine, "ProposalExecuted")
                .withArgs(1);

            const finalP = await engine.proposals(1);
            expect(finalP.executed).to.be.true;
        });
    });
});
