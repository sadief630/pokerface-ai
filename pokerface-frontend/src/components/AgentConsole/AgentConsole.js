import './AgentConsole.css';
import React, { useState, useEffect } from 'react';

const AgentConsole = ({ turnLabel, agentMoney }) => {
    return (
        <div className="agent-console">
            <div className="text-style-title">
                Intelligent Agent
            </div>
            <div className='text-style-body'>
                $$$ : {agentMoney}
            </div>
            <div className='text-style-body'>
                {turnLabel}
            </div>
        </div>
    );
};

export default AgentConsole;