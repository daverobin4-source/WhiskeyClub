/* screen-rank.jsx — Rank a whiskey: 3 sliders → total /15 → submit → reveal. */
(function () {
  const { useState, useMemo } = React;

  const CATS = [
    { key:'a', icon:'aroma',  label:'Aroma',  hint:'nose & intensity' },
    { key:'t', icon:'taste',  label:'Taste',  hint:'palate & balance' },
    { key:'f', icon:'finish', label:'Finish', hint:'length & warmth' },
  ];
  function word(v) {
    if (v >= 4.5) return 'exceptional'; if (v >= 4) return 'excellent';
    if (v >= 3.5) return 'very good';   if (v >= 3) return 'good';
    if (v >= 2.5) return 'fair';        if (v >= 2) return 'a bit meh';
    if (v >= 1) return 'poor';          return 'rough';
  }

  function Slider({ cat, value, onChange }) {
    const pct = (value / 5) * 100;
    return (
      <div style={{ background:C.paper, borderRadius:16, border:`1px solid ${C.line}`, padding:'13px 15px 15px', boxShadow:'var(--ww-card)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:11 }}>
          <div style={{ width:30, height:30, borderRadius:9, background:'rgba(199,125,51,.13)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Icon name={cat.icon} size={18} color={C.amberDeep}/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:F.disp, fontWeight:600, fontSize:13, letterSpacing:'.10em', color:C.ink }}>{cat.label.toUpperCase()}</div>
            <div style={{ fontFamily:F.sans, fontSize:11.5, color:C.inkMute, marginTop:1 }}>{cat.hint} · {word(value)}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <span style={{ fontFamily:F.num, fontWeight:700, fontSize:24, color:C.ink, fontVariantNumeric:'tabular-nums', letterSpacing:'-.01em' }}>{value.toFixed(2)}</span>
            <span style={{ fontFamily:F.sans, fontSize:13, color:C.inkMute, fontWeight:500 }}>/5</span>
          </div>
        </div>
        <input type="range" className="ww-range" min="0" max="5" step="0.05" value={value}
          onChange={e => onChange(+e.target.value)}
          style={{ background:`linear-gradient(to right, ${C.amber} 0%, ${C.amberBright} ${pct}%, ${C.sand2} ${pct}%, ${C.sand2} 100%)`, borderRadius:999, height:9 }}/>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontFamily:F.sans, fontSize:10.5, color:C.inkMute }}>
          <span>0</span><span>2.5</span><span>5.0</span>
        </div>
      </div>
    );
  }

  function Picker({ open, onPick, onClose, currentId }) {
    if (!open) return null;
    return (
      <div onClick={onClose} style={{ position:'absolute', inset:0, zIndex:40, background:'rgba(25,14,6,.45)', display:'flex', flexDirection:'column', justifyContent:'flex-end', animation:'wwfade 180ms ease' }}>
        <div onClick={e => e.stopPropagation()} style={{ background:C.cream, borderRadius:'24px 24px 0 0', maxHeight:'78%', display:'flex', flexDirection:'column', animation:'wwslideup 280ms var(--ease-snappy)' }}>
          <div style={{ padding:'14px 18px 10px', borderBottom:`1px solid ${C.line}` }}>
            <div style={{ width:40, height:4, borderRadius:99, background:C.sand2, margin:'0 auto 12px' }}/>
            <div style={{ fontFamily:F.sans, fontWeight:700, fontSize:18, color:C.ink }}>Pick a dram to rate</div>
          </div>
          <div className="no-scrollbar" style={{ overflowY:'auto', padding:'8px 14px 24px' }}>
            {WW.whiskeys.map(k => {
              const on = k.id === currentId;
              return (
                <div key={k.id} onClick={() => onPick(k.id)} style={{
                  display:'flex', alignItems:'center', gap:12, padding:'11px 12px', marginBottom:6,
                  background:C.paper, borderRadius:13, border:`1.5px solid ${on ? C.amber : C.line}`, cursor:'pointer',
                }}>
                  <div style={{ width:38, height:38, borderRadius:'50%', background:k.liquid, flexShrink:0, boxShadow:'inset 0 -5px 9px rgba(0,0,0,.25), inset 0 3px 5px rgba(255,255,255,.25)' }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:F.sans, fontWeight:700, fontSize:14, color:C.ink }}>{k.name}</div>
                    <div style={{ fontFamily:F.sans, fontSize:12, color:C.inkMute }}>{k.region} · {k.type}</div>
                  </div>
                  {k.raters > 0
                    ? <span style={{ fontFamily:F.num, fontWeight:700, fontSize:14, color:C.inkSoft, fontVariantNumeric:'tabular-nums' }}>{k.total.toFixed(2)}</span>
                    : <Chip tone="amber" style={{ height:20, fontSize:10 }}>NEW</Chip>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  function Success({ whiskey, scores, userScores, onBoard, onAgain }) {
    const personal = +(scores.a + scores.t + scores.f).toFixed(2);
    const eff = WWStore.effective(whiskey, scores);
    const before = whiskey.total;
    const after = eff.total;
    const newRank = WWStore.projectRank(whiskey.id, after, userScores);
    const isNew = whiskey.raters === 0;
    const animBefore = useCountUp(before, { run:true, dur:500 });
    const animAfter = useCountUp(after, { run:true, start:before, dur:1100 });
    const v = WWStore.verdict(personal);
    const sparks = [[-46,-30],[44,-26],[-30,28],[36,30],[0,-50],[-58,4],[56,8]];
    return (
      <div className="no-scrollbar" style={{ flex:1, overflowY:'auto', background:C.cream, display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'30px 22px 0', textAlign:'center' }}>
          {/* disc + sparkles */}
          <div style={{ position:'relative', width:110, height:110, margin:'0 auto 6px' }}>
            {sparks.map((s, i) => (
              <Icon key={i} name={i%2?'sparkle':'star'} size={i%2?14:11} color={i%3?C.gold:C.amberBright}
                style={{ position:'absolute', top:'50%', left:'50%', marginTop:-7, marginLeft:-7,
                  '--dx':`${s[0]}px`, '--dy':`${s[1]}px`, animation:`wwspark 1100ms ease-out ${100+i*40}ms both` }}/>
            ))}
            <div style={{ width:110, height:110, borderRadius:'50%', background:whiskey.liquid, animation:'wwpop 520ms var(--ease-snappy) both',
              boxShadow:`inset 0 -12px 22px rgba(0,0,0,.3), inset 0 8px 14px rgba(255,255,255,.3), 0 0 0 5px var(--ww-cream), 0 0 0 7px ${C.gold}, 0 0 26px ${C.gold}` }}>
              <div style={{ position:'absolute', top:24, left:30, width:26, height:16, borderRadius:'50%', background:'rgba(255,255,255,.42)', filter:'blur(1.5px)' }}/>
            </div>
          </div>
          <div style={{ fontFamily:F.disp, fontWeight:600, fontSize:12, letterSpacing:'.16em', color:C.amberDeep, marginTop:14, animation:'wwrise 400ms var(--ease-snappy) 200ms both' }}>SCORE LOCKED IN</div>
          <div style={{ fontFamily:F.sans, fontWeight:700, fontSize:24, color:C.ink, marginTop:5, letterSpacing:'-.02em', animation:'wwrise 400ms var(--ease-snappy) 280ms both' }}>{whiskey.name}</div>
        </div>

        {/* your score */}
        <div style={{ padding:'20px 16px 0' }}>
          <div style={{ background:`linear-gradient(160deg, #2A1A0E, #190E06)`, borderRadius:18, padding:'18px 18px', color:C.onDark, textAlign:'center', boxShadow:'0 14px 34px rgba(39,23,8,.26)', animation:'wwrise 460ms var(--ease-snappy) 340ms both' }}>
            <div style={{ fontFamily:F.disp, fontWeight:600, fontSize:11, letterSpacing:'.14em', color:C.onDarkMute }}>YOUR VERDICT</div>
            <div style={{ fontFamily:F.num, fontWeight:700, fontSize:54, lineHeight:1, color:C.gold, marginTop:6, fontVariantNumeric:'tabular-nums' }}>
              {personal.toFixed(2)}<span style={{ fontSize:24, color:C.onDarkMute, fontWeight:500 }}>/15</span>
            </div>
            <div style={{ fontFamily:F.sans, fontWeight:700, fontSize:15, color:v.color, marginTop:6 }}>{v.label}</div>
            <div style={{ display:'flex', justifyContent:'center', gap:18, marginTop:14, paddingTop:14, borderTop:`1px solid ${C.lineDark}` }}>
              {[['Aroma',scores.a],['Taste',scores.t],['Finish',scores.f]].map(([l,val]) => (
                <div key={l}>
                  <div style={{ fontFamily:F.num, fontWeight:700, fontSize:18, color:C.onDark, fontVariantNumeric:'tabular-nums' }}>{val.toFixed(2)}</div>
                  <div style={{ fontFamily:F.disp, fontWeight:600, fontSize:9.5, letterSpacing:'.12em', color:C.onDarkMute, marginTop:3 }}>{l.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* club impact */}
        <div style={{ padding:'12px 16px 0' }}>
          <div style={{ background:C.paper, borderRadius:18, border:`1px solid ${C.line}`, padding:'16px 18px', boxShadow:'var(--ww-card)', animation:'wwrise 460ms var(--ease-snappy) 440ms both' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontFamily:F.disp, fontWeight:600, fontSize:11, letterSpacing:'.13em', color:C.inkMute }}>CLUB SCORE</div>
                <div style={{ display:'flex', alignItems:'baseline', gap:8, marginTop:5 }}>
                  {!isNew && <span style={{ fontFamily:F.num, fontWeight:500, fontSize:17, color:C.inkMute, textDecoration:'line-through', fontVariantNumeric:'tabular-nums' }}>{animBefore.toFixed(2)}</span>}
                  {!isNew && <Icon name="arrow" size={16} color={C.inkMute}/>}
                  <span style={{ fontFamily:F.num, fontWeight:700, fontSize:30, color: after>=before?C.forest:C.rust, fontVariantNumeric:'tabular-nums' }}>{animAfter.toFixed(2)}</span>
                  <span style={{ fontFamily:F.sans, fontSize:14, color:C.inkMute }}>/15</span>
                </div>
              </div>
              <div style={{ textAlign:'center', background:C.sand, borderRadius:14, padding:'10px 16px' }}>
                <div style={{ fontFamily:F.num, fontWeight:700, fontSize:26, color:C.amberDeep, fontVariantNumeric:'tabular-nums' }}>#{newRank}</div>
                <div style={{ fontFamily:F.disp, fontWeight:600, fontSize:9.5, letterSpacing:'.12em', color:C.inkMute, marginTop:2 }}>ON BOARD</div>
              </div>
            </div>
            <div style={{ fontFamily:F.sans, fontSize:12.5, color:C.inkSoft, marginTop:12, lineHeight:1.4 }}>
              {isNew
                ? <>You&rsquo;re the first to log this one — straight onto the board at <b style={{color:C.ink}}>#{newRank}</b>.</>
                : <>Your {personal.toFixed(2)} blended with {whiskey.raters} other {whiskey.raters===1?'rating':'ratings'} to land it at <b style={{color:C.ink}}>#{newRank}</b>.</>}
            </div>
          </div>
        </div>

        <div style={{ display:'flex', gap:10, padding:'18px 16px 26px', marginTop:'auto' }}>
          <button onClick={onAgain} style={{ flex:1, background:C.paper, border:`1.5px solid ${C.line}`, color:C.inkSoft, borderRadius:14, padding:'14px 0', fontFamily:F.sans, fontWeight:700, fontSize:15, cursor:'pointer' }}>Rank another</button>
          <button onClick={onBoard} style={{ flex:1.3, background:C.amber, border:'none', color:'#fff', borderRadius:14, padding:'14px 0', fontFamily:F.sans, fontWeight:700, fontSize:15, cursor:'pointer', boxShadow:'var(--ww-glow-amber)' }}>See the board →</button>
        </div>
      </div>
    );
  }

  function RankScreen({ userScores, onSubmit, onGotoBoard, houseBottle }) {
    const [id, setId] = useState(houseBottle || WW.meeting.bottle);
    const [scores, setScores] = useState({ a:3.50, t:3.50, f:3.50 });
    const [pick, setPick] = useState(false);
    const [done, setDone] = useState(false);
    const [press, setPress] = useState(false);
    const whiskey = WW.whiskey(id);
    const already = userScores[id];

    const total = +(scores.a + scores.t + scores.f).toFixed(2);
    const v = WWStore.verdict(total);
    const projRank = useMemo(() => WWStore.projectRank(id, total, userScores), [id, total, userScores]);

    function choose(nid) {
      setId(nid); setPick(false); setDone(false);
      const k = WW.whiskey(nid);
      setScores(k.raters > 0 ? { a:k.avgA, t:k.avgT, f:k.avgF } : { a:3.50, t:3.50, f:3.50 });
    }
    function submit() {
      onSubmit(id, { a:scores.a, t:scores.t, f:scores.f });
      setDone(true);
    }
    function again() {
      setDone(false);
      const next = WW.whiskeys.find(k => k.raters === 0 && !userScores[k.id]) || WW.whiskeys[0];
      choose(next.id);
    }

    if (done) {
      return <Success whiskey={whiskey} scores={scores} userScores={userScores}
        onBoard={() => onGotoBoard(id)} onAgain={again}/>;
    }

    return (
      <div className="no-scrollbar" style={{ flex:1, overflowY:'auto', background:C.cream, paddingBottom:30, position:'relative' }}>
        <div style={{ padding:'16px 16px 2px' }}>
          <div style={{ fontFamily:F.sans, fontWeight:700, fontSize:26, color:C.ink, letterSpacing:'-.02em' }}>Rank a dram</div>
          <div style={{ fontFamily:F.sans, fontSize:13.5, color:C.inkMute, marginTop:2 }}>Score the nose, palate &amp; finish — each out of 5.</div>
        </div>

        {/* whiskey hero */}
        <div style={{ padding:'12px 16px 0' }}>
          <div style={{ background:C.paper, borderRadius:18, border:`1px solid ${C.line}`, padding:'15px 16px', boxShadow:'var(--ww-card)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ position:'relative' }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:whiskey.liquid, boxShadow:'inset 0 -7px 13px rgba(0,0,0,.28), inset 0 5px 8px rgba(255,255,255,.28)' }}/>
                <div style={{ position:'absolute', top:14, left:17, width:16, height:10, borderRadius:'50%', background:'rgba(255,255,255,.42)', filter:'blur(1px)' }}/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:F.sans, fontWeight:700, fontSize:18, color:C.ink, lineHeight:1.1 }}>{whiskey.name}</div>
                <div style={{ fontFamily:F.sans, fontSize:12.5, color:C.inkMute, marginTop:2 }}>{whiskey.distillery} · {whiskey.region}</div>
              </div>
              <button onClick={() => setPick(true)} style={{ background:C.sand, border:'none', color:C.inkSoft, borderRadius:10, padding:'8px 12px', fontFamily:F.sans, fontWeight:600, fontSize:12.5, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                Change <Icon name="chevron-down" size={13} color={C.inkSoft}/>
              </button>
            </div>
            <div style={{ display:'flex', gap:7, marginTop:13, flexWrap:'wrap' }}>
              <Chip tone="line">{whiskey.type}</Chip>
              {whiskey.age && <Chip tone="line">{whiskey.age} years</Chip>}
              <Chip tone="line">{whiskey.abv}% ABV</Chip>
              {whiskey.raters > 0
                ? <Chip tone="amber"><Icon name="trophy-fill" size={11} color={C.amberDeep}/> {whiskey.total.toFixed(2)} · {whiskey.raters} raters</Chip>
                : <Chip tone="wax">Not yet ranked</Chip>}
            </div>
            {already && <div style={{ fontFamily:F.sans, fontSize:12, color:C.amberDeep, marginTop:10, display:'flex', alignItems:'center', gap:5 }}><Icon name="check-circle" size={14} color={C.amberDeep}/> You&rsquo;ve scored this — sliders show your call. Re-submit to update.</div>}
          </div>
        </div>

        {/* sliders */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, padding:'12px 16px 0' }}>
          {CATS.map(cat => (
            <Slider key={cat.key} cat={cat} value={scores[cat.key]} onChange={val => setScores(s => ({ ...s, [cat.key]:val }))}/>
          ))}
        </div>

        {/* live total */}
        <div style={{ padding:'14px 16px 0' }}>
          <div style={{ background:`linear-gradient(160deg, #2A1A0E, #190E06)`, borderRadius:18, padding:'16px 18px', color:C.onDark, display:'flex', alignItems:'center', gap:16, boxShadow:'0 12px 30px rgba(39,23,8,.24)' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:F.disp, fontWeight:600, fontSize:11, letterSpacing:'.14em', color:C.onDarkMute }}>YOUR TOTAL</div>
              <div style={{ fontFamily:F.num, fontWeight:700, fontSize:46, lineHeight:1, color:C.gold, marginTop:4, fontVariantNumeric:'tabular-nums' }}>
                {total.toFixed(2)}<span style={{ fontSize:20, color:C.onDarkMute, fontWeight:500 }}>/15</span>
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:F.sans, fontWeight:700, fontSize:16, color:v.color }}>{v.label}</div>
              <div style={{ fontFamily:F.sans, fontSize:12.5, color:C.onDarkSoft, marginTop:4 }}>would land at</div>
              <div style={{ fontFamily:F.num, fontWeight:700, fontSize:22, color:C.onDark, fontVariantNumeric:'tabular-nums' }}>#{projRank}</div>
            </div>
          </div>
        </div>

        <div style={{ padding:'16px 16px 0' }}>
          <button onClick={submit}
            onPointerDown={() => setPress(true)} onPointerUp={() => setPress(false)} onPointerLeave={() => setPress(false)}
            style={{ width:'100%', background:C.amber, border:'none', color:'#fff', borderRadius:15, padding:'16px 0',
              fontFamily:F.sans, fontWeight:700, fontSize:16.5, cursor:'pointer', boxShadow:'var(--ww-glow-amber)',
              transform: press ? 'scale(.975)' : 'scale(1)', transition:'transform var(--dur-fast) var(--ease-snappy)',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <Icon name="check" size={19} color="#fff"/> {already ? 'Update my score' : 'Lock in my score'}
          </button>
        </div>

        <Picker open={pick} currentId={id} onPick={choose} onClose={() => setPick(false)}/>
      </div>
    );
  }

  window.RankScreen = RankScreen;
})();
