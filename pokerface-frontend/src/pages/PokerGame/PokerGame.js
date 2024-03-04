
import '../../App.css'
import { useState } from 'react';
import Hand from '../../components/Hand/Hand';
import StartScreen from '../../components/StartScreen/StartScreen';
import PlayerConsole from '../../components/PlayerConsole/PlayerConsole';
import AgentConsole from '../../components/AgentConsole/AgentConsole';
import GameState from '../../components/GameState/GameState';

import Deck from "../../images/deck.png"


import './PokerGame.css'

function PokerGame() {
    const [started, setStarted] = useState(false);

    const communityCards = [
        { value: 8, suit: "diamonds", flipped: false },
        { value: 11, suit: "spades", flipped: false },
        { value: 8, suit: "hearts", flipped: false },
        { value: 11, suit: "clubs", flipped: true },
        { value: 11, suit: "clubs", flipped: true }

    ];

    const agentCards = [
        { value: 8, suit: "diamonds", flipped: true },
        { value: 11, suit: "hearts", flipped: true }
    ];

    const playerCards = [
        { value: 8, suit: "diamonds", flipped: false },
        { value: 11, suit: "hearts", flipped: false }
    ];

    const handleStartGame = () => {
        setStarted(true);
    };

    if (!started) {
        return (
            <div>
                <StartScreen onStartGame={handleStartGame}></StartScreen>
            </div>
        );
    }

    return (
        <>
        <div className='poker-container'>
            <GameState></GameState>
            <div className="poker-table">
                <AgentConsole></AgentConsole>
                <Hand hand={agentCards}></Hand>
                <div className='community-cards'>
                    <Hand hand={communityCards}></Hand>   
                    <img width={320} src={Deck}></img>
                </div>
                <Hand hand={playerCards}></Hand>
                <PlayerConsole maxRaiseValue={1000}></PlayerConsole>
            </div>
        </div></>

    );
}

export default PokerGame;
