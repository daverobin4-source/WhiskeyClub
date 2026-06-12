/* data.js — Wellness & Whiskey club data.
   Scores: each member rates Aroma / Taste / Finish out of 5 (2 dp).
   A member's total is /15; a whiskey's club score is the mean of member totals.
   Here we store the per-category club averages (avgA/avgT/avgF) + rater count;
   total = avgA+avgT+avgF. Exposed as window.WW. */
(function () {
  var members = [
    { id: 'dave',    name: 'Dave',    color: '#C77D33', you: true },
    { id: 'mike',    name: 'Mike',    color: '#B23A2E' },
    { id: 'nate',    name: 'Nate',    color: '#4E8D5B' },
    { id: 'sam',     name: 'Sam',     color: '#B0588A' },
    { id: 'tyler',   name: 'Tyler',   color: '#3E7CA8' },
    { id: 'pete',    name: 'Pete',    color: '#D69A2E' },
    { id: 'ben',     name: 'Ben',     color: '#7B6CCF' },
    { id: 'gerard',  name: 'Gerard',  color: '#2E9E8F' },
    { id: 'tristan', name: 'Tristan', color: '#C56B4A' }
  ];

  // Fixed host rotation (used to compute who's up after the next host activates).
  var hostRotation = ['dave','mike','nate','sam','tyler','pete','ben','gerard','tristan'];

  // helper to build a whiskey
  function w(o) {
    o.total = +(o.avgA + o.avgT + o.avgF).toFixed(2);
    return o;
  }

  var whiskeys = [
    w({ id:'yamazaki12', name:'Yamazaki 12', distillery:'Suntory', region:'Japan', type:'Single Malt',
        age:12, abv:43, liquid:'#C0721F', avgA:4.60, avgT:4.55, avgF:4.40, raters:6,
        note:'Honeyed, soft peat, that famous Mizunara incense on the finish.' }),
    w({ id:'lagavulin16', name:'Lagavulin 16', distillery:'Lagavulin', region:'Islay', type:'Single Malt',
        age:16, abv:43, liquid:'#A4571B', avgA:4.50, avgT:4.42, avgF:4.48, raters:6,
        note:'Bonfire on the beach. Big smoke, sweet sherry, never lets go.' }),
    w({ id:'nikka-barrel', name:'Nikka From The Barrel', distillery:'Nikka', region:'Japan', type:'Blended',
        age:null, abv:51.4, liquid:'#B26A22', avgA:4.40, avgT:4.45, avgF:4.20, raters:5,
        note:'Punches way above the little bottle. Spice, toffee, big heat.' }),
    w({ id:'ardbeg10', name:'Ardbeg 10', distillery:'Ardbeg', region:'Islay', type:'Single Malt',
        age:10, abv:46, liquid:'#9C5417', avgA:4.10, avgT:4.25, avgF:4.35, raters:6,
        note:'Tar, lemon, sea salt. The smoke goes on for days.' }),
    w({ id:'redbreast12', name:'Redbreast 12', distillery:'Midleton', region:'Ireland', type:'Single Pot Still',
        age:12, abv:40, liquid:'#C07E30', avgA:4.20, avgT:4.30, avgF:4.00, raters:5,
        note:'Christmas cake in a glass. Sherry, nutmeg, soft and generous.' }),
    w({ id:'starward-nova', name:'Starward Nova', distillery:'Starward', region:'Australia', type:'Single Malt',
        age:null, abv:41, liquid:'#B15D1C', avgA:4.00, avgT:4.10, avgF:3.80, raters:6,
        note:'Melbourne red-wine barrels. Jammy, fresh, dangerously easy.' }),
    w({ id:'talisker10', name:'Talisker 10', distillery:'Talisker', region:'Skye', type:'Single Malt',
        age:10, abv:45.8, liquid:'#AC6122', avgA:3.90, avgT:3.95, avgF:3.85, raters:5,
        note:'Pepper and brine. That chilli kick on the back end.' }),
    w({ id:'glenfiddich15', name:'Glenfiddich 15', distillery:'Glenfiddich', region:'Speyside', type:'Single Malt',
        age:15, abv:40, liquid:'#C5853A', avgA:3.60, avgT:3.70, avgF:3.50, raters:6,
        note:'Solera honey and pear. Pleasant, polite, a bit of a crowd-pleaser.' }),
    w({ id:'buffalo-trace', name:'Buffalo Trace', distillery:'Buffalo Trace', region:'Kentucky', type:'Bourbon',
        age:null, abv:45, liquid:'#A9641E', avgA:3.40, avgT:3.55, avgF:3.30, raters:5,
        note:'Vanilla, corn sweetness, a little oak. Honest everyday pour.' }),
    w({ id:'monkey-shoulder', name:'Monkey Shoulder', distillery:'William Grant', region:'Speyside', type:'Blended Malt',
        age:null, abv:40, liquid:'#C2853F', avgA:3.10, avgT:3.20, avgF:2.90, raters:6,
        note:'Malty and mixable. Fine in a highball, forgettable neat.' }),
    // not yet scored by the club — ranking these creates a brand-new board entry
    w({ id:'kavalan-solist', name:'Kavalan Solist Sherry', distillery:'Kavalan', region:'Taiwan', type:'Single Malt',
        age:null, abv:57.8, liquid:'#8F3F12', avgA:0, avgT:0, avgF:0, raters:0,
        note:'Tropical and thick. Tonight\u2019s mystery wildcard.' }),
    w({ id:'springbank15', name:'Springbank 15', distillery:'Springbank', region:'Campbeltown', type:'Single Malt',
        age:15, abv:46, liquid:'#9E5A20', avgA:0, avgT:0, avgF:0, raters:0,
        note:'Funky, oily, coastal. The connoisseur\u2019s handshake.' })
  ];

  // Next meeting — countdown anchored a few days out so it always reads "live".
  var now = Date.now();
  var target = now + (6 * 864e5) + (4 * 36e5) + (12 * 6e4); // ~6d 4h
  var meeting = {
    season: 1,
    no: 14,
    host: 'mike',
    nextHost: 'dave',
    venue: 'Mike\u2019s place',
    address: '14 Lygon St, Carlton',
    target: target,
    theme: 'Peated & Proud',
    subtitle: 'Islay night \u2014 bring the smoke',
    buyIn: 40,
    bottle: 'lagavulin16',
    bring: [
      'One peated dram to share (Islay = bonus points)',
      'A clean glass + your palate',
      'Something to soak it up'
    ],
    rsvp: { dave:'going', mike:'going', nate:'going', sam:'maybe', tyler:'going', pete:'out', ben:'going', gerard:'maybe', tristan:'going' }
  };

  // Banter feed
  var banter = [
    { id:'b1', author:'nate', time:'18m',
      text:'Hot take: the Yamazaki is overrated and you\u2019re all just scared to say it. Bring receipts Friday.',
      reactions:{ '\uD83D\uDD25':5, '\uD83D\uDE02':9, '\u2764\uFE0F':1, '\uD83E\uDD43':2 }, mine:null, comments:6, score:null },
    { id:'b2', author:'pete', time:'1h',
      text:'Logged the Lagavulin 16 from last week. This stuff is unreal \u2014 went straight near the top.',
      reactions:{ '\uD83D\uDD25':12, '\uD83D\uDE02':0, '\u2764\uFE0F':4, '\uD83E\uDD43':7 }, mine:'\uD83D\uDD25', comments:3,
      score:{ whiskey:'lagavulin16', a:4.75, t:4.40, f:4.60 } },
    { id:'b3', author:'mike', time:'3h',
      text:'Reminder: Friday is Islay night at mine. $40 a head, BYO something smoky. Sam stop saying \u201Cmaybe\u201D.',
      reactions:{ '\uD83D\uDD25':3, '\uD83D\uDE02':14, '\u2764\uFE0F':6, '\uD83E\uDD43':1 }, mine:'\uD83D\uDE02', comments:11, score:null },
    { id:'b4', author:'tyler', time:'5h',
      text:'Monkey Shoulder defenders please form an orderly queue so I can ignore each of you individually.',
      reactions:{ '\uD83D\uDD25':2, '\uD83D\uDE02':17, '\u2764\uFE0F':2, '\uD83E\uDD43':0 }, mine:null, comments:8, score:null }
  ];

  // Register a user-added whiskey into the live catalog (dedup by id).
  // Accepts a partial spec; fills in defaults + computes total via w().
  function addWhiskey(o) {
    if (!o || !o.id) return null;
    var existing = whiskeys.find(function (k) { return k.id === o.id; });
    if (existing) return existing;
    var built = w(Object.assign({
      distillery: '', region: '', type: 'Single Malt', age: null, abv: 40,
      liquid: '#A4571B', avgA: 0, avgT: 0, avgF: 0, raters: 0,
      note: 'Freshly added \u2014 no notes yet.'
    }, o));
    whiskeys.push(built);
    return built;
  }
  function ensureWhiskeys(list) { (list || []).forEach(addWhiskey); }

  window.WW = {
    members: members,
    me: members[0],
    byId: function (id) { return members.find(function (m) { return m.id === id; }); },
    whiskey: function (id) { return whiskeys.find(function (k) { return k.id === id; }); },
    whiskeys: whiskeys,
    meeting: meeting,
    hostRotation: hostRotation,
    banter: banter,
    addWhiskey: addWhiskey,
    ensureWhiskeys: ensureWhiskeys,
    REACTIONS: ['\uD83D\uDD25', '\u2764\uFE0F', '\uD83D\uDE02', '\uD83E\uDD43']
  };
})();
