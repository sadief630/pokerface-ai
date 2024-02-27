from flask import Flask
import pydealer as dealer
from pydealer.const import POKER_RANKS
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes in your Flask app

@app.route("/", methods=["GET"])
def home():
    return "The backend is running for your poker game!"

@app.route("/welcome", methods=["GET"])
def welcome():
    return "Welcome!"

@app.route("/gethand", methods=["GET"])
def gethand():
    deck = dealer.Deck()
    deck.ranks = POKER_RANKS
    deck.shuffle()
    hand = deck.deal(7)
    hand.sort()
    list = []
    for card in hand:
        list.append(str(card))
    return list

if (__name__ == "__main__"):
    app.run()