import React, { useState, useEffect } from 'react';
import '../../App.css';
import Hand from '../../components/Hand/Hand';
import StartScreen from '../../components/StartScreen/StartScreen';
import PlayerConsole from '../../components/PlayerConsole/PlayerConsole';
import AgentConsole from '../../components/AgentConsole/AgentConsole';
import GameState from '../../components/GameState/GameState';
import Deck from "../../images/deck.png";
import './PokerGame.css';

function PokerGame() {
    const [started, setStarted] = useState(false);
    const [communityCards, setCommunityCards] = useState([]);
    const [agentCards, setAgentCards] = useState([]);
    const [playerCards, setPlayerCards] = useState([]);
    const [turn, setTurn] = useState(0);
    const [active, setActive] = useState("player")
    const[AITurnLabel, setAITurnLabel] = useState("Waiting on player...")

    const startGame = () => {
        fetch('http://127.0.0.1:8000/start')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setStarted(true);
            })
            .catch(error => {
                console.error('There was a problem starting the game:', error);
            });
    };

    const fetchHoleCards = () => {
        fetch('http://127.0.0.1:8000/holecards')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setAgentCards(data.agent_hole);
                setPlayerCards(data.player_hole);
            })
            .catch(error => {
                console.error('There was a problem fetching hole cards:', error);
            });
    };

    const fetchCommunityCards = () => {
        fetch('http://127.0.0.1:8000/communitycards')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setCommunityCards(data.community_cards);
            })
            .catch(error => {
                console.error('There was a problem fetching community cards:', error);
            });
    };

    const handleStartGame = () => {
        startGame();
        fetchHoleCards();
        fetchCommunityCards();
    };

    
    // game end function
    const evaluateGame = () => { 
        setTurn(6);

        // if a player folds, we need to award the pot to the ai.
        // if the ai folds, we need to award the pot to the player.

        console.log("Game Evaluation: A player folded or all of the cards are flipped.")

        // do game eval logic based off of community cards, player cards,
    }

    const handleAIMove = () => {
        setActive("ai");
        setAITurnLabel("Thinking...");
        // AI's move after a delay
        setTimeout(() => {
            // Perform AI move logic here (e.g., fetching data from API)
            // Set the AI's turn label and display it in AgentConsole
            // Reset AI's move display after one second
            const move = "check"
            setTimeout(() => {
                setAITurnLabel("AI Move: " + move);
                if(move == "fold"){
                    // evaluate the game 
                    setTurn(6);
                }else{
                    setTimeout(() => {
                        setAITurnLabel("Waiting on Player...");
                        setActive("player");
                        setTurn(turn + 1); // Increment turn after AI's move
                    }, 1000);
                }
            }, 1000);
        }, 1000);
    }

    const handlePlayerMove = (action, bet) => {
        // Handle player move
        console.log('Player move:', action);
        console.log('Player bet: ' + bet);

        if(action == 'fold'){
            // evaluate the game, AI does not need to go
            setTurn(6);
        }else{
            // add to pot, subtract from player money, let ai move.
            handleAIMove();
        }
    };

    useEffect(() => {
        console.log("TURN CHANGED: " + turn)
        if (turn >= 1 && turn <= 5 && communityCards.length > 0) {
            // Flip one community card for each turn from 1 to 5
            const updatedCommunityCards = [...communityCards];
            updatedCommunityCards[turn - 1].flipped = false;
            setCommunityCards(updatedCommunityCards);
        } else if (turn === 6) {
            // Unflip all community cards when turn is 6 and evaluate the game
            const updatedCommunityCards = [...communityCards];
            // Use forEach to iterate through each card and unflip it
            updatedCommunityCards.forEach((card) => {
                card.flipped = false;
            });
            setCommunityCards(updatedCommunityCards);
            evaluateGame();
        }
    }, [turn]); // Include turn and communityCards in the dependency array
    
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
                <AgentConsole turnLabel = {AITurnLabel}></AgentConsole>
                <Hand hand={agentCards}></Hand>
                <div className='community-cards'>
                    <Hand hand={communityCards}></Hand>   
                    <img width={320} src={Deck} alt="Deck"></img>
                </div>
                <Hand hand={playerCards}></Hand>
                <PlayerConsole maxRaiseValue={1000} onPlayerMove={handlePlayerMove} enabled = {active == "player"}></PlayerConsole>
            </div>
        </div></>
    );
}

export default PokerGame;
