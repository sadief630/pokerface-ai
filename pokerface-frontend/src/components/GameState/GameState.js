import React, { useState } from 'react';
import './GameState.css';

const GameState = ({ currentPlayer, currentPot, currentBet }) => {
  const [myTurn, setMyTurn] = useState(true)
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
