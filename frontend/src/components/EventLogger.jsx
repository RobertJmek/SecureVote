import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const EventLogger = ({ contract }) => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        if (!contract) {
            console.log('❌ EventLogger: No contract provided');
            return;
        }

        console.log('✅ EventLogger: Contract connected, attaching listeners...');

        // Listeners (Observer Pattern)
        const onProposalCreated = (id, proposer, desc, deadline, event) => {
            console.log('🎉 ProposalCreated event received!', id.toString());
            addEvent('ProposalCreated', {
                ID: id.toString(),
                Desc: desc,
                Proposer: `${proposer.slice(0, 6)}...`
            });
        };

        const onVoted = (id, voter, support, weight, event) => {
            console.log('🗳️ Voted event received!', id.toString());
            addEvent('Voted', {
                ID: id.toString(),
                Vote: support ? 'YES' : 'NO',
                Voter: `${voter.slice(0, 6)}...`
            });
        };

        const onExecuted = (id, event) => {
            console.log('✅ ProposalExecuted event received!', id.toString());
            addEvent('ProposalExecuted', { ID: id.toString() });
        };

        // Attach
        contract.on('ProposalCreated', onProposalCreated);
        contract.on('Voted', onVoted);
        contract.on('ProposalExecuted', onExecuted);

        console.log('✅ EventLogger: Listeners attached successfully');

        // Cleanup
        return () => {
            console.log('🧹 EventLogger: Cleaning up listeners');
            contract.removeAllListeners();
        };

    }, [contract]);

    const addEvent = (type, data) => {
        console.log('📝 Adding event to UI:', type, data);
        setEvents(prev => [{
            id: Date.now(),
            type,
            time: new Date().toLocaleTimeString(),
            data
        }, ...prev].slice(0, 20)); // Keep last 20
    };

    return (
        events.length === 0 ? null : (
            <div className="card">
                <h2>📡 Event Observer Log</h2>
                <div className="event-log-container">
                    {events.map(ev => (
                        <div key={ev.id} className="event-item animate-fade-in">
                            <div className="flex justify-between items-center mb-1">
                                <span className="event-type">{ev.type}</span>
                                <span className="text-xs text-gray-500">{ev.time}</span>
                            </div>
                            <div className="text-sm">
                                {Object.entries(ev.data).map(([k, v]) => (
                                    <span key={k} className="mr-3">
                                        <span className="font-semibold text-gray-400">{k}:</span> {v}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    );
};

export default EventLogger;
