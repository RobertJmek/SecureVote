import React from 'react';
import { NETWORKS } from '../constants';

const ConnectWallet = ({ wallet, connect }) => {
    const { account, balances, network, isConnecting, error } = wallet;

    if (!account) {
        return (
            <div className="card text-center">
                <h2>🔗 Connect Wallet</h2>
                <p className="subtitle">Connect MetaMask to participate in governance</p>
                <button
                    className="btn btn-primary"
                    onClick={connect}
                    disabled={isConnecting}
                >
                    {isConnecting ? <span className="spinner"></span> : "Connect MetaMask"}
                </button>
                {error && <div className="error-message mt-2">{error}</div>}
            </div>
        );
    }

    // Convert BigInt to Number for comparison safely
    const chainId = network ? Number(network.chainId) : 0;
    const isUnsupported = network && chainId !== 80002 && chainId !== 11155111 && chainId !== 31337 && chainId !== 97;
    const isLocalOutputOnly = chainId === 31337 && balances.eth === '0.0';

    // Get currency symbol
    const currency = NETWORKS[chainId]?.currency || 'ETH';
    const networkName = NETWORKS[chainId]?.name || network?.name || 'Unknown';

    return (
        <div className="card">
            <div className="flex justify-between items-center mb-4">
                <h2>👤 Account Info</h2>
                <span className="badge badge-success px-2 py-1 rounded bg-green-900 text-green-300 text-xs">Connected</span>
            </div>

            {isUnsupported && (
                <div className="mb-4 p-3 bg-red-900/40 border border-red-700 rounded text-red-200 text-sm">
                    ⚠️ <b>Unsupported Network</b> (Chain ID: {chainId}).<br />
                    Please switch to <b>Polygon Amoy</b> or <b>Sepolia</b> in MetaMask.
                </div>
            )}

            {isLocalOutputOnly && (
                <div className="mb-4 p-3 bg-blue-900/40 border border-blue-700 rounded text-blue-200 text-sm">
                    ℹ️ <b>Localhost Detected</b><br />
                    Balance is 0. ETH. Did you run <code>npx hardhat node</code>?
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="info-item">
                    <label>Network</label>
                    <div className="value">{networkName} ({chainId})</div>
                </div>
                <div className="info-item">
                    <label>Address</label>
                    <div className="value font-mono text-sm truncate" title={account}>{account}</div>
                </div>
                <div className="info-item">
                    <label>{currency} Balance</label>
                    <div className="value">{parseFloat(balances.eth).toFixed(4)} {currency}</div>
                </div>
                <div className="info-item">
                    <label>Token Balance</label>
                    <div className="value">{parseFloat(balances.token).toFixed(2)} GT</div>
                </div>
            </div>
        </div>
    );
};

export default ConnectWallet;
