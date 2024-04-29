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
    const [currentMinimumBet, setCurrentMinimumBet] = useState(20);

    // agent variables
    const [agentCards, setAgentCards] = useState([]);
    const [AITurnLabel, setAITurnLabel] = useState("Waiting on player...")
    const [agentMoney, setAgentMoney] = useState(1000)
    const [agentMove, setAgentMove] = useState(null)
    const [agentBet, setAgentBet] = useState(null)
    const [agentFolded, setAgentFolded] = useState(false);

    const [blindsPosted, setBlindsPosted] = useState(false);

    // player variables
    const [playerCards, setPlayerCards] = useState([]);
    const [playerMoney, setPlayerMoney] = useState(1000);
    const [playerMove, setPlayerMove] = useState(null);
    const [playerBet, setPlayerBet] = useState(null);
    const [playerFolded, setPlayerFolded] = useState(false);

    const [playerPreviousBet, setPlayerPreviousBet] = useState(0);
    const [agentPreviousBet, setAgentPreviousBet] = useState(0);

    const [playAgainVisible, setPlayAgainVisible] = useState(false);

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
                setBlindsPosted(false);
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

    const fetchFirstAgentMove = async (bet) => {
        
            try {
                const response = await fetch('http://127.0.0.1:8000/get_first_agent_move', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        agentCards: agentCards,
                        minimumBet: (bet >= 20 ? bet : 20), // players must match big blind or fold
                        funds : agentMoney
                    }),
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log("Agent Move Response:", data);
                const { move, raise } = data;
                return { move, raise };
            } catch (error) {
                console.error('Error fetching agent move:', error);
            }
        
    };

    const fetchAgentMove = async (bet) => {
      
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
                        minimumBet: (bet > 0 ? (bet - agentPreviousBet) : 0), // players can bet nothing if nothing was bet before (check)
                        currentFunds : agentMoney
                    }),
                });
                if (!response.ok) {
                    const errorMessage = await response.text(); // Get the detailed error message
                    throw new Error(`Network response was not ok. Error message: ${errorMessage}`);
                }
                const data = await response.json();
                console.log("Agent Move Response:", data);
                const { move, raise } = data;
                return { move, raise };
            } catch (error) {
                console.error('Error fetching agent move:', error);
            }
        
    };

    const handleStartGame = () => {
        startGame();
        fetchHoleCards();
        fetchCommunityCards();
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



     // Reset the game when "Play again?" is clicked
     const handlePlayAgain = async () => {
        setPlayAgainVisible(false);
        setPot(0);
        setCommunityCards([]);
        setAgentPreviousBet(0);
        setPlayerPreviousBet(0);
        setTurn(0);
        fetchCommunityCards();
        fetchHoleCards();
        setActive("player");
        setAITurnLabel("Waiting on player...");
        setResult("");
    };

    const playAgainButton = playAgainVisible && (
        <button className="playAgainButton" onClick={handlePlayAgain}>
            <div style={{ marginBottom: "10px" }}>
                <strong>{result}</strong>
            </div>
            <div style={{ textDecoration: "underline" }}>
                Play again?
            </div>
        </button>
    );

    const evaluateGame = async () => {
        console.log("Game Evaluation: A player folded or all of the cards are flipped.");
        setActive(null);
        const playerBestHand = await calculateBestHand(playerCards, communityCards);
        const agentBestHand = await calculateBestHand(agentCards, communityCards);
        console.log("AGENT HAND: " + JSON.stringify(agentBestHand));
        console.log("PLAYER HAND: " + JSON.stringify(playerBestHand));
        if (agentFolded) {
            setAITurnLabel(`Agent folded. Player wins the pot with a ${playerBestHand.handType}!`);
            setResult(`Agent folded. Player wins the pot with a ${playerBestHand.handType}!`)
            setPlayerMoney(playerMoney + pot);
            setAgentFolded(false)
        }
        else if (playerFolded) {
            setAITurnLabel(`Player folded. AI wins the pot with a ${agentBestHand.handType}!`);
            setResult(`Player folded. AI wins the pot with a ${agentBestHand.handType}!`)
            setAgentMoney(agentMoney + pot);
            setPlayerFolded(false)
        }
        else {
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

        setPot(0);
        setTimeout(() => {
            console.log(result)
            setPlayAgainVisible(true);
        })
    };

    const handleAIMove = async (playerAction, bet) => {
        setAITurnLabel("Thinking...");
        // helper function to handle whatever agent response is 
        const handleMoveOutcome = (move, raise) => {
            setAITurnLabel(`Agent move was: ${move} and the bet was: ${raise}`);
            console.log(`Agent move was: ${move} and the bet was: ${raise}`)
            console.log("Last player move was: " + playerAction + " and the bet was: " + bet)
            setTimeout(() => {
                if (move === 'fold') {
                    setTimeout(() => {
                        setTurn(prevTurn => 6);
                        setAgentFolded(true);
                    }, 1000);
                } else {
                    // if (move === 'call') {
                    //     // raise = raise - agentPreviousBet
                    //     setAgentMoney(prevAgentMoney => prevAgentMoney - raise);
                    //     setPot(prevPot => prevPot + raise); // Use functional update to ensure correct state
                    // } else {
                    setPot(prevPot => prevPot + raise);
                    setAgentMoney(prevAgentMoney => prevAgentMoney - raise);
                    // }
                    setAgentPreviousBet(prevRaise => raise)
                    if (move === 'call' || (move === 'check' && playerAction === 'check')) {
                        setTimeout(() => {
                            setAITurnLabel("Waiting on Player...");
                            setActive("player")
                            if (turn === 0) {
                                setTurn(prevTurn => 3);
                            } else {
                                setTurn(prevTurn => prevTurn + 1);
                            }
                        }, 1000);
                    } else {
                        setTimeout(() => {
                            setAITurnLabel("Waiting on Player...");
                            setActive("player");
                            if(move == 'raise'){
                                setCurrentMinimumBet(prevBet => raise - currentMinimumBet);
                            }
                            if(raise >= bet){
                                setCurrentMinimumBet(prevBet => raise - bet);
                            }else{
                                setCurrentMinimumBet(prevBet => raise);
                            }
                        }, 1000);
                    }
                }
            }, 2000);
        };

        // fetch agent move and call helper function
        if (turn !== 0) {
            let agentMoveData;
            agentMoveData = await fetchAgentMove(bet);
            const { move, raise } = agentMoveData;
            setAgentMove(move);
            setAgentBet(raise);
            handleMoveOutcome(move, raise);
        } else {
            let firstMoveData;
            firstMoveData = await fetchFirstAgentMove(bet); // calculate using chen strength to decrease computation time.
            const { move, raise } = firstMoveData;
            setAgentMove(move);
            setAgentBet(raise);
            handleMoveOutcome(move, raise);
        }
    };

    const handlePlayerMove = async (action, bet) => {
        setPlayerBet(bet);
        setPlayerMove(action);
        let turnTrack = turn
        if (action === 'fold') {
            setPlayerFolded(true);
            setTurn(6);
        } else {
            console.log('Player move was:' + action + " and the bet was: " + bet);
            console.log('The players previous bet was' + playerPreviousBet);
            await new Promise(resolve => {
                setTimeout(() => {
                    if (action === 'call') {
                        bet = bet - playerPreviousBet;
                        const newpot = pot + bet;
                        const newPlayerMoney = playerMoney - bet;
                        setPot(prevPot => newpot); // Use functional update to ensure correct state
                        setPlayerMoney(prevPlayerMoney => newPlayerMoney);
                    } else {
                        const newpot = pot + bet;
                        const newPlayerMoney = playerMoney - bet;
                        setPot(prevPot => newpot); // Use functional update to ensure correct state
                        setPlayerMoney(prevPlayerMoney => newPlayerMoney);
                    }
                    if (action === 'call' || (action === 'check' && agentMove === 'check')) {
                        if (turn === 0) {
                            setTurn(3);
                            turnTrack = 3
                            bet = 0;
                            action = "call";
                        } else {
                            turnTrack++
                            setTurn(prevTurn => prevTurn + 1);
                        }
                    } else if (action === 'raise') {
                        if(blindsPosted){
                            setCurrentMinimumBet(prevBet => bet - currentMinimumBet);
                        }else{
                            setCurrentMinimumBet(prevBet => bet);
                            setBlindsPosted(true);
                        }
                    }
                    if(turnTrack != 6){
                        console.log("Handling AI Move...");
                        setPlayerPreviousBet(prevPlayerBet => bet);
                        setActive(prevActive => "ai");
                    }
                    resolve(); // Resolve the promise after all state updates
                    setTimeout(() => {
                        if(action == "call"){ // future does not matter
                            action = null
                            bet = 0
                        }
                        if(turnTrack != 6){
                            handleAIMove(action, bet);
                        }
                    }, 1500); // 3 seconds delay
                }, 1000);
            });
            
        }
    };
    

    useEffect(() => {
        console.log("TURN CHANGED: " + turn)
        if(turn == 0){
            setCurrentMinimumBet(prevMinimumBet => 20)
        }else{
            setCurrentMinimumBet(prevMinimumBet => 0)
        }
       
        setAgentMove(prevMove => null)
        setPlayerMove(prevMove => null)
        setAgentBet(prevBet => 0)
        setPlayerBet(prevBet => 0)
        setAgentPreviousBet(prevBet => 0)
        setPlayerPreviousBet(prevBet => 0)

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
                <GameState currentPlayer={active} currentPot={pot} result={result} currentMinBet={currentMinimumBet}></GameState>
                <div className="poker-table">
                <div>
            {playAgainButton}
            // Render the rest of your Poker game UI here...
        </div>
                    <AgentConsole turnLabel={AITurnLabel} agentMoney={agentMoney}></AgentConsole>
                    <Hand hand={agentCards}></Hand>
                    <div className='community-cards'>
                        <Hand hand={communityCards}></Hand>
                        <img width={320} src={Deck} alt="Deck"></img>
                    </div>
                    <Hand hand={playerCards}></Hand>
                    <PlayerConsole onPlayerMove={handlePlayerMove} enabled={active === "player"}
                        funds={playerMoney} minBet={currentMinimumBet}
                    ></PlayerConsole>
                </div>
            </div></>
    );
}

export default PokerGame;
