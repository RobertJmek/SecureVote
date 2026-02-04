import React, { useState } from 'react';
import { NETWORKS } from '../constants';

const CreateProposal = ({ contract, onTxStatus, network }) => {
    const [desc, setDesc] = useState('');
    const [gasLimit, setGasLimit] = useState('');

    // Get currency symbol
    const chainId = network ? Number(network.chainId) : 0;
    const currency = NETWORKS[chainId]?.currency || 'ETH';

    const handleCreate = async () => {
        if (!contract || !desc) return;
        try {
            onTxStatus({ status: 'pending', message: 'Estimating Gas & Preparing...' });

            // Get fee
            const fee = await contract.CREATION_FEE();

            // Config overrides
            const overrides = { value: fee };
            if (gasLimit) {
                overrides.gasLimit = BigInt(gasLimit);
            }

            const tx = await contract.createProposal(desc, overrides);
            onTxStatus({ status: 'pending', message: 'Transaction Sent', hash: tx.hash });

            await tx.wait();
            onTxStatus({ status: 'success', message: 'Proposal Created Successfully!', hash: tx.hash });
            setDesc('');
            setGasLimit('');

        } catch (err) {
            onTxStatus({ status: 'error', message: err.message || 'Transaction Failed' });
        }
    };

    return (
        <div className="card">
            <h2>📝 Create Proposal</h2>
            <div className="form-group mb-4">
                <label>Description</label>
                <input
                    type="text"
                    className="form-input"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="What should we vote on?"
                />
            </div>
            <div className="form-group mb-4">
                <label>Gas Limit (Optional)</label>
                <input
                    type="number"
                    className="form-input"
                    value={gasLimit}
                    onChange={(e) => setGasLimit(e.target.value)}
                    placeholder="Auto"
                />
            </div>
            <button
                className="btn btn-primary w-full"
                onClick={handleCreate}
                disabled={!contract || !desc}
            >
                Create Proposal (0.01 {currency})
            </button>
        </div>
    );
};

export default CreateProposal;
