// seats.jsx — D-shaped felt table, 7-seat arc geometry, seat components
// Exports: seatPos, YOU_SEAT, FeltTable, CpuSeat, YouSeat, EmptySeat, SeatReact

const YOU_SEAT = 3;          // centre seat, directly across from dealer
const SEAT_COUNT = 7;

// Position of seat i (0..6) along the downward (∪) betting arc.
// Centre seat sits lowest/closest to the viewer; outer seats ride higher.
function seatPos(i) {
  const cx = 201, cy = 540, rx = 180, ry = 66;
  const t = i / (SEAT_COUNT - 1);
  const a = (-70 + 140 * t) * Math.PI / 180;
  return { x: cx + rx * Math.sin(a), y: cy + ry * Math.cos(a), angle: a };
}

// CPU profiles (Aussie-flavoured banter crew)
const CPU_PROFILES = [
  { name: 'Macca',  emoji: '\uD83E\uDDD4', color: 'linear-gradient(150deg,#FF9A3D,#E8662B)' },
  { name: 'Tegan',  emoji: '\uD83D\uDC69\u200D\uD83E\uDDB0', color: 'linear-gradient(150deg,#34D1C0,#1E9E8F)' },
  { name: 'Jonno',  emoji: '\uD83E\uDDD1', color: 'linear-gradient(150deg,#FF5C9A,#D81E6A)' },
  { name: 'Pricey', emoji: '\uD83D\uDC68\u200D\uD83E\uDDB1', color: 'linear-gradient(150deg,#9C75FF,#5B2BC4)' },
  { name: 'Kez',    emoji: '\uD83D\uDC71\u200D\u2640\uFE0F', color: 'linear-gradient(150deg,#FCD34D,#E0A800)' },
  { name: 'Bluey',  emoji: '\uD83E\uDDD1\u200D\uD83E\uDDB1', color: 'linear-gradient(150deg,#5BA8FF,#2A6FDB)' },
];

// ── The D-shaped felt (flat dealer edge top, big curve toward player) ─────
function FeltTable({ theme }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
      {/* rail / apron */}
      <div style={{
        position: 'absolute', left: -26, right: -26, top: 108, bottom: 92,
        borderRadius: '22px 22px 250px 250px / 22px 22px 150px 150px',
        background: 'linear-gradient(180deg,#3A2266 0%,#231147 55%,#180b30 100%)',
        boxShadow: '0 18px 50px rgba(0,0,0,.6), inset 0 2px 1px rgba(255,255,255,.10)',
      }} />
      {/* felt surface */}
      <div style={{
        position: 'absolute', left: -8, right: -8, top: 124, bottom: 108,
        borderRadius: '14px 14px 230px 230px / 14px 14px 138px 138px',
        background: `radial-gradient(120% 80% at 50% 8%, ${theme.center} 0%, ${theme.edge} 78%)`,
        boxShadow: `inset 0 0 60px ${theme.glow}, inset 0 0 0 2px rgba(0,0,0,.25)`,
      }} />
      {/* betting arc line */}
      <svg viewBox="0 0 402 700" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, width: '100%', height: '100%' }}>
        <path d="M 18 472 Q 201 612 384 472" fill="none" stroke={theme.rail} strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray="2 7" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function SeatRing({ size, active, color, children }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'box-shadow .2s ease, transform .2s ease',
      transform: active ? 'scale(1.06)' : 'scale(1)',
      boxShadow: active ? `0 0 0 3px ${color}, 0 0 18px ${color}` : 'none',
    }}>{children}</div>
  );
}

// ── A seated AI player ─────────────────────────────────────────────────────
function CpuSeat({ seat, hand, cardStyle, active, banterOn, theme }) {
  const pos = seatPos(seat.index);
  const total = hand ? handValue(hand.cards).total : 0;
  const soft = hand ? handValue(hand.cards).soft : false;
  const kind = hand?.result;
  const badgeKind = kind === 'win' || kind === 'blackjack' ? 'win' : kind === 'push' ? 'push' : kind ? 'lose' : 'neutral';
  return (
    <div style={{ position: 'absolute', left: pos.x, top: pos.y, transform: 'translate(-50%,-50%)', zIndex: 14 }}>
      {/* mini hand above the avatar */}
      {hand && hand.cards.length > 0 && (
        <div style={{ position: 'absolute', left: '50%', bottom: 30, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <Hand cards={hand.cards} w={27} cardStyle={cardStyle} overlap={0.5} aceHighlight={false} />
          {hand.cards.some(c => !c.hidden) && (
            <div style={{
              fontFamily: 'Barlow Semi Condensed', fontWeight: 600, fontSize: 12, letterSpacing: '.02em',
              color: badgeKind === 'win' ? '#73FBD3' : badgeKind === 'lose' ? '#FF8080' : '#fff',
              background: 'rgba(20,5,40,.72)', borderRadius: 999, padding: '0 7px', lineHeight: '17px',
              border: '1px solid rgba(255,255,255,.16)',
            }}>{total}{soft ? '·s' : ''}{hand.status === 'bust' ? ' ✗' : ''}</div>
          )}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <SeatRing size={42} active={active} color={theme.rail}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%', background: seat.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, lineHeight: 1,
            boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,.25), 0 3px 8px rgba(0,0,0,.4)',
          }}>{seat.emoji}</div>
          {banterOn && hand?.react && (
            <div className="bj-banner-pop" style={{
              position: 'absolute', top: -16, right: -14, fontSize: 17,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.5))',
            }}>{hand.react}</div>
          )}
        </SeatRing>
        <div style={{ fontFamily: 'Circular Std', fontWeight: 500, fontSize: 10, color: '#EEE8FC', whiteSpace: 'nowrap' }}>{seat.name}</div>
        {/* bet chip */}
        {hand && hand.bet > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: -1 }}>
            <Chip value={hand.bet >= 100 ? 100 : hand.bet >= 25 ? 25 : 5} size={16} />
            <span style={{ fontFamily: 'Rubik', fontWeight: 500, fontSize: 10, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>${hand.bet}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Empty seat (invite / banter) ───────────────────────────────────────────
function EmptySeat({ index, banterOn }) {
  const pos = seatPos(index);
  return (
    <div style={{ position: 'absolute', left: pos.x, top: pos.y, transform: 'translate(-50%,-50%)', zIndex: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: 0.5 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', border: '1.5px dashed rgba(255,255,255,.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.6)',
          fontSize: 20, fontWeight: 300,
        }}>+</div>
        {banterOn && <span style={{ fontFamily: 'Circular Std', fontSize: 9, color: 'rgba(238,232,252,.7)', whiteSpace: 'nowrap' }}>Invite</span>}
      </div>
    </div>
  );
}

// ── Your seat (avatar + bet box) — your CARDS render separately, larger ────
function YouSeat({ bet, doubled, betBoxRef, active, theme, onBetBox }) {
  const pos = seatPos(YOU_SEAT);
  return (
    <div style={{ position: 'absolute', left: pos.x, top: pos.y, transform: 'translate(-50%,-50%)', zIndex: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        {/* bet box */}
        <div ref={betBoxRef} style={{
          width: 56, height: 56, borderRadius: '50%', position: 'relative',
          border: `2px solid ${bet > 0 ? theme.rail : 'rgba(255,255,255,.32)'}`,
          boxShadow: bet > 0 ? `0 0 14px ${theme.glow}` : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color .2s, box-shadow .2s', marginBottom: 2,
        }}>
          {bet > 0
            ? <div style={{ position: 'absolute', bottom: 3 }}><ChipStack amount={bet} size={36} /></div>
            : <span style={{ fontFamily: 'Circular Std', fontSize: 9.5, color: 'rgba(255,255,255,.45)', textAlign: 'center', lineHeight: 1.15 }}>your<br/>bet</span>}
        </div>
        {bet > 0 && (
          <div style={{ fontFamily: 'Rubik', fontWeight: 700, fontSize: 12, color: '#fff', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            ${bet}{doubled ? <span style={{ color: '#FCFF40', fontSize: 9, marginLeft: 2 }}>×2</span> : null}
          </div>
        )}
        <SeatRing size={44} active={active} color={theme.rail}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'linear-gradient(150deg,#9C75FF,#7742FF 55%,#4D23A4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 23, lineHeight: 1,
            boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,.3), 0 3px 8px rgba(0,0,0,.4)',
          }}>😎</div>
        </SeatRing>
      </div>
    </div>
  );
}

Object.assign(window, { seatPos, YOU_SEAT, SEAT_COUNT, CPU_PROFILES, FeltTable, CpuSeat, EmptySeat, YouSeat });
