import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { SUPPORTED_CHAINS } from '../constants';

const FAUCET_ABI = [
    "function claim() external",
    "function hasClaimed(address) view returns (bool)",
    "function getFaucetBalance() view returns (uint256)",
    "function claimAmount() view returns (uint256)",
    "event TokensClaimed(address indexed claimer, uint256 amount)"
];

const ClaimTokens = ({ account, provider, network, onTxStatus }) => {
    const [faucetInfo, setFaucetInfo] = useState({});
    const [loading, setLoading] = useState(false);
    const [claiming, setClaiming] = useState(false);

    const currentChainId = network ? Number(network.chainId) : 0;
    const currentChain = SUPPORTED_CHAINS.find(c => c.chainId === currentChainId);

    useEffect(() => {
        if (account && currentChain) {
            loadFaucetInfo();
        }
    }, [account, currentChainId]);

    const loadFaucetInfo = async () => {
        if (!currentChain || !currentChain.contracts.FAUCET) return;

        setLoading(true);
        try {
            const faucetContract = new ethers.Contract(
                currentChain.contracts.FAUCET,
                FAUCET_ABI,
                provider
            );

            const [hasClaimed, balance, claimAmount] = await Promise.all([
                faucetContract.hasClaimed(account),
                faucetContract.getFaucetBalance(),
                faucetContract.claimAmount()
            ]);

            setFaucetInfo({
                hasClaimed,
                balance: ethers.formatEther(balance),
                claimAmount: ethers.formatEther(claimAmount),
                contract: faucetContract
            });
        } catch (err) {
            console.error('Failed to load faucet info:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async () => {
        if (!faucetInfo.contract) return;

        setClaiming(true);
        try {
            onTxStatus({ status: 'pending', message: 'Claiming tokens...' });

            const signer = await provider.getSigner();
            const faucetWithSigner = faucetInfo.contract.connect(signer);

            const tx = await faucetWithSigner.claim();
            onTxStatus({ status: 'pending', message: 'Transaction Sent', hash: tx.hash });

            await tx.wait();
            onTxStatus({
                status: 'success',
                message: `Successfully claimed ${faucetInfo.claimAmount} GT!`,
                hash: tx.hash
            });

            // Reload info
            await loadFaucetInfo();
        } catch (err) {
            onTxStatus({ status: 'error', message: err.message || 'Claim Failed' });
        } finally {
            setClaiming(false);
        }
    };

    if (!account || !currentChain || !currentChain.contracts.FAUCET) {
        return null;
    }

    if (loading) {
        return (
            <div className="card faucet-card">
                <h2>🎁 Free Tokens</h2>
                <p className="text-gray-500">Loading faucet...</p>
            </div>
        );
    }

    return (
        <div className="card faucet-card">
            <div className="flex justify-between items-center mb-4">
                <h2>🎁 Free Governance Tokens</h2>
                <span className="faucet-balance">
                    {faucetInfo.balance || '0'} GT available
                </span>
            </div>

            {faucetInfo.hasClaimed ? (
                <div className="claimed-status">
                    ✅ You already claimed {faucetInfo.claimAmount} GT from this faucet
                </div>
            ) : (
                <>
                    <p className="faucet-description">
                        Claim <strong>{faucetInfo.claimAmount} GT</strong> for free to participate in governance!
                        One claim per address on {currentChain.name}.
                    </p>
                    <button
                        className="btn btn-primary w-full mt-3"
                        onClick={handleClaim}
                        disabled={claiming || parseFloat(faucetInfo.balance) < parseFloat(faucetInfo.claimAmount)}
                    >
                        {claiming ? 'Claiming...' : `🎁 Claim ${faucetInfo.claimAmount} GT`}
                    </button>
                    {parseFloat(faucetInfo.balance) < parseFloat(faucetInfo.claimAmount) && (
                        <p className="text-red-400 text-sm mt-2 text-center">
                            Faucet is empty. Please contact the admin.
                        </p>
                    )}
                </>
            )}
        </div>
    );
};

export default ClaimTokens;
