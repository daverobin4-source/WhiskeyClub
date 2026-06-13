/* screen-meeting.jsx — Next session: host, venue, countdown, theme, RSVP. */
(function () {
  const { useState } = React;
  const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function fmtDate(ts) {
    const d = new Date(ts);
    let h = d.getHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]} · ${h}:${mm} ${ap}`;
  }

  function CountBox({ v, l }) {
    return (
      <div style={{ textAlign:'center', minWidth:52 }}>
        <div style={{
          fontFamily:F.num, fontWeight:700, fontSize:30, color:C.onDark, lineHeight:1,
          fontVariantNumeric:'tabular-nums', background:'rgba(248,241,230,.07)',
          border:`1px solid ${C.lineDark}`, borderRadius:12, padding:'9px 0',
        }}>{String(v).padStart(2, '0')}</div>
        <div style={{ fontFamily:F.disp, fontWeight:600, fontSize:10, letterSpacing:'.14em', color:C.onDarkMute, marginTop:6 }}>{l}</div>
      </div>
    );
  }

  const STATUS = {
    going:   { label:"I'm in",   tone:C.forest },
    maybe:   { label:'Maybe',    tone:C.amber  },
    out:     { label:"Can't",    tone:C.inkMute },
    pending: { label:'No reply', tone:C.inkMute },
  };

  // Past-tense wording for the episode-detail sheet.
  const PAST_STATUS = {
    going:   { label:'Came',     tone:C.forest },
    maybe:   { label:'Maybe',    tone:C.amber  },
    out:     { label:'Missed',   tone:C.inkMute },
    pending: { label:'No reply', tone:C.inkMute },
  };

  function MeetingScreen({ meeting, rsvp, onRsvp, onGotoRank, onActivate, episodes = [] }) {
    const mtg = meeting || WW.meeting;
    const season = mtg.season || 1;
    const cd = useCountdown(mtg.target);
    const host = WW.byId(mtg.host);
    const bottle = WW.whiskey(mtg.bottle);
    const going = WW.members.filter(m => rsvp[m.id] === 'going');
    const myStatus = rsvp[WW.me.id];
    const myTurn = mtg.nextHost === WW.me.id;
    const nextHostM = WW.byId(mtg.nextHost);
    const [selected, setSelected] = useState(null); // past episode opened for detail

    return (
      <div style={{ flex:1, minHeight:0, position:'relative', display:'flex', flexDirection:'column' }}>
      <div className="no-scrollbar" style={{ flex:1, overflowY:'auto', background:C.cream, paddingBottom:28 }}>
        {/* Hero */}
        <div style={{ padding:'14px 14px 0' }}>
          <div style={{
            position:'relative', overflow:'hidden', borderRadius:20,
            background:`radial-gradient(120% 90% at 85% -10%, rgba(199,125,51,.55) 0%, rgba(199,125,51,0) 55%), linear-gradient(160deg, ${'#2A1A0E'} 0%, ${'#190E06'} 100%)`,
            padding:'18px 18px 20px', color:C.onDark,
            boxShadow:'0 16px 40px rgba(39,23,8,.28)',
          }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <Chip tone="dark"><Icon name="calendar" size={13} color={C.amberBright}/> Season {season} · Ep {mtg.no}</Chip>
              <span style={{ fontFamily:F.disp, fontWeight:600, fontSize:11, letterSpacing:'.14em', color:C.amberBright, display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ width:7, height:7, borderRadius:99, background:C.amberBright, boxShadow:`0 0 8px ${C.amberBright}`, animation:'wwpulse 1.8s infinite' }}/> UP NEXT
              </span>
            </div>
            <div style={{ fontFamily:F.sans, fontWeight:700, fontSize:34, lineHeight:1.02, letterSpacing:'-.02em' }}>{mtg.theme}</div>
            <div style={{ fontFamily:F.sans, fontSize:15, color:C.onDarkSoft, marginTop:7 }}>{mtg.subtitle}</div>

            {/* Countdown */}
            <div style={{ display:'flex', gap:9, marginTop:18 }}>
              <CountBox v={cd.d} l="DAYS"/>
              <CountBox v={cd.h} l="HRS"/>
              <CountBox v={cd.m} l="MIN"/>
              <CountBox v={cd.s} l="SEC"/>
            </div>

            {/* Host + venue */}
            <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:20, paddingTop:16, borderTop:`1px solid ${C.lineDark}` }}>
              <Avatar m={host} size={44} ring="rgba(248,241,230,.18)"/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:F.sans, fontSize:12, color:C.onDarkMute }}>Hosted by</div>
                <div style={{ fontFamily:F.sans, fontWeight:700, fontSize:16, color:C.onDark }}>{host.name}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ display:'flex', alignItems:'center', gap:5, justifyContent:'flex-end', color:C.onDark }}>
                  <Icon name="pin" size={14} color={C.amberBright}/>
                  <span style={{ fontFamily:F.sans, fontWeight:600, fontSize:13 }}>{mtg.venue}</span>
                </div>
                <div style={{ fontFamily:F.sans, fontSize:11.5, color:C.onDarkMute, marginTop:2 }}>{mtg.address}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detail tiles */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, padding:'12px 14px 0' }}>
          <Tile icon="clock" label="When">{fmtDate(mtg.target)}</Tile>
          <Tile icon="bag" label="Buy-in">${mtg.buyIn} a head <span style={{ color:C.inkMute, fontWeight:500 }}>· kitty</span></Tile>
        </div>

        {/* Tonight's featured bottle */}
        <div style={{ padding:'10px 14px 0' }}>
          <div onClick={onGotoRank} style={{
            display:'flex', alignItems:'center', gap:14, background:C.paper, borderRadius:16,
            border:`1px solid ${C.line}`, padding:14, cursor:'pointer', boxShadow:'var(--ww-card)',
          }}>
            <div style={{ position:'relative' }}>
              <div style={{ width:46, height:46, borderRadius:'50%', background:bottle.liquid, boxShadow:'inset 0 -6px 10px rgba(0,0,0,.25), inset 0 4px 6px rgba(255,255,255,.25)' }}/>
              <div style={{ position:'absolute', inset:0, borderRadius:'50%', boxShadow:`0 0 0 4px var(--ww-paper), 0 0 0 5px ${C.line}` }}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:F.disp, fontWeight:600, fontSize:10.5, letterSpacing:'.14em', color:C.amberDeep }}>HOUSE POUR</div>
              <div style={{ fontFamily:F.sans, fontWeight:700, fontSize:16, color:C.ink, marginTop:1 }}>{bottle.name}</div>
              <div style={{ fontFamily:F.sans, fontSize:12.5, color:C.inkMute }}>{bottle.region} · {bottle.type} · {bottle.abv}% ABV</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:3, color:C.amberDeep, fontFamily:F.sans, fontWeight:600, fontSize:13 }}>
              Rate <Icon name="chevron" size={15} color={C.amberDeep}/>
            </div>
          </div>
        </div>

        {/* Bring list */}
        <SectionLabel>On the bar — what to bring</SectionLabel>
        <div style={{ padding:'0 14px' }}>
          <div style={{ background:C.paper, borderRadius:16, border:`1px solid ${C.line}`, overflow:'hidden' }}>
            {mtg.bring.map((b, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 14px', borderTop: i ? `1px solid ${C.line}` : 'none' }}>
                <div style={{ width:24, height:24, borderRadius:8, background:'rgba(199,125,51,.14)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon name="check" size={15} color={C.amberDeep}/>
                </div>
                <span style={{ fontFamily:F.sans, fontSize:14, color:C.ink, lineHeight:1.3 }}>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RSVP */}
        <SectionLabel right={`${going.length} going`}>Who&rsquo;s in</SectionLabel>
        <div style={{ padding:'0 14px' }}>
          <div style={{ background:C.paper, borderRadius:16, border:`1px solid ${C.line}`, padding:14, boxShadow:'var(--ww-card)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
              <AvatarStack ids={going.map(m => m.id)} size={32} max={6}/>
              <div style={{ fontFamily:F.sans, fontSize:13, color:C.inkSoft, flex:1 }}>
                {going.length} of {WW.members.length} confirmed
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
              {WW.members.map(m => {
                const st = STATUS[rsvp[m.id]] || STATUS.pending;
                return (
                  <div key={m.id} style={{ display:'flex', alignItems:'center', gap:11, padding:'7px 0' }}>
                    <Avatar m={m} size={30}/>
                    <span style={{ fontFamily:F.sans, fontWeight:600, fontSize:14, color:C.ink, flex:1 }}>
                      {m.name}{m.you && <span style={{ color:C.inkMute, fontWeight:500 }}> · you</span>}
                      {m.id === mtg.host && <Chip tone="wax" style={{ marginLeft:8, height:20, fontSize:10 }}>HOST</Chip>}
                    </span>
                    <span style={{ fontFamily:F.sans, fontWeight:600, fontSize:12.5, color:st.tone }}>{st.label}</span>
                  </div>
                );
              })}
            </div>

            {/* My RSVP control */}
            <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${C.line}` }}>
              <div style={{ fontFamily:F.sans, fontSize:12.5, color:C.inkMute, marginBottom:8 }}>Your call</div>
              <div style={{ display:'flex', gap:8 }}>
                {['going','maybe','out'].map(k => {
                  const on = myStatus === k;
                  const tone = STATUS[k].tone;
                  return (
                    <button key={k} onClick={() => onRsvp(k)} style={{
                      flex:1, border:`1.5px solid ${on ? tone : C.line}`, cursor:'pointer',
                      background: on ? tone : C.paper, color: on ? '#fff' : C.inkSoft,
                      borderRadius:11, padding:'11px 0', fontFamily:F.sans, fontWeight:700, fontSize:14,
                      transition:'all var(--dur-fast) var(--ease-snappy)',
                      boxShadow: on ? '0 6px 16px rgba(39,23,8,.14)' : 'none',
                    }}>{STATUS[k].label}</button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* After this — next episode */}
        <SectionLabel>After this</SectionLabel>
        <div style={{ padding:'0 14px' }}>
          {myTurn ? (
            <div onClick={onActivate} style={{
              position:'relative', overflow:'hidden', cursor:'pointer', borderRadius:18,
              background:`radial-gradient(120% 100% at 100% 0%, rgba(199,125,51,.5) 0%, rgba(199,125,51,0) 55%), linear-gradient(155deg, #2A1A0E, #190E06)`,
              border:`1px solid ${C.lineDark}`, padding:'16px 16px', color:C.onDark, boxShadow:'0 12px 30px rgba(39,23,8,.22)',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:13 }}>
                <div style={{ width:42, height:42, borderRadius:13, flexShrink:0, background:C.amber, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'inset 0 1px 0 rgba(255,255,255,.25)' }}>
                  <Icon name="plus" size={22} color={C.espresso}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:F.disp, fontWeight:600, fontSize:10.5, letterSpacing:'.14em', color:C.amberBright }}>IT’S YOUR TURN · EPISODE {mtg.no + 1}</div>
                  <div style={{ fontFamily:F.sans, fontWeight:700, fontSize:16, color:C.onDark, marginTop:1 }}>Activate next episode</div>
                  <div style={{ fontFamily:F.sans, fontSize:12.5, color:C.onDarkSoft, marginTop:2 }}>Set the date, venue &amp; the bottle to rank</div>
                </div>
                <Icon name="chevron" size={18} color={C.amberBright}/>
              </div>
            </div>
          ) : (
            <div style={{
              display:'flex', alignItems:'center', gap:13, borderRadius:18,
              background:C.paper, border:`1px solid ${C.line}`, padding:'15px 16px', boxShadow:'var(--ww-card)',
            }}>
              <Avatar m={nextHostM} size={42}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:F.disp, fontWeight:600, fontSize:10.5, letterSpacing:'.14em', color:C.inkMute }}>EPISODE {mtg.no + 1}</div>
                <div style={{ fontFamily:F.sans, fontWeight:700, fontSize:16, color:C.ink, marginTop:1 }}>{nextHostM ? `${nextHostM.name}’s turn to host` : 'Up next'}</div>
                <div style={{ fontFamily:F.sans, fontSize:12.5, color:C.inkMute, marginTop:2 }}>Waiting on them to set it up</div>
              </div>
              <Icon name="clock" size={18} color={C.inkMute}/>
            </div>
          )}
        </div>

        {/* Past episodes */}
        {episodes.length > 0 && (
          <>
            <SectionLabel right={`${episodes.length}`}>Past episodes</SectionLabel>
            <div style={{ padding:'0 14px', display:'flex', flexDirection:'column', gap:8 }}>
              {episodes.map((ep, i) => {
                const epHost = WW.byId(ep.host);
                const epBottle = WW.whiskey(ep.bottle);
                return (
                  <div key={i} onClick={() => setSelected(ep)} style={{ display:'flex', alignItems:'center', gap:12, background:C.paper, borderRadius:14, border:`1px solid ${C.line}`, padding:'11px 13px', boxShadow:'var(--ww-card)', cursor:'pointer' }}>
                    {epBottle && <div style={{ width:36, height:36, borderRadius:'50%', background:epBottle.liquid, flexShrink:0, boxShadow:'inset 0 -4px 8px rgba(0,0,0,.25), inset 0 3px 4px rgba(255,255,255,.25)' }}/>}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <span className="tab-num" style={{ fontFamily:F.disp, fontWeight:600, fontSize:10.5, letterSpacing:'.1em', color:C.amberDeep }}>S{ep.season || 1} · E{ep.no}</span>
                        <span style={{ fontFamily:F.sans, fontWeight:700, fontSize:14, color:C.ink, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{ep.theme}</span>
                      </div>
                      <div style={{ fontFamily:F.sans, fontSize:12, color:C.inkMute, marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        {epHost ? `${epHost.name} hosted` : 'Hosted'}{epBottle ? ` · ${epBottle.name}` : ''}
                      </div>
                    </div>
                    {epHost && <Avatar m={epHost} size={28}/>}
                    <Icon name="chevron" size={16} color={C.inkMute}/>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div style={{ textAlign:'center', padding:'18px 24px 6px', fontFamily:F.sans, fontSize:11, color:C.inkMute, lineHeight:1.5 }}>
          Sip slow. Hydrate. Never drink &amp; drive.
        </div>
      </div>

      <EpisodeSheet episode={selected} onClose={() => setSelected(null)}/>
      </div>
    );
  }

  function Tile({ icon, label, children }) {
    return (
      <div style={{ background:C.paper, borderRadius:16, border:`1px solid ${C.line}`, padding:'13px 14px', boxShadow:'var(--ww-card)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:7 }}>
          <Icon name={icon} size={15} color={C.amberDeep}/>
          <span style={{ fontFamily:F.disp, fontWeight:600, fontSize:10.5, letterSpacing:'.13em', color:C.inkMute }}>{label.toUpperCase()}</span>
        </div>
        <div style={{ fontFamily:F.sans, fontWeight:700, fontSize:14, color:C.ink, lineHeight:1.25 }}>{children}</div>
      </div>
    );
  }

  function SectionLabel({ children, right }) {
    return (
      <div style={{ display:'flex', alignItems:'baseline', padding:'18px 16px 9px' }}>
        <span style={{ fontFamily:F.disp, fontWeight:600, fontSize:12, letterSpacing:'.12em', color:C.inkSoft, flex:1, textTransform:'uppercase' }}>{children}</span>
        {right && <span style={{ fontFamily:F.sans, fontWeight:700, fontSize:12.5, color:C.amberDeep }}>{right}</span>}
      </div>
    );
  }

  // Read-only detail view for a past episode, opened from the "Past episodes"
  // list. Mirrors the meeting layout (hero, host/venue, bottle, bring, roster)
  // using the snapshot stored when the episode was activated.
  function EpisodeSheet({ episode, onClose }) {
    if (!episode) return null;
    const ep = episode;
    const host = WW.byId(ep.host);
    const bottle = WW.whiskey(ep.bottle);
    const rsvp = ep.rsvp || {};
    const went = WW.members.filter(m => rsvp[m.id] === 'going');
    const label = { fontFamily:F.disp, fontWeight:600, fontSize:11.5, letterSpacing:'.12em', color:C.inkSoft, textTransform:'uppercase' };

    return (
      <div onClick={onClose} style={{ position:'absolute', inset:0, zIndex:46, background:'rgba(25,14,6,.5)', display:'flex', flexDirection:'column', justifyContent:'flex-end', animation:'wwfade 180ms ease' }}>
        <div onClick={e => e.stopPropagation()} style={{ background:C.cream, borderRadius:'24px 24px 0 0', maxHeight:'94%', display:'flex', flexDirection:'column', animation:'wwslideup 300ms var(--ease-snappy)' }}>
          {/* hero header */}
          <div style={{ flexShrink:0, padding:'14px 18px 16px', borderRadius:'24px 24px 0 0', color:C.onDark,
            background:`radial-gradient(120% 90% at 85% -10%, rgba(199,125,51,.5) 0%, rgba(199,125,51,0) 55%), linear-gradient(160deg, #2A1A0E 0%, #190E06 100%)` }}>
            <div style={{ width:40, height:4, borderRadius:99, background:'rgba(248,241,230,.25)', margin:'0 auto 14px' }}/>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <Chip tone="dark"><Icon name="calendar" size={13} color={C.amberBright}/> Season {ep.season || 1} · Ep {ep.no}</Chip>
              <button onClick={onClose} style={{ width:30, height:30, borderRadius:999, border:'none', background:'rgba(248,241,230,.10)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon name="close" size={16} color={C.onDarkSoft}/>
              </button>
            </div>
            <div style={{ fontFamily:F.sans, fontWeight:700, fontSize:26, lineHeight:1.04, letterSpacing:'-.02em' }}>{ep.theme}</div>
            {ep.subtitle && <div style={{ fontFamily:F.sans, fontSize:14, color:C.onDarkSoft, marginTop:6 }}>{ep.subtitle}</div>}
          </div>

          {/* body */}
          <div className="no-scrollbar" style={{ overflowY:'auto', padding:'14px 14px 18px' }}>
            {/* host + venue */}
            <div style={{ display:'flex', alignItems:'center', gap:12, background:C.paper, borderRadius:16, border:`1px solid ${C.line}`, padding:14, boxShadow:'var(--ww-card)' }}>
              <Avatar m={host} size={42}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:F.sans, fontSize:12, color:C.inkMute }}>Hosted by</div>
                <div style={{ fontFamily:F.sans, fontWeight:700, fontSize:16, color:C.ink }}>{host ? host.name : '—'}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ display:'flex', alignItems:'center', gap:5, justifyContent:'flex-end', color:C.ink }}>
                  <Icon name="pin" size={14} color={C.amberDeep}/>
                  <span style={{ fontFamily:F.sans, fontWeight:600, fontSize:13 }}>{ep.venue}</span>
                </div>
                {ep.address && <div style={{ fontFamily:F.sans, fontSize:11.5, color:C.inkMute, marginTop:2 }}>{ep.address}</div>}
              </div>
            </div>

            {/* when + buy-in */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:10 }}>
              <Tile icon="clock" label="When">{fmtDate(ep.target)}</Tile>
              <Tile icon="bag" label="Buy-in">${ep.buyIn} a head</Tile>
            </div>

            {/* house pour */}
            {bottle && (
              <div style={{ display:'flex', alignItems:'center', gap:14, background:C.paper, borderRadius:16, border:`1px solid ${C.line}`, padding:14, boxShadow:'var(--ww-card)', marginTop:10 }}>
                <div style={{ width:46, height:46, borderRadius:'50%', background:bottle.liquid, flexShrink:0, boxShadow:'inset 0 -6px 10px rgba(0,0,0,.25), inset 0 4px 6px rgba(255,255,255,.25)' }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:F.disp, fontWeight:600, fontSize:10.5, letterSpacing:'.14em', color:C.amberDeep }}>HOUSE POUR</div>
                  <div style={{ fontFamily:F.sans, fontWeight:700, fontSize:16, color:C.ink, marginTop:1 }}>{bottle.name}</div>
                  <div style={{ fontFamily:F.sans, fontSize:12.5, color:C.inkMute }}>{bottle.region} · {bottle.type} · {bottle.abv}% ABV</div>
                </div>
                {bottle.raters > 0 && (
                  <div style={{ textAlign:'center' }}>
                    <div className="tab-num" style={{ fontFamily:F.num, fontWeight:700, fontSize:18, color:C.ink, lineHeight:1 }}>{bottle.total.toFixed(2)}</div>
                    <div style={{ fontFamily:F.sans, fontSize:10, color:C.inkMute, marginTop:2 }}>/ 15</div>
                  </div>
                )}
              </div>
            )}

            {/* what to bring */}
            {ep.bring && ep.bring.length > 0 && (
              <>
                <span style={{ ...label, display:'block', margin:'18px 2px 9px' }}>On the bar — what to bring</span>
                <div style={{ background:C.paper, borderRadius:16, border:`1px solid ${C.line}`, overflow:'hidden' }}>
                  {ep.bring.map((b, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderTop: i ? `1px solid ${C.line}` : 'none' }}>
                      <div style={{ width:22, height:22, borderRadius:7, background:'rgba(199,125,51,.14)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Icon name="check" size={14} color={C.amberDeep}/>
                      </div>
                      <span style={{ fontFamily:F.sans, fontSize:14, color:C.ink, lineHeight:1.3 }}>{b}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* who came */}
            <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', margin:'18px 2px 9px' }}>
              <span style={label}>Who was there</span>
              <span style={{ fontFamily:F.sans, fontWeight:700, fontSize:12.5, color:C.amberDeep }}>{went.length} came</span>
            </div>
            <div style={{ background:C.paper, borderRadius:16, border:`1px solid ${C.line}`, padding:14, boxShadow:'var(--ww-card)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                <AvatarStack ids={went.map(m => m.id)} size={32} max={6}/>
                <div style={{ fontFamily:F.sans, fontSize:13, color:C.inkSoft, flex:1 }}>{went.length} of {WW.members.length} attended</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                {WW.members.map(m => {
                  const st = PAST_STATUS[rsvp[m.id]] || PAST_STATUS.pending;
                  return (
                    <div key={m.id} style={{ display:'flex', alignItems:'center', gap:11, padding:'7px 0' }}>
                      <Avatar m={m} size={30}/>
                      <span style={{ fontFamily:F.sans, fontWeight:600, fontSize:14, color:C.ink, flex:1 }}>
                        {m.name}{m.you && <span style={{ color:C.inkMute, fontWeight:500 }}> · you</span>}
                        {m.id === ep.host && <Chip tone="wax" style={{ marginLeft:8, height:20, fontSize:10 }}>HOST</Chip>}
                      </span>
                      <span style={{ fontFamily:F.sans, fontWeight:600, fontSize:12.5, color:st.tone }}>{st.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  window.MeetingScreen = MeetingScreen;
  window.SectionLabel = SectionLabel;
})();
