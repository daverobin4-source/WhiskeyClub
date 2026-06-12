// app.jsx — Dabble Blackjack: 7-seat arc table, 3 CPU players, AI dealer Roxy
// Depends on: engine, cards, chips, fx, dealer, seats, tweaks-panel (all on window)

const { useState, useRef, useEffect, useCallback } = React;

// ── Felt themes ──────────────────────────────────────────────────────────
const THEMES = {
  royal:    { name: 'Royal Purple', center: '#3A1C7A', edge: '#150030', rail: '#7742FF', glow: 'rgba(119,66,255,.45)' },
  midnight: { name: 'Midnight',     center: '#241046', edge: '#0A010F', rail: '#4D23A4', glow: 'rgba(119,66,255,.30)' },
  emerald:  { name: 'Emerald',      center: '#0E5A43', edge: '#06231C', rail: '#73FBD3', glow: 'rgba(115,251,211,.35)' },
  cosmic:   { name: 'Cosmic',       center: '#5A1E8A', edge: '#1A0533', rail: '#FF007B', glow: 'rgba(255,0,123,.30)' },
};

const CHIP_SETS = {
  standard: [5, 25, 100, 500],
  low:      [1, 5, 25, 100],
  high:     [25, 100, 500, 1000],
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "felt": "royal",
  "cardStyle": "classic",
  "celebration": "normal",
  "dealerOn": true,
  "banterOn": true,
  "chipSet": "standard"
}/*EDITMODE-END*/;

const STARTING_BANKROLL = 500;
const CPU_BET = 25;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── CPU seat layout: indices 0, 2, 5 (left, left-centre, right) ──────────
const CPU_SEAT_INDICES = [0, 2, 5];
const CPU_SEATS = CPU_SEAT_INDICES.map((seatIndex, i) => ({
  index: seatIndex,
  ...CPU_PROFILES[i],
}));

const CPU_REACTS = {
  win:        ['🎉','💰','🔥'],
  blackjack:  ['🎰','🎉','🤑'],
  bust:       ['😬','💀','😅'],
  lose:       ['😤','😔','🤷'],
  push:       ['🫤','😐'],
  dealerBust: ['🎉','🥳','💰'],
};
function cpuReact(ev) {
  const pool = CPU_REACTS[ev] || [];
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}
function cpuStrategy(cards) { return handValue(cards).total < 17; }

// ── TotalBadge ───────────────────────────────────────────────────────────
function TotalBadge({ value, soft, kind = 'neutral', show }) {
  if (!show) return null;
  const bg = {
    neutral: 'rgba(20,5,40,.75)', win: '#34A854', lose: '#E84446',
    bj: 'linear-gradient(120deg,#FCFF40,#FF007B)', push: '#57486A',
  }[kind];
  const col = kind === 'bj' ? '#150030' : '#fff';
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap:5,
      background:bg, color:col, borderRadius:999, padding:'3px 11px',
      fontFamily:'Barlow Semi Condensed', fontWeight:600, fontSize:17, letterSpacing:'.02em',
      border:'1px solid rgba(255,255,255,.18)', backdropFilter:'blur(4px)',
      boxShadow:'0 2px 8px rgba(0,0,0,.3)',
    }}>
      {value}
      {soft ? <span className="bj-soft-pulse" style={{fontSize:9,opacity:.9,letterSpacing:'.08em'}}>SOFT</span> : null}
    </div>
  );
}

// ── Banter reaction drift rail ───────────────────────────────────────────
function BanterRail({ on }) {
  const [reacts, setReacts] = useState([]);
  useEffect(() => {
    if (!on) return;
    const emojis = ['🔥','❤️','😂','🎉','🥹','💰'];
    const id = setInterval(() => {
      setReacts(rs => [
        ...rs.slice(-5),
        { id: Date.now() + Math.random(), e: emojis[Math.floor(Math.random()*emojis.length)], x: Math.random()*18 },
      ]);
    }, 2600);
    return () => clearInterval(id);
  }, [on]);
  if (!on) return null;
  return (
    <div style={{position:'absolute',right:8,bottom:150,width:44,height:200,pointerEvents:'none',zIndex:30}}>
      {reacts.map(r => (
        <span key={r.id} className="bj-react-float"
          style={{position:'absolute',bottom:0,right:r.x,fontSize:20}}>{r.e}</span>
      ))}
    </div>
  );
}

// ── Action pill button ───────────────────────────────────────────────────
function PillButton({ children, onClick, variant='ghost', disabled, flex }) {
  const styles = {
    primary: { background:'#7742FF', color:'#fff', boxShadow:'0 6px 18px rgba(119,66,255,.45)' },
    danger:  { background:'rgba(255,255,255,.10)', color:'#fff', border:'1px solid rgba(255,255,255,.22)' },
    ghost:   { background:'rgba(255,255,255,.10)', color:'#fff', border:'1px solid rgba(255,255,255,.22)' },
    gold:    { background:'linear-gradient(120deg,#FCFF40,#DBC386)', color:'#150030' },
  }[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      flex: flex ? 1 : undefined, padding:'13px 16px', borderRadius:14, border:'none',
      fontFamily:'Circular Std', fontWeight:500, fontSize:15, cursor:disabled?'default':'pointer',
      opacity:disabled?0.4:1, transition:'transform .12s, opacity .15s', whiteSpace:'nowrap',
      ...styles,
    }}
    onMouseDown={e=>{if(!disabled)e.currentTarget.style.transform='scale(.97)';}}
    onMouseUp={e=>{e.currentTarget.style.transform='scale(1)';}}
    onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';}}
    >{children}</button>
  );
}

// ── Flying chip (tray → bet-box flourish) ────────────────────────────────
function FlyingChip({ value, start, end }) {
  const [pos, setPos] = useState(start);
  useEffect(() => { const r = requestAnimationFrame(() => setPos(end)); return () => cancelAnimationFrame(r); }, []);
  return (
    <div style={{
      position:'absolute', left:0, top:0, zIndex:60,
      transform:`translate(${pos.x}px,${pos.y}px)`,
      transition:'transform .42s cubic-bezier(.3,.7,.3,1)',
    }}>
      <Chip value={value} size={36} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
function Table() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const theme     = THEMES[t.felt] || THEMES.royal;
  const chipDenoms = CHIP_SETS[t.chipSet] || CHIP_SETS.standard;

  // ── Player wallet ──
  const [bankroll, setBankroll] = useState(STARTING_BANKROLL);
  const [bet, setBet]           = useState(0);
  const [lastBet, setLastBet]   = useState(0);
  const [doubled, setDoubled]   = useState(false);

  // ── Phase: bet | deal | player | cpu | dealer | result ──
  const [phase, setPhase] = useState('bet');

  // ── Hands ──
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);
  const [cpuHands, setCpuHands]       = useState({});
  const cpuHandsRef                   = useRef({});
  useEffect(() => { cpuHandsRef.current = cpuHands; }, [cpuHands]);

  // ── FX ──
  const [result, setResult]     = useState(null);
  const [quip, setQuip]         = useState('');
  const [quipShow, setQuipShow] = useState(false);
  const [flame, setFlame]       = useState(0);
  const [flyingChips, setFlying] = useState([]);

  const shoeRef   = useRef([]);
  const betBoxRef = useRef(null);
  const feltRef   = useRef(null);

  const animBalance = useCountUp(bankroll, { duration: 650 });

  const say = useCallback((event) => {
    if (!t.dealerOn) return;
    const q = pickQuip(event);
    if (!q) return;
    setQuip(q); setQuipShow(true);
  }, [t.dealerOn]);

  useEffect(() => { reshoe(true); }, []);
  function reshoe(silent) { shoeRef.current = makeShoe(6); if (!silent) say('shuffle'); }
  function draw() { if (shoeRef.current.length < 15) reshoe(true); return shoeRef.current.pop(); }
  function maybeFlame(card) { if (card.rank === 'A') { setFlame(f=>f+1); say('ace'); } }

  // ── Computed ──
  const dealerUp   = dealerCards.find(c => !c.hidden);
  const pv         = handValue(playerCards);
  const dv         = handValue(dealerCards.filter(c => !c.hidden));
  const dealerWeak = phase === 'player' && dealerUp && ['4','5','6'].includes(dealerUp.rank);
  const resultKind = result?.kind;

  // ── Bet helpers ──
  function addChip(value, ev) {
    if (phase !== 'bet' || bankroll < value) return;
    setBankroll(b => b - value);
    setBet(b => b + value);
    try {
      const from  = ev.currentTarget.getBoundingClientRect();
      const box   = betBoxRef.current.getBoundingClientRect();
      const felt  = feltRef.current.getBoundingClientRect();
      const id    = Date.now() + Math.random();
      const start = { x: from.left-felt.left+from.width/2-18,  y: from.top-felt.top+from.height/2-18 };
      const end   = { x: box.left -felt.left+box.width/2 -18,  y: box.top -felt.top+box.height/2 -18 };
      setFlying(f => [...f, { id, value, start, end }]);
      setTimeout(() => setFlying(f => f.filter(c => c.id !== id)), 480);
    } catch(e) {}
  }
  function clearBet() { if (phase !== 'bet') return; setBankroll(b=>b+bet); setBet(0); }
  function repeatBet() {
    if (phase !== 'bet' || lastBet <= 0) return;
    const want = Math.min(lastBet, bankroll+bet);
    setBankroll(b => b+bet-want); setBet(want);
  }

  // ── Deal ────────────────────────────────────────────────────────────────
  async function startDeal() {
    if (phase !== 'bet' || bet <= 0) return;
    setLastBet(bet); setResult(null); setDoubled(false);
    setPlayerCards([]); setDealerCards([]);
    say('deal');

    const initCpu = {};
    CPU_SEATS.forEach(s => { initCpu[s.index] = { cards:[], bet:CPU_BET, status:'active', result:null, react:null }; });
    setCpuHands(initCpu); cpuHandsRef.current = initCpu;
    setPhase('deal');

    // Draw all cards upfront
    const cf = {}, cs = {};
    CPU_SEATS.forEach(s => { cf[s.index] = draw(); cs[s.index] = draw(); });
    const p1=draw(), p2=draw(), d1=draw(), d2=draw();

    // Round 1
    await sleep(160);
    const r1 = {};
    CPU_SEATS.forEach(s => { r1[s.index] = { ...initCpu[s.index], cards:[cf[s.index]] }; });
    setCpuHands(r1); cpuHandsRef.current = r1;
    await sleep(160);
    setPlayerCards([p1]); maybeFlame(p1);
    await sleep(160);
    setDealerCards([d1]);
    await sleep(260);

    // Round 2
    const r2 = {};
    CPU_SEATS.forEach(s => { r2[s.index] = { ...r1[s.index], cards:[cf[s.index], cs[s.index]] }; });
    setCpuHands(r2); cpuHandsRef.current = r2;
    await sleep(160);
    setPlayerCards([p1,p2]); maybeFlame(p2);
    await sleep(160);
    setDealerCards([d1, { ...d2, hidden:true }]);
    await sleep(420);

    const playerBJ = isBlackjack([p1,p2]);
    const dealerBJ = isBlackjack([d1,d2]);
    if (playerBJ || dealerBJ) {
      setDealerCards([d1,d2]);
      await sleep(360);
      if (playerBJ && dealerBJ)  await finishHand([p1,p2],[d1,d2],r2,'push',bet);
      else if (playerBJ)         await finishHand([p1,p2],[d1,d2],r2,'blackjack',bet);
      else                       await finishHand([p1,p2],[d1,d2],r2,'lose',bet,'Dealer blackjack');
      return;
    }

    setPhase('player');
    say(['4','5','6'].includes(d1.rank) ? 'weak' : 'yourMove');
  }

  // ── Player actions ──────────────────────────────────────────────────────
  async function hit() {
    if (phase !== 'player') return;
    const c = draw();
    const next = [...playerCards, c];
    setPlayerCards(next); maybeFlame(c);
    await sleep(150);
    if (isBust(next)) { say('playerBust'); await sleep(360); runCpuThenDealer(next); }
  }
  function stand() { if (phase === 'player') runCpuThenDealer(playerCards); }
  async function doDouble() {
    if (phase !== 'player' || playerCards.length !== 2 || bankroll < bet) return;
    setBankroll(b=>b-bet); setBet(b=>b*2); setDoubled(true);
    const c = draw();
    const next = [...playerCards, c];
    setPlayerCards(next); maybeFlame(c);
    await sleep(560);
    if (isBust(next)) { say('playerBust'); await sleep(360); runCpuThenDealer(next); }
    else runCpuThenDealer(next);
  }

  // ── CPU auto-play → dealer → settle ─────────────────────────────────────
  async function runCpuThenDealer(finalPlayerCards) {
    setPhase('cpu');

    let snap = {};
    CPU_SEATS.forEach(s => { snap[s.index] = { ...cpuHandsRef.current[s.index] }; });

    for (const seat of CPU_SEATS) {
      let hand = snap[seat.index];
      if (!hand || hand.cards.length === 0) continue;
      while (cpuStrategy(hand.cards)) {
        await sleep(320);
        const c = draw();
        hand = { ...hand, cards: [...hand.cards, c] };
        snap = { ...snap, [seat.index]: hand };
        setCpuHands({ ...snap }); cpuHandsRef.current = { ...snap };
      }
      if (isBust(hand.cards)) {
        snap = { ...snap, [seat.index]: { ...hand, status:'bust', react:cpuReact('bust') } };
        setCpuHands({ ...snap }); cpuHandsRef.current = { ...snap };
        await sleep(160);
      }
    }

    await sleep(260);
    setPhase('dealer');
    let d = dealerCards.map(c => ({ ...c, hidden:false }));
    setDealerCards(d);
    await sleep(440);
    while (dealerShouldHit(d)) {
      const c = draw(); d = [...d, c]; setDealerCards(d);
      await sleep(440);
    }

    const dt = handValue(d).total;
    if (dt > 21) say('dealerBust');

    const finalCpu = {};
    CPU_SEATS.forEach(s => {
      const hand = snap[s.index];
      if (!hand) return;
      const ct = handValue(hand.cards).total;
      let res, react;
      if      (isBlackjack(hand.cards)) { res='blackjack'; react=cpuReact('blackjack');  }
      else if (isBust(hand.cards))       { res='bust';      react=cpuReact('bust');        }
      else if (dt>21)                    { res='win';       react=cpuReact('dealerBust');  }
      else if (ct>dt)                    { res='win';       react=cpuReact('win');          }
      else if (ct<dt)                    { res='lose';      react=cpuReact('lose');         }
      else                               { res='push';      react=cpuReact('push');         }
      finalCpu[s.index] = { ...hand, result:res, react };
    });
    setCpuHands(finalCpu); cpuHandsRef.current = finalCpu;

    const pt = handValue(finalPlayerCards).total;
    let kind;
    if      (isBust(finalPlayerCards)) kind='lose';
    else if (dt>21)                    kind='win';
    else if (pt>dt)                    kind='win';
    else if (pt<dt)                    kind='lose';
    else                               kind='push';

    await finishHand(finalPlayerCards, d, finalCpu, kind, bet);
  }

  async function finishHand(_p, _d, _cpu, kind, betAmt, sub) {
    let delta=0, label='', payout=0;
    if      (kind==='blackjack') { delta=betAmt*1.5; payout=betAmt+betAmt*1.5; label='Blackjack!';   say('blackjack'); }
    else if (kind==='win')       { delta=betAmt;     payout=betAmt*2;          label='You win!';      say('win');       }
    else if (kind==='push')      { delta=0;          payout=betAmt;            label='Push';          say('push');      }
    else                         { delta=-betAmt;    payout=0;                 label='Dealer wins';   say('lose');      }
    if (payout > 0) setBankroll(b => b+payout);
    setResult({ kind, delta, label, sub });
    setPhase('result');
  }

  function nextHand() {
    setResult(null); setPlayerCards([]); setDealerCards([]);
    setBet(0); setDoubled(false); setCpuHands({}); cpuHandsRef.current={};
    setPhase('bet'); setQuipShow(false);
    if (bankroll <= 0) setBankroll(STARTING_BANKROLL);
  }

  const youPos      = seatPos(YOU_SEAT);
  const isYourTurn  = phase === 'player';
  const showOverlay = phase === 'result' && result;

  return (
    <div ref={feltRef} style={{
      width:'100%', height:'100%', position:'relative', overflow:'hidden',
      background:`radial-gradient(130% 80% at 50% 10%, ${theme.center} 0%, ${theme.edge} 72%)`,
      fontFamily:'Circular Std',
    }}>

      {/* D-shaped felt table */}
      <FeltTable theme={theme} />

      {/* vignette */}
      <div style={{position:'absolute',inset:0,background:'radial-gradient(140% 90% at 50% 30%,transparent 50%,rgba(0,0,0,.52) 100%)',pointerEvents:'none',zIndex:3}} />

      {/* ── Header ── */}
      <div style={{
        position:'relative', zIndex:20,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'56px 16px 6px',
      }}>
        <button style={{background:'rgba(255,255,255,.12)',border:'none',borderRadius:999,width:34,height:34,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
          <svg width="9" height="16" viewBox="0 0 9 16" fill="none"><path d="M7.5 1.5L1.5 8l6 6.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
          <img src="assets/DabbleLogoWordmarkWhite.svg" alt="Dabble" style={{height:14,opacity:.96}} />
          <span style={{fontFamily:'Barlow Semi Condensed',fontWeight:600,fontSize:10.5,letterSpacing:'.18em',color:'rgba(238,232,252,.8)'}}>BLACKJACK</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6,background:'rgba(255,255,255,.12)',borderRadius:999,padding:'5px 12px 5px 10px'}}>
          <div style={{width:15,height:15,borderRadius:'50%',background:'linear-gradient(135deg,#FCFF40,#DBC386)',flexShrink:0}} />
          <span style={{fontFamily:'Rubik',fontWeight:700,fontSize:13,color:'#fff',fontVariantNumeric:'tabular-nums'}}>${animBalance.toFixed(2)}</span>
        </div>
      </div>

      {/* ── Dealer zone ── */}
      <div style={{position:'relative',zIndex:10,display:'flex',flexDirection:'column',alignItems:'center',gap:5,marginTop:0}}>
        <div style={{display:'flex',alignItems:'flex-end',gap:10,minHeight:54}}>
          {t.dealerOn && <DealerAvatar name="Roxy" talking={quipShow} size={44} />}
          {t.dealerOn && <div style={{marginBottom:10}}><SpeechBubble text={quip} show={quipShow} /></div>}
        </div>
        <div style={{position:'relative',minHeight:76,display:'flex',alignItems:'center'}}>
          {dealerCards.length > 0
            ? <Hand cards={dealerCards} w={48} cardStyle={t.cardStyle} />
            : <div style={{width:48,height:67,borderRadius:7,border:'1.5px dashed rgba(255,255,255,.18)'}} />}
          {dealerWeak && <CashPop key={'cash'+dealerUp?.id} text="Dealer's weak 💰" />}
        </div>
        <TotalBadge value={dv.total} soft={dv.soft} show={dealerCards.some(c=>!c.hidden)} kind="neutral" />
        <div style={{fontFamily:'Barlow Semi Condensed',fontWeight:600,fontSize:10,letterSpacing:'.13em',color:'rgba(255,255,255,.24)',textAlign:'center',marginTop:2}}>
          BLACKJACK PAYS 3:2 · DEALER STANDS ON ALL 17
        </div>
      </div>

      {/* ── 7-seat arc ── */}
      <div style={{position:'absolute',inset:0,zIndex:14,pointerEvents:'none'}}>
        {Array.from({length:SEAT_COUNT},(_,i) => {
          if (i === YOU_SEAT) return null;
          const cpuSeat = CPU_SEATS.find(s => s.index === i);
          if (cpuSeat) return (
            <div key={i} style={{pointerEvents:'auto'}}>
              <CpuSeat
                seat={cpuSeat}
                hand={cpuHands[i] || null}
                cardStyle={t.cardStyle}
                active={phase==='cpu'}
                banterOn={t.banterOn}
                theme={theme}
              />
            </div>
          );
          return (
            <div key={i} style={{pointerEvents:'auto'}}>
              <EmptySeat index={i} banterOn={t.banterOn} />
            </div>
          );
        })}

        {/* Your cards floating above bet position */}
        {playerCards.length > 0 && (
          <div style={{
            position:'absolute',
            left:youPos.x, top:youPos.y - 116,
            transform:'translateX(-50%)',
            display:'flex', flexDirection:'column', alignItems:'center', gap:4,
            zIndex:18,
          }}>
            <Hand cards={playerCards} w={56} cardStyle={t.cardStyle} />
            {flame > 0 && <FlameBurst key={'fl'+flame} size={66} style={{left:-16,top:-6}} />}
            <TotalBadge
              value={pv.total} soft={pv.soft} show
              kind={phase==='result'
                ? (resultKind==='win'||resultKind==='blackjack' ? 'win' : resultKind==='push' ? 'push' : 'lose')
                : (pv.total>21 ? 'lose' : 'neutral')}
            />
          </div>
        )}

        {/* Your seat (bet circle + avatar) */}
        <div style={{pointerEvents:'auto'}}>
          <YouSeat
            bet={bet} doubled={doubled}
            betBoxRef={betBoxRef}
            active={isYourTurn}
            theme={theme}
          />
        </div>
      </div>

      <BanterRail on={t.banterOn} />

      {/* ── Action bar ── */}
      <div style={{
        position:'absolute', left:0, right:0, bottom:0, zIndex:22,
        padding:'10px 14px 30px', boxSizing:'border-box',
        background:'linear-gradient(0deg,rgba(7,1,12,.92) 65%,transparent)',
      }}>
        {phase==='bet' && (
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
              {chipDenoms.map(v => (
                <Chip key={v} value={v} size={48} dim={bankroll<v} onClick={(e) => addChip(v, e)} />
              ))}
            </div>
            <div style={{display:'flex',gap:10}}>
              <PillButton variant="ghost" onClick={clearBet} disabled={bet<=0}>Clear</PillButton>
              {lastBet>0 && bet===0 && <PillButton variant="ghost" onClick={repeatBet}>Rebet ${lastBet}</PillButton>}
              <PillButton variant="primary" flex onClick={startDeal} disabled={bet<=0}>Deal</PillButton>
            </div>
          </div>
        )}
        {(phase==='deal'||phase==='cpu'||phase==='dealer') && (
          <div style={{textAlign:'center',fontFamily:'Circular Std',fontSize:13,color:'rgba(238,232,252,.65)',padding:'12px 0'}}>
            {phase==='deal' ? 'Dealing…' : phase==='cpu' ? 'Other players acting…' : 'Dealer plays…'}
          </div>
        )}
        {phase==='player' && (
          <div style={{display:'flex',gap:10}}>
            <PillButton variant="danger" flex onClick={hit}>Hit</PillButton>
            <PillButton variant="primary" flex onClick={stand}>Stand</PillButton>
            {playerCards.length===2 && bankroll>=bet && (
              <PillButton variant="gold" flex onClick={doDouble}>Double</PillButton>
            )}
          </div>
        )}
        {phase==='result' && (
          <PillButton variant="primary" onClick={nextHand} flex>
            {bankroll<=0 ? 'Reload & play again' : 'Next hand'}
          </PillButton>
        )}
      </div>

      {/* Flying chips */}
      {flyingChips.map(fc => <FlyingChip key={fc.id} {...fc} />)}

      {/* Result overlay */}
      {showOverlay && (
        <ResultBanner
          kind={result.kind} amount={result.delta}
          label={result.label} sub={result.sub}
          intensity={t.celebration}
        />
      )}

      {/* Tweaks panel */}
      <TweaksPanel>
        <TweakSection label="Table" />
        <TweakSelect label="Felt theme" value={t.felt}
          options={Object.keys(THEMES).map(k=>({value:k,label:THEMES[k].name}))}
          onChange={v=>setTweak('felt',v)} />
        <TweakRadio label="Card style" value={t.cardStyle}
          options={['classic','bold','minimal']} onChange={v=>setTweak('cardStyle',v)} />
        <TweakSection label="Stakes" />
        <TweakSelect label="Chip set" value={t.chipSet}
          options={[
            {value:'low',     label:'$1 / $5 / $25 / $100'},
            {value:'standard',label:'$5 / $25 / $100 / $500'},
            {value:'high',    label:'$25 / $100 / $500 / $1K'},
          ]}
          onChange={v=>setTweak('chipSet',v)} />
        <TweakSection label="Vibe" />
        <TweakRadio label="Celebrations" value={t.celebration}
          options={['subtle','normal','party']} onChange={v=>setTweak('celebration',v)} />
        <TweakToggle label="Dealer (Roxy)" value={t.dealerOn} onChange={v=>setTweak('dealerOn',v)} />
        <TweakToggle label="Banter & reactions" value={t.banterOn} onChange={v=>setTweak('banterOn',v)} />
        <TweakButton label="Reset bankroll" onClick={() => {
          setBankroll(STARTING_BANKROLL); setBet(0); setPhase('bet');
          setPlayerCards([]); setDealerCards([]); setResult(null);
          setCpuHands({}); cpuHandsRef.current={};
        }} />
      </TweaksPanel>
    </div>
  );
}

window.Table = Table;
