from flask import Flask, jsonify, request
import pydealer as dealer
from pydealer.const import POKER_RANKS
from flask_cors import CORS
from collections import Counter
from itertools import combinations

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes in your Flask app

# Initialize the deck variable outside of routes
deck = None
playerMoney = 1000
agentMoney = 1000
minimumBet = 20

def get_deck():
    global deck
    deck = dealer.Deck(rebuild = True)
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

# hand_ranking_scores = {
#     "Royal Flush": 10,
#     "Straight Flush": 9,
#     "Four of a Kind": 8,
#     "Full House": 7,
#     "Flush": 6,
#     "Straight": 5,
#     "Three of a Kind": 4,
#     "Two Pair": 3,
#     "One Pair": 2,
#     "High Card": 1
# }

def evaluate_potential(current_potential, hand, remaining_deck_set):
    num_unflipped_community_cards = 7 - len(hand)
    potential = 0
    if num_unflipped_community_cards == 0:
        return potential
    possible_future_community_cards = list(combinations(remaining_deck_set, num_unflipped_community_cards))
    for combination in possible_future_community_cards:
        combination_set = [
            {"suit": suit, "value": value}
            for suit, value in combination
        ]
        score = evaluate_hand(combination_set, hand)
        score = score.get("score", 0)  # Ensure score exists
        num_remaining = len(remaining_deck_set) - num_unflipped_community_cards
        if(num_unflipped_community_cards == 1):
            if score > current_potential:
                potential += score / (num_remaining)
        elif(num_unflipped_community_cards == 2):
            if score > current_potential:
                potential += score / (num_remaining * num_remaining)
 
    print(hand)
    print("the potential of this hand is : " + str(potential))
    return potential

# However, since there are more cards to come on the flop and turn, the present strength of a hand is insufficient information. 
# For this reason, post-flop hand evaluation is broken into two parts: strength and potential.
def agent_win_probability(agent_cards, visible_cards):
    full_deck = [
        {"suit": "Hearts", "value": i} for i in range(2, 15)
    ] + [{"suit": "Diamonds", "value": i} for i in range(2, 15)
    ] + [{"suit": "Clubs", "value": i} for i in range(2, 15)
    ] + [{"suit": "Spades", "value": i} for i in range(2, 15)]
    # Convert agent and visible cards to sets of tuples for easy removal
    agent_cards_set = set((card["suit"], card["value"]) for card in agent_cards)
    visible_cards_set = set((card["suit"], card["value"]) for card in visible_cards)
    # Remove agent's and visible community cards from the full deck
    remaining_deck_set = set((card["suit"], card["value"]) for card in full_deck) - agent_cards_set - visible_cards_set
    # Generate all possible opponent hands (two-card combinations)
    possible_opponent_hands = list(combinations(remaining_deck_set, 2))
    
    # Initialize counts for hands better, equal to, and worse than the agent's hand
    better_hands_count = 0
    equal_hands_count = 0
    worse_hands_count = 0
    
    # Evaluate agent's current hand strength
    agent_hand_strength = evaluate_hand(agent_cards, visible_cards) # example return {"score": hand_ranking_scores["Four of a Kind"], "handType": "Four of a Kind"}
    agent_hand_strength = agent_hand_strength["score"]

    agent_hand_potential = evaluate_potential(agent_hand_strength, agent_cards + visible_cards, remaining_deck_set)
    agent_hand_strength = agent_hand_strength + agent_hand_potential

    # Evaluate each possible current opponent hand strength
    for opponent_hand in possible_opponent_hands:
        opponent_hand_dict_list = [
            {"suit": suit, "value": value}
            for suit, value in opponent_hand
        ]
        opponent_best_hand = evaluate_hand(opponent_hand_dict_list, visible_cards)
        opponent_best_hand = opponent_best_hand["score"]
        # Compare agent's hand to opponent's hand
        if agent_hand_strength > opponent_best_hand:
            worse_hands_count += 1
        elif agent_hand_strength < opponent_best_hand:
            better_hands_count += 1
        else:
            equal_hands_count += 1

    print("AGENT HAND")
    print(agent_cards + visible_cards)
    print("AGENT HAND POTENTIAL")
    print(agent_hand_potential)
    print("AGENT HAND STRENGTH")
    print(agent_hand_strength)
    print("WORSE HANDS")
    print(worse_hands_count)
    print("BETTER HANDS")
    print(better_hands_count)
    print("EQUAL HANDS")
    print(equal_hands_count)
    
    # Calculate hand strength (probability that the agent's hand is the strongest)
    total_opponent_hands = len(possible_opponent_hands)
    hand_strength = (
        (worse_hands_count + 0.5 * equal_hands_count) / total_opponent_hands
    )
    return hand_strength

@app.route("/get_agent_move", methods=["POST"])
def get_agent_move():
    global minimumBet
    data = request.get_json()
    # Get the agent's hole cards and the community cards from the request
    agent_cards = list(data.get('agentCards'))  # E.g., [{suit: "Diamonds", value: 14}, {suit: "Spades", value: 2}]
    visible_cards = data.get('visibleCards')  # E.g., [{suit: "Diamonds", value: 14}, {suit: "Spades", value: 2}, {suit: "Clubs", value: 7}]
    # Validate the input data
    if not agent_cards or not visible_cards:
        return jsonify({"error": "Invalid input data"}), 400
    # Calculate hand strength
    hand_strength = agent_win_probability(agent_cards, visible_cards)
    # Determine the move based on hand strength
    move = "fold"  # Default move
    amountRaised = 0
    # Probability Decisions for moves 
    if hand_strength > 0.7:
        move = "raise"
        amountRaised = hand_strength * 40 + minimumBet
    elif hand_strength >= 0.5:
        move = "call"
        amountRaised = minimumBet
    return jsonify({"move": move, "raise": round(amountRaised)})

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
    elif(agent_hole_strength >= 7):
        agent_move = "raise"
        agent_bet = (agent_hole_strength / 2.2) * 10
    elif(agent_hole_strength >= 2.5):
        agent_move = "call"
        agent_bet = minimum_bet
    else:
        agent_move = "fold"
        agent_bet = 0

    agent_bet = round(agent_bet)
    player_hole = deck.deal(2)
    player_hole.sort()
    player_hole_list = serialize_cards(player_hole, 0)

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

def evaluate_hand(hand, community_cards):
    # Combine hand and community cards
    all_cards = list(hand) + community_cards
    # Define the hand ranking scores
    hand_ranking_scores = {
        "Royal Flush": 10,
        "Straight Flush": 9,
        "Four of a Kind": 8,
        "Full House": 7,
        "Flush": 6,
        "Straight": 5,
        "Three of a Kind": 4,
        "Two Pair": 3,
        "One Pair": 2,
        "High Card": 1
    }


    print(all_cards)
    # Check each hand type in descending order of ranking
    if check_royal_flush(all_cards):
        return {"score": hand_ranking_scores["Royal Flush"], "handType": "Royal Flush"}
    elif check_straight_flush(all_cards):
        return {"score": hand_ranking_scores["Straight Flush"] + determine_straight_flush_value(all_cards), "handType": "Straight Flush"}
    elif check_four_of_a_kind(all_cards):
        return {"score": hand_ranking_scores["Four of a Kind"] + determine_four_of_a_kind_value(all_cards), "handType": "Four of a Kind"}
    elif check_full_house(all_cards):
        return {"score": hand_ranking_scores["Full House"] + determine_full_house_value(all_cards), "handType": "Full House"}
    elif check_flush(all_cards):
        return {"score": hand_ranking_scores["Flush"] + determine_flush_value(all_cards), "handType": "Flush"}
    elif check_straight(all_cards):
        return {"score": hand_ranking_scores["Straight"] + determine_straight_value(all_cards), "handType": "Straight"}
    elif check_three_of_a_kind(all_cards):
        return {"score": hand_ranking_scores["Three of a Kind"] + determine_three_of_a_kind_value(all_cards), "handType": "Three of a Kind"}
    elif check_two_pair(all_cards):
        return {"score": hand_ranking_scores["Two Pair"] + determine_two_pair_value(all_cards), "handType": "Two Pair"}
    elif check_one_pair(all_cards):
        return {"score": hand_ranking_scores["One Pair"] + determine_pair_value(all_cards), "handType": "One Pair"}
    else:
        return {"score": hand_ranking_scores["High Card"], "handType": "High Card"}

def check_royal_flush(cards):
    # Check for royal flush: A, K, Q, J, 10 all of the same suit.
    for suit in ['Hearts', 'Diamonds', 'Clubs', 'Spades']:
        suited_cards = [card['value'] for card in cards if card['suit'] == suit]
        if set([14, 13, 12, 11, 10]).issubset(suited_cards):
            return True
    return False

def check_straight_flush(cards):
    # Check for straight flush: Five consecutive cards all of the same suit.
    flag = False
    for suit in ['Hearts', 'Diamonds', 'Clubs', 'Spades']:
        suited_cards = [card for card in cards if card['suit'] == suit]
        if(flag != True):
            flag = check_straight(suited_cards)
    return flag

def determine_straight_flush_value(cards):
    suit_counts = Counter(card['suit'] for card in cards)
    suited_cards = suited_cards = [card for card in cards if card['suit'] == suit_counts.most_common()[0][0]]
    values = sorted(set(card['value'] for card in suited_cards))
    start = 0
    prevVal = -1
    numConsecutive = 0

    for i in range(len(values)-1):
        if(i != 0 and numConsecutive != 5):
            if(prevVal - values[i] == 1):
                numConsecutive += 1
            else:
                numConsecutive = 0
                start = i
        prevVal = values[i]
    
    return float(values[start]) / 100

def check_four_of_a_kind(cards):
   # """Check for four of a kind: Four cards of the same rank."""
    value_counts = Counter(card['value'] for card in cards)
    return 4 in value_counts.values()

def determine_four_of_a_kind_value(cards):
    # Determines the value of the pair that you have
    value_counts = Counter(card['value'] for card in cards)
    pairNumber = value_counts.most_common()[0]
    additionalPoints = float(pairNumber[0]) / 100
    return additionalPoints

def check_full_house(cards):
  #  """Check for full house: Three cards of one rank and two cards of another rank."""
    value_counts = Counter(card['value'] for card in cards)
    return set(value_counts.values()) == {3, 2}

def determine_full_house_value(player_cards):
    value_counts = Counter(card['value'] for card in player_cards)
    strongest_triplet = max(value_counts, key=lambda x: (value_counts[x], x))
    full_house_value = float(strongest_triplet) / 100
    
    return full_house_value

def check_flush(cards):
  #  """Check for flush: Five cards of the same suit."""
    suits = [card['suit'] for card in cards]
    suit_counts = Counter(suits)
    return any(count >= 5 for count in suit_counts.values())

def determine_flush_value(playerHand, winningSuit):
    suited_cards = [card['value'] for card in playerHand if card['suit'] == winningSuit]
    max_value = max(suited_cards)
    return float(max_value) / 100

def check_straight(cards):
  #  """Check for straight: Five consecutive cards of different suits."""
    values = sorted(set(card['value'] for card in cards))

    misses = 0
    numConsecutive = 1

    for i in range(len(values) - 1):
        if(numConsecutive < 5):
            if values[i] - values[i + 1] != -1:
                misses += 1
                numConsecutive = 1
            else:
                numConsecutive += 1

    return misses < 2 and numConsecutive >= 5

def determine_straight_value(cards):
    values = sorted(set(card['value'] for card in cards), reverse=True)
    start = 0
    prevVal = -1
    numConsecutive = 0

    for i in range(len(values)-1):
        if(i != 0 and numConsecutive != 5):
            if(prevVal - values[i] == 1):
                numConsecutive += 1
            else:
                numConsecutive = 0
                start = i
        prevVal = values[i]
    
    return float(values[start]) / 100

def check_three_of_a_kind(cards):
  #  """Check for three of a kind: Three cards of the same rank."""
    value_counts = Counter(card['value'] for card in cards)
    return 3 in value_counts.values()

def determine_three_of_a_kind_value(cards):
    value_counts = Counter(card['value'] for card in cards)
    tripletNumber = value_counts.most_common()[0]
    additionalPoints = float(tripletNumber[0]) / 100
    return additionalPoints

def check_two_pair(cards):
 #   """Check for two pairs: Two cards of one rank and two cards of another rank."""
    value_counts = Counter(card['value'] for card in cards)
    pairs = sum(1 for count in value_counts.values() if count == 2)
    return pairs >= 2

def determine_two_pair_value(cards):
    value_counts = Counter(card['value'] for card in cards)
    pairs = value_counts.most_common()
    topPair = max(pairs[0][0], pairs[1][0])
    topPairValue = float(topPair) / 100
    return topPairValue

def check_one_pair(cards):
  #  """Check for one pair: Two cards of the same rank."""
    value_counts = Counter(card['value'] for card in cards)
    return 2 in value_counts.values()

def determine_pair_value(cards):
    # Determiens the value of the pair that you have
    value_counts = Counter(card['value'] for card in cards)
    pairNumber = value_counts.most_common()[0]
    additionalPoints = float(pairNumber[0]) / 100
    return additionalPoints

@app.route("/evaluatehand", methods=["POST"])
def evaluatehand():
    # Parse the incoming JSON data from the request body
    data = request.get_json()
    # Extract the hand and community cards from the data
    hand = data.get('hand')
    community_cards = data.get('communityCards')

    print(hand)
    print(community_cards)
    # Validate that the input data is present and correct
    if hand is None or community_cards is None:
        return jsonify({"error": "Invalid input data"}), 400
    # Return the hand score as a JSON response
    result = evaluate_hand(hand, community_cards)

    print(result) 
    return jsonify(result)

if __name__ == "__main__":
    app.run(port=8000)
