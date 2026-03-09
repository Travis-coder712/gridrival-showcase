/**
 * Pre-Read Document for GridRival — Your Pre-Session Guide
 *
 * Served at /api/pre-read — open in browser, then File > Print > Save as PDF
 * to distribute to players before the session.
 *
 * This is the SINGLE pre-session document for all game modes.
 * Covers NEM basics, game mechanics, generator types, strategies, and glossary.
 * Replaces the previous learn-nem.ts + pre-read.ts split.
 */
export function getPreReadHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GridRival — Your Pre-Session Guide</title>
<style>
  @page { margin: 1.5cm 2cm; size: A4; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1a202c; line-height: 1.6; font-size: 11pt; }
  .page { page-break-after: always; min-height: 100vh; padding: 0; }
  .page:last-child { page-break-after: avoid; }

  /* Cover page */
  .cover { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: linear-gradient(135deg, #1e3a5f 0%, #0f1b2d 100%); color: white; min-height: 100vh; padding: 3rem; }
  .cover h1 { font-size: 2.8rem; font-weight: 800; margin-bottom: 0.5rem; letter-spacing: -1px; }
  .cover .subtitle { font-size: 1.3rem; color: #63b3ed; margin-bottom: 2rem; }
  .cover .bolt { font-size: 5rem; margin-bottom: 1.5rem; }
  .cover .tagline { font-size: 1rem; color: #a0aec0; max-width: 500px; line-height: 1.7; }
  .cover .prep-box { margin-top: 2.5rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 1.5rem 2rem; text-align: left; max-width: 400px; }
  .cover .prep-box h3 { color: #63b3ed; font-size: 0.9rem; margin-bottom: 0.7rem; text-transform: uppercase; letter-spacing: 1px; }
  .cover .prep-box li { color: #e2e8f0; font-size: 0.85rem; margin-bottom: 0.4rem; list-style: none; padding-left: 1.5rem; position: relative; }
  .cover .prep-box li::before { content: "\\2713"; position: absolute; left: 0; color: #48bb78; font-weight: bold; }

  /* Content pages */
  h2 { font-size: 1.5rem; color: #1e3a5f; border-bottom: 3px solid #3182ce; padding-bottom: 0.4rem; margin-bottom: 1rem; }
  h3 { font-size: 1.15rem; color: #2d3748; margin-top: 1.2rem; margin-bottom: 0.5rem; }
  h4 { font-size: 1rem; color: #3182ce; margin-top: 1rem; margin-bottom: 0.3rem; }
  p { margin-bottom: 0.6rem; }
  .content { padding: 0.5rem 0; }
  .highlight { background: #ebf8ff; border-left: 4px solid #3182ce; padding: 0.8rem 1rem; border-radius: 0 8px 8px 0; margin: 0.8rem 0; }
  .highlight-amber { background: #fffbeb; border-left: 4px solid #d69e2e; padding: 0.8rem 1rem; border-radius: 0 8px 8px 0; margin: 0.8rem 0; }
  .highlight-green { background: #f0fff4; border-left: 4px solid #38a169; padding: 0.8rem 1rem; border-radius: 0 8px 8px 0; margin: 0.8rem 0; }
  .key-concept { background: #f0fff4; border: 1px solid #c6f6d5; border-radius: 8px; padding: 0.8rem 1rem; margin: 0.8rem 0; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 0.8rem 0; }
  .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.8rem; margin: 0.8rem 0; }
  .card { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.8rem; }
  .card h4 { margin-top: 0; }
  .stat { display: inline-block; background: #edf2f7; border-radius: 6px; padding: 0.15rem 0.5rem; font-family: monospace; font-weight: 600; font-size: 0.9rem; color: #2d3748; }
  ul { padding-left: 1.5rem; margin-bottom: 0.6rem; }
  li { margin-bottom: 0.3rem; }
  .footer { text-align: center; color: #a0aec0; font-size: 0.75rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; margin-top: auto; }
  .toc { columns: 2; column-gap: 2rem; margin: 1rem 0; }
  .toc-item { margin-bottom: 0.3rem; font-size: 0.9rem; }
  .toc-item a { color: #3182ce; text-decoration: none; }
  .gen-card { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.7rem; margin-bottom: 0.6rem; }
  .gen-card .gen-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem; }
  .gen-card .gen-icon { font-size: 1.4rem; }
  .gen-card .gen-name { font-weight: 700; color: #1e3a5f; font-size: 1rem; }
  .gen-card .gen-stats { display: flex; gap: 0.8rem; flex-wrap: wrap; margin-bottom: 0.3rem; }
  .gen-card .gen-desc { font-size: 0.85rem; color: #4a5568; }
  .no-print { background: #1e3a5f; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; }
  .no-print a { color: #63b3ed; text-decoration: none; font-size: 14px; font-weight: 500; }
  .no-print a:hover { color: #90cdf4; }
  .no-print button { background: #3182ce; color: white; border: none; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
  .no-print button:hover { background: #4299e1; }

  @media print {
    .no-print { display: none !important; }
    .page { page-break-after: always; }
    .cover { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .highlight, .highlight-amber, .highlight-green, .key-concept, .card, .gen-card, .stat, .cover .prep-box { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>

<div class="no-print">
  <a href="/">&larr; Back to Game</a>
  <button onclick="window.print()">Print / Save as PDF</button>
</div>

<!-- PAGE 1: COVER -->
<div class="page cover">
  <div class="bolt">&#9889;</div>
  <h1>GridRival</h1>
  <div class="subtitle">Your Pre-Session Guide</div>
  <p class="tagline">
    An interactive electricity market simulation where you take on the role of a power generator,
    bidding your assets into the National Electricity Market.
    Compete against other teams to maximise profit as you navigate
    Australia's energy transition.
  </p>
  <div class="prep-box">
    <h3>Before You Arrive</h3>
    <ul>
      <li>Bring a laptop, tablet, or smartphone (charged!)</li>
      <li>You'll connect via WiFi to join the game</li>
      <li>No software installation required &mdash; it runs in your browser</li>
      <li>Teams of 2&ndash;4 people work best</li>
      <li>Read this document to understand the basics</li>
      <li>Session runs approximately 45&ndash;120 minutes depending on mode</li>
      <li>Your host may display a WiFi QR code &mdash; scan it to connect automatically</li>
    </ul>
  </div>
</div>

<!-- PAGE 2: THE NEM IN 60 SECONDS -->
<div class="page content">
  <h2>1. The NEM in 60 Seconds</h2>

  <p>The <strong>National Electricity Market (NEM)</strong> is one of the world's longest interconnected power systems,
  spanning <strong>5,000 km</strong> down eastern Australia. Established in 1998, it connects five regions
  (Queensland, New South Wales, Victoria, South Australia, and Tasmania) and serves over 10 million customers,
  trading approximately <strong>200 TWh</strong> of electricity annually.</p>

  <h3>How the Market Works</h3>
  <p>Every <strong>5 minutes</strong> in the real NEM (and each round in our game), generators submit <strong>bids</strong>
  to AEMO (Australian Energy Market Operator) offering to supply electricity at various prices. AEMO then runs a
  dispatch engine to determine who generates.</p>

  <h3>The Merit Order</h3>
  <p>AEMO stacks ALL bids from ALL generators from <strong>cheapest to most expensive</strong> &mdash; this is the
  <strong>merit order</strong>. Starting from the cheapest, generators are dispatched one by one until total supply meets demand.</p>

  <div class="highlight">
    <strong>The Key Insight &mdash; Uniform Pricing:</strong> The price of the LAST (most expensive) generator dispatched
    sets the <strong>clearing price</strong>. ALL dispatched generators receive this same price &mdash; even if they bid much lower!
    This means bidding low gets you dispatched, but you still earn the higher clearing price.
  </div>

  <h3>Understanding Costs</h3>
  <p><strong>Short Run Marginal Cost (SRMC)</strong> is the cost to generate one additional MWh. It includes fuel and
  variable operations &amp; maintenance but NOT capital costs. In the game, each asset shows its SRMC with a
  coloured <strong>Marginal Cost badge</strong> so you always know your break-even price.</p>

  <div class="key-concept">
    <strong>Your Profit = (Clearing Price &minus; Your Marginal Cost) &times; Dispatched MW &times; Hours</strong><br>
    <small>Bid low to get dispatched. Earn the clearing price set by the most expensive generator needed.</small>
  </div>

  <h3>Market Price Range</h3>
  <p>NEM prices swing from <span class="stat">-$1,000/MWh</span> (negative! generators pay to stay on)
  to <span class="stat">$20,000/MWh</span> (the price cap during scarcity). This extreme range creates
  opportunities for strategic bidders &mdash; and makes electricity markets one of the most volatile
  commodity markets in the world.</p>
</div>

<!-- PAGE 3: HOW THE GAME WORKS -->
<div class="page content">
  <h2>2. How the Game Works</h2>

  <p>You and your team own a portfolio of power generation assets &mdash; coal plants, gas turbines,
  wind farms, solar farms, hydro, and batteries. Each round, you submit <strong>bids</strong> to sell
  your electricity into the market.</p>

  <h3>Round Structure</h3>
  <p>Each round follows four phases:</p>
  <div class="two-col">
    <div class="card">
      <h4>&#128214; 1. Briefing</h4>
      <p>Learn what's new this round &mdash; new assets, scenarios, seasonal changes. Your host will explain the key concepts.</p>
    </div>
    <div class="card">
      <h4>&#128176; 2. Bidding</h4>
      <p>Set prices and quantities for each asset across time periods. You have a countdown timer &mdash; submit before it expires!</p>
    </div>
    <div class="card">
      <h4>&#9889; 3. Dispatch</h4>
      <p>The game engine runs the merit order, dispatching cheapest bids first until demand is met. Watch the merit order chart!</p>
    </div>
    <div class="card">
      <h4>&#128200; 4. Results</h4>
      <p>See the clearing price, who was dispatched, and your profit/loss. Compare strategies across teams.</p>
    </div>
  </div>

  <h3>Time Periods</h3>
  <p>Each round represents a day, divided into up to four 6-hour periods:</p>
  <div class="two-col">
    <div class="card">
      <h4>&#127769; Overnight (12am&ndash;6am)</h4>
      <p>Lowest demand. Baseload generation only. Potential for oversupply with wind.</p>
    </div>
    <div class="card">
      <h4>&#127749; Morning (6am&ndash;12pm)</h4>
      <p>Rising demand. Industry starts up. Solar begins generating.</p>
    </div>
    <div class="card">
      <h4>&#9728;&#65039; Afternoon (12pm&ndash;6pm)</h4>
      <p>Peak solar. Can see oversupply in mild weather, or extreme demand in summer.</p>
    </div>
    <div class="card">
      <h4>&#127750; Evening (6pm&ndash;12am)</h4>
      <p>Solar gone. Residential peak. Often the highest prices &mdash; the "solar cliff" period.</p>
    </div>
  </div>
  <p><em>Early rounds may start with fewer periods (1 or 2) and expand as you learn.</em></p>

  <h3>The Bid</h3>
  <p>A bid has two parts:</p>
  <div class="two-col">
    <div class="card">
      <h4>Price ($/MWh)</h4>
      <p>The minimum price you'll accept to generate. Range: <span class="stat">-$1,000</span> to <span class="stat">$20,000</span> per MWh.</p>
    </div>
    <div class="card">
      <h4>Quantity (MW)</h4>
      <p>How many megawatts you're offering. You can split capacity across multiple <strong>bid bands</strong> at different prices.</p>
    </div>
  </div>

  <h3>Progressive Complexity</h3>
  <p>The game starts simple and builds up over successive rounds:</p>
  <ul>
    <li><strong>Early rounds:</strong> Coal only &mdash; learn the basics of bidding and the merit order</li>
    <li><strong>Mid rounds:</strong> Gas enters &mdash; different cost structures, peak pricing dynamics</li>
    <li><strong>Later rounds:</strong> Renewables &amp; hydro &mdash; zero-cost generation reshapes the market</li>
    <li><strong>Advanced rounds:</strong> Batteries &mdash; buy low, sell high energy arbitrage</li>
    <li><strong>Scenario rounds:</strong> Heatwaves, oversupply, plant outages, carbon pricing &mdash; real-world challenges</li>
  </ul>
  <p><em>The exact progression depends on the game mode your host selects (45 minutes to 3+ hours).</em></p>
</div>

<!-- PAGE 4: GENERATOR TYPES -->
<div class="page content">
  <h2>3. Generator Types</h2>
  <p>Each generator type has unique characteristics, costs, and bidding approaches. You'll unlock these progressively through the game.</p>

  <div class="gen-card">
    <div class="gen-header">
      <span class="gen-icon">&#127981;</span>
      <span class="gen-name">Coal</span>
    </div>
    <div class="gen-stats">
      <span class="stat">~400&ndash;800 MW</span>
      <span class="stat">SRMC: $28&ndash;$42/MWh</span>
    </div>
    <div class="gen-desc">
      Large baseload plant. Low cost but slow to start and stop (shutting down costs $50,000+).
      Runs 24/7 as the backbone of the fleet. In hot weather, output may be <strong>derated</strong> (reduced)
      due to cooling water temperature limits. Coal is cheap to run but inflexible &mdash; it can't easily
      respond to rapid demand changes. Bidding: set your price and quantity per period.
    </div>
  </div>

  <div class="gen-card">
    <div class="gen-header">
      <span class="gen-icon">&#128293;</span>
      <span class="gen-name">Gas CCGT (Combined Cycle)</span>
    </div>
    <div class="gen-stats">
      <span class="stat">~200&ndash;350 MW</span>
      <span class="stat">SRMC: $68&ndash;$82/MWh</span>
    </div>
    <div class="gen-desc">
      Mid-merit plant. Moderate cost, good flexibility. Dispatched when demand exceeds baseload capacity.
      Profitable when clearing prices are above its SRMC. Bidding: set your price and quantity per period.
    </div>
  </div>

  <div class="gen-card">
    <div class="gen-header">
      <span class="gen-icon">&#9889;</span>
      <span class="gen-name">Gas Peaker (Open Cycle)</span>
    </div>
    <div class="gen-stats">
      <span class="stat">~100&ndash;150 MW</span>
      <span class="stat">SRMC: $130&ndash;$155/MWh</span>
    </div>
    <div class="gen-desc">
      Fast-start, expensive plant. Only runs during peak demand or supply shortages.
      Can start in minutes (vs hours for coal). Earns its keep during price spikes.
      Bidding: set your price and quantity per period.
    </div>
  </div>

  <div class="two-col">
    <div class="gen-card">
      <div class="gen-header">
        <span class="gen-icon">&#127788;&#65039;</span>
        <span class="gen-name">Wind</span>
      </div>
      <div class="gen-stats">
        <span class="stat">~200&ndash;300 MW</span>
        <span class="stat">SRMC: $0/MWh</span>
      </div>
      <div class="gen-desc">
        Zero fuel cost. Output varies by wind conditions and time of day &mdash; can produce 24/7 but availability
        changes each period. <strong>Auto-bids at $0</strong>. No team action needed &mdash; shown as read-only info cards.
      </div>
    </div>
    <div class="gen-card">
      <div class="gen-header">
        <span class="gen-icon">&#9728;&#65039;</span>
        <span class="gen-name">Solar</span>
      </div>
      <div class="gen-stats">
        <span class="stat">~150&ndash;200 MW</span>
        <span class="stat">SRMC: $0/MWh</span>
      </div>
      <div class="gen-desc">
        Zero fuel cost. Daytime only &mdash; zero output overnight. Strong in the afternoon, ramps up in the morning.
        Output varies by season (strongest in summer). <strong>Auto-bids at $0</strong>. No team action needed.
      </div>
    </div>
  </div>

  <div class="gen-card">
    <div class="gen-header">
      <span class="gen-icon">&#128167;</span>
      <span class="gen-name">Hydro</span>
    </div>
    <div class="gen-stats">
      <span class="stat">~250 MW</span>
      <span class="stat">SRMC: $8/MWh</span>
      <span class="stat">1,000 MWh water</span>
    </div>
    <div class="gen-desc">
      Very flexible and cheap, but <strong>limited water</strong>. Can only dispatch in <strong>ONE period</strong>
      per round &mdash; choose wisely! Water used now cannot be used later, creating an <strong>opportunity cost</strong>.
      Save water for the highest-price period. Real-world operators like Snowy Hydro are among the NEM's most sophisticated traders.
    </div>
  </div>

  <div class="gen-card">
    <div class="gen-header">
      <span class="gen-icon">&#128267;</span>
      <span class="gen-name">Battery</span>
    </div>
    <div class="gen-stats">
      <span class="stat">~200&ndash;500 MW</span>
      <span class="stat">4&ndash;6 hour duration</span>
      <span class="stat">92% efficiency</span>
    </div>
    <div class="gen-desc">
      The ultimate arbitrage machine. Toggle <strong>Charge / Idle / Discharge</strong> each period.
      Charge when prices are low or negative (you get <em>paid</em> to charge during negative prices!),
      discharge when prices are high. 92% round-trip efficiency means you need the spread to exceed ~8%
      to profit. Use target SOC (State of Charge) buttons to set charge levels.
      Batteries earn from the <strong>price spread</strong> between cheap and expensive periods.
    </div>
  </div>
</div>

<!-- PAGE 5: THE ENERGY TRANSITION -->
<div class="page content">
  <h2>4. The Energy Transition</h2>
  <p>The game's progression mirrors the real transformation of Australia's electricity system over three decades.</p>

  <h3>&#127981; The Coal Era (1998&ndash;2008)</h3>
  <p>Coal dominated, providing around <span class="stat">85%</span> of generation. Prices were relatively stable at
  <span class="stat">$25&ndash;40/MWh</span> base. The NEM operated as a uniform-price auction &mdash; the same mechanism you'll use in the game.</p>

  <h3>&#127793; The Transition Begins (2009&ndash;2017)</h3>
  <p>The Renewable Energy Target drove wind and solar investment. Key milestones: carbon pricing trial (2012&ndash;14),
  South Australia's last coal plant closes (2016), Hazelwood closes in Victoria (2017, 1,600 MW),
  Tesla's Big Battery installed in SA. Gas prices rose as LNG exports competed for domestic supply.</p>

  <h3>&#9889; The Renewable Surge (2018&ndash;Present)</h3>
  <p>Renewables became the cheapest new generation. By 2024, over <span class="stat">20 GW</span> of wind and solar
  connected to the NEM. Negative daytime prices became routine in spring. Grid-scale batteries grew from near zero
  to over <span class="stat">4 GW</span>. Coal economics deteriorated as running hours and average prices fell.
  The 2022 energy crisis saw record prices and AEMO suspended the spot market for the first time.</p>

  <h3>&#128302; Looking Forward (2025&ndash;2035)</h3>
  <ul>
    <li><strong>Coal exits accelerating:</strong> Most remaining plants setting closure dates</li>
    <li><strong>Storage explosion:</strong> Pumped hydro (Snowy 2.0) and continued battery deployment</li>
    <li><strong>Renewable Energy Zones:</strong> Coordinated transmission and generation corridors</li>
    <li><strong>Electrification:</strong> EVs, heat pumps, and industry electrifying &mdash; total demand may rise 50%+</li>
    <li><strong>Market redesign:</strong> New capacity markets and ancillary services for a renewables-dominated grid</li>
  </ul>

  <div class="highlight-amber">
    <strong>The Big Question:</strong> How do you maintain reliable supply and reasonable prices while transitioning to a
    zero-emissions electricity system? The same tension you'll experience in the game &mdash; balancing competition,
    profitability, and market outcomes &mdash; is the central challenge facing Australia's real energy policymakers today.
  </div>

  <h3>Key Market Dynamics You'll Experience</h3>
  <div class="two-col">
    <div class="card">
      <h4>&#128200; Negative Prices</h4>
      <p>When renewables oversupply the market (usually midday in spring), prices go negative.
      Generators PAY to stay on. Batteries get paid to charge!</p>
    </div>
    <div class="card">
      <h4>&#128293; Price Spikes</h4>
      <p>During heatwaves, plant outages, or low wind, prices can hit the
      <span class="stat">$20,000/MWh</span> cap. Every MW of capacity matters.</p>
    </div>
    <div class="card">
      <h4>&#128024; The Duck Curve</h4>
      <p>Solar suppresses midday prices, creating a "belly." When solar drops off in the evening,
      prices surge &mdash; the "solar cliff."</p>
    </div>
    <div class="card">
      <h4>&#127780; Dunkelflaute</h4>
      <p>German for "dark doldrums" &mdash; extended low wind AND low solar. Thermal generation
      becomes critical. Batteries can't bridge multi-day gaps.</p>
    </div>
  </div>
</div>

<!-- PAGE 6: BIDDING STRATEGIES -->
<div class="page content">
  <h2>5. Bidding Strategies</h2>
  <p>The game offers one-click strategy presets, or you can set your own prices manually. Here are the six core approaches:</p>

  <div class="two-col">
    <div class="card">
      <h4>&#127919; Price Taker</h4>
      <p>Bid at $0 to guarantee dispatch. You'll earn whatever the clearing price is. Low risk, but you can't influence prices.</p>
      <p><em>Best when:</em> You want certainty, or supply is already tight and you'll be dispatched regardless.</p>
    </div>
    <div class="card">
      <h4>&#128200; Marginal Cost Bidder (SRMC)</h4>
      <p>Bid at your marginal cost. Classic economic theory says this is the "efficient" strategy in competitive markets.</p>
      <p><em>Best when:</em> You want a safe balance of risk and reward. Covers your costs, earns when prices are high.</p>
    </div>
    <div class="card">
      <h4>&#128176; Price Maker</h4>
      <p>Bid some capacity high to push up the clearing price. All your dispatched capacity benefits from the higher price.</p>
      <p><em>Best when:</em> Supply is tight and your bid might set the clearing price. Risk: bid too high and miss dispatch.</p>
    </div>
    <div class="card">
      <h4>&#128161; Portfolio Optimiser</h4>
      <p>Different strategies for different assets. Bid renewables at $0, coal at SRMC, and peakers aggressively high.</p>
      <p><em>Best when:</em> You have diverse assets and want to maximise total portfolio profit rather than per-asset.</p>
    </div>
    <div class="card">
      <h4>&#128683; Capacity Repricing</h4>
      <p>Reprice 20&ndash;30% of capacity to higher bands to tighten supply and raise prices for your remaining dispatched units.</p>
      <p><em>Best when:</em> You have significant market share and supply is near demand. Risky &mdash; the AER monitors for economic withholding and other teams may undercut you.</p>
    </div>
    <div class="card">
      <h4>&#128267; Battery Arbitrageur</h4>
      <p>Charge during cheap or negative-price periods, discharge at premium evening prices. Profit = spread minus efficiency loss.</p>
      <p><em>Best when:</em> Large price differences exist between periods (e.g., cheap solar midday, expensive evening).</p>
    </div>
  </div>

  <div class="highlight">
    <strong>The Meta-Game:</strong> The "best" strategy depends on what everyone else does. If everyone bids $0, prices crash and
    nobody profits. If everyone bids high, someone gets undercut. This strategic interaction is exactly what makes
    electricity markets fascinating &mdash; and difficult to regulate.
  </div>

  <h3>Bidding by Asset Type</h3>
  <p>Different assets bid differently, just like the real NEM:</p>
  <div class="two-col">
    <div class="card">
      <h4>&#127981; Thermal (Coal, Gas)</h4>
      <p>Normal bidding. Set a price and quantity for each period. Use the strategy auto-fill panel for quick presets.</p>
    </div>
    <div class="card">
      <h4>&#9728;&#65039;&#128168; Renewables (Solar, Wind)</h4>
      <p>Auto-bid at <span class="stat">$0/MWh</span>. Capacity set by weather conditions. No action needed &mdash; shown as read-only info cards.</p>
    </div>
    <div class="card">
      <h4>&#128167; Hydro</h4>
      <p>Choose <strong>ONE period</strong> to dispatch. Limited water &mdash; save it for when prices are highest. Set your own bid price.</p>
    </div>
    <div class="card">
      <h4>&#128267; Battery</h4>
      <p>Toggle <strong>Charge / Idle / Discharge</strong> each period. Use &ldquo;Charge to X%&rdquo; target SOC buttons.
      Battery strategy works independently from thermal strategies &mdash; you can combine them.</p>
    </div>
  </div>
</div>

<!-- PAGE 7: WHAT TO EXPECT + SCENARIOS -->
<div class="page content">
  <h2>6. What to Expect</h2>

  <h3>Seasons &amp; Demand Patterns</h3>
  <p>The game cycles through Australia's seasons, each creating different market conditions:</p>
  <div class="two-col">
    <div class="card">
      <h4>&#127810; Autumn</h4>
      <p>Mild demand. The "Goldilocks" season &mdash; not too hot, not too cold. Good for learning the basics.</p>
    </div>
    <div class="card">
      <h4>&#10052;&#65039; Winter</h4>
      <p>Heating demand elevates evening peak. Short days reduce solar. Wind can be strong from cold fronts.</p>
    </div>
    <div class="card">
      <h4>&#127800; Spring</h4>
      <p>Lowest demand meets strongest renewables. Oversupply risk. Negative prices likely during solar peak.</p>
    </div>
    <div class="card">
      <h4>&#9728;&#65039; Summer</h4>
      <p>Highest demand from air conditioning. Solar helps but the evening "solar cliff" creates extreme scarcity.</p>
    </div>
  </div>

  <h3>Surprise Events</h3>
  <p>Your host may trigger surprise events during the game that change market conditions:</p>
  <ul>
    <li><strong>Heatwave:</strong> Demand surges +40%, coal derated 10%</li>
    <li><strong>Plant Outage:</strong> A random asset goes offline &mdash; losing capacity when you need it most</li>
    <li><strong>Oversupply:</strong> Renewables flood the market, driving prices negative</li>
    <li><strong>Carbon Price:</strong> Adds ~$45/MWh to coal costs, reshuffling the merit order</li>
    <li><strong>Drought:</strong> Hydro capacity halved due to low water levels</li>
    <li><strong>Dunkelflaute:</strong> Wind at 10% and solar at 40% &mdash; thermal must carry the load</li>
  </ul>

  <h3>During the Game</h3>
  <div class="two-col">
    <div class="card">
      <h4>&#128266; Sound Effects</h4>
      <p>Countdown beeps and result chimes. Mute with the &#128266; button if needed.</p>
    </div>
    <div class="card">
      <h4>&#127769; Dark Mode</h4>
      <p>Toggle with the &#127769; button if the room lighting is dim.</p>
    </div>
    <div class="card">
      <h4>&#128203; Quick Recap</h4>
      <p>Each round starts with a summary of your last round results so you can refine your strategy.</p>
    </div>
    <div class="card">
      <h4>&#127919; Bid Presets</h4>
      <p>Use one-click strategy presets (Price Taker, SRMC, Aggressive, etc.) if you're unsure what to bid.</p>
    </div>
  </div>

  <div class="highlight-green">
    <strong>What You'll Learn:</strong> By the end of the game, you'll understand how electricity prices are set in Australia,
    why prices spike during heatwaves, how renewables push down daytime prices, why the evening "solar cliff" matters,
    and why batteries and flexible generation are becoming increasingly valuable.
  </div>
</div>

<!-- PAGE 8: GLOSSARY + CHECKLIST -->
<div class="page content">
  <h2>7. Glossary</h2>
  <div class="two-col">
    <div>
      <p><strong>AEMO</strong> &mdash; Australian Energy Market Operator. Runs the NEM dispatch engine and ensures system reliability.</p>
      <p><strong>Bid Band</strong> &mdash; A price/quantity pair. You can submit multiple bands per asset to split your capacity at different prices.</p>
      <p><strong>Capacity Factor</strong> &mdash; The percentage of nameplate capacity available at any time. Solar at 80% means only 80% of the panel's rated MW is available.</p>
      <p><strong>Clearing Price</strong> &mdash; The price of the last (most expensive) dispatched generator. All dispatched generators receive this price.</p>
      <p><strong>Dispatch</strong> &mdash; AEMO selecting which generators run to meet demand. Cheapest bids dispatched first.</p>
      <p><strong>Duck Curve</strong> &mdash; The demand-minus-solar shape: low midday (solar surplus), steep evening ramp (solar cliff).</p>
      <p><strong>Dunkelflaute</strong> &mdash; "Dark doldrums" &mdash; extended periods of low wind AND low solar output.</p>
      <p><strong>Gentailer</strong> &mdash; A company that both generates and retails electricity. The Big 3 (AGL, Origin, EnergyAustralia) are all gentailers.</p>
    </div>
    <div>
      <p><strong>Market Cap / Floor</strong> &mdash; Maximum price: $20,000/MWh. Floor: -$1,000/MWh.</p>
      <p><strong>Merit Order</strong> &mdash; All bids sorted cheapest to most expensive. AEMO dispatches up the stack until demand is met.</p>
      <p><strong>MW (Megawatt)</strong> &mdash; A measure of power (capacity). Your plant's size.</p>
      <p><strong>MWh (Megawatt-hour)</strong> &mdash; A measure of energy (power &times; time). What you sell.</p>
      <p><strong>Portfolio Effect</strong> &mdash; When losses on one asset are offset by gains on another, reducing overall risk.</p>
      <p><strong>Pro-rata Dispatch</strong> &mdash; When multiple generators bid the same price at the margin, capacity is split proportionally.</p>
      <p><strong>Reserve Margin</strong> &mdash; Spare capacity above demand. Low margins = tight supply = high prices.</p>
      <p><strong>SOC (State of Charge)</strong> &mdash; How full a battery is, shown as a percentage. Tracks across periods within a round.</p>
      <p><strong>SRMC (Short Run Marginal Cost)</strong> &mdash; The cost to produce one additional MWh. Fuel + variable O&amp;M. Also called marginal cost.</p>
    </div>
  </div>

  <h2 style="margin-top:1.5rem">8. Pre-Session Checklist</h2>
  <div class="highlight">
    <ul style="list-style: none; padding-left: 0;">
      <li style="margin-bottom: 0.5rem;">&#9745; <strong>Read this document</strong> &mdash; understand merit order, clearing price, and your generator types</li>
      <li style="margin-bottom: 0.5rem;">&#9745; <strong>Bring a charged device</strong> &mdash; laptop, tablet, or smartphone with a modern browser</li>
      <li style="margin-bottom: 0.5rem;">&#9745; <strong>No installation needed</strong> &mdash; everything runs in your browser</li>
      <li style="margin-bottom: 0.5rem;">&#9745; <strong>WiFi access</strong> &mdash; your host will share connection details (possibly via QR code)</li>
      <li style="margin-bottom: 0.5rem;">&#9745; <strong>Team up</strong> &mdash; groups of 2&ndash;4 people work best. One device per team.</li>
      <li style="margin-bottom: 0.5rem;">&#9745; <strong>Come with questions!</strong> &mdash; the best learning happens through discussion and experimentation</li>
    </ul>
  </div>

  <div class="footer" style="margin-top:2rem">
    <p>GridRival &mdash; Your Pre-Session Guide &middot; 6 game modes &middot; 7 asset types &middot; Real NEM scenarios</p>
    <p>Bring your device charged. No installation required. See you at the session!</p>
  </div>
</div>

</body>
</html>`;
}
