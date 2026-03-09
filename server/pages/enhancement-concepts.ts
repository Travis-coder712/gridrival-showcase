/**
 * Enhancement Concepts — NPC Market Participants & Energy Transition Game Mode
 * Served at /api/enhancement-concepts
 */
export function getEnhancementConceptsHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GridRival — Enhancement Concepts</title>
<style>
  @page { margin: 1.5cm 2cm; size: A4; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1a202c; line-height: 1.7; font-size: 11pt; background: #f7fafc; }
  .container { max-width: 900px; margin: 0 auto; padding: 2rem 2rem 4rem; }
  .header { background: linear-gradient(135deg, #1e3a5f 0%, #0f1b2d 100%); color: white; padding: 2.5rem 2rem; border-radius: 12px; margin-bottom: 2rem; text-align: center; }
  .header h1 { font-size: 2rem; font-weight: 800; margin-bottom: 0.3rem; }
  .header .subtitle { color: #63b3ed; font-size: 1.05rem; }
  h2 { font-size: 1.4rem; color: #1e3a5f; border-bottom: 3px solid #3182ce; padding-bottom: 0.4rem; margin: 2.5rem 0 1rem; }
  h3 { font-size: 1.15rem; color: #2d3748; margin-top: 1.3rem; margin-bottom: 0.5rem; }
  h4 { font-size: 1rem; color: #4a5568; margin-top: 1rem; margin-bottom: 0.3rem; }
  p { margin-bottom: 0.8rem; }
  ul, ol { margin: 0.5rem 0 1rem 1.5rem; }
  li { margin-bottom: 0.4rem; }
  table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem; }
  th, td { border: 1px solid #e2e8f0; padding: 0.5rem 0.7rem; text-align: left; }
  th { background: #edf2f7; font-weight: 600; color: #2d3748; }
  tr:nth-child(even) { background: #f7fafc; }
  .card { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.2rem 1.5rem; margin: 1rem 0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
  .tip { background: #ebf8ff; border-left: 4px solid #3182ce; padding: 0.8rem 1rem; border-radius: 0 8px 8px 0; margin: 0.8rem 0; }
  .warning { background: #fffbeb; border-left: 4px solid #d69e2e; padding: 0.8rem 1rem; border-radius: 0 8px 8px 0; margin: 0.8rem 0; }
  .important { background: #fff5f5; border-left: 4px solid #e53e3e; padding: 0.8rem 1rem; border-radius: 0 8px 8px 0; margin: 0.8rem 0; }
  .highlight { background: #f0fff4; border-left: 4px solid #38a169; padding: 0.8rem 1rem; border-radius: 0 8px 8px 0; margin: 0.8rem 0; }
  .round-card { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1rem 1.2rem; margin: 0.8rem 0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); page-break-inside: avoid; }
  .round-card h4 { margin-top: 0; color: #1e3a5f; }
  .round-meta { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0.5rem 0; }
  .round-meta span { display: inline-block; font-size: 0.75rem; font-weight: 600; padding: 0.15rem 0.6rem; border-radius: 20px; }
  .tag-new { background: #dcfce7; color: #166534; }
  .tag-retire { background: #fee2e2; color: #991b1b; }
  .tag-mechanic { background: #dbeafe; color: #1e40af; }
  .tag-minigame { background: #fce7f3; color: #9d174d; }
  .formula { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.8rem 1rem; margin: 0.5rem 0; font-family: 'Courier New', monospace; font-size: 0.9rem; overflow-x: auto; }
  .split { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  @media (max-width: 700px) { .split { grid-template-columns: 1fr; } }
  .back-link { display: inline-block; margin-bottom: 1rem; color: #3182ce; text-decoration: none; font-weight: 600; }
  .back-link:hover { text-decoration: underline; }
  .print-btn { display: inline-block; background: #3182ce; color: white; border: none; padding: 0.5rem 1.2rem; border-radius: 8px; font-size: 0.9rem; cursor: pointer; text-decoration: none; margin-left: 0.5rem; }
  .print-btn:hover { background: #2b6cb0; }
  .toc { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.2rem 1.5rem; margin: 1rem 0; }
  .toc ol { margin-left: 1.2rem; }
  .toc li { margin-bottom: 0.3rem; }
  .toc a { color: #3182ce; text-decoration: none; }
  .toc a:hover { text-decoration: underline; }
  .toc ol ol { margin-top: 0.3rem; margin-bottom: 0.3rem; }
  @media print {
    .no-print { display: none !important; }
    body { background: white; }
    .container { padding: 0; }
    .round-card, .card { page-break-inside: avoid; }
    .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
<div class="container">
  <div class="no-print" style="display: flex; justify-content: space-between; align-items: center;">
    <a href="/gridrival-showcase/" class="back-link">&larr; Back to Game</a>
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="header">
    <div style="font-size: 3rem; margin-bottom: 0.5rem;">&#128161;</div>
    <h1>Enhancement Concepts</h1>
    <div class="subtitle">NPC Market Participants &amp; Energy Transition Game Mode</div>
  </div>

  <!-- Table of Contents -->
  <div class="toc">
    <h3 style="margin-top: 0;">Contents</h3>
    <ol>
      <li><a href="#part1">Part 1: NPC Market Participants</a>
        <ol>
          <li><a href="#npc-overview">Concept Overview</a></li>
          <li><a href="#npc-behaviours">NPC Behaviour Types</a></li>
          <li><a href="#npc-dispatch">Integration with Dispatch</a></li>
          <li><a href="#npc-config">Host Configuration</a></li>
          <li><a href="#npc-benefits">Benefits &amp; Use Cases</a></li>
        </ol>
      </li>
      <li><a href="#part2">Part 2: Energy Transition Game Mode</a>
        <ol>
          <li><a href="#et-overview">Overview &amp; Winning Condition</a></li>
          <li><a href="#et-rounds">Round-by-Round Walkthrough (10 Years)</a></li>
          <li><a href="#et-coal">Coal Retirement Schedule</a></li>
          <li><a href="#et-retail">Retail Book Methodology</a></li>
          <li><a href="#et-hedging">Financial Hedging</a></li>
          <li><a href="#et-investment">Generation Investment</a></li>
          <li><a href="#et-balance-sheet">Balance Sheet &amp; Financing</a></li>
          <li><a href="#et-minigames">Minigame Designs</a></li>
        </ol>
      </li>
      <li><a href="#part3">Part 3: Battery Mechanics Verification</a></li>
      <li><a href="#priority">Implementation Priority</a></li>
    </ol>
  </div>

  <!-- ============================================================ -->
  <!-- PART 1: NPC MARKET PARTICIPANTS                               -->
  <!-- ============================================================ -->

  <h2 id="part1">Part 1: NPC Market Participants</h2>

  <h3 id="npc-overview">1.1 Concept Overview</h3>
  <p>NPC (Non-Player Character) generators are computer-controlled market participants that bid into the same wholesale electricity market alongside human teams. They are not a separate team with a score &mdash; they represent &ldquo;the rest of the market&rdquo; that exists beyond the players&rsquo; portfolios.</p>

  <div class="tip">
    <strong>Why NPCs?</strong> In a session with only 1&ndash;2 human teams, the merit order can feel unrealistically empty. NPC generators fill out the supply stack, create realistic price dynamics, and enable scenarios like negative pricing that require surplus generation beyond what human players control.
  </div>

  <p>Key design principles:</p>
  <ul>
    <li>NPCs bid into the <strong>same merit order dispatch</strong> as human teams &mdash; their bids are sorted alongside player bids and dispatched identically</li>
    <li>NPC bids are generated <strong>after human bids are submitted</strong> for &ldquo;market balancer&rdquo; types, or <strong>before dispatch</strong> for deterministic types</li>
    <li>NPCs do not appear on the leaderboard &mdash; they exist purely to create realistic market conditions</li>
    <li>The host can enable/disable NPCs per round and choose which behaviour mix to use</li>
  </ul>

  <h3 id="npc-behaviours">1.2 NPC Behaviour Types</h3>

  <table>
    <thead>
      <tr>
        <th>Behaviour</th>
        <th>Description</th>
        <th>Typical Assets</th>
        <th>Effect on Market</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>SRMC Rational</strong></td>
        <td>Bids at short-run marginal cost, the textbook &ldquo;efficient&rdquo; generator</td>
        <td>Gas CCGT, Coal</td>
        <td>Sets a reliable price floor; teaches players that undercutting SRMC is irrational</td>
      </tr>
      <tr>
        <td><strong>Market Balancer</strong></td>
        <td>Adjusts bids after seeing aggregate human supply to ensure market clears near a target price</td>
        <td>Flexible gas, hydro</td>
        <td>Prevents extreme price outcomes; keeps game educational for beginners</td>
      </tr>
      <tr>
        <td><strong>Outage Prone</strong></td>
        <td>Randomly withdraws capacity (simulates forced outages) with probability increasing in heatwave scenarios</td>
        <td>Ageing coal, old gas</td>
        <td>Creates supply shocks; teaches reliability value and scarcity pricing</td>
      </tr>
      <tr>
        <td><strong>Renewable Flood</strong></td>
        <td>Bids large volumes at $0 or negative prices; volume varies by period (high solar midday, high wind overnight)</td>
        <td>Wind farms, solar farms</td>
        <td>Demonstrates negative pricing, duck curve, and renewable cannibalisation</td>
      </tr>
      <tr>
        <td><strong>Price Hawk</strong></td>
        <td>Bids strategically above SRMC to maximise profit; withdraws capacity to raise prices when demand is high</td>
        <td>Gas peaker, hydro</td>
        <td>Demonstrates market power and strategic bidding; raises clearing prices</td>
      </tr>
    </tbody>
  </table>

  <h3 id="npc-dispatch">1.3 Integration with Dispatch</h3>
  <div class="card">
    <h4>How NPC Bids Enter the Merit Order</h4>
    <ol>
      <li>Human teams submit their bids as normal</li>
      <li>The game engine generates NPC bids based on the selected behaviour type(s)</li>
      <li>NPC bids are added to the bid pool with a special <code>isNPC: true</code> flag</li>
      <li>All bids (human + NPC) are sorted by price and dispatched in standard merit order</li>
      <li>The clearing price is determined by the marginal bid &mdash; which may be an NPC bid</li>
      <li>NPC revenue/costs are calculated but not shown on the leaderboard</li>
    </ol>
    <p>The existing <code>MeritOrderDispatch.ts</code> dispatch function requires minimal changes &mdash; NPC bids are structurally identical to human bids. The dispatch results display would annotate NPC bids with a different colour in the merit order chart.</p>
  </div>

  <h3 id="npc-config">1.4 Host Configuration</h3>
  <p>On the Host Dashboard, a new &ldquo;NPC Generators&rdquo; panel would allow:</p>
  <ul>
    <li><strong>Enable/Disable</strong> NPC generators per round</li>
    <li><strong>Behaviour Preset</strong>: Choose a mix (e.g., &ldquo;Realistic Market&rdquo; = 1x SRMC Rational + 1x Renewable Flood + 1x Outage Prone)</li>
    <li><strong>Total NPC Capacity</strong>: Slider to set how much MW the NPCs collectively control (default: equal to one human team&rsquo;s portfolio)</li>
    <li><strong>Visibility</strong>: Toggle whether NPC bids are shown in the merit order chart post-dispatch</li>
  </ul>

  <h3 id="npc-benefits">1.5 Benefits &amp; Use Cases</h3>
  <div class="split">
    <div class="card">
      <h4>Small Group Sessions (1&ndash;2 teams)</h4>
      <ul>
        <li>NPCs fill out the merit order so dispatch feels realistic</li>
        <li>Clearing prices behave naturally rather than being dominated by one player</li>
        <li>Enables competitive play even with a single human team (competing against market)</li>
      </ul>
    </div>
    <div class="card">
      <h4>Teaching Scenarios</h4>
      <ul>
        <li><strong>Negative pricing</strong>: Renewable Flood NPC bids at -$20/MWh, pushing clearing price negative when demand is low</li>
        <li><strong>Scarcity pricing</strong>: Outage Prone NPC withdraws capacity during heatwave, spiking prices</li>
        <li><strong>Market power</strong>: Price Hawk demonstrates strategic capacity withholding</li>
      </ul>
    </div>
  </div>

  <!-- ============================================================ -->
  <!-- PART 2: ENERGY TRANSITION GAME MODE                          -->
  <!-- ============================================================ -->

  <h2 id="part2">Part 2: Energy Transition Game Mode</h2>

  <h3 id="et-overview">2.1 Overview &amp; Winning Condition</h3>
  <p>The Energy Transition mode spans <strong>10 rounds representing 10 years</strong> of electricity market evolution. Players start as generation-only companies and progressively add retail customers, financial hedging, and new generation investment as the energy transition unfolds around them.</p>

  <div class="important">
    <strong>Winning Condition:</strong> The winner is the team with the highest <strong>Company Valuation</strong> at the end of Year 10.<br>
    <span class="formula">Company Valuation = Cash Reserves + Asset Book Value &minus; Outstanding Debt</span><br>
    A balanced portfolio (generation + retail + hedging) will outperform a one-dimensional strategy. Teams that fail to replace retiring coal capacity will see their company shrink as generation revenue falls and retail margins are squeezed.
  </div>

  <h3 id="et-rounds">2.2 Round-by-Round Walkthrough</h3>

  <div class="round-card">
    <h4>Year 1 &mdash; Foundation</h4>
    <div class="round-meta">
      <span class="tag-mechanic">Generation Bidding</span>
      <span class="tag-minigame">Portfolio Explainer</span>
    </div>
    <p>Guided introduction to generation bidding. Each team receives a fleet of coal, gas, wind, solar, and hydro assets. Standard merit order dispatch across 4 periods. Teams learn the basics: bid price, dispatch volume, clearing price, and profit.</p>
    <p><strong>Starting balance sheet:</strong> Each team begins with $500M in assets (existing generators at book value) and $100M cash.</p>
  </div>

  <div class="round-card">
    <h4>Year 2 &mdash; Market Dynamics</h4>
    <div class="round-meta">
      <span class="tag-mechanic">Generation Bidding</span>
      <span class="tag-mechanic">Scenario Events</span>
    </div>
    <p>Second round of generation bidding with a scenario event (e.g., transmission constraint or moderate demand increase). Teams begin to understand how supply-demand balance affects clearing prices. NPC generators active to fill out the market.</p>
  </div>

  <div class="round-card">
    <h4>Year 3 &mdash; Enter Retail</h4>
    <div class="round-meta">
      <span class="tag-new">NEW: Retail Arm</span>
      <span class="tag-minigame">Retail Intro Minigame</span>
    </div>
    <p><strong>Retail Intro Minigame:</strong> Before bidding, teams play a short minigame where they set a retail electricity price and marketing spend, then see how many customers they attract. This teaches the retail book concept.</p>
    <p>After the minigame, each team acquires an initial <strong>retail customer base</strong> (e.g., 50,000 customers). The retail book now runs alongside generation &mdash; teams earn retail margin but are exposed to wholesale price risk.</p>
  </div>

  <div class="round-card">
    <h4>Year 4 &mdash; Growing the Retail Book</h4>
    <div class="round-meta">
      <span class="tag-mechanic">Generation + Retail</span>
    </div>
    <p>Teams manage both generation bidding and their retail customer base. Before each round, they set:</p>
    <ul>
      <li><strong>Retail price</strong> ($/MWh to charge customers)</li>
      <li><strong>Marketing spend</strong> ($ to acquire new customers)</li>
      <li><strong>Retention spend</strong> ($ to reduce churn)</li>
    </ul>
    <p>Vertically integrated balance becomes apparent: if wholesale prices rise, generation profits increase but retail margins are squeezed (buying power at high clearing price to serve customers). Teams start to see the natural hedge of owning both sides.</p>
  </div>

  <div class="round-card">
    <h4>Year 5 &mdash; Retail Competition</h4>
    <div class="round-meta">
      <span class="tag-mechanic">Generation + Retail</span>
      <span class="tag-mechanic">Customer Churn</span>
    </div>
    <p>Customer churn intensifies. Teams with high retail prices lose customers to competitors. Marketing wars begin. Coal plants are still running but ageing &mdash; maintenance costs start to rise (SRMC increases by 10%).</p>
    <div class="warning">
      <strong>Foreshadowing:</strong> A news bulletin announces that government policy will require the oldest coal units to retire within 2 years due to emissions targets.
    </div>
  </div>

  <div class="round-card">
    <h4>Year 6 &mdash; Enter Hedging</h4>
    <div class="round-meta">
      <span class="tag-new">NEW: Financial Hedging</span>
      <span class="tag-minigame">Hedging Intro Minigame</span>
    </div>
    <p><strong>Hedging Intro Minigame:</strong> Teams are presented with three price scenarios (low, medium, extreme) and must choose which hedge instruments to buy (caps, swaps, or none). The minigame reveals outcomes under each scenario, teaching when hedges pay off vs. cost money.</p>
    <p>After the minigame, teams can purchase <strong>cap and swap contracts</strong> before each round. These settle against the actual clearing price after dispatch. Hedging becomes a key tool for managing wholesale price risk &mdash; especially important for teams with large retail books.</p>
  </div>

  <div class="round-card">
    <h4>Year 7 &mdash; Coal Retires, Investment Opens</h4>
    <div class="round-meta">
      <span class="tag-retire">Coal Unit 1 Retires</span>
      <span class="tag-new">NEW: Generation Investment</span>
      <span class="tag-minigame">Investment Intro Minigame</span>
    </div>
    <p><strong>Coal Retirement:</strong> Each team&rsquo;s oldest coal unit (approx. 400 MW) is forcibly retired. This capacity disappears from their fleet, reducing generation revenue and ability to self-supply retail customers.</p>
    <p><strong>Investment Intro Minigame:</strong> Teams receive a coal retirement notice and a budget. They must choose between &ldquo;Build Ready&rdquo; projects (certain but expensive) and &ldquo;Development R&amp;D&rdquo; projects (cheaper but uncertain). Outcomes are revealed with probability rolls.</p>
    <p>After the minigame, the <strong>investment marketplace</strong> opens. Teams can invest in new generation to replace lost capacity. Two investment paths are available (see <a href="#et-investment">Section 2.6</a>).</p>
    <div class="important">
      <strong>Strategic pressure:</strong> Teams that don&rsquo;t invest will have less generation capacity, earning less wholesale revenue. If they have retail customers, they must buy more power at the clearing price, squeezing margins. The company starts shrinking.
    </div>
  </div>

  <div class="round-card">
    <h4>Year 8 &mdash; Full Integration</h4>
    <div class="round-meta">
      <span class="tag-retire">Coal Unit 2 Retires</span>
      <span class="tag-new">NEW: Balance Sheet Lending</span>
      <span class="tag-mechanic">All Mechanics Active</span>
    </div>
    <p><strong>Second coal unit retires.</strong> Teams that invested in Year 7 see their new assets come online (if &ldquo;Build Ready&rdquo;) or discover R&amp;D outcomes. Balance sheet lending is unlocked &mdash; teams can borrow against their asset book value to fund further investment.</p>
    <p><strong>Outside investors</strong> become available: external capital can fund part of a project in exchange for a perpetual revenue share on that asset.</p>
    <p>All mechanics are now active: generation bidding, retail management, hedging, investment, and financing. Teams must balance all dimensions.</p>
  </div>

  <div class="round-card">
    <h4>Year 9 &mdash; Transition Pressure</h4>
    <div class="round-meta">
      <span class="tag-mechanic">All Mechanics Active</span>
      <span class="tag-mechanic">Volatile Markets</span>
    </div>
    <p>The market is now highly dynamic. Renewable NPC generators flood the market in some periods (negative prices), while tight supply in others drives extreme peaks. Teams with balanced portfolios (diverse generation, hedged retail book, managed debt) are thriving. Over-leveraged teams feel the debt interest burden.</p>
    <p>R&amp;D projects that haven&rsquo;t succeeded yet get a final probability roll.</p>
  </div>

  <div class="round-card">
    <h4>Year 10 &mdash; Final Year &amp; Company Valuation</h4>
    <div class="round-meta">
      <span class="tag-retire">Remaining Coal Retires</span>
      <span class="tag-mechanic">Final Dispatch + Scoring</span>
    </div>
    <p>Any remaining coal units retire. Final round of full dispatch with all mechanics. After the round completes, <strong>Company Valuation</strong> is calculated and the winner is announced.</p>
    <div class="highlight">
      <strong>Final scoring:</strong><br>
      Company Valuation = Cash Reserves + Asset Book Value &minus; Outstanding Debt<br>
      Asset Book Value includes all generators (original fleet + new builds, minus retired coal). Outside investor revenue shares reduce the effective book value of those assets.
    </div>
  </div>

  <h3 id="et-coal">2.3 Coal Retirement Schedule</h3>
  <div class="card">
    <table>
      <thead>
        <tr><th>Year</th><th>Event</th><th>Capacity Impact (per team)</th></tr>
      </thead>
      <tbody>
        <tr><td>5</td><td>Retirement announcement &mdash; coal SRMC rises 10%</td><td>No capacity loss yet</td></tr>
        <tr><td>7</td><td>Oldest coal unit forced offline</td><td>&minus;400 MW approx.</td></tr>
        <tr><td>8</td><td>Second coal unit forced offline</td><td>&minus;400 MW approx.</td></tr>
        <tr><td>10</td><td>All remaining coal units retire</td><td>All coal gone</td></tr>
      </tbody>
    </table>
    <p>Coal retirements create urgency to invest. Without replacement capacity, teams cannot serve their retail customers profitably and lose both generation revenue and retail margin. The gap between a team&rsquo;s generation capacity and their retail customer load determines how much they must buy from the market at the (potentially volatile) clearing price.</p>
  </div>

  <h3 id="et-retail">2.4 Retail Book Methodology</h3>

  <div class="card">
    <h4>Customer Base Model</h4>
    <p>Each team maintains a retail customer base measured in number of customers. Each customer consumes a fixed amount of electricity per round (e.g., 8 MWh/year, representing a typical household).</p>

    <h4>Acquisition &amp; Churn</h4>
    <div class="formula">
      New Customers = Marketing Spend / Acquisition Cost per Customer<br>
      (Acquisition Cost &asymp; $200 per customer)
    </div>
    <div class="formula">
      Churn Rate = Base Churn &minus; Retention Effect + Price Sensitivity<br>
      <br>
      Base Churn = 15% per year<br>
      Retention Effect = min(Retention Spend / (Customers &times; $10), 10%)  &larr; diminishing returns<br>
      Price Sensitivity = max(0, (Your Retail Price &minus; Market Avg Price) / Market Avg Price &times; 20%)
    </div>
    <div class="formula">
      Customers Lost = Current Customers &times; Churn Rate<br>
      End-of-Year Customers = Current Customers &minus; Customers Lost + New Customers
    </div>

    <h4>Retail Profit &amp; Loss</h4>
    <div class="formula">
      Retail Revenue = Customers &times; Consumption &times; Retail Price<br>
      Wholesale Cost = Customers &times; Consumption &times; Avg Clearing Price<br>
      Retail Margin = Retail Revenue &minus; Wholesale Cost &minus; Marketing Spend &minus; Retention Spend
    </div>

    <h4>Vertically Integrated Balance</h4>
    <p>The key insight is that generation and retail naturally hedge each other:</p>
    <ul>
      <li><strong>High clearing prices</strong> &rarr; Generation profits rise, but retail margin falls (buying expensive power for customers). Net effect depends on whether you generate enough to cover your retail load.</li>
      <li><strong>Low clearing prices</strong> &rarr; Generation profits fall, but retail margin improves (cheap wholesale power). Net effect is neutral for balanced portfolios.</li>
      <li><strong>Balanced portfolio</strong> &rarr; Generation capacity roughly equals retail customer load. The team is &ldquo;naturally hedged&rdquo; regardless of price movements.</li>
    </ul>
    <p>When coal retires and generation capacity drops below retail load, the team becomes a <strong>net buyer</strong> from the market &mdash; exposed to high clearing prices. This creates the investment pressure.</p>
  </div>

  <h3 id="et-hedging">2.5 Financial Hedging</h3>

  <div class="card">
    <h4>Cap Contracts (Insurance Against High Prices)</h4>
    <p>A cap contract pays out when the clearing price exceeds a strike price. It acts as insurance for retailers exposed to wholesale price spikes.</p>
    <div class="formula">
      Cap Payout (per period) = max(Clearing Price &minus; Strike Price, 0) &times; Contracted MW &times; Hours<br>
      Cap Cost = Premium &times; Contracted MW  (paid upfront at start of round)
    </div>
    <table>
      <thead><tr><th>Cap Product</th><th>Strike</th><th>Premium</th><th>Best For</th></tr></thead>
      <tbody>
        <tr><td>Standard Cap</td><td>$80/MWh</td><td>$15/MW</td><td>Moderate protection against price spikes</td></tr>
        <tr><td>Deep Cap</td><td>$50/MWh</td><td>$35/MW</td><td>Heavy protection, expensive &mdash; useful for large retail books</td></tr>
        <tr><td>Peaker Cap</td><td>$150/MWh</td><td>$5/MW</td><td>Cheap catastrophe insurance against extreme spikes only</td></tr>
      </tbody>
    </table>

    <h4>Swap Contracts (Fixed Price Lock)</h4>
    <p>A swap locks in a fixed price. The team receives (or pays) the difference between the fixed price and the clearing price. This eliminates price uncertainty but also caps upside.</p>
    <div class="formula">
      Swap Settlement (per period) = (Fixed Price &minus; Clearing Price) &times; Contracted MW &times; Hours<br>
      (Positive = you receive money; Negative = you pay)
    </div>
    <table>
      <thead><tr><th>Swap Product</th><th>Fixed Price</th><th>Premium</th><th>Best For</th></tr></thead>
      <tbody>
        <tr><td>Baseload Swap</td><td>$55/MWh</td><td>$5/MW</td><td>Lock in stable revenue for baseload generators</td></tr>
        <tr><td>Peak Swap</td><td>$90/MWh</td><td>$8/MW</td><td>Lock in peak-period revenue; risk if prices go higher</td></tr>
      </tbody>
    </table>

    <div class="tip">
      <strong>Teaching moment:</strong> Hedging becomes critical after coal retirements when the team&rsquo;s generation no longer covers their retail load. Without hedging, a price spike could wipe out retail profits. With over-hedging, a low-price period means the team pays out on swaps. Getting the balance right is the skill.
    </div>
  </div>

  <h3 id="et-investment">2.6 Generation Investment</h3>

  <div class="card">
    <h4>Two Investment Paths</h4>

    <div class="split">
      <div class="card" style="border-left: 4px solid #38a169;">
        <h4 style="color: #38a169;">Path 1: Build Ready (Certain)</h4>
        <p>Higher capital cost, but <strong>guaranteed delivery</strong> in 1 round. The asset appears in your fleet next year, fully operational.</p>
        <p>Best for teams that need capacity urgently to replace retiring coal or cover retail load.</p>
      </div>
      <div class="card" style="border-left: 4px solid #d69e2e;">
        <h4 style="color: #d69e2e;">Path 2: Development R&amp;D (Uncertain)</h4>
        <p>Lower upfront cost, but success is <strong>probabilistic</strong>. Each round you invest, there is a chance the project succeeds. You can keep investing additional rounds to improve the odds.</p>
        <p>Best for teams willing to take risk for a cost advantage, or for novel/experimental technologies.</p>
      </div>
    </div>

    <h4>Investment Options</h4>
    <table>
      <thead>
        <tr>
          <th>Asset</th>
          <th>Capacity</th>
          <th>Build Ready Cost</th>
          <th>R&amp;D Cost / Round</th>
          <th>R&amp;D Success Rate</th>
          <th>SRMC</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Solar Farm</td>
          <td>200 MW</td>
          <td>$80M</td>
          <td>$30M</td>
          <td>70% per round</td>
          <td>$0/MWh</td>
        </tr>
        <tr>
          <td>Wind Farm</td>
          <td>300 MW</td>
          <td>$120M</td>
          <td>$45M</td>
          <td>65% per round</td>
          <td>$0/MWh</td>
        </tr>
        <tr>
          <td>Battery Storage</td>
          <td>250 MW / 4hr</td>
          <td>$150M</td>
          <td>$55M</td>
          <td>60% per round</td>
          <td>$0/MWh</td>
        </tr>
        <tr>
          <td>Gas Peaker</td>
          <td>150 MW</td>
          <td>$60M</td>
          <td>$25M</td>
          <td>80% per round</td>
          <td>$130/MWh</td>
        </tr>
        <tr>
          <td>Experimental Tech</td>
          <td>500 MW</td>
          <td>N/A</td>
          <td>$40M</td>
          <td>35% per round</td>
          <td>$5/MWh</td>
        </tr>
      </tbody>
    </table>

    <div class="warning">
      <strong>R&amp;D cumulative probability:</strong> If a team invests in R&amp;D for the same project across multiple rounds, the success chance compounds. E.g., a 60% chance per round means after 2 rounds of investment, the cumulative probability of at least one success is 84%. Failed R&amp;D spend is sunk &mdash; not refunded.
    </div>

    <div class="formula">
      Cumulative Success = 1 &minus; (1 &minus; Success Rate) ^ Rounds Invested<br>
      E.g., Battery R&amp;D: 1 &minus; (1 &minus; 0.60)^2 = 1 &minus; 0.16 = 84% after 2 rounds
    </div>
  </div>

  <h3 id="et-balance-sheet">2.7 Balance Sheet &amp; Financing</h3>

  <div class="card">
    <h4>Asset Book Value</h4>
    <p>Every generator on your fleet has a book value. Starting assets are valued at their replacement cost minus depreciation. New builds are valued at their construction cost. Coal units drop to $0 when retired.</p>

    <h4>Borrowing Against Assets</h4>
    <div class="formula">
      Maximum Borrowing = Total Asset Book Value &times; 0.60  (60% loan-to-value ratio)<br>
      Interest Rate = 8% per round on outstanding debt<br>
      Interest Payment = Outstanding Debt &times; 0.08  (deducted from cash each round)
    </div>
    <p>Borrowing allows teams to invest in new generation even when cash reserves are low. However, over-leveraging is risky &mdash; interest payments eat into profits, and if asset values decline (e.g., market downturn), the team may struggle to service debt.</p>

    <h4>Outside Investors</h4>
    <div class="card" style="border-left: 4px solid #805ad5;">
      <h4 style="color: #805ad5;">External Capital Option</h4>
      <p>For any investment project, a team can choose to bring in an <strong>outside investor</strong> who funds a portion of the build cost in exchange for a perpetual revenue share on that specific asset.</p>
      <div class="formula">
        Investor Contribution = Project Cost &times; Investor Share (e.g., 50%)<br>
        Team Pays = Project Cost &minus; Investor Contribution<br>
        Revenue Share = Investor takes 30% of that asset&rsquo;s gross revenue, every round, forever
      </div>
      <p><strong>Example:</strong> A $120M Wind Farm with 50% outside investment costs the team only $60M upfront. But the investor takes 30% of that wind farm&rsquo;s revenue each round. Over time, the investor may earn more than their initial contribution &mdash; that&rsquo;s the trade-off.</p>
      <p>Outside investor assets count at reduced book value on the balance sheet (reduced by the revenue share percentage).</p>
    </div>

    <h4>Company Valuation (Final Scoring)</h4>
    <div class="formula">
      Company Valuation = Cash Reserves + Total Asset Book Value &minus; Outstanding Debt<br>
      <br>
      Where Asset Book Value accounts for:<br>
      &bull; Original fleet assets (depreciated)<br>
      &bull; New builds at construction cost<br>
      &bull; Retired coal at $0<br>
      &bull; Outside investor assets at reduced value (book value &times; (1 &minus; revenue share %))
    </div>
  </div>

  <h3 id="et-minigames">2.8 Minigame Designs</h3>

  <div class="card">
    <h4>Retail Intro Minigame (Year 3)</h4>
    <p><strong>Phases:</strong> INTRO &rarr; DECIDE &rarr; REVEAL &rarr; RESULTS</p>
    <p><strong>Concept:</strong> Teams are shown a market with 200,000 potential customers and set three parameters:</p>
    <ol>
      <li><strong>Retail price</strong> ($/MWh) &mdash; higher price = more margin per customer but fewer sign-ups</li>
      <li><strong>Marketing spend</strong> ($) &mdash; more spend = more customer acquisitions</li>
      <li><strong>Retention spend</strong> ($) &mdash; not applicable in Year 1 of retail (no existing customers yet)</li>
    </ol>
    <p><strong>Reveal:</strong> An animated &ldquo;customer acquisition funnel&rdquo; shows how many customers each team attracted. Teams see their first retail P&amp;L based on a fixed wholesale price scenario.</p>
    <p><strong>Scoring:</strong> Team with highest retail margin wins a small cash bonus.</p>
  </div>

  <div class="card">
    <h4>Hedging Intro Minigame (Year 6)</h4>
    <p><strong>Phases:</strong> INTRO &rarr; DECIDE &rarr; REVEAL &rarr; RESULTS</p>
    <p><strong>Concept:</strong> Teams are given a fixed retail book (100,000 customers) and shown three possible price scenarios for the upcoming round:</p>
    <ul>
      <li><strong>Scenario A:</strong> Low prices ($30&ndash;50/MWh) &mdash; mild weather, high renewables</li>
      <li><strong>Scenario B:</strong> Medium prices ($60&ndash;90/MWh) &mdash; normal conditions</li>
      <li><strong>Scenario C:</strong> Extreme prices ($150&ndash;300/MWh) &mdash; heatwave + outages</li>
    </ul>
    <p>Teams choose a hedging portfolio: how many MW of caps (at which strike) and/or swaps (at which fixed price) to purchase, within a budget.</p>
    <p><strong>Reveal:</strong> One scenario is randomly selected. The game calculates each team&rsquo;s retail P&amp;L with and without their hedges, showing the protective (or costly) effect of their choices.</p>
    <p><strong>Scoring:</strong> Team with the best risk-adjusted return (highest P&amp;L across all three scenarios weighted equally) wins a bonus.</p>
  </div>

  <div class="card">
    <h4>Investment Intro Minigame (Year 7)</h4>
    <p><strong>Phases:</strong> INTRO &rarr; DECIDE &rarr; REVEAL &rarr; RESULTS</p>
    <p><strong>Concept:</strong> Teams receive a coal retirement notice (&minus;400 MW) and a $200M investment budget. They must allocate funds across:</p>
    <ul>
      <li>Build Ready projects (guaranteed capacity, higher cost)</li>
      <li>R&amp;D projects (lower cost, probability-based outcomes)</li>
      <li>Saving cash (keeping reserves for future rounds)</li>
    </ul>
    <p>Teams can also choose to bring in outside investors on specific projects to stretch their budget.</p>
    <p><strong>Reveal:</strong> R&amp;D outcomes are determined by animated probability rolls (spinner or dice). Build Ready assets are confirmed. Teams see their updated fleet capacity and how it compares to their retail customer load.</p>
    <p><strong>Scoring:</strong> Team that best replaces retired capacity while maintaining the strongest balance sheet wins a bonus. Penalty for teams whose generation falls below retail load (exposed to market risk).</p>
  </div>

  <!-- ============================================================ -->
  <!-- PART 3: BATTERY MECHANICS VERIFICATION                       -->
  <!-- ============================================================ -->

  <h2 id="part3">Part 3: Battery Mechanics Verification</h2>

  <div class="card">
    <h4>Does Battery Charging Add to Demand?</h4>
    <div class="highlight">
      <strong>Confirmed: YES.</strong> Battery charging adds to total demand in the dispatch calculation.
    </div>
    <p>In <code>MeritOrderDispatch.ts</code>, the dispatch function collects all battery bids in &ldquo;charge&rdquo; mode and sums their MW to create <code>totalChargingLoadMW</code>. This is added to the period&rsquo;s base demand:</p>
    <div class="formula">
      totalDemandMW = demandMW + totalChargingLoadMW
    </div>
    <p>Charging bids are then excluded from the supply stack (they don&rsquo;t compete to be dispatched as generators). The cost of charging is calculated as:</p>
    <div class="formula">
      Charge Cost = chargeMW &times; hours &times; effectivePrice
    </div>
    <p>where <code>effectivePrice</code> is the clearing price of that period (the battery pays the same clearing price as any other buyer).</p>

    <h4>Dispatch Results Visibility</h4>
    <p>The current dispatch results show:</p>
    <ul>
      <li>Clearing price per period</li>
      <li>Per-team revenue, variable costs, and profit per period</li>
      <li>Merit order chart showing which bids were dispatched</li>
      <li>Battery state of charge tracking across periods</li>
    </ul>

    <div class="warning">
      <strong>Gap identified:</strong> There is no explicit panel showing &ldquo;Battery X charged at Y MW, which increased demand from A to B, causing the clearing price to shift from C to D.&rdquo; A counterfactual &ldquo;price impact&rdquo; visualisation could be a valuable future enhancement.
    </div>
  </div>

  <!-- ============================================================ -->
  <!-- IMPLEMENTATION PRIORITY                                      -->
  <!-- ============================================================ -->

  <h2 id="priority">Implementation Priority</h2>

  <div class="card">
    <h4>Recommended Build Order</h4>
    <ol>
      <li><strong>NPC Market Participants</strong> (Medium complexity)
        <ul>
          <li>Builds on existing dispatch infrastructure</li>
          <li>Immediately improves small-group gameplay</li>
          <li>Required for Energy Transition mode (NPC renewables create market dynamics)</li>
        </ul>
      </li>
      <li><strong>Retail Book</strong> (Medium complexity)
        <ul>
          <li>New data model (customer base, churn, retail P&amp;L)</li>
          <li>New UI panels for retail management</li>
          <li>Retail Intro Minigame</li>
        </ul>
      </li>
      <li><strong>Financial Hedging</strong> (Medium complexity)
        <ul>
          <li>Cap/swap contract data model and settlement engine</li>
          <li>Hedging purchase UI</li>
          <li>Hedging Intro Minigame</li>
        </ul>
      </li>
      <li><strong>Generation Investment &amp; Balance Sheet</strong> (High complexity)
        <ul>
          <li>Investment marketplace UI</li>
          <li>R&amp;D probability engine</li>
          <li>Balance sheet model (book value, debt, outside investors)</li>
          <li>Coal retirement schedule</li>
          <li>Investment Intro Minigame</li>
          <li>Company Valuation scoring</li>
        </ul>
      </li>
      <li><strong>Battery Price Impact Visualisation</strong> (Low complexity)
        <ul>
          <li>Counterfactual dispatch comparison showing clearing price with vs. without battery charging load</li>
        </ul>
      </li>
    </ol>
  </div>

</div>
</body>
</html>`;
}
