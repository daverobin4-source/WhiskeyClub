/* store.js — scoring math shared by Board + Rank. window.WWStore */
(function () {
  // Blend the current user's session score into a whiskey's club averages.
  function effective(k, us) {
    if (!us) {
      return Object.assign({}, k, { userRated:false, total:k.total, oldTotal:k.total, effRaters:k.raters, onBoard:k.raters > 0 });
    }
    const r = k.raters;
    const blend = (avg, v) => +(((avg * r) + v) / (r + 1)).toFixed(4);
    const avgA = blend(k.avgA, us.a), avgT = blend(k.avgT, us.t), avgF = blend(k.avgF, us.f);
    const total = +(avgA + avgT + avgF).toFixed(2);
    return Object.assign({}, k, {
      userRated:true, us, avgA, avgT, avgF, total, oldTotal:k.total,
      effRaters:r + 1, onBoard:true,
    });
  }

  function computeBoard(userScores) {
    userScores = userScores || {};
    const list = WW.whiskeys
      .map(k => effective(k, userScores[k.id]))
      .filter(k => k.onBoard)
      .sort((a, b) => b.total - a.total);
    list.forEach((k, i) => { k.rank = i + 1; });
    return list;
  }

  // Where would a given total land on the board (1-indexed rank)?
  function projectRank(whiskeyId, total, userScores) {
    const others = computeBoard(userScores).filter(k => k.id !== whiskeyId);
    let rank = 1;
    for (const k of others) { if (total < k.total) rank++; }
    return rank;
  }

  function verdict(total15) {
    const t = total15;
    if (t >= 13.5) return { label:'Top shelf',     color:'var(--ww-gold)' };
    if (t >= 12.0) return { label:'Excellent',     color:'var(--ww-amber-bright)' };
    if (t >= 10.5) return { label:'Solid pour',    color:'var(--ww-amber)' };
    if (t >= 9.0)  return { label:'Decent drop',   color:'var(--ww-malt)' };
    if (t >= 7.0)  return { label:'Middle shelf',  color:'var(--ww-ink-mute)' };
    return { label:'Rough night', color:'var(--ww-rust)' };
  }

  window.WWStore = { computeBoard, projectRank, verdict, effective };
})();
