/**
 * GridRival cinematic trailer. Procedurally scored; served at /api/trailer.
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
    --bg: #05070e; --panel: #0b1120; --ink: #eaf1fb; --muted: #8ba0bf;
    --electric: #34a1ff; --electric-2: #6fc3ff; --loss: #ff4b57; --profit: #34d399;
    --warning: #f5b53d; --gold: #ffd469; --vic: #4aa8ff; --sa: #f2a63a;
    --mono: 'SF Mono','JetBrains Mono',ui-monospace,Menlo,Consolas,monospace;
    --sans: 'SF Pro Display',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body { background: var(--bg); color: var(--ink); font-family: var(--sans); overflow: hidden; position: fixed; inset: 0; }
  #stage { position: absolute; inset: 0; overflow: hidden; }
  #stage::before {
    content: ""; position: absolute; inset: 0; opacity: .35; pointer-events: none;
    background-image: linear-gradient(rgba(52,161,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(52,161,255,.06) 1px, transparent 1px);
    background-size: 44px 44px; animation: gridDrift 20s linear infinite;
  }
  @keyframes gridDrift { to { background-position: 44px 44px; } }

  .scene { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; visibility: hidden; padding: 4vh 5vw; text-align: center; transition: opacity .5s ease; }
  .scene.active { opacity: 1; visibility: visible; }

  #redFlash { position: absolute; inset: 0; background: radial-gradient(circle, rgba(255,60,70,.5), transparent 70%); opacity: 0; pointer-events: none; z-index: 40; }
  #redFlash.flash { animation: flashPulse .5s ease-out; }
  @keyframes flashPulse { 0% { opacity: .8; } 100% { opacity: 0; } }

  .bolt { font-size: clamp(80px, 18vw, 240px); line-height: 1; filter: drop-shadow(0 0 40px var(--electric)); animation: boltFlicker 2.4s ease-in-out infinite; }
  @keyframes boltFlicker { 0%,100%{opacity:.9} 45%{opacity:.5} 50%{opacity:1} 55%{opacity:.6} }

  .headline { position: absolute; max-width: 92vw; font-size: clamp(28px, 6vw, 74px); font-weight: 800; line-height: 1.02; letter-spacing: -.02em; opacity: 0; transform: translateY(28px) scale(.98); text-wrap: balance; transition: opacity .35s ease, transform .35s ease; }
  .headline.visible { opacity: 1; transform: translateY(0) scale(1); }
  .headline.fade-out { opacity: 0; transform: translateY(-24px) scale(1.02); }
  .headline .src { display:block; font-family: var(--mono); font-size: clamp(10px,1.3vw,13px); font-weight: 500; letter-spacing:.2em; color: var(--muted); text-transform: uppercase; margin-bottom: 14px; }
  .headline .red { color: var(--loss); } .headline .amber { color: var(--warning); } .headline .elec { color: var(--electric-2); }

  .phase-label { font-family: var(--mono); font-size: clamp(12px,2vw,18px); letter-spacing: .5em; text-transform: uppercase; color: var(--electric); margin-bottom: 18px; opacity: 0; animation: fadeUp .7s .1s ease forwards; }
  .brand { font-size: clamp(40px, 10vw, 132px); font-weight: 900; letter-spacing: -.03em; line-height: .92; }
  .brand .sub { display:block; font-size: .42em; font-weight: 800; letter-spacing: .02em; margin-top: 8px; }
  .title-reveal .brand { opacity: 0; animation: slamIn .6s .15s cubic-bezier(.2,1.3,.3,1) forwards; }
  .glow-electric { color: #fff; text-shadow: 0 0 50px rgba(52,161,255,.75), 0 0 120px rgba(52,161,255,.35); }
  .glow-gold { color: #fff; text-shadow: 0 0 50px rgba(255,207,92,.7), 0 0 130px rgba(255,207,92,.35); }
  .tagline-lead { font-size: clamp(18px,3.4vw,38px); font-weight: 700; opacity: 0; animation: fadeUp .7s .5s ease forwards; }
  @keyframes fadeUp { from { opacity:0; transform: translateY(22px);} to { opacity:1; transform:none; } }
  @keyframes slamIn { 0%{opacity:0; transform: scale(2.4); filter: blur(8px);} 60%{opacity:1; transform: scale(.94); filter:blur(0);} 100%{opacity:1; transform: scale(1);} }

  /* diagram framework */
  .dh { font-family: var(--mono); font-size: clamp(11px,1.6vw,15px); letter-spacing:.3em; text-transform: uppercase; color: var(--electric); margin-bottom: 20px; }
  /* big dramatic hero line on each mechanic slide */
  .drama { font-weight: 900; font-size: clamp(26px,6vw,56px); line-height: 1.02; letter-spacing: -.02em; text-transform: uppercase; text-align: center; text-wrap: balance; color: var(--ink); margin: -6px 0 26px; opacity: 0; transform: translateY(16px) scale(.94); transition: opacity .55s ease, transform .55s cubic-bezier(.2,1.3,.3,1); text-shadow: 0 0 34px rgba(90,160,255,.18); }
  .drama.on { opacity: 1; transform: none; }
  .drama .hot { color: var(--loss); text-shadow: 0 0 26px rgba(255,75,87,.45); }
  .drama .cool { color: var(--electric-2); text-shadow: 0 0 26px rgba(52,161,255,.45); }
  .drama .gold { color: var(--gold); text-shadow: 0 0 26px rgba(255,212,105,.45); }
  .dcap { margin-top: 30px; font-size: clamp(13px,1.9vw,18px); color: var(--muted); opacity: 0; transition: opacity .5s ease; max-width: min(760px,92vw); text-wrap: balance; }
  .dcap.on { opacity: 1; } .dcap b { color: var(--ink); }

  /* merit order diagram */
  .diagram { width: min(880px, 92vw); }
  .mo-wrap { position: relative; height: min(44vh, 340px); border-left: 2px solid rgba(255,255,255,.18); border-bottom: 2px solid rgba(255,255,255,.18); display: flex; align-items: flex-end; gap: 6px; padding: 0 4px; }
  .mo-axis-y { position:absolute; left: -46px; top: -6px; font-family: var(--mono); font-size: 11px; color: var(--muted); }
  .mo-axis-x { position:absolute; right: 0; bottom: -24px; font-family: var(--mono); font-size: 11px; color: var(--muted); }
  .mo-bar { flex: 1; background: var(--c); border-radius: 4px 4px 0 0; height: 0; transition: height .6s cubic-bezier(.2,.8,.2,1); box-shadow: inset 0 0 0 1px rgba(255,255,255,.08); position: relative; }
  .mo-bar .lab { position:absolute; top:-20px; left:0; right:0; font-family: var(--mono); font-size: 10px; color: var(--muted); opacity:0; transition: opacity .4s; }
  .mo-wrap.go .mo-bar { height: var(--h); } .mo-wrap.go .mo-bar .lab { opacity: 1; }
  .mo-demand { position:absolute; top:0; bottom:0; width: 3px; background: repeating-linear-gradient(var(--loss) 0 8px, transparent 8px 14px); left: 100%; opacity: 0; transition: left 1s ease .4s, opacity .4s ease .4s; }
  .mo-wrap.go .mo-demand { left: 62%; opacity: 1; }
  .mo-demand .dl { position:absolute; top: 6px; left: 8px; font-family: var(--mono); font-size: 11px; color: var(--loss); white-space: nowrap; }
  .mo-clear { position:absolute; left:0; right:0; height: 2px; background: var(--gold); box-shadow: 0 0 18px var(--gold); opacity: 0; bottom: 0; transition: opacity .4s ease 1.2s; }
  .mo-clear.on { opacity: 1; }
  .mo-clear .price { position:absolute; right: 6px; top: -30px; font-family: var(--mono); font-weight: 800; font-size: clamp(16px,2.6vw,26px); color: var(--gold); text-shadow: 0 0 20px rgba(255,207,92,.6); }

  /* feature cards — balanced flex */
  .card-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px; width: min(1040px, 95vw); }
  .fcard { flex: 0 1 178px; background: linear-gradient(180deg, rgba(52,161,255,.08), rgba(11,17,32,.6)); border: 1px solid rgba(52,161,255,.22); border-radius: 16px; padding: 20px 16px; opacity: 0; transform: translateY(24px) scale(.96); transition: opacity .45s ease, transform .45s ease; }
  .fcard.visible { opacity: 1; transform: none; }
  .fcard .ic { font-size: 30px; margin-bottom: 8px; }
  .fcard .t { font-weight: 800; font-size: clamp(15px,2vw,19px); letter-spacing: -.01em; }
  .fcard .d { font-size: clamp(11px,1.4vw,13px); color: var(--muted); margin-top: 4px; line-height: 1.35; }
  .fcard.danger { border-color: rgba(255,75,87,.3); background: linear-gradient(180deg, rgba(255,75,87,.1), rgba(11,17,32,.6)); }
  .fcard.warn { border-color: rgba(245,181,61,.3); background: linear-gradient(180deg, rgba(245,181,61,.1), rgba(11,17,32,.6)); }
  .fcard.gold { border-color: rgba(255,207,92,.35); background: linear-gradient(180deg, rgba(255,207,92,.12), rgba(11,17,32,.6)); }

  .sect-title { font-size: clamp(22px,4vw,44px); font-weight: 900; letter-spacing: -.02em; margin-bottom: 20px; }
  .sect-title .accent { color: var(--electric-2); }
  .pen-line { margin-top: 32px; font-size: clamp(28px,5.4vw,60px); font-weight: 900; letter-spacing: -.02em; color: var(--loss); text-shadow: 0 0 30px rgba(255,75,87,.5); opacity: 0; transform: translateY(16px); transition: opacity .5s ease, transform .5s cubic-bezier(.2,1.3,.3,1); }
  .pen-line.on { opacity: 1; transform: none; }

  /* call to action */
  #scene-cta { background: radial-gradient(circle at 50% 40%, rgba(255,207,92,.08), transparent 60%); }
  .cta-label { font-family: var(--mono); font-size: clamp(15px,2.6vw,24px); letter-spacing: .5em; text-transform: uppercase; color: var(--gold); opacity: 0; }
  .cta-label.visible { animation: fadeUp .6s ease forwards; }
  .cta-title { font-size: clamp(44px,10vw,120px); font-weight: 900; letter-spacing: -.03em; margin-top: 14px; opacity: 0; }
  .cta-title.visible { animation: slamIn .6s cubic-bezier(.2,1.3,.3,1) forwards; }
  .cta-event { font-size: clamp(20px,3.6vw,40px); font-weight: 800; margin-top: 18px; opacity: 0; }
  .cta-event.visible { animation: fadeUp .7s ease forwards; }
  .cta-date { display: block; font-family: var(--mono); font-size: clamp(17px,2.8vw,28px); letter-spacing: .22em; text-transform: uppercase; color: var(--gold); margin-top: 12px; }

  .turn-1 { font-size: clamp(22px,4.4vw,50px); font-weight: 800; color: var(--muted); opacity: 0; animation: fadeUp .6s .1s ease forwards; max-width: min(900px,92vw); text-wrap: balance; }
  .turn-2 { font-size: clamp(30px,7vw,84px); font-weight: 900; letter-spacing: -.02em; color: #fff; opacity: 0; animation: slamIn .6s .9s cubic-bezier(.2,1.3,.3,1) forwards; margin-top: 10px; }

  /* ---- BASIS diagram ---- */
  .basis-row { display: flex; align-items: stretch; gap: 18px; width: min(860px,94vw); }
  .region { flex: 1; border: 1px solid rgba(255,255,255,.14); border-radius: 16px; padding: 22px 14px; background: var(--panel); position: relative; }
  .region.vic { box-shadow: inset 0 3px 0 0 var(--vic); }
  .region.sa { box-shadow: inset 0 3px 0 0 var(--sa); }
  .region .rn { font-weight: 800; font-size: clamp(18px,2.4vw,26px); }
  .region.vic .rn { color: var(--vic); } .region.sa .rn { color: var(--sa); }
  .region .rp { font-family: var(--mono); font-weight: 800; font-size: clamp(30px,5vw,52px); margin: 6px 0; transition: color .4s; }
  .region .rl { font-family: var(--mono); font-size: 11px; letter-spacing:.1em; text-transform: uppercase; color: var(--muted); }
  .link { width: clamp(90px,14vw,140px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; }
  .link-label { font-family: var(--mono); font-size: 10px; letter-spacing:.12em; text-transform: uppercase; color: var(--muted); }
  .link-bar { width: 100%; height: 8px; border-radius: 5px; background: rgba(255,255,255,.1); overflow: hidden; }
  .link-fill { height: 100%; width: 20%; background: var(--electric); border-radius: 5px; transition: width 1.1s ease, background .5s ease; }
  .basis-row.go .link-fill { width: 100%; background: var(--loss); }
  .link-status { font-family: var(--mono); font-size: 11px; color: var(--muted); transition: color .4s; }
  .basis-row.go .link-status { color: var(--loss); }
  .basis-badge { margin-top: 22px; font-family: var(--mono); font-weight: 800; font-size: clamp(15px,2.4vw,24px); color: var(--warning); border: 1px solid rgba(245,181,61,.4); border-radius: 999px; padding: 8px 20px; opacity: 0; transform: scale(.8); transition: opacity .4s ease, transform .4s cubic-bezier(.2,1.4,.3,1); }
  .basis-badge.on { opacity: 1; transform: scale(1); }

  /* ---- CAPS diagram ---- */
  .cap-stage { width: min(760px,94vw); display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .cap-scen { display: flex; align-items: baseline; gap: 14px; font-family: var(--mono); }
  .cap-spot-label { font-size: clamp(12px,1.6vw,15px); color: var(--muted); text-transform: uppercase; letter-spacing: .12em; }
  .cap-spot { font-weight: 800; font-size: clamp(34px,7vw,72px); color: var(--loss); text-shadow: 0 0 24px rgba(255,75,87,.4); }
  .cap-strike { font-family: var(--mono); font-size: clamp(13px,1.8vw,17px); color: var(--gold); margin-top: 4px; border-top: 2px dashed rgba(255,207,92,.5); padding-top: 6px; width: min(420px,80vw); }
  .cap-pay { margin-top: 14px; font-family: var(--mono); font-weight: 800; font-size: clamp(16px,2.6vw,26px); color: var(--profit); opacity: 0; transform: translateY(10px); transition: opacity .4s, transform .4s; }
  .cap-pay.on { opacity: 1; transform: none; }
  .deal { margin-top: 16px; font-size: clamp(13px,1.8vw,17px); opacity: 0; transition: opacity .4s; }
  .deal.on { opacity: 1; }

  /* ---- LOAD SHAPE diagram ---- */
  .load-stage { width: min(820px,94vw); display: flex; flex-direction: column; gap: 12px; }
  .cust { display: flex; align-items: center; gap: 12px; }
  .cust .cn { width: clamp(120px,18vw,170px); text-align: right; font-size: clamp(12px,1.6vw,15px); }
  .cust .cn small { display:block; font-family: var(--mono); font-size: 10px; color: var(--muted); letter-spacing: .08em; }
  .spark { flex: 1; display: flex; align-items: flex-end; gap: 4px; height: 54px; border-bottom: 1px solid rgba(255,255,255,.12); }
  .spark i { flex: 1; background: var(--sc, var(--electric)); border-radius: 3px 3px 0 0; height: 0; transition: height .5s cubic-bezier(.2,.8,.2,1); }
  .load-stage.go .spark i { height: var(--h); }
  .cust.dr .spark i.shed { transition: height .5s ease 1.1s, background .5s ease 1.1s; }
  .load-stage.go .cust.dr .spark i.shed { height: 14% !important; background: var(--profit); }
  .dr-note { font-family: var(--mono); font-size: 11px; color: var(--profit); text-align: right; opacity: 0; transition: opacity .4s ease 1.2s; }
  .load-stage.go .dr-note { opacity: 1; }

  /* ---- ELECTRIFICATION diagram ---- */
  .elec-stage { width: min(820px,94vw); position: relative; }
  .elec-wrap { display: flex; align-items: flex-end; gap: 12px; height: min(40vh,300px); border-left: 2px solid rgba(255,255,255,.18); border-bottom: 2px solid rgba(255,255,255,.18); padding: 0 6px; }
  .yr { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 3px; height: 100%; }
  .yr .dbar { width: 62%; background: linear-gradient(180deg,#3a5f9e,#274574); border-radius: 4px 4px 0 0; height: 0; transition: height .6s cubic-bezier(.2,.8,.2,1) var(--d,0s); }
  .yr .proj { width: 62%; background: var(--profit); border-radius: 4px 4px 0 0; height: 0; opacity: 0; transition: height .5s ease var(--pd,0s), opacity .3s ease var(--pd,0s); box-shadow: 0 0 14px rgba(52,211,153,.5); }
  .yr .yl { font-family: var(--mono); font-size: 11px; color: var(--muted); }
  .elec-stage.go .yr .dbar { height: var(--h); }
  .elec-stage.go .yr .proj { height: var(--ph); opacity: 1; }
  .elec-legend { display:flex; gap: 18px; justify-content: center; margin-top: 14px; font-family: var(--mono); font-size: 11px; color: var(--muted); }
  .lgd { display:flex; align-items:center; gap:6px; } .lgd b { width: 10px; height: 10px; border-radius: 2px; display:inline-block; }

  /* ---- REAL RULES ---- */
  .rules-row { display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; width: min(940px,95vw); }
  .rule { flex: 0 1 220px; border: 1px solid rgba(255,255,255,.14); border-radius: 14px; padding: 18px 16px; background: var(--panel); opacity: 0; transform: translateY(18px); transition: opacity .45s ease, transform .45s ease; }
  .rule.visible { opacity: 1; transform: none; }
  .rule .ric { font-size: 26px; } .rule .rt { font-weight: 800; margin-top: 6px; font-size: clamp(14px,1.9vw,18px); }
  .rule .rd { font-size: clamp(11px,1.4vw,13px); color: var(--muted); margin-top: 3px; }

  /* summary */
  .verbs { display:flex; gap: clamp(10px,3vw,40px); flex-wrap: wrap; justify-content: center; margin-bottom: 26px; }
  .verb { font-size: clamp(24px,5vw,60px); font-weight: 900; letter-spacing: -.02em; opacity: 0; }
  .verb.visible { animation: slamIn .5s cubic-bezier(.2,1.3,.3,1) forwards; }
  .verb.v0 { color: var(--electric-2); } .verb.v1 { color: var(--profit); } .verb.v2 { color: var(--warning); } .verb.v3 { color: var(--loss); }
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

  .ticker-bar { position: absolute; left: 0; right: 0; bottom: 46px; height: 34px; background: rgba(4,7,14,.9); border-top: 1px solid rgba(52,161,255,.25); border-bottom: 1px solid rgba(52,161,255,.15); overflow: hidden; z-index: 30; display: flex; align-items: center; }
  .ticker-content { display: inline-flex; white-space: nowrap; animation: tickerScroll 34s linear infinite; }
  .ti { display: inline-flex; align-items: center; gap: 7px; padding: 0 22px; font-family: var(--mono); font-size: 12px; color: var(--muted); }
  .dot { width: 7px; height: 7px; border-radius: 50%; }
  .dot.r { background: var(--loss); } .dot.g { background: var(--profit); } .dot.a { background: var(--warning); } .dot.b { background: var(--electric); }
  .up { color: var(--loss); } .down { color: var(--profit); } .num { color: var(--ink); }
  @keyframes tickerScroll { from { transform: translateX(0);} to { transform: translateX(-50%);} }

  .controls { position: absolute; left: 0; right: 0; bottom: 0; height: 46px; background: rgba(4,7,14,.95); border-top: 1px solid rgba(255,255,255,.08); display: flex; align-items: center; gap: 8px; padding: 0 12px; z-index: 50; }
  .controls button { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12); color: var(--ink); border-radius: 8px; width: 32px; height: 30px; cursor: pointer; font-size: 14px; display: inline-flex; align-items: center; justify-content: center; }
  .controls button:hover { background: rgba(52,161,255,.2); border-color: var(--electric); }
  .progress-track { flex: 1; height: 4px; background: rgba(255,255,255,.1); border-radius: 3px; overflow: hidden; }
  #progressBar { height: 100%; width: 0; background: linear-gradient(90deg, var(--electric), var(--electric-2)); }
  .hint { font-family: var(--mono); font-size: 10px; color: var(--muted); letter-spacing: .05em; }

  #startOverlay { position: absolute; inset: 0; z-index: 100; background: radial-gradient(circle at 50% 40%, #0b1428, #05070e 70%); display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; }
  #startOverlay .st-brand { font-size: clamp(44px,11vw,120px); font-weight: 900; letter-spacing: -.03em; margin-top: 4px; }
  #startOverlay .st-play { margin-top: 26px; font-family: var(--mono); letter-spacing: .25em; text-transform: uppercase; font-size: 13px; color: var(--electric); border: 1px solid rgba(52,161,255,.4); border-radius: 999px; padding: 12px 26px; animation: pulsePlay 2s ease-in-out infinite; }
  #startOverlay .st-note { margin-top: 16px; font-size: 12px; color: var(--muted); }
  @keyframes pulsePlay { 0%,100%{ box-shadow: 0 0 0 0 rgba(52,161,255,.3);} 50%{ box-shadow: 0 0 0 12px rgba(52,161,255,0);} }

  @media (max-width: 680px) {
    .ticker-bar { bottom: 44px; height: 28px; } .ti { font-size: 10px; padding: 0 14px; }
    .basis-row { flex-direction: column; } .link { width: 100%; flex-direction: row; } .link-bar { width: 120px; }
    .cust .cn { width: 96px; }
  }
  @media (prefers-reduced-motion: reduce) { * { animation-duration: .001s !important; } }
</style>
</head>
<body>
<div id="stage">
  <div id="redFlash"></div>

  <div class="scene active" id="scene-0"><div class="bolt">&#9889;</div></div>

  <!-- crisis headlines -->
  <div class="scene" id="scene-1">
    <div class="headline" id="hl-0"><span class="src">AEMO Market Notice</span>Prices hit <span class="red">$16,600/MWh</span> as the heat bites</div>
    <div class="headline" id="hl-1"><span class="src">Systems Operator</span>South Australia <span class="amber">islanded</span> — the interconnector trips</div>
    <div class="headline" id="hl-2"><span class="src">Market Wire</span>A retailer <span class="red">collapses</span> — caught short in the spike</div>
    <div class="headline" id="hl-3"><span class="src">Regulator</span>The <span class="amber">AER</span> opens an investigation into bidding conduct</div>
    <div class="headline" id="hl-4"><span class="src">The Grid, 2030</span>Coal exits. Renewables surge. <span class="elec">Volatility is the new normal.</span></div>
    <div class="headline" id="hl-5"><span class="src">Market Structure</span>New batteries <span class="elec">crush the duck curve</span> — and the spread with it</div>
  </div>

  <!-- Phase 1 title -->
  <div class="scene title-reveal" id="scene-2">
    <div class="phase-label">The Fundamentals</div>
    <div class="brand"><span class="glow-electric">GRIDRIVAL</span><span class="sub glow-electric">MERIT ORDER</span></div>
    <div class="tagline-lead" style="margin-top:18px;color:var(--muted)">Learn how the market really clears.</div>
  </div>

  <!-- merit order diagram -->
  <div class="scene" id="scene-3">
    <div class="diagram">
      <h3 class="dh">How the market clears</h3>
      <div class="mo-wrap" id="moWrap">
        <span class="mo-axis-y">$/MWh</span><span class="mo-axis-x">MW &rarr;</span>
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
      <div class="dcap" id="moCap">Stack the cheapest generators first. Where supply meets demand, the <b>marginal bid sets the price</b> — and everyone dispatched earns it.</div>
    </div>
  </div>

  <!-- Phase 1 features -->
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

  <!-- the turn -->
  <div class="scene" id="scene-5">
    <div class="turn-1">So you've played GridRival and made money in the merit order?</div>
    <div class="turn-2">That's just the warm-up.</div>
  </div>

  <!-- expansion title -->
  <div class="scene title-reveal" id="scene-6">
    <div class="phase-label" style="color:var(--gold)">GridRival presents</div>
    <div class="brand"><span class="glow-gold">THE EXPANSION</span><span class="sub glow-gold">FULL POSITION</span></div>
    <div class="tagline-lead" style="margin-top:18px;color:var(--muted)">Stop bidding plant. Start running a book.</div>
  </div>

  <!-- BASIS diagram -->
  <div class="scene" id="scene-basis">
    <h3 class="dh">Basis risk &middot; interconnectors</h3>
    <div class="drama" id="dramaBasis">One grid. <span class="hot">Two prices.</span></div>
    <div class="basis-row" id="basisRow">
      <div class="region vic"><div class="rn">VIC</div><div class="rp" id="vicP">$33</div><div class="rl">long &middot; exports</div></div>
      <div class="link"><div class="link-label">Heywood</div><div class="link-bar"><div class="link-fill"></div></div><div class="link-status" id="linkStat">flowing</div></div>
      <div class="region sa"><div class="rn">SA</div><div class="rp" id="saP">$33</div><div class="rl">short &middot; imports</div></div>
    </div>
    <div class="basis-badge" id="basisBadge">BASIS &nbsp;$122</div>
    <div class="dcap" id="basisCap">Fill the interconnector and the regions <b>price apart</b>. Your plant clears in VIC — your customers pay in SA.</div>
  </div>

  <!-- CAPS diagram -->
  <div class="scene" id="scene-caps">
    <h3 class="dh">Caps &amp; swaps</h3>
    <div class="drama" id="dramaCaps"><span class="cool">Covered.</span> Or <span class="hot">burned.</span></div>
    <div class="cap-stage">
      <div class="cap-scen"><span class="cap-spot-label">Spot</span><span class="cap-spot" id="capSpot">$80</span></div>
      <div class="cap-strike">&#9472;&#9472; $300 cap strike &#9472;&#9472;</div>
      <div class="cap-pay" id="capPay">SPIKE! &nbsp;Your $300 cap pays <b>+$1.2m</b></div>
      <div class="deal" id="capDeal">&#129309; Struck on the floor: Team A &harr; Team B</div>
    </div>
    <div class="dcap" id="capsCap">Buy a <b>$300 cap</b> from another team — deal it on your phone, like a BDM. When the spike comes, it pays.</div>
  </div>

  <!-- LOAD SHAPE + DR diagram -->
  <div class="scene" id="scene-load">
    <h3 class="dh">C&amp;I customers &middot; load shape &middot; demand response</h3>
    <div class="drama" id="dramaLoad"><span class="gold">Flat is gold.</span> <span class="hot">Peaky is pain.</span></div>
    <div class="load-stage" id="loadStage">
      <div class="cust"><div class="cn">Data centre<small>FLAT &middot; GOLD</small></div><div class="spark" style="--sc:var(--profit)"><i style="--h:60%"></i><i style="--h:62%"></i><i style="--h:60%"></i><i style="--h:63%"></i><i style="--h:61%"></i><i style="--h:60%"></i></div></div>
      <div class="cust"><div class="cn">CBD offices<small>PEAKY &middot; RISK</small></div><div class="spark" style="--sc:var(--warning)"><i style="--h:20%"></i><i style="--h:34%"></i><i style="--h:70%"></i><i style="--h:100%"></i><i style="--h:64%"></i><i style="--h:30%"></i></div></div>
      <div class="cust dr"><div class="cn">Smelter<small>FLAT + DR</small></div><div class="spark" style="--sc:var(--electric)"><i style="--h:80%"></i><i style="--h:80%"></i><i style="--h:80%"></i><i class="shed" style="--h:80%"></i><i style="--h:80%"></i><i style="--h:80%"></i></div></div>
      <div class="dr-note">&#9889; price spike &rarr; smelter sheds load</div>
    </div>
    <div class="dcap" id="loadCap">Win big customers. <b>Flat load is gold, peaky load is risk</b> — and a smelter can switch off exactly when prices bite.</div>
  </div>

  <!-- ELECTRIFICATION + projects diagram -->
  <div class="scene" id="scene-elec">
    <h3 class="dh">Electrification &middot; new projects to 2030</h3>
    <div class="drama" id="dramaElec">Build <span class="cool">2030</span> &mdash; or be left behind.</div>
    <div class="elec-stage" id="elecStage">
      <div class="elec-wrap">
        <div class="yr"><div class="proj" style="--ph:0%;--pd:.1s"></div><div class="dbar" style="--h:40%;--d:0s"></div><div class="yl">2025</div></div>
        <div class="yr"><div class="proj" style="--ph:8%;--pd:.4s"></div><div class="dbar" style="--h:50%;--d:.15s"></div><div class="yl">2026</div></div>
        <div class="yr"><div class="proj" style="--ph:12%;--pd:.7s"></div><div class="dbar" style="--h:60%;--d:.3s"></div><div class="yl">2027</div></div>
        <div class="yr"><div class="proj" style="--ph:16%;--pd:1s"></div><div class="dbar" style="--h:72%;--d:.45s"></div><div class="yl">2028</div></div>
        <div class="yr"><div class="proj" style="--ph:20%;--pd:1.3s"></div><div class="dbar" style="--h:84%;--d:.6s"></div><div class="yl">2029</div></div>
        <div class="yr"><div class="proj" style="--ph:26%;--pd:1.6s"></div><div class="dbar" style="--h:96%;--d:.75s"></div><div class="yl">2030</div></div>
      </div>
      <div class="elec-legend"><span class="lgd"><b style="background:#3a5f9e"></b>Demand (EVs, electrification)</span><span class="lgd"><b style="background:var(--profit)"></b>New generation you build</span></div>
    </div>
    <div class="dcap" id="elecCap">Reinvest your profits. <b>Build plant and win customers</b> as electrification lifts demand year after year — some projects land, some don't.</div>
  </div>

  <!-- REAL RULES -->
  <div class="scene" id="scene-rules">
    <div class="sect-title">Real market. <span class="accent">Real rules.</span></div>
    <div class="rules-row">
      <div class="rule" id="rl-0"><div class="ric">&#9878;&#65039;</div><div class="rt">AER investigations</div><div class="rd">Withhold or bid at the cap in a shortage — and get fined</div></div>
      <div class="rule" id="rl-1"><div class="ric">&#128267;</div><div class="rt">Demand response</div><div class="rd">Call on load and storage to defend a position — at a cost</div></div>
      <div class="rule" id="rl-2"><div class="ric">&#127788;&#65039;</div><div class="rt">Predispatch imprecision</div><div class="rd">The forecast lies. Demand surprises. So do the outages</div></div>
    </div>
    <div class="pen-line" id="realPen">Real penalties.</div>
  </div>

  <!-- summary -->
  <div class="scene" id="scene-8">
    <div class="verbs">
      <span class="verb v0" id="vb-0">BID.</span><span class="verb v1" id="vb-1">POSITION.</span><span class="verb v2" id="vb-2">HEDGE.</span><span class="verb v3" id="vb-3">SURVIVE.</span>
    </div>
    <div class="chips">
      <span class="chip" id="ch-0">Merit-order dispatch</span><span class="chip" id="ch-1">Regional prices &amp; basis</span><span class="chip" id="ch-2">VOLL &amp; scarcity</span>
      <span class="chip" id="ch-3">AER conduct fines</span><span class="chip" id="ch-4">Caps &amp; swaps</span><span class="chip" id="ch-5">Retail margin</span>
      <span class="chip" id="ch-6">C&amp;I &amp; load shape</span><span class="chip" id="ch-7">Demand response</span><span class="chip" id="ch-8">Build &amp; electrify to 2030</span>
    </div>
  </div>

  <!-- finale -->
  <div class="scene" id="scene-9">
    <div class="finale-tag" id="ft-0"><span class="dim">In the NEM, companies go bust every year.</span></div>
    <div class="finale-tag" id="ft-1" style="font-size:clamp(26px,5vw,58px);font-weight:900;margin-top:6px">Will you?</div>
    <div class="finale-brand glow-electric" id="ft-2" style="margin-top:22px">THE EXPANSION</div>
    <div class="finale-sub" id="ft-3" style="margin-top:10px">Bid &middot; Position &middot; Hedge &middot; Survive</div>
  </div>

  <!-- call to action -->
  <div class="scene" id="scene-cta">
    <div class="cta-label" id="cta-0">Play it for real</div>
    <div class="cta-title" id="cta-1">Come play.</div>
    <div class="cta-event" id="cta-2"><span class="glow-gold">The Expansion</span> &middot; PD Team Day<span class="cta-date">September 1</span></div>
  </div>

  <div class="ticker-bar"><div class="ticker-content" id="tickerContent"></div></div>

  <div class="controls">
    <button id="btnPause" title="Pause (space)">&#10074;&#10074;</button>
    <button id="btnRestart" title="Restart (R)">&#8635;</button>
    <button id="btnMute" title="Mute (M)">&#128266;</button>
    <div class="progress-track"><div id="progressBar"></div></div>
    <span class="hint">space &middot; &larr; &rarr; &middot; F</span>
    <button id="btnSkip" title="Skip to end">&#9197;</button>
    <button id="btnFullscreen" title="Fullscreen (F)">&#9974;</button>
  </div>

  <div id="startOverlay">
    <div class="bolt">&#9889;</div>
    <div class="st-brand glow-electric">GRIDRIVAL</div>
    <div class="st-play">&#9654; Play Trailer</div>
    <div class="st-note">with sound &middot; ~99 seconds</div>
  </div>
</div>

<script>
(function() {
  const tickItems = [
    ['r','NSW','$487.32','up','&uarr;'],['g','VIC','$62.15','down','&darr;'],['a','QLD','$312.80','up','&uarr;'],
    ['g','SA','-$28.50','down','&darr;'],['r','TAS','$185.60','up','&uarr;'],['b','Demand','28,450 MW','',''],
    ['a','Solar','14.2 GW &bull; 48%','',''],['g','Wind','4.85 GW','',''],['r','Coal','6.2 GW','',''],
    ['a','Basis SA-VIC','+$122','up','&uarr;'],['b','Cap $300','struck','',''],['r','VOLL','$16,600','up','&uarr;'],
  ];
  function tickerHTML() {
    return tickItems.map(a => '<span class="ti"><span class="dot ' + a[0] + '"></span>' + a[1] + (a[2] ? ' <span class="num ' + (a[3]||'') + '">' + a[2] + '</span>' : '') + (a[4] ? ' ' + a[4] : '') + '</span>').join('');
  }
  document.getElementById('tickerContent').innerHTML = tickerHTML() + tickerHTML();

  // ===== music engine (Web Audio) =====
  let audioCtx = null, musicMuted = false, masterGain = null, currentMood = null, activeNodes = [], musicIntervals = [], started = false;
  function initAudio() {
    if (audioCtx && audioCtx.state === 'running') return;
    try { if (!audioCtx) { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); masterGain = audioCtx.createGain(); masterGain.gain.value = 0.38; masterGain.connect(audioCtx.destination); } if (audioCtx.state === 'suspended') audioCtx.resume(); } catch(e) {}
  }
  function stopAllMusic() { musicIntervals.forEach(id => clearInterval(id)); musicIntervals = []; activeNodes.forEach(n => { try { n.stop(); } catch(e) {} }); activeNodes = []; currentMood = null; }
  function playNote(freq, duration, type, volume, startDelay) {
    if (!audioCtx || !masterGain || musicMuted) return;
    const start = audioCtx.currentTime + (startDelay || 0);
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.type = type || 'sine'; osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume || 0.15, start); gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(gain); gain.connect(masterGain); osc.start(start); osc.stop(start + duration + 0.05); activeNodes.push(osc); return osc;
  }
  function playDrone(freq, duration, type, volume) {
    if (!audioCtx || !masterGain || musicMuted) return;
    [-7,0,7,12].forEach(d => { const osc = audioCtx.createOscillator(), gain = audioCtx.createGain(); osc.type = type || 'sine'; osc.frequency.value = freq; osc.detune.value = d;
      gain.gain.setValueAtTime(0, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(volume || 0.04, audioCtx.currentTime + 0.8); gain.gain.linearRampToValueAtTime(volume || 0.04, audioCtx.currentTime + duration - 1); gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
      osc.connect(gain); gain.connect(masterGain); osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime + duration + 0.1); activeNodes.push(osc); });
  }
  function playRumble(duration, volume) {
    if (!audioCtx || !masterGain || musicMuted) return;
    const bufferSize = audioCtx.sampleRate * duration, buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate), data = buffer.getChannelData(0); let last = 0;
    for (let i = 0; i < bufferSize; i++) { const w = Math.random()*2-1; last = (last + 0.02*w)/1.02; data[i] = last*3.5; }
    const src = audioCtx.createBufferSource(); src.buffer = buffer;
    const filt = audioCtx.createBiquadFilter(); filt.type='lowpass'; filt.frequency.value=120;
    const gain = audioCtx.createGain(); gain.gain.setValueAtTime(0, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(volume||0.12, audioCtx.currentTime+1); gain.gain.linearRampToValueAtTime(volume||0.12, audioCtx.currentTime+duration-1.5); gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime+duration);
    src.connect(filt); filt.connect(gain); gain.connect(masterGain); src.start(); src.stop(audioCtx.currentTime+duration+0.1); activeNodes.push(src);
  }
  function playImpact() { if (!audioCtx || !masterGain || musicMuted) return; const osc = audioCtx.createOscillator(), gain = audioCtx.createGain(); osc.type='sawtooth'; osc.frequency.setValueAtTime(80, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime+0.4); gain.gain.setValueAtTime(0.22, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+0.5); osc.connect(gain); gain.connect(masterGain); osc.start(); osc.stop(audioCtx.currentTime+0.6); activeNodes.push(osc); }
  function playWhoosh() { if (!audioCtx || !masterGain || musicMuted) return; const osc = audioCtx.createOscillator(), gain = audioCtx.createGain(); osc.type='sawtooth'; osc.frequency.setValueAtTime(200, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(2000, audioCtx.currentTime+0.3); osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime+0.6); gain.gain.setValueAtTime(0.07, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+0.7); osc.connect(gain); gain.connect(masterGain); osc.start(); osc.stop(audioCtx.currentTime+0.8); activeNodes.push(osc); }
  function playRiser(dur) { if (!audioCtx || !masterGain || musicMuted) return; const osc = audioCtx.createOscillator(), gain = audioCtx.createGain(); osc.type='sawtooth'; osc.frequency.setValueAtTime(110, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime+dur); gain.gain.setValueAtTime(0.02, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(0.09, audioCtx.currentTime+dur); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+dur+0.2); osc.connect(gain); gain.connect(masterGain); osc.start(); osc.stop(audioCtx.currentTime+dur+0.3); activeNodes.push(osc); }
  function playChime(f) { playNote(f, 0.3, 'triangle', 0.06); playNote(f*1.5, 0.25, 'sine', 0.03, 0.02); }

  function startForeboding() {
    if (currentMood === 'foreboding') return; stopAllMusic(); currentMood='foreboding';
    playRumble(22, 0.1); playDrone(73.42, 20, 'sawtooth', 0.025); playDrone(110, 20, 'sine', 0.03);
    const hb = setInterval(() => { if (musicMuted||currentMood!=='foreboding'){clearInterval(hb);return;} playNote(40,0.15,'sine',0.12); setTimeout(()=>playNote(38,0.12,'sine',0.08),200); }, 1400); musicIntervals.push(hb);
    const stabs = setInterval(() => { if (musicMuted||currentMood!=='foreboding'){clearInterval(stabs);return;} if (Math.random()>0.45){ const f=[311,370,466,554][Math.floor(Math.random()*4)]; playNote(f,1.5,'sawtooth',0.02);} }, 2300); musicIntervals.push(stabs);
  }
  function startTrading() {
    if (currentMood === 'trading') return; stopAllMusic(); currentMood='trading';
    playDrone(130.81,28,'triangle',0.025); playDrone(164.81,28,'sine',0.02); playDrone(196,28,'sine',0.02);
    let step = 0; const pulse = setInterval(() => { if (musicMuted||currentMood!=='trading'){clearInterval(pulse);return;}
      if (step%4===0) playNote(55,0.08,'sine',0.12); playNote(8000+Math.random()*2000,0.03,'square',0.015);
      if (step%8===0){ [261,329,392,523,659].forEach((f,i)=>playNote(f,0.2,'triangle',0.04,i*0.12)); }
      if (step%8===4){ [220,277,329,440].forEach((f,i)=>playNote(f,0.2,'triangle',0.03,i*0.12)); } step++; }, 200); musicIntervals.push(pulse);
    const blips = setInterval(() => { if (musicMuted||currentMood!=='trading'){clearInterval(blips);return;} if (Math.random()>0.4){ const f=800+Math.random()*1200; playNote(f,0.05,'sine',0.04); setTimeout(()=>playNote(f*1.2,0.05,'sine',0.03),80);} }, 800); musicIntervals.push(blips);
  }
  function startEpic() {
    if (currentMood === 'epic') return; stopAllMusic(); currentMood='epic';
    const layPad = () => { playDrone(98,26,'sawtooth',0.022); playDrone(146.83,26,'triangle',0.022); playDrone(196,26,'sine',0.02); };
    layPad();
    // Re-lay the sustained pad so the backing never drops out across the long expansion act.
    const pad = setInterval(() => { if (musicMuted || currentMood !== 'epic') { clearInterval(pad); return; } layPad(); }, 22000); musicIntervals.push(pad);
    let step = 0; const drive = setInterval(() => { if (musicMuted||currentMood!=='epic'){clearInterval(drive);return;} playNote(49,0.12,'sine',0.14); if (step%2===1) playNote(9000,0.02,'square',0.02); step++; }, 300); musicIntervals.push(drive);
    const anthem = [146.83,220,293.66,349.23,440,349.23,293.66,220]; let ai = 0;
    const arp = setInterval(() => { if (musicMuted||currentMood!=='epic'){clearInterval(arp);return;} playNote(anthem[ai%anthem.length],0.24,'triangle',0.05); if (ai%8===0) playNote(anthem[ai%anthem.length]*2,0.4,'square',0.02); ai++; }, 300); musicIntervals.push(arp);
  }
  function startTriumphant() {
    if (currentMood === 'triumphant') return; stopAllMusic(); currentMood='triumphant';
    playDrone(130.81,14,'sine',0.03); playDrone(164.81,14,'triangle',0.025); playDrone(196,14,'sine',0.025); playDrone(261.63,14,'sine',0.02);
    [ {f:523,d:0.3,t:0},{f:659,d:0.3,t:0.35},{f:784,d:0.3,t:0.7},{f:1047,d:0.85,t:1.1},{f:880,d:0.3,t:2.2},{f:1047,d:0.6,t:2.6},{f:1175,d:1.1,t:3.3} ].forEach(n=>playNote(n.f,n.d,'triangle',0.06,n.t));
    setTimeout(()=>{ if(currentMood!=='triumphant')return; playDrone(261.63,8,'sine',0.025); playDrone(329.63,8,'triangle',0.02); playDrone(392,8,'sine',0.02); },4000);
    let fs=0; const fp=setInterval(()=>{ if(musicMuted||currentMood!=='triumphant'){clearInterval(fp);return;} if(fs%2===0) playNote(65.41,0.15,'sine',0.08); fs++; },500); musicIntervals.push(fp);
  }
  // dark, ominous bed for the "companies go bust... Will you?" finale (NOT triumphant)
  function startFinaleTension() {
    if (currentMood === 'finale') return; stopAllMusic(); currentMood='finale';
    playRumble(12, 0.1); playDrone(58, 12, 'sawtooth', 0.03); playImpact();
    let b=0; const h=setInterval(()=>{ if(musicMuted||currentMood!=='finale'){clearInterval(h);return;} playNote(41,0.22,'sine',0.1); setTimeout(()=>playNote(39,0.18,'sine',0.06),220); b++; }, 1700); musicIntervals.push(h);
  }

  // ===== timeline =====
  const TOTAL_DURATION = 99000;
  let startTime = Date.now(), paused = false, pauseOffset = 0, animFrame, executed = new Set();

  const timeline = [
    [0, () => { showScene(0); initAudio(); }],
    [400, () => startForeboding()],
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
    [12200, () => hideHeadline(4)],
    [12600, () => { showHeadline(5); playImpact(); }],
    [14400, () => hideHeadline(5)],

    [15000, () => { showScene(2); playWhoosh(); startTrading(); }],
    [18400, () => { showScene(3); playWhoosh(); }],
    [18900, () => document.getElementById('moWrap').classList.add('go')],
    [20200, () => { document.getElementById('moClear').classList.add('on'); playImpact(); }],
    [20800, () => document.getElementById('moCap').classList.add('on')],

    [26000, () => { showScene(4); playWhoosh(); }],
    [26500, () => showEl('fc-0')], [26850, () => showEl('fc-1')], [27200, () => { showEl('fc-2'); playImpact(); }], [27550, () => showEl('fc-3')], [27900, () => showEl('fc-4')],

    [31500, () => { showScene(5); playWhoosh(); }],
    [32400, () => playImpact()],

    // FULL POSITION title — extra dwell here, and on the turn before it
    [36000, () => { showScene(6); playRiser(1.2); startEpic(); }],

    // BASIS (holds on the title ~5.5s before this)
    [41500, () => { showScene('basis'); playWhoosh(); }],
    [41900, () => document.getElementById('dramaBasis').classList.add('on')],
    [42100, () => { document.getElementById('basisRow').classList.add('go'); document.getElementById('saP').textContent = '$155'; document.getElementById('saP').style.color = 'var(--sa)'; document.getElementById('linkStat').textContent = 'FULL'; }],
    [43300, () => { document.getElementById('basisBadge').classList.add('on'); playImpact(); }],
    [43900, () => document.getElementById('basisCap').classList.add('on')],

    // CAPS
    [49000, () => { showScene('caps'); playWhoosh(); }],
    [49300, () => document.getElementById('dramaCaps').classList.add('on')],
    [49500, () => { const s = document.getElementById('capSpot'); let v = 80; const t = setInterval(() => { v += 90; if (v >= 620) { v = 620; clearInterval(t); } s.textContent = '$' + v; }, 130); }],
    [50900, () => { document.getElementById('capPay').classList.add('on'); playChime(660); }],
    [51500, () => document.getElementById('capDeal').classList.add('on')],
    [52100, () => document.getElementById('capsCap').classList.add('on')],

    // LOAD SHAPE + DR
    [57000, () => { showScene('load'); playWhoosh(); }],
    [57300, () => document.getElementById('dramaLoad').classList.add('on')],
    [57500, () => document.getElementById('loadStage').classList.add('go')],
    [58900, () => playChime(523)],
    [59300, () => document.getElementById('loadCap').classList.add('on')],

    // ELECTRIFICATION
    [64000, () => { showScene('elec'); playWhoosh(); }],
    [64300, () => document.getElementById('dramaElec').classList.add('on')],
    [64500, () => document.getElementById('elecStage').classList.add('go')],
    [66200, () => playChime(784)],
    [66500, () => document.getElementById('elecCap').classList.add('on')],

    // REAL RULES + penalties
    [71500, () => { showScene('rules'); playWhoosh(); }],
    [72000, () => showEl('rl-0')], [72500, () => showEl('rl-1')], [73000, () => { showEl('rl-2'); playImpact(); }],
    [74700, () => { document.getElementById('realPen').classList.add('on'); playImpact(); }],

    // SUMMARY
    [77300, () => { showScene(8); playWhoosh(); }],
    [77600, () => { showEl('vb-0'); playNote(392,0.12,'triangle',0.08); }],
    [78100, () => { showEl('vb-1'); playNote(523,0.12,'triangle',0.08); }],
    [78600, () => { showEl('vb-2'); playNote(659,0.12,'triangle',0.08); }],
    [79100, () => { showEl('vb-3'); playImpact(); }],
    [79700, () => { for (let i=0;i<9;i++) setTimeout(()=>showEl('ch-'+i), i*110); }],

    // FINALE — dark and tense (fanfare moves to the CTA)
    [83500, () => { showScene(9); startFinaleTension(); }],
    [84300, () => showEl('ft-0')],
    [85800, () => { showEl('ft-1'); playImpact(); }],
    [87000, () => { showEl('ft-2'); playImpact(); }],
    [87800, () => showEl('ft-3')],

    // CALL TO ACTION — uplifting pings land here; lines arrive one at a time, "Come play." last
    [90000, () => { showScene('cta'); playRiser(1.2); startTriumphant(); }],
    [91000, () => showEl('cta-0')],   // PLAY IT FOR REAL
    [92900, () => showEl('cta-2')],   // GridRival · PD Team Day / September 1
    [95100, () => { showEl('cta-1'); playImpact(); }],   // Come play.  (the punch, last)
  ];

  function getElapsed() { return paused ? pauseOffset : Date.now() - startTime + pauseOffset; }
  function tick() {
    const elapsed = getElapsed();
    document.getElementById('progressBar').style.width = Math.min(elapsed/TOTAL_DURATION*100,100) + '%';
    timeline.forEach(([t, action], i) => { if (elapsed >= t && !executed.has(i)) { executed.add(i); action(); } });
    if (!paused && elapsed < TOTAL_DURATION + 3000) animFrame = requestAnimationFrame(tick);
  }
  function showScene(n) { document.querySelectorAll('.scene').forEach(s => s.classList.remove('active')); const el = document.getElementById('scene-' + n); if (el) el.classList.add('active'); }
  function showEl(id) { const el = document.getElementById(id); if (el) el.classList.add('visible'); }
  function showHeadline(n) { const el = document.getElementById('hl-'+n); if (el) { el.classList.add('visible'); el.classList.remove('fade-out'); } }
  function hideHeadline(n) { const el = document.getElementById('hl-'+n); if (el) { el.classList.remove('visible'); el.classList.add('fade-out'); } }
  function flashRed() { const el = document.getElementById('redFlash'); el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); setTimeout(() => { el.classList.remove('flash'); el.style.opacity = '0'; }, 700); }

  document.getElementById('btnMute').addEventListener('click', () => { musicMuted = !musicMuted; document.getElementById('btnMute').innerHTML = musicMuted ? '&#128264;' : '&#128266;'; if (musicMuted) stopAllMusic(); });
  document.getElementById('btnPause').addEventListener('click', () => { if (paused) { paused = false; startTime = Date.now(); document.getElementById('btnPause').innerHTML = '&#10074;&#10074;'; tick(); } else { paused = true; pauseOffset = getElapsed(); document.getElementById('btnPause').innerHTML = '&#9654;'; cancelAnimationFrame(animFrame); stopAllMusic(); } });
  function resetVisuals() {
    document.querySelectorAll('.headline').forEach(el => el.classList.remove('visible','fade-out'));
    document.querySelectorAll('.fcard,.verb,.chip,.finale-tag,.finale-brand,.finale-sub,.rule,.cta-label,.cta-title,.cta-event').forEach(el => el.classList.remove('visible'));
    document.getElementById('realPen').classList.remove('on');
    document.getElementById('moWrap').classList.remove('go'); document.getElementById('moClear').classList.remove('on'); document.getElementById('moCap').classList.remove('on');
    document.getElementById('basisRow').classList.remove('go'); document.getElementById('basisBadge').classList.remove('on'); document.getElementById('basisCap').classList.remove('on');
    document.getElementById('saP').textContent = '$33'; document.getElementById('saP').style.color = ''; document.getElementById('linkStat').textContent = 'flowing';
    document.getElementById('capSpot').textContent = '$80'; document.getElementById('capPay').classList.remove('on'); document.getElementById('capDeal').classList.remove('on'); document.getElementById('capsCap').classList.remove('on');
    document.getElementById('loadStage').classList.remove('go'); document.getElementById('loadCap').classList.remove('on');
    document.getElementById('elecStage').classList.remove('go'); document.getElementById('elecCap').classList.remove('on');
    document.getElementById('redFlash').style.opacity = '0';
  }
  document.getElementById('btnRestart').addEventListener('click', () => { stopAllMusic(); executed.clear(); pauseOffset = 0; paused = false; startTime = Date.now(); document.getElementById('btnPause').innerHTML = '&#10074;&#10074;'; resetVisuals(); document.getElementById('progressBar').style.width = '0%'; cancelAnimationFrame(animFrame); tick(); });
  document.getElementById('btnSkip').addEventListener('click', () => { pauseOffset = 83500; startTime = Date.now(); paused = false; executed.clear(); document.getElementById('btnPause').innerHTML = '&#10074;&#10074;'; cancelAnimationFrame(animFrame); tick(); });
  document.getElementById('btnFullscreen').addEventListener('click', () => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{}); else document.exitFullscreen(); });
  document.addEventListener('keydown', (e) => {
    if (!started) return; initAudio();
    if (e.code==='Space'){ e.preventDefault(); document.getElementById('btnPause').click(); }
    else if (e.code==='KeyR') document.getElementById('btnRestart').click();
    else if (e.code==='KeyM') document.getElementById('btnMute').click();
    else if (e.code==='KeyF') document.getElementById('btnFullscreen').click();
    else if (e.code==='ArrowRight'){ pauseOffset = getElapsed()+5000; startTime = Date.now(); if(!paused){cancelAnimationFrame(animFrame);tick();} }
    else if (e.code==='ArrowLeft'){ pauseOffset = Math.max(0,getElapsed()-5000); startTime = Date.now(); executed.clear(); resetVisuals(); if(!paused){cancelAnimationFrame(animFrame);tick();} }
  });
  function startTrailer() { if (started) return; started = true; const overlay = document.getElementById('startOverlay'); if (overlay) { overlay.style.transition='opacity .6s ease'; overlay.style.opacity='0'; setTimeout(()=>overlay.remove(),700); } initAudio(); startTime = Date.now(); pauseOffset = 0; tick(); }
  document.getElementById('startOverlay').addEventListener('click', startTrailer);
  document.addEventListener('keydown', function onKey(e){ if (!started && (e.code==='Space'||e.code==='Enter')){ e.preventDefault(); startTrailer(); document.removeEventListener('keydown', onKey);} });
})();
</script>
</body>
</html>
`;
}
