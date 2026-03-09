/**
 * Cinematic Trailer — GridRival
 * A movie-trailer-style HTML presentation that auto-plays through timed scenes.
 * Served at /api/trailer
 *
 * Act 1 (0–11s): Dramatic energy market crisis — Bloomberg-style headlines, menacing tone
 * Act 2 (11–32s): Game reveal — what it is, how it works, key features
 * Act 3 (32–40s): Vibe coding story — how it was built
 * Finale (40–48s): Call to action
 */
export function getCinematicTrailerHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GridRival — Trailer</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  /* ===== RESET & BASE ===== */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy-950: #08101c;
    --navy-900: #0f1f38;
    --navy-800: #1a365d;
    --navy-700: #1f3254;
    --navy-300: #7e96ba;
    --electric-400: #47a7ff;
    --electric-300: #75bdff;
    --electric-500: #3182ce;
    --profit: #38a169;
    --loss: #e53e3e;
    --warning: #d69e2e;
    --gold: #f6e05e;
  }

  html, body {
    height: 100%;
    overflow: hidden;
    background: var(--navy-950);
    color: #e2e8f0;
    font-family: 'Inter', system-ui, sans-serif;
  }

  /* ===== STAGE ===== */
  .stage {
    position: fixed;
    inset: 0;
    overflow: hidden;
  }

  /* ===== SCENES ===== */
  .scene {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.8s ease;
  }
  .scene.active {
    opacity: 1;
    pointer-events: auto;
  }

  /* ===== BACKGROUND LAYERS ===== */
  .bg-grid {
    position: fixed;
    inset: 0;
    z-index: 0;
    background:
      linear-gradient(rgba(71, 167, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(71, 167, 255, 0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    animation: gridPulse 4s ease-in-out infinite;
  }
  @keyframes gridPulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.7; }
  }
  @keyframes pulsePlay {
    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(71,167,255,0.4); }
    50% { transform: scale(1.08); box-shadow: 0 0 30px 10px rgba(71,167,255,0.15); }
  }

  .bg-vignette {
    position: fixed;
    inset: 0;
    z-index: 1;
    background: radial-gradient(ellipse at center, transparent 30%, var(--navy-950) 80%);
    pointer-events: none;
  }

  /* ===== ACT 1: ENERGY CRISIS ===== */
  .headlines-container {
    position: relative;
    width: 100%;
    max-width: 900px;
    z-index: 5;
  }

  .headline {
    opacity: 0;
    transform: translateY(30px);
    text-align: center;
    margin-bottom: 1.2rem;
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .headline.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .headline.fade-out {
    opacity: 0;
    transform: translateY(-20px);
  }

  .headline-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(1rem, 2.5vw, 1.6rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.4;
  }

  .headline-source {
    font-size: 0.7rem;
    color: var(--navy-300);
    font-weight: 400;
    margin-top: 0.2rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .hl-red { color: var(--loss); }
  .hl-amber { color: var(--warning); }
  .hl-green { color: var(--profit); }
  .hl-blue { color: var(--electric-400); }
  .hl-white { color: #ffffff; }

  /* Ticker bar at bottom of Act 1 */
  .ticker-bar {
    position: absolute;
    bottom: 60px;
    left: 0;
    right: 0;
    height: 36px;
    background: rgba(15, 31, 56, 0.9);
    border-top: 1px solid rgba(71, 167, 255, 0.2);
    border-bottom: 1px solid rgba(71, 167, 255, 0.2);
    overflow: hidden;
    z-index: 10;
  }

  .ticker-content {
    display: flex;
    align-items: center;
    height: 100%;
    white-space: nowrap;
    animation: tickerScroll 30s linear infinite;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
  }

  .ticker-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 24px;
  }

  .ticker-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .ticker-dot.red { background: var(--loss); }
  .ticker-dot.green { background: var(--profit); }
  .ticker-dot.amber { background: var(--warning); }

  .ticker-price {
    font-weight: 700;
  }
  .ticker-up { color: var(--loss); }
  .ticker-down { color: var(--profit); }

  @keyframes tickerScroll {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }

  /* Red flash overlay for dramatic effect */
  .red-flash {
    position: fixed;
    inset: 0;
    background: rgba(229, 62, 62, 0.15);
    z-index: 2;
    opacity: 0;
    pointer-events: none;
  }
  .red-flash.flash {
    animation: flashPulse 0.8s ease-out;
  }
  @keyframes flashPulse {
    0% { opacity: 0.4; }
    100% { opacity: 0; }
  }

  /* ===== TRANSITION: THE QUESTION ===== */
  .big-question {
    font-family: 'Inter', sans-serif;
    font-size: clamp(1.6rem, 4vw, 3rem);
    font-weight: 800;
    text-align: center;
    color: #ffffff;
    text-shadow: 0 0 40px rgba(71, 167, 255, 0.3);
    padding: 0 2rem;
    line-height: 1.3;
  }

  .big-question .em {
    color: var(--electric-400);
    font-style: italic;
  }

  /* ===== ACT 2: GAME REVEAL ===== */
  .reveal-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(1.8rem, 5vw, 3.5rem);
    font-weight: 700;
    text-align: center;
    color: #ffffff;
    margin-bottom: 0.5rem;
    text-shadow: 0 0 60px rgba(71, 167, 255, 0.4);
    letter-spacing: -0.03em;
  }

  .reveal-subtitle {
    font-size: clamp(0.9rem, 2vw, 1.2rem);
    color: var(--electric-300);
    text-align: center;
    font-weight: 300;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 2.5rem;
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.2rem;
    max-width: 800px;
    width: 90%;
    margin: 0 auto;
  }

  .feature-card {
    background: rgba(15, 31, 56, 0.6);
    border: 1px solid rgba(71, 167, 255, 0.15);
    border-radius: 12px;
    padding: 1.2rem;
    text-align: center;
    opacity: 0;
    transform: translateY(20px) scale(0.95);
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    backdrop-filter: blur(10px);
  }
  .feature-card.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .feature-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .feature-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--electric-300);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 0.3rem;
  }

  .feature-desc {
    font-size: 0.75rem;
    color: var(--navy-300);
    line-height: 1.4;
  }

  /* How it works steps */
  .steps-container {
    max-width: 750px;
    width: 90%;
    margin: 0 auto;
  }

  .step-row {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    opacity: 0;
    transform: translateX(-30px);
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .step-row.visible {
    opacity: 1;
    transform: translateX(0);
  }
  .step-row.from-right {
    transform: translateX(30px);
  }
  .step-row.from-right.visible {
    transform: translateX(0);
  }

  .step-number {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--electric-500), var(--electric-400));
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.2rem;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
  }

  .step-content h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 0.2rem;
  }

  .step-content p {
    font-size: 0.85rem;
    color: var(--navy-300);
    line-height: 1.4;
  }

  /* Stats bar */
  .stats-bar {
    display: flex;
    justify-content: center;
    gap: 3rem;
    margin-top: 2rem;
    flex-wrap: wrap;
  }

  .stat {
    text-align: center;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .stat.visible {
    opacity: 1;
    transform: scale(1);
  }

  .stat-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    font-weight: 700;
    color: var(--electric-400);
  }

  .stat-label {
    font-size: 0.7rem;
    color: var(--navy-300);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 0.2rem;
  }

  /* ===== ACT 3: VIBE CODING ===== */
  .vibe-section {
    text-align: center;
    max-width: 700px;
    padding: 0 2rem;
  }

  .vibe-badge {
    display: inline-block;
    padding: 0.4rem 1.2rem;
    background: rgba(128, 90, 213, 0.2);
    border: 1px solid rgba(128, 90, 213, 0.4);
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 600;
    color: #b794f4;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin-bottom: 1.5rem;
  }

  .vibe-title {
    font-size: clamp(1.4rem, 3.5vw, 2.2rem);
    font-weight: 800;
    color: #ffffff;
    margin-bottom: 1rem;
    line-height: 1.3;
  }

  .vibe-desc {
    font-size: clamp(0.85rem, 1.5vw, 1rem);
    color: var(--navy-300);
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  .vibe-stats {
    display: flex;
    justify-content: center;
    gap: 2.5rem;
    flex-wrap: wrap;
  }

  .vibe-stat {
    text-align: center;
    opacity: 0;
    transition: all 0.5s ease;
  }
  .vibe-stat.visible {
    opacity: 1;
  }

  .vibe-stat-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.6rem;
    font-weight: 700;
  }
  .vibe-stat-value.purple { color: #b794f4; }
  .vibe-stat-value.blue { color: var(--electric-400); }
  .vibe-stat-value.green { color: var(--profit); }

  .vibe-stat-label {
    font-size: 0.65rem;
    color: var(--navy-300);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-top: 0.2rem;
  }

  /* Prompt animation */
  .prompt-demo {
    background: rgba(15, 31, 56, 0.7);
    border: 1px solid rgba(71, 167, 255, 0.2);
    border-radius: 10px;
    padding: 1rem 1.5rem;
    margin: 1.5rem auto;
    max-width: 550px;
    text-align: left;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    position: relative;
  }

  .prompt-label {
    font-size: 0.6rem;
    color: var(--electric-400);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.5rem;
  }

  .prompt-text {
    color: #e2e8f0;
    line-height: 1.5;
  }

  .prompt-cursor {
    display: inline-block;
    width: 2px;
    height: 1em;
    background: var(--electric-400);
    margin-left: 2px;
    animation: blink 1s step-end infinite;
    vertical-align: text-bottom;
  }

  @keyframes blink {
    50% { opacity: 0; }
  }

  .arrow-down {
    font-size: 1.5rem;
    color: var(--electric-400);
    margin: 0.8rem 0;
    animation: bounceDown 1.5s ease-in-out infinite;
  }

  @keyframes bounceDown {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(6px); }
  }

  .result-text {
    font-size: 0.85rem;
    color: var(--profit);
    font-weight: 600;
  }

  /* ===== FINALE ===== */
  .finale-container {
    text-align: center;
    padding: 0 2rem;
  }

  .finale-logo {
    font-size: 4rem;
    margin-bottom: 1rem;
    animation: logoGlow 2s ease-in-out infinite;
  }

  @keyframes logoGlow {
    0%, 100% { filter: drop-shadow(0 0 10px rgba(71, 167, 255, 0.3)); }
    50% { filter: drop-shadow(0 0 25px rgba(71, 167, 255, 0.6)); }
  }

  .finale-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(1.8rem, 5vw, 3rem);
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 0.5rem;
    text-shadow: 0 0 40px rgba(71, 167, 255, 0.3);
  }

  .finale-tagline {
    font-size: clamp(0.9rem, 2vw, 1.1rem);
    color: var(--electric-300);
    font-weight: 300;
    margin-bottom: 2.5rem;
  }

  .cta-button {
    display: inline-block;
    padding: 0.9rem 2.5rem;
    background: linear-gradient(135deg, var(--electric-500), var(--electric-400));
    color: white;
    font-weight: 700;
    font-size: 1rem;
    border-radius: 10px;
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(71, 167, 255, 0.3);
    font-family: 'Inter', sans-serif;
    letter-spacing: 0.03em;
  }
  .cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 30px rgba(71, 167, 255, 0.5);
  }

  .finale-meta {
    margin-top: 2rem;
    font-size: 0.7rem;
    color: var(--navy-300);
    line-height: 1.8;
  }

  /* ===== PROGRESS BAR ===== */
  .progress-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--electric-500), var(--electric-400), var(--electric-300));
    z-index: 100;
    transition: width 0.3s linear;
    box-shadow: 0 0 10px rgba(71, 167, 255, 0.5);
  }

  /* ===== CONTROLS ===== */
  .controls {
    position: fixed;
    bottom: 16px;
    right: 16px;
    z-index: 200;
    display: flex;
    gap: 8px;
    opacity: 0.4;
    transition: opacity 0.3s;
  }
  .controls:hover { opacity: 1; }

  .ctrl-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid rgba(71, 167, 255, 0.3);
    background: rgba(15, 31, 56, 0.8);
    color: var(--electric-300);
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    backdrop-filter: blur(10px);
  }
  .ctrl-btn:hover {
    background: rgba(71, 167, 255, 0.2);
    border-color: var(--electric-400);
  }

  /* ===== SCREENSHOTS ===== */
  .screenshot-grid {
    display: flex;
    justify-content: center;
    gap: 1rem;
    max-width: 1050px;
    width: 95%;
    margin: 0 auto;
    flex-wrap: wrap;
  }

  .screenshot-card {
    opacity: 0;
    transform: translateY(25px) scale(0.95);
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .screenshot-card.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .screenshot-frame {
    width: 280px;
    height: 180px;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(71, 167, 255, 0.25);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 0 30px rgba(71, 167, 255, 0.08);
    position: relative;
    background: var(--navy-900);
  }
  .screenshot-frame.wide {
    width: 280px;
  }
  .screenshot-frame iframe {
    width: 1200px;
    height: 800px;
    transform: scale(0.233);
    transform-origin: top left;
    border: none;
    pointer-events: none;
  }

  .screenshot-label {
    font-size: 0.7rem;
    color: var(--navy-300);
    text-align: center;
    margin-top: 0.5rem;
    font-weight: 500;
  }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 640px) {
    .feature-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.8rem;
    }
    .feature-card { padding: 0.8rem; }
    .stats-bar { gap: 1.5rem; }
    .vibe-stats { gap: 1.5rem; }
    .step-row { gap: 1rem; }
    .step-number { width: 38px; height: 38px; font-size: 1rem; }
  }
</style>
</head>
<body>

<div class="stage" id="stage">
  <!-- Background layers -->
  <div class="bg-grid"></div>
  <div class="bg-vignette"></div>
  <div class="red-flash" id="redFlash"></div>

  <!-- ===== SCENE 0: OPENING BLACK ===== -->
  <div class="scene active" id="scene-0">
    <div style="text-align:center">
      <div style="font-family:'JetBrains Mono',monospace; font-size:0.7rem; color:var(--electric-400); text-transform:uppercase; letter-spacing:0.2em; opacity:0.7">
        Australia&rsquo;s National Electricity Market
      </div>
    </div>
  </div>

  <!-- ===== SCENE 1: HEADLINES ===== -->
  <div class="scene" id="scene-1">
    <div class="headlines-container" id="headlines">
      <div class="headline" id="hl-0">
        <div class="headline-text hl-red">&ldquo;Wholesale electricity prices hit $15,500/MWh during heatwave&rdquo;</div>
        <div class="headline-source">AEMO Market Notice &bull; Summer 2024</div>
      </div>
      <div class="headline" id="hl-1">
        <div class="headline-text hl-amber">&ldquo;Liddell coal plant closes after 52 years &mdash; 2,000 MW gone&rdquo;</div>
        <div class="headline-source">Energy Market Developments &bull; April 2023</div>
      </div>
      <div class="headline" id="hl-2">
        <div class="headline-text hl-green">&ldquo;Rooftop solar pushes daytime prices below zero&rdquo;</div>
        <div class="headline-source">AEMO Quarterly Report &bull; Spring 2024</div>
      </div>
      <div class="headline" id="hl-3">
        <div class="headline-text hl-red">&ldquo;Battery revenue up 340% as volatility surges&rdquo;</div>
        <div class="headline-source">Clean Energy Market Insights &bull; Q3 2025</div>
      </div>
      <div class="headline" id="hl-4">
        <div class="headline-text hl-white">&ldquo;The energy market is changing faster than at any point in its history&rdquo;</div>
        <div class="headline-source">Energy Security Board &bull; 2025 Review</div>
      </div>
    </div>

    <div class="ticker-bar">
      <div class="ticker-content">
        <span class="ticker-item"><span class="ticker-dot red"></span> NSW <span class="ticker-price ticker-up">$487.32</span> &uarr;12%</span>
        <span class="ticker-item"><span class="ticker-dot green"></span> VIC <span class="ticker-price ticker-down">$62.15</span> &darr;8%</span>
        <span class="ticker-item"><span class="ticker-dot amber"></span> QLD <span class="ticker-price ticker-up">$312.80</span> &uarr;45%</span>
        <span class="ticker-item"><span class="ticker-dot green"></span> SA <span class="ticker-price ticker-down">-$28.50</span> &darr;</span>
        <span class="ticker-item"><span class="ticker-dot red"></span> TAS <span class="ticker-price ticker-up">$185.60</span> &uarr;22%</span>
        <span class="ticker-item"><span class="ticker-dot green"></span> Demand 28,450 MW</span>
        <span class="ticker-item"><span class="ticker-dot amber"></span> Solar 14,200 MW &bull; 48%</span>
        <span class="ticker-item"><span class="ticker-dot green"></span> Wind 4,850 MW &bull; 17%</span>
        <span class="ticker-item"><span class="ticker-dot red"></span> Coal 6,200 MW &bull; 22%</span>
        <span class="ticker-item"><span class="ticker-dot amber"></span> Gas 2,100 MW &bull; 7%</span>
        <span class="ticker-item"><span class="ticker-dot green"></span> Hydro 1,100 MW &bull; 4%</span>
        <!-- duplicate for seamless loop -->
        <span class="ticker-item"><span class="ticker-dot red"></span> NSW <span class="ticker-price ticker-up">$487.32</span> &uarr;12%</span>
        <span class="ticker-item"><span class="ticker-dot green"></span> VIC <span class="ticker-price ticker-down">$62.15</span> &darr;8%</span>
        <span class="ticker-item"><span class="ticker-dot amber"></span> QLD <span class="ticker-price ticker-up">$312.80</span> &uarr;45%</span>
        <span class="ticker-item"><span class="ticker-dot green"></span> SA <span class="ticker-price ticker-down">-$28.50</span> &darr;</span>
        <span class="ticker-item"><span class="ticker-dot red"></span> TAS <span class="ticker-price ticker-up">$185.60</span> &uarr;22%</span>
        <span class="ticker-item"><span class="ticker-dot green"></span> Demand 28,450 MW</span>
        <span class="ticker-item"><span class="ticker-dot amber"></span> Solar 14,200 MW &bull; 48%</span>
        <span class="ticker-item"><span class="ticker-dot green"></span> Wind 4,850 MW &bull; 17%</span>
        <span class="ticker-item"><span class="ticker-dot red"></span> Coal 6,200 MW &bull; 22%</span>
        <span class="ticker-item"><span class="ticker-dot amber"></span> Gas 2,100 MW &bull; 7%</span>
        <span class="ticker-item"><span class="ticker-dot green"></span> Hydro 1,100 MW &bull; 4%</span>
      </div>
    </div>
  </div>

  <!-- ===== SCENE 2: THE QUESTION ===== -->
  <div class="scene" id="scene-2">
    <div class="big-question">
      Does your team <span class="em">really understand</span><br>how the market works?
    </div>
  </div>

  <!-- ===== SCENE 3: GAME REVEAL TITLE ===== -->
  <div class="scene" id="scene-3">
    <div style="text-align:center">
      <div style="font-size:3.5rem; margin-bottom:0.5rem">&#9889;</div>
      <div class="reveal-title">GridRival</div>
      <div class="reveal-subtitle">Learn by playing the market</div>

      <div class="feature-grid" id="featureGrid">
        <div class="feature-card" id="fc-0">
          <div class="feature-icon">&#128101;</div>
          <div class="feature-label">Up to 15 teams</div>
          <div class="feature-desc">Play from phones &amp; laptops on the same WiFi</div>
        </div>
        <div class="feature-card" id="fc-1">
          <div class="feature-icon">&#128200;</div>
          <div class="feature-label">Real merit order</div>
          <div class="feature-desc">Bid your generators, see the dispatch stack live</div>
        </div>
        <div class="feature-card" id="fc-2">
          <div class="feature-icon">&#127758;</div>
          <div class="feature-label">NEM scenarios</div>
          <div class="feature-desc">Heatwaves, negative prices, plant outages &amp; more</div>
        </div>
        <div class="feature-card" id="fc-3">
          <div class="feature-icon">&#128293;</div>
          <div class="feature-label">7 asset types</div>
          <div class="feature-desc">Coal, gas, hydro, wind, solar &amp; battery</div>
        </div>
        <div class="feature-card" id="fc-4">
          <div class="feature-icon">&#127919;</div>
          <div class="feature-label">5 game modes</div>
          <div class="feature-desc">15 min intro to 3+ hour deep dive</div>
        </div>
        <div class="feature-card" id="fc-5">
          <div class="feature-icon">&#127891;</div>
          <div class="feature-label">Built for learning</div>
          <div class="feature-desc">Teaching prompts, walkthroughs &amp; strategy guides</div>
        </div>
      </div>
    </div>
  </div>

  <!-- ===== SCENE 3B: SCREENSHOTS ===== -->
  <div class="scene" id="scene-3b">
    <div style="text-align:center; margin-bottom:1.5rem;">
      <div style="font-size:0.7rem; color:var(--electric-400); text-transform:uppercase; letter-spacing:0.15em; margin-bottom:0.5rem">See It In Action</div>
      <div style="font-size:clamp(1.2rem,2.5vw,1.6rem); font-weight:700; color:#fff">Real screens from the game</div>
    </div>
    <div class="screenshot-grid">
      <div class="screenshot-card" id="ss-0">
        <div class="screenshot-frame">
          <iframe src="/" loading="lazy" sandbox="allow-scripts allow-same-origin" scrolling="no"></iframe>
        </div>
        <div class="screenshot-label">&#9889; Landing Page &mdash; cinematic energy-market theme</div>
      </div>
      <div class="screenshot-card" id="ss-1">
        <div class="screenshot-frame">
          <iframe src="/host" loading="lazy" sandbox="allow-scripts allow-same-origin" scrolling="no"></iframe>
        </div>
        <div class="screenshot-label">&#127918; Game Setup &mdash; configure teams, assets &amp; scenarios</div>
      </div>
      <div class="screenshot-card" id="ss-2">
        <div class="screenshot-frame">
          <iframe src="/battery-test" loading="lazy" sandbox="allow-scripts allow-same-origin" scrolling="no"></iframe>
        </div>
        <div class="screenshot-label">&#128267; Battery Minigame &mdash; charge &amp; discharge for maximum profit</div>
      </div>
      <div class="screenshot-card" id="ss-3">
        <div class="screenshot-frame">
          <iframe src="/guides" loading="lazy" sandbox="allow-scripts allow-same-origin" scrolling="no"></iframe>
        </div>
        <div class="screenshot-label">&#128218; Guides Hub &mdash; strategy, gameplay &amp; background material</div>
      </div>
      <div class="screenshot-card" id="ss-4">
        <div class="screenshot-frame">
          <iframe src="/api/learn-nem" loading="lazy" sandbox="allow-scripts allow-same-origin" scrolling="no"></iframe>
        </div>
        <div class="screenshot-label">&#128161; Learn the NEM &mdash; interactive educational slides</div>
      </div>
      <div class="screenshot-card" id="ss-5">
        <div class="screenshot-frame">
          <iframe src="/api/gameplay-summary" loading="lazy" sandbox="allow-scripts allow-same-origin" scrolling="no"></iframe>
        </div>
        <div class="screenshot-label">&#128214; Gameplay Summary &mdash; rules, strategy &amp; asset-type bidding</div>
      </div>
    </div>
  </div>

  <!-- ===== SCENE 4: HOW IT WORKS ===== -->
  <div class="scene" id="scene-4">
    <div style="text-align:center; margin-bottom: 2rem;">
      <div style="font-size:0.7rem; color:var(--electric-400); text-transform:uppercase; letter-spacing:0.15em; margin-bottom:0.5rem;">How It Works</div>
      <div style="font-size:clamp(1.3rem,3vw,1.8rem); font-weight:700; color:#fff">Play a round in 5 minutes</div>
    </div>

    <div class="steps-container">
      <div class="step-row" id="step-0">
        <div class="step-number">1</div>
        <div class="step-content">
          <h3>&#128214; Briefing</h3>
          <p>Host sets the scene &mdash; season, demand, scenarios. Teams see their portfolio of generators.</p>
        </div>
      </div>
      <div class="step-row from-right" id="step-1">
        <div class="step-number">2</div>
        <div class="step-content">
          <h3>&#128176; Bid</h3>
          <p>Teams submit price &amp; quantity bids for each asset across 4 time periods. Strategy matters.</p>
        </div>
      </div>
      <div class="step-row" id="step-2">
        <div class="step-number">3</div>
        <div class="step-content">
          <h3>&#9889; Dispatch</h3>
          <p>The engine stacks all bids in price order. Cheapest generators run first. The clearing price is set.</p>
        </div>
      </div>
      <div class="step-row from-right" id="step-3">
        <div class="step-number">4</div>
        <div class="step-content">
          <h3>&#128181; Results</h3>
          <p>Profit = (Clearing Price &minus; Cost) &times; MW &times; Hours. Leaderboard updates. Discussion time.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- ===== SCENE 5: VIBE CODING ===== -->
  <div class="scene" id="scene-5">
    <div class="vibe-section">
      <div class="vibe-badge">&#128640; How It Was Built</div>
      <div class="vibe-title">Built by conversation,<br>not by committee</div>
      <div class="vibe-desc">
        250+ plain-English prompts across 17 sessions. One AI (Claude Opus 4.6). Zero developers.<br>
        No Jira tickets, no sprints &mdash; just a domain expert and an AI that writes code.
      </div>

      <div class="prompt-demo">
        <div class="prompt-label">Human prompt</div>
        <div class="prompt-text" id="typingPrompt"></div>
      </div>

      <div class="arrow-down">&#8595;</div>

      <div class="result-text" id="resultText" style="opacity:0; transition: opacity 0.5s">
        &#10003; 35,000+ lines &bull; 120+ files &bull; Real-time multiplayer &bull; Procedural audio &bull; Pro-rata dispatch engine
      </div>

      <div class="vibe-stats" style="margin-top: 1.5rem;">
        <div class="vibe-stat" id="vs-0">
          <div class="vibe-stat-value purple">~8 hrs</div>
          <div class="vibe-stat-label">Human effort</div>
        </div>
        <div class="vibe-stat" id="vs-1">
          <div class="vibe-stat-value blue">10 phases</div>
          <div class="vibe-stat-label">From Big Bang to Battery Arbitrage</div>
        </div>
        <div class="vibe-stat" id="vs-2">
          <div class="vibe-stat-value green">~$200</div>
          <div class="vibe-stat-label">Total AI cost</div>
        </div>
      </div>

      <div style="margin-top:1.5rem; display:flex; flex-wrap:wrap; gap:0.5rem; justify-content:center; max-width:600px; margin-left:auto; margin-right:auto;">
        <span style="font-size:0.65rem; padding:0.25rem 0.6rem; background:rgba(128,90,213,0.15); color:#d6bcfa; border-radius:20px; border:1px solid rgba(128,90,213,0.3);">Session 1: 15,000 lines in one conversation</span>
        <span style="font-size:0.65rem; padding:0.25rem 0.6rem; background:rgba(49,130,206,0.15); color:#90cdf4; border-radius:20px; border:1px solid rgba(49,130,206,0.3);">Transition bug reported 8 times before AI could see it</span>
        <span style="font-size:0.65rem; padding:0.25rem 0.6rem; background:rgba(56,161,105,0.15); color:#9ae6b4; border-radius:20px; border:1px solid rgba(56,161,105,0.3);">Sound effects synthesised from maths &mdash; no audio files</span>
        <span style="font-size:0.65rem; padding:0.25rem 0.6rem; background:rgba(214,158,46,0.15); color:#fefcbf; border-radius:20px; border:1px solid rgba(214,158,46,0.3);">Bundle optimised from 1180KB &rarr; 432KB (63% smaller)</span>
      </div>
    </div>
  </div>

  <!-- ===== SCENE 6: FINALE ===== -->
  <div class="scene" id="scene-6">
    <div class="finale-container">
      <div class="finale-logo">&#9889;</div>
      <div class="finale-title">GridRival</div>
      <div class="finale-tagline">Understand the market by playing it</div>
      <button class="cta-button" onclick="window.location.href='/'">Launch the Game &rarr;</button>
      <div class="finale-meta">
        Up to 15 teams &bull; 5 game modes &bull; 7 asset types &bull; Real NEM scenarios<br>
        Sound effects &bull; Dark mode &bull; Works on phones &bull; No installation required<br><br>
        <span style="color:var(--electric-400)">Built with Claude Code + human domain expertise</span>
      </div>
    </div>
  </div>
</div>

<!-- Click-to-start overlay — required for browser autoplay policy -->
<div id="startOverlay" style="
  position:fixed; inset:0; z-index:9999;
  background: radial-gradient(ellipse at center, rgba(8,16,28,0.92) 0%, rgba(8,16,28,0.98) 100%);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  cursor:pointer; user-select:none;
">
  <div style="font-size:clamp(1.8rem,4vw,3rem); font-weight:800; color:#fff; margin-bottom:0.5rem; letter-spacing:-0.02em;">&#9889; GridRival</div>
  <div style="font-size:clamp(0.9rem,2vw,1.2rem); color:var(--navy-300); margin-bottom:2.5rem;">A cinematic trailer</div>
  <div style="
    width:80px; height:80px; border-radius:50%;
    background: rgba(71,167,255,0.15); border:2px solid var(--electric-400);
    display:flex; align-items:center; justify-content:center;
    animation: pulsePlay 2s ease-in-out infinite;
    margin-bottom:1.5rem;
  ">
    <span style="font-size:2rem; margin-left:4px;">&#9654;</span>
  </div>
  <div style="font-size:0.85rem; color:var(--navy-300); opacity:0.7;">Click anywhere to play &#8226; Best with sound on &#127911;</div>
</div>

<!-- Progress bar -->
<div class="progress-bar" id="progressBar" style="width:0%"></div>

<!-- Controls -->
<div class="controls">
  <button class="ctrl-btn" id="btnMute" title="Mute / Unmute music">&#128266;</button>
  <button class="ctrl-btn" id="btnRestart" title="Restart">&#8634;</button>
  <button class="ctrl-btn" id="btnPause" title="Pause / Play">&#10074;&#10074;</button>
  <button class="ctrl-btn" id="btnSkip" title="Skip to end">&#9654;&#9654;</button>
</div>

<script>
(function() {
  // ===== PROCEDURAL MUSIC ENGINE =====
  // Synthesises a full soundtrack using Web Audio API — no audio files needed.
  // Four moods: foreboding (Act 1), trading (Act 2 game reveal), quirky/digital (Act 3 vibe coding), triumphant (Finale)

  let audioCtx = null;
  let musicMuted = false;
  let masterGain = null;
  let currentMood = null;
  let activeNodes = []; // track all scheduled nodes for cleanup
  let musicIntervals = [];
  let started = false; // true after user clicks start overlay

  function initAudio() {
    if (audioCtx && audioCtx.state === 'running') return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.35;
        masterGain.connect(audioCtx.destination);
      }
      // Resume if suspended (browser autoplay policy)
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    } catch(e) { /* no audio support */ }
  }

  function stopAllMusic() {
    musicIntervals.forEach(id => clearInterval(id));
    musicIntervals = [];
    activeNodes.forEach(n => { try { n.stop(); } catch(e) {} });
    activeNodes = [];
    currentMood = null;
  }

  function playNote(freq, duration, type, volume, startDelay) {
    if (!audioCtx || !masterGain || musicMuted) return;
    const start = audioCtx.currentTime + (startDelay || 0);
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume || 0.15, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(start);
    osc.stop(start + duration + 0.05);
    activeNodes.push(osc);
    return osc;
  }

  // Sustained drone pad — multiple detuned oscillators
  function playDrone(freq, duration, type, volume) {
    if (!audioCtx || !masterGain || musicMuted) return;
    const detunes = [-7, 0, 7, 12];
    detunes.forEach(d => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      osc.detune.value = d;
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(volume || 0.04, audioCtx.currentTime + 0.8);
      gain.gain.linearRampToValueAtTime(volume || 0.04, audioCtx.currentTime + duration - 1);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + duration + 0.1);
      activeNodes.push(osc);
    });
  }

  // Low rumble using filtered noise
  function playRumble(duration, volume) {
    if (!audioCtx || !masterGain || musicMuted) return;
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    // Brown noise (integrated white noise for low rumble)
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 120;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(volume || 0.12, audioCtx.currentTime + 1);
    gain.gain.linearRampToValueAtTime(volume || 0.12, audioCtx.currentTime + duration - 1.5);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    source.start();
    source.stop(audioCtx.currentTime + duration + 0.1);
    activeNodes.push(source);
  }

  // Impact hit — for headline punctuation
  function playImpact() {
    if (!audioCtx || !masterGain || musicMuted) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.6);
    activeNodes.push(osc);
  }

  // ---- MOOD: FOREBODING (Act 1) ----
  // Low drone, minor key, slow heartbeat pulse, occasional dissonant stabs
  function startForeboding() {
    if (currentMood === 'foreboding') return;
    stopAllMusic();
    currentMood = 'foreboding';

    // Low rumble bed
    playRumble(18, 0.1);

    // Dark drone in D minor
    playDrone(73.42, 16, 'sawtooth', 0.025);  // D2
    playDrone(110, 16, 'sine', 0.03);          // A2 (fifth, slightly tense)

    // Slow heartbeat — low thud every 1.5s
    let beatCount = 0;
    const heartbeat = setInterval(() => {
      if (musicMuted || currentMood !== 'foreboding') { clearInterval(heartbeat); return; }
      playNote(40, 0.15, 'sine', 0.12);
      setTimeout(() => playNote(38, 0.12, 'sine', 0.08), 200);
      beatCount++;
    }, 1500);
    musicIntervals.push(heartbeat);

    // Occasional high dissonant string stabs
    const stabs = setInterval(() => {
      if (musicMuted || currentMood !== 'foreboding') { clearInterval(stabs); return; }
      if (Math.random() > 0.5) {
        const freq = [311, 370, 466, 554][Math.floor(Math.random() * 4)]; // Eb, F#, Bb — minor/diminished
        playNote(freq, 1.5, 'sawtooth', 0.02);
      }
    }, 2500);
    musicIntervals.push(stabs);
  }

  // ---- MOOD: TRADING FLOOR (Act 2) ----
  // Pulsing rhythmic feel, major key arpeggios, ticker-tape urgency
  function startTrading() {
    if (currentMood === 'trading') return;
    stopAllMusic();
    currentMood = 'trading';

    // Bright pad — C major
    playDrone(130.81, 25, 'triangle', 0.025);  // C3
    playDrone(164.81, 25, 'sine', 0.02);       // E3
    playDrone(196, 25, 'sine', 0.02);          // G3

    // Rhythmic pulse — eighth-note pattern
    let pulseStep = 0;
    const pulse = setInterval(() => {
      if (musicMuted || currentMood !== 'trading') { clearInterval(pulse); return; }
      // Kick on beats 1 and 3
      if (pulseStep % 4 === 0) {
        playNote(55, 0.08, 'sine', 0.12);
      }
      // Hi-hat-like tick on every beat
      playNote(8000 + Math.random() * 2000, 0.03, 'square', 0.015);

      // Melodic arpeggio fragments
      if (pulseStep % 8 === 0) {
        const arps = [261, 329, 392, 523, 659]; // C E G C5 E5
        arps.forEach((f, i) => {
          playNote(f, 0.2, 'triangle', 0.04, i * 0.12);
        });
      }
      if (pulseStep % 8 === 4) {
        const arps = [220, 277, 329, 440]; // A C# E A4
        arps.forEach((f, i) => {
          playNote(f, 0.2, 'triangle', 0.03, i * 0.12);
        });
      }

      pulseStep++;
    }, 200); // ~150 bpm 16th notes
    musicIntervals.push(pulse);

    // Occasional "data blip" sounds — like a trading terminal
    const blips = setInterval(() => {
      if (musicMuted || currentMood !== 'trading') { clearInterval(blips); return; }
      if (Math.random() > 0.4) {
        const f = 800 + Math.random() * 1200;
        playNote(f, 0.05, 'sine', 0.04);
        setTimeout(() => playNote(f * 1.2, 0.05, 'sine', 0.03), 80);
      }
    }, 800);
    musicIntervals.push(blips);
  }

  // ---- MOOD: DIGITAL / QUIRKY (Act 3 — Vibe Coding) ----
  // Chiptune-inspired, playful bleeps, typing sounds, retro-computing feel
  function startDigital() {
    if (currentMood === 'digital') return;
    stopAllMusic();
    currentMood = 'digital';

    // Soft pad — G major pentatonic feel
    playDrone(196, 15, 'sine', 0.02);     // G3
    playDrone(246.94, 15, 'sine', 0.015); // B3

    // 8-bit style melodic loop
    const melody = [
      392, 440, 523, 587, 523, 440, 392, 330,  // G A C D C A G E
      349, 392, 440, 523, 587, 659, 784, 659,  // F G A C D E G5 E
    ];
    let melodyIdx = 0;
    const melodyLoop = setInterval(() => {
      if (musicMuted || currentMood !== 'digital') { clearInterval(melodyLoop); return; }
      playNote(melody[melodyIdx % melody.length], 0.15, 'square', 0.035);
      melodyIdx++;
    }, 280);
    musicIntervals.push(melodyLoop);

    // Bass line — simple octave bounce
    let bassStep = 0;
    const bass = setInterval(() => {
      if (musicMuted || currentMood !== 'digital') { clearInterval(bass); return; }
      const bassNotes = [98, 98, 110, 110, 130.81, 130.81, 110, 110]; // G2 A2 C3
      playNote(bassNotes[bassStep % bassNotes.length], 0.2, 'triangle', 0.06);
      bassStep++;
    }, 560);
    musicIntervals.push(bass);

    // Keyboard typing sounds — random tiny clicks
    const typing = setInterval(() => {
      if (musicMuted || currentMood !== 'digital') { clearInterval(typing); return; }
      if (Math.random() > 0.3) {
        playNote(3000 + Math.random() * 4000, 0.01, 'square', 0.02);
      }
    }, 90);
    musicIntervals.push(typing);

    // Modem / data transfer chirps
    const chirps = setInterval(() => {
      if (musicMuted || currentMood !== 'digital') { clearInterval(chirps); return; }
      if (Math.random() > 0.6) {
        const f = 1200 + Math.random() * 800;
        playNote(f, 0.08, 'sawtooth', 0.015);
        setTimeout(() => playNote(f * 0.8, 0.06, 'sawtooth', 0.01), 100);
      }
    }, 1200);
    musicIntervals.push(chirps);
  }

  // ---- MOOD: TRIUMPHANT (Finale) ----
  // Major key fanfare, warm chords, uplifting resolution
  function startTriumphant() {
    if (currentMood === 'triumphant') return;
    stopAllMusic();
    currentMood = 'triumphant';

    // Rich major chord pad — C major
    playDrone(130.81, 12, 'sine', 0.03);    // C3
    playDrone(164.81, 12, 'triangle', 0.025); // E3
    playDrone(196, 12, 'sine', 0.025);       // G3
    playDrone(261.63, 12, 'sine', 0.02);     // C4

    // Fanfare melody
    const fanfare = [
      { f: 523, d: 0.3, t: 0 },      // C5
      { f: 659, d: 0.3, t: 0.35 },    // E5
      { f: 784, d: 0.3, t: 0.7 },     // G5
      { f: 1047, d: 0.8, t: 1.1 },    // C6 — held
      { f: 880, d: 0.3, t: 2.2 },     // A5
      { f: 1047, d: 0.6, t: 2.6 },    // C6
      { f: 1175, d: 1.0, t: 3.3 },    // D6 — resolve up
    ];
    fanfare.forEach(n => {
      playNote(n.f, n.d, 'triangle', 0.06, n.t);
    });

    // Warm sustained strings after fanfare
    setTimeout(() => {
      if (currentMood !== 'triumphant') return;
      playDrone(261.63, 8, 'sine', 0.025);   // C4
      playDrone(329.63, 8, 'triangle', 0.02); // E4
      playDrone(392, 8, 'sine', 0.02);        // G4
    }, 4000);

    // Gentle rhythmic pulse
    let finaleStep = 0;
    const finalePulse = setInterval(() => {
      if (musicMuted || currentMood !== 'triumphant') { clearInterval(finalePulse); return; }
      if (finaleStep % 2 === 0) {
        playNote(65.41, 0.15, 'sine', 0.08); // C2 soft kick
      }
      finaleStep++;
    }, 500);
    musicIntervals.push(finalePulse);
  }

  // Transition whoosh — used between acts
  function playWhoosh() {
    if (!audioCtx || !masterGain || musicMuted) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, audioCtx.currentTime + 0.3);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.6);
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.7);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.8);
    activeNodes.push(osc);
  }

  // ===== TIMELINE ENGINE =====
  const TOTAL_DURATION = 48000; // 48 seconds total
  let startTime = Date.now();
  let paused = false;
  let pauseOffset = 0;
  let currentScene = -1;
  let animFrame;

  // Timeline events: [timeMs, action]
  const timeline = [
    // Scene 0: Opening black (0-1s) — music starts
    [0, () => { showScene(0); initAudio(); }],
    [500, () => startForeboding()],

    // Scene 1: Headlines (1-10s) — foreboding mood, tighter pacing
    [1000, () => showScene(1)],
    [1500, () => { showHeadline(0); playImpact(); }],
    [3200, () => { hideHeadline(0); flashRed(); playImpact(); }],
    [3700, () => showHeadline(1)],
    [5400, () => hideHeadline(1)],
    [5900, () => showHeadline(2)],
    [7400, () => hideHeadline(2)],
    [7900, () => { showHeadline(3); flashRed(); playImpact(); }],
    [9400, () => hideHeadline(3)],
    [9800, () => showHeadline(4)],

    // Scene 2: The Question (11-13s) — whoosh transition
    [11000, () => { showScene(2); playWhoosh(); }],

    // Scene 3: Game Reveal (13-18s) — switch to trading mood
    [13000, () => { showScene(3); playWhoosh(); startTrading(); }],
    [13800, () => showFeatureCard(0)],
    [14200, () => showFeatureCard(1)],
    [14600, () => showFeatureCard(2)],
    [15000, () => showFeatureCard(3)],
    [15400, () => showFeatureCard(4)],
    [15800, () => showFeatureCard(5)],

    // Scene 3B: Screenshots (18-24s) — still trading mood
    [18000, () => { showScene3b(); playWhoosh(); }],
    [18600, () => showScreenshot(0)],
    [19200, () => showScreenshot(1)],
    [19800, () => showScreenshot(2)],
    [20400, () => showScreenshot(3)],
    [21000, () => showScreenshot(4)],
    [21600, () => showScreenshot(5)],

    // Scene 4: How It Works (24-32s) — trading continues
    [24000, () => { showScene(4); playWhoosh(); }],
    [24800, () => showStep(0)],
    [26400, () => showStep(1)],
    [28000, () => showStep(2)],
    [29600, () => showStep(3)],

    // Scene 5: Vibe Coding (32-40s) — switch to digital/quirky mood
    [32000, () => { showScene(5); playWhoosh(); startDigital(); startTyping(); }],

    // Scene 6: Finale (40-48s) — triumphant fanfare
    [40000, () => { showScene(6); playWhoosh(); startTriumphant(); }],
  ];

  let executed = new Set();

  function getElapsed() {
    if (paused) return pauseOffset;
    return Date.now() - startTime + pauseOffset;
  }

  function tick() {
    const elapsed = getElapsed();
    const progress = Math.min(elapsed / TOTAL_DURATION * 100, 100);
    document.getElementById('progressBar').style.width = progress + '%';

    timeline.forEach(([time, action], i) => {
      if (elapsed >= time && !executed.has(i)) {
        executed.add(i);
        action();
      }
    });

    if (!paused && elapsed < TOTAL_DURATION + 2000) {
      animFrame = requestAnimationFrame(tick);
    }
  }

  // ===== SCENE MANAGEMENT =====
  function showScene(n) {
    document.querySelectorAll('.scene').forEach(s => {
      s.classList.remove('active');
    });
    const el = document.getElementById('scene-' + n);
    if (el) el.classList.add('active');
    currentScene = n;
  }

  function showScene3b() {
    document.querySelectorAll('.scene').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('scene-3b');
    if (el) el.classList.add('active');
    currentScene = '3b';
  }

  function showScreenshot(n) {
    const el = document.getElementById('ss-' + n);
    if (el) el.classList.add('visible');
  }

  function showHeadline(n) {
    const el = document.getElementById('hl-' + n);
    if (el) { el.classList.add('visible'); el.classList.remove('fade-out'); }
  }
  function hideHeadline(n) {
    const el = document.getElementById('hl-' + n);
    if (el) { el.classList.remove('visible'); el.classList.add('fade-out'); }
  }

  function flashRed() {
    const el = document.getElementById('redFlash');
    el.classList.remove('flash');
    void el.offsetWidth; // force reflow
    el.classList.add('flash');
  }

  function showFeatureCard(n) {
    const el = document.getElementById('fc-' + n);
    if (el) el.classList.add('visible');
  }

  function showStep(n) {
    const el = document.getElementById('step-' + n);
    if (el) el.classList.add('visible');
  }

  // Typing animation for vibe coding prompt
  const promptText = '"Build a multiplayer energy market game where teams bid generators into a merit order..."';
  let typingIndex = 0;
  let typingTimer;

  function startTyping() {
    typingIndex = 0;
    const el = document.getElementById('typingPrompt');
    el.innerHTML = '<span class="prompt-cursor"></span>';

    typingTimer = setInterval(() => {
      if (typingIndex < promptText.length) {
        el.innerHTML = promptText.substring(0, typingIndex + 1) + '<span class="prompt-cursor"></span>';
        typingIndex++;
      } else {
        clearInterval(typingTimer);
        // Show result after typing done
        setTimeout(() => {
          document.getElementById('resultText').style.opacity = '1';
        }, 500);
        // Show vibe stats staggered
        setTimeout(() => { const e = document.getElementById('vs-0'); if(e) e.classList.add('visible'); }, 800);
        setTimeout(() => { const e = document.getElementById('vs-1'); if(e) e.classList.add('visible'); }, 1100);
        setTimeout(() => { const e = document.getElementById('vs-2'); if(e) e.classList.add('visible'); }, 1400);
      }
    }, 40);
  }

  // ===== CONTROLS =====

  // Mute toggle
  document.getElementById('btnMute').addEventListener('click', () => {
    musicMuted = !musicMuted;
    document.getElementById('btnMute').innerHTML = musicMuted ? '&#128264;' : '&#128266;';
    if (musicMuted) {
      stopAllMusic();
    }
  });

  document.getElementById('btnPause').addEventListener('click', () => {
    if (paused) {
      paused = false;
      startTime = Date.now();
      document.getElementById('btnPause').innerHTML = '&#10074;&#10074;';
      tick();
    } else {
      paused = true;
      pauseOffset = getElapsed();
      document.getElementById('btnPause').innerHTML = '&#9654;';
      cancelAnimationFrame(animFrame);
      stopAllMusic();
    }
  });

  document.getElementById('btnRestart').addEventListener('click', () => {
    // Reset everything
    stopAllMusic();
    executed.clear();
    pauseOffset = 0;
    paused = false;
    startTime = Date.now();
    currentScene = -1;
    clearInterval(typingTimer);
    document.getElementById('btnPause').innerHTML = '&#10074;&#10074;';

    // Reset visuals
    document.querySelectorAll('.headline').forEach(el => { el.classList.remove('visible', 'fade-out'); });
    document.querySelectorAll('.feature-card').forEach(el => el.classList.remove('visible'));
    document.querySelectorAll('.screenshot-card').forEach(el => el.classList.remove('visible'));
    document.querySelectorAll('.step-row').forEach(el => el.classList.remove('visible'));
    document.querySelectorAll('.stat').forEach(el => el.classList.remove('visible'));
    document.querySelectorAll('.vibe-stat').forEach(el => el.classList.remove('visible'));
    document.getElementById('typingPrompt').innerHTML = '';
    document.getElementById('resultText').style.opacity = '0';
    document.getElementById('progressBar').style.width = '0%';

    cancelAnimationFrame(animFrame);
    tick();
  });

  document.getElementById('btnSkip').addEventListener('click', () => {
    // Jump to finale
    pauseOffset = 40000;
    startTime = Date.now();
    paused = false;
    document.getElementById('btnPause').innerHTML = '&#10074;&#10074;';
    cancelAnimationFrame(animFrame);
    tick();
  });

  // Keyboard controls (only active after trailer starts)
  document.addEventListener('keydown', (e) => {
    if (!started) return;
    // Any keypress initialises audio context (browser autoplay policy)
    initAudio();
    if (e.code === 'Space') {
      e.preventDefault();
      document.getElementById('btnPause').click();
    } else if (e.code === 'KeyR') {
      document.getElementById('btnRestart').click();
    } else if (e.code === 'KeyM') {
      document.getElementById('btnMute').click();
    } else if (e.code === 'ArrowRight') {
      // Skip forward 5 seconds
      pauseOffset = getElapsed() + 5000;
      startTime = Date.now();
      if (!paused) { cancelAnimationFrame(animFrame); tick(); }
    } else if (e.code === 'ArrowLeft') {
      // Skip back 5 seconds
      pauseOffset = Math.max(0, getElapsed() - 5000);
      startTime = Date.now();
      executed.clear();
      if (!paused) { cancelAnimationFrame(animFrame); tick(); }
    }
  });

  // ===== CLICK-TO-START =====
  // Browser autoplay policy requires user gesture before AudioContext works.
  // The overlay captures the first interaction, inits audio, then starts timeline.
  function startTrailer() {
    if (started) return;
    started = true;
    // Remove overlay
    const overlay = document.getElementById('startOverlay');
    if (overlay) {
      overlay.style.transition = 'opacity 0.6s ease';
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 700);
    }
    // Init audio on this user gesture
    initAudio();
    // Start timeline
    startTime = Date.now();
    pauseOffset = 0;
    tick();
  }

  document.getElementById('startOverlay').addEventListener('click', startTrailer);
  document.addEventListener('keydown', function startOnKey(e) {
    if (!started && (e.code === 'Space' || e.code === 'Enter')) {
      e.preventDefault();
      startTrailer();
      document.removeEventListener('keydown', startOnKey);
    }
  });
})();
</script>

</body>
</html>`;
}
