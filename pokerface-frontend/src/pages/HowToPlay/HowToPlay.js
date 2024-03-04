// HowToPlay.js

import React from 'react';
import '../../App.css';
import '../../App.css'
import './HowToPlay.css';
import { GiPokerHand } from "react-icons/gi";

import Author1Image from '../../images/devito.jpg'
import Author2Image from '../../images/devito.jpg'

function HowToPlay() {
    return (
        <div className="how-to-play-container">
            <GiPokerHand color='#1d428b' size={80}></GiPokerHand>
            <div className="section-heading">How to Play Texas Hold'em Poker </div>
            <div className="content-list">
                <div className="content-paragraph">
                    <strong>Starting the Game:</strong> You and the AI opponent are each dealt two private cards (hole cards) to begin the game.
                </div>

                <div className="content-paragraph">
                    <strong>Community Cards:</strong> Five community cards are dealt face-up in the middle of the table throughout the game.
                </div>

                <div className="content-paragraph">
                    <strong>Rounds of Betting:</strong> Take turns with the AI opponent to bet, raise, or fold based on your hand strength and strategy.
                </div>

                <div className="content-paragraph">
                    <strong>Revealing Cards:</strong> After the final round of betting, both you and the AI reveal your hands, forming the best five-card combination from your hole cards and the community cards.
                </div>

                <div className="content-paragraph">
                    <strong>Winning the Pot:</strong> The player (either you or the AI) with the best hand wins the pot. Hands are ranked from highest to lowest (e.g., Royal Flush, Straight, Two Pair).
                </div>
            </div>
            <div className="section-heading">Authors</div>
            <div className="authors-section">
                <div className="author">
                    <img src={Author1Image} alt="Author 1" className="author-image" />
                    <p>Sadie Forbes</p>
                </div>
                <div className="author">
                    <img src={Author2Image} alt="Author 2" className="author-image" />
                    <p>Ethan Cooper</p>
                </div>
            </div>
        </div>
    );
}

export default HowToPlay;
