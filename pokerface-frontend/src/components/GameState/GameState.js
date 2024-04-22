import React from 'react';
import './GameState.css';

const GameState = ({ currentPlayer, currentPot, result, currentMinBet }) => {
  return (
    <div className="game-state-container">
      <div className="game-state-info">
        <div className="info-item">
          <strong>Game Overview Console</strong>
        </div>
        <div className="info-item">
          <strong>Turn:</strong> {currentPlayer}
        </div>
        <div className="info-item">
          <strong>Current Pot:</strong> ${currentPot}
        </div>
        <div className="info-item">
          <strong>Current Minimum Bet:</strong> ${currentMinBet}
        </div>
        <div className="info-item">
          <strong>{result}</strong>
        </div>
      </div>
    </div>
  );
};

export default GameState;
