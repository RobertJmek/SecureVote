import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("SecureVote System", function () {
    async function deployFixture() {
        const [owner, voter1, voter2, nonVoter] = await hre.ethers.getSigners();

        // 1. Deploy VoterRegistry
        const VoterRegistry = await hre.ethers.getContractFactory("VoterRegistry");
        const registry = await VoterRegistry.deploy();

        // 2. Deploy VotingEngine
        const VotingEngine = await hre.ethers.getContractFactory("VotingEngine");
        const votingEngine = await VotingEngine.deploy(await registry.getAddress());

        // 3. Deploy GovernanceToken
        const GovernanceToken = await hre.ethers.getContractFactory("GovernanceToken");
        const token = await GovernanceToken.deploy(1000000); // 1M tokens

        return { registry, votingEngine, token, owner, voter1, voter2, nonVoter };
    }

    describe("VoterRegistry", function () {
        it("Should allow owner to add voter", async function () {
            const { registry, votingEngine, owner, voter1 } = await loadFixture(deployFixture);
            await registry.addVoter(voter1.address);
            expect(await registry.isWhitelisted(voter1.address)).to.be.true;
        });

        it("Should not allow non-owner to add voter", async function () {
            const { registry, voter1, voter2 } = await loadFixture(deployFixture);
            await expect(registry.connect(voter1).addVoter(voter2.address))
                .to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
        });
    });

    describe("VotingEngine", function () {
        it("Should allow whitelisted user to create proposal with fee", async function () {
            const { registry, votingEngine, owner, voter1 } = await loadFixture(deployFixture);
            await registry.addVoter(voter1.address);

            const fee = ethers.parseEther("0.001");
            await expect(votingEngine.connect(voter1).createProposal("Proposal 1", { value: fee }))
                .to.emit(votingEngine, "ProposalCreated")
                .withArgs(1, "Proposal 1", voter1.address);
        });

        it("Should fail if fee is insufficient", async function () {
            const { registry, votingEngine, voter1 } = await loadFixture(deployFixture);
            await registry.addVoter(voter1.address);

            const fee = ethers.parseEther("0.0001"); // Too low
            await expect(votingEngine.connect(voter1).createProposal("Proposal 1", { value: fee }))
                .to.be.revertedWith("Insufficient fee");
        });

        it("Should allow voting", async function () {
            const { registry, votingEngine, voter1, voter2 } = await loadFixture(deployFixture);
            await registry.addVoter(voter1.address);
            await registry.addVoter(voter2.address);

            // Create proposal
            const fee = ethers.parseEther("0.001");
            await votingEngine.connect(voter1).createProposal("Proposal 1", { value: fee });

            // Vote
            await expect(votingEngine.connect(voter2).vote(1))
                .to.emit(votingEngine, "Voted")
                .withArgs(voter2.address, 1);

            const proposal = await votingEngine.getProposal(1);
            expect(proposal.voteCount).to.equal(1);
        });

        it("Should prevent double voting", async function () {
            const { registry, votingEngine, voter1, voter2 } = await loadFixture(deployFixture);
            await registry.addVoter(voter2.address);
            const fee = ethers.parseEther("0.001");
            // owner is also whitelisted? No, need to add owner if owner wants to interact as voter, 
            // but let's use voter1/2.
            await registry.addVoter(voter1.address);
            await votingEngine.connect(voter1).createProposal("P1", { value: fee });

            await votingEngine.connect(voter2).vote(1);
            await expect(votingEngine.connect(voter2).vote(1))
                .to.be.revertedWith("User already voted on this proposal");
        });
    });
});
