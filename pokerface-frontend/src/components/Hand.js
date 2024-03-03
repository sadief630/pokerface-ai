// Hand.js
import React from 'react';
import Card from './Card';
import "./Card.css"
const Hand = ({ hand }) => {
  return (
    <div className="hand">
      {hand.map((card, index) => (
        <div key={index} className="hand-card">
          <Card value={card.value} suit={card.suit} />
        </div>
      ))}
    </div>
  );
};

export default Hand;
