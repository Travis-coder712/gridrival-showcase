/**
 * Learn the NEM — Printable Document
 *
 * Served at /api/learn-nem — auto-triggers the browser Print dialog
 * so users can Save as PDF. Content mirrors the educational slide deck.
 */

interface Slide {
  icon: string;
  heading: string;
  body: string;
}

const slides: Slide[] = [
  {
    icon: '🇦🇺',
    heading: 'Welcome to the NEM',
    body: 'The <strong>National Electricity Market</strong> is one of the world&rsquo;s longest interconnected power systems, spanning <strong>5 regions</strong> across eastern Australia: Queensland, New South Wales, Victoria, South Australia, and Tasmania. It serves over 10 million customers and trades approximately <strong>200 TWh</strong> of electricity annually.',
  },
  {
    icon: '📊',
    heading: 'How the Market Works',
    body: 'Every <strong>5 minutes</strong>, generators submit bids to AEMO (Australian Energy Market Operator) offering to supply electricity at various prices. AEMO dispatches the cheapest generation first to meet demand. The price paid by all generators is set by the <strong>last (most expensive) unit dispatched</strong> &mdash; this is called the <strong>clearing price</strong> or spot price.',
  },
  {
    icon: '📈',
    heading: 'The Merit Order',
    body: 'Bids are stacked from lowest to highest price &mdash; this is the <strong>merit order</strong>. Renewables (wind, solar) typically bid at <strong>$0</strong> since their fuel is free. Coal bids around <strong>$25&ndash;45/MWh</strong>, gas at <strong>$65&ndash;160/MWh</strong>. The merit order determines which generators run and which sit idle. Cheaper plants run more often; expensive plants only run when demand is high.',
  },
  {
    icon: '💰',
    heading: 'Clearing Price &amp; Uniform Pricing',
    body: 'The key insight: <strong>ALL dispatched generators receive the same clearing price</strong>, regardless of their bid. If demand requires a gas peaker bidding at $150/MWh, then coal plants that bid $30/MWh also receive $150/MWh. This means <strong>infra-marginal generators</strong> (those below the clearing price) earn significant profits. Your goal: maximise your profit by bidding strategically.',
  },
  {
    icon: '🏭',
    heading: 'Generator Types',
    body: '<strong>Coal</strong> &mdash; Large baseload plants, low cost ($25&ndash;45), slow to start/stop.<br><strong>Gas CCGT</strong> &mdash; Mid-merit, moderate cost ($65&ndash;85), flexible.<br><strong>Gas Peaker</strong> &mdash; Fast start, high cost ($120&ndash;160), runs only at peak times.<br><strong>Hydro</strong> &mdash; Very flexible, low cost ($8), but limited water supply. Can only dispatch in ONE period per round.<br><strong>Wind &amp; Solar</strong> &mdash; Zero fuel cost, but output depends on weather.<br><strong>Battery</strong> &mdash; 6-hour battery. Charge when cheap, discharge when expensive. Target SOC controls. Charging adds to market demand.',
  },
  {
    icon: '💲',
    heading: 'Understanding Costs',
    body: '<strong>Short Run Marginal Cost (SRMC)</strong> is the cost to generate one additional MWh. It includes fuel and variable O&amp;M but NOT capital costs. Bidding at marginal cost covers your costs &mdash; anything above marginal cost is profit. The game shows each asset&rsquo;s marginal cost with a <strong>coloured badge</strong> so you always know your break-even price.',
  },
  {
    icon: '🔄',
    heading: 'The Energy Transition',
    body: 'Australia&rsquo;s NEM is undergoing a dramatic transformation. Coal plants are <strong>retiring</strong> (Liddell 2023, Eraring planned 2025). <strong>Renewables</strong> now provide over 35% of NEM generation. <strong>Batteries</strong> are emerging as the new flexible capacity. This creates new market dynamics: the <strong>duck curve</strong>, <strong>negative prices</strong>, and increased <strong>volatility</strong> &mdash; all of which you&rsquo;ll experience in this game.',
  },
  {
    icon: '📉',
    heading: 'Market Dynamics',
    body: 'NEM prices swing from <strong>&minus;$1,000/MWh</strong> (negative! generators pay to stay on) to <strong>$20,000/MWh</strong> (the price cap during scarcity). Key dynamics:<br>&bull; <strong>Negative prices</strong> &mdash; when renewables oversupply, usually midday<br>&bull; <strong>Price spikes</strong> &mdash; during heatwaves, plant outages, or low wind<br>&bull; <strong>The duck curve</strong> &mdash; midday solar suppresses prices, evening demand surges<br>&bull; <strong>Volatility</strong> &mdash; creates opportunities for strategic bidders',
  },
  {
    icon: '🎯',
    heading: 'Bidding Strategies',
    body: '<strong>Price Taker</strong> &mdash; Bid $0, guarantee dispatch, accept the clearing price.<br><strong>Marginal Cost Bidder</strong> &mdash; Bid at cost. Rational baseline, covers costs.<br><strong>Price Maker</strong> &mdash; Bid high to push up the clearing price for all your units.<br><strong>Portfolio Optimizer</strong> &mdash; Mix strategies across your different assets.<br><strong>Capacity Repricing</strong> &mdash; Reprice capacity to higher bands to tighten effective supply and influence clearing prices.<br><strong>Battery Arbitrage</strong> &mdash; Charge cheap, discharge expensive.<br><strong>Independent Layers</strong> &mdash; Battery strategy is separate from thermal strategy. Apply both without conflicts.',
  },
  {
    icon: '🎮',
    heading: 'How This Game Works',
    body: 'You and your team own a <strong>portfolio of power generation assets</strong>. Each round represents a day in the NEM. You submit <strong>price bids</strong> for each asset across multiple time periods (overnight, morning, afternoon, evening). The game engine runs the <strong>merit order dispatch</strong> to determine which generators run and what price everyone receives. Your <strong>profit = (Clearing Price &minus; Marginal Cost) &times; MW &times; Hours</strong>. Each asset type has its own bidding interface: renewables auto-bid at $0, hydro chooses one dispatch period, batteries toggle charge/discharge with SOC targets, and thermal assets bid normally.',
  },
  {
    icon: '🕹️',
    heading: 'Game Modes',
    body: '<strong>Beginner Intro (1 round, ~15 min)</strong> &mdash; Single guided round with 2 assets. Perfect for first-timers.<br><br><strong>Progressive Learning (10 rounds, ~90&ndash;120 min)</strong> &mdash; Builds complexity gradually from 1 asset to a full portfolio. Host teaching prompts included. Best for 2-hour sessions.<br><br><strong>Quick Game (8 rounds, ~60&ndash;90 min)</strong> &mdash; Fast-paced introduction covering all technologies. Perfect for workshops.<br><br><strong>Full Game (15 rounds, ~2.5&ndash;3.5 hours)</strong> &mdash; Deep dive with seasonal scenarios, carbon pricing, and advanced strategy.<br><br><strong>Experienced Replay (4 rounds, ~30&ndash;45 min)</strong> &mdash; Full portfolio from the start. One round per season.',
  },
  {
    icon: '🎮',
    heading: 'Game Features',
    body: 'The game includes several features to help you learn:<br><strong>Progressive Learning</strong> &mdash; Start with 1 asset and build to a full portfolio over 10 rounds.<br><strong>Sound Effects</strong> &mdash; Audio cues for countdowns, bid confirmations, and results (mute with 🔊).<br><strong>Dark Mode</strong> &mdash; Toggle with 🌙 for dimly-lit rooms.<br><strong>Quick Recaps</strong> &mdash; See your last round results at the start of each new round.<br><strong>Bid Presets</strong> &mdash; One-click strategies like Price Taker, Cost Recovery, and Aggressive bidding.<br><strong>Price History</strong> &mdash; Track clearing price trends across all rounds.',
  },
  {
    icon: '🚀',
    heading: "Let's Play!",
    body: '<strong>Tips for success:</strong><br>&bull; Watch the <strong>Marginal Cost badges</strong> &mdash; always know your costs<br>&bull; Read the <strong>period descriptions</strong> &mdash; they tell you what&rsquo;s typically dispatched<br>&bull; Think about what <strong>other teams</strong> will bid &mdash; the clearing price depends on everyone<br>&bull; <strong>Renewables</strong> change everything &mdash; watch for negative price opportunities<br>&bull; <strong>Batteries</strong> are your secret weapon for volatile markets<br><br>Ready? The host will start the game. Good luck!',
  },
];

function renderSlide(slide: Slide, index: number): string {
  return `
    <div class="slide">
      <div class="slide-header">
        <span class="slide-icon">${slide.icon}</span>
        <h2>${slide.heading}</h2>
      </div>
      <div class="slide-body">${slide.body}</div>
    </div>`;
}

export function getLearnNemHTML(): string {
  const slideHTML = slides.map(renderSlide).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Learn the NEM — National Electricity Market Guide</title>
<style>
  @page { margin: 1.5cm 2cm; size: A4; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1a202c; line-height: 1.7; font-size: 11pt; }

  /* Cover page */
  .cover { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: linear-gradient(135deg, #1e3a5f 0%, #0f1b2d 100%); color: white; min-height: 100vh; padding: 3rem; page-break-after: always; }
  .cover .bolt { font-size: 5rem; margin-bottom: 1.5rem; }
  .cover h1 { font-size: 2.8rem; font-weight: 800; margin-bottom: 0.5rem; letter-spacing: -1px; }
  .cover .subtitle { font-size: 1.3rem; color: #63b3ed; margin-bottom: 1.5rem; }
  .cover .tagline { font-size: 1rem; color: #a0aec0; max-width: 550px; line-height: 1.7; }

  /* Print toolbar */
  .no-print { background: #1e3a5f; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; }
  .no-print a { color: #63b3ed; text-decoration: none; font-size: 14px; font-weight: 500; }
  .no-print a:hover { color: #90cdf4; }
  .no-print button { background: #3182ce; color: white; border: none; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
  .no-print button:hover { background: #4299e1; }

  /* Content */
  .content { max-width: 750px; margin: 0 auto; padding: 2rem 1rem; }
  .slide { margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #e2e8f0; }
  .slide:last-child { border-bottom: none; }
  .slide-header { display: flex; align-items: center; gap: 0.7rem; margin-bottom: 0.8rem; }
  .slide-icon { font-size: 1.8rem; }
  .slide-header h2 { font-size: 1.4rem; color: #1e3a5f; font-weight: 700; }
  .slide-body { font-size: 11pt; color: #2d3748; line-height: 1.7; }
  .slide-body strong { color: #1e3a5f; }
  .footer { text-align: center; color: #a0aec0; font-size: 0.75rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0; margin-top: 1rem; }

  @media print {
    .no-print { display: none !important; }
    .cover { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .content { padding: 0; }
    .slide { page-break-inside: avoid; }
  }
</style>
</head>
<body>

<div class="no-print">
  <a href="/">&larr; Back to Game</a>
  <button onclick="window.print()">Print / Save as PDF</button>
</div>

<div class="cover">
  <div class="bolt">&#9889;</div>
  <h1>Learn the NEM</h1>
  <div class="subtitle">National Electricity Market Guide</div>
  <p class="tagline">
    Everything you need to know about how Australia's National Electricity Market works,
    from the merit order to bidding strategies. Perfect preparation for GridRival.
  </p>
</div>

<div class="content">
${slideHTML}

  <div class="footer">
    <p>GridRival &mdash; Learn the NEM Guide &middot; 5 game modes &middot; 7 asset types</p>
  </div>
</div>

</body>
</html>`;
}
