import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { NETWORKS, TOKEN_ABI, VOTING_ABI } from '../constants';

export const useWeb3 = () => {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contracts, setContracts] = useState({ token: null, voting: null });
    const [network, setNetwork] = useState(null);
    const [balances, setBalances] = useState({ eth: '0', token: '0' });
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);

    const connectWallet = async () => {
        setIsConnecting(true);
        setError(null);
        try {
            if (!window.ethereum) {
                throw new Error("MetaMask is not installed!");
            }

            await window.ethereum.request({ method: 'eth_requestAccounts' });

            const newProvider = new ethers.BrowserProvider(window.ethereum);
            const newSigner = await newProvider.getSigner();
            const userAddress = await newSigner.getAddress();
            const newNetwork = await newProvider.getNetwork();

            setAccount(userAddress);
            setProvider(newProvider);
            setSigner(newSigner);
            setNetwork(newNetwork);

            // Select contracts based on chainId
            const chainId = Number(newNetwork.chainId);
            const networkConfig = NETWORKS[chainId];

            if (networkConfig) {
                const tokenContract = new ethers.Contract(networkConfig.contracts.GOVERNANCE_TOKEN, TOKEN_ABI, newSigner);
                const votingContract = new ethers.Contract(networkConfig.contracts.VOTING_ENGINE, VOTING_ABI, newSigner);

                setContracts({ token: tokenContract, voting: votingContract });

                // Initial balance fetch
                await fetchBalances(newProvider, tokenContract, userAddress);
            } else {
                setError(`Unsupported Network: Chain ID ${chainId}. Please switch to Sepolia or Polygon Amoy.`);
                setContracts({ token: null, voting: null });
            }

        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to connect wallet");
        } finally {
            setIsConnecting(false);
        }
    };

    const fetchBalances = async (currentProvider, currentTokenContract, currentAccount) => {
        if (!currentProvider || !currentTokenContract || !currentAccount) return;
        try {
            const ethBal = await currentProvider.getBalance(currentAccount);
            const tokenBal = await currentTokenContract.balanceOf(currentAccount);

            setBalances({
                eth: ethers.formatEther(ethBal),
                token: ethers.formatEther(tokenBal)
            });
        } catch (err) {
            console.error("Balance fetch error:", err);
        }
    };

    // Event Listeners for Account/Network changes
    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    // Re-trigger connection logic effectively
                    connectWallet();
                } else {
                    setAccount(null);
                    setSigner(null);
                }
            });
            window.ethereum.on('chainChanged', () => window.location.reload());
        }
        return () => {
            // Cleanup listeners if needed
        }
    }, []);

    // Update balances periodically
    useEffect(() => {
        if (account && provider && contracts.token) {
            const interval = setInterval(() => {
                fetchBalances(provider, contracts.token, account);
            }, 15000);
            return () => clearInterval(interval);
        }
    }, [account, provider, contracts]);

    return {
        account,
        provider,
        signer,
        contracts,
        network,
        balances,
        connectWallet,
        isConnecting,
        error,
        refreshBalances: () => fetchBalances(provider, contracts.token, account)
    };
};
