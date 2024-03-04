import React from 'react';
import Card from '../Card/Card';
import "../Card/Card.css"
const Hand = ({ hand }) => {
  return (
    <div className="hand">
      {hand.map((card, index) => (
        <div key={index} className="hand-card">
          <Card value={card.value} suit={card.suit} flipped={card.flipped} />
        </div>
      ))}
    </div>
  );
};

export default Hand;
