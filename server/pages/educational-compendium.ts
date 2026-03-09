/**
 * Educational Compendium — Post-Game Take-Home Reference for GridRival
 *
 * Served at /api/educational-compendium — open in browser, then File > Print > Save as PDF
 * to distribute to players after the session.
 *
 * Self-contained document that compiles ALL educational content from the game
 * into a topic-based reference organised for post-game study.
 * Does NOT import from round config files.
 */
export function getEducationalCompendiumHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GridRival &mdash; Educational Compendium</title>
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
  .cover .tagline { font-size: 1rem; color: #a0aec0; max-width: 550px; line-height: 1.7; }
  .cover .toc-box { margin-top: 2.5rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 1.5rem 2rem; text-align: left; max-width: 480px; }
  .cover .toc-box h3 { color: #63b3ed; font-size: 0.9rem; margin-bottom: 0.7rem; text-transform: uppercase; letter-spacing: 1px; }
  .cover .toc-box li { color: #e2e8f0; font-size: 0.85rem; margin-bottom: 0.4rem; list-style: none; padding-left: 1.5rem; position: relative; }
  .cover .toc-box li::before { content: "\\2713"; position: absolute; left: 0; color: #48bb78; font-weight: bold; }

  /* Content pages */
  h2 { font-size: 1.5rem; color: #1e3a5f; border-bottom: 3px solid #3182ce; padding-bottom: 0.4rem; margin-bottom: 1rem; }
  h3 { font-size: 1.15rem; color: #2d3748; margin-top: 1.2rem; margin-bottom: 0.5rem; }
  h4 { font-size: 1rem; color: #3182ce; margin-top: 1rem; margin-bottom: 0.3rem; }
  p { margin-bottom: 0.6rem; }
  .content { padding: 0.5rem 0; }
  .highlight { background: #ebf8ff; border-left: 4px solid #3182ce; padding: 0.8rem 1rem; border-radius: 0 8px 8px 0; margin: 0.8rem 0; }
  .highlight-amber { background: #fffbeb; border-left: 4px solid #d69e2e; padding: 0.8rem 1rem; border-radius: 0 8px 8px 0; margin: 0.8rem 0; }
  .highlight-green { background: #f0fff4; border-left: 4px solid #38a169; padding: 0.8rem 1rem; border-radius: 0 8px 8px 0; margin: 0.8rem 0; }
  .highlight-red { background: #fff5f5; border-left: 4px solid #e53e3e; padding: 0.8rem 1rem; border-radius: 0 8px 8px 0; margin: 0.8rem 0; }
  .key-concept { background: #f0fff4; border: 1px solid #c6f6d5; border-radius: 8px; padding: 0.8rem 1rem; margin: 0.8rem 0; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 0.8rem 0; }
  .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.8rem; margin: 0.8rem 0; }
  .card { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.8rem; }
  .card h4 { margin-top: 0; }
  .stat { display: inline-block; background: #edf2f7; border-radius: 6px; padding: 0.15rem 0.5rem; font-family: monospace; font-weight: 600; font-size: 0.9rem; color: #2d3748; }
  ul { padding-left: 1.5rem; margin-bottom: 0.6rem; }
  li { margin-bottom: 0.3rem; }
  .footer { text-align: center; color: #a0aec0; font-size: 0.75rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; margin-top: auto; }
  .gen-card { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.7rem; margin-bottom: 0.6rem; }
  .gen-card .gen-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem; }
  .gen-card .gen-icon { font-size: 1.4rem; }
  .gen-card .gen-name { font-weight: 700; color: #1e3a5f; font-size: 1rem; }
  .gen-card .gen-stats { display: flex; gap: 0.8rem; flex-wrap: wrap; margin-bottom: 0.3rem; }
  .gen-card .gen-desc { font-size: 0.85rem; color: #4a5568; }

  /* Table styles */
  table { width: 100%; border-collapse: collapse; margin: 0.8rem 0; font-size: 0.85rem; }
  th { background: #1e3a5f; color: white; padding: 0.5rem 0.6rem; text-align: left; font-weight: 600; }
  td { padding: 0.45rem 0.6rem; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) td { background: #f7fafc; }

  /* Staircase diagram */
  .staircase { font-family: monospace; font-size: 0.8rem; line-height: 1.3; background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.8rem 1rem; margin: 0.8rem 0; white-space: pre; overflow-x: auto; }

  /* Formula block */
  .formula { background: #edf2f7; border: 1px solid #cbd5e0; border-radius: 8px; padding: 0.8rem 1rem; margin: 0.6rem 0; font-family: monospace; font-size: 0.95rem; }

  .no-print { background: #1e3a5f; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; }
  .no-print a { color: #63b3ed; text-decoration: none; font-size: 14px; font-weight: 500; }
  .no-print a:hover { color: #90cdf4; }
  .no-print button { background: #3182ce; color: white; border: none; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
  .no-print button:hover { background: #4299e1; }

  @media print {
    .no-print { display: none !important; }
    .page { page-break-after: always; }
    .cover { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .highlight, .highlight-amber, .highlight-green, .highlight-red, .key-concept, .card, .gen-card, .stat, .cover .toc-box, th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
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
  <div class="subtitle">Educational Compendium</div>
  <p class="tagline">
    Your post-game take-home reference. Everything you learned about Australia's
    National Electricity Market &mdash; organised by topic for future study.
  </p>
  <div class="toc-box">
    <h3>What's Inside</h3>
    <ul>
      <li>NEM Basics &amp; Market Structure</li>
      <li>The Merit Order &amp; Clearing Price</li>
      <li>Generator Types &amp; Cost Structures</li>
      <li>Time Periods &amp; Demand Patterns</li>
      <li>Seasons in the NEM</li>
      <li>Renewables &amp; the Merit Order Effect</li>
      <li>Hydro &amp; Opportunity Cost</li>
      <li>Battery Storage, Arbitrage &amp; the Park Spread</li>
      <li>Pumped Hydro Energy Storage</li>
      <li>Bidding Strategies</li>
      <li>Market Scenarios</li>
      <li>The Energy Transition</li>
      <li>The Real NEM: Asset Evolution &amp; 2030 Forecast</li>
      <li>Key Formulas &amp; Glossary</li>
    </ul>
  </div>
</div>

<!-- PAGE 2: NEM BASICS -->
<div class="page content">
  <h2>1. NEM Basics</h2>

  <p>The <strong>National Electricity Market (NEM)</strong> is one of the world's longest interconnected power systems,
  spanning <strong>5,000 km</strong> down eastern Australia. Established in 1998, it connects five regions and serves
  over 10 million customers.</p>

  <h3>The Five Regions</h3>
  <div class="two-col">
    <div class="card">
      <h4>&#127463;&#127462; Regions</h4>
      <ul>
        <li><strong>Queensland (QLD)</strong> &mdash; Coal &amp; solar rich</li>
        <li><strong>New South Wales (NSW)</strong> &mdash; Largest demand centre</li>
        <li><strong>Victoria (VIC)</strong> &mdash; Wind-rich, brown coal legacy</li>
        <li><strong>South Australia (SA)</strong> &mdash; Renewables leader</li>
        <li><strong>Tasmania (TAS)</strong> &mdash; Hydro-dominated</li>
      </ul>
    </div>
    <div class="card">
      <h4>&#128202; Key Statistics</h4>
      <ul>
        <li>Annual energy traded: <span class="stat">~200 TWh</span></li>
        <li>Peak demand: <span class="stat">~35 GW</span></li>
        <li>Transmission length: <span class="stat">5,000 km</span></li>
        <li>Dispatch interval: <span class="stat">5 minutes</span></li>
        <li>Price range: <span class="stat">-$1,000</span> to <span class="stat">$20,000/MWh</span></li>
      </ul>
    </div>
  </div>

  <h3>How the Market Works</h3>
  <p>Every <strong>5 minutes</strong> in the real NEM, generators submit <strong>bids</strong> to AEMO
  (Australian Energy Market Operator) offering to supply electricity at various prices. AEMO then runs a
  dispatch engine to determine who generates and at what level.</p>

  <div class="highlight">
    <strong>AEMO's Role:</strong> The Australian Energy Market Operator is the independent system operator.
    It runs the dispatch engine, ensures supply meets demand in real time, manages system security, and
    publishes market data. AEMO does not own any generators &mdash; it is a neutral umpire.
  </div>

  <h3>The Dispatch Process</h3>
  <ol style="padding-left: 1.5rem; margin-bottom: 0.6rem;">
    <li>Generators submit price/quantity bids to AEMO</li>
    <li>AEMO stacks all bids from cheapest to most expensive (the <strong>merit order</strong>)</li>
    <li>Starting from the cheapest, generators are dispatched until supply meets demand</li>
    <li>The price of the LAST generator dispatched sets the <strong>clearing price</strong></li>
    <li>ALL dispatched generators receive the same clearing price (<strong>uniform pricing</strong>)</li>
  </ol>

  <h3>Price Range</h3>
  <p>NEM prices swing from <span class="stat">-$1,000/MWh</span> (negative &mdash; generators pay to stay on)
  to <span class="stat">$20,000/MWh</span> (the market price cap during extreme scarcity). This makes
  electricity one of the most volatile commodity markets in the world.</p>

  <div class="highlight-amber">
    <strong>Why Negative Prices?</strong> Some generators (especially coal and wind) cannot or prefer not to
    shut down during oversupply. They bid negative prices &mdash; effectively paying the market &mdash; to stay
    dispatched. Batteries can get <em>paid</em> to charge during negative price periods.
  </div>
</div>

<!-- PAGE 3: THE MERIT ORDER -->
<div class="page content">
  <h2>2. The Merit Order</h2>

  <p>The merit order is the fundamental mechanism of the NEM. All bids are stacked from cheapest to most expensive,
  and generators are dispatched up the stack until demand is met.</p>

  <h3>How Bids Are Stacked</h3>
  <p>Each generator submits one or more <strong>bid bands</strong> &mdash; price/quantity pairs. AEMO assembles
  ALL bid bands from ALL generators into a single stack, sorted by price. The cheapest MWh are dispatched first.</p>

  <div class="staircase">
Price
($/MWh)
  |
  |                                          ___________
  |                                         |           |
$155 |                                         | Gas Peaker|  &larr; Clearing Price
  |                              ___________|           |     (set by marginal unit)
  |                             |                       |
 $75 |                             | Gas CCGT              |
  |              _______________|                       |
  |             |                                       |
 $35 |             | Coal                                  |
  |  ___________|                                       |
  |  |                                                  |
  $0 |  | Wind+Solar                                      |
  |__|________________________________________________|___________
     0              Cumulative Capacity (MW)             Demand
                                                          |
     [========= Dispatched generators =========]          |
     All receive $155/MWh (the clearing price)
</div>

  <h3>Uniform Pricing</h3>
  <div class="key-concept">
    <strong>The Key Insight:</strong> ALL dispatched generators receive the <strong>same clearing price</strong>,
    regardless of what they actually bid. A wind farm that bid $0 still earns $155/MWh if that is the clearing price.
    This is called <strong>uniform pricing</strong> (as opposed to pay-as-bid).
  </div>

  <p>This creates the central strategic tension:</p>
  <ul>
    <li><strong>Bid low</strong> &rarr; guaranteed dispatch, earn the clearing price</li>
    <li><strong>Bid high</strong> &rarr; might set the clearing price (more profit per MWh), but risk not being dispatched</li>
  </ul>

  <h3>Why Uniform Pricing?</h3>
  <p>Uniform pricing encourages generators to bid close to their true marginal cost. Under pay-as-bid, generators
  would try to guess the clearing price and bid just below it &mdash; leading to less transparent and less
  efficient outcomes. Uniform pricing means the cheapest generators always get dispatched first, and generators
  that bid their true costs are never worse off than those that try to game the system.</p>

  <h3>Pro-Rata Dispatch</h3>
  <p>When multiple generators bid the <strong>same price</strong> at the margin (where supply meets demand),
  the available dispatch is split <strong>proportionally</strong> based on their offered capacity. For example,
  if two 100 MW generators both bid $50 and only 120 MW is needed, each gets dispatched at 60 MW.</p>
</div>

<!-- PAGE 4: GENERATOR TYPES & COST STRUCTURES -->
<div class="page content">
  <h2>3. Generator Types &amp; Cost Structures</h2>

  <p>The NEM features seven main generator types, each with distinct cost structures, operating characteristics,
  and strategic roles in the market.</p>

  <table>
    <tr>
      <th>Type</th>
      <th>Capacity</th>
      <th>SRMC ($/MWh)</th>
      <th>Role</th>
      <th>Key Characteristic</th>
    </tr>
    <tr>
      <td>&#127981; Coal</td>
      <td>400&ndash;800 MW</td>
      <td>$28&ndash;$42</td>
      <td>Baseload</td>
      <td>Cheap but inflexible; runs 24/7</td>
    </tr>
    <tr>
      <td>&#128293; Gas CCGT</td>
      <td>200&ndash;350 MW</td>
      <td>$68&ndash;$82</td>
      <td>Mid-merit</td>
      <td>Moderate cost; flexible ramp-up</td>
    </tr>
    <tr>
      <td>&#9889; Gas Peaker</td>
      <td>100&ndash;150 MW</td>
      <td>$130&ndash;$155</td>
      <td>Peak</td>
      <td>Expensive but fast-start (minutes)</td>
    </tr>
    <tr>
      <td>&#127788;&#65039; Wind</td>
      <td>200&ndash;300 MW</td>
      <td>$0</td>
      <td>Variable</td>
      <td>24/7 but output varies with weather</td>
    </tr>
    <tr>
      <td>&#9728;&#65039; Solar</td>
      <td>150&ndash;200 MW</td>
      <td>$0</td>
      <td>Variable</td>
      <td>Daytime only; zero overnight</td>
    </tr>
    <tr>
      <td>&#128167; Hydro</td>
      <td>~250 MW</td>
      <td>~$8</td>
      <td>Peaking/flexible</td>
      <td>Limited water; choose when to dispatch</td>
    </tr>
    <tr>
      <td>&#128267; Battery</td>
      <td>200&ndash;500 MW</td>
      <td>N/A</td>
      <td>Arbitrage</td>
      <td>Charge low, discharge high; 92% efficiency</td>
    </tr>
  </table>

  <h3>Detailed Profiles</h3>

  <div class="gen-card">
    <div class="gen-header">
      <span class="gen-icon">&#127981;</span>
      <span class="gen-name">Coal</span>
    </div>
    <div class="gen-stats">
      <span class="stat">400&ndash;800 MW</span>
      <span class="stat">SRMC: $28&ndash;$42/MWh</span>
    </div>
    <div class="gen-desc">
      Large baseload plant. Lowest marginal cost among thermal generators but very inflexible &mdash;
      shutting down costs $50,000+. Runs 24/7 as the backbone of the fleet. In hot weather, output may be
      <strong>derated</strong> (reduced) due to cooling water temperature limits. Profitable whenever the
      clearing price exceeds ~$35/MWh, which is most of the time &mdash; but economics deteriorate as
      renewables push daytime prices down.
    </div>
  </div>

  <div class="two-col">
    <div class="gen-card">
      <div class="gen-header">
        <span class="gen-icon">&#128293;</span>
        <span class="gen-name">Gas CCGT</span>
      </div>
      <div class="gen-stats">
        <span class="stat">200&ndash;350 MW</span>
        <span class="stat">SRMC: $68&ndash;$82/MWh</span>
      </div>
      <div class="gen-desc">
        Mid-merit combined cycle plant. Moderate cost with good flexibility. Dispatched when demand
        exceeds baseload + renewable capacity. Profitable when clearing prices are above ~$75/MWh.
        Vulnerable to gas price shocks.
      </div>
    </div>
    <div class="gen-card">
      <div class="gen-header">
        <span class="gen-icon">&#9889;</span>
        <span class="gen-name">Gas Peaker</span>
      </div>
      <div class="gen-stats">
        <span class="stat">100&ndash;150 MW</span>
        <span class="stat">SRMC: $130&ndash;$155/MWh</span>
      </div>
      <div class="gen-desc">
        Fast-start open cycle turbine. The most expensive generator to run, but can start in minutes
        (vs hours for coal). Only profitable during price spikes &mdash; but those spikes can be enormous
        ($1,000&ndash;$20,000/MWh). Earns most of its annual revenue in just a few peak hours.
      </div>
    </div>
  </div>

  <div class="two-col">
    <div class="gen-card">
      <div class="gen-header">
        <span class="gen-icon">&#127788;&#65039;</span>
        <span class="gen-name">Wind</span>
      </div>
      <div class="gen-stats">
        <span class="stat">200&ndash;300 MW</span>
        <span class="stat">SRMC: $0/MWh</span>
      </div>
      <div class="gen-desc">
        Zero fuel cost. Can generate 24/7 but output depends entirely on wind conditions. Capacity
        factors typically 25&ndash;40%. Auto-bids at $0 to guarantee dispatch. Revenue depends entirely
        on when the wind blows relative to demand patterns.
      </div>
    </div>
    <div class="gen-card">
      <div class="gen-header">
        <span class="gen-icon">&#9728;&#65039;</span>
        <span class="gen-name">Solar</span>
      </div>
      <div class="gen-stats">
        <span class="stat">150&ndash;200 MW</span>
        <span class="stat">SRMC: $0/MWh</span>
      </div>
      <div class="gen-desc">
        Zero fuel cost. Daytime only &mdash; zero output overnight and during evening peak. Strongest
        in summer afternoons. Output varies by season (short winter days vs long summer days). Creates
        the "duck curve" by suppressing midday prices.
      </div>
    </div>
  </div>

  <div class="two-col">
    <div class="gen-card">
      <div class="gen-header">
        <span class="gen-icon">&#128167;</span>
        <span class="gen-name">Hydro</span>
      </div>
      <div class="gen-stats">
        <span class="stat">~250 MW</span>
        <span class="stat">SRMC: ~$8/MWh</span>
        <span class="stat">1,000 MWh water</span>
      </div>
      <div class="gen-desc">
        Very flexible and cheap to run, but constrained by <strong>limited water</strong>. Can only
        dispatch in ONE period per round. The true cost is the <em>opportunity cost</em> &mdash; water
        used now cannot be used in a higher-priced period later.
      </div>
    </div>
    <div class="gen-card">
      <div class="gen-header">
        <span class="gen-icon">&#128267;</span>
        <span class="gen-name">Battery</span>
      </div>
      <div class="gen-stats">
        <span class="stat">200&ndash;500 MW</span>
        <span class="stat">4&ndash;6 hr duration</span>
        <span class="stat">92% efficiency</span>
      </div>
      <div class="gen-desc">
        The ultimate arbitrage machine. Charge when prices are low or negative, discharge when prices
        are high. 92% round-trip efficiency means you need the price spread to exceed ~8% to profit.
        Tracks State of Charge (SOC) across periods.
      </div>
    </div>
  </div>
</div>

<!-- PAGE 5: TIME PERIODS & DEMAND -->
<div class="page content">
  <h2>4. Time Periods &amp; Demand Patterns</h2>

  <p>Each round in the game represents a day, divided into four 6-hour periods. Each period has distinct
  demand characteristics and generation mix, creating different market conditions and pricing dynamics.</p>

  <div class="two-col">
    <div class="card">
      <h4>&#127769; Overnight (12am&ndash;6am)</h4>
      <p><strong>Demand:</strong> Lowest of the day. Typically 60&ndash;70% of peak.</p>
      <p><strong>Generation mix:</strong> Baseload coal runs. Wind may be strong. Solar is zero.</p>
      <p><strong>Prices:</strong> Low, sometimes negative if wind is high. Potential oversupply.</p>
      <p><strong>Strategy:</strong> Good time to charge batteries. Coal must bid low to stay dispatched.</p>
    </div>
    <div class="card">
      <h4>&#127749; Morning (6am&ndash;12pm)</h4>
      <p><strong>Demand:</strong> Rising as industry starts up and households wake. ~80% of peak.</p>
      <p><strong>Generation mix:</strong> Coal + gas ramp up. Solar begins generating mid-morning.</p>
      <p><strong>Prices:</strong> Moderate, transitional. Higher than overnight but below peak.</p>
      <p><strong>Strategy:</strong> Solar starts contributing. Gas CCGT often dispatched.</p>
    </div>
  </div>
  <div class="two-col">
    <div class="card">
      <h4>&#9728;&#65039; Afternoon (12pm&ndash;6pm)</h4>
      <p><strong>Demand:</strong> Variable. Moderate in mild seasons; extreme in summer heatwaves.</p>
      <p><strong>Generation mix:</strong> Peak solar output. Renewables dominate in mild weather.</p>
      <p><strong>Prices:</strong> Can be very low (solar oversupply) or very high (summer AC demand).</p>
      <p><strong>Strategy:</strong> Watch for negative prices. In summer, every MW matters.</p>
    </div>
    <div class="card">
      <h4>&#127750; Evening (6pm&ndash;12am)</h4>
      <p><strong>Demand:</strong> Residential peak. Often the highest demand period.</p>
      <p><strong>Generation mix:</strong> Solar drops to zero. Thermal + hydro + batteries must cover.</p>
      <p><strong>Prices:</strong> Typically the highest of the day &mdash; the "solar cliff" effect.</p>
      <p><strong>Strategy:</strong> Discharge batteries. Deploy hydro. Peakers earn their keep.</p>
    </div>
  </div>

  <h3>How Demand Varies by Season</h3>
  <table>
    <tr>
      <th>Season</th>
      <th>Overnight</th>
      <th>Morning</th>
      <th>Afternoon</th>
      <th>Evening</th>
      <th>Driver</th>
    </tr>
    <tr>
      <td>&#127810; Autumn</td>
      <td>Low</td>
      <td>Moderate</td>
      <td>Moderate</td>
      <td>Moderate&ndash;High</td>
      <td>Mild temps; balanced</td>
    </tr>
    <tr>
      <td>&#10052;&#65039; Winter</td>
      <td>Moderate</td>
      <td>High</td>
      <td>Moderate</td>
      <td>Very High</td>
      <td>Heating demand; short solar days</td>
    </tr>
    <tr>
      <td>&#127800; Spring</td>
      <td>Low</td>
      <td>Low&ndash;Mod</td>
      <td>Low</td>
      <td>Moderate</td>
      <td>Low demand + high renewables</td>
    </tr>
    <tr>
      <td>&#9728;&#65039; Summer</td>
      <td>Moderate</td>
      <td>High</td>
      <td>Very High</td>
      <td>Extreme</td>
      <td>Air conditioning; solar cliff</td>
    </tr>
  </table>

  <div class="highlight">
    <strong>The Solar Cliff:</strong> As solar generation drops off sharply around 5&ndash;6pm, demand is still
    rising (people arriving home, cooking, air conditioning). The grid must rapidly replace gigawatts of solar
    with thermal and storage. This creates a steep price ramp &mdash; the "solar cliff" &mdash; that is one of
    the defining features of modern electricity markets.
  </div>
</div>

<!-- PAGE 6: SEASONS IN THE NEM -->
<div class="page content">
  <h2>5. Seasons in the NEM</h2>

  <p>Australia's electricity market follows distinct seasonal patterns. Each season creates different challenges
  and opportunities for generators, making seasonal awareness critical for bidding strategy.</p>

  <div class="gen-card">
    <div class="gen-header">
      <span class="gen-icon">&#127810;</span>
      <span class="gen-name">Autumn (March&ndash;May)</span>
    </div>
    <div class="gen-desc">
      <p>The "Goldilocks" season &mdash; not too hot, not too cold. Demand is moderate and stable.
      Solar output is still reasonable as summer fades. Wind is generally moderate. Prices tend to be
      stable in the $40&ndash;80/MWh range without dramatic spikes or crashes. This is a good season for
      learning the basics of bidding without extreme conditions.</p>
      <p><strong>Key dynamic:</strong> Stable, predictable market conditions. Consistent coal and gas margins.</p>
    </div>
  </div>

  <div class="gen-card">
    <div class="gen-header">
      <span class="gen-icon">&#10052;&#65039;</span>
      <span class="gen-name">Winter (June&ndash;August)</span>
    </div>
    <div class="gen-desc">
      <p>Heating demand creates elevated evening peaks, especially in southern states (VIC, SA, TAS).
      Short days dramatically reduce solar output &mdash; less generation when demand is high. Wind can
      be strong from cold fronts, providing some relief. Gas generation becomes more important as solar
      contributes less. Evening prices can spike significantly.</p>
      <p><strong>Key dynamic:</strong> Short solar days + heating demand = tight evening supply. Gas and peakers profitable.</p>
    </div>
  </div>

  <div class="gen-card">
    <div class="gen-header">
      <span class="gen-icon">&#127800;</span>
      <span class="gen-name">Spring (September&ndash;November)</span>
    </div>
    <div class="gen-desc">
      <p>The most disruptive season for traditional generators. Demand drops to annual lows while renewable
      output surges &mdash; longer days boost solar, spring winds are often strong. This combination
      frequently causes <strong>oversupply</strong>, driving prices negative during midday. Coal plants
      face a dilemma: bid negative to stay on, or shut down at enormous cost. Batteries thrive by
      charging during negative prices and discharging in the evening.</p>
      <p><strong>Key dynamic:</strong> Negative daytime prices. Oversupply risk. Battery charging opportunity.</p>
    </div>
  </div>

  <div class="gen-card">
    <div class="gen-header">
      <span class="gen-icon">&#9728;&#65039;</span>
      <span class="gen-name">Summer (December&ndash;February)</span>
    </div>
    <div class="gen-desc">
      <p>The season of extremes. Air conditioning drives demand to annual peaks, particularly during
      heatwaves where demand can surge 40% above normal. Solar output is at its annual best but creates
      a dramatic <strong>solar cliff</strong> in the evening. The afternoon-to-evening transition is
      critical &mdash; the grid must replace gigawatts of solar with thermal and storage in just 1&ndash;2
      hours. Coal plants may be derated (output reduced) due to hot cooling water. Price spikes to
      $5,000&ndash;$20,000/MWh are common during heatwave evenings.</p>
      <p><strong>Key dynamic:</strong> Extreme demand + solar cliff = massive evening price spikes. Every MW counts.</p>
    </div>
  </div>

  <div class="highlight-amber">
    <strong>Seasonal Strategy Summary:</strong> In autumn, focus on fundamentals. In winter, target the evening peak.
    In spring, manage oversupply and use batteries. In summer, ensure maximum capacity is available for
    the evening solar cliff &mdash; and bid aggressively during heatwaves.
  </div>
</div>

<!-- PAGE 7: RENEWABLES & THE MERIT ORDER EFFECT -->
<div class="page content">
  <h2>6. Renewables &amp; the Merit Order Effect</h2>

  <p>The entry of large-scale wind and solar has fundamentally reshaped how the NEM operates. Understanding
  the <strong>merit order effect</strong> is key to understanding Australia's energy transition.</p>

  <h3>Zero Marginal Cost</h3>
  <p>Wind and solar have <strong>zero fuel cost</strong> &mdash; once built, the marginal cost of producing
  one more MWh is essentially $0. This means they always sit at the bottom of the merit order, displacing
  more expensive generators and pushing the clearing price down.</p>

  <div class="highlight">
    <strong>The Merit Order Effect:</strong> When renewables flood the market, they push more expensive generators
    (gas, then coal) out of the merit order. The clearing price drops because the marginal generator
    (the most expensive one still dispatched) is now cheaper. More renewables = lower wholesale prices.
  </div>

  <h3>Capacity Factors</h3>
  <p>Unlike thermal generators that can run at full capacity whenever needed, renewables depend on weather:</p>
  <div class="two-col">
    <div class="card">
      <h4>&#127788;&#65039; Wind</h4>
      <ul>
        <li>Capacity factor: <span class="stat">25&ndash;40%</span></li>
        <li>Can generate <strong>24 hours a day</strong></li>
        <li>Output is <strong>variable and unpredictable</strong></li>
        <li>Often strongest at night and during storm fronts</li>
        <li>Can suddenly drop or surge over hours</li>
      </ul>
    </div>
    <div class="card">
      <h4>&#9728;&#65039; Solar</h4>
      <ul>
        <li>Capacity factor: <span class="stat">15&ndash;25%</span></li>
        <li><strong>Daytime only</strong> &mdash; zero overnight</li>
        <li>Highly predictable daily pattern</li>
        <li>Peak output midday; ramps up in morning, down in afternoon</li>
        <li>Varies by season (strongest summer, weakest winter)</li>
      </ul>
    </div>
  </div>

  <h3>The Duck Curve</h3>
  <p>The "duck curve" describes the shape of <strong>net demand</strong> (total demand minus solar generation)
  over a day. It gets its name because the resulting chart looks remarkably like the profile of a duck.
  As solar capacity grows:</p>
  <ol style="padding-left: 1.5rem; margin-bottom: 0.6rem;">
    <li>Midday net demand drops dramatically (the duck's <strong>belly</strong>)</li>
    <li>The evening ramp becomes steeper (the duck's <strong>neck</strong>) as solar drops off</li>
    <li>Evening peak becomes the critical period (the duck's <strong>head</strong>)</li>
    <li>Overnight/early morning demand forms the duck's <strong>tail</strong></li>
  </ol>

  <div class="staircase">
Net Demand                            THE DUCK CURVE
(MW)                            Why is it called "the duck"?

         TAIL                                  HEAD
   &gt;&gt;&gt;&gt;&gt;~.                              _.  .-&ldquo;&rdquo;-.
        / \\   BACK                  /  \\/       \\  &lt; beak
       /   \\                  NECK /              \\
      /     \\                    /                 \\__  FEET
     /       \\      BELLY      / &larr; Solar Cliff!      \\__/
    /         \\               /     (steep ramp!)
   /           \\   ______   /
  /             \\./      \\./
  |              "belly"
  |_______________________________________________
    12am   6am    12pm    6pm    10pm  12am
          Morning  Afternoon  Evening

  The shape traces: a raised tail (overnight demand),
  a sagging belly (midday solar suppresses net demand),
  a steep neck (evening ramp as solar drops off),
  and a raised head (evening peak demand).
  More solar = deeper belly = steeper neck = harder to manage.</div>

  <div class="highlight">
    <strong>Why "Duck"?</strong> The California Independent System Operator (CAISO) first published this
    chart shape around 2013. Engineers noticed the net demand profile &mdash; with its raised ends, sagging
    middle, and steep ramp &mdash; looked exactly like a duck in silhouette. The name stuck globally.
    Australia's NEM now has one of the deepest duck curves in the world, thanks to its world-leading
    rooftop and grid-scale solar penetration.
  </div>

  <h3>How Renewables Push Down Prices</h3>
  <p>Consider a market where coal sets the clearing price at $40/MWh. Now add 2,000 MW of solar at $0:</p>
  <ul>
    <li>Solar displaces 2,000 MW of coal and gas from the merit order</li>
    <li>The marginal generator is now cheaper &mdash; perhaps coal at $35 instead of gas at $75</li>
    <li>The clearing price drops for ALL generators, including the solar itself</li>
    <li>If enough renewables enter, prices can go negative</li>
  </ul>

  <div class="highlight-amber">
    <strong>The Paradox:</strong> Renewables reduce the wholesale price, which reduces their own revenue.
    This is the "cannibalisation effect" &mdash; the more solar you build, the less each MWh of solar
    is worth, because you're all generating at the same time.
  </div>
</div>

<!-- PAGE 8: HYDRO & OPPORTUNITY COST -->
<div class="page content">
  <h2>7. Hydro &amp; Opportunity Cost</h2>

  <p>Hydro is unlike any other generator type. It is cheap to run (SRMC ~$8/MWh), very flexible, and can
  respond almost instantly. But it has one critical constraint: <strong>limited water</strong>.</p>

  <h3>The Water Constraint</h3>
  <p>In the game, each hydro asset has a fixed water allocation (e.g., 1,000 MWh) and can only dispatch in
  <strong>ONE period per round</strong>. This forces a choice: which period offers the best return?</p>

  <div class="highlight">
    <strong>Opportunity Cost Thinking:</strong> The true cost of dispatching hydro is NOT its marginal cost ($8/MWh).
    It is the <strong>value of the water in its next-best use</strong>. If you dispatch hydro during the morning
    at $60/MWh, you cannot dispatch it during the evening when the price might be $200/MWh. The opportunity
    cost of the morning dispatch is $200 &minus; $60 = $140/MWh in foregone profit.
  </div>

  <h3>Optimal Hydro Strategy</h3>
  <ol style="padding-left: 1.5rem; margin-bottom: 0.6rem;">
    <li><strong>Forecast prices</strong> across all periods (which period will have the highest clearing price?)</li>
    <li><strong>Dispatch in the highest-price period</strong> to maximise the spread between clearing price and SRMC</li>
    <li><strong>Bid strategically</strong> &mdash; you can bid at SRMC ($8) to guarantee dispatch, or bid higher to try to push up the clearing price</li>
    <li><strong>Consider scarcity</strong> &mdash; if supply is tight in the evening, your hydro capacity may be critical to meeting demand</li>
  </ol>

  <h3>Real-World Context: Snowy Hydro</h3>
  <p>Snowy Hydro is Australia's largest hydro operator, with ~4,100 MW of capacity across the Snowy Mountains.
  It is one of the NEM's most sophisticated traders, using its flexible water storage to target the
  highest-price periods. Snowy Hydro often bids high enough to <strong>set the clearing price</strong>,
  making it a classic "price maker."</p>

  <div class="two-col">
    <div class="card">
      <h4>&#128167; When Hydro Shines</h4>
      <ul>
        <li>Evening solar cliff &mdash; replacing solar with dispatchable capacity</li>
        <li>Heatwave peaks &mdash; every MW of capacity is valuable</li>
        <li>Supply emergencies &mdash; fast response when other generators trip</li>
        <li>Price spikes &mdash; maximise revenue per MWh of water</li>
      </ul>
    </div>
    <div class="card">
      <h4>&#9888;&#65039; Hydro Risks</h4>
      <ul>
        <li><strong>Drought</strong> &mdash; water allocation may be halved</li>
        <li><strong>Misjudging prices</strong> &mdash; dispatching in the wrong period wastes water</li>
        <li><strong>Opportunity cost error</strong> &mdash; selling cheap when you could have waited</li>
        <li><strong>Environmental constraints</strong> &mdash; minimum flow requirements</li>
      </ul>
    </div>
  </div>

  <div class="key-concept">
    <strong>Key Lesson:</strong> Hydro teaches one of the most important concepts in economics &mdash;
    <strong>opportunity cost</strong>. The cost of any choice is not just what you pay, but what you give up
    by not choosing the next-best alternative. This applies far beyond electricity markets.
  </div>
</div>

<!-- PAGE 9: BATTERY STORAGE & ARBITRAGE -->
<div class="page content">
  <h2>8. Battery Storage &amp; Arbitrage</h2>

  <p>Grid-scale batteries are transforming the NEM. They don't generate electricity &mdash; they shift it
  from low-value periods to high-value periods, profiting from the <strong>price spread</strong>.</p>

  <h3>Charge/Discharge Mechanics</h3>
  <p>Each period, you choose one of three modes for your battery:</p>
  <div class="three-col">
    <div class="card">
      <h4>&#128267; Charge</h4>
      <p>Buy electricity from the market. SOC increases. You <strong>pay</strong> the clearing price
      for each MWh charged.</p>
    </div>
    <div class="card">
      <h4>&#9899; Idle</h4>
      <p>Do nothing. SOC stays the same. No cost, no revenue. Wait for better conditions.</p>
    </div>
    <div class="card">
      <h4>&#9889; Discharge</h4>
      <p>Sell electricity to the market. SOC decreases. You <strong>earn</strong> the clearing price
      for each MWh discharged.</p>
    </div>
  </div>

  <h3>Round-Trip Efficiency</h3>
  <p>Batteries lose <span class="stat">8%</span> of energy in the charge/discharge cycle (92% round-trip efficiency).
  This means:</p>
  <ul>
    <li>Charge 100 MWh &rarr; only 92 MWh available to discharge</li>
    <li>The discharge price must be at least <strong>~8.7% higher</strong> than the charge price to break even</li>
    <li>Example: charge at $50/MWh, must discharge above ~$54.35/MWh to profit</li>
  </ul>

  <h3>State of Charge (SOC)</h3>
  <p>SOC tracks how full the battery is as a percentage (0&ndash;100%). It carries over between periods
  within a round. Managing SOC is critical:</p>
  <ul>
    <li><strong>Too full (100%)</strong> &mdash; cannot charge during unexpectedly cheap periods</li>
    <li><strong>Too empty (0%)</strong> &mdash; cannot discharge during price spikes</li>
    <li><strong>Ideal</strong> &mdash; charge to ~80&ndash;100% before expected peak, discharge to ~10&ndash;20% during peak</li>
  </ul>

  <h3>Negative Price Charging</h3>
  <div class="highlight-green">
    <strong>Getting Paid to Charge:</strong> During negative price periods (common in spring midday),
    the market pays YOU to consume electricity. Batteries charging during -$50/MWh periods earn $50
    per MWh charged, AND get stored energy to sell later at positive prices. This is a double win.
  </div>

  <h3>Arbitrage Calculation</h3>
  <div class="formula">
    <strong>Battery Arbitrage P&amp;L =</strong><br>
    (Discharge Price &times; Discharge MWh) &minus; (Charge Price &times; Charge MWh)<br><br>
    <strong>Where:</strong> Discharge MWh = Charge MWh &times; 0.92 (round-trip efficiency)
  </div>

  <p><strong>Example:</strong> Charge 100 MWh at $20/MWh, discharge 92 MWh at $150/MWh</p>
  <ul>
    <li>Revenue: 92 &times; $150 = $13,800</li>
    <li>Cost: 100 &times; $20 = $2,000</li>
    <li>Profit: <span class="stat">$11,800</span></li>
  </ul>

  <p><strong>Negative price example:</strong> Charge 100 MWh at -$50/MWh, discharge 92 MWh at $200/MWh</p>
  <ul>
    <li>Revenue: 92 &times; $200 = $18,400</li>
    <li>Charge revenue: 100 &times; $50 = $5,000 (paid to charge!)</li>
    <li>Profit: <span class="stat">$23,400</span></li>
  </ul>

  <h3>The Park Spread &amp; Battery Utilisation</h3>
  <p>While one-off price spikes can deliver spectacular single-day profits, the real question for battery
  economics is: <strong>are there enough hours of sufficient arbitrage value to justify the investment?</strong></p>

  <div class="highlight-amber">
    <strong>Park Spread:</strong> The "park spread" refers to the average price difference between the
    periods a battery charges and discharges, adjusted for efficiency losses. It is the battery equivalent
    of a gas plant's "spark spread." A battery needs a consistent park spread &mdash; not just occasional
    spikes &mdash; to repay its capital cost over its 15&ndash;20 year asset life.
  </div>

  <p>The core challenge is <strong>utilisation</strong>. A 200 MW / 400 MWh battery that only cycles
  profitably on 100 days per year earns far less than one that finds a viable spread on 300+ days. Key factors:</p>
  <ul>
    <li><strong>Daily cycling:</strong> Batteries aim to charge and discharge at least once per day. A 2-hour
    battery can cycle 1&ndash;2 times; a 4-hour battery typically once.</li>
    <li><strong>Seasonal variation:</strong> Spring offers deep negative midday prices (great spreads), while
    autumn may see flat prices with limited arbitrage opportunities.</li>
    <li><strong>Revenue stacking:</strong> In practice, batteries earn from multiple sources &mdash; energy
    arbitrage, FCAS (frequency control), and network services &mdash; to improve overall utilisation.</li>
    <li><strong>Degradation:</strong> Batteries lose ~1&ndash;2% of capacity per year from cycling. Over a
    15&ndash;20 year life, total usable capacity declines, meaning early-year economics matter most.</li>
  </ul>

  <div class="key-concept">
    <strong>The Investment Test:</strong> A battery's economics are determined by the <em>cumulative</em>
    arbitrage value over its lifetime, not any single event. A spectacular $50,000 profit on a heatwave day
    helps, but what matters is the average annual revenue across 15&ndash;20 years of operation. The question
    is always: does the total lifetime revenue (discounted back to today) exceed the upfront capital cost?
    In 2025, a grid-scale battery costs roughly <span class="stat">$800k&ndash;$1.2M per MWh</span> installed.
    At a 2-hour duration, a 200 MW system costs $320&ndash;$480 million &mdash; it needs consistent daily
    spreads to pay that back within its useful life.
  </div>
</div>

<!-- PAGE 10: PUMPED HYDRO -->
<div class="page content">
  <h2>9. Pumped Hydro Energy Storage</h2>

  <p>Pumped hydro is <strong>not featured in the game</strong>, but it plays a critical role in the real NEM
  and acts similarly to a battery in storing and shifting energy. Understanding how it compares to batteries
  completes the storage picture.</p>

  <h3>How Pumped Hydro Works</h3>
  <p>Pumped hydro uses two reservoirs at different elevations. When electricity is cheap, water is
  <strong>pumped uphill</strong> to the upper reservoir (charging). When electricity is expensive, water
  flows <strong>downhill through turbines</strong> to generate power (discharging). The principle is identical
  to a battery: buy low, sell high, minus efficiency losses (~75&ndash;85% round-trip efficiency).</p>

  <div class="two-col">
    <div class="card">
      <h4>&#128267; Grid-Scale Battery</h4>
      <ul>
        <li>Duration: <span class="stat">2&ndash;4 hours</span> (typical)</li>
        <li>Capacity: <span class="stat">100&ndash;850 MW</span></li>
        <li>Efficiency: <span class="stat">85&ndash;92%</span></li>
        <li>Asset life: <span class="stat">15&ndash;20 years</span></li>
        <li>Build time: <span class="stat">1&ndash;3 years</span></li>
        <li>Capital cost: lower per MW, higher per MWh</li>
        <li>Response time: milliseconds</li>
      </ul>
    </div>
    <div class="card">
      <h4>&#128167; Pumped Hydro</h4>
      <ul>
        <li>Duration: <span class="stat">8&ndash;175 hours</span></li>
        <li>Capacity: <span class="stat">250&ndash;2,000 MW</span></li>
        <li>Efficiency: <span class="stat">75&ndash;85%</span></li>
        <li>Asset life: <span class="stat">80&ndash;100+ years</span></li>
        <li>Build time: <span class="stat">5&ndash;10 years</span></li>
        <li>Capital cost: very high upfront, low per MWh at scale</li>
        <li>Response time: minutes</li>
      </ul>
    </div>
  </div>

  <div class="highlight">
    <strong>The Key Difference: Duration.</strong> A typical NEM battery stores 2&ndash;4 hours of energy &mdash;
    enough to bridge the evening solar cliff. Pumped hydro stores <em>days to weeks</em> of energy. Snowy 2.0's
    350 GWh reservoir can sustain 2,000 MW output for over <strong>175 hours</strong> (more than a week).
    This makes pumped hydro essential for managing multi-day weather events like dunkelflaute, where batteries
    would be depleted within hours.
  </div>

  <h3>Australia's Pumped Hydro Projects</h3>
  <div class="gen-card">
    <div class="gen-header">
      <span class="gen-icon">&#9968;</span>
      <span class="gen-name">Snowy 2.0 (NSW)</span>
    </div>
    <div class="gen-stats">
      <span class="stat">2,000 MW</span>
      <span class="stat">350 GWh</span>
      <span class="stat">175 hours</span>
      <span class="stat">~$12 billion</span>
    </div>
    <div class="gen-desc">
      Links the Tantangara and Talbingo reservoirs through a 27 km tunnel to an underground power station.
      Expected to be fully operational by 2028&ndash;29 with a projected asset life of <strong>100+ years</strong>.
      Will have five times more storage than all of Australia's current grid batteries combined.
    </div>
  </div>

  <div class="gen-card">
    <div class="gen-header">
      <span class="gen-icon">&#9968;</span>
      <span class="gen-name">Borumba (QLD)</span>
    </div>
    <div class="gen-stats">
      <span class="stat">2,000 MW</span>
      <span class="stat">48 GWh</span>
      <span class="stat">24 hours</span>
      <span class="stat">~$14.2 billion</span>
    </div>
    <div class="gen-desc">
      Being developed by Queensland Hydro, one of the largest pumped hydro facilities in the world.
      24 hours of storage duration &mdash; enough to provide dispatchable power across an entire day.
      Currently in early works with bipartisan political support.
    </div>
  </div>

  <h3>Why Both Storage Types Are Needed</h3>
  <p>Batteries and pumped hydro are <strong>complementary, not competing</strong> technologies:</p>
  <ul>
    <li><strong>Batteries</strong> excel at fast response (milliseconds), daily cycling, frequency control,
    and bridging the 2&ndash;4 hour evening solar cliff. They are quick to build and costs are falling rapidly.</li>
    <li><strong>Pumped hydro</strong> excels at multi-day storage, seasonal energy shifting, and providing
    the deep reserves needed for extended low-renewable periods. Their 80&ndash;100 year asset life means
    the capital cost is spread across multiple generations.</li>
  </ul>

  <div class="highlight-amber">
    <strong>Capital Intensity vs. Longevity:</strong> Pumped hydro projects are hugely capital intensive &mdash;
    Snowy 2.0 and Borumba each cost $12&ndash;14 billion. But spread over 100 years of operation, the per-year cost
    is far lower than replacing batteries every 15&ndash;20 years. A battery installed today might be replaced
    5&ndash;6 times within a single pumped hydro asset's lifetime. The NEM needs both: batteries for the daily
    grind, pumped hydro for the long haul.
  </div>
</div>

<!-- PAGE 11: BIDDING STRATEGIES -->
<div class="page content">
  <h2>10. Bidding Strategies</h2>

  <p>The game offers six core bidding strategies. Each has strengths, weaknesses, and situations where it
  is optimal. Mastering when to use each strategy is the key to winning.</p>

  <div class="gen-card">
    <div class="gen-header">
      <span class="gen-icon">&#127919;</span>
      <span class="gen-name">1. Price Taker</span>
    </div>
    <div class="gen-desc">
      <p><strong>How it works:</strong> Bid at $0/MWh for all capacity. You guarantee dispatch regardless
      of market conditions and earn whatever the clearing price turns out to be.</p>
      <p><strong>Strengths:</strong> Zero risk of missing dispatch. Maximum volume of generation.
      In tight markets, you still earn high prices because others set the clearing price above you.</p>
      <p><strong>Weaknesses:</strong> You have zero influence on the clearing price. In oversupply,
      you may earn very low or negative prices. Cannot protect against losses when prices fall below SRMC.</p>
      <p><strong>Best when:</strong> Supply is already tight and you will be dispatched regardless.
      When you want certainty over speculation.</p>
    </div>
  </div>

  <div class="gen-card">
    <div class="gen-header">
      <span class="gen-icon">&#128200;</span>
      <span class="gen-name">2. SRMC Bidder (Marginal Cost)</span>
    </div>
    <div class="gen-desc">
      <p><strong>How it works:</strong> Bid at your Short Run Marginal Cost. Coal at ~$35, Gas CCGT at ~$75,
      Peaker at ~$140. This is the "textbook" economically efficient strategy.</p>
      <p><strong>Strengths:</strong> You never run at a loss (you only get dispatched when the price covers
      your costs). Economically efficient &mdash; the strategy competitive markets are designed to incentivise.</p>
      <p><strong>Weaknesses:</strong> Leaves money on the table when supply is tight. Others bidding aggressively
      may earn more while you play it safe.</p>
      <p><strong>Best when:</strong> The market is competitive with many bidders. When you want a safe
      balance of risk and reward.</p>
    </div>
  </div>

  <div class="gen-card">
    <div class="gen-header">
      <span class="gen-icon">&#128176;</span>
      <span class="gen-name">3. Price Maker</span>
    </div>
    <div class="gen-desc">
      <p><strong>How it works:</strong> Bid some or all capacity well above SRMC &mdash; even up to
      $5,000&ndash;$20,000/MWh. If your bid sets the clearing price, ALL your dispatched capacity
      (including units that bid lower) earns the inflated price.</p>
      <p><strong>Strengths:</strong> Enormous profit potential during tight supply. Can single-handedly
      push up the clearing price. Mimics real-world "market power" strategies.</p>
      <p><strong>Weaknesses:</strong> If supply is abundant, you get undercut and miss dispatch entirely.
      High risk, high reward. Other teams may copy the strategy, causing chaos.</p>
      <p><strong>Best when:</strong> Supply is tight (reserve margin is low). You have a large share of
      remaining capacity. Heatwave or outage scenarios.</p>
    </div>
  </div>

  <div class="gen-card">
    <div class="gen-header">
      <span class="gen-icon">&#128161;</span>
      <span class="gen-name">4. Portfolio Optimiser</span>
    </div>
    <div class="gen-desc">
      <p><strong>How it works:</strong> Use different strategies for different assets. Bid renewables at $0
      (guaranteed revenue), coal at SRMC (safe margin), and peakers aggressively high (target price spikes).
      Optimise the <em>total portfolio</em> rather than each asset independently.</p>
      <p><strong>Strengths:</strong> Diversification reduces risk. If one strategy fails, others compensate.
      Mirrors how real gentailers (AGL, Origin) operate their diverse asset portfolios.</p>
      <p><strong>Weaknesses:</strong> More complex to manage. Requires understanding of how each asset
      type contributes to overall profitability.</p>
      <p><strong>Best when:</strong> You have a diverse portfolio of assets. Mid-to-late game when you
      understand each asset's role.</p>
    </div>
  </div>

  <div class="gen-card">
    <div class="gen-header">
      <span class="gen-icon">&#128683;</span>
      <span class="gen-name">5. Capacity Repricing</span>
    </div>
    <div class="gen-desc">
      <p><strong>How it works:</strong> Reprice 20&ndash;30% of your capacity to higher bands
      (bid it at very high prices so it is unlikely to be dispatched). This tightens supply, pushing up the
      clearing price for your remaining dispatched units.</p>
      <p><strong>Strengths:</strong> Can significantly increase the clearing price. The higher price on
      remaining capacity may more than compensate for the volume lost from repricing.</p>
      <p><strong>Weaknesses:</strong> Risky &mdash; if other teams increase supply, you lose volume without
      gaining price. In competitive markets, economic withholding is punished. The AER actively monitors for this behaviour
      in real markets.</p>
      <p><strong>Best when:</strong> You have significant market share. Supply is near demand. Few competitors
      can backfill the repriced capacity.</p>
    </div>
  </div>

  <div class="gen-card">
    <div class="gen-header">
      <span class="gen-icon">&#128267;</span>
      <span class="gen-name">6. Battery Arbitrageur</span>
    </div>
    <div class="gen-desc">
      <p><strong>How it works:</strong> Charge during cheap or negative-price periods (overnight, spring midday),
      discharge during expensive periods (evening peak, heatwave afternoons). Profit from the spread minus
      the 8% round-trip efficiency loss.</p>
      <p><strong>Strengths:</strong> Can profit from both positive AND negative price swings. During negative
      prices, you earn money from charging AND from later discharge. Not dependent on being "right" about
      absolute price levels &mdash; only the spread matters.</p>
      <p><strong>Weaknesses:</strong> Requires price volatility to be profitable. If prices are flat across
      all periods, batteries earn nothing. SOC management can be tricky.</p>
      <p><strong>Best when:</strong> Large price differences exist between periods. Spring (negative midday,
      positive evening). Summer (cheap afternoon solar, expensive evening cliff).</p>
    </div>
  </div>
</div>

<!-- PAGE 11: MARKET SCENARIOS -->
<div class="page content">
  <h2>11. Market Scenarios</h2>

  <p>The game features real-world-inspired scenarios that change market conditions mid-game. Each tests
  different strategic responses and teaches important lessons about NEM dynamics.</p>

  <div class="gen-card">
    <div class="gen-header">
      <span class="gen-icon">&#128293;</span>
      <span class="gen-name">Heatwave</span>
    </div>
    <div class="gen-desc">
      <strong>Effect:</strong> Demand surges +40% from air conditioning. Coal plants derated ~10% due to
      hot cooling water. Supply tightens dramatically.<br>
      <strong>Lesson:</strong> Scarcity pricing in action. When reserve margins collapse, prices spike to
      $5,000&ndash;$20,000/MWh. Every MW of available capacity is extremely valuable. Price maker strategies
      can be highly profitable.
    </div>
  </div>

  <div class="two-col">
    <div class="gen-card">
      <div class="gen-header">
        <span class="gen-icon">&#10052;&#65039;</span>
        <span class="gen-name">Cold Snap</span>
      </div>
      <div class="gen-desc">
        <strong>Effect:</strong> Winter heating demand spikes, especially in evening.<br>
        <strong>Lesson:</strong> Winter demand peaks are real but less extreme than summer. Gas and peakers become
        more valuable. Short solar days compound the evening supply challenge.
      </div>
    </div>
    <div class="gen-card">
      <div class="gen-header">
        <span class="gen-icon">&#127800;</span>
        <span class="gen-name">Spring Oversupply</span>
      </div>
      <div class="gen-desc">
        <strong>Effect:</strong> Prices go negative as renewables flood the market during low demand.<br>
        <strong>Lesson:</strong> Negative prices teach that electricity has no storage value without batteries.
        Coal plants face agonising decisions about whether to shut down. Batteries thrive.
      </div>
    </div>
  </div>

  <div class="two-col">
    <div class="gen-card">
      <div class="gen-header">
        <span class="gen-icon">&#128167;</span>
        <span class="gen-name">Drought</span>
      </div>
      <div class="gen-desc">
        <strong>Effect:</strong> Hydro capacity halved due to low water levels.<br>
        <strong>Lesson:</strong> Water scarcity amplifies opportunity cost. With half the water,
        choosing the right period becomes even more critical. Drought years in the NEM have historically
        seen elevated prices.
      </div>
    </div>
    <div class="gen-card">
      <div class="gen-header">
        <span class="gen-icon">&#128168;</span>
        <span class="gen-name">Gas Crisis</span>
      </div>
      <div class="gen-desc">
        <strong>Effect:</strong> Gas fuel costs increase +60%, raising SRMC for CCGT and peaker plants.<br>
        <strong>Lesson:</strong> Fuel price shocks ripple through the merit order. Gas plants bid higher,
        pushing up the clearing price for ALL generators. Coal and renewables benefit from higher prices
        while gas profits shrink despite higher revenues.
      </div>
    </div>
  </div>

  <div class="two-col">
    <div class="gen-card">
      <div class="gen-header">
        <span class="gen-icon">&#127780;</span>
        <span class="gen-name">Dunkelflaute</span>
      </div>
      <div class="gen-desc">
        <strong>Effect:</strong> Wind at ~10% capacity and solar at ~40%. Renewables nearly absent.<br>
        <strong>Lesson:</strong> "Dark doldrums" expose the limits of weather-dependent generation.
        Thermal generators and storage must carry the entire load. Highlights why a 100% renewable grid
        needs massive storage or firm capacity backup.
      </div>
    </div>
    <div class="gen-card">
      <div class="gen-header">
        <span class="gen-icon">&#127981;</span>
        <span class="gen-name">Plant Outage</span>
      </div>
      <div class="gen-desc">
        <strong>Effect:</strong> A random asset goes offline unexpectedly.<br>
        <strong>Lesson:</strong> Real NEM plants trip frequently. Losing a large coal unit (500+ MW) during
        peak demand can cause extreme price spikes. Portfolio diversification protects against single-asset risk.
      </div>
    </div>
  </div>

  <div class="gen-card">
    <div class="gen-header">
      <span class="gen-icon">&#127757;</span>
      <span class="gen-name">Carbon Price ($50/tonne)</span>
    </div>
    <div class="gen-desc">
      <strong>Effect:</strong> Adds ~$45&ndash;50/MWh to coal SRMC, ~$20&ndash;25/MWh to gas SRMC. Completely
      reshuffles the merit order &mdash; coal may now be more expensive than gas CCGT.<br>
      <strong>Lesson:</strong> Carbon pricing is the most powerful policy lever for the energy transition. By
      internalising the cost of emissions, it changes the economic order of dispatch. Renewables and storage
      become relatively cheaper. Coal becomes uneconomic at carbon prices above ~$30&ndash;40/tonne.
    </div>
  </div>
</div>

<!-- PAGE 12: THE ENERGY TRANSITION -->
<div class="page content">
  <h2>12. The Energy Transition</h2>

  <p>The game's progression mirrors the real transformation of Australia's electricity system. Understanding
  this context gives the market dynamics you experienced a much richer meaning.</p>

  <h3>&#127981; The Coal Era (1998&ndash;2008)</h3>
  <p>When the NEM began, coal provided around <span class="stat">85%</span> of generation. Wholesale prices
  were relatively stable at <span class="stat">$25&ndash;40/MWh</span>. The merit order was simple: cheap
  coal at the bottom, gas peakers at the top, and modest demand growth made planning straightforward.</p>

  <h3>&#127793; The Transition Begins (2009&ndash;2017)</h3>
  <p>The Renewable Energy Target drove wind and solar investment. Key milestones:</p>
  <ul>
    <li>Carbon pricing trial (2012&ndash;14) briefly reshuffled the merit order</li>
    <li>South Australia's last coal plant closed (2016)</li>
    <li>Hazelwood closed in Victoria (2017) &mdash; 1,600 MW of brown coal removed</li>
    <li>Tesla's Big Battery installed in SA (2017) &mdash; grid-scale storage arrives</li>
    <li>Gas prices rose as LNG exports competed for domestic supply</li>
  </ul>

  <h3>&#9889; The Renewable Surge (2018&ndash;Present)</h3>
  <p>Renewables became the cheapest new-build generation. Transformative changes:</p>
  <ul>
    <li>Over <span class="stat">20 GW</span> of wind and solar connected to the NEM</li>
    <li>Coal's share dropped from 85% to approximately <span class="stat">47%</span></li>
    <li>Negative daytime prices became routine in spring</li>
    <li>Grid-scale batteries grew from near zero to over <span class="stat">4 GW</span></li>
    <li>The 2022 energy crisis saw record prices and AEMO suspended the spot market for the first time</li>
    <li>The duck curve deepened every year as more solar was added</li>
  </ul>

  <h3>&#128302; The Storage Revolution &amp; Future Outlook (2025&ndash;2035)</h3>
  <div class="two-col">
    <div class="card">
      <h4>What's Happening</h4>
      <ul>
        <li>Coal exits accelerating &mdash; most plants setting closure dates</li>
        <li>Snowy 2.0 pumped hydro under construction (2,000 MW)</li>
        <li>Continued battery deployment at grid scale</li>
        <li>Renewable Energy Zones &mdash; coordinated transmission corridors</li>
      </ul>
    </div>
    <div class="card">
      <h4>What's Coming</h4>
      <ul>
        <li>Electrification (EVs, heat pumps) may increase demand 50%+</li>
        <li>Market redesign for a renewables-dominated grid</li>
        <li>New capacity mechanisms and ancillary services</li>
        <li>The challenge: reliability + affordability + zero emissions</li>
      </ul>
    </div>
  </div>

  <h3>The Duck Curve Evolution</h3>
  <p>As solar penetration has grown, the duck curve has deepened dramatically:</p>
  <div class="staircase">
Net Demand
(MW)
  |  2015:  ___/\\_______________/\\___      (shallow dip)
  |        /                        \\
  |  2020:  ___/\\______       ______/\\___    (moderate duck)
  |        /          \\     /            \\
  |  2025:  ___/\\___    \\___/    _________/\\___  (deep duck)
  |        /       \\          /                \\
  |  2030?: ___/\\    \\________/     ___________/\\___  (very deep)
  |        /    \\             /                    \\
  |_______/_____\\_____________/______________________\\___
         6am   12pm        6pm                    12am
         Solar ramp &uarr;  Solar cliff &darr;  Evening peak</div>

  <div class="highlight-amber">
    <strong>The Central Question:</strong> How do you maintain reliable supply and reasonable prices while
    transitioning to a zero-emissions electricity system? The same tension you experienced in the game &mdash;
    balancing competition, profitability, and market outcomes &mdash; is the central challenge facing
    Australia's energy policymakers today.
  </div>
</div>

<!-- PAGE 13: NEM GRID EVOLUTION -->
<div class="page content">
  <h2>13. The Real NEM: From Centralised Giants to a Distributed Grid</h2>

  <p>The game gives you a handful of generators per team. The real NEM has undergone a dramatic transformation
  in the sheer <strong>number and type of assets</strong> connected to the grid &mdash; and understanding this
  shift is key to understanding the energy transition.</p>

  <h3>Historical Evolution: Asset Count by Era</h3>
  <table>
    <tr>
      <th>Era</th>
      <th>Period</th>
      <th>Grid-Scale Assets</th>
      <th>Avg Size (MW)</th>
      <th>Character</th>
    </tr>
    <tr>
      <td>&#127981; Coal Era</td>
      <td>1998&ndash;2008</td>
      <td>~50&ndash;60 large plants</td>
      <td>500&ndash;750</td>
      <td>Few, large, centralised. ~30 GW total. Coal provided ~85% of generation from ~25 plants.</td>
    </tr>
    <tr>
      <td>&#127793; Early Transition</td>
      <td>2009&ndash;2017</td>
      <td>~120&ndash;150 facilities</td>
      <td>100&ndash;400</td>
      <td>Wind farms arriving at 200&ndash;400 MW. First solar farms at 50&ndash;150 MW. Coal retirements begin. Tesla Big Battery (100 MW) arrives 2017.</td>
    </tr>
    <tr>
      <td>&#9889; Renewable Surge</td>
      <td>2018&ndash;2023</td>
      <td>~350&ndash;450 facilities</td>
      <td>50&ndash;300</td>
      <td>Rapid wind &amp; solar build-out. 20+ GW of renewables connected. First large batteries. Coal's share falls to ~50%.</td>
    </tr>
    <tr>
      <td>&#128267; Storage Revolution</td>
      <td>2024&ndash;2026</td>
      <td>~550&ndash;650+ facilities</td>
      <td>50&ndash;200</td>
      <td>Battery deployment explodes. 11 large batteries in 2025 alone. Renewables hit 51% of generation. 5+ GW of BESS installed.</td>
    </tr>
  </table>

  <div class="highlight">
    <strong>The Multiplier Effect:</strong> Why does a grid transitioning to renewables need so many more assets?
    Two reasons. First, <strong>capacity factor</strong>: a coal plant runs at 80&ndash;90% capacity factor, while
    wind averages 25&ndash;40% and solar 15&ndash;25%. To replace 1,000 MW of always-on coal, you need roughly
    2,500&ndash;4,000 MW of installed renewable capacity to produce the same energy over a year. Second,
    <strong>average project size is smaller</strong>: a coal plant is 500&ndash;2,000 MW, while a typical solar farm
    is 100&ndash;300 MW and a wind farm is 200&ndash;500 MW. So you need more MW AND each project delivers fewer
    MW. The result: many more individual assets on the grid.
  </div>

  <p>On top of this, <strong>batteries are needed to shift renewable energy</strong> from when it's generated
  (daytime solar, variable wind) to when it's needed (evening peak). Every GW of solar that causes
  a deeper duck curve belly needs storage to fill the evening gap. More renewables = more batteries = even
  more assets on the grid.</p>

  <h3>Major Projects: 2024&ndash;2025</h3>
  <p>The past two years have seen record deployment across all clean energy categories:</p>

  <h4>&#128267; Grid-Scale Batteries Commissioned</h4>
  <table>
    <tr>
      <th>Project</th>
      <th>State</th>
      <th>Capacity</th>
      <th>Duration</th>
    </tr>
    <tr><td>Waratah Super Battery (Stage 1)</td><td>NSW</td><td>350 MW / 700 MWh</td><td>2 hr</td></tr>
    <tr><td>Melbourne Renewable Energy Hub</td><td>VIC</td><td>600 MW / 1,600 MWh</td><td>2&ndash;4 hr</td></tr>
    <tr><td>Western Downs BESS (Stages 1&ndash;2)</td><td>QLD</td><td>540 MW / 1,080 MWh</td><td>2 hr</td></tr>
    <tr><td>Eraring BESS</td><td>NSW</td><td>460 MW / 1,073 MWh</td><td>2 hr</td></tr>
    <tr><td>Tarong BESS</td><td>QLD</td><td>300 MW / 600 MWh</td><td>2 hr</td></tr>
    <tr><td>Brendale BESS</td><td>QLD</td><td>205 MW / 410 MWh</td><td>2 hr</td></tr>
    <tr><td>Templers BESS</td><td>SA</td><td>111 MW / 270 MWh</td><td>2 hr</td></tr>
  </table>
  <p style="font-size: 0.8rem; color: #718096;">In total, ~3.8 GW / 8.6 GWh of new batteries entered the NEM in 2024&ndash;2025 &mdash;
  Australia surpassed the UK to become the world's third-largest utility battery market.</p>

  <h4>&#127788;&#65039; Wind Farms Commissioned / Commissioning</h4>
  <table>
    <tr>
      <th>Project</th>
      <th>State</th>
      <th>Capacity</th>
    </tr>
    <tr><td>MacIntyre Wind Farm</td><td>QLD</td><td>923 MW</td></tr>
    <tr><td>Golden Plains Wind Farm East</td><td>VIC</td><td>756 MW</td></tr>
    <tr><td>Clarke Creek Wind Farm (Stage 1)</td><td>QLD</td><td>450 MW</td></tr>
    <tr><td>Rye Park Wind Farm</td><td>NSW</td><td>396 MW</td></tr>
    <tr><td>Wambo Wind Farm (Stage 1)</td><td>QLD</td><td>252 MW</td></tr>
    <tr><td>Goyder South Wind Farm</td><td>SA</td><td>196 MW</td></tr>
  </table>

  <h4>&#9728;&#65039; Solar Farms Commissioned / Commissioning</h4>
  <table>
    <tr>
      <th>Project</th>
      <th>State</th>
      <th>Capacity</th>
    </tr>
    <tr><td>Stubbo Solar Farm</td><td>NSW</td><td>520 MW</td></tr>
    <tr><td>Culcairn Solar Farm</td><td>NSW</td><td>440 MW</td></tr>
    <tr><td>Walla Walla Solar Farm 1 &amp; 2</td><td>NSW</td><td>353 MW</td></tr>
    <tr><td>Wollar Solar Farm</td><td>NSW</td><td>280 MW</td></tr>
  </table>

  <h3>&#128302; 2030 Forecast: What the Grid Will Look Like</h3>
  <p>AEMO's Integrated System Plan projects a dramatically different grid by 2030:</p>

  <table>
    <tr>
      <th>Technology</th>
      <th>2025 (Current)</th>
      <th>2030 (Forecast)</th>
      <th>Change</th>
    </tr>
    <tr>
      <td>&#127981; Coal</td>
      <td>~21 GW (15 plants)</td>
      <td>~10&ndash;14 GW (8&ndash;10 plants)</td>
      <td>&#8595; Retiring at pace; avg age 38+ years</td>
    </tr>
    <tr>
      <td>&#128293; Gas (CCGT + Peaker)</td>
      <td>~11 GW</td>
      <td>~12&ndash;15 GW</td>
      <td>&#8596; Stable; some new peakers for firming</td>
    </tr>
    <tr>
      <td>&#127788;&#65039; Wind</td>
      <td>~12 GW</td>
      <td>~26 GW</td>
      <td>&#8593; More than doubling</td>
    </tr>
    <tr>
      <td>&#9728;&#65039; Grid-Scale Solar</td>
      <td>~11 GW</td>
      <td>~32 GW</td>
      <td>&#8593; Nearly tripling</td>
    </tr>
    <tr>
      <td>&#9728;&#65039; Rooftop Solar</td>
      <td>~25 GW</td>
      <td>~36 GW</td>
      <td>&#8593; Still growing fast</td>
    </tr>
    <tr>
      <td>&#128167; Hydro</td>
      <td>~8 GW</td>
      <td>~10 GW (incl. Snowy 2.0)</td>
      <td>&#8593; Snowy 2.0 adds 2 GW</td>
    </tr>
    <tr>
      <td>&#128267; Grid-Scale Storage</td>
      <td>~5 GW</td>
      <td>~27 GW</td>
      <td>&#8593;&#8593; Massive expansion needed</td>
    </tr>
    <tr>
      <td colspan="2"><strong>Total Installed Capacity</strong></td>
      <td><strong>~92 GW &rarr; ~160+ GW</strong></td>
      <td>&#8593;&#8593; Nearly doubling in 5 years</td>
    </tr>
  </table>

  <div class="highlight-green">
    <strong>The Proportional Shift:</strong> In 2025, coal and gas represent roughly <span class="stat">35%</span>
    of installed capacity with renewables + storage at <span class="stat">65%</span>. By 2030, fossil fuels
    will be approximately <span class="stat">15&ndash;18%</span> of installed capacity, with renewables + storage
    at <span class="stat">82&ndash;85%</span>. But because coal and gas have higher capacity factors and run
    on demand, their share of actual <em>generation</em> will still be significant (~20&ndash;30%) until
    sufficient storage is built to shift renewable energy to whenever it's needed.
  </div>

  <div class="highlight-red">
    <strong>The Pipeline is Enormous:</strong> As of late 2025, AEMO reported a record <span class="stat">56.6 GW</span>
    of new generation and storage in the NEM development pipeline across 275 projects &mdash; with storage comprising
    26.1 GW (almost half). A further 75 battery projects alone representing 13 GW / 34.7 GWh are financially
    committed or under construction. The grid of 2030 will have hundreds more individual assets than today,
    managed by increasingly sophisticated market software and forecasting.
  </div>

  <div class="key-concept">
    <strong>From Dozens to Thousands:</strong> The NEM has evolved from ~50 large centralised generators to
    a grid with 650+ utility-scale facilities plus ~3.5 million rooftop solar systems. By 2030, the number of
    grid-scale assets alone could exceed 800&ndash;1,000. This shift from centralised to distributed generation
    is not just a technology change &mdash; it's a fundamental redesign of how electricity markets operate.
    The game's merit order still applies, but managing it with hundreds of variable generators and storage
    assets is an entirely different challenge than dispatching 50 coal plants.
  </div>
</div>

<!-- PAGE 14: KEY FORMULAS -->
<div class="page content">
  <h2>14. Key Formulas</h2>

  <h3>Generator Profit</h3>
  <div class="formula">
    <strong>Profit = (Clearing Price &minus; SRMC) &times; Dispatched MW &times; Hours</strong>
  </div>
  <p><strong>Example:</strong> Coal plant (SRMC $35) dispatched at 500 MW for 6 hours when clearing price is $80/MWh:</p>
  <p>Profit = ($80 &minus; $35) &times; 500 &times; 6 = $45 &times; 3,000 = <span class="stat">$135,000</span></p>

  <h3>Battery Arbitrage P&amp;L</h3>
  <div class="formula">
    <strong>Battery P&amp;L = (Discharge Price &times; Discharge MWh) &minus; (Charge Price &times; Charge MWh)</strong><br><br>
    Where: Discharge MWh = Charge MWh &times; 0.92 (round-trip efficiency)
  </div>
  <p><strong>Example:</strong> Charge 400 MWh at $20/MWh, discharge 368 MWh (400 &times; 0.92) at $180/MWh:</p>
  <p>P&amp;L = (368 &times; $180) &minus; (400 &times; $20) = $66,240 &minus; $8,000 = <span class="stat">$58,240</span></p>

  <h3>Break-Even Discharge Price</h3>
  <div class="formula">
    <strong>Break-Even Discharge = Charge Price &divide; 0.92</strong>
  </div>
  <p><strong>Example:</strong> Charged at $50/MWh &rarr; must discharge above $50 &divide; 0.92 = <span class="stat">$54.35/MWh</span> to profit.</p>
  <p>If charged at -$30/MWh (paid to charge) &rarr; break-even is -$30 &divide; 0.92 = -$32.61. Any positive discharge price is profitable!</p>

  <h3>Capacity Factor</h3>
  <div class="formula">
    <strong>Capacity Factor = Actual Output &divide; (Nameplate Capacity &times; Time Period)</strong>
  </div>
  <p><strong>Example:</strong> A 200 MW wind farm generates 60 MW on average over a day:</p>
  <p>Capacity Factor = 60 &divide; 200 = <span class="stat">30%</span></p>

  <h3>Reserve Margin</h3>
  <div class="formula">
    <strong>Reserve Margin = (Available Supply &minus; Demand) &divide; Demand &times; 100%</strong>
  </div>
  <p><strong>Example:</strong> Available supply 8,000 MW, demand 7,200 MW:</p>
  <p>Reserve Margin = (8,000 &minus; 7,200) &divide; 7,200 &times; 100% = <span class="stat">11.1%</span></p>
  <p>Below ~10% reserve margin, prices typically spike. Below 5%, extreme scarcity pricing begins.</p>

  <h3>Opportunity Cost (Hydro)</h3>
  <div class="formula">
    <strong>Opportunity Cost = Revenue from Best Alternative &minus; Revenue from Chosen Action</strong>
  </div>
  <p><strong>Example:</strong> Dispatch hydro (250 MW, 6 hrs) in the morning at $60/MWh instead of evening at $200/MWh:</p>
  <p>Morning revenue: 250 &times; 6 &times; ($60 &minus; $8) = $780,000</p>
  <p>Evening revenue: 250 &times; 6 &times; ($200 &minus; $8) = $2,880,000</p>
  <p>Opportunity cost: $2,880,000 &minus; $780,000 = <span class="stat">$2,100,000</span></p>
</div>

<!-- PAGE 14: GLOSSARY -->
<div class="page content">
  <h2>15. Glossary</h2>

  <div class="two-col">
    <div>
      <p><strong>AEMO</strong> &mdash; Australian Energy Market Operator. The independent body that runs the NEM
      dispatch engine, manages system security, and ensures supply meets demand in real time.</p>

      <p><strong>Bid Band</strong> &mdash; A price/quantity pair in a generator's offer. Generators can submit
      multiple bid bands to split capacity at different prices (up to 10 bands in the real NEM).</p>

      <p><strong>Capacity Factor</strong> &mdash; The ratio of actual output to maximum possible output over a period.
      A 30% capacity factor means the generator produces 30% of what it could if running at full power 24/7.</p>

      <p><strong>Clearing Price</strong> &mdash; The price of the last (most expensive) generator dispatched to meet
      demand. All dispatched generators receive this price (uniform pricing).</p>

      <p><strong>Dispatch</strong> &mdash; The process of AEMO selecting which generators run to meet demand.
      Generators are dispatched in merit order (cheapest first) every 5 minutes.</p>

      <p><strong>Duck Curve</strong> &mdash; The shape of net demand (total demand minus solar) over a day:
      low midday (solar surplus), steep evening ramp as solar drops off (the "neck" of the duck).</p>

      <p><strong>Dunkelflaute</strong> &mdash; German for "dark doldrums." An extended period of simultaneously
      low wind AND low solar output, requiring thermal and storage to carry the full load.</p>
    </div>
    <div>
      <p><strong>Gentailer</strong> &mdash; A company that both generates and retails electricity. Australia's
      Big 3 (AGL, Origin Energy, EnergyAustralia) are all gentailers, giving them natural hedges.</p>

      <p><strong>Market Cap / Floor</strong> &mdash; The NEM price is bounded: maximum $20,000/MWh (market price
      cap) and minimum -$1,000/MWh (market floor price).</p>

      <p><strong>Merit Order</strong> &mdash; All generator bids sorted from cheapest to most expensive. AEMO
      dispatches up the merit order until supply meets demand.</p>

      <p><strong>MW (Megawatt)</strong> &mdash; A measure of power (capacity). Describes how much a generator
      can produce at any instant. 1 MW = 1,000 kW.</p>

      <p><strong>MWh (Megawatt-hour)</strong> &mdash; A measure of energy (power &times; time). What generators
      actually sell. 1 MWh = 1 MW running for 1 hour.</p>

      <p><strong>Portfolio Effect</strong> &mdash; When losses on one asset are offset by gains on another within
      the same portfolio, reducing overall risk. Diversification in action.</p>

      <p><strong>Pro-rata Dispatch</strong> &mdash; When multiple generators bid the same price at the margin,
      available dispatch is split proportionally based on their offered capacity.</p>
    </div>
  </div>

  <div class="two-col">
    <div>
      <p><strong>Reserve Margin</strong> &mdash; The percentage of spare capacity above demand.
      Low margins (&lt;10%) signal tight supply and typically cause price spikes.</p>

      <p><strong>SOC (State of Charge)</strong> &mdash; How full a battery is, expressed as a percentage (0&ndash;100%).
      Tracks across periods within a round. Critical for battery management.</p>
    </div>
    <div>
      <p><strong>SRMC (Short Run Marginal Cost)</strong> &mdash; The cost to produce one additional MWh of electricity.
      Includes fuel and variable operations &amp; maintenance but NOT capital costs. The break-even price for a generator.</p>

      <p><strong>Cannibalisation Effect</strong> &mdash; When increasing renewable capacity reduces wholesale
      prices, thereby reducing the revenue earned by renewables themselves.</p>
    </div>
  </div>

  <div class="footer" style="margin-top: 2rem;">
    <p>GridRival &mdash; Educational Compendium &mdash; Your post-game take-home reference</p>
    <p>&#9889; Keep exploring. The energy transition is happening now.</p>
  </div>
</div>

</body>
</html>`;
}
