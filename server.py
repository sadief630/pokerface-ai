from flask import Flask
import pydealer as dealer
from pydealer.const import POKER_RANKS

app = Flask(__name__)

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
    return str(hand)

if (__name__ == "__main__"):
    app.run()