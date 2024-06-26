import React, { useState, useEffect } from 'react';
import { BsFillSuitSpadeFill } from "react-icons/bs";
import { BsFillSuitClubFill } from "react-icons/bs";
import { BsFillSuitDiamondFill } from "react-icons/bs";
import { BsFillSuitHeartFill } from "react-icons/bs";
import './Card.css';

const Card = ({ value, suit, flipped }) => {
  const [isFlipped, setIsFlipped] = useState(flipped);

  useEffect(() => {
    setIsFlipped(flipped);
  }, [flipped]);

  return (
    <div className={`card-container ${isFlipped ? 'flipped' : ''}`}>
      <div className="card">
        <div className="card-front">
          <div className='card-top'>
            <div className="card-suit">{getSuitIcon(suit)}</div>
            <div className="card-value">{getCardRank(value)}</div>
          </div>
          <div className='card-bottom'>
            <div className="card-suit">{getSuitIcon(suit)}</div>
            <div className="card-value">{getCardRank(value)}</div>
          </div>
        </div>
        <div className="card-back">
          <div className="card-back-inner-border"></div>
          <div className="card-back-pattern"></div>
          <div className="card-back-content">
          </div>
        </div>
      </div>
    </div>
  );
};

const getCardRank = (value) => {
  switch (value) {
    case 14:
      return 'A';
    case 11:
      return 'J';
    case 12:
      return 'Q';
    case 13:
      return 'K';
    default:
      return value;
  }
};

const getSuitIcon = (suit) => {
  switch (suit) {
    case 'Hearts':
      return <BsFillSuitHeartFill color='#A90505' />
    case 'Diamonds':
      return <BsFillSuitDiamondFill color='#A90505' />
    case 'Clubs':
      return <BsFillSuitClubFill />
    case 'Spades':
      return <BsFillSuitSpadeFill />
    default:
      return <BsFillSuitSpadeFill />
  }
};

export default Card;
