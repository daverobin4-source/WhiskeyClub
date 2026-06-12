// cards.jsx — Playing cards in 3 Dabble styles + branded back + deal/flip anim
// Exports: Card, CardBack, Hand, suitGlyph

const SUIT_GLYPH = { spade: '♠', heart: '♥', diam: '♦', club: '♣' };
function suitGlyph(s) { return SUIT_GLYPH[s] || '?'; }

// Neon suit colors for the dark "bold" style
const NEON = { heart: '#FF2E88', diam: '#FF2E88', spade: '#73FBD3', club: '#73FBD3' };
// Classic ink
const INK_RED = '#E11D5B';
const INK_BLACK = '#1A0533';

function isFace(rank) { return rank === 'J' || rank === 'Q' || rank === 'K'; }

// ── The Dabble card back ───────────────────────────────────────────────
function CardBack({ w = 62, style: cs }) {
  const h = Math.round(w * 1.4);
  return (
    <div style={{
      width: w, height: h, borderRadius: w * 0.13,
      background: 'linear-gradient(150deg, #7742FF 0%, #4D23A4 60%, #2E1466 100%)',
      boxShadow: '0 4px 12px rgba(0,0,0,.45), inset 0 0 0 1px rgba(255,255,255,.12)',
      position: 'relative', overflow: 'hidden', flexShrink: 0,
    }}>
      {/* inset frame */}
      <div style={{
        position: 'absolute', inset: w * 0.07, borderRadius: w * 0.09,
        border: '1px solid rgba(255,255,255,.28)',
      }} />
      {/* sheen */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(120deg, transparent 35%, rgba(255,255,255,.14) 50%, transparent 65%)',
      }} />
      {/* D mark */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: w * 0.42, height: w * 0.42 * 1.4,
          background: 'rgba(255,255,255,.9)',
          WebkitMaskImage: 'url(assets/DabbleLogoDabblish.svg)', maskImage: 'url(assets/DabbleLogoDabblish.svg)',
          WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
          WebkitMaskSize: 'contain', maskSize: 'contain',
          WebkitMaskPosition: 'center', maskPosition: 'center',
        }} />
      </div>
    </div>
  );
}

// ── A face index (corner rank+suit) ────────────────────────────────────
function CornerIndex({ rank, suit, color, w, flip }) {
  return (
    <div style={{
      position: 'absolute',
      top: flip ? 'auto' : w * 0.07, bottom: flip ? w * 0.07 : 'auto',
      left: flip ? 'auto' : w * 0.09, right: flip ? w * 0.09 : 'auto',
      transform: flip ? 'rotate(180deg)' : 'none',
      display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1,
      color,
    }}>
      <span style={{ fontFamily: 'Barlow Semi Condensed', fontWeight: 600, fontSize: w * 0.30, letterSpacing: '.01em' }}>{rank}</span>
      <span style={{ fontSize: w * 0.22, marginTop: w * 0.01 }}>{suitGlyph(suit)}</span>
    </div>
  );
}

// ── The card face, by style ─────────────────────────────────────────────
function CardFace({ rank, suit, w, cardStyle }) {
  const h = Math.round(w * 1.4);
  const red = isRed(suit);

  if (cardStyle === 'bold') {
    const accent = NEON[suit];
    return (
      <div style={{
        width: w, height: h, borderRadius: w * 0.13, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(155deg, #241046 0%, #160a2e 100%)',
        boxShadow: '0 4px 12px rgba(0,0,0,.5), inset 0 0 0 1px rgba(255,255,255,.10)',
        flexShrink: 0,
      }}>
        <div style={{ position: 'absolute', inset: w * 0.06, borderRadius: w * 0.09, border: `1px solid ${accent}55` }} />
        {/* watermark suit */}
        <div style={{
          position: 'absolute', right: -w * 0.08, bottom: -w * 0.12,
          fontSize: w * 0.95, color: accent, opacity: 0.16, lineHeight: 1,
        }}>{suitGlyph(suit)}</div>
        {/* big rank */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: w * 0.02,
        }}>
          <span style={{
            fontFamily: 'Barlow Semi Condensed', fontWeight: 600, fontSize: w * (rank === '10' ? 0.58 : 0.7),
            color: '#fff', lineHeight: 0.9, letterSpacing: '-.01em',
            textShadow: `0 0 14px ${accent}66`,
          }}>{rank}</span>
          <span style={{ fontSize: w * 0.26, color: accent, lineHeight: 1, textShadow: `0 0 10px ${accent}99` }}>{suitGlyph(suit)}</span>
        </div>
      </div>
    );
  }

  if (cardStyle === 'minimal') {
    const color = red ? INK_RED : INK_BLACK;
    return (
      <div style={{
        width: w, height: h, borderRadius: w * 0.13, position: 'relative', overflow: 'hidden',
        background: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,.4), inset 0 0 0 1px rgba(21,0,48,.08)',
        flexShrink: 0,
      }}>
        <span style={{
          position: 'absolute', top: w * 0.10, left: w * 0.12,
          fontSize: w * 0.22, color, lineHeight: 1,
        }}>{suitGlyph(suit)}</span>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{
            fontFamily: 'Circular Std', fontWeight: 700, fontSize: w * (rank === '10' ? 0.52 : 0.64),
            color: '#150030', lineHeight: 1, letterSpacing: '-.03em',
          }}>{rank}</span>
        </div>
      </div>
    );
  }

  // classic (default)
  const color = red ? INK_RED : INK_BLACK;
  return (
    <div style={{
      width: w, height: h, borderRadius: w * 0.13, position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(160deg,#ffffff 0%,#f4f1fb 100%)',
      boxShadow: '0 4px 12px rgba(0,0,0,.4), inset 0 0 0 1px rgba(21,0,48,.08)',
      flexShrink: 0,
    }}>
      <CornerIndex rank={rank} suit={suit} color={color} w={w} />
      <CornerIndex rank={rank} suit={suit} color={color} w={w} flip />
      {/* center */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isFace(rank) ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: w * 0.03 }}>
            <div style={{
              width: w * 0.46, height: w * 0.46 * 1.4,
              background: '#7742FF',
              WebkitMaskImage: 'url(assets/DabbleLogoDabblish.svg)', maskImage: 'url(assets/DabbleLogoDabblish.svg)',
              WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskSize: 'contain', maskSize: 'contain',
              WebkitMaskPosition: 'center', maskPosition: 'center',
            }} />
            <span style={{ fontFamily: 'Barlow Semi Condensed', fontWeight: 600, fontSize: w * 0.26, color, lineHeight: 1 }}>{suitGlyph(suit)}</span>
          </div>
        ) : (
          <span style={{ fontSize: w * (rank === 'A' ? 0.62 : 0.5), color, lineHeight: 1 }}>{suitGlyph(suit)}</span>
        )}
      </div>
    </div>
  );
}

// ── A single card with flip + deal-in. ──────────────────────────────────
function Card({ card, w = 62, cardStyle = 'classic', index = 0, isAce = false }) {
  const flipped = !card.hidden; // hidden => show back
  const h = Math.round(w * 1.4);
  return (
    <div
      className="bj-card-deal"
      style={{
        width: w, height: h, flexShrink: 0, perspective: 700,
        animationDelay: (index * 0.09) + 's',
      }}
    >
      <div style={{
        width: '100%', height: '100%', position: 'relative',
        transition: 'transform .5s cubic-bezier(.2,.8,.2,1)',
        transformStyle: 'preserve-3d',
        transform: flipped ? 'rotateY(0deg)' : 'rotateY(180deg)',
      }}>
        {/* front */}
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
          <CardFace rank={card.rank} suit={card.suit} w={w} cardStyle={cardStyle} />
          {isAce && flipped && (
            <div className="bj-ace-glow" style={{ position: 'absolute', inset: -4, borderRadius: w * 0.16, pointerEvents: 'none' }} />
          )}
        </div>
        {/* back */}
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <CardBack w={w} />
        </div>
      </div>
    </div>
  );
}

// ── A fanned hand of cards ──────────────────────────────────────────────
function Hand({ cards = [], w = 62, cardStyle = 'classic', overlap = 0.42, aceHighlight = true }) {
  const step = w * (1 - overlap);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', height: Math.round(w * 1.4) }}>
      {cards.map((c, i) => (
        <div key={c.id} style={{ marginLeft: i === 0 ? 0 : -(w - step) }}>
          <Card card={c} w={w} cardStyle={cardStyle} index={i}
                isAce={aceHighlight && c.rank === 'A' && !c.hidden} />
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { Card, CardBack, Hand, suitGlyph });
