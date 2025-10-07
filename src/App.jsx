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
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [wallet, setWallet] = useState(500);
  const [bet, setBet] = useState(0);
  const [hasBet, setHasBet] = useState(false);



  // Start game on load
  useEffect(() => {
    startGame();
  }, []);

  async function startGame() {
    if (bet === 0) {
      setMessage("Please place a bet first!");
      return;
    
    }
    const deck = await newDeck();
    setDeckId(deck.deck_id);

    const drawRes = await draw(deck.deck_id, 4);
    const [p1, d1, p2, d2] = drawRes.cards;
    setPlayerHand([p1, p2]);
    setDealerHand([d1, d2]);
    setGameOver(false);
    setMessage('');
    setPlayerStands(false);
    setHasBet(true);
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
      setLosses(prev => prev + 1);
      setWallet(prev => prev - bet);
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
      setWins(prev => prev + 1);
      setWallet(prev => prev + bet);
    } else if (dealerScore > playerScore) {
        result = 'Dealer wins.';
        setLosses(prev => prev + 1);
        setWallet(prev => prev - bet);
    } else if (dealerScore < playerScore) {
        result = 'You win!';
        setWins(prev => prev + 1);
        setWallet(prev => prev + bet);
    } else {
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
      const isRed = card.suit == "HEARTS" || card.suit === "DIAMONDS";
      return (
        <div
          key={card.code}
          style={{
            display: "inline-block",
            padding: "10px 12px",
            marginRight: "8px",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "20px",
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
            fontSize: "20px",
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
      <div
        style={{
          padding: '20px',
          fontFamily: "'Bebas Neue', sans-serif",
          display: 'flex',
          gap: '40px',
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1>&#9824; &#9829; Blackjack Game &#9830; &#9827;</h1>
    
          <div>
            <h2>Dealer's Hand ({dealerHandValue(dealerHand, gameOver)})</h2>
            <div>{renderDealerHand(dealerHand)}</div>
          </div>
    
          <div>
            <h2>Your Hand ({handValue(playerHand)})</h2>
            <div>{renderHand(playerHand)}</div>
          </div>

          <div style={{ marginTop: "20px"}}>
            {!hasBet ? (
              <>
                <p>Place your bet to start the game!</p>
                <button 
                  onClick={() => { setBet(25); startGame(); }} 
                  disabled={wallet < 25}

                  style={{
                    backgroundColor: wallet < 25 ? "gray" : "green",
                    color: "white",
                    marginRight: "10px",
                    cursor: wallet < 25 ? "not-allowed" : "pointer"
                  }}
                  >$25
                </button>
                <button 
                  onClick={() => { setBet(100); startGame(); }}
                  disabled={wallet < 100}
                  style={{
                    backgroundColor: wallet < 100 ? "gray" : "black",
                    color: "white",
                    marginRight: "10px",
                    cursor: wallet < 100 ? "not-allowed" : "pointer"
                  }}
                  >$100
                </button>
                <button 
                  onClick={() => { setBet(500); startGame(); }}
                  disabled={wallet < 500}
                  style={{
                    backgroundColor: wallet < 500 ? "gray" : "purple",
                    color: "white",
                    marginRight: "10px",
                    cursor: wallet < 500 ? "not-allowed" : "pointer"
                  }}
                  >$500
                </button>
                <button 
                  onClick={() => { setBet(wallet); startGame(); }}
                  style={{
                    backgroundColor: "Gold",
                    color: "white",
                    marginRight: "10px",
                  }}
                  >All in!
                </button>
              </>
            ) : (
              <>
                {!gameOver && (
                  <>
                    <button onClick={handleHit}>Hit</button>
                    <button onClick={handleStand} style={{ marginLeft: '10px' }}>
                      Stand
                    </button>
                  </>
                )}
                <button onClick={() => { setHasBet(false); setBet(0); }}>
                  Restart Game
                </button>
              </>
            )}
          </div>
    
          {message && <h2 style={{ marginTop: '20px' }}>{message}</h2>}

          <div style={{ marginTop: "20px"}}>
            <h2>Scoreboard</h2>
            <div style={{ marginTop: "20px", display: 'grid', gridTemplateColumns: "repeat(3, auto)"}}>
            <p style={{ fontSize: "24px", fontWeight: "bold", color: "green" }}>
              Wins: {wins}
            </p>
            <p style={{ fontSize: "24px", fontWeight: "bold", color: "red" }}>
              Losses: {losses}
            </p>
            <p style={{ fontSize: "26px", fontWeight: "bold", color: "blue" }}>
               Money: ${wallet}
            </p>
            </div>

            {wallet <= 0 && (
              <button
                onClick={() => {
                  setWallet(500);   
                  setWins(0);       
                  setLosses(0);     
                  setMessage("");
                  setHasBet(false);
                  setGameOver(false);
              }}
      style={{
        marginTop: "10px",
        padding: "10px 20px",
        backgroundColor: "gold",
        fontWeight: "bold",
        borderRadius: "6px"
      }}
    >
      Reset Money
    </button>
  )}
          </div>
        </div>
        <div>
          <img
            src="https://pngimg.com/uploads/cards/cards_PNG8490.png"
            alt="Cards"
            style={{
              width: '500px', 
              height: 'auto',
            }}
          />
        </div>
      </div>
    );
}

export default App;