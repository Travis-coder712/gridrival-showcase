/**
 * Gameplay Summary — Comprehensive mechanics reference for GridRival
 * Served at /api/gameplay-summary
 */
export function getGameplaySummaryHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GridRival — Gameplay Mechanics Summary</title>
<style>
  @page { margin: 1.5cm 2cm; size: A4; }
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    color: #e2e8f0;
    line-height: 1.7;
    font-size: 11pt;
    background: #0f172a;
  }

  .container {
    max-width: 920px;
    margin: 0 auto;
    padding: 2rem 2rem 4rem;
  }

  /* Top nav bar */
  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }
  .back-link {
    color: #63b3ed;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.95rem;
  }
  .back-link:hover { text-decoration: underline; color: #90cdf4; }
  .print-btn {
    background: #3182ce;
    color: white;
    border: none;
    padding: 0.5rem 1.2rem;
    border-radius: 8px;
    font-size: 0.9rem;
    cursor: pointer;
    font-weight: 500;
  }
  .print-btn:hover { background: #4299e1; }

  /* Header */
  .header {
    background: linear-gradient(135deg, #1e3a5f 0%, #0f1b2d 100%);
    color: white;
    padding: 2.5rem 2rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    text-align: center;
    border: 1px solid #1e3a5f;
  }
  .header h1 {
    font-size: 2.2rem;
    font-weight: 800;
    margin-bottom: 0.3rem;
    letter-spacing: -0.5px;
  }
  .header .subtitle {
    color: #63b3ed;
    font-size: 1.05rem;
  }

  /* Section headings */
  h2 {
    font-size: 1.4rem;
    color: #f7fafc;
    border-left: 4px solid #3182ce;
    padding-left: 0.8rem;
    padding-bottom: 0.3rem;
    margin: 2.5rem 0 1rem;
  }
  h3 {
    font-size: 1.1rem;
    color: #cbd5e0;
    margin-top: 1.2rem;
    margin-bottom: 0.5rem;
  }

  p { margin-bottom: 0.8rem; }
  ul, ol { margin: 0.5rem 0 1rem 1.5rem; }
  li { margin-bottom: 0.4rem; }
  strong { color: #90cdf4; }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
    font-size: 0.88rem;
  }
  th, td {
    border: 1px solid #2d3748;
    padding: 0.5rem 0.7rem;
    text-align: left;
  }
  th {
    background: #1e293b;
    font-weight: 600;
    color: #90cdf4;
  }
  tr:nth-child(even) { background: #1e293b; }
  tr:nth-child(odd) { background: #0f172a; }

  /* Cards */
  .card {
    background: #1e293b;
    border: 1px solid #2d3748;
    border-radius: 10px;
    padding: 1.2rem 1.5rem;
    margin: 1rem 0;
  }

  /* Callouts */
  .tip {
    background: rgba(49, 130, 206, 0.12);
    border-left: 4px solid #3182ce;
    padding: 0.8rem 1rem;
    border-radius: 0 8px 8px 0;
    margin: 0.8rem 0;
  }
  .warning {
    background: rgba(214, 158, 46, 0.12);
    border-left: 4px solid #d69e2e;
    padding: 0.8rem 1rem;
    border-radius: 0 8px 8px 0;
    margin: 0.8rem 0;
  }
  .important {
    background: rgba(229, 62, 62, 0.12);
    border-left: 4px solid #e53e3e;
    padding: 0.8rem 1rem;
    border-radius: 0 8px 8px 0;
    margin: 0.8rem 0;
  }

  /* Formula blocks */
  .formula {
    background: #1a202c;
    border: 1px solid #2d3748;
    border-radius: 8px;
    padding: 0.8rem 1.2rem;
    margin: 0.8rem 0;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    color: #68d391;
    overflow-x: auto;
  }

  /* Table of contents */
  .toc {
    background: #1e293b;
    border: 1px solid #2d3748;
    border-radius: 10px;
    padding: 1.2rem 1.5rem;
    margin: 1rem 0;
  }
  .toc h3 { margin-top: 0; color: #90cdf4; }
  .toc ol { margin-left: 1.2rem; }
  .toc a { color: #63b3ed; text-decoration: none; }
  .toc a:hover { text-decoration: underline; }

  .footer {
    text-align: center;
    color: #4a5568;
    font-size: 0.75rem;
    padding-top: 2rem;
    border-top: 1px solid #2d3748;
    margin-top: 3rem;
  }

  /* Print styles */
  @media print {
    body { background: white; color: #1a202c; }
    .top-bar { display: none !important; }
    .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    h2 { color: #1e3a5f; border-left-color: #3182ce; }
    h3 { color: #2d3748; }
    strong { color: #1e3a5f; }
    th { background: #edf2f7; color: #2d3748; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    th, td { border-color: #e2e8f0; }
    tr:nth-child(even) { background: #f7fafc; }
    tr:nth-child(odd) { background: white; }
    .card { background: #f7fafc; border-color: #e2e8f0; }
    .toc { background: #f7fafc; border-color: #e2e8f0; }
    .tip { background: #ebf8ff; }
    .warning { background: #fffbeb; }
    .important { background: #fff5f5; }
    .formula { background: #f7fafc; border-color: #e2e8f0; color: #276749; }
    .footer { color: #a0aec0; border-top-color: #e2e8f0; }
    section { page-break-inside: avoid; }
  }
</style>
</head>
<body>

<div class="container">

  <div class="top-bar">
    <a class="back-link" href="/">&larr; Back to GridRival</a>
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="header">
    <h1>&#9889; Gameplay Mechanics Summary</h1>
    <div class="subtitle">GridRival &mdash; Complete Reference Guide</div>
  </div>

  <div class="toc">
    <h3>Table of Contents</h3>
    <ol>
      <li><a href="#game-overview">Game Overview</a></li>
      <li><a href="#round-structure">Round Structure</a></li>
      <li><a href="#asset-types">Asset Types &amp; Costs</a></li>
      <li><a href="#merit-order">Merit Order Dispatch</a></li>
      <li><a href="#pricing">Pricing Mechanics</a></li>
      <li><a href="#profit">Profit Calculation</a></li>
      <li><a href="#demand">Demand Generation</a></li>
      <li><a href="#battery">Battery Mechanics</a></li>
      <li><a href="#hydro">Hydro Mechanics</a></li>
      <li><a href="#bidding-by-asset">Bidding by Asset Type</a></li>
      <li><a href="#scenarios">Scenario Events</a></li>
      <li><a href="#withdrawal">Economic Withholding Detection</a></li>
      <li><a href="#strategy">Key Strategic Insights</a></li>
      <li><a href="#ui-complexity">UI Complexity Levels</a></li>
      <li><a href="#walkthrough">Walkthrough Mode &amp; Guided Rounds</a></li>
      <li><a href="#round-configs">Round-by-Round Configurations</a></li>
    </ol>
  </div>

  <!-- ─────────────────────────────────────────── -->
  <section id="game-overview">
    <h2>1. Game Overview</h2>
    <p>
      <strong>GridRival</strong> simulates Australia&rsquo;s <strong>National Electricity Market (NEM)</strong>.
      Teams manage a portfolio of generation assets and bid into a merit order auction each round.
      The goal is to maximize cumulative profit by making smart bidding decisions across
      different market conditions and scenarios.
    </p>
    <h3>Game Modes</h3>
    <table>
      <thead>
        <tr>
          <th>Mode</th>
          <th>Rounds</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><strong>Beginner</strong></td><td>1</td><td>Super-simplified intro. 2 assets, 2 periods, guided walkthrough.</td></tr>
        <tr><td><strong>Quick</strong></td><td>8</td><td>Full portfolio in 8 rounds. Ideal for workshops (60&ndash;90 min).</td></tr>
        <tr><td><strong>Progressive</strong></td><td>10</td><td>Builds complexity gradually from 1 asset to a full portfolio.</td></tr>
        <tr><td><strong>First Run</strong></td><td>8</td><td>Lean portfolio (4 assets), intermediate pace. Great for first sessions.</td></tr>
        <tr><td><strong>Full</strong></td><td>15</td><td>Deep dive with all seasons, carbon pricing, and advanced strategy.</td></tr>
        <tr><td><strong>Experienced</strong></td><td>4</td><td>Full portfolio from round 1. Designed for returning players.</td></tr>
      </tbody>
    </table>
  </section>

  <!-- ─────────────────────────────────────────── -->
  <section id="round-structure">
    <h2>2. Round Structure</h2>
    <p>
      Each round represents one <strong>&ldquo;day&rdquo;</strong> in the NEM, divided into
      <strong>4 time periods</strong>, each lasting 6 hours:
    </p>
    <table>
      <thead>
        <tr><th>Period</th><th>Hours</th><th>Typical Characteristics</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>Overnight</strong></td><td>12am &ndash; 6am</td><td>Low demand, baseload generation, wind can be strong</td></tr>
        <tr><td><strong>Morning</strong></td><td>6am &ndash; 12pm</td><td>Demand ramps up, solar begins generating</td></tr>
        <tr><td><strong>Afternoon</strong></td><td>12pm &ndash; 6pm</td><td>Peak solar, high demand on hot days, duck curve midday dip</td></tr>
        <tr><td><strong>Evening</strong></td><td>6pm &ndash; 12am</td><td>Solar drops off, demand remains high, price spikes common</td></tr>
      </tbody>
    </table>
    <h3>Round Flow</h3>
    <div class="card">
      <p>
        <strong>1. Briefing</strong> &mdash; Teams see the scenario, season, demand forecast, and any special events.<br>
        <strong>2. Bidding</strong> &mdash; Teams submit price bids for each asset in each period (4-minute timer).<br>
        <strong>3. Dispatch</strong> &mdash; The engine builds the merit order and dispatches generators to meet demand.<br>
        <strong>4. Results</strong> &mdash; Clearing prices, dispatch outcomes, and profits are revealed.
      </p>
    </div>
  </section>

  <!-- ─────────────────────────────────────────── -->
  <section id="asset-types">
    <h2>3. Asset Types &amp; Costs</h2>
    <table>
      <thead>
        <tr>
          <th>Asset</th>
          <th>Nameplate MW</th>
          <th>SRMC ($/MWh)</th>
          <th>Startup Cost</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Coal</strong></td>
          <td>~660 MW</td>
          <td>$25&ndash;45</td>
          <td>$50,000</td>
          <td>Baseload, slow to start</td>
        </tr>
        <tr>
          <td><strong>Gas CCGT</strong></td>
          <td>~380 MW</td>
          <td>$65&ndash;85</td>
          <td>$20,000</td>
          <td>Mid-merit, flexible</td>
        </tr>
        <tr>
          <td><strong>Gas Peaker</strong></td>
          <td>~200 MW</td>
          <td>$120&ndash;160</td>
          <td>$5,000</td>
          <td>Fast start, peak demand only</td>
        </tr>
        <tr>
          <td><strong>Hydro</strong></td>
          <td>~150 MW</td>
          <td>$5&ndash;8</td>
          <td>$0</td>
          <td>Limited water supply, very flexible</td>
        </tr>
        <tr>
          <td><strong>Wind</strong></td>
          <td>~350 MW</td>
          <td>$0</td>
          <td>$0</td>
          <td>Variable capacity factors per period</td>
        </tr>
        <tr>
          <td><strong>Solar</strong></td>
          <td>~250 MW</td>
          <td>$0</td>
          <td>$0</td>
          <td>Zero overnight, capacity factors vary by season</td>
        </tr>
        <tr>
          <td><strong>Battery</strong></td>
          <td>~500 MW / 3,000 MWh</td>
          <td>$0</td>
          <td>$0</td>
          <td>6-hour duration, 92% round-trip efficiency, charge/discharge/idle</td>
        </tr>
      </tbody>
    </table>
    <div class="tip">
      <strong>SRMC</strong> = Short Run Marginal Cost. This is the variable cost to generate one
      additional MWh. It includes fuel and variable O&amp;M but does NOT include capital costs.
    </div>
    <div class="tip">
      <strong>Note:</strong> Exact asset capacities vary by game mode. The values shown above are
      representative defaults. Battery storage capacity is calculated as nameplate MW &times; 6 hours.
    </div>
  </section>

  <!-- ─────────────────────────────────────────── -->
  <section id="merit-order">
    <h2>4. Merit Order Dispatch</h2>
    <p>The merit order is the core mechanism of the NEM and this game:</p>
    <ol>
      <li>All bid bands from every team are collected and <strong>sorted by price ascending</strong>.</li>
      <li><strong>Renewables (wind, solar) are always dispatched first at $0/MWh.</strong> When multiple bids tie at the same price, renewables have priority in the dispatch order, matching AEMO&rsquo;s real dispatch rules.</li>
      <li>Generators are dispatched from <strong>lowest to highest price</strong> until total demand is met.</li>
      <li>When multiple non-renewable bids tie at the <strong>same price</strong>, they receive <strong>pro-rata dispatch</strong> (each gets a proportional share of the remaining demand).</li>
      <li>The <strong>marginal generator</strong> (the last unit dispatched to meet demand) sets the <strong>clearing price</strong>.</li>
      <li><strong>ALL dispatched generators</strong> earn the clearing price &mdash; this is <strong>uniform pricing</strong>.</li>
    </ol>
    <div class="tip">
      <strong>Key insight:</strong> If you bid low and a high-priced generator sets the clearing price,
      you earn that high price on all your dispatched MW. This is how infra-marginal profits work.
    </div>
  </section>

  <!-- ─────────────────────────────────────────── -->
  <section id="pricing">
    <h2>5. Pricing Mechanics</h2>
    <table>
      <thead>
        <tr><th>Parameter</th><th>Value</th><th>Trigger</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Price Cap</strong></td>
          <td>$20,000/MWh</td>
          <td>Demand exceeds total available supply</td>
        </tr>
        <tr>
          <td><strong>Price Floor</strong></td>
          <td>&minus;$1,000/MWh</td>
          <td>Supply exceeds 3&times; demand (oversupply trigger)</td>
        </tr>
      </tbody>
    </table>

    <h3>AEMO Emergency Generation</h3>
    <div class="card">
      <p>
        When the <strong>price cap</strong> is triggered (supply shortage), AEMO activates
        emergency reserve generation after 1 hour. Revenue for that period uses a
        <strong>blended price</strong>:
      </p>
      <div class="formula">
        Effective Price = (1/6 &times; $20,000) + (5/6 &times; Restored Price)
      </div>
      <p>
        The <strong>restored price</strong> is set to the highest SRMC among dispatched generators.
        This mechanism prevents unrealistically large windfall profits during supply emergencies.
      </p>
    </div>
  </section>

  <!-- ─────────────────────────────────────────── -->
  <section id="profit">
    <h2>6. Profit Calculation</h2>
    <p>Profit for each asset in each period is calculated as follows:</p>
    <div class="formula">
      Revenue = Dispatched MW &times; Period Hours &times; Effective Price
    </div>
    <div class="formula">
      Variable Cost = Dispatched MW &times; Period Hours &times; SRMC
    </div>
    <div class="formula">
      Startup Cost = Fixed cost (if the unit was not running in the previous period)
    </div>
    <div class="formula">
      <strong>Profit = Revenue &minus; Variable Cost &minus; Startup Cost</strong>
    </div>

    <h3>Battery Charging</h3>
    <div class="formula">
      Battery Charging Cost = Charged MW &times; Period Hours &times; Effective Price
    </div>
    <div class="warning">
      Charging is a <strong>pure cost</strong> &mdash; you are buying electricity from the grid.
      The goal is to charge when prices are low and discharge when prices are high.
    </div>
  </section>

  <!-- ─────────────────────────────────────────── -->
  <section id="demand">
    <h2>7. Demand Generation</h2>
    <div class="formula">
      Demand = Fleet Capacity &times; Season Target &times; Scenario Multiplier &times; Random Variation
    </div>
    <ul>
      <li><strong>Season targets</strong> range from ~50% (spring night) to ~88% (summer afternoon).</li>
      <li><strong>Heatwave scenarios</strong> push demand above 100% of fleet capacity, creating <strong>guaranteed supply shortages</strong>.</li>
      <li><strong>Battery charging adds to demand</strong> &mdash; generators must serve both consumer load AND any battery charging happening across all teams.</li>
    </ul>
    <div class="important">
      When many teams charge their batteries simultaneously, it significantly tightens the market
      and pushes clearing prices higher. Timing your battery strategy matters.
    </div>
  </section>

  <!-- ─────────────────────────────────────────── -->
  <section id="battery">
    <h2>8. Battery Mechanics</h2>
    <div class="card">
      <h3>State of Charge (SOC)</h3>
      <p>
        Each battery&rsquo;s SOC is <strong>randomized between 20% and 80%</strong> at the start of each round.
        This represents different prior usage patterns and prevents predictable starting states.
      </p>

      <h3>Efficiency</h3>
      <p>
        <strong>92% round-trip efficiency</strong> &mdash; charging 100 MWh into the battery stores only 92 MWh.
        This energy loss must be factored into arbitrage calculations.
      </p>

      <h3>Capacity &amp; Duration</h3>
      <p>
        Batteries have a <strong>6-hour duration</strong> (storage = nameplate MW &times; 6).
        A 500 MW battery stores up to 3,000 MWh, meaning it can fully charge or discharge
        in a single 6-hour period at maximum rate.
      </p>

      <h3>Operating Modes</h3>
      <table>
        <thead>
          <tr><th>Mode</th><th>Effect</th><th>When to Use</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Charge</strong></td>
            <td>Buy electricity from grid, store in battery</td>
            <td>Low-price periods (overnight, high solar)</td>
          </tr>
          <tr>
            <td><strong>Discharge</strong></td>
            <td>Sell stored electricity to grid</td>
            <td>High-price periods (afternoon peaks, evening)</td>
          </tr>
          <tr>
            <td><strong>Idle</strong></td>
            <td>No action, SOC stays the same</td>
            <td>When spread is too narrow to profit after losses</td>
          </tr>
        </tbody>
      </table>

      <h3>Target SOC Controls</h3>
      <p>
        Teams can set charge and discharge targets to fine-tune battery operation. For example,
        &ldquo;Charge to 50%&rdquo; or &ldquo;Discharge to 0%&rdquo;. The game automatically calculates
        the required MW rate to hit the target SOC within the 6-hour period, so teams do not need
        to manually compute MW values &mdash; just set the desired end-of-period SOC level.
      </p>
    </div>
    <div class="tip">
      <strong>Core battery strategy:</strong> Charge when prices are low (overnight), discharge when
      prices are high (afternoon/evening). But remember &mdash; every other team has the same idea.
      Coordinated charging tightens the market and raises prices during &ldquo;cheap&rdquo; periods.
    </div>
  </section>

  <!-- ─────────────────────────────────────────── -->
  <section id="hydro">
    <h2>9. Hydro Mechanics</h2>
    <div class="card">
      <h3>Water Storage</h3>
      <p>
        Hydro assets have a <strong>limited water storage</strong> (e.g., 1,000 MWh) that depletes
        as hydro is dispatched. Unlike thermal generators that can run continuously with fuel,
        hydro water is a finite resource that must be managed across the round.
      </p>
      <h3>Single-Period Dispatch</h3>
      <p>
        Teams can only dispatch hydro in <strong>ONE period per round</strong>. This means teams
        must choose strategically when to use their hydro asset &mdash; deploying it in the period
        where it will have the greatest impact on profits.
      </p>
      <h3>Water Level Tracking</h3>
      <p>
        A <strong>water level bar</strong> displays remaining hydro storage across rounds,
        giving teams visibility into how much water they have left to work with.
      </p>
      <h3>Opportunity Cost</h3>
      <p>
        Hydro has a very low SRMC (<strong>$5&ndash;8/MWh</strong>), so the variable cost of
        running hydro is minimal. The real strategic question is <strong>opportunity cost</strong>:
        using hydro now means it is unavailable later. Teams should deploy hydro when
        they expect the clearing price to be highest, maximizing the infra-marginal profit
        from its low marginal cost.
      </p>
    </div>
    <div class="warning">
      <strong>Hydro is about timing, not cost.</strong> With an SRMC of just $5&ndash;8/MWh,
      hydro is almost always profitable when dispatched. The challenge is choosing the
      <em>best</em> period to deploy it &mdash; when prices are highest and the profit spread
      is maximized.
    </div>
  </section>

  <!-- ─────────────────────────────────────────── -->
  <section id="bidding-by-asset">
    <h2>10. Bidding by Asset Type</h2>
    <p>
      Different asset types use distinct bidding interfaces, reflecting how each technology
      operates in the real NEM:
    </p>
    <div class="card">
      <h3>Thermal (Coal, Gas)</h3>
      <p>
        <strong>Normal price + quantity bid bands.</strong> Teams set a price ($/MWh) and MW quantity
        for each period. This is the traditional bidding mode &mdash; choose how much capacity to
        offer and at what price. A <strong>strategy auto-fill</strong> feature is available to
        quickly populate bids based on predefined strategies.
      </p>
    </div>
    <div class="card">
      <h3>Renewables (Wind, Solar)</h3>
      <p>
        <strong>Auto-bid at $0/MWh.</strong> Renewable capacity is determined by weather conditions
        (season and time of day), not by team decisions. The bidding interface is
        <strong>read-only</strong>, displaying the available MW per period based on current conditions.
        No user input is needed. Solar output is zero overnight.
      </p>
    </div>
    <div class="card">
      <h3>Hydro</h3>
      <p>
        <strong>Strategic single-period dispatch.</strong> Teams choose <strong>ONE period</strong>
        in which to deploy their hydro asset and set a bid price for that period.
        Storage constraints may limit the dispatch MW available. Hydro is idle in all
        other periods.
      </p>
    </div>
    <div class="card">
      <h3>Battery</h3>
      <p>
        <strong>3-way mode toggle (Charge / Idle / Discharge)</strong> per period with
        target SOC controls. The 6-hour battery can fully charge or discharge in a
        single period at maximum rate. Teams set the desired operating mode and target
        SOC for each of the 4 periods.
      </p>
    </div>
    <div class="tip">
      <strong>Key concept:</strong> Each asset type has its own bidding interface because each
      technology has fundamentally different economics. Thermal assets compete on price,
      renewables are weather-dependent, hydro is about timing, and batteries are about
      arbitrage across periods.
    </div>
  </section>

  <!-- ─────────────────────────────────────────── -->
  <section id="scenarios">
    <h2>11. Scenario Events</h2>
    <p>Scenario events inject real-world market dynamics into each round. Multiple scenarios
      can stack within a single round.</p>
    <table>
      <thead>
        <tr><th>Scenario</th><th>Effects</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Extreme Heatwave</strong></td>
          <td>Day peak demand +40%, Night peak +20%, Coal capacity &minus;10%</td>
        </tr>
        <tr>
          <td><strong>Hot Summer Day</strong></td>
          <td>Day peak demand +25%, Night peak +10%</td>
        </tr>
        <tr>
          <td><strong>Winter Cold Snap</strong></td>
          <td>Night peak demand +35%, Night off-peak +15%, Wind +30%</td>
        </tr>
        <tr>
          <td><strong>Drought</strong></td>
          <td>Hydro availability &minus;50%</td>
        </tr>
        <tr>
          <td><strong>Gas Price Spike</strong></td>
          <td>Gas CCGT and Gas Peaker SRMC +60%</td>
        </tr>
        <tr>
          <td><strong>Dunkelflaute</strong></td>
          <td>Wind &minus;70%, Solar &minus;60% (low wind and low sun simultaneously)</td>
        </tr>
        <tr>
          <td><strong>Carbon Price</strong></td>
          <td>Coal SRMC +$45/MWh, Gas CCGT +$20/MWh, Gas Peaker +$25/MWh</td>
        </tr>
        <tr>
          <td><strong>Renewable Oversupply</strong></td>
          <td>Day demand &minus;30&ndash;35%, Solar +30%, Wind +20%</td>
        </tr>
        <tr>
          <td><strong>Unplanned Outage</strong></td>
          <td>Random coal or gas unit forced offline for the round</td>
        </tr>
        <tr>
          <td><strong>Industrial Demand Response</strong></td>
          <td>Day peak &minus;15%, Night peak &minus;10%</td>
        </tr>
      </tbody>
    </table>
    <div class="warning">
      Pay close attention to scenario announcements at the start of each round. They
      fundamentally change which bidding strategies are profitable.
    </div>
  </section>

  <!-- ─────────────────────────────────────────── -->
  <section id="withdrawal">
    <h2>12. Economic Withholding Detection</h2>
    <div class="card">
      <p>
        When the <strong>price cap</strong> is triggered (indicating a supply shortage), the system
        checks whether any team <strong>repriced more than 25%</strong> of their available capacity
        to the market cap.
      </p>
      <p>
        Teams found to be repricing capacity to higher bands during scarcity conditions receive a
        <strong>public warning</strong>, visible to all participants. This models
        the <strong>AER&rsquo;s monitoring of economic withholding</strong> behaviour in the real NEM.
      </p>
    </div>
    <div class="important">
      Capacity repricing can be profitable in theory, but the detection system creates
      reputational risk. Balance profit maximization against market conduct obligations.
    </div>
  </section>

  <!-- ─────────────────────────────────────────── -->
  <section id="strategy">
    <h2>13. Key Strategic Insights</h2>

    <div class="card">
      <h3>Bidding Strategies</h3>
      <ul>
        <li><strong>Bid at $0</strong> &mdash; Guarantees dispatch, but you earn whatever the clearing price is. Good for renewables and baseload you want running.</li>
        <li><strong>Bid at SRMC</strong> &mdash; Covers variable costs, rational baseline. Startup costs can still cause losses if the clearing price barely exceeds SRMC.</li>
        <li><strong>Bid above SRMC</strong> &mdash; Aims to set a higher clearing price, but risks not being dispatched at all if others bid lower.</li>
        <li><strong>Portfolio approach</strong> &mdash; Mix strategies across your assets. Bid renewables at $0, coal at SRMC, and use peakers to try to influence the price.</li>
      </ul>
    </div>

    <div class="card">
      <h3>Battery Arbitrage</h3>
      <p>
        The theoretical opportunity is simple: charge low, discharge high. The complication is that
        <strong>every team has the same idea</strong>. Mass charging during overnight periods
        increases demand and raises prices. Mass discharging during peak periods increases supply
        and lowers prices. The best battery operators anticipate what other teams will do.
      </p>
    </div>

    <div class="card">
      <h3>Independent Strategy Layers</h3>
      <p>
        Strategies are applied independently to different asset types, allowing teams to compose
        multiple strategies across their portfolio:
      </p>
      <ul>
        <li><strong>Battery Arbitrageur</strong> &mdash; Only affects battery assets (sets charge/idle/discharge across all 4 periods). Does not change thermal or hydro bids.</li>
        <li><strong>Thermal strategies</strong> (Price Taker, Marginal Cost, Price Maker, etc.) &mdash; Only affect coal, gas, and hydro assets. Do not change battery settings.</li>
        <li><strong>Per-period or all-periods toggle</strong> &mdash; Strategies can be applied to a single period or across all 4 periods at once via a toggle.</li>
        <li><strong>Composable strategies</strong> &mdash; Applying Battery Arbitrageur and then Price Maker gives you battery arbitrage settings AND thermal price maker settings simultaneously. The strategies layer on top of each other without conflict.</li>
      </ul>
    </div>

    <div class="card">
      <h3>Reading the Market</h3>
      <ul>
        <li><strong>Demand forecasts</strong> tell you how tight the market will be &mdash; higher demand means higher clearing prices.</li>
        <li><strong>Scenario events</strong> change the economics &mdash; a gas price spike makes gas generators expensive, pushing up clearing prices for everyone.</li>
        <li><strong>Other teams&rsquo; behavior</strong> matters &mdash; if everyone bids conservatively, prices stay low. If several teams bid aggressively, the clearing price jumps.</li>
        <li><strong>Supply shortages</strong> (price cap events) are where the biggest profits AND biggest risks live.</li>
      </ul>
    </div>

    <div class="tip">
      <strong>Final tip:</strong> There is no single &ldquo;correct&rdquo; strategy. The optimal bid
      depends on what every other team is doing. Watch the clearing price history, adapt each round,
      and think about the market as a whole &mdash; not just your own portfolio.
    </div>
  </section>

  <!-- ─────────────────────────────────────────── -->
  <section>
    <h2>14. UI Complexity Levels</h2>
    <p>
      The First Run mode uses a <strong>progressive UI complexity</strong> system to avoid overwhelming
      new players. Each round specifies a <code>uiComplexity</code> setting that controls which interface
      elements are visible on the team&rsquo;s bidding screen.
    </p>
    <table>
      <tr><th>Level</th><th>Visible Elements</th><th>Used In</th></tr>
      <tr>
        <td><strong>minimal</strong></td>
        <td>Basic bid table only. No strategy panel, no period descriptions, no demand % indicators. Simple, clean interface focused on price + quantity inputs.</td>
        <td>First Run Rounds 1&ndash;2</td>
      </tr>
      <tr>
        <td><strong>standard</strong></td>
        <td>Adds strategy auto-fill panel, period demand descriptions, and demand % indicators. More context to inform bidding decisions.</td>
        <td>First Run Rounds 3&ndash;5</td>
      </tr>
      <tr>
        <td><strong>full</strong></td>
        <td>All elements visible: strategy panel, demand info, seasonal guidance, battery controls, hydro selector, portfolio explainer access. Full interface.</td>
        <td>First Run Rounds 6&ndash;8, all other modes</td>
      </tr>
    </table>
    <div class="tip">
      <strong>Implementation note:</strong> The <code>uiComplexity</code> field is only set in First Run mode.
      All other modes default to &ldquo;full&rdquo; complexity &mdash; showing all interface elements from round 1.
    </div>
  </section>

  <!-- ─────────────────────────────────────────── -->
  <section>
    <h2>15. Walkthrough Mode &amp; Guided Rounds</h2>
    <p>
      Certain rounds (typically round 1 in Beginner, First Run, and Full Game modes) include a
      <strong>walkthrough</strong> configuration that pre-fills suggested bids for teams with explanations.
    </p>
    <h3>Walkthrough Structure</h3>
    <table>
      <tr><th>Field</th><th>Description</th></tr>
      <tr>
        <td><code>introText</code></td>
        <td>Displayed at the top of the bidding screen explaining the guided round.</td>
      </tr>
      <tr>
        <td><code>suggestedBids[]</code></td>
        <td>Array of pre-filled bids. Each entry specifies the <code>assetType</code>, <code>period</code>,
        <code>suggestedPrice</code>, <code>suggestedQuantityPercent</code>, and an <code>explanation</code>
        text that appears alongside the bid to explain the strategy.</td>
      </tr>
      <tr>
        <td><code>afterSubmitExplanation</code></td>
        <td>Text shown after the team submits, explaining what to watch for during dispatch and results.</td>
      </tr>
    </table>
    <div class="tip">
      <strong>Host tip:</strong> In walkthrough rounds, encourage teams to read the explanations but feel
      free to adjust the numbers. The suggested bids are starting points, not requirements. Teams that
      modify the suggestions and compare their results to the defaults learn the most.
    </div>

    <h3>Other Guided Features</h3>
    <table>
      <tr><th>Feature</th><th>Description</th><th>Available In</th></tr>
      <tr>
        <td><strong>hostTeachingNotes</strong></td>
        <td>Array of bullet points for the host displayed in a purple card during briefing. What to explain, what to watch for, discussion questions.</td>
        <td>All modes (all rounds)</td>
      </tr>
      <tr>
        <td><strong>educationalContent</strong></td>
        <td>Title + slides with heading/body shown to teams during briefing. Covers the concept being introduced that round.</td>
        <td>All modes (all rounds)</td>
      </tr>
      <tr>
        <td><strong>seasonalGuidance</strong></td>
        <td>Season-specific advice with headline, demand context, supply context, and bidding advice. Shown in the period selector area.</td>
        <td>Rounds with seasonal scenarios (varies by mode)</td>
      </tr>
      <tr>
        <td><strong>batteryMiniGame</strong></td>
        <td>When <code>true</code>, enables the interactive battery arbitrage mini-game before the first battery round.</td>
        <td>Battery introduction rounds</td>
      </tr>
      <tr>
        <td><strong>portfolioExplainer</strong></td>
        <td>When <code>true</code>, enables the portfolio strategy explainer overlay accessible from the bidding screen.</td>
        <td>First Run Round 7</td>
      </tr>
    </table>
  </section>

  <!-- ─────────────────────────────────────────── -->
  <section id="round-configs">
    <h2>16. Round-by-Round Configurations</h2>
    <p>
      Each game mode follows a carefully designed progression. Below is the full
      round-by-round breakdown for every mode, showing what happens each round.
    </p>

    <!-- ── BEGINNER ── -->
    <h3>Beginner Mode (1 Round)</h3>
    <p>A single guided round for absolute first-timers. Coal + Gas CCGT, 2 periods, 2 bid bands.</p>
    <table>
      <thead>
        <tr><th>Round</th><th>Name</th><th>Season</th><th>Periods</th><th>New Assets</th><th>Scenarios</th><th>Special</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Your First Electricity Market</td>
          <td>Autumn</td>
          <td>Morning, Afternoon</td>
          <td>Coal, Gas CCGT</td>
          <td>&mdash;</td>
          <td>Guided walkthrough</td>
        </tr>
      </tbody>
    </table>

    <!-- ── FIRST RUN ── -->
    <h3>First Run Mode (8 Rounds)</h3>
    <p>Lean portfolio (1 coal, 1 gas, 1 renewable, 1 battery per team). Progressive unlock over 6 rounds, then stress tests.</p>
    <table>
      <thead>
        <tr><th>Round</th><th>Name</th><th>Season</th><th>Periods</th><th>New Assets</th><th>Scenarios</th><th>Special</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Your First Bid</td>
          <td>Autumn</td>
          <td>Afternoon</td>
          <td>Coal</td>
          <td>&mdash;</td>
          <td>Guided walkthrough, 1 period only</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Morning &amp; Afternoon</td>
          <td>Autumn</td>
          <td>Morning, Afternoon</td>
          <td>&mdash;</td>
          <td>&mdash;</td>
          <td>2 periods</td>
        </tr>
        <tr>
          <td>3</td>
          <td>Full Day Trading</td>
          <td>Autumn</td>
          <td>All 4</td>
          <td>&mdash;</td>
          <td>&mdash;</td>
          <td>First full day</td>
        </tr>
        <tr>
          <td>4</td>
          <td>Gas Power Enters</td>
          <td>Autumn</td>
          <td>All 4</td>
          <td>Gas (CCGT or Peaker)</td>
          <td>&mdash;</td>
          <td>Teams get different gas types</td>
        </tr>
        <tr>
          <td>5</td>
          <td>Renewables Arrive</td>
          <td>Spring</td>
          <td>All 4</td>
          <td>Wind or Solar</td>
          <td>&mdash;</td>
          <td>Teams get different renewables</td>
        </tr>
        <tr>
          <td>6</td>
          <td>Battery Storage</td>
          <td>Spring</td>
          <td>All 4</td>
          <td>Battery</td>
          <td>&mdash;</td>
          <td>Battery minigame</td>
        </tr>
        <tr>
          <td>7</td>
          <td>Summer Heatwave</td>
          <td>Summer</td>
          <td>All 4</td>
          <td>&mdash;</td>
          <td>Extreme Heatwave</td>
          <td>Portfolio explainer, coal derated</td>
        </tr>
        <tr>
          <td>8</td>
          <td>The Full NEM</td>
          <td>Summer</td>
          <td>All 4</td>
          <td>&mdash;</td>
          <td>Hot Summer Day + Plant Outage</td>
          <td>Final crisis round</td>
        </tr>
      </tbody>
    </table>

    <!-- ── QUICK ── -->
    <h3>Quick Game Mode (8 Rounds)</h3>
    <p>Full-sized portfolio, faster progression. All assets by Round 5, then scenario challenges.</p>
    <table>
      <thead>
        <tr><th>Round</th><th>Name</th><th>Season</th><th>Periods</th><th>New Assets</th><th>Scenarios</th><th>Special</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Guided Walkthrough</td>
          <td>Autumn</td>
          <td>Morning, Afternoon</td>
          <td>Coal</td>
          <td>&mdash;</td>
          <td>Guided walkthrough</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Full Day Trading</td>
          <td>Autumn</td>
          <td>All 4</td>
          <td>&mdash;</td>
          <td>&mdash;</td>
          <td>&mdash;</td>
        </tr>
        <tr>
          <td>3</td>
          <td>Gas Power Enters</td>
          <td>Autumn</td>
          <td>All 4</td>
          <td>Gas CCGT + Peaker</td>
          <td>&mdash;</td>
          <td>&mdash;</td>
        </tr>
        <tr>
          <td>4</td>
          <td>Renewables + Hydro</td>
          <td>Spring</td>
          <td>All 4</td>
          <td>Wind, Solar, Hydro</td>
          <td>&mdash;</td>
          <td>&mdash;</td>
        </tr>
        <tr>
          <td>5</td>
          <td>Battery Storage</td>
          <td>Spring</td>
          <td>All 4</td>
          <td>Battery</td>
          <td>&mdash;</td>
          <td>Battery minigame</td>
        </tr>
        <tr>
          <td>6</td>
          <td>Summer Heatwave</td>
          <td>Summer</td>
          <td>All 4</td>
          <td>&mdash;</td>
          <td>Extreme Heatwave</td>
          <td>&mdash;</td>
        </tr>
        <tr>
          <td>7</td>
          <td>Spring Oversupply</td>
          <td>Spring</td>
          <td>All 4</td>
          <td>&mdash;</td>
          <td>Renewable Oversupply</td>
          <td>Negative prices possible</td>
        </tr>
        <tr>
          <td>8</td>
          <td>The Full NEM</td>
          <td>Summer</td>
          <td>All 4</td>
          <td>&mdash;</td>
          <td>Hot Summer Day + Plant Outage</td>
          <td>Final crisis round</td>
        </tr>
      </tbody>
    </table>

    <!-- ── PROGRESSIVE ── -->
    <h3>Progressive Learning Mode (10 Rounds)</h3>
    <p>The most comprehensive learning journey. One new concept per round with gradual UI complexity.</p>
    <table>
      <thead>
        <tr><th>Round</th><th>Name</th><th>Season</th><th>Periods</th><th>New Assets</th><th>Scenarios</th><th>Special</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Your First Bid</td>
          <td>Autumn</td>
          <td>Afternoon</td>
          <td>Coal</td>
          <td>&mdash;</td>
          <td>Guided walkthrough, minimal UI</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Morning &amp; Afternoon</td>
          <td>Autumn</td>
          <td>Morning, Afternoon</td>
          <td>&mdash;</td>
          <td>&mdash;</td>
          <td>Minimal UI</td>
        </tr>
        <tr>
          <td>3</td>
          <td>Full Day Trading</td>
          <td>Autumn</td>
          <td>All 4</td>
          <td>&mdash;</td>
          <td>&mdash;</td>
          <td>Standard UI</td>
        </tr>
        <tr>
          <td>4</td>
          <td>Gas Power Enters</td>
          <td>Autumn</td>
          <td>All 4</td>
          <td>Gas CCGT + Peaker</td>
          <td>&mdash;</td>
          <td>&mdash;</td>
        </tr>
        <tr>
          <td>5</td>
          <td>Renewables + Hydro</td>
          <td>Spring</td>
          <td>All 4</td>
          <td>Wind, Solar, Hydro</td>
          <td>&mdash;</td>
          <td>&mdash;</td>
        </tr>
        <tr>
          <td>6</td>
          <td>Battery Storage</td>
          <td>Spring</td>
          <td>All 4</td>
          <td>Battery</td>
          <td>&mdash;</td>
          <td>Battery minigame, full UI</td>
        </tr>
        <tr>
          <td>7</td>
          <td>Advanced Strategies</td>
          <td>Autumn</td>
          <td>All 4</td>
          <td>&mdash;</td>
          <td>&mdash;</td>
          <td>Free-play strategy round</td>
        </tr>
        <tr>
          <td>8</td>
          <td>Summer Heatwave</td>
          <td>Summer</td>
          <td>All 4</td>
          <td>&mdash;</td>
          <td>Extreme Heatwave</td>
          <td>&mdash;</td>
        </tr>
        <tr>
          <td>9</td>
          <td>Negative Prices</td>
          <td>Spring</td>
          <td>All 4</td>
          <td>&mdash;</td>
          <td>Renewable Oversupply</td>
          <td>Negative prices possible</td>
        </tr>
        <tr>
          <td>10</td>
          <td>The Full NEM</td>
          <td>Summer</td>
          <td>All 4</td>
          <td>&mdash;</td>
          <td>Hot Summer Day + Plant Outage</td>
          <td>Final crisis round</td>
        </tr>
      </tbody>
    </table>

    <!-- ── FULL ── -->
    <h3>Full Game Mode (15 Rounds)</h3>
    <p>The complete experience. All seasons, all scenarios, maximum depth.</p>
    <table>
      <thead>
        <tr><th>Round</th><th>Name</th><th>Season</th><th>Periods</th><th>New Assets</th><th>Scenarios</th><th>Special</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Guided Walkthrough</td>
          <td>Autumn</td>
          <td>Afternoon</td>
          <td>Coal</td>
          <td>&mdash;</td>
          <td>Guided walkthrough</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Morning vs Afternoon</td>
          <td>Autumn</td>
          <td>Morning, Afternoon</td>
          <td>&mdash;</td>
          <td>&mdash;</td>
          <td>&mdash;</td>
        </tr>
        <tr>
          <td>3</td>
          <td>Full Day Trading</td>
          <td>Autumn</td>
          <td>All 4</td>
          <td>&mdash;</td>
          <td>&mdash;</td>
          <td>&mdash;</td>
        </tr>
        <tr>
          <td>4</td>
          <td>Market Power &amp; Strategy</td>
          <td>Autumn</td>
          <td>All 4</td>
          <td>&mdash;</td>
          <td>&mdash;</td>
          <td>Strategy focus round</td>
        </tr>
        <tr>
          <td>5</td>
          <td>Gas Enters the Market</td>
          <td>Autumn</td>
          <td>All 4</td>
          <td>Gas CCGT + Peaker</td>
          <td>&mdash;</td>
          <td>&mdash;</td>
        </tr>
        <tr>
          <td>6</td>
          <td>Renewables Revolution</td>
          <td>Spring</td>
          <td>All 4</td>
          <td>Wind, Solar</td>
          <td>&mdash;</td>
          <td>&mdash;</td>
        </tr>
        <tr>
          <td>7</td>
          <td>Hydro &amp; Opportunity Cost</td>
          <td>Autumn</td>
          <td>All 4</td>
          <td>Hydro</td>
          <td>&mdash;</td>
          <td>&mdash;</td>
        </tr>
        <tr>
          <td>8</td>
          <td>Battery Storage</td>
          <td>Spring</td>
          <td>All 4</td>
          <td>Battery</td>
          <td>&mdash;</td>
          <td>Battery minigame</td>
        </tr>
        <tr>
          <td>9</td>
          <td>Summer Heatwave</td>
          <td>Summer</td>
          <td>All 4</td>
          <td>&mdash;</td>
          <td>Extreme Heatwave</td>
          <td>&mdash;</td>
        </tr>
        <tr>
          <td>10</td>
          <td>Winter Evening Peak</td>
          <td>Winter</td>
          <td>All 4</td>
          <td>&mdash;</td>
          <td>Cold Snap</td>
          <td>&mdash;</td>
        </tr>
        <tr>
          <td>11</td>
          <td>Spring Oversupply</td>
          <td>Spring</td>
          <td>All 4</td>
          <td>&mdash;</td>
          <td>Renewable Oversupply</td>
          <td>Negative prices possible</td>
        </tr>
        <tr>
          <td>12</td>
          <td>Drought &amp; Gas Crisis</td>
          <td>Autumn</td>
          <td>All 4</td>
          <td>&mdash;</td>
          <td>Drought + Gas Price Spike</td>
          <td>Dual scenario</td>
        </tr>
        <tr>
          <td>13</td>
          <td>Dunkelflaute</td>
          <td>Winter</td>
          <td>All 4</td>
          <td>&mdash;</td>
          <td>Dunkelflaute</td>
          <td>Low wind + low solar</td>
        </tr>
        <tr>
          <td>14</td>
          <td>Carbon Price World</td>
          <td>Summer</td>
          <td>All 4</td>
          <td>&mdash;</td>
          <td>Carbon Price + Demand Response</td>
          <td>Merit order shifts</td>
        </tr>
        <tr>
          <td>15</td>
          <td>The Full NEM Challenge</td>
          <td>Summer</td>
          <td>All 4</td>
          <td>&mdash;</td>
          <td>Hot Summer Day + Plant Outage</td>
          <td>Final crisis round</td>
        </tr>
      </tbody>
    </table>

    <!-- ── EXPERIENCED ── -->
    <h3>Experienced Replay Mode (4 Rounds)</h3>
    <p>All assets unlocked from Round 1. Four challenging scenario rounds for returning players.</p>
    <table>
      <thead>
        <tr><th>Round</th><th>Name</th><th>Season</th><th>Periods</th><th>New Assets</th><th>Scenarios</th><th>Special</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Autumn &mdash; Drought &amp; Gas Crisis</td>
          <td>Autumn</td>
          <td>All 4</td>
          <td>All (Coal, Gas CCGT, Peaker, Wind, Solar, Hydro, Battery)</td>
          <td>Drought + Gas Price Spike</td>
          <td>Full portfolio from start</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Winter &mdash; Dunkelflaute</td>
          <td>Winter</td>
          <td>All 4</td>
          <td>&mdash;</td>
          <td>Dunkelflaute + Cold Snap</td>
          <td>Dual scenario</td>
        </tr>
        <tr>
          <td>3</td>
          <td>Spring &mdash; Renewable Flood</td>
          <td>Spring</td>
          <td>All 4</td>
          <td>&mdash;</td>
          <td>Renewable Oversupply</td>
          <td>Negative prices possible</td>
        </tr>
        <tr>
          <td>4</td>
          <td>Summer &mdash; Heatwave &amp; Outage</td>
          <td>Summer</td>
          <td>All 4</td>
          <td>&mdash;</td>
          <td>Extreme Heatwave + Plant Outage</td>
          <td>Final crisis round</td>
        </tr>
      </tbody>
    </table>

    <div class="tip">
      <strong>Host tip:</strong> Use the <strong>Jump to Round</strong> feature in the lobby to skip
      ahead to any round. This is useful for testing specific scenarios or restarting mid-game
      after a WiFi disconnection.
    </div>
  </section>

  <div class="footer">
    <p>GridRival &mdash; Gameplay Mechanics Summary &middot; Simulating Australia&rsquo;s National Electricity Market</p>
  </div>

</div>

</body>
</html>`;
}
