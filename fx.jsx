// fx.jsx — Celebration & micro-moment effects
// Exports: Confetti, BlackjackReveal, ResultBanner, CashPop, FlameBurst, useCountUp

const CONFETTI_COLORS = ['#7742FF', '#9C75FF', '#73FBD3', '#FCFF40', '#FF007B', '#DBC386', '#FFFFFF'];

// Count-up / count-down animated number hook.
function useCountUp(target, { duration = 700, decimals = 2 } = {}) {
  const [val, setVal] = React.useState(target);
  const fromRef = React.useRef(target);
  const rafRef = React.useRef(null);
  React.useEffect(() => {
    const from = fromRef.current;
    const to = target;
    if (from === to) { setVal(to); return; }
    const start = performance.now();
    cancelAnimationFrame(rafRef.current);
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(from + (to - from) * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return val;
}

// Confetti burst. Renders `count` particles that animate once. Key the parent by
// a trigger so React remounts for each new burst.
function Confetti({ count = 80, originY = 0.5, spread = 1 }) {
  const particles = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (Math.random() * 360) * Math.PI / 180;
      const dist = (60 + Math.random() * 220) * spread;
      return {
        id: i,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - 120 * spread,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 8,
        rot: Math.random() * 720 - 360,
        delay: Math.random() * 0.12,
        dur: 0.9 + Math.random() * 0.7,
        round: Math.random() > 0.6,
      };
    });
  }, [count, spread]);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 80 }}>
      {particles.map(p => (
        <span key={p.id} style={{
          position: 'absolute', left: '50%', top: (originY * 100) + '%',
          width: p.size, height: p.round ? p.size : p.size * 0.5,
          background: p.color, borderRadius: p.round ? '50%' : 2,
          '--cx': p.x + 'px', '--cy': p.y + 'px', '--cr': p.rot + 'deg',
          animation: `bj-confetti ${p.dur}s cubic-bezier(.15,.6,.4,1) ${p.delay}s forwards`,
        }} />
      ))}
    </div>
  );
}

// Big celebratory overlay — used for blackjack / dealer bust / win.
function ResultBanner({ kind, amount, label, sub, intensity = 'normal' }) {
  // kind: 'blackjack' | 'win' | 'bust' | 'push' | 'lose'
  const palette = {
    blackjack: { c1: '#FCFF40', c2: '#FF007B', glow: '#FF007B' },
    win:       { c1: '#73FBD3', c2: '#7742FF', glow: '#7742FF' },
    bust:      { c1: '#73FBD3', c2: '#34A854', glow: '#34A854' },
    push:      { c1: '#9687A1', c2: '#57486A', glow: '#57486A' },
    lose:      { c1: '#FF8080', c2: '#57486A', glow: '#57486A' },
  }[kind] || { c1: '#fff', c2: '#7742FF', glow: '#7742FF' };

  const celebratory = kind === 'blackjack' || kind === 'win' || kind === 'bust';
  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', zIndex: 70, pointerEvents: 'none',
    }}>
      {celebratory && intensity !== 'subtle' && (
        <Confetti count={kind === 'blackjack' ? (intensity === 'party' ? 160 : 110) : (intensity === 'party' ? 110 : 70)} originY={0.42} />
      )}
      <div className="bj-banner-pop" style={{ textAlign: 'center', padding: '0 20px' }}>
        <div style={{
          fontFamily: 'Barlow Semi Condensed', fontWeight: 600, textTransform: 'uppercase',
          fontSize: kind === 'blackjack' ? 58 : 44, lineHeight: 0.92, letterSpacing: '.01em',
          background: `linear-gradient(120deg, ${palette.c1}, ${palette.c2})`,
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          filter: `drop-shadow(0 4px 22px ${palette.glow}aa)`,
        }}>{label}</div>
        {sub && (
          <div style={{
            fontFamily: 'Circular Std', fontWeight: 500, fontSize: 15, color: '#EEE8FC',
            marginTop: 8, opacity: 0.92,
          }}>{sub}</div>
        )}
        {amount != null && (
          <div style={{
            fontFamily: 'Rubik', fontWeight: 700, fontSize: 30, marginTop: 10,
            color: amount >= 0 ? '#73FBD3' : '#FF8080',
            textShadow: `0 2px 18px ${amount >= 0 ? '#73FBD3' : '#FF8080'}55`,
          }}>{amount >= 0 ? '+' : '−'}${Math.abs(amount).toFixed(2)}</div>
        )}
      </div>
    </div>
  );
}

// A floating "$$$" coin pop near the dealer when their upcard is weak (5/6).
function CashPop({ text = 'Dealer\u2019s weak \uD83D\uDCB0' }) {
  return (
    <div className="bj-cash-pop" style={{
      position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
      background: 'linear-gradient(135deg,#FCFF40,#DBC386)',
      color: '#150030', fontFamily: 'Circular Std', fontWeight: 700, fontSize: 12,
      padding: '5px 10px', borderRadius: 999, zIndex: 60,
      boxShadow: '0 4px 14px rgba(0,0,0,.35)',
    }}>{text}</div>
  );
}

// Purple flame that bursts behind an ace.
function FlameBurst({ size = 70, style = {} }) {
  return (
    <img src="assets/PurpleFlame.png" className="bj-flame-burst" alt="" style={{
      position: 'absolute', width: size, height: 'auto', pointerEvents: 'none',
      filter: 'drop-shadow(0 0 12px rgba(119,66,255,.8))', zIndex: 5, ...style,
    }} />
  );
}

Object.assign(window, { Confetti, ResultBanner, CashPop, FlameBurst, useCountUp });
