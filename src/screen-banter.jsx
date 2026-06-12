/* screen-banter.jsx — club chatter: composer, posts, score cards, reactions. */
(function () {
  const { useState, useRef } = React;

  function ScoreCard({ score }) {
    const k = WW.whiskey(score.whiskey);
    if (!k) return null;
    const total = +(score.a + score.t + score.f).toFixed(2);
    const v = WWStore.verdict(total);
    return (
      <div style={{ display:'flex', alignItems:'center', gap:12, background:C.cream, borderRadius:13, border:`1px solid ${C.line}`, padding:'11px 13px', marginTop:11 }}>
        <div style={{ width:40, height:40, borderRadius:'50%', background:k.liquid, flexShrink:0, boxShadow:'inset 0 -5px 9px rgba(0,0,0,.26), inset 0 3px 5px rgba(255,255,255,.26)' }}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:F.sans, fontWeight:700, fontSize:14, color:C.ink, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{k.name}</div>
          <div style={{ display:'flex', gap:10, marginTop:3 }}>
            {[['A',score.a],['T',score.t],['F',score.f]].map(([l,val]) => (
              <span key={l} style={{ fontFamily:F.sans, fontSize:11.5, color:C.inkMute }}>
                <span style={{ fontFamily:F.disp, fontWeight:600, letterSpacing:'.08em' }}>{l}</span> <b style={{ color:C.inkSoft, fontFamily:F.num }}>{val.toFixed(2)}</b>
              </span>
            ))}
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontFamily:F.num, fontWeight:700, fontSize:19, color:C.amberDeep, fontVariantNumeric:'tabular-nums' }}>{total.toFixed(2)}<span style={{ fontSize:11, color:C.inkMute, fontWeight:500 }}>/15</span></div>
          <div style={{ fontFamily:F.disp, fontWeight:600, fontSize:9, letterSpacing:'.1em', color:v.color, marginTop:1 }}>{v.label.toUpperCase()}</div>
        </div>
      </div>
    );
  }

  function ReactionBar({ post, onReact }) {
    return (
      <div style={{ display:'flex', alignItems:'center', gap:7, marginTop:12 }}>
        {WW.REACTIONS.map(emo => {
          const count = post.reactions[emo] || 0;
          const on = post.mine === emo;
          return (
            <button key={emo} onClick={() => onReact(post.id, emo)} style={{
              display:'flex', alignItems:'center', gap:5, height:32, padding:'0 10px',
              borderRadius:999, cursor:'pointer',
              background: on ? 'rgba(199,125,51,.16)' : C.cream,
              border:`1.5px solid ${on ? C.amber : C.line}`,
              transition:'all var(--dur-fast) var(--ease-snappy)',
            }}>
              <span style={{ fontSize:14, lineHeight:1, filter: count===0 && !on ? 'grayscale(.4) opacity(.7)' : 'none' }}>{emo}</span>
              {count > 0 && <span style={{ fontFamily:F.num, fontWeight:700, fontSize:12, color: on ? C.amberDeep : C.inkSoft, fontVariantNumeric:'tabular-nums' }}>{count}</span>}
            </button>
          );
        })}
        <div style={{ flex:1 }}/>
        <div style={{ display:'flex', alignItems:'center', gap:5, color:C.inkMute }}>
          <Icon name="chat" size={17} color={C.inkMute}/>
          <span style={{ fontFamily:F.sans, fontWeight:600, fontSize:12.5 }}>{post.comments}</span>
        </div>
      </div>
    );
  }

  function Post({ post, onReact }) {
    const author = WW.byId(post.author);
    return (
      <div style={{ background:C.paper, borderRadius:16, border:`1px solid ${C.line}`, padding:'13px 15px', marginBottom:10, boxShadow:'var(--ww-card)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:11 }}>
          <Avatar m={author} size={40}/>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <span style={{ fontFamily:F.sans, fontWeight:700, fontSize:14.5, color:C.ink }}>{author.name}</span>
              {author.id === WW.meeting.host && <Chip tone="wax" style={{ height:18, fontSize:9.5, padding:'0 6px' }}>HOST</Chip>}
              {author.you && <Chip tone="amber" style={{ height:18, fontSize:9.5, padding:'0 6px' }}>YOU</Chip>}
            </div>
            <div style={{ fontFamily:F.sans, fontSize:12, color:C.inkMute, marginTop:1 }}>{post.time === 'just now' ? 'just now' : post.time + ' ago'}</div>
          </div>
        </div>
        <div style={{ fontFamily:F.sans, fontSize:14.5, color:C.ink, lineHeight:1.45, marginTop:11 }}>{post.text}</div>
        {post.score && <ScoreCard score={post.score}/>}
        <ReactionBar post={post} onReact={onReact}/>
      </div>
    );
  }

  function Composer({ onPost }) {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('');
    const ref = useRef(null);
    function send() {
      const t = text.trim(); if (!t) return;
      onPost(t); setText(''); setOpen(false);
    }
    return (
      <div style={{ background:C.paper, borderRadius:16, border:`1px solid ${C.line}`, padding:'12px 14px', marginBottom:12, boxShadow:'var(--ww-card)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:11 }}>
          <Avatar m={WW.me} size={36}/>
          {!open ? (
            <button onClick={() => { setOpen(true); setTimeout(() => ref.current && ref.current.focus(), 30); }} style={{
              flex:1, textAlign:'left', background:C.cream, border:`1px solid ${C.line}`, borderRadius:999,
              padding:'10px 16px', fontFamily:F.sans, fontSize:14, color:C.inkMute, cursor:'text',
            }}>Start some banter…</button>
          ) : (
            <div style={{ fontFamily:F.sans, fontWeight:700, fontSize:14, color:C.ink }}>New banter</div>
          )}
        </div>
        {open && (
          <div style={{ marginTop:11 }}>
            <textarea ref={ref} value={text} onChange={e => setText(e.target.value)} rows={3}
              placeholder="What&rsquo;s the verdict, then?" style={{
                width:'100%', resize:'none', border:`1px solid ${C.line}`, borderRadius:12,
                padding:'11px 13px', fontFamily:F.sans, fontSize:14, color:C.ink, outline:'none',
                background:C.cream, lineHeight:1.4,
              }}/>
            <div style={{ display:'flex', gap:9, marginTop:10, justifyContent:'flex-end' }}>
              <button onClick={() => { setOpen(false); setText(''); }} style={{ background:'none', border:'none', color:C.inkMute, fontFamily:F.sans, fontWeight:600, fontSize:14, cursor:'pointer', padding:'9px 12px' }}>Cancel</button>
              <button onClick={send} disabled={!text.trim()} style={{
                display:'flex', alignItems:'center', gap:7, background: text.trim() ? C.amber : C.sand2, border:'none',
                color: text.trim() ? '#fff' : C.inkMute, borderRadius:11, padding:'9px 18px',
                fontFamily:F.sans, fontWeight:700, fontSize:14, cursor: text.trim()?'pointer':'default',
                boxShadow: text.trim() ? 'var(--ww-glow-amber)' : 'none',
              }}><Icon name="send" size={15} color={text.trim()?'#fff':C.inkMute}/> Post</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function BanterScreen({ posts, onReact, onPost }) {
    const [tab, setTab] = useState('All');
    const tabs = ['All', 'Reviews'];
    const shown = tab === 'Reviews' ? posts.filter(p => p.score) : posts;
    return (
      <div className="no-scrollbar" style={{ flex:1, overflowY:'auto', background:C.cream, paddingBottom:28 }}>
        {/* sub tabs */}
        <div style={{ display:'flex', gap:8, padding:'14px 16px 4px' }}>
          {tabs.map(t => {
            const on = t === tab;
            return (
              <button key={t} onClick={() => setTab(t)} style={{
                border:'none', cursor:'pointer', borderRadius:999, padding:'8px 16px',
                background: on ? C.ink : C.paper, color: on ? C.cream : C.inkSoft,
                fontFamily:F.sans, fontWeight:600, fontSize:13.5,
                boxShadow: on ? 'none' : 'var(--ww-card)',
              }}>{t}{t==='Reviews' && <span style={{ opacity:.6, marginLeft:5 }}>{posts.filter(p=>p.score).length}</span>}</button>
            );
          })}
        </div>
        <div style={{ padding:'10px 16px 0' }}>
          <Composer onPost={onPost}/>
          {shown.map(p => <Post key={p.id} post={p} onReact={onReact}/>)}
          {shown.length === 0 && (
            <div style={{ textAlign:'center', padding:'50px 30px', color:C.inkMute }}>
              <Icon name="chat" size={36} color={C.sand2}/>
              <div style={{ fontFamily:F.sans, fontWeight:700, fontSize:16, color:C.inkSoft, marginTop:10 }}>No reviews yet</div>
              <div style={{ fontFamily:F.sans, fontSize:13.5, marginTop:4 }}>Rate a dram and it&rsquo;ll show up here.</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  window.BanterScreen = BanterScreen;
})();
