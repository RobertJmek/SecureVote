import React from 'react';

const TransactionStatus = ({ status }) => {
    if (!status) return null;

    const { status: type, message, hash } = status;

    return (
        <div className={`tx-status status-${type} animate-slide-up`}>
            <div className="flex items-center gap-3">
                <div className={`status-icon icon-${type}`}>
                    {type === 'pending' && '⏳'}
                    {type === 'success' && '✅'}
                    {type === 'error' && '❌'}
                </div>
                <div className="flex-1">
                    <div className="font-medium">{message}</div>
                    {hash && (
                        <div className="text-xs opacity-75 font-mono mt-1 break-all">
                            Hash: {hash}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionStatus;
