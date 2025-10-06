import React, { useEffect, useState } from 'react';
import { newDeck, draw, handValue, dealerHandValue, isBlackjack } from './api'; // uses your existing api.js
import './index.css';

function App() {
  const [deckId, setDeckId] = useState(null);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [playerStands, setPlayerStands] = useState(false);

  // Start game on load
  useEffect(() => {
    startGame();
  }, []);

  async function startGame() {
    const deck = await newDeck();
    setDeckId(deck.deck_id);

    const drawRes = await draw(deck.deck_id, 4);
    const [p1, d1, p2, d2] = drawRes.cards;
    setPlayerHand([p1, p2]);
    setDealerHand([d1, d2]);
    setGameOver(false);
    setMessage('');
    setPlayerStands(false);
    
    // Check for immediate blackjack
    if (isBlackjack([p1, p2]) && !isBlackjack([d1, d2])) {
      setMessage('You have Blackjack! You win!');
      setGameOver(true);
    } else if (isBlackjack([d1, d2]) && !isBlackjack([p1, p2])) {
      setMessage('Dealer has Blackjack! Dealer wins.');
      setGameOver(true);
    } else if (isBlackjack([p1, p2]) && isBlackjack([d1, d2])) {
      setMessage('Both have Blackjack! Push (tie).');
      setGameOver(true);
    }
  }

  const handleHit = async () => {
    if (gameOver || playerStands) return;

    //just uses a newHand instead of the piles --> Could be better for larger decks
    // draws a card, adds to player hand, checks for bust
    const res = await draw(deckId, 1);
    const newCard = res.cards[0];
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);

    if (handValue(newHand) > 21) {
      setMessage('You bust! Dealer wins.');
      setGameOver(true);
    }
  };

  const handleStand = async () => {
    setPlayerStands(true);
    let dealerCards = [...dealerHand];

    // Better to stand on 17s or higher for dealer
    while (handValue(dealerCards) < 17) {
      const res = await draw(deckId, 1);
      dealerCards.push(res.cards[0]);
    }

    setDealerHand(dealerCards);

    const playerScore = handValue(playerHand);
    const dealerScore = handValue(dealerCards);

    //calculates game state --> who wins after a certain condition is met
    // might be a better way to structure this (switch case ?)
    let result = '';

    // doesn't handle 5 card charlie or blackjack
    if (dealerScore > 21) {
      result = 'Dealer busts! You win!';
    } 
    else if (dealerScore > playerScore) {
      result = 'Dealer wins.';
    } 
    else if (dealerScore < playerScore) {
      result = 'You win!';
    } 
    else {
      result = 'Push (tie).';
    }

    setMessage(result);
    setGameOver(true);
  };
  //stores suit symbols. Able to be accessed for display purposes
  const suitSymbols = {
    SPADES: "♠",
    HEARTS: "♥",
    DIAMONDS: "♦",
    CLUBS: "♣",
  };

  //renders hand display. For UI purposes
  const renderHand = (hand) =>
    hand.map((card) => {
      const isRed = card.suit === "HEARTS" || card.suit === "DIAMONDS";
      return (
        <div
          key={card.code}
          style={{
            display: "inline-block",
            padding: "10px 12px",
            marginRight: "8px",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "16px",
            color: isRed ? "red" : "black",
            backgroundColor: isRed ? "#ffe6e6" : "#e6e6e6",
            textAlign: "center",
            minWidth: "40px",
          }}
        >
          {suitSymbols[card.suit]} {card.value} {suitSymbols[card.suit]}
        </div>
      );
    });

    const renderDealerHand = (hand) =>
    hand.map((card, index) => {
      const isRed = card.suit === "HEARTS" || card.suit === "DIAMONDS";
      return (
        <div
          key={card.code}
          style={{
            display: "inline-block",
            padding: "10px 12px",
            marginRight: "8px",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "16px",
            color: isRed ? "red" : "black",
            backgroundColor: isRed ? "#ffe6e6" : "#e6e6e6",
            textAlign: "center",
            minWidth: "40px",
          }}
        >
        {(index === 1 && !gameOver)
          ? 'Hidden'
          : (
            <>
              {suitSymbols[card.suit]} {card.value} {suitSymbols[card.suit]}
            </>
          )}
      </div>
    )});


  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>&#9824; &#9829; Blackjack Game &#9830; &#9827;</h1>

      <div>
        <h2>Dealer's Hand ({dealerHandValue(dealerHand, gameOver)})</h2>
        <div style={{ display: 'flex' }}>{renderDealerHand(dealerHand)}</div>
      </div>

      <div>
        <h2>Your Hand ({handValue(playerHand)})</h2>
        <div style={{ display: 'flex' }}>{renderHand(playerHand)}</div>
      </div>

      <div style={{ marginTop: '20px' }}>
        {!gameOver && (
          <>
            <button onClick={handleHit}>Hit</button>
            <button onClick={handleStand} style={{ marginLeft: '10px' }}>
              Stand
            </button>
          </>
        )}
        <button onClick={startGame} style={{ marginLeft: '10px' }}>
          Restart Game
        </button>
      </div>

      {message && <h3 style={{ marginTop: '20px' }}>{message}</h3>}
    </div>
  );
}

export default App;
