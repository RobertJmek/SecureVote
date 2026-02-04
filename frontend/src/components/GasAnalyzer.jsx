import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { NETWORKS } from '../constants';

const GasAnalyzer = ({ contract, provider, network }) => {
    const [gasInfo, setGasInfo] = useState({
        price: '0',
        estimated: '0',
        cost: '0'
    });
    const [loading, setLoading] = useState(false);

    // Get currency symbol
    const chainId = network ? Number(network.chainId) : 0;
    const currency = NETWORKS[chainId]?.currency || 'ETH';

    const updateGas = async () => {
        if (!contract || !provider) return;
        setLoading(true);
        try {
            const feeData = await provider.getFeeData();
            const gasPrice = feeData.gasPrice; // ethers v6 returns BigInt

            // Default estimate or try actual call
            let estimated = 100000n;
            try {
                estimated = await contract.vote.estimateGas(1, true);
            } catch (e) { /* ignore, use default */ }

            const cost = gasPrice * estimated;

            setGasInfo({
                price: ethers.formatUnits(gasPrice, 'gwei'),
                estimated: estimated.toString(),
                cost: ethers.formatEther(cost)
            });

        } catch (err) {
            console.error("Gas Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial load
        updateGas();
        // Refresh every 15s
        const interval = setInterval(updateGas, 15000);
        return () => clearInterval(interval);
    }, [contract, provider]);

    return (
        <div className="card">
            <div className="flex justify-between items-center mb-4">
                <h2>⛽ Gas Analysis</h2>
                <button className="btn btn-sm btn-secondary" onClick={updateGas} disabled={loading}>
                    {loading ? '...' : '🔄 Refresh'}
                </button>
            </div>

            <div className="gas-grid">
                <div className="gas-item">
                    <span className="label">Gas Price</span>
                    <span className="value">{parseFloat(gasInfo.price).toFixed(2)} Gwei</span>
                </div>
                <div className="gas-item">
                    <span className="label">Est. Gas (Vote)</span>
                    <span className="value">{gasInfo.estimated} units</span>
                </div>
                <div className="gas-item">
                    <span className="label">Est. Cost</span>
                    <span className="value">{parseFloat(gasInfo.cost).toFixed(6)} {currency}</span>
                </div>
            </div>
        </div>
    );
};

export default GasAnalyzer;
