/**
 * GridRival cinematic trailer (v2 - "Full Position").
 * Procedurally scored via Web Audio (no audio files); self-contained HTML.
 * Served at /api/trailer. Rebuild the showcase to redeploy.
 */
export function getCinematicTrailerHTML(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>GridRival — Trailer</title>
<style>
  :root {
    --bg: #05070e;
    --panel: #0b1120;
    --ink: #eaf1fb;
    --muted: #8ba0bf;
    --electric: #34a1ff;
    --electric-2: #6fc3ff;
    --loss: #ff4b57;
    --profit: #34d399;
    --warning: #f5b53d;
    --gold: #ffd469;
    --mono: 'SF Mono','JetBrains Mono',ui-monospace,Menlo,Consolas,monospace;
    --sans: 'SF Pro Display',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body {
    background: var(--bg);
    color: var(--ink);
    font-family: var(--sans);
    overflow: hidden;
    position: fixed;
    inset: 0;
  }
  #stage { position: absolute; inset: 0; overflow: hidden; }

  /* faint grid backdrop */
  #stage::before {
    content: ""; position: absolute; inset: 0; opacity: .35; pointer-events: none;
    background-image:
      linear-gradient(rgba(52,161,255,.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(52,161,255,.06) 1px, transparent 1px);
    background-size: 44px 44px;
    animation: gridDrift 20s linear infinite;
  }
  @keyframes gridDrift { to { background-position: 44px 44px; } }

  .scene {
    position: absolute; inset: 0;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    opacity: 0; visibility: hidden; padding: 4vh 5vw; text-align: center;
    transition: opacity .5s ease;
  }
  .scene.active { opacity: 1; visibility: visible; }

  /* ---------- red flash ---------- */
  #redFlash { position: absolute; inset: 0; background: radial-gradient(circle, rgba(255,60,70,.5), transparent 70%); opacity: 0; pointer-events: none; z-index: 40; }
  #redFlash.flash { animation: flashPulse .5s ease-out; }
  @keyframes flashPulse { 0% { opacity: .8; } 100% { opacity: 0; } }

  /* ---------- cold open ---------- */
  .bolt {
    font-size: clamp(80px, 18vw, 240px); line-height: 1;
    filter: drop-shadow(0 0 40px var(--electric));
    animation: boltFlicker 2.4s ease-in-out infinite;
  }
  @keyframes boltFlicker { 0%,100%{opacity:.9} 45%{opacity:.5} 50%{opacity:1} 55%{opacity:.6} }

  /* ---------- headlines ---------- */
  .kicker { font-family: var(--mono); font-size: clamp(11px,1.5vw,14px); letter-spacing: .35em; text-transform: uppercase; color: var(--loss); }
  .headline {
    position: absolute; max-width: 92vw;
    font-size: clamp(28px, 6vw, 74px); font-weight: 800; line-height: 1.02; letter-spacing: -.02em;
    opacity: 0; transform: translateY(28px) scale(.98); text-wrap: balance;
    transition: opacity .35s ease, transform .35s ease;
  }
  .headline.visible { opacity: 1; transform: translateY(0) scale(1); }
  .headline.fade-out { opacity: 0; transform: translateY(-24px) scale(1.02); }
  .headline .src { display:block; font-family: var(--mono); font-size: clamp(10px,1.3vw,13px); font-weight: 500; letter-spacing:.2em; color: var(--muted); text-transform: uppercase; margin-bottom: 14px; }
  .headline .red { color: var(--loss); }
  .headline .amber { color: var(--warning); }
  .headline .elec { color: var(--electric-2); }

  /* ---------- title cards ---------- */
  .phase-label { font-family: var(--mono); font-size: clamp(12px,2vw,18px); letter-spacing: .5em; text-transform: uppercase; color: var(--electric); margin-bottom: 18px; opacity: 0; animation: fadeUp .7s .1s ease forwards; }
  .brand { font-size: clamp(40px, 10vw, 132px); font-weight: 900; letter-spacing: -.03em; line-height: .92; }
  .brand .sub { display:block; font-size: .42em; font-weight: 800; letter-spacing: .02em; margin-top: 8px; }
  .title-reveal .brand { opacity: 0; animation: slamIn .6s .15s cubic-bezier(.2,1.3,.3,1) forwards; }
  .glow-electric { color: #fff; text-shadow: 0 0 50px rgba(52,161,255,.75), 0 0 120px rgba(52,161,255,.35); }
  .glow-gold { color: #fff; text-shadow: 0 0 50px rgba(255,207,92,.7), 0 0 130px rgba(255,207,92,.35); }
  .tagline-lead { font-size: clamp(18px,3.4vw,38px); font-weight: 700; opacity: 0; animation: fadeUp .7s .5s ease forwards; }
  @keyframes fadeUp { from { opacity:0; transform: translateY(22px);} to { opacity:1; transform:none; } }
  @keyframes slamIn { 0%{opacity:0; transform: scale(2.4); filter: blur(8px);} 60%{opacity:1; transform: scale(.94); filter:blur(0);} 100%{opacity:1; transform: scale(1);} }

  /* ---------- merit order diagram ---------- */
  .diagram { width: min(880px, 92vw); }
  .diagram h3 { font-family: var(--mono); font-size: clamp(11px,1.6vw,15px); letter-spacing:.3em; text-transform: uppercase; color: var(--electric); margin-bottom: 18px; }
  .mo-wrap { position: relative; height: min(46vh, 360px); border-left: 2px solid rgba(255,255,255,.18); border-bottom: 2px solid rgba(255,255,255,.18); display: flex; align-items: flex-end; gap: 6px; padding: 0 4px; }
  .mo-axis-y { position:absolute; left: -46px; top: -6px; font-family: var(--mono); font-size: 11px; color: var(--muted); }
  .mo-axis-x { position:absolute; right: 0; bottom: -24px; font-family: var(--mono); font-size: 11px; color: var(--muted); }
  .mo-bar { flex: 1; background: var(--c); border-radius: 4px 4px 0 0; height: 0; transition: height .6s cubic-bezier(.2,.8,.2,1); box-shadow: inset 0 0 0 1px rgba(255,255,255,.08); position: relative; }
  .mo-bar .lab { position:absolute; top:-20px; left:0; right:0; font-family: var(--mono); font-size: 10px; color: var(--muted); opacity:0; transition: opacity .4s; }
  .mo-wrap.go .mo-bar { height: var(--h); }
  .mo-wrap.go .mo-bar .lab { opacity: 1; }
  .mo-demand { position:absolute; top:0; bottom:0; width: 3px; background: repeating-linear-gradient(var(--loss) 0 8px, transparent 8px 14px); left: 100%; opacity: 0; transition: left 1s ease .4s, opacity .4s ease .4s; }
  .mo-wrap.go .mo-demand { left: 62%; opacity: 1; }
  .mo-demand .dl { position:absolute; top: 6px; left: 8px; font-family: var(--mono); font-size: 11px; color: var(--loss); white-space: nowrap; }
  .mo-clear { position:absolute; left:0; right:0; height: 2px; background: var(--gold); box-shadow: 0 0 18px var(--gold); opacity: 0; bottom: 0; transition: bottom .6s ease 1.2s, opacity .4s ease 1.2s; }
  .mo-clear.on { opacity: 1; }
  .mo-clear .price { position:absolute; right: 6px; top: -30px; font-family: var(--mono); font-weight: 800; font-size: clamp(16px,2.6vw,26px); color: var(--gold); text-shadow: 0 0 20px rgba(255,207,92,.6); }
  .mo-caption { margin-top: 40px; font-size: clamp(13px,1.8vw,17px); color: var(--muted); opacity: 0; transition: opacity .5s ease; }
  .mo-caption.on { opacity: 1; }
  .mo-caption b { color: var(--ink); }

  /* ---------- feature cards ---------- */
  .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 14px; width: min(1000px, 94vw); }
  .fcard {
    background: linear-gradient(180deg, rgba(52,161,255,.08), rgba(11,17,32,.6));
    border: 1px solid rgba(52,161,255,.22); border-radius: 16px; padding: 20px 16px;
    opacity: 0; transform: translateY(24px) scale(.96); transition: opacity .45s ease, transform .45s ease;
  }
  .fcard.visible { opacity: 1; transform: none; }
  .fcard .ic { font-size: 30px; margin-bottom: 8px; }
  .fcard .t { font-weight: 800; font-size: clamp(15px,2vw,19px); letter-spacing: -.01em; }
  .fcard .d { font-size: clamp(11px,1.4vw,13px); color: var(--muted); margin-top: 4px; line-height: 1.35; }
  .fcard.danger { border-color: rgba(255,75,87,.3); background: linear-gradient(180deg, rgba(255,75,87,.1), rgba(11,17,32,.6)); }
  .fcard.warn { border-color: rgba(245,181,61,.3); background: linear-gradient(180deg, rgba(245,181,61,.1), rgba(11,17,32,.6)); }
  .fcard.gold { border-color: rgba(255,207,92,.35); background: linear-gradient(180deg, rgba(255,207,92,.12), rgba(11,17,32,.6)); }

  .sect-title { font-size: clamp(22px,4vw,44px); font-weight: 900; letter-spacing: -.02em; margin-bottom: 20px; }
  .sect-title .accent { color: var(--electric-2); }

  /* the turn */
  .turn-1 { font-size: clamp(22px,4.6vw,52px); font-weight: 800; color: var(--muted); opacity: 0; animation: fadeUp .6s .1s ease forwards; }
  .turn-2 { font-size: clamp(30px,7vw,84px); font-weight: 900; letter-spacing: -.02em; color: #fff; opacity: 0; animation: slamIn .6s .9s cubic-bezier(.2,1.3,.3,1) forwards; }

  /* summary montage */
  .verbs { display:flex; gap: clamp(10px,3vw,40px); flex-wrap: wrap; justify-content: center; margin-bottom: 26px; }
  .verb { font-size: clamp(24px,5vw,60px); font-weight: 900; letter-spacing: -.02em; opacity: 0; }
  .verb.visible { animation: slamIn .5s cubic-bezier(.2,1.3,.3,1) forwards; }
  .verb.v0 { color: var(--electric-2); } .verb.v1 { color: var(--profit); }
  .verb.v2 { color: var(--warning); } .verb.v3 { color: var(--loss); }
  .chips { display:flex; flex-wrap: wrap; gap: 8px; justify-content: center; max-width: min(900px,94vw); }
  .chip { font-family: var(--mono); font-size: clamp(10px,1.3vw,13px); border: 1px solid rgba(255,255,255,.16); border-radius: 999px; padding: 6px 13px; color: var(--muted); opacity: 0; transform: translateY(10px); transition: opacity .3s, transform .3s; }
  .chip.visible { opacity: 1; transform: none; color: var(--ink); }

  /* finale */
  .finale-tag { font-size: clamp(18px,3.2vw,34px); font-weight: 700; opacity: 0; }
  .finale-tag.visible { animation: fadeUp .7s ease forwards; }
  .finale-tag .dim { color: var(--muted); }
  .finale-brand { font-size: clamp(52px,13vw,168px); font-weight: 900; letter-spacing: -.04em; opacity: 0; }
  .finale-brand.visible { animation: slamIn .7s cubic-bezier(.2,1.3,.3,1) forwards; }
  .finale-sub { font-family: var(--mono); font-size: clamp(11px,1.8vw,16px); letter-spacing: .3em; text-transform: uppercase; color: var(--electric); opacity: 0; }
  .finale-sub.visible { animation: fadeUp .7s ease forwards; }

  /* ---------- ticker ---------- */
  .ticker-bar { position: absolute; left: 0; right: 0; bottom: 46px; height: 34px; background: rgba(4,7,14,.9); border-top: 1px solid rgba(52,161,255,.25); border-bottom: 1px solid rgba(52,161,255,.15); overflow: hidden; z-index: 30; display: flex; align-items: center; }
  .ticker-content { display: inline-flex; white-space: nowrap; animation: tickerScroll 34s linear infinite; }
  .ti { display: inline-flex; align-items: center; gap: 7px; padding: 0 22px; font-family: var(--mono); font-size: 12px; color: var(--muted); }
  .dot { width: 7px; height: 7px; border-radius: 50%; }
  .dot.r { background: var(--loss); } .dot.g { background: var(--profit); } .dot.a { background: var(--warning); } .dot.b { background: var(--electric); }
  .up { color: var(--loss); } .down { color: var(--profit); } .num { color: var(--ink); }
  @keyframes tickerScroll { from { transform: translateX(0);} to { transform: translateX(-50%);} }

  /* ---------- controls ---------- */
  .controls { position: absolute; left: 0; right: 0; bottom: 0; height: 46px; background: rgba(4,7,14,.95); border-top: 1px solid rgba(255,255,255,.08); display: flex; align-items: center; gap: 8px; padding: 0 12px; z-index: 50; }
  .controls button { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12); color: var(--ink); border-radius: 8px; width: 32px; height: 30px; cursor: pointer; font-size: 14px; display: inline-flex; align-items: center; justify-content: center; }
  .controls button:hover { background: rgba(52,161,255,.2); border-color: var(--electric); }
  .progress-track { flex: 1; height: 4px; background: rgba(255,255,255,.1); border-radius: 3px; overflow: hidden; }
  #progressBar { height: 100%; width: 0; background: linear-gradient(90deg, var(--electric), var(--electric-2)); }
  .hint { font-family: var(--mono); font-size: 10px; color: var(--muted); letter-spacing: .05em; }

  /* ---------- start overlay ---------- */
  #startOverlay { position: absolute; inset: 0; z-index: 100; background: radial-gradient(circle at 50% 40%, #0b1428, #05070e 70%); display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; }
  #startOverlay .bolt { animation: boltFlicker 2.4s ease-in-out infinite; }
  #startOverlay .st-brand { font-size: clamp(44px,11vw,120px); font-weight: 900; letter-spacing: -.03em; margin-top: 4px; }
  #startOverlay .st-play { margin-top: 26px; font-family: var(--mono); letter-spacing: .25em; text-transform: uppercase; font-size: 13px; color: var(--electric); border: 1px solid rgba(52,161,255,.4); border-radius: 999px; padding: 12px 26px; animation: pulsePlay 2s ease-in-out infinite; }
  #startOverlay .st-note { margin-top: 16px; font-size: 12px; color: var(--muted); }
  @keyframes pulsePlay { 0%,100%{ box-shadow: 0 0 0 0 rgba(52,161,255,.3);} 50%{ box-shadow: 0 0 0 12px rgba(52,161,255,0);} }

  @media (max-width: 640px) {
    .ticker-bar { bottom: 44px; height: 28px; }
    .ti { font-size: 10px; padding: 0 14px; }
  }
  @media (prefers-reduced-motion: reduce) { * { animation-duration: .001s !important; } }
</style>
</head>
<body>
<div id="stage">
  <div id="redFlash"></div>

  <!-- Scene 0: cold open -->
  <div class="scene active" id="scene-0">
    <div class="bolt">&#9889;</div>
  </div>

  <!-- Scene 1: crisis headlines -->
  <div class="scene" id="scene-1">
    <div class="headline" id="hl-0"><span class="src">AEMO Market Notice</span>Prices hit <span class="red">$16,600/MWh</span> as the heat bites</div>
    <div class="headline" id="hl-1"><span class="src">Systems Operator</span>South Australia <span class="amber">islanded</span> — the interconnector trips</div>
    <div class="headline" id="hl-2"><span class="src">Market Wire</span>A retailer <span class="red">collapses</span> — caught short in the spike</div>
    <div class="headline" id="hl-3"><span class="src">Regulator</span>The <span class="amber">AER</span> opens an investigation into bidding conduct</div>
    <div class="headline" id="hl-4"><span class="src">The Grid, 2030</span>Coal exits. Renewables surge. <span class="elec">Volatility is the new normal.</span></div>
    <div class="headline" id="hl-5">In the NEM, <span class="red">most players lose money.</span></div>
  </div>

  <!-- Scene 2: Phase 1 title -->
  <div class="scene title-reveal" id="scene-2">
    <div class="phase-label">The Fundamentals</div>
    <div class="brand"><span class="glow-electric">GRIDRIVAL</span><span class="sub glow-electric">MERIT ORDER</span></div>
    <div class="tagline-lead" style="margin-top:18px;color:var(--muted)">Learn how the market really clears.</div>
  </div>

  <!-- Scene 3: merit order diagram -->
  <div class="scene" id="scene-3">
    <div class="diagram">
      <h3>How the market clears</h3>
      <div class="mo-wrap" id="moWrap">
        <span class="mo-axis-y">$/MWh</span>
        <span class="mo-axis-x">MW &rarr;</span>
        <div class="mo-bar" style="--c:#2f9e6b;--h:16%"><span class="lab">Wind $5</span></div>
        <div class="mo-bar" style="--c:#3aa76d;--h:26%"><span class="lab">Solar $0</span></div>
        <div class="mo-bar" style="--c:#5aa0c8;--h:40%"><span class="lab">Coal $33</span></div>
        <div class="mo-bar" style="--c:#7f93c0;--h:54%"><span class="lab">Hydro $60</span></div>
        <div class="mo-bar" style="--c:#c99a3a;--h:70%"><span class="lab">CCGT $85</span></div>
        <div class="mo-bar" style="--c:#e0703a;--h:88%"><span class="lab">Peaker $160</span></div>
        <div class="mo-bar" style="--c:#e04b4b;--h:100%"><span class="lab">VOLL</span></div>
        <div class="mo-demand"><span class="dl">Demand</span></div>
        <div class="mo-clear" id="moClear" style="bottom:70%"><span class="price">$85 / MWh</span></div>
      </div>
      <div class="mo-caption" id="moCap">Stack the cheapest generators first. Where supply meets demand, the <b>marginal bid sets the price</b> — and everyone dispatched earns it.</div>
    </div>
  </div>

  <!-- Scene 4: phase-1 features -->
  <div class="scene" id="scene-4">
    <div class="sect-title">One market. <span class="accent">Every dynamic.</span></div>
    <div class="card-grid">
      <div class="fcard" id="fc-0"><div class="ic">&#128101;</div><div class="t">Multiplayer</div><div class="d">Up to 15 teams bidding live from their phones</div></div>
      <div class="fcard" id="fc-1"><div class="ic">&#128506;&#65039;</div><div class="t">Five Regions</div><div class="d">QLD, NSW, VIC, SA, TAS — joined by interconnectors</div></div>
      <div class="fcard danger" id="fc-2"><div class="ic">&#128293;</div><div class="t">VOLL</div><div class="d">When supply runs out, the price rockets to $16,600</div></div>
      <div class="fcard warn" id="fc-3"><div class="ic">&#9878;&#65039;</div><div class="t">AER Watch</div><div class="d">Game the shortage and the regulator comes knocking</div></div>
      <div class="fcard" id="fc-4"><div class="ic">&#128267;</div><div class="t">Demand Response</div><div class="d">Batteries, hydro and load that fights back</div></div>
    </div>
  </div>

  <!-- Scene 5: the turn -->
  <div class="scene" id="scene-5">
    <div class="turn-1">So you can make money on the merit order.</div>
    <div class="turn-2">That's just the warm-up.</div>
  </div>

  <!-- Scene 6: expansion title -->
  <div class="scene title-reveal" id="scene-6">
    <div class="phase-label" style="color:var(--gold)">The Expansion</div>
    <div class="brand"><span class="glow-gold">GRIDRIVAL</span><span class="sub glow-gold">FULL POSITION</span></div>
    <div class="tagline-lead" style="margin-top:18px;color:var(--muted)">Stop bidding plant. Start running a book.</div>
  </div>

  <!-- Scene 7: expansion phases -->
  <div class="scene" id="scene-7">
    <div class="sect-title">You're not a generator. <span class="accent">You're a gentailer.</span></div>
    <div class="card-grid">
      <div class="fcard" id="ph-0"><div class="ic">&#9878;&#65039;</div><div class="t">Positions</div><div class="d">Generation AND customers. Long or short — the market picks a winner</div></div>
      <div class="fcard warn" id="ph-1"><div class="ic">&#128225;</div><div class="t">Basis Risk</div><div class="d">Your plant clears in VIC, your load pays in SA. Mind the gap</div></div>
      <div class="fcard gold" id="ph-2"><div class="ic">&#129309;</div><div class="t">Caps &amp; Swaps</div><div class="d">Walk the room, strike a $300 cap on your phone — like a BDM chasing contracts</div></div>
      <div class="fcard" id="ph-3"><div class="ic">&#127959;&#65039;</div><div class="t">The Long Game</div><div class="d">Reinvest profits — build plant, win C&amp;I customers, out to 2030</div></div>
      <div class="fcard danger" id="ph-4"><div class="ic">&#10052;&#65039;</div><div class="t">The Winter</div><div class="d">Cold snap. Plants fail. Defend your position — or blow up</div></div>
    </div>
  </div>

  <!-- Scene 8: summary montage -->
  <div class="scene" id="scene-8">
    <div class="verbs">
      <span class="verb v0" id="vb-0">BID.</span>
      <span class="verb v1" id="vb-1">POSITION.</span>
      <span class="verb v2" id="vb-2">HEDGE.</span>
      <span class="verb v3" id="vb-3">SURVIVE.</span>
    </div>
    <div class="chips">
      <span class="chip" id="ch-0">Merit-order dispatch</span>
      <span class="chip" id="ch-1">Regional prices &amp; basis</span>
      <span class="chip" id="ch-2">VOLL &amp; scarcity</span>
      <span class="chip" id="ch-3">AER conduct fines</span>
      <span class="chip" id="ch-4">Caps &amp; swaps</span>
      <span class="chip" id="ch-5">Retail margin</span>
      <span class="chip" id="ch-6">C&amp;I customers</span>
      <span class="chip" id="ch-7">Demand response</span>
      <span class="chip" id="ch-8">Live multiplayer</span>
    </div>
  </div>

  <!-- Scene 9: finale -->
  <div class="scene" id="scene-9">
    <div class="finale-tag" id="ft-0"><span class="dim">In the NEM, most players lose money.</span></div>
    <div class="finale-tag" id="ft-1" style="font-size:clamp(24px,4.6vw,52px);font-weight:900;margin-top:6px">You won't.</div>
    <div class="finale-brand glow-electric" id="ft-2" style="margin-top:22px">GRIDRIVAL</div>
    <div class="finale-sub" id="ft-3" style="margin-top:10px">Bid &middot; Position &middot; Hedge &middot; Survive</div>
  </div>

  <!-- ticker -->
  <div class="ticker-bar">
    <div class="ticker-content" id="tickerContent"></div>
  </div>

  <!-- controls -->
  <div class="controls">
    <button id="btnPause" title="Pause (space)">&#10074;&#10074;</button>
    <button id="btnRestart" title="Restart (R)">&#8635;</button>
    <button id="btnMute" title="Mute (M)">&#128266;</button>
    <div class="progress-track"><div id="progressBar"></div></div>
    <span class="hint">space &middot; &larr; &rarr; &middot; F</span>
    <button id="btnSkip" title="Skip to end">&#9197;</button>
    <button id="btnFullscreen" title="Fullscreen (F)">&#9974;</button>
  </div>

  <!-- start overlay -->
  <div id="startOverlay">
    <div class="bolt">&#9889;</div>
    <div class="st-brand glow-electric">GRIDRIVAL</div>
    <div class="st-play">&#9654; Play Trailer</div>
    <div class="st-note">with sound &middot; ~62 seconds</div>
  </div>
</div>

<script>
(function() {
  // ===== ticker content (duplicated for seamless scroll) =====
  const tickItems = [
    ['r','NSW','$487.32','up','&uarr;'],['g','VIC','$62.15','down','&darr;'],['a','QLD','$312.80','up','&uarr;'],
    ['g','SA','-$28.50','down','&darr;'],['r','TAS','$185.60','up','&uarr;'],['b','Demand','28,450 MW','',''],
    ['a','Solar','14.2 GW &bull; 48%','',''],['g','Wind','4.85 GW','',''],['r','Coal','6.2 GW','',''],
    ['a','Basis SA-VIC','+$122','up','&uarr;'],['b','Cap $300','struck','',''],['r','VOLL','$16,600','up','&uarr;'],
  ];
  function tickerHTML() {
    return tickItems.map(([d,n,p,dir,arw]) =>
      '<span class="ti"><span class="dot ' + d + '"></span>' + n +
      (p ? ' <span class="num ' + (dir||'') + '">' + p + '</span>' : '') + (arw ? ' ' + arw : '') + '</span>'
    ).join('');
  }
  document.getElementById('tickerContent').innerHTML = tickerHTML() + tickerHTML();

  // ===== PROCEDURAL MUSIC ENGINE (Web Audio, no files) =====
  let audioCtx = null, musicMuted = false, masterGain = null, currentMood = null;
  let activeNodes = [], musicIntervals = [], started = false;

  function initAudio() {
    if (audioCtx && audioCtx.state === 'running') return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.38;
        masterGain.connect(audioCtx.destination);
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch(e) {}
  }
  function stopAllMusic() {
    musicIntervals.forEach(id => clearInterval(id)); musicIntervals = [];
    activeNodes.forEach(n => { try { n.stop(); } catch(e) {} }); activeNodes = [];
    currentMood = null;
  }
  function playNote(freq, duration, type, volume, startDelay) {
    if (!audioCtx || !masterGain || musicMuted) return;
    const start = audioCtx.currentTime + (startDelay || 0);
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.type = type || 'sine'; osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume || 0.15, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(gain); gain.connect(masterGain);
    osc.start(start); osc.stop(start + duration + 0.05);
    activeNodes.push(osc); return osc;
  }
  function playDrone(freq, duration, type, volume) {
    if (!audioCtx || !masterGain || musicMuted) return;
    [-7,0,7,12].forEach(d => {
      const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
      osc.type = type || 'sine'; osc.frequency.value = freq; osc.detune.value = d;
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(volume || 0.04, audioCtx.currentTime + 0.8);
      gain.gain.linearRampToValueAtTime(volume || 0.04, audioCtx.currentTime + duration - 1);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
      osc.connect(gain); gain.connect(masterGain);
      osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime + duration + 0.1);
      activeNodes.push(osc);
    });
  }
  function playRumble(duration, volume) {
    if (!audioCtx || !masterGain || musicMuted) return;
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0); let last = 0;
    for (let i = 0; i < bufferSize; i++) { const w = Math.random()*2-1; last = (last + 0.02*w)/1.02; data[i] = last*3.5; }
    const src = audioCtx.createBufferSource(); src.buffer = buffer;
    const filt = audioCtx.createBiquadFilter(); filt.type='lowpass'; filt.frequency.value=120;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(volume||0.12, audioCtx.currentTime+1);
    gain.gain.linearRampToValueAtTime(volume||0.12, audioCtx.currentTime+duration-1.5);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime+duration);
    src.connect(filt); filt.connect(gain); gain.connect(masterGain);
    src.start(); src.stop(audioCtx.currentTime+duration+0.1); activeNodes.push(src);
  }
  function playImpact() {
    if (!audioCtx || !masterGain || musicMuted) return;
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.type='sawtooth';
    osc.frequency.setValueAtTime(80, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime+0.4);
    gain.gain.setValueAtTime(0.22, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+0.5);
    osc.connect(gain); gain.connect(masterGain);
    osc.start(); osc.stop(audioCtx.currentTime+0.6); activeNodes.push(osc);
  }
  function playWhoosh() {
    if (!audioCtx || !masterGain || musicMuted) return;
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.type='sawtooth';
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, audioCtx.currentTime+0.3);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime+0.6);
    gain.gain.setValueAtTime(0.07, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+0.7);
    osc.connect(gain); gain.connect(masterGain);
    osc.start(); osc.stop(audioCtx.currentTime+0.8); activeNodes.push(osc);
  }
  function playRiser(dur) {
    if (!audioCtx || !masterGain || musicMuted) return;
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.type='sawtooth';
    osc.frequency.setValueAtTime(110, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime+dur);
    gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.09, audioCtx.currentTime+dur);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+dur+0.2);
    osc.connect(gain); gain.connect(masterGain);
    osc.start(); osc.stop(audioCtx.currentTime+dur+0.3); activeNodes.push(osc);
  }

  function startForeboding() {
    if (currentMood === 'foreboding') return; stopAllMusic(); currentMood='foreboding';
    playRumble(20, 0.1);
    playDrone(73.42, 18, 'sawtooth', 0.025); playDrone(110, 18, 'sine', 0.03);
    const hb = setInterval(() => { if (musicMuted||currentMood!=='foreboding'){clearInterval(hb);return;}
      playNote(40,0.15,'sine',0.12); setTimeout(()=>playNote(38,0.12,'sine',0.08),200); }, 1400);
    musicIntervals.push(hb);
    const stabs = setInterval(() => { if (musicMuted||currentMood!=='foreboding'){clearInterval(stabs);return;}
      if (Math.random()>0.45){ const f=[311,370,466,554][Math.floor(Math.random()*4)]; playNote(f,1.5,'sawtooth',0.02);} }, 2300);
    musicIntervals.push(stabs);
  }
  function startTrading() {
    if (currentMood === 'trading') return; stopAllMusic(); currentMood='trading';
    playDrone(130.81,26,'triangle',0.025); playDrone(164.81,26,'sine',0.02); playDrone(196,26,'sine',0.02);
    let step = 0;
    const pulse = setInterval(() => { if (musicMuted||currentMood!=='trading'){clearInterval(pulse);return;}
      if (step%4===0) playNote(55,0.08,'sine',0.12);
      playNote(8000+Math.random()*2000,0.03,'square',0.015);
      if (step%8===0){ [261,329,392,523,659].forEach((f,i)=>playNote(f,0.2,'triangle',0.04,i*0.12)); }
      if (step%8===4){ [220,277,329,440].forEach((f,i)=>playNote(f,0.2,'triangle',0.03,i*0.12)); }
      step++; }, 200);
    musicIntervals.push(pulse);
    const blips = setInterval(() => { if (musicMuted||currentMood!=='trading'){clearInterval(blips);return;}
      if (Math.random()>0.4){ const f=800+Math.random()*1200; playNote(f,0.05,'sine',0.04); setTimeout(()=>playNote(f*1.2,0.05,'sine',0.03),80);} }, 800);
    musicIntervals.push(blips);
  }
  // The Expansion — a bigger, driving, cinematic mood (minor->hopeful, propulsive)
  function startEpic() {
    if (currentMood === 'epic') return; stopAllMusic(); currentMood='epic';
    playDrone(98,24,'sawtooth',0.02); playDrone(146.83,24,'triangle',0.02); playDrone(196,24,'sine',0.02);
    // four-on-the-floor drive
    let step = 0;
    const drive = setInterval(() => { if (musicMuted||currentMood!=='epic'){clearInterval(drive);return;}
      playNote(49,0.12,'sine',0.14);                        // kick
      if (step%2===1) playNote(9000,0.02,'square',0.02);    // hat offbeat
      step++; }, 300);
    musicIntervals.push(drive);
    // rising anthem arps in D minor -> F major
    const anthem = [146.83,220,293.66,349.23,440,349.23,293.66,220];
    let ai = 0;
    const arp = setInterval(() => { if (musicMuted||currentMood!=='epic'){clearInterval(arp);return;}
      playNote(anthem[ai%anthem.length],0.24,'triangle',0.05);
      if (ai%8===0) playNote(anthem[ai%anthem.length]*2,0.4,'square',0.02);
      ai++; }, 300);
    musicIntervals.push(arp);
  }
  function startTriumphant() {
    if (currentMood === 'triumphant') return; stopAllMusic(); currentMood='triumphant';
    playDrone(130.81,14,'sine',0.03); playDrone(164.81,14,'triangle',0.025); playDrone(196,14,'sine',0.025); playDrone(261.63,14,'sine',0.02);
    [ {f:523,d:0.3,t:0},{f:659,d:0.3,t:0.35},{f:784,d:0.3,t:0.7},{f:1047,d:0.85,t:1.1},
      {f:880,d:0.3,t:2.2},{f:1047,d:0.6,t:2.6},{f:1175,d:1.1,t:3.3} ].forEach(n=>playNote(n.f,n.d,'triangle',0.06,n.t));
    setTimeout(()=>{ if(currentMood!=='triumphant')return; playDrone(261.63,8,'sine',0.025); playDrone(329.63,8,'triangle',0.02); playDrone(392,8,'sine',0.02); },4000);
    let fs=0; const fp=setInterval(()=>{ if(musicMuted||currentMood!=='triumphant'){clearInterval(fp);return;} if(fs%2===0) playNote(65.41,0.15,'sine',0.08); fs++; },500);
    musicIntervals.push(fp);
  }

  // ===== TIMELINE ENGINE =====
  const TOTAL_DURATION = 62000;
  let startTime = Date.now(), paused = false, pauseOffset = 0, animFrame, executed = new Set();

  const timeline = [
    [0, () => { showScene(0); initAudio(); }],
    [400, () => startForeboding()],

    // crisis headlines
    [1200, () => showScene(1)],
    [1500, () => { showHeadline(0); playImpact(); }],
    [3400, () => { hideHeadline(0); flashRed(); playImpact(); }],
    [3900, () => showHeadline(1)],
    [5700, () => hideHeadline(1)],
    [6100, () => { showHeadline(2); playImpact(); }],
    [7900, () => hideHeadline(2)],
    [8300, () => { showHeadline(3); flashRed(); }],
    [10000, () => hideHeadline(3)],
    [10400, () => showHeadline(4)],
    [12000, () => hideHeadline(4)],
    [12400, () => { showHeadline(5); flashRed(); playImpact(); }],
    [14000, () => hideHeadline(5)],

    // Phase 1 title
    [14600, () => { showScene(2); playWhoosh(); startTrading(); }],

    // Merit order diagram
    [17800, () => { showScene(3); playWhoosh(); }],
    [18300, () => { document.getElementById('moWrap').classList.add('go'); }],
    [19600, () => { const c=document.getElementById('moClear'); c.classList.add('on'); playImpact(); }],
    [20200, () => document.getElementById('moCap').classList.add('on')],

    // Phase 1 features
    [23500, () => { showScene(4); playWhoosh(); }],
    [24000, () => showEl('fc-0')], [24350, () => showEl('fc-1')],
    [24700, () => { showEl('fc-2'); playImpact(); }], [25050, () => showEl('fc-3')], [25400, () => showEl('fc-4')],

    // The turn
    [27800, () => { showScene(5); playWhoosh(); }],
    [28700, () => playImpact()],

    // Expansion title
    [30400, () => { showScene(6); playRiser(1.2); startEpic(); }],

    // Expansion phases
    [33800, () => { showScene(7); playWhoosh(); }],
    [34300, () => showEl('ph-0')], [35100, () => showEl('ph-1')],
    [35900, () => showEl('ph-2')], [36700, () => showEl('ph-3')],
    [37500, () => { showEl('ph-4'); playImpact(); }],

    // Summary montage
    [42000, () => { showScene(8); playWhoosh(); }],
    [42300, () => { showEl('vb-0'); playNote(392,0.12,'triangle',0.08); }],
    [42800, () => { showEl('vb-1'); playNote(523,0.12,'triangle',0.08); }],
    [43300, () => { showEl('vb-2'); playNote(659,0.12,'triangle',0.08); }],
    [43800, () => { showEl('vb-3'); playImpact(); }],
    [44400, () => { for (let i=0;i<9;i++) setTimeout(()=>showEl('ch-'+i), i*120); }],

    // Finale
    [48500, () => { showScene(9); playRiser(1.4); startTriumphant(); }],
    [49200, () => showEl('ft-0')],
    [50600, () => showEl('ft-1')],
    [51600, () => { showEl('ft-2'); playImpact(); }],
    [52400, () => showEl('ft-3')],
  ];

  function getElapsed() { return paused ? pauseOffset : Date.now() - startTime + pauseOffset; }
  function tick() {
    const elapsed = getElapsed();
    document.getElementById('progressBar').style.width = Math.min(elapsed/TOTAL_DURATION*100,100) + '%';
    timeline.forEach(([t, action], i) => { if (elapsed >= t && !executed.has(i)) { executed.add(i); action(); } });
    if (!paused && elapsed < TOTAL_DURATION + 3000) animFrame = requestAnimationFrame(tick);
  }

  function showScene(n) {
    document.querySelectorAll('.scene').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('scene-' + n); if (el) el.classList.add('active');
  }
  function showEl(id) { const el = document.getElementById(id); if (el) el.classList.add('visible'); }
  function showHeadline(n) { const el = document.getElementById('hl-'+n); if (el) { el.classList.add('visible'); el.classList.remove('fade-out'); } }
  function hideHeadline(n) { const el = document.getElementById('hl-'+n); if (el) { el.classList.remove('visible'); el.classList.add('fade-out'); } }
  function flashRed() { const el = document.getElementById('redFlash'); el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); setTimeout(() => { el.classList.remove('flash'); el.style.opacity = '0'; }, 700); }

  // ===== controls =====
  document.getElementById('btnMute').addEventListener('click', () => {
    musicMuted = !musicMuted;
    document.getElementById('btnMute').innerHTML = musicMuted ? '&#128264;' : '&#128266;';
    if (musicMuted) stopAllMusic();
  });
  document.getElementById('btnPause').addEventListener('click', () => {
    if (paused) { paused = false; startTime = Date.now(); document.getElementById('btnPause').innerHTML = '&#10074;&#10074;'; tick(); }
    else { paused = true; pauseOffset = getElapsed(); document.getElementById('btnPause').innerHTML = '&#9654;'; cancelAnimationFrame(animFrame); stopAllMusic(); }
  });
  function resetVisuals() {
    document.querySelectorAll('.headline').forEach(el => el.classList.remove('visible','fade-out'));
    document.querySelectorAll('.fcard,.verb,.chip,.finale-tag,.finale-brand,.finale-sub').forEach(el => el.classList.remove('visible'));
    const w = document.getElementById('moWrap'); w.classList.remove('go');
    document.getElementById('moClear').classList.remove('on'); document.getElementById('moCap').classList.remove('on');
  }
  document.getElementById('btnRestart').addEventListener('click', () => {
    stopAllMusic(); executed.clear(); pauseOffset = 0; paused = false; startTime = Date.now();
    document.getElementById('btnPause').innerHTML = '&#10074;&#10074;';
    resetVisuals(); document.getElementById('progressBar').style.width = '0%';
    cancelAnimationFrame(animFrame); tick();
  });
  document.getElementById('btnSkip').addEventListener('click', () => {
    pauseOffset = 48500; startTime = Date.now(); paused = false; executed.clear();
    document.getElementById('btnPause').innerHTML = '&#10074;&#10074;';
    cancelAnimationFrame(animFrame); tick();
  });
  document.getElementById('btnFullscreen').addEventListener('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
    else document.exitFullscreen();
  });
  document.addEventListener('keydown', (e) => {
    if (!started) return; initAudio();
    if (e.code==='Space'){ e.preventDefault(); document.getElementById('btnPause').click(); }
    else if (e.code==='KeyR') document.getElementById('btnRestart').click();
    else if (e.code==='KeyM') document.getElementById('btnMute').click();
    else if (e.code==='KeyF') document.getElementById('btnFullscreen').click();
    else if (e.code==='ArrowRight'){ pauseOffset = getElapsed()+5000; startTime = Date.now(); if(!paused){cancelAnimationFrame(animFrame);tick();} }
    else if (e.code==='ArrowLeft'){ pauseOffset = Math.max(0,getElapsed()-5000); startTime = Date.now(); executed.clear(); resetVisuals(); if(!paused){cancelAnimationFrame(animFrame);tick();} }
  });

  // ===== click-to-start =====
  function startTrailer() {
    if (started) return; started = true;
    const overlay = document.getElementById('startOverlay');
    if (overlay) { overlay.style.transition='opacity .6s ease'; overlay.style.opacity='0'; setTimeout(()=>overlay.remove(),700); }
    initAudio(); startTime = Date.now(); pauseOffset = 0; tick();
  }
  document.getElementById('startOverlay').addEventListener('click', startTrailer);
  document.addEventListener('keydown', function onKey(e){ if (!started && (e.code==='Space'||e.code==='Enter')){ e.preventDefault(); startTrailer(); document.removeEventListener('keydown', onKey);} });
})();
</script>
</body>
</html>
`;
}
