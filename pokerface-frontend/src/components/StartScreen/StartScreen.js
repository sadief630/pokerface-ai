import React from 'react';
import './StartScreen.css';
import { GiPokerHand } from "react-icons/gi";

const StartScreen = ({ onStartGame }) => {
    return (
        <div className="start-screen-container">
            <div className='start-screen-title'>
                <h1 className='start-screen-title'>Welcome to Texas Hold'em AI Poker!</h1>
                <GiPokerHand color='#1d428b' size={80}></GiPokerHand>
            </div>
            <p className="start-screen-text">Press the button below to start the game.</p>

            <button className="start-screen-button" onClick={onStartGame}>
                Start Poker Game

            </button>

        </div>
    );
};

export default StartScreen;
