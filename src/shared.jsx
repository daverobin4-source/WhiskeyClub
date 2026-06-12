/* shared.jsx — Wellness & Whiskey shared UI.
   Exposes palette (C/F), Avatar, AvatarStack, Wordmark, AppHeader, TabBar,
   Meter, Chip, Pill, ScoreBig, useCountdown, fmtScore. All on window. */
const { useState, useEffect, useRef, useCallback } = React;

const C = {
  espresso:'var(--ww-espresso)', oak:'var(--ww-oak)', oakSoft:'var(--ww-oak-soft)',
  cream:'var(--ww-cream)', paper:'var(--ww-paper)', sand:'var(--ww-sand)', sand2:'var(--ww-sand-2)',
  amber:'var(--ww-amber)', amberBright:'var(--ww-amber-bright)', amberDeep:'var(--ww-amber-deep)',
  gold:'var(--ww-gold)', malt:'var(--ww-malt)',
  ink:'var(--ww-ink)', inkSoft:'var(--ww-ink-soft)', inkMute:'var(--ww-ink-mute)',
  onDark:'var(--ww-on-dark)', onDarkSoft:'var(--ww-on-dark-soft)', onDarkMute:'var(--ww-on-dark-mute)',
  line:'var(--ww-line)', lineDark:'var(--ww-line-dark)',
  wax:'var(--ww-wax)', forest:'var(--ww-forest)', rust:'var(--ww-rust)',
};
const F = {
  sans:"'Circular Std', -apple-system, sans-serif",
  disp:"'Barlow Semi Condensed','Circular Std',sans-serif",
  num:"'Rubik','Circular Std',sans-serif",
};

const fmtScore = (n) => (n == null ? '–' : Number(n).toFixed(2));

/* ---- Avatar -------------------------------------------------------------- */
function Avatar({ m, size = 36, ring, style = {} }) {
  if (!m) return null;
  const initials = m.name.slice(0, 1).toUpperCase();
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', background:m.color,
      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
      color:'#fff', fontFamily:F.sans, fontWeight:700, fontSize:size*0.42,
      boxShadow: ring ? `0 0 0 2px ${ring}` : 'none',
      letterSpacing:'-.01em', ...style,
    }}>{initials}</div>
  );
}

function AvatarStack({ ids, size = 26, max = 5, gap = -8 }) {
  const list = ids.slice(0, max);
  const extra = ids.length - list.length;
  return (
    <div style={{ display:'flex', alignItems:'center' }}>
      {list.map((id, i) => (
        <div key={id} style={{ marginLeft: i ? gap : 0, zIndex: list.length - i }}>
          <Avatar m={WW.byId(id)} size={size} ring="var(--ww-paper)"/>
        </div>
      ))}
      {extra > 0 && (
        <div style={{
          marginLeft:gap, width:size, height:size, borderRadius:'50%',
          background:C.sand2, color:C.inkSoft, fontFamily:F.sans, fontWeight:700,
          fontSize:size*0.36, display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 0 0 2px var(--ww-paper)', zIndex:0,
        }}>+{extra}</div>
      )}
    </div>
  );
}

/* ---- Wordmark ------------------------------------------------------------ */
function Wordmark({ dark = true }) {
  const txt = dark ? C.onDark : C.ink;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:9 }}>
      <div style={{
        width:30, height:30, borderRadius:9, background:C.amber,
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:'inset 0 1px 0 rgba(255,255,255,.25)',
      }}>
        <Icon name="glass-fill" size={19} color={C.espresso}/>
      </div>
      <div style={{ lineHeight:1 }}>
        <div style={{ fontFamily:F.disp, fontWeight:600, fontSize:15, letterSpacing:'.10em', color:txt }}>WELLNESS &amp; WHISKEY</div>
        <div style={{ fontFamily:F.sans, fontWeight:500, fontSize:9.5, letterSpacing:'.16em', color:C.amberBright, marginTop:3, textTransform:'uppercase' }}>Tasting Society</div>
      </div>
    </div>
  );
}

/* ---- App header ---------------------------------------------------------- */
function AppHeader({ meeting = WW.meeting, mobile = false }) {
  const season = meeting.season || 1;
  return (
    <div style={{ background:C.espresso, flexShrink:0, paddingTop: mobile ? 'calc(env(safe-area-inset-top, 0px) + 16px)' : 52, paddingBottom:13, position:'relative' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px' }}>
        <Wordmark/>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            display:'flex', alignItems:'center', gap:6, height:34, padding:'0 11px',
            borderRadius:999, background:'rgba(248,241,230,.08)', border:`1px solid ${C.lineDark}`,
          }}>
            <Icon name="trophy-fill" size={14} color={C.gold}/>
            <span className="tab-num" style={{ fontFamily:F.sans, fontWeight:500, fontSize:13, color:C.onDark, whiteSpace:'nowrap' }}>S{season} · E{meeting.no}</span>
          </div>
          <Avatar m={WW.me} size={34} ring="rgba(248,241,230,.18)"/>
        </div>
      </div>
    </div>
  );
}

/* ---- Tab bar ------------------------------------------------------------- */
const TABS = [
  { id:'meeting', label:'Meeting', icon:'glass' },
  { id:'board',   label:'Board',   icon:'trophy' },
  { id:'rank',    label:'Rank',    icon:'bottle' },
  { id:'banter',  label:'Banter',  icon:'chat' },
];
function TabBar({ active, onChange, banterDot, mobile = false }) {
  return (
    <div style={{ background:C.espresso, flexShrink:0, borderTop:`1px solid ${C.lineDark}`, paddingBottom: mobile ? 'calc(env(safe-area-inset-bottom, 0px) + 10px)' : 24 }}>
      <div style={{ display:'flex', justifyContent:'space-around', alignItems:'stretch', padding:'9px 4px 0' }}>
        {TABS.map(t => {
          const on = t.id === active;
          return (
            <button key={t.id} onClick={() => onChange(t.id)} style={{
              flex:1, background:'none', border:'none', padding:0, cursor:'pointer',
              display:'flex', flexDirection:'column', alignItems:'center', gap:4,
              fontFamily:F.sans, fontSize:10.5, color: on ? C.amberBright : C.onDarkMute,
              fontWeight: on ? 700 : 500, position:'relative',
              transition:'color var(--dur-fast) var(--ease-snappy)',
            }}>
              <div style={{ position:'relative' }}>
                <Icon name={on ? `${t.icon}-fill` : t.icon} size={25} color={on ? C.amberBright : C.onDarkMute}/>
                {t.id === 'banter' && banterDot && !on && (
                  <span style={{ position:'absolute', top:-1, right:-3, width:8, height:8, borderRadius:999, background:C.wax, border:'2px solid var(--ww-espresso)', boxSizing:'content-box' }}/>
                )}
              </div>
              <span>{t.label}</span>
              <div style={{ width:18, height:3, borderRadius:3, background: on ? C.amberBright : 'transparent', marginTop:-1 }}/>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Meter --------------------------------------------------------------- */
function Meter({ value, max = 5, color = C.amber, track = C.sand, height = 6, animate = true, delay = 0 }) {
  const [w, setW] = useState(animate ? 0 : (value / max) * 100);
  useEffect(() => {
    if (!animate) { setW((value / max) * 100); return; }
    const t = setTimeout(() => setW((value / max) * 100), delay);
    return () => clearTimeout(t);
  }, [value, max, animate, delay]);
  return (
    <div style={{ height, borderRadius:999, background:track, overflow:'hidden', width:'100%' }}>
      <div style={{ height:'100%', width:`${w}%`, background:color, borderRadius:999, transition:'width 900ms var(--ease-snappy)' }}/>
    </div>
  );
}

/* ---- Chip / Pill --------------------------------------------------------- */
function Chip({ children, tone = 'sand', style = {} }) {
  const tones = {
    sand:   { bg:C.sand, fg:C.inkSoft, bd:'transparent' },
    amber:  { bg:'rgba(199,125,51,.14)', fg:C.amberDeep, bd:'transparent' },
    line:   { bg:'transparent', fg:C.inkSoft, bd:C.line },
    dark:   { bg:'rgba(248,241,230,.10)', fg:C.onDark, bd:'transparent' },
    wax:    { bg:'rgba(178,58,46,.12)', fg:C.wax, bd:'transparent' },
  };
  const t = tones[tone] || tones.sand;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5, height:24, padding:'0 9px',
      borderRadius:999, background:t.bg, border:`1px solid ${t.bd}`, color:t.fg,
      fontFamily:F.sans, fontWeight:600, fontSize:11.5, whiteSpace:'nowrap', ...style,
    }}>{children}</span>
  );
}

/* ---- Countdown ----------------------------------------------------------- */
function useCountdown(target) {
  const calc = useCallback(() => Math.max(0, target - Date.now()), [target]);
  const [ms, setMs] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setMs(calc()), 1000);
    return () => clearInterval(t);
  }, [calc]);
  const s = Math.floor(ms / 1000);
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
    done: ms <= 0,
  };
}

/* ---- CountUp number ------------------------------------------------------ */
function useCountUp(to, { dur = 900, start = 0, run = true } = {}) {
  const [v, setV] = useState(run ? start : to);
  const raf = useRef(0);
  useEffect(() => {
    if (!run) { setV(to); return; }
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setV(start + (to - start) * e);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [to, run]);
  return v;
}

Object.assign(window, { C, F, fmtScore, Avatar, AvatarStack, Wordmark, AppHeader, TabBar, TABS, Meter, Chip, useCountdown, useCountUp });
