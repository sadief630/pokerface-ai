import React, { useState } from 'react';
import './GameState.css';

const GameState = ({ currentPlayer, currentPot, currentBet }) => {
  const [turnsPlayed, setTurnsPlayed] = useState(0);

  const handleNextTurn = () => {
    setTurnsPlayed(turnsPlayed + 1);
  };

  return (
    <div className="game-state-container">
      <div className="game-state-info">
        <div className="info-item">
          <strong>Turn:</strong> {currentPlayer}
        </div>
        <div className="info-item">
          <strong>Current Bet:</strong> ${currentPot}
        </div>
      </div>
    </div>
  );
};

export default GameState;
