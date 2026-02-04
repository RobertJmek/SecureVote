import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { SUPPORTED_CHAINS, NETWORKS } from '../constants';
import { VOTING_ABI } from '../constants';

const ProposalList = ({ contract, account, onTxStatus, network }) => {
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(false);

    // Get current chain ID
    const currentChainId = network ? Number(network.chainId) : 0;

    useEffect(() => {
        if (account) {
            loadAllProposals();
        }
    }, [account]);

    const loadAllProposals = async () => {
        setLoading(true);
        try {
            const allProposals = [];

            // Fetch from each supported chain
            for (const chain of SUPPORTED_CHAINS) {
                try {
                    const provider = new ethers.JsonRpcProvider(chain.rpc);
                    const votingContract = new ethers.Contract(
                        chain.contracts.VOTING_ENGINE,
                        VOTING_ABI,
                        provider
                    );

                    const count = await votingContract.proposalCount();

                    for (let i = 1; i <= Number(count); i++) {
                        const p = await votingContract.proposals(i);
                        const hasVoted = account ? await votingContract.hasVoted(i, account) : false;
                        const status = await votingContract.getProposalStatus(i);

                        allProposals.push({
                            id: Number(p.id),
                            description: p.description,
                            deadline: Number(p.deadline),
                            yesVotes: p.yesVotes,
                            noVotes: p.noVotes,
                            executed: p.executed,
                            hasVoted,
                            status,
                            chainId: chain.chainId,
                            chainName: chain.name,
                            chainColor: chain.color,
                            currency: chain.currency
                        });
                    }
                } catch (err) {
                    console.error(`Failed to load proposals from ${chain.name}:`, err);
                }
            }

            // Sort by newest first
            allProposals.sort((a, b) => b.id - a.id);
            setProposals(allProposals);
        } catch (err) {
            console.error('Failed to load proposals:', err);
        } finally {
            setLoading(false);
        }
    };

    const switchNetwork = async (targetChainId) => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${targetChainId.toString(16)}` }],
            });
        } catch (err) {
            console.error('Failed to switch network:', err);
            onTxStatus({ status: 'error', message: 'Failed to switch network. Please switch manually in MetaMask.' });
        }
    };

    const handleVote = async (proposal, support) => {
        // Check if on correct network
        if (currentChainId !== proposal.chainId) {
            onTxStatus({
                status: 'pending',
                message: `Switching to ${proposal.chainName}...`
            });
            await switchNetwork(proposal.chainId);
            // Wait for network switch to complete
            setTimeout(() => {
                onTxStatus({
                    status: 'pending',
                    message: 'Network switched! Please click vote button again.'
                });
            }, 1000);
            return;
        }

        // Vote on active chain
        if (!contract) return;
        try {
            onTxStatus({ status: 'pending', message: `Voting ${support ? 'YES' : 'NO'} on #${proposal.id}...` });

            const tx = await contract.vote(proposal.id, support);
            onTxStatus({ status: 'pending', message: 'Transaction Sent', hash: tx.hash });

            await tx.wait();
            onTxStatus({ status: 'success', message: 'Vote Cast Successfully!', hash: tx.hash });

            // Reload proposals
            await loadAllProposals();
        } catch (err) {
            onTxStatus({ status: 'error', message: err.message || 'Transaction Failed' });
        }
    };

    const formatTimeRemaining = (deadline) => {
        const now = Math.floor(Date.now() / 1000);
        const remaining = deadline - now;

        if (remaining <= 0) return 'Ended';

        const days = Math.floor(remaining / 86400);
        const hours = Math.floor((remaining % 86400) / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const calculatePercentage = (votes, total) => {
        if (total === 0n) return 0;
        return Math.round((Number(votes) / Number(total)) * 100);
    };

    if (loading) {
        return (
            <div className="card text-center">
                <h2>📋 Cross-Chain Proposals</h2>
                <p className="text-gray-500">Loading proposals from Sepolia and Polygon...</p>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="flex justify-between items-center mb-4">
                <h2>📋 Cross-Chain Proposals ({proposals.length})</h2>
                <button className="btn btn-sm btn-secondary" onClick={loadAllProposals}>
                    🔄 Refresh
                </button>
            </div>

            {proposals.length === 0 && (
                <p className="text-gray-500 text-center italic">
                    No proposals yet on Sepolia or Polygon. Create one above!
                </p>
            )}

            <div className="flex flex-col gap-4">
                {proposals.map(p => {
                    const totalVotes = p.yesVotes + p.noVotes;
                    const yesPercent = calculatePercentage(p.yesVotes, totalVotes);
                    const noPercent = calculatePercentage(p.noVotes, totalVotes);
                    const isActive = p.status === 'Active';
                    const isOnWrongChain = currentChainId !== p.chainId;

                    return (
                        <div key={`${p.chainId}-${p.id}`} className="proposal-item">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="proposal-id">#{p.id}</span>
                                        <span
                                            className="chain-badge"
                                            style={{ backgroundColor: `${p.chainColor}20`, color: p.chainColor, borderColor: p.chainColor }}
                                        >
                                            {p.chainName}
                                        </span>
                                        <span className={`status-badge status-${p.status.toLowerCase()}`}>
                                            {p.status}
                                        </span>
                                    </div>
                                    <p className="proposal-description">{p.description}</p>
                                </div>
                                <div className="text-right text-sm">
                                    <div className="text-gray-400">
                                        {isActive ? '⏱️ ' + formatTimeRemaining(p.deadline) : '✅ ' + p.status}
                                    </div>
                                </div>
                            </div>

                            <div className="vote-stats mb-3">
                                <div className="vote-bar-container">
                                    <div className="vote-bar vote-yes" style={{ width: `${yesPercent}%` }}></div>
                                    <div className="vote-bar vote-no" style={{ width: `${noPercent}%` }}></div>
                                </div>
                                <div className="flex justify-between text-sm mt-2">
                                    <span className="text-green-400">
                                        ✅ YES: {ethers.formatEther(p.yesVotes)} ({yesPercent}%)
                                    </span>
                                    <span className="text-red-400">
                                        ❌ NO: {ethers.formatEther(p.noVotes)} ({noPercent}%)
                                    </span>
                                </div>
                            </div>

                            {p.hasVoted && (
                                <div className="voted-badge">
                                    ✓ You already voted
                                </div>
                            )}

                            {isActive && !p.hasVoted && isOnWrongChain && (
                                <div className="network-switch-warning">
                                    ⚠️ Switch to <strong>{p.chainName}</strong> to vote
                                    <button
                                        className="btn btn-sm btn-secondary ml-2"
                                        onClick={() => switchNetwork(p.chainId)}
                                    >
                                        Switch Network
                                    </button>
                                </div>
                            )}

                            {isActive && !p.hasVoted && !isOnWrongChain && (
                                <div className="flex gap-3">
                                    <button
                                        className="btn btn-success flex-1"
                                        onClick={() => handleVote(p, true)}
                                    >
                                        ✅ Vote YES
                                    </button>
                                    <button
                                        className="btn btn-danger flex-1"
                                        onClick={() => handleVote(p, false)}
                                    >
                                        ❌ Vote NO
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProposalList;
