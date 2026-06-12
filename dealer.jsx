// dealer.jsx — Dabble dealer avatar + quip speech bubble
// Exports: DealerAvatar, SpeechBubble, pickQuip

// Quip bank keyed by game event. Tight, energetic, Dabble voice.
const QUIPS = {
  shuffle:   ["Fresh shoe. Let\u2019s run it.", "New cards, new luck.", "Shuffled up and ready."],
  deal:      ["Cards out!", "Here we go.", "Good luck, legend."],
  yourMove:  ["Your call.", "What\u2019s it gonna be?", "Hit or sit?"],
  ace:       ["Oooh, an ace \uD83D\uDD25", "Now we\u2019re cooking.", "Soft hand \u2014 spicy."],
  weak:      ["I\u2019m showing weak\u2026 cha-ching \uD83D\uDCB0", "Rough card for me.", "Bust city, party of one?"],
  playerBust:["Oof. Too many.", "Over the top.", "Next one\u2019s yours."],
  dealerBust:["I busted! All yours \uD83C\uDF89", "Dealer\u2019s done. Pay the table!", "Whoops \u2014 collect up."],
  blackjack: ["BLACKJACK! Pays three-to-two \uD83C\uDFB0", "Snapper! Nice one.", "Twenty-one off the deal!"],
  win:       ["Winner winner.", "Nice hand!", "Chips coming your way."],
  push:      ["Push. Nobody moves.", "Stand-off.", "Tie \u2014 keep your chips."],
  lose:      ["House takes it.", "Tough one.", "Run it back?"],
};

let _lastQuip = {};
function pickQuip(event) {
  const bank = QUIPS[event];
  if (!bank) return '';
  let q = bank[Math.floor(Math.random() * bank.length)];
  if (q === _lastQuip[event] && bank.length > 1) q = bank[(bank.indexOf(q) + 1) % bank.length];
  _lastQuip[event] = q;
  return q;
}

function DealerAvatar({ name = 'Roxy', size = 56, talking = false, emoji = '\uD83E\uDD35\u200D\u2640\uFE0F' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%', position: 'relative',
        background: 'linear-gradient(150deg,#9C75FF 0%,#7742FF 45%,#4D23A4 100%)',
        boxShadow: talking
          ? '0 0 0 3px rgba(119,66,255,.35), 0 6px 18px rgba(119,66,255,.5)'
          : '0 4px 12px rgba(0,0,0,.45), inset 0 0 0 1px rgba(255,255,255,.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'box-shadow .2s ease',
      }}>
        <span style={{ fontSize: size * 0.5, lineHeight: 1 }}>{emoji}</span>
        {/* croupier bowtie badge */}
        <div style={{
          position: 'absolute', bottom: -3, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 0,
        }}>
          <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderRight: '7px solid #150030' }} />
          <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '7px solid #150030' }} />
        </div>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        fontFamily: 'Circular Std', fontWeight: 500, fontSize: 12, color: '#EEE8FC',
      }}>
        {name}
        <span style={{
          fontFamily: 'Barlow Semi Condensed', fontWeight: 600, fontSize: 9, letterSpacing: '.1em',
          color: '#9687A1', textTransform: 'uppercase', border: '1px solid #57486A',
          borderRadius: 4, padding: '1px 4px',
        }}>DEALER</span>
      </div>
    </div>
  );
}

function SpeechBubble({ text, show }) {
  return (
    <div style={{
      maxWidth: 200, minHeight: 0,
      opacity: show && text ? 1 : 0,
      transform: show && text ? 'translateY(0) scale(1)' : 'translateY(4px) scale(.96)',
      transition: 'opacity .2s ease, transform .2s cubic-bezier(.2,.8,.2,1)',
      pointerEvents: 'none',
    }}>
      <div style={{
        position: 'relative',
        background: 'rgba(255,255,255,.96)', color: '#150030',
        fontFamily: 'Circular Std', fontWeight: 500, fontSize: 13, lineHeight: 1.3,
        padding: '8px 12px', borderRadius: 14,
        boxShadow: '0 6px 18px rgba(0,0,0,.4)',
      }}>
        {text}
        {/* tail */}
        <div style={{
          position: 'absolute', left: 18, bottom: -6,
          width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent',
          borderTop: '7px solid rgba(255,255,255,.96)',
        }} />
      </div>
    </div>
  );
}

Object.assign(window, { DealerAvatar, SpeechBubble, pickQuip });
