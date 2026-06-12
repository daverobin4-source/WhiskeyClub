/* activate.jsx — "Activate next episode" setup sheet.
   The logged-in user is locked in as host of the next episode. They set the
   season/episode, theme, date, venue, buy-in, what-to-bring, and the bottle to
   rank (picking from the cellar or adding a brand-new one with a colour-in-the-
   glass swatch). Exposes window.ActivateSheet. */
(function () {
  const { useState } = React;

  const TYPES = ['Single Malt', 'Blended', 'Blended Malt', 'Bourbon', 'Single Pot Still', 'Rye', 'Other'];
  // "colour in the glass" swatches
  const SWATCHES = ['#E4A24A', '#C5853A', '#C0721F', '#B26A22', '#A4571B', '#9C5417', '#8F3F12', '#7A3A14', '#5E2E12'];

  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 24) || 'dram';
  const pad2 = (n) => String(n).padStart(2, '0');
  function toLocalInput(ms) {
    const d = new Date(ms);
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }

  const lbl = { fontFamily:F.disp, fontWeight:600, fontSize:11, letterSpacing:'.12em', color:C.inkSoft, textTransform:'uppercase', display:'block', marginBottom:7 };
  const inp = { width:'100%', border:`1px solid ${C.line}`, borderRadius:12, padding:'11px 13px', fontFamily:F.sans, fontSize:14, color:C.ink, outline:'none', background:C.cream, boxSizing:'border-box' };

  function Field({ label, children, style }) {
    return <div style={{ marginBottom:14, ...style }}><span style={lbl}>{label}</span>{children}</div>;
  }

  function Stepper({ label, value, set, min = 1 }) {
    const btn = (txt, on) => (
      <button onClick={on} style={{ width:38, height:38, borderRadius:10, border:`1px solid ${C.line}`, background:C.paper, color:C.inkSoft, fontFamily:F.sans, fontWeight:700, fontSize:20, cursor:'pointer', lineHeight:1, display:'flex', alignItems:'center', justifyContent:'center' }}>{txt}</button>
    );
    return (
      <div style={{ flex:1 }}>
        <span style={lbl}>{label}</span>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {btn('–', () => set(Math.max(min, value - 1)))}
          <span className="tab-num" style={{ flex:1, textAlign:'center', fontFamily:F.num, fontWeight:700, fontSize:22, color:C.ink }}>{value}</span>
          {btn('+', () => set(value + 1))}
        </div>
      </div>
    );
  }

  function ActivateSheet({ open, meeting, onClose, onActivate }) {
    const [season, setSeason] = useState(meeting.season || 1);
    const [episode, setEpisode] = useState((meeting.no || 0) + 1);
    const [theme, setTheme] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [venue, setVenue] = useState(`${WW.me.name}’s place`);
    const [address, setAddress] = useState('');
    const [buyIn, setBuyIn] = useState(meeting.buyIn || 40);
    const [when, setWhen] = useState(toLocalInput(Date.now() + 7 * 864e5));
    const [bring, setBring] = useState(['One dram to share', 'A clean glass + your palate', 'Something to soak it up']);

    const [mode, setMode] = useState('pick'); // 'pick' | 'new'
    const [bottle, setBottle] = useState(meeting.bottle || (WW.whiskeys[0] && WW.whiskeys[0].id));
    const [nw, setNw] = useState({ name:'', distillery:'', region:'', type:'Single Malt', age:'', abv:'', liquid: SWATCHES[2] });

    const newValid = nw.name.trim() && nw.region.trim();
    const bottleOk = mode === 'pick' ? !!bottle : newValid;
    const valid = theme.trim() && bottleOk;

    function reset() {
      setSeason(meeting.season || 1); setEpisode((meeting.no || 0) + 1);
      setTheme(''); setSubtitle(''); setVenue(`${WW.me.name}’s place`); setAddress('');
      setBuyIn(meeting.buyIn || 40); setWhen(toLocalInput(Date.now() + 7 * 864e5));
      setBring(['One dram to share', 'A clean glass + your palate', 'Something to soak it up']);
      setMode('pick'); setBottle(meeting.bottle); setNw({ name:'', distillery:'', region:'', type:'Single Malt', age:'', abv:'', liquid: SWATCHES[2] });
    }
    function cancel() { reset(); onClose(); }

    const setRow = (i, v) => setBring(rows => rows.map((r, j) => j === i ? v : r));
    const addRow = () => setBring(rows => [...rows, '']);
    const delRow = (i) => setBring(rows => rows.filter((_, j) => j !== i));

    function goLive() {
      if (!valid) return;
      let bottleId = bottle, newWhiskey = null;
      if (mode === 'new') {
        bottleId = slug(nw.name) + '-' + Date.now().toString(36);
        newWhiskey = {
          id: bottleId, name: nw.name.trim(), distillery: nw.distillery.trim(), region: nw.region.trim(),
          type: nw.type, age: nw.age ? Number(nw.age) : null, abv: nw.abv ? Number(nw.abv) : 40,
          liquid: nw.liquid,
        };
      }
      onActivate({
        season, no: episode, venue: venue.trim(), address: address.trim(),
        target: new Date(when).getTime(), theme: theme.trim(), subtitle: subtitle.trim(),
        buyIn: Number(buyIn) || 0, bottle: bottleId, bring: bring.map(s => s.trim()).filter(Boolean), newWhiskey,
      });
      reset();
    }

    if (!open) return null;

    return (
      <div onClick={cancel} style={{ position:'absolute', inset:0, zIndex:45, background:'rgba(25,14,6,.5)', display:'flex', flexDirection:'column', justifyContent:'flex-end', animation:'wwfade 180ms ease' }}>
        <div onClick={e => e.stopPropagation()} style={{ background:C.cream, borderRadius:'24px 24px 0 0', maxHeight:'94%', display:'flex', flexDirection:'column', animation:'wwslideup 300ms var(--ease-snappy)' }}>
          {/* header */}
          <div style={{ padding:'14px 18px 12px', borderBottom:`1px solid ${C.line}`, flexShrink:0 }}>
            <div style={{ width:40, height:4, borderRadius:99, background:C.sand2, margin:'0 auto 12px' }}/>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <Avatar m={WW.me} size={40}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:F.disp, fontWeight:600, fontSize:11, letterSpacing:'.16em', color:C.amberDeep }}>YOU’RE HOSTING</div>
                <div style={{ fontFamily:F.sans, fontWeight:700, fontSize:20, color:C.ink, marginTop:1 }}>Set up the next episode</div>
              </div>
            </div>
          </div>

          {/* body */}
          <div className="no-scrollbar" style={{ overflowY:'auto', padding:'16px 18px 8px' }}>
            {/* season + episode steppers */}
            <div style={{ display:'flex', gap:14, marginBottom:16 }}>
              <Stepper label="Season" value={season} set={setSeason}/>
              <Stepper label="Episode" value={episode} set={setEpisode}/>
            </div>

            <Field label="Theme"><input value={theme} onChange={e => setTheme(e.target.value)} placeholder="e.g. Peated & Proud" style={inp}/></Field>
            <Field label="Tagline (optional)"><input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Islay night — bring the smoke" style={inp}/></Field>

            <div style={{ display:'flex', gap:12 }}>
              <Field label="When" style={{ flex:1.4 }}><input type="datetime-local" value={when} onChange={e => setWhen(e.target.value)} style={inp}/></Field>
              <Field label="Buy-in $" style={{ flex:1 }}><input type="number" inputMode="numeric" value={buyIn} onChange={e => setBuyIn(e.target.value)} style={inp}/></Field>
            </div>

            <Field label="Venue"><input value={venue} onChange={e => setVenue(e.target.value)} placeholder="Your place" style={inp}/></Field>
            <Field label="Address (optional)"><input value={address} onChange={e => setAddress(e.target.value)} placeholder="14 Lygon St, Carlton" style={inp}/></Field>

            {/* what to bring — add/remove rows */}
            <div style={{ marginBottom:14 }}>
              <span style={lbl}>What to bring</span>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {bring.map((row, i) => (
                  <div key={i} style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <input value={row} onChange={e => setRow(i, e.target.value)} placeholder="Add an item…" style={{ ...inp, flex:1 }}/>
                    <button onClick={() => delRow(i)} style={{ width:38, height:38, flexShrink:0, borderRadius:10, border:`1px solid ${C.line}`, background:C.paper, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Icon name="close" size={16} color={C.inkMute}/>
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={addRow} style={{ marginTop:8, display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color:C.amberDeep, fontFamily:F.sans, fontWeight:700, fontSize:13, cursor:'pointer', padding:'4px 0' }}>
                <Icon name="plus" size={15} color={C.amberDeep}/> Add item
              </button>
            </div>

            {/* the bottle to rank */}
            <div style={{ fontFamily:F.disp, fontWeight:600, fontSize:11, letterSpacing:'.12em', color:C.inkSoft, textTransform:'uppercase', margin:'4px 0 9px' }}>The bottle to rank</div>
            <div style={{ display:'flex', gap:8, marginBottom:11 }}>
              {[['pick','From the cellar'],['new','Add a bottle']].map(([k, label]) => {
                const on = mode === k;
                return (
                  <button key={k} onClick={() => setMode(k)} style={{
                    flex:1, border:`1.5px solid ${on ? C.amber : C.line}`, cursor:'pointer',
                    background: on ? 'rgba(199,125,51,.14)' : C.paper, color: on ? C.amberDeep : C.inkSoft,
                    borderRadius:11, padding:'10px 0', fontFamily:F.sans, fontWeight:700, fontSize:13,
                  }}>{label}</button>
                );
              })}
            </div>

            {mode === 'pick' ? (
              <div className="no-scrollbar" style={{ maxHeight:208, overflowY:'auto', border:`1px solid ${C.line}`, borderRadius:14, background:C.paper, padding:6 }}>
                {WW.whiskeys.map(k => {
                  const on = k.id === bottle;
                  return (
                    <div key={k.id} onClick={() => setBottle(k.id)} style={{
                      display:'flex', alignItems:'center', gap:11, padding:'9px 10px', borderRadius:11, cursor:'pointer',
                      background: on ? 'rgba(199,125,51,.12)' : 'transparent',
                    }}>
                      <div style={{ width:34, height:34, borderRadius:'50%', background:k.liquid, flexShrink:0, boxShadow:'inset 0 -4px 8px rgba(0,0,0,.25), inset 0 3px 4px rgba(255,255,255,.25)' }}/>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:F.sans, fontWeight:700, fontSize:13.5, color:C.ink, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{k.name}</div>
                        <div style={{ fontFamily:F.sans, fontSize:11.5, color:C.inkMute }}>{k.region} · {k.type}</div>
                      </div>
                      {k.raters > 0
                        ? <span className="tab-num" style={{ fontFamily:F.num, fontWeight:700, fontSize:13, color:C.inkSoft }}>{k.total.toFixed(2)}</span>
                        : <Chip tone="amber" style={{ height:20, fontSize:10 }}>NEW</Chip>}
                      <div style={{ width:20, height:20, marginLeft:4, borderRadius:'50%', flexShrink:0, border:`2px solid ${on ? C.amber : C.line}`, background: on ? C.amber : 'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {on && <Icon name="check" size={12} color="#fff"/>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ border:`1px solid ${C.line}`, borderRadius:14, background:C.paper, padding:14 }}>
                <Field label="Name"><input value={nw.name} onChange={e => setNw(s => ({ ...s, name:e.target.value }))} placeholder="Kavalan Solist Sherry" style={inp}/></Field>
                <div style={{ display:'flex', gap:12 }}>
                  <Field label="Distillery" style={{ flex:1 }}><input value={nw.distillery} onChange={e => setNw(s => ({ ...s, distillery:e.target.value }))} placeholder="Kavalan" style={inp}/></Field>
                  <Field label="Region" style={{ flex:1 }}><input value={nw.region} onChange={e => setNw(s => ({ ...s, region:e.target.value }))} placeholder="Taiwan" style={inp}/></Field>
                </div>
                <Field label="Style">
                  <div className="no-scrollbar" style={{ display:'flex', gap:7, overflowX:'auto', paddingBottom:2 }}>
                    {TYPES.map(t => {
                      const on = nw.type === t;
                      return (
                        <button key={t} onClick={() => setNw(s => ({ ...s, type:t }))} style={{
                          flexShrink:0, border:`1.5px solid ${on ? C.amber : C.line}`, cursor:'pointer',
                          background: on ? 'rgba(199,125,51,.14)' : C.cream, color: on ? C.amberDeep : C.inkSoft,
                          borderRadius:999, padding:'7px 13px', fontFamily:F.sans, fontWeight:600, fontSize:12.5, whiteSpace:'nowrap',
                        }}>{t}</button>
                      );
                    })}
                  </div>
                </Field>
                <div style={{ display:'flex', gap:12 }}>
                  <Field label="Age (yrs, optional)" style={{ flex:1 }}><input type="number" inputMode="numeric" value={nw.age} onChange={e => setNw(s => ({ ...s, age:e.target.value }))} placeholder="—" style={inp}/></Field>
                  <Field label="ABV %" style={{ flex:1 }}><input type="number" inputMode="decimal" value={nw.abv} onChange={e => setNw(s => ({ ...s, abv:e.target.value }))} placeholder="46" style={inp}/></Field>
                </div>
                {/* colour in the glass */}
                <div style={{ marginBottom:4 }}>
                  <span style={lbl}>Colour in the glass</span>
                  <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                    {SWATCHES.map(c => {
                      const on = nw.liquid === c;
                      return (
                        <button key={c} onClick={() => setNw(s => ({ ...s, liquid:c }))} style={{
                          width:30, height:30, borderRadius:'50%', background:c, cursor:'pointer', padding:0,
                          border: on ? `3px solid ${C.ink}` : '3px solid transparent',
                          boxShadow:'inset 0 -3px 6px rgba(0,0,0,.3), inset 0 2px 4px rgba(255,255,255,.3)',
                        }}/>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* footer */}
          <div style={{ flexShrink:0, padding:'12px 16px', borderTop:`1px solid ${C.line}`, display:'flex', gap:10, background:C.cream }}>
            <button onClick={cancel} style={{ flex:1, background:C.paper, border:`1.5px solid ${C.line}`, color:C.inkSoft, borderRadius:14, padding:'14px 0', fontFamily:F.sans, fontWeight:700, fontSize:15, cursor:'pointer' }}>Cancel</button>
            <button onClick={goLive} disabled={!valid} style={{
              flex:1.6, border:'none', borderRadius:14, padding:'14px 0', fontFamily:F.sans, fontWeight:700, fontSize:15,
              cursor: valid ? 'pointer' : 'default',
              background: valid ? C.amber : C.sand2, color: valid ? '#fff' : C.inkMute,
              boxShadow: valid ? 'var(--ww-glow-amber)' : 'none',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            }}><Icon name="glass-fill" size={18} color={valid ? '#fff' : C.inkMute}/> Activate Episode {episode}</button>
          </div>
        </div>
      </div>
    );
  }

  window.ActivateSheet = ActivateSheet;
})();
