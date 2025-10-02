const BASE = 'https://deckofcardsapi.com/api/deck'

export async function newDeck() {
  const res = await fetch(`${BASE}/new/shuffle/?deck_count=1`)
  return res.json()
}

export async function draw(deckId, count = 1) {
  const res = await fetch(`${BASE}/${deckId}/draw/?count=${count}`)
  return res.json()
}

// not needed?
// helper to calculate card value for Blackjack
export function cardValue(card) {
  const val = card.value
  if (val === 'ACE') return 11
  if (['KING', 'QUEEN', 'JACK'].includes(val)) return 10
  return parseInt(val, 10)
}

export function handValue(cards) {
  let total = 0
  let aces = 0
  for (const c of cards) {
    const v = cardValue(c)
    if (v === 11) aces += 1
    total += v
  }
  // reduce aces from 11 -> 1 as needed
  while (total > 21 && aces > 0) {
    total -= 10
    aces -= 1
  }
  return total
}

// useful for more than 1 deck and multiple rounds
// instead of recreating a new deck each time
export async function shuffleDeck(deckId) {
  const res = await fetch(`${BASE}/${deckId}/shuffle/`)
  return res.json()
}
