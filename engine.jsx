// engine.jsx — Blackjack rules engine (plain functions on window)
// Pure logic: shoe, hand value, blackjack/bust detection, simple basic-strategy hints.

const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const SUITS = ['spade','heart','diam','club']; // glyphs resolved in cards.jsx
const RED_SUITS = ['heart','diam'];

let _uid = 1;
function makeCard(rank, suit) {
  return { rank, suit, id: 'c' + (_uid++) };
}

// Build a shuffled multi-deck shoe.
function makeShoe(numDecks = 6) {
  const cards = [];
  for (let d = 0; d < numDecks; d++) {
    for (const r of RANKS) for (const s of SUITS) cards.push(makeCard(r, s));
  }
  // Fisher–Yates
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function cardValue(rank) {
  if (rank === 'A') return 11;
  if (rank === 'K' || rank === 'Q' || rank === 'J') return 10;
  return parseInt(rank, 10);
}

// Returns { total, soft } where soft means an ace is still counted as 11.
function handValue(cards) {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    if (!c || c.hidden) continue;
    total += cardValue(c.rank);
    if (c.rank === 'A') aces++;
  }
  let soft = false;
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  if (aces > 0 && total <= 21) soft = true;
  return { total, soft, aces };
}

function isBlackjack(cards) {
  return cards.length === 2 && handValue(cards).total === 21;
}

function isBust(cards) {
  return handValue(cards).total > 21;
}

function isRed(suit) { return RED_SUITS.includes(suit); }

// Dealer stands on 17 (incl. soft 17 stands — common AU rule: stand on all 17s).
function dealerShouldHit(cards) {
  const { total } = handValue(cards);
  return total < 17;
}

// A tiny "anticipation" helper: does the upcard make the dealer weak? (4,5,6)
function dealerIsWeak(upRank) {
  return ['4','5','6'].includes(upRank);
}

Object.assign(window, {
  RANKS, SUITS, RED_SUITS, makeCard, makeShoe, cardValue,
  handValue, isBlackjack, isBust, isRed, dealerShouldHit, dealerIsWeak,
});
