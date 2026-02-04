import React, { useState } from 'react';
import { useWeb3 } from './hooks/useWeb3';
import ConnectWallet from './components/ConnectWallet';
import ClaimTokens from './components/ClaimTokens';
import CreateProposal from './components/CreateProposal';
import ProposalList from './components/ProposalList';
import GasAnalyzer from './components/GasAnalyzer';
import EventLogger from './components/EventLogger';
import TransactionStatus from './components/TransactionStatus';
import './index.css';

function App() {
  const wallet = useWeb3();
  const [txStatus, setTxStatus] = useState(null);

  const handleTxStatus = (status) => {
    setTxStatus(status);
    // Auto-clear success after 5s
    if (status.status === 'success') {
      wallet.refreshBalances(); // Auto-refresh data on success
      setTimeout(() => setTxStatus(null), 5000);
    }
  };

  return (
    <div className="container">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 mb-2">
          🗳️ SecureVote
        </h1>
        <p className="text-gray-400">Decentralized Governance Platform</p>
      </header>

      <div className="grid gap-6">
        {/* 1. Wallet Connection */}
        <ConnectWallet wallet={wallet} connect={wallet.connectWallet} />

        {wallet.account && (
          <>
            {/* 2. Claim Free Tokens */}
            <ClaimTokens
              account={wallet.account}
              provider={wallet.provider}
              network={wallet.network}
              onTxStatus={handleTxStatus}
            />

            {/* 3. Gas Analysis */}
            <GasAnalyzer
              contract={wallet.contracts.voting}
              provider={wallet.provider}
              network={wallet.network}
            />

            {/* 4. Create Proposal */}
            <CreateProposal
              contract={wallet.contracts.voting}
              onTxStatus={handleTxStatus}
              network={wallet.network}
            />

            {/* 5. Proposal List with Voting */}
            <ProposalList
              contract={wallet.contracts.voting}
              account={wallet.account}
              onTxStatus={handleTxStatus}
              network={wallet.network}
            />

            {/* 6. Events */}
            <EventLogger contract={wallet.contracts.voting} />
          </>
        )}
      </div>

      {/* 6. Status Toast */}
      {txStatus && <TransactionStatus status={txStatus} />}
    </div>
  );
}

export default App;
