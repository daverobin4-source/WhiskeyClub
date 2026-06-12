/* screen-board.jsx — The leaderboard. Podium + ranked rows, reveal on mount. */
(function () {
  const { useState, useEffect } = React;

  const GROUPS = ['All', 'Scotch', 'Japan', 'Bourbon', 'Other'];
  function groupOf(k) {
    if (k.region === 'Japan') return 'Japan';
    if (k.type === 'Bourbon' || k.region === 'Kentucky') return 'Bourbon';
    if (['Islay','Speyside','Skye','Campbeltown','Highland','Lowland'].includes(k.region)) return 'Scotch';
    return 'Other';
  }

  function LiquidDisc({ color, size = 44 }) {
    return (
      <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
        <div style={{ width:size, height:size, borderRadius:'50%', background:color,
          boxShadow:'inset 0 -6px 11px rgba(0,0,0,.28), inset 0 4px 7px rgba(255,255,255,.28)' }}/>
        <div style={{ position:'absolute', top:size*0.16, left:size*0.2, width:size*0.26, height:size*0.16, borderRadius:'50%', background:'rgba(255,255,255,.4)', filter:'blur(1px)' }}/>
      </div>
    );
  }

  function Score15({ total, run, delay = 0, size = 22, color = C.ink }) {
    const v = useCountUp(total, { run, dur:1000 });
    return (
      <span style={{ fontFamily:F.num, fontWeight:700, fontSize:size, color, fontVariantNumeric:'tabular-nums', letterSpacing:'-.01em' }}>
        {v.toFixed(2)}<span style={{ fontSize:size*0.5, color:C.inkMute, fontWeight:500 }}>/15</span>
      </span>
    );
  }

  function Podium({ list, run }) {
    // order: 2nd, 1st, 3rd
    const order = [list[1], list[0], list[2]].filter(Boolean);
    const meta = {
      1: { h:96, medal:C.gold,   ring:C.gold,   disc:54 },
      2: { h:74, medal:'#C9C2B4', ring:'#CBB994', disc:46 },
      3: { h:58, medal:'#C98A4E', ring:'#C98A4E', disc:46 },
    };
    return (
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:10, padding:'8px 16px 4px' }}>
        {order.map((k) => {
          const m = meta[k.rank];
          return (
            <div key={k.id} style={{ flex:1, maxWidth:108, display:'flex', flexDirection:'column', alignItems:'center' }}>
              <div style={{
                opacity: run ? 1 : 0, transform: run ? 'translateY(0)' : 'translateY(12px)',
                transition:`all 520ms var(--ease-snappy) ${k.rank === 1 ? 360 : k.rank === 2 ? 200 : 60}ms`,
                display:'flex', flexDirection:'column', alignItems:'center',
              }}>
                <div style={{ position:'relative', marginBottom:8 }}>
                  <LiquidDisc color={k.liquid} size={m.disc}/>
                  <div style={{ position:'absolute', inset:-3, borderRadius:'50%', boxShadow:`0 0 0 2.5px ${m.ring}${k.rank===1?'':''}`, ...(k.rank===1?{filter:`drop-shadow(0 0 10px ${C.gold})`}:{}) }}/>
                  <div style={{
                    position:'absolute', bottom:-7, left:'50%', transform:'translateX(-50%)',
                    width:22, height:22, borderRadius:'50%', background:m.medal, color:'#3A2410',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:F.num, fontWeight:700, fontSize:12, border:'2px solid var(--ww-cream)',
                  }}>{k.rank}</div>
                </div>
                {k.rank === 1 && <Icon name="star" size={16} color={C.gold} style={{ marginBottom:2 }}/>}
                <div style={{ fontFamily:F.sans, fontWeight:700, fontSize:12.5, color:C.ink, textAlign:'center', lineHeight:1.15, maxWidth:104, height:30, overflow:'hidden' }}>{k.name}</div>
                <div style={{ marginTop:2 }}><Score15 total={k.total} run={run} size={16} color={k.rank===1?C.amberDeep:C.ink}/></div>
              </div>
              <div style={{
                width:'100%', marginTop:9, borderRadius:'10px 10px 0 0',
                background: k.rank===1 ? `linear-gradient(180deg, ${C.amber}, ${C.amberDeep})` : C.sand2,
                height: run ? m.h : 0, transition:`height 620ms var(--ease-snappy) ${k.rank===1?320:k.rank===2?180:40}ms`,
                display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:8,
              }}>
                <span style={{ fontFamily:F.num, fontWeight:700, fontSize:k.rank===1?22:18, color: k.rank===1 ? '#fff' : C.malt }}>{k.rank}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function Row({ k, idx, run, expanded, onToggle }) {
    const delay = 420 + idx * 70;
    return (
      <div style={{
        background:C.paper, borderRadius:14, marginBottom:8,
        border:`1.5px solid ${k.userRated ? C.amber : C.line}`,
        boxShadow: k.userRated ? '0 6px 18px rgba(199,125,51,.16)' : 'var(--ww-card)',
        overflow:'hidden',
        opacity: run ? 1 : 0, transform: run ? 'none' : 'translateY(10px)',
        transition:`opacity 460ms var(--ease-snappy) ${delay}ms, transform 460ms var(--ease-snappy) ${delay}ms`,
      }}>
        <div onClick={onToggle} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 13px', cursor:'pointer' }}>
          <span style={{ fontFamily:F.num, fontWeight:700, fontSize:16, color:C.inkMute, width:22, textAlign:'center', fontVariantNumeric:'tabular-nums' }}>{k.rank}</span>
          <LiquidDisc color={k.liquid} size={40}/>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:F.sans, fontWeight:700, fontSize:14.5, color:C.ink, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {k.name}
              {k.userRated && <Chip tone="amber" style={{ marginLeft:7, height:18, fontSize:9.5, padding:'0 6px' }}>YOU RATED</Chip>}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginTop:4 }}>
              <div style={{ flex:1, maxWidth:120 }}><Meter value={k.total} max={15} color={k.liquid} track={C.sand} height={5} animate={run} delay={delay}/></div>
              <span style={{ fontFamily:F.sans, fontSize:11, color:C.inkMute }}>{k.effRaters} {k.effRaters===1?'rater':'raters'}</span>
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <Score15 total={k.total} run={run} size={18}/>
          </div>
        </div>
        {expanded && (
          <div style={{ padding:'2px 14px 14px', borderTop:`1px solid ${C.line}`, background:C.cream }}>
            <div style={{ display:'flex', gap:7, margin:'12px 0 12px' }}>
              <Chip tone="line">{k.region}</Chip>
              <Chip tone="line">{k.type}</Chip>
              {k.age && <Chip tone="line">{k.age}yo</Chip>}
              <Chip tone="line">{k.abv}%</Chip>
            </div>
            {[['aroma','Aroma',k.avgA],['taste','Taste',k.avgT],['finish','Finish',k.avgF]].map(([ic,lab,val]) => (
              <div key={lab} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:9 }}>
                <Icon name={ic} size={16} color={C.amberDeep}/>
                <span style={{ fontFamily:F.disp, fontWeight:600, fontSize:11, letterSpacing:'.12em', color:C.inkSoft, width:54 }}>{lab.toUpperCase()}</span>
                <div style={{ flex:1 }}><Meter value={val} max={5} color={C.amber} track={C.sand2} height={6}/></div>
                <span style={{ fontFamily:F.num, fontWeight:700, fontSize:13, color:C.ink, width:34, textAlign:'right', fontVariantNumeric:'tabular-nums' }}>{val.toFixed(2)}</span>
              </div>
            ))}
            <div style={{ fontFamily:F.sans, fontStyle:'italic', fontSize:13, color:C.inkSoft, lineHeight:1.45, marginTop:10, paddingLeft:2 }}>&ldquo;{k.note}&rdquo;</div>
          </div>
        )}
      </div>
    );
  }

  function BoardScreen({ userScores, justRated }) {
    const [filter, setFilter] = useState('All');
    const [run, setRun] = useState(false);
    const [open, setOpen] = useState(justRated || null);
    useEffect(() => { const t = setTimeout(() => setRun(true), 60); return () => clearTimeout(t); }, []);

    let list = WWStore.computeBoard(userScores);
    const counts = {};
    GROUPS.forEach(g => counts[g] = g === 'All' ? list.length : list.filter(k => groupOf(k) === g).length);
    if (filter !== 'All') list = list.filter(k => groupOf(k) === filter).map((k, i) => Object.assign({}, k));

    const showPodium = filter === 'All' && list.length >= 3;
    const rest = showPodium ? list.slice(3) : list;

    return (
      <div className="no-scrollbar" style={{ flex:1, overflowY:'auto', background:C.cream, paddingBottom:28 }}>
        {/* heading */}
        <div style={{ padding:'16px 16px 4px' }}>
          <div style={{ fontFamily:F.sans, fontWeight:700, fontSize:26, color:C.ink, letterSpacing:'-.02em' }}>The Leaderboard</div>
          <div style={{ fontFamily:F.sans, fontSize:13.5, color:C.inkMute, marginTop:2 }}>{list.length} drams ranked · club average out of 15</div>
        </div>

        {/* filter chips */}
        <div className="no-scrollbar" style={{ display:'flex', gap:8, padding:'10px 16px 6px', overflowX:'auto' }}>
          {GROUPS.map(g => {
            const on = g === filter;
            return (
              <button key={g} onClick={() => setFilter(g)} disabled={counts[g]===0} style={{
                flexShrink:0, border:'none', cursor: counts[g]===0?'default':'pointer',
                background: on ? C.ink : (counts[g]===0 ? C.sand : C.paper),
                color: on ? C.cream : (counts[g]===0 ? C.inkMute : C.inkSoft),
                opacity: counts[g]===0 ? .5 : 1,
                borderRadius:999, padding:'8px 14px', fontFamily:F.sans, fontWeight:600, fontSize:13,
                boxShadow: on ? 'none' : 'var(--ww-card)',
                transition:'all var(--dur-fast) var(--ease-snappy)',
              }}>{g}</button>
            );
          })}
        </div>

        {showPodium && <Podium list={list} run={run}/>}

        <div style={{ padding: showPodium ? '8px 14px 0' : '6px 14px 0' }}>
          {showPodium && rest.length > 0 && (
            <div style={{ fontFamily:F.disp, fontWeight:600, fontSize:11, letterSpacing:'.13em', color:C.inkMute, padding:'8px 2px 10px' }}>THE CHASING PACK</div>
          )}
          {rest.map((k, i) => (
            <Row key={k.id} k={k} idx={i} run={run} expanded={open === k.id} onToggle={() => setOpen(open === k.id ? null : k.id)}/>
          ))}
        </div>

        <div style={{ textAlign:'center', padding:'12px 24px 4px', fontFamily:F.sans, fontSize:12, color:C.inkMute }}>
          Tap a dram for the full breakdown.
        </div>
      </div>
    );
  }

  window.BoardScreen = BoardScreen;
})();
