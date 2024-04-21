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
    const [turn, setTurn] = useState(0);
    const [active, setActive] = useState("player")
    const [pot, setPot] = useState(0)
    const [result, setResult] = useState("")
    // agent variables
    const [agentCards, setAgentCards] = useState([]);
    const [AITurnLabel, setAITurnLabel] = useState("Waiting on player...")
    const [agentMoney, setAgentMoney] = useState(1000)
    const [agentMove, setAgentMove] = useState(null)
    const [agentBet, setAgentBet] = useState(null)
    const [agentFolded, setAgentFolded] = useState(false);

    // player variables
    const [playerCards, setPlayerCards] = useState([]);
    const [playerMoney, setPlayerMoney] = useState(1000);
    const [playerMove, setPlayerMove] = useState(null);
    const [playerBet, setPlayerBet] = useState(null);
    const [playerFolded, setPlayerFolded] = useState(false);

    const minimumBet = 20;

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
                setAgentMove(data.agent_move);
                setAgentBet(data.agent_bet);
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

    const fetchAgentMove = async () => {
        const visibleCards = communityCards.filter(card => !card.flipped);
        console.log("visibleCards: ", visibleCards); // Check if visibleCards are correct
        try {
            const response = await fetch('http://127.0.0.1:8000/get_agent_move', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    agentCards: agentCards,
                    visibleCards: visibleCards,
                }),
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log("Agent Move Response:", data);
            const { move, raise } = data;
            return {move, raise};
        } catch (error) {
            console.error('Error fetching agent move:', error);
        }
    };
    
    const handleStartGame = () => {
        startGame();
        fetchHoleCards();
        fetchCommunityCards();
        // postBlinds(); // dealer posts 10, non-dealer posts 20.
    };

    const calculateBestHand = async (hand, communityCards) => {
        // Create an object with the player's hand and community cards
        const requestData = {
            hand: hand,
            communityCards: communityCards
        };
        // Make an API request to the evaluateHand endpoint
        try {
            const response = await fetch('http://127.0.0.1:8000/evaluatehand', {
                method: 'POST', // Use the POST method to send data in the request body
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json(); // Parse the JSON response
            // The API response should contain the score and handType
            return data;
        } catch (error) {
            console.error('There was a problem evaluating the hand score:', error);
            // Handle errors appropriately (you can choose to return an object with a default score and type)
            return { score: 0, handType: 'Error' };
        }
    };
    
    const evaluateGame = async () => {
        console.log("Game Evaluation: A player folded or all of the cards are flipped.");
        setActive("ai");
        const playerBestHand = await calculateBestHand(playerCards, communityCards);
        const agentBestHand = await calculateBestHand(agentCards, communityCards);
        console.log("AGENT HAND: " + JSON.stringify(agentBestHand));
        console.log("PLAYER HAND: " + JSON.stringify(playerBestHand));
        if(agentFolded){
            setAITurnLabel(`Agent folded. Player wins the pot with a ${agentBestHand.handType}!`);
            setResult(`Agent folded. Player wins the pot with a ${agentBestHand.handType}!`)
            setPlayerMoney(playerMoney + pot);
            setAgentFolded(false)
        }
        else if(playerFolded){
            setAITurnLabel(`Player folded. AI wins the pot with a ${playerBestHand.handType}!`);
            setResult(`Player folded. AI wins the pot with a ${playerBestHand.handType}!`)
            setAgentMoney(agentMoney + pot);
            setPlayerFolded(false)
        }
        else{
            // Compare player and AI hands
            if (playerBestHand.score > agentBestHand.score) {
                // Player wins the pot
                setPlayerMoney(playerMoney + pot);
                setAITurnLabel(`Player wins the pot with a ${playerBestHand.handType}!`);
                setResult(`Player wins the pot with a ${playerBestHand.handType}!`);
            } else if (playerBestHand.score < agentBestHand.score) {
                // AI wins the pot
                setAgentMoney(agentMoney + pot);
                setAITurnLabel(`AI wins the pot with a ${agentBestHand.handType}!`);
                setResult(`AI wins the pot with a ${agentBestHand.handType}!`);
            } else {
                // It's a tie, split the pot
                const splitPot = pot / 2;
                setPlayerMoney(playerMoney + splitPot);
                setAgentMoney(agentMoney + splitPot);
                setAITurnLabel(`It's a tie! Each player had a ${playerBestHand.handType}!`);
                setResult(`It's a tie! Each player had a ${playerBestHand.handType}!`);
            }
        }
        
        // Reset the pot to zero
        setPot(0);
        setTimeout(() => {
            setCommunityCards([]);
            setTimeout(() => {
                setTurn(0);
                fetchCommunityCards();
                fetchHoleCards();
                setActive("player");
                setAITurnLabel("Waiting on player...");
                setResult("");
            }, 1000);
        }, 1000);
    };

    const handleAIMove = async () => {
        console.log("Handling AI Move...");
        setActive("ai");
        setAITurnLabel("Thinking...");
        
        let agentMoveData;
        if (turn !== 0) {
            agentMoveData = await fetchAgentMove(); // Wait for fetchAgentMove to complete
            const { move, raise } = agentMoveData;
            console.log("Agent move was: " + move + " and the bet was: " + raise);
            
            setTimeout(() => {
                setAITurnLabel("Agent move was: " + move + " and the bet was: " + raise);
                if (move === 'fold') {
                    setAgentFolded(true);
                    setTurn(6);
                } else {
                    setTimeout(() => {
                        setAgentMoney(prevAgentMoney => prevAgentMoney - raise);
                        setPot(prevPot => prevPot + raise); // Use functional update to ensure correct state
                        setAITurnLabel("Waiting on Player...");
                        setActive("player");
                        
                        if (turn === 0) {
                            setTurn(3);
                        } else {
                            setTurn(prevTurn => prevTurn + 1); // Increment turn after AI's move
                        }
                    }, 1000);
                }
            }, 1000);
        } else {
            setTimeout(() => {
                console.log("Agent move was: " + agentMove + " and the bet was: " + agentBet);
                setAITurnLabel("Agent move was: " + agentMove + " and the bet was: " + agentBet);
                if (agentMove === 'fold') {
                    setAgentFolded(true);
                    setTurn(6);
                } else {
                    setTimeout(() => {
                        setAgentMoney(prevAgentMoney => prevAgentMoney - agentBet);
                        setPot(prevPot => prevPot + agentBet); // Use functional update to ensure correct state
                        setAITurnLabel("Waiting on Player...");
                        setActive("player");
                        
                        if (turn === 0) {
                            setTurn(3);
                        } else {
                            setTurn(prevTurn => prevTurn + 1); // Increment turn after AI's move
                        }
                    }, 1000);
                }
            }, 1000);
        }
    };
    
    const handlePlayerMove = (action, bet) => {
        setPlayerBet(bet);
        setPlayerMove(action);
        if (action === 'fold') {
            setPlayerFolded(true);
            setTurn(6);
        } else {
            console.log('Player move was:' + action + " and the bet was: " + bet);
            setTimeout(() => {
                setPlayerMoney(prevPlayerMoney => prevPlayerMoney - bet);
                setPot(prevPot => prevPot + bet); // Use functional update to ensure correct state
                handleAIMove();
            }, 1000);
        }
    };
    
    useEffect(() => {
        console.log("TURN CHANGED: " + turn)
        if (turn >= 1 && turn <= 5 && communityCards.length > 0) {
            // Flip community cards for each turn from 1 to current turn
            let updatedCommunityCards = [...communityCards];
            for (let i = 0; i < turn; i++) {
                // Modify properties of the array
                updatedCommunityCards[i].flipped = false;
            }
            
            // Update state with the modified array
            setCommunityCards(updatedCommunityCards);
            
        } else if (turn === 6) {
            // Unflip all community cards when turn is 6 and evaluate the game
            const updatedCommunityCards = [...communityCards];
            // reveal all community cards
            updatedCommunityCards.forEach((card) => {
                card.flipped = false;
            });
            //reveal all agent cards
            const revealedAgentCards = [...agentCards];
            agentCards.forEach((card) => {
                card.flipped = false;
            });

            setAgentCards(revealedAgentCards);
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
                <GameState currentPlayer={active} currentPot={pot} result = {result}></GameState>
                <div className="poker-table">
                    <AgentConsole turnLabel={AITurnLabel} agentMoney = {agentMoney}></AgentConsole>
                    <Hand hand={agentCards}></Hand>
                    <div className='community-cards'>
                        <Hand hand={communityCards}></Hand>
                        <img width={320} src={Deck} alt="Deck"></img>
                    </div>
                    <Hand hand={playerCards}></Hand>
                    <PlayerConsole onPlayerMove={handlePlayerMove} enabled={active === "player"}
                                    funds = {playerMoney} minBet = {minimumBet}
                    ></PlayerConsole>
                </div>
            </div></>
    );
}

export default PokerGame;
