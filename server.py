from flask import Flask, jsonify
import pydealer as dealer
from pydealer.const import POKER_RANKS
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes in your Flask app

# Initialize the deck variable outside of routes
deck = None
playerMoney = 1000
agentMoney = 1000


def get_deck():
    global deck
    deck = dealer.Deck()
    deck.ranks = POKER_RANKS
    deck.shuffle()

def init_money():
    global playerMoney
    global agentMoney
    playerMoney = 1000
    agentMoney = 1000


def getCardNum(card):
    if(card.value == "Ace"):
        num = 14
    elif(card.value == "King"):
        num = 13
    elif(card.value == "Queen"):
        num = 12
    elif(card.value == "Jack"):
        num = 11
    else:
        num = (int)(card.value)
    return num

def serialize_cards(hand, flipCount):
    hand_list = []
    for card in hand:
        result = {}
        value = getCardNum(card)
        suit = card.suit
        result["value"] = value
        result["suit"] = suit
        result["flipped"] = flipCount > 0
        flipCount-=1
        hand_list.append(result)
    return hand_list
        
@app.route("/", methods=["GET"])
def home():
    return "The backend is running for your poker game!"


# Chen formula
def chen_strength(cards):
    cardOne = cards[0]
    cardTwo = cards[1]
    score = 0
    cardOneNum = getCardNum(cardOne)
    cardTwoNum = getCardNum(cardTwo)
    highestCard = cardOne
    if(cardTwo > cardOne):
        highestCard = cardTwo
    val = highestCard.value
    if(val == "Ace"):
        score += 10
    elif(val == "King"):
        score += 8
    elif(val == "Queen"):
        score += 7
    elif(val == "Jack"):
        score += 6
    else:
        score += int(val)/2

    if(cardOne.value == 5 and cardTwo.value == 5):
        score = 6
    elif(cardOne.value == cardTwo.value):
        score *= 2
        if score < 5:
            score = 5

    if(cardOne.suit == cardTwo.suit):
        score += 2

    diff = abs(cardTwoNum - cardOneNum) - 1
    if(diff == 0):
        score += 1
    if(diff == 1):
        score -=1
        if(getCardNum(highestCard) < 12): # Add an extra point if connected or 1-gap and your highest card is lower than Q (since you then can make all higher straights)
            score += 1
    if(diff == 2):
        score -=2
    if(diff == 3):
        score -=4
    if(diff > 3):
        score -= 5
    return score

@app.route("/start", methods=["GET"])
def start():
    get_deck()
    init_money()
    return jsonify(message="deck created", deck=str(deck))

@app.route("/holecards", methods=["GET"])
def holecards():
    # if deck is None:
    #    get_deck()
    get_deck()
    global playerMoney
    global agentMoney

    agent_bet = 0
    minimum_bet = 20

    agent_hole = deck.deal(2) 
    agent_hole.sort()
    agent_hole_list = serialize_cards(agent_hole, 2)
    agent_hole_strength = chen_strength(agent_hole)

    if(agent_hole_strength >= 10):
        agent_bet = (agent_hole_strength / 1.5) * 15
        agent_move = "raise"
    elif(agent_hole_strength >= 8):
        agent_move = "raise"
        agent_bet = (agent_hole_strength / 2.2) * 10
    elif(agent_hole_strength >= 4):
        agent_move = "call"
        agent_bet = minimum_bet
    else:
        agent_move = "fold"
        agent_bet = 0

    agent_bet = round(agent_bet)
    player_hole = deck.deal(2)
    player_hole.sort()
    player_hole_list = serialize_cards(player_hole, 0)

    agentMoney = agentMoney - agent_bet

    return jsonify(
        agent_hole = agent_hole_list,
        agent_hole_strength = agent_hole_strength,
        player_hole = player_hole_list,
        agent_move = agent_move,
        agent_bet = agent_bet,
        agent_money = agentMoney
    )


@app.route("/communitycards", methods=["GET"])
def communitycards():
    if deck is None:
        get_deck()
    community_cards = deck.deal(5)
    return jsonify(
        community_cards = serialize_cards(community_cards, 5)
    )

if __name__ == "__main__":
    app.run()
