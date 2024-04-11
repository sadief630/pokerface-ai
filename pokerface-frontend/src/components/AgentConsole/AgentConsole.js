import './AgentConsole.css';
import React, { useState, useEffect } from 'react';

const AgentConsole = ({ turnLabel }) => {
    return (
        <div className="agent-console">
            <div className="text-style-title">
                Intelligent Agent
            </div>
            <div className='text-style-body'>
                $$$ : 1000
            </div>
            <div className='text-style-body'>
                {turnLabel}
            </div>
        </div>
    );
};

export default AgentConsole;