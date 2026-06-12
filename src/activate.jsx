/* activate.jsx — "Activate next episode": the host-of-the-night sets up the
   next session (date, venue, theme, buy-in, bring-list) and picks the house
   pour — choosing an existing dram or adding a brand-new bottle to the catalog.
   Exposes window.ActivateSheet. */
(function () {
  const { useState, useMemo } = React;

  const TYPES = ['Single Malt', 'Blended', 'Blended Malt', 'Bourbon', 'Single Pot Still', 'Rye', 'Other'];
  // warm whiskey hues cycled for new bottles
  const LIQUIDS = ['#C0721F', '#A4571B', '#B26A22', '#9C5417', '#C07E30', '#AC6122', '#C5853A', '#8F3F12', '#9E5A20'];

  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 24) || 'dram';
  const pad2 = (n) => String(n).padStart(2, '0');
  // local datetime-local string from a ms timestamp
  function toLocalInput(ms) {
    const d = new Date(ms);
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }

  const lbl = { fontFamily:F.disp, fontWeight:600, fontSize:11, letterSpacing:'.12em', color:C.inkSoft, textTransform:'uppercase', display:'block', marginBottom:7 };
  const inp = { width:'100%', border:`1px solid ${C.line}`, borderRadius:12, padding:'11px 13px', fontFamily:F.sans, fontSize:14, color:C.ink, outline:'none', background:C.cream, boxSizing:'border-box' };

  function Field({ label, children, style }) {
    return <div style={{ marginBottom:14, ...style }}><span style={lbl}>{label}</span>{children}</div>;
  }

  function ActivateSheet({ open, meeting, onClose, onActivate }) {
    const nextNo = (meeting.no || 0) + 1;
    const baseSeason = meeting.season || 1;

    const [newSeason, setNewSeason] = useState(false);
    const [host, setHost] = useState(WW.me.id);
    const [theme, setTheme] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [venue, setVenue] = useState('');
    const [address, setAddress] = useState('');
    const [buyIn, setBuyIn] = useState(meeting.buyIn || 40);
    const [when, setWhen] = useState(toLocalInput(Date.now() + 7 * 864e5));
    const [bring, setBring] = useState('One dram to share\nA clean glass + your palate\nSomething to soak it up');

    // house pour
    const [mode, setMode] = useState('pick'); // 'pick' | 'new'
    const [bottle, setBottle] = useState(meeting.bottle || (WW.whiskeys[0] && WW.whiskeys[0].id));
    const [nw, setNw] = useState({ name:'', distillery:'', region:'', type:'Single Malt', age:'', abv:'' });

    const season = newSeason ? baseSeason + 1 : baseSeason;
    const episode = newSeason ? 1 : nextNo;

    const newValid = nw.name.trim() && nw.region.trim();
    const bottleOk = mode === 'pick' ? !!bottle : newValid;
    const valid = theme.trim() && venue.trim() && when && bottleOk;

    function reset() {
      setNewSeason(false); setHost(WW.me.id);
      setTheme(''); setSubtitle(''); setVenue(''); setAddress('');
      setBuyIn(meeting.buyIn || 40); setWhen(toLocalInput(Date.now() + 7 * 864e5));
      setBring('One dram to share\nA clean glass + your palate\nSomething to soak it up');
      setMode('pick'); setBottle(meeting.bottle); setNw({ name:'', distillery:'', region:'', type:'Single Malt', age:'', abv:'' });
    }
    function cancel() { reset(); onClose(); }

    function goLive() {
      if (!valid) return;
      let bottleId = bottle, newWhiskey = null;
      if (mode === 'new') {
        bottleId = slug(nw.name) + '-' + Date.now().toString(36);
        newWhiskey = {
          id: bottleId, name: nw.name.trim(), distillery: nw.distillery.trim(), region: nw.region.trim(),
          type: nw.type, age: nw.age ? Number(nw.age) : null, abv: nw.abv ? Number(nw.abv) : 40,
          liquid: LIQUIDS[WW.whiskeys.length % LIQUIDS.length],
        };
      }
      const rsvp = {}; rsvp[host] = 'going'; rsvp[WW.me.id] = 'going';
      const bringList = bring.split('\n').map(s => s.trim()).filter(Boolean);
      onActivate({
        season, no: episode, host, venue: venue.trim(), address: address.trim(),
        target: new Date(when).getTime(), theme: theme.trim(), subtitle: subtitle.trim(),
        buyIn: Number(buyIn) || 0, bottle: bottleId, bring: bringList, rsvp, newWhiskey,
      });
      reset();
    }

    if (!open) return null;
    const sel = mode === 'pick' ? WW.whiskey(bottle) : null;

    return (
      <div onClick={cancel} style={{ position:'absolute', inset:0, zIndex:45, background:'rgba(25,14,6,.5)', display:'flex', flexDirection:'column', justifyContent:'flex-end', animation:'wwfade 180ms ease' }}>
        <div onClick={e => e.stopPropagation()} style={{ background:C.cream, borderRadius:'24px 24px 0 0', maxHeight:'92%', display:'flex', flexDirection:'column', animation:'wwslideup 300ms var(--ease-snappy)' }}>
          {/* header */}
          <div style={{ padding:'14px 18px 12px', borderBottom:`1px solid ${C.line}`, flexShrink:0 }}>
            <div style={{ width:40, height:4, borderRadius:99, background:C.sand2, margin:'0 auto 12px' }}/>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontFamily:F.disp, fontWeight:600, fontSize:11, letterSpacing:'.16em', color:C.amberDeep }}>YOUR TURN TO HOST</div>
                <div style={{ fontFamily:F.sans, fontWeight:700, fontSize:20, color:C.ink, marginTop:2 }}>Activate the next episode</div>
              </div>
              <div className="tab-num" style={{ textAlign:'center', background:C.ink, color:C.cream, borderRadius:12, padding:'8px 12px', fontFamily:F.num, fontWeight:700, fontSize:18 }}>
                S{season}<span style={{ opacity:.45, margin:'0 2px' }}>·</span>E{episode}
              </div>
            </div>
          </div>

          {/* body */}
          <div className="no-scrollbar" style={{ overflowY:'auto', padding:'16px 18px 8px' }}>
            {/* season toggle */}
            <button onClick={() => setNewSeason(v => !v)} style={{
              display:'flex', alignItems:'center', gap:9, width:'100%', marginBottom:16, cursor:'pointer',
              background: newSeason ? 'rgba(199,125,51,.14)' : C.paper, border:`1.5px solid ${newSeason ? C.amber : C.line}`,
              borderRadius:12, padding:'11px 13px', textAlign:'left',
            }}>
              <div style={{ width:22, height:22, borderRadius:7, flexShrink:0, background: newSeason ? C.amber : 'transparent', border:`1.5px solid ${newSeason ? C.amber : C.inkMute}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {newSeason && <Icon name="check" size={14} color="#fff"/>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:F.sans, fontWeight:700, fontSize:14, color:C.ink }}>Start a new season</div>
                <div style={{ fontFamily:F.sans, fontSize:12, color:C.inkMute }}>Rolls over to Season {baseSeason + 1}, Episode 1</div>
              </div>
            </button>

            {/* host */}
            <Field label="Host (whose place / whose pick)">
              <div className="no-scrollbar" style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:2 }}>
                {WW.members.map(m => {
                  const on = host === m.id;
                  return (
                    <button key={m.id} onClick={() => setHost(m.id)} style={{
                      flexShrink:0, background:'none', border:'none', cursor:'pointer', padding:0,
                      display:'flex', flexDirection:'column', alignItems:'center', gap:5, width:54, opacity: on ? 1 : .55,
                      transition:'opacity var(--dur-fast) var(--ease-snappy)',
                    }}>
                      <Avatar m={m} size={44} ring={on ? C.amber : 'transparent'}/>
                      <span style={{ fontFamily:F.sans, fontWeight: on ? 700 : 500, fontSize:11.5, color: on ? C.ink : C.inkMute, whiteSpace:'nowrap' }}>
                        {m.you ? 'You' : m.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Theme">
              <input value={theme} onChange={e => setTheme(e.target.value)} placeholder="e.g. Peated & Proud" style={inp}/>
            </Field>
            <Field label="Tagline (optional)">
              <input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Islay night — bring the smoke" style={inp}/>
            </Field>

            <div style={{ display:'flex', gap:12 }}>
              <Field label="When" style={{ flex:1.4 }}>
                <input type="datetime-local" value={when} onChange={e => setWhen(e.target.value)} style={inp}/>
              </Field>
              <Field label="Buy-in $" style={{ flex:1 }}>
                <input type="number" inputMode="numeric" value={buyIn} onChange={e => setBuyIn(e.target.value)} style={inp}/>
              </Field>
            </div>

            <Field label="Venue">
              <input value={venue} onChange={e => setVenue(e.target.value)} placeholder="Bec’s place" style={inp}/>
            </Field>
            <Field label="Address (optional)">
              <input value={address} onChange={e => setAddress(e.target.value)} placeholder="14 Lygon St, Carlton" style={inp}/>
            </Field>

            <Field label="What to bring (one per line)">
              <textarea value={bring} onChange={e => setBring(e.target.value)} rows={3} style={{ ...inp, resize:'none', lineHeight:1.4 }}/>
            </Field>

            {/* house pour */}
            <div style={{ fontFamily:F.disp, fontWeight:600, fontSize:11, letterSpacing:'.12em', color:C.inkSoft, textTransform:'uppercase', margin:'4px 0 9px' }}>The house pour</div>
            <div style={{ display:'flex', gap:8, marginBottom:11 }}>
              {[['pick','Pick from catalog'],['new','Add a new bottle']].map(([k, label]) => {
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
                <div style={{ display:'flex', gap:12, marginBottom:0 }}>
                  <Field label="Age (yrs, optional)" style={{ flex:1 }}><input type="number" inputMode="numeric" value={nw.age} onChange={e => setNw(s => ({ ...s, age:e.target.value }))} placeholder="—" style={inp}/></Field>
                  <Field label="ABV %" style={{ flex:1 }}><input type="number" inputMode="decimal" value={nw.abv} onChange={e => setNw(s => ({ ...s, abv:e.target.value }))} placeholder="46" style={inp}/></Field>
                </div>
                <div style={{ fontFamily:F.sans, fontSize:11.5, color:C.inkMute, display:'flex', alignItems:'center', gap:5 }}>
                  <Icon name="info" size={13} color={C.inkMute}/> Added to the catalog — the club ranks it for the first time on the night.
                </div>
              </div>
            )}
          </div>

          {/* footer */}
          <div style={{ flexShrink:0, padding:'12px 16px', borderTop:`1px solid ${C.line}`, display:'flex', gap:10, background:C.cream }}>
            <button onClick={cancel} style={{ flex:1, background:C.paper, border:`1.5px solid ${C.line}`, color:C.inkSoft, borderRadius:14, padding:'14px 0', fontFamily:F.sans, fontWeight:700, fontSize:15, cursor:'pointer' }}>Cancel</button>
            <button onClick={goLive} disabled={!valid} style={{
              flex:1.5, border:'none', borderRadius:14, padding:'14px 0', fontFamily:F.sans, fontWeight:700, fontSize:15,
              cursor: valid ? 'pointer' : 'default',
              background: valid ? C.amber : C.sand2, color: valid ? '#fff' : C.inkMute,
              boxShadow: valid ? 'var(--ww-glow-amber)' : 'none',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            }}><Icon name="glass-fill" size={18} color={valid ? '#fff' : C.inkMute}/> Go live</button>
          </div>
        </div>
      </div>
    );
  }

  window.ActivateSheet = ActivateSheet;
})();
