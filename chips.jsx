// chips.jsx — Poker chips, denomination tray, bet-circle stacks
// Exports: Chip, ChipStack, breakIntoChips, CHIP_DEFS

const CHIP_COLORS = {
  5:    { face: '#E14B4B', edge: '#fff', ring: '#fff', text: '#fff' },
  25:   { face: '#2E9E4F', edge: '#fff', ring: '#fff', text: '#fff' },
  100:  { face: '#1A0533', edge: '#fff', ring: '#9C75FF', text: '#fff' },
  500:  { face: '#7742FF', edge: '#fff', ring: '#FCFF40', text: '#fff' },
  1000: { face: '#DBC386', edge: '#150030', ring: '#150030', text: '#150030' },
};

function chipColor(v) { return CHIP_COLORS[v] || CHIP_COLORS[5]; }

// Break a bet amount into a stack of chip denominations (largest first).
function breakIntoChips(amount, denoms = [500, 100, 25, 5]) {
  const out = [];
  let rem = amount;
  for (const d of denoms) {
    while (rem >= d) { out.push(d); rem -= d; }
  }
  return out;
}

function chipLabel(v) {
  if (v >= 1000) return (v / 1000) + 'K';
  return '' + v;
}

// A single poker chip (top-down view).
function Chip({ value, size = 46, onClick, style = {}, dim = false }) {
  const c = chipColor(value);
  const spotCount = 6;
  // edge spots via conic gradient
  const conic = `repeating-conic-gradient(${c.face} 0deg 22deg, ${c.edge} 22deg 30deg)`;
  return (
    <button
      onClick={onClick}
      style={{
        width: size, height: size, borderRadius: '50%', border: 'none', padding: 0,
        position: 'relative', cursor: onClick ? 'pointer' : 'default', flexShrink: 0,
        background: conic,
        boxShadow: '0 3px 6px rgba(0,0,0,.4), inset 0 0 0 1px rgba(0,0,0,.15)',
        opacity: dim ? 0.4 : 1,
        transition: 'transform .12s cubic-bezier(.2,.8,.2,1)',
        ...style,
      }}
      onMouseDown={e => { if (onClick) e.currentTarget.style.transform = 'scale(.92)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {/* inner face */}
      <div style={{
        position: 'absolute', inset: size * 0.16, borderRadius: '50%',
        background: c.face,
        border: `${Math.max(1.5, size * 0.045)}px dashed ${c.ring}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'inset 0 1px 2px rgba(255,255,255,.25)',
      }}>
        <span style={{
          fontFamily: 'Barlow Semi Condensed', fontWeight: 600, color: c.text,
          fontSize: size * (chipLabel(value).length > 2 ? 0.30 : 0.36), lineHeight: 1,
          letterSpacing: '.02em',
        }}>{chipLabel(value)}</span>
      </div>
    </button>
  );
}

// A vertical stack of chips representing a bet amount, sitting in the bet circle.
function ChipStack({ amount, size = 40, max = 8 }) {
  const chips = breakIntoChips(amount).slice(0, max);
  if (chips.length === 0) return null;
  const offset = size * 0.16;
  return (
    <div style={{ position: 'relative', width: size, height: size + offset * (chips.length - 1) }}>
      {chips.map((v, i) => (
        <div key={i} style={{ position: 'absolute', left: 0, bottom: i * offset, zIndex: i }}>
          <Chip value={v} size={size} />
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { Chip, ChipStack, breakIntoChips, chipColor, chipLabel });
