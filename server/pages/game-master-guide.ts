/**
 * Game Master's Guide — Comprehensive guide for running GridRival
 * Served at /api/game-master-guide
 */
export function getGameMasterGuideHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GridRival — Game Master's Guide</title>
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
  .tag-season { background: #fef3c7; color: #92400e; }
  .tag-assets { background: #dbeafe; color: #1e40af; }
  .tag-scenario { background: #fce7f3; color: #9d174d; }
  .tag-time { background: #e0e7ff; color: #3730a3; }
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
  @media print {
    .no-print { display: none !important; }
    body { background: white; }
    .container { padding: 0; }
    .round-card { page-break-inside: avoid; }
    .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
<div class="container">
  <div class="no-print" style="display: flex; justify-content: space-between; align-items: center;">
    <a href="/" class="back-link">&larr; Back to Game</a>
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="header">
    <div style="font-size: 3rem; margin-bottom: 0.5rem;">&#9889;</div>
    <h1>Game Master&rsquo;s Guide</h1>
    <div class="subtitle">GridRival &mdash; Everything you need to run a great session</div>
  </div>

  <!-- Table of Contents -->
  <div class="toc">
    <h3 style="margin-top: 0;">Contents</h3>
    <ol>
      <li><a href="#before">Before the Session</a></li>
      <li><a href="#setup">Game Setup &amp; Configuration</a></li>
      <li><a href="#modes">Choosing a Game Mode</a></li>
      <li><a href="#firstrun-rounds">First Run &mdash; Round-by-Round Guide (Recommended)</a></li>
      <li><a href="#quick-rounds">Quick Game &mdash; Round-by-Round Guide</a></li>
      <li><a href="#full-rounds">Full Game &mdash; Round-by-Round Guide</a></li>
      <li><a href="#experienced-rounds">Experienced Replay &mdash; Round-by-Round Guide</a></li>
      <li><a href="#beginner-round">Beginner Mode</a></li>
      <li><a href="#progressive-rounds">Progressive Learning &mdash; Round-by-Round Guide</a></li>
      <li><a href="#facilitation">Facilitation Techniques</a></li>
      <li><a href="#features">Game Features (WiFi, Sound, Dark Mode, Spectator, etc.)</a></li>
      <li><a href="#assets">Asset Reference</a></li>
      <li><a href="#scenarios">Scenario Events Reference</a></li>
      <li><a href="#surprise-events">Surprise Events</a></li>
      <li><a href="#strategies">Bidding Strategy Reference</a></li>
      <li><a href="#portfolio">Portfolio Strategy</a></li>
      <li><a href="#guardrails">Bidding Guardrails</a></li>
      <li><a href="#tips">Tips, Tricks &amp; Facilitation Notes</a></li>
      <li><a href="#troubleshooting">Troubleshooting</a></li>
    </ol>
  </div>

  <!-- Section 1: Before the Session -->
  <h2 id="before">1. Before the Session</h2>

  <h3>One Week Before</h3>
  <ul>
    <li>Send the <strong>Player Pre-Read</strong> to all participants (available from the landing page as a PDF)</li>
    <li>Decide which <strong>game mode</strong> to use (see section 3)</li>
    <li>Test the game on your network &mdash; ensure phones can connect via QR code</li>
    <li>If running on a corporate network, confirm WebSocket connections are not blocked by firewalls</li>
  </ul>

  <h3>Day of the Session</h3>
  <ul>
    <li>Start the server: <code>cd ~/nem-merit-order-game && npm run dev &amp; npm run server</code></li>
    <li>Open the landing page in a browser on the <strong>main screen / projector</strong></li>
    <li>Ensure the main screen is visible to all participants</li>
    <li><strong>Set up WiFi sharing:</strong> In Game Setup, enter the WiFi network name and password. This generates a QR code that phones can scan to auto-connect (persists across restarts)</li>
    <li>Have the <strong>&ldquo;Learn the NEM&rdquo;</strong> slides ready as a reference (can print as PDF from landing page)</li>
    <li>Brief facilitators on the round progression (use this guide!)</li>
  </ul>

  <div class="tip">
    <strong>&#128161; Room setup:</strong> Teams should sit together with at least one charged phone or laptop per team. The host screen should be large enough for everyone to see the merit order walkthrough at the end of each round &mdash; this is the key learning moment.
  </div>

  <h3>Checklist</h3>
  <table>
    <tr><th>Item</th><th>Status</th></tr>
    <tr><td>Server running and accessible</td><td>&#9744;</td></tr>
    <tr><td>Main screen / projector connected</td><td>&#9744;</td></tr>
    <tr><td>WiFi configured in Game Setup (WiFi QR code for auto-connect)</td><td>&#9744;</td></tr>
    <tr><td>Pre-read sent to participants</td><td>&#9744;</td></tr>
    <tr><td>Game mode decided</td><td>&#9744;</td></tr>
    <tr><td>Printed quick reference guides (optional)</td><td>&#9744;</td></tr>
    <tr><td>Timer / pace plan for the session</td><td>&#9744;</td></tr>
  </table>
  <ul>
    <li><strong>WiFi details:</strong> Enter your venue WiFi network name and password in Game Setup. The game will generate a QR code that teams can scan to connect instantly.</li>
  </ul>

  <!-- Section 2: Setup -->
  <h2 id="setup">2. Game Setup &amp; Configuration</h2>

  <h3>Creating a Game</h3>
  <ol>
    <li>Click <strong>&ldquo;Host Game&rdquo;</strong> from the landing page</li>
    <li>Select the <strong>game mode</strong></li>
    <li>Set the <strong>number of teams</strong> (2&ndash;15)</li>
    <li>Toggle options:
      <ul>
        <li><strong>Bidding Guardrails</strong> &mdash; recommended ON for beginners, OFF for experienced</li>
        <li><strong>Balancing</strong> &mdash; penalises teams that reprice too much capacity to higher bands (recommended ON)</li>
      </ul>
    </li>
    <li>Optionally customise <strong>asset configurations</strong> (names, costs, capacities)</li>
    <li>Click <strong>Create Game</strong></li>
  </ol>

  <div class="tip">
    <strong>&#128246; WiFi for Teams:</strong> You can now enter your venue WiFi details in Game Setup. This generates a QR code that iPhones and Android phones can scan to auto-connect. Click &ldquo;Show WiFi for Room&rdquo; in the lobby to display it on the projector. WiFi details are saved across server restarts.
  </div>

  <h3>Getting Teams Connected</h3>
  <ol>
    <li>The lobby shows a <strong>QR code</strong> &mdash; display this on the main screen</li>
    <li>Teams scan the QR code with their phone camera</li>
    <li>Each team enters a <strong>team name</strong> and joins</li>
    <li>The lobby shows a green checkmark for each connected team</li>
    <li>Once all teams are in, the host starts the game</li>
  </ol>

  <div class="warning">
    <strong>&#9888;&#65039; Network tips:</strong> All devices must be on the same WiFi network (or connected via the same tunnel). If using a mobile hotspot, set Socket.IO timeouts generously &mdash; the game is pre-configured for this. If a team disconnects, they can re-scan the QR code to rejoin.
  </div>

  <h3>Configuration Options</h3>
  <table>
    <tr><th>Setting</th><th>Default</th><th>Description</th></tr>
    <tr><td>Team Count</td><td>15</td><td>Number of teams (2&ndash;15). Fewer teams = each team has more market power.</td></tr>
    <tr><td>Bidding Guardrails</td><td>ON</td><td>When ON: blocks 0 MW bids, warns on &gt;60% at $0. When OFF: full freedom.</td></tr>
    <tr><td>Balancing</td><td>ON</td><td>Penalises teams when system reserves drop below 40% of fleet.</td></tr>
    <tr><td>SRMC Variation</td><td>ON</td><td>Spreads marginal costs &plusmn;20% across teams for natural merit order diversity.</td></tr>
    <tr><td>Bidding Time</td><td>240s</td><td>Per-round timer. Round 1 gets extra time (300s). Adjustable per round.</td></tr>
    <tr><td>Price Cap</td><td>$20,000/MWh</td><td>Maximum clearing price (matches real NEM). Fixed.</td></tr>
    <tr><td>Price Floor</td><td>-$1,000/MWh</td><td>Minimum clearing price. Fixed.</td></tr>
  </table>

  <!-- Section 3: Choosing a Mode -->
  <h2 id="modes">3. Choosing a Game Mode</h2>

  <table>
    <tr>
      <th>Mode</th>
      <th>Rounds</th>
      <th>Duration</th>
      <th>Best For</th>
    </tr>
    <tr style="background: #f0fff4;">
      <td><strong>&#127919; First Run (Recommended)</strong></td>
      <td>8</td>
      <td>45&ndash;60 min</td>
      <td>Best starting mode for most groups. Lean portfolio (1 coal + 1 gas + 1 renewable + 1 battery per team). Progressive unlock with guided first round, teaching notes, and seasonal guidance. Diverse portfolios create natural discussion.</td>
    </tr>
    <tr>
      <td><strong>Beginner</strong></td>
      <td>1</td>
      <td>15&ndash;20 min</td>
      <td>Single guided round with 2 assets. Quick demos only. Use as a warm-up or when time is very limited.</td>
    </tr>
    <tr>
      <td><strong>Quick Game</strong></td>
      <td>8</td>
      <td>60&ndash;90 min</td>
      <td>Workshops with limited time. Covers full technology progression (coal &rarr; gas &rarr; renewables &rarr; hydro &rarr; battery) in 8 rounds. Includes heatwave and oversupply scenarios.</td>
    </tr>
    <tr>
      <td><strong>Full Game</strong></td>
      <td>15</td>
      <td>2.5&ndash;3.5 hours</td>
      <td>Deep-dive training. 4 phases: Fundamentals, Technology Mix, Seasons &amp; Scenarios, Advanced. Includes carbon pricing, dunkelflaute, drought, and plant outages.</td>
    </tr>
    <tr>
      <td><strong>Progressive Learning</strong></td>
      <td>10</td>
      <td>90&ndash;120 min</td>
      <td>Builds complexity gradually: starts with 1 asset and 1 period, adds new assets and concepts each round. Best for a single 2-hour session with new learners. Includes teaching prompts for the host.</td>
    </tr>
    <tr>
      <td><strong>Experienced Replay</strong></td>
      <td>4</td>
      <td>30&ndash;45 min</td>
      <td>Teams who&rsquo;ve played before and want to try different strategies. Full portfolio from round 1. One round per season with challenging scenarios.</td>
    </tr>
  </table>

  <div class="highlight">
    <h4 style="margin-top: 0;">&#127919; First Run &mdash; The Recommended Starting Mode</h4>
    <p>First Run is the best starting mode for most groups with 45&ndash;90 minutes. Each team gets a <strong>lean portfolio</strong> of 4 assets (coal + gas + renewable + battery), with different gas and renewable types per team to create natural discussion. Progressive unlock over 8 rounds covers the full energy mix journey:</p>
    <ul>
      <li><strong>Rounds 1&ndash;3:</strong> Coal only &mdash; learn merit order, time periods, and bidding strategies</li>
      <li><strong>Round 4:</strong> Gas enters &mdash; teams get either CCGT or Peaker (compare strategies!)</li>
      <li><strong>Round 5:</strong> Renewables &mdash; teams get either Wind or Solar (different patterns!)</li>
      <li><strong>Round 6:</strong> Battery &mdash; complete portfolio, arbitrage mechanics</li>
      <li><strong>Rounds 7&ndash;8:</strong> Scenarios &mdash; summer heatwave, then crisis with plant outage</li>
    </ul>
    <p><strong>Why First Run works:</strong> Smaller portfolios mean faster bidding, less cognitive overload, and more time for discussion. Different assets per team creates natural comparison (&ldquo;Solar teams vs Wind teams&rdquo;). All rounds have host teaching notes.</p>
  </div>

  <div class="card">
    <h4>&#128200; Progressive Learning (10 rounds, 90&ndash;120 min)</h4>
    <p>Best for a dedicated 2-hour session. Builds from 1 asset/1 period to full portfolio with crises. Each round has host teaching notes and educational content.</p>
    <ul>
      <li>Rounds 1&ndash;3: Coal only, increasing from 1 to 4 periods</li>
      <li>Round 4: Gas enters (CCGT + Peaker)</li>
      <li>Rounds 5&ndash;6: Renewables, hydro, and batteries</li>
      <li>Round 7: Full portfolio strategy practice</li>
      <li>Rounds 8&ndash;10: Crisis scenarios (heatwave, negative prices, outage)</li>
    </ul>
    <p><strong>Ideal for:</strong> University tutorials, corporate training, workshop days</p>
  </div>

  <div class="tip">
    <strong>&#128161; Choosing the Right Mode:</strong>
    <ul>
      <li><strong>45&ndash;60 min, new group:</strong> First Run (recommended default)</li>
      <li><strong>90&ndash;120 min, new learners:</strong> Progressive Learning</li>
      <li><strong>60&ndash;90 min, some experience:</strong> Quick Game</li>
      <li><strong>Half-day workshop (3&ndash;4 hrs):</strong> Start with Beginner as ice-breaker (15 min), then First Run or Quick Game (75 min), break, then Experienced Replay (40 min)</li>
      <li><strong>Deep-dive training (3+ hrs):</strong> Full Game</li>
      <li><strong>Quick demo (10&ndash;15 min):</strong> Beginner</li>
      <li><strong>Returning players:</strong> Experienced Replay</li>
    </ul>
  </div>

  <!-- Section 4: First Run Rounds -->
  <h2 id="firstrun-rounds">4. First Run &mdash; Round-by-Round Guide (8 Rounds, Recommended)</h2>

  <div class="tip">
    <strong>&#127919; First Run Key Feature:</strong> Each team gets a lean portfolio of just 4 assets, with <strong>different</strong> gas and renewable types per team. Some teams get a CCGT, others a Peaker. Some get Wind, others Solar. This creates natural comparison and discussion between teams.
  </div>

  <div class="round-card">
    <h4>Round 1: Your First Bid (Guided Walkthrough)</h4>
    <div class="round-meta">
      <span class="tag-season">&#127810; Autumn</span>
      <span class="tag-assets">Coal only</span>
      <span class="tag-time">1 period (Afternoon)</span>
    </div>
    <p><strong>What happens:</strong> Teams see pre-filled bids with explanations. Walk them through what a bid is before they submit.</p>
    <p><strong>Key teaching:</strong> A bid = price + quantity. The merit order stacks bids cheapest first. The LAST generator dispatched sets the clearing price. ALL dispatched generators earn this price &mdash; not their bid price.</p>
    <p><strong>After results:</strong> Trace through the merit order chart. Ask: &ldquo;Who set the clearing price? If you bid $0, why didn&rsquo;t you earn $0?&rdquo;</p>
    <p><strong>In First Run:</strong> Each team has a smaller coal plant (~400 MW). UI is minimal &mdash; just the essentials.</p>
  </div>

  <div class="round-card">
    <h4>Round 2: Morning &amp; Afternoon</h4>
    <div class="round-meta">
      <span class="tag-season">&#127810; Autumn</span>
      <span class="tag-time">2 periods, 3 bands</span>
    </div>
    <p><strong>What happens:</strong> First unguided round. Teams bid independently across 2 periods.</p>
    <p><strong>Key teaching:</strong> Demand differs between Morning (lower) and Afternoon (higher). Should you bid the same in both?</p>
    <p><strong>After results:</strong> Compare who adapted their strategy across periods vs who bid the same everywhere.</p>
  </div>

  <div class="round-card">
    <h4>Round 3: Full Day Trading</h4>
    <div class="round-meta">
      <span class="tag-season">&#127810; Autumn</span>
      <span class="tag-time">4 periods, 5 bands</span>
    </div>
    <p><strong>What happens:</strong> First full-day round &mdash; Overnight, Morning, Afternoon, Evening.</p>
    <p><strong>Key teaching:</strong> Introduce strategy options: price taker ($0), SRMC, price maker, capacity repricing.</p>
    <p><strong>After results:</strong> Compare team strategies. &ldquo;Who adapted well to each period? Who bid the same everywhere?&rdquo;</p>
  </div>

  <div class="round-card">
    <h4>Round 4: Gas Power Enters</h4>
    <div class="round-meta">
      <span class="tag-season">&#127810; Autumn</span>
      <span class="tag-assets">+ Gas (CCGT or Peaker)</span>
      <span class="tag-time">4 periods, 5 bands</span>
    </div>
    <p><strong>What happens:</strong> Each team receives EITHER a CCGT (~200 MW, ~$75/MWh) OR a Peaker (~100 MW, ~$145/MWh) &mdash; not both!</p>
    <p><strong>Key teaching:</strong> Different cost structures. Gas only profits when the clearing price exceeds its SRMC.</p>
    <p><strong>After results:</strong> &ldquo;Which type of gas plant made more profit? Why?&rdquo; Compare CCGT vs Peaker team strategies.</p>
  </div>

  <div class="round-card">
    <h4>Round 5: Renewables Arrive</h4>
    <div class="round-meta">
      <span class="tag-season">&#127800; Spring</span>
      <span class="tag-assets">+ Wind or Solar</span>
      <span class="tag-time">4 periods, 7 bands</span>
    </div>
    <p><strong>What happens:</strong> Each team receives EITHER Wind (~200 MW) OR Solar (~150 MW). Season shifts to spring (low demand).</p>
    <p><strong>Key teaching:</strong> Renewables bid at $0 (no fuel cost) and displace expensive thermal. Solar is zero overnight; wind varies.</p>
    <p><strong>After results:</strong> &ldquo;Did solar teams dominate afternoon? Did wind teams have an edge overnight?&rdquo;</p>
    <p><strong>Note:</strong> Spring + renewables = possible oversupply. Watch for lower clearing prices.</p>
  </div>

  <div class="round-card">
    <h4>Round 6: Battery Storage</h4>
    <div class="round-meta">
      <span class="tag-season">&#127800; Spring</span>
      <span class="tag-assets">+ Battery (200 MW)</span>
      <span class="tag-time">4 periods, 10 bands</span>
    </div>
    <p><strong>What happens:</strong> Battery completes the portfolio (4 assets per team). Battery mini-game available. Full UI complexity.</p>
    <p><strong>Key teaching:</strong> Arbitrage &mdash; charge low, sell high. 92% round-trip efficiency means you need a ~9% spread to profit.</p>
    <p><strong>After results:</strong> &ldquo;Who made the most from their battery? What was the price spread?&rdquo;</p>
  </div>

  <div class="round-card">
    <h4>Round 7: Summer Heatwave</h4>
    <div class="round-meta">
      <span class="tag-season">&#9728;&#65039; Summer</span>
      <span class="tag-scenario">Heatwave (+40% demand)</span>
      <span class="tag-time">4 periods, 10 bands</span>
    </div>
    <p><strong>What happens:</strong> First scenario event! Extreme demand, coal derated 10%. With lean portfolios, supply is very tight.</p>
    <p><strong>Key teaching:</strong> Scarcity pricing. Solar teams have daytime advantage; wind teams may have overnight advantage.</p>
    <p><strong>After results:</strong> &ldquo;Which period had the highest clearing price? Why?&rdquo; Portfolio Explainer is available this round.</p>
  </div>

  <div class="round-card">
    <h4>Round 8: The Full NEM</h4>
    <div class="round-meta">
      <span class="tag-season">&#9728;&#65039; Summer</span>
      <span class="tag-scenario">Heatwave + Plant Outage</span>
      <span class="tag-time">4 periods, 10 bands</span>
    </div>
    <p><strong>What happens:</strong> Maximum complexity &mdash; heatwave + random plant outage. One team may lose their gas or even coal.</p>
    <p><strong>Key teaching:</strong> Apply everything learned. Different portfolios (CCGT vs Peaker, Wind vs Solar) shaped strategies differently.</p>
    <p><strong>After results:</strong> Full debrief. &ldquo;What was your biggest lesson? How did having different portfolios shape your strategy?&rdquo;</p>
  </div>

  <!-- Section 5: Quick Game Rounds -->
  <h2 id="quick-rounds">5. Quick Game &mdash; Round-by-Round Guide (8 Rounds)</h2>

  <div class="round-card">
    <h4>Round 1: Guided Walkthrough &mdash; Your First Bid</h4>
    <div class="round-meta">
      <span class="tag-season">&#127810; Autumn</span>
      <span class="tag-assets">Coal only</span>
      <span class="tag-time">&#9202; 300s</span>
      <span class="tag-time">2 periods: Morning, Afternoon</span>
    </div>
    <p><strong>Purpose:</strong> Get teams comfortable with the bidding interface. This is a walkthrough with suggested bids and explanations.</p>
    <p><strong>Key teaching points:</strong></p>
    <ul>
      <li>What a &ldquo;bid&rdquo; means: price you&rsquo;re willing to sell electricity at</li>
      <li>The merit order: cheapest bids dispatched first</li>
      <li>Clearing price: the most expensive dispatched bid sets the price for ALL</li>
      <li>Uniform pricing: even if you bid $0, you receive the clearing price</li>
      <li>Pro-rata dispatch: when bids are tied at the same price at the margin, dispatch is split proportionally</li>
    </ul>
    <div class="tip"><strong>GM tip:</strong> Walk the room and help teams with the interface. Emphasise that this round is about learning, not winning. Point out the marginal cost badges on each asset card.</div>
  </div>

  <div class="round-card">
    <h4>Round 2: Full Day Trading</h4>
    <div class="round-meta">
      <span class="tag-season">&#127810; Autumn</span>
      <span class="tag-assets">Coal only</span>
      <span class="tag-time">&#9202; 210s</span>
      <span class="tag-time">4 periods: Overnight, Morning, Afternoon, Evening</span>
    </div>
    <p><strong>Purpose:</strong> Introduce the full 24-hour cycle. Teams must now think about how demand varies across the day.</p>
    <p><strong>Key teaching points:</strong></p>
    <ul>
      <li>Overnight is low demand &mdash; prices should be lower</li>
      <li>Evening is peak demand &mdash; opportunity for higher bids</li>
      <li>If you bid too high, you won&rsquo;t be dispatched and earn nothing</li>
    </ul>
    <div class="tip"><strong>GM tip:</strong> After results, highlight the difference in clearing prices between overnight and evening. Ask teams: &ldquo;Who bid aggressively in the evening? Did it pay off?&rdquo;</div>
  </div>

  <div class="round-card">
    <h4>Round 3: Gas Power Enters the Market</h4>
    <div class="round-meta">
      <span class="tag-season">&#127810; Autumn</span>
      <span class="tag-assets">Coal + Gas CCGT + Gas Peaker</span>
      <span class="tag-time">&#9202; 240s</span>
      <span class="tag-time">4 periods</span>
    </div>
    <p><strong>Purpose:</strong> Introduce different cost structures. Gas CCGT ($65&ndash;85/MWh) and Gas Peakers ($120&ndash;160/MWh) are more expensive than coal.</p>
    <p><strong>Key teaching points:</strong></p>
    <ul>
      <li>Different assets have different marginal costs &mdash; check the coloured badges</li>
      <li>Gas peakers are expensive but only need to run during peaks to be profitable</li>
      <li>If a peaker sets the clearing price, ALL generators (including cheap coal) receive that high price</li>
      <li>Infra-marginal profit: the gap between clearing price and your cost is your profit</li>
    </ul>
    <div class="tip"><strong>GM tip:</strong> This is when the merit order concept really clicks. Use the walkthrough to show how coal bids stack at the bottom, gas CCGT in the middle, and peakers at the top. Highlight the &ldquo;infra-marginal rent&rdquo; that coal earns when gas sets the price.</div>
  </div>

  <div class="round-card">
    <h4>Round 4: Renewables &amp; Hydro Join</h4>
    <div class="round-meta">
      <span class="tag-season">&#127800; Spring</span>
      <span class="tag-assets">+ Wind, Solar, Hydro</span>
      <span class="tag-time">&#9202; 270s</span>
      <span class="tag-time">4 periods</span>
    </div>
    <p><strong>Purpose:</strong> Introduce zero-cost renewables and the duck curve. Spring season means mild demand and strong solar.</p>
    <p><strong>Key teaching points:</strong></p>
    <ul>
      <li>Wind and solar have $0 marginal cost &mdash; they push down the clearing price</li>
      <li>Solar only generates during the day (check capacity factors by period)</li>
      <li>Wind varies but is often stronger overnight and evening</li>
      <li>Hydro is cheap ($8/MWh) but has limited water &mdash; choose when to use it wisely</li>
      <li>The &ldquo;duck curve&rdquo;: midday solar suppresses prices, evening demand surges</li>
    </ul>
    <div class="tip"><strong>GM tip:</strong> Point out that spring has mild demand AND strong solar. Ask: &ldquo;What happens to the clearing price when everyone has cheap renewables flooding the market?&rdquo; This sets up the concept of negative pricing.</div>
  </div>

  <div class="round-card">
    <h4>Round 5: Battery Storage</h4>
    <div class="round-meta">
      <span class="tag-season">&#127800; Spring</span>
      <span class="tag-assets">+ Battery (500 MW / 3,000 MWh, 92% eff., 6h duration)</span>
      <span class="tag-time">&#9202; 300s</span>
      <span class="tag-time">4 periods</span>
    </div>
    <p><strong>Purpose:</strong> Introduce energy arbitrage. Batteries toggle between charge, discharge, and idle modes each period.</p>
    <p><strong>Key teaching points:</strong></p>
    <ul>
      <li>Batteries have 92% round-trip efficiency &mdash; you lose 8% of stored energy</li>
      <li>Use the charge/idle/discharge toggle to control battery mode each period</li>
      <li>Charge during cheap periods (overnight, midday solar surplus)</li>
      <li>Discharge during expensive periods (evening peak)</li>
      <li>Arbitrage revenue = discharge earnings &minus; charging cost &minus; efficiency losses</li>
      <li>Battery charging ADDS to market demand &mdash; 500 MW of charging pushes prices higher</li>
      <li>Watch SOC (State of Charge) &mdash; can&rsquo;t discharge empty or charge full</li>
    </ul>
    <div class="tip"><strong>GM tip:</strong> Extra bidding time this round (300s) because batteries add complexity. Remind teams that batteries are the &ldquo;secret weapon&rdquo; for volatile markets. The best strategy is usually charge at the cheapest period and discharge at the most expensive. Warn teams that if multiple teams charge simultaneously, the combined load can spike prices dramatically.</div>
  </div>

  <div class="round-card">
    <h4>Round 6: Summer Heatwave &#128293;</h4>
    <div class="round-meta">
      <span class="tag-season">&#9728;&#65039; Summer</span>
      <span class="tag-assets">Full portfolio</span>
      <span class="tag-scenario">&#9888;&#65039; Extreme Heatwave</span>
      <span class="tag-time">&#9202; 240s</span>
    </div>
    <p><strong>Purpose:</strong> Experience scarcity pricing. Demand surges +40% in the afternoon from air conditioning. Coal derates -10% from cooling water temperatures.</p>
    <p><strong>Key teaching points:</strong></p>
    <ul>
      <li>When demand exceeds supply, the clearing price can hit $20,000/MWh (price cap)</li>
      <li>Even coal and gas earn enormous infra-marginal profits in scarcity</li>
      <li>This is when peakers really shine &mdash; they run at the most profitable time</li>
      <li>Capacity repricing is risky but can push prices up (if balancing is on, beware penalties)</li>
    </ul>
    <div class="tip"><strong>GM tip:</strong> This round usually produces the biggest profits (or losses). The walkthrough will show dramatic price spikes. Ask: &ldquo;Who made the most money and why? Who got burned?&rdquo; This is a key moment for understanding market power.</div>
  </div>

  <div class="round-card">
    <h4>Round 7: Spring Oversupply &amp; Negative Prices</h4>
    <div class="round-meta">
      <span class="tag-season">&#127800; Spring</span>
      <span class="tag-assets">Full portfolio</span>
      <span class="tag-scenario">&#9888;&#65039; Negative Prices</span>
      <span class="tag-time">&#9202; 240s</span>
    </div>
    <p><strong>Purpose:</strong> Experience negative pricing. Demand drops, solar +30%, wind +20%. Generators may need to PAY to stay dispatched.</p>
    <p><strong>Key teaching points:</strong></p>
    <ul>
      <li>When supply &gt;&gt; demand, prices go negative</li>
      <li>Coal plants may bid negative to avoid expensive shutdown/restart</li>
      <li>Renewables at $0 still get dispatched but earn nothing (or lose money if price is negative)</li>
      <li>Batteries should charge during negative prices &mdash; you get PAID to charge!</li>
      <li>The duck curve is most extreme in spring</li>
    </ul>
    <div class="tip"><strong>GM tip:</strong> Highlight that negative prices are a real NEM phenomenon &mdash; they happen regularly in spring/autumn. Ask: &ldquo;If you owned a coal plant, would you bid negative to stay on? What&rsquo;s the cost of shutting down and restarting?&rdquo;</div>
  </div>

  <div class="round-card">
    <h4>Round 8: The Full NEM Challenge &#127942;</h4>
    <div class="round-meta">
      <span class="tag-season">&#9728;&#65039; Summer</span>
      <span class="tag-assets">Full portfolio</span>
      <span class="tag-scenario">&#9888;&#65039; Moderate Heatwave + Random Plant Outage</span>
      <span class="tag-time">&#9202; 300s</span>
    </div>
    <p><strong>Purpose:</strong> Final round combining multiple challenges. One team will randomly lose a coal plant (outage). Demand is elevated from heat. Cumulative profit determines the winner.</p>
    <p><strong>Key teaching points:</strong></p>
    <ul>
      <li>Complex decision-making with uncertainty (you don&rsquo;t know who has the outage)</li>
      <li>Portfolio optimisation across all asset types</li>
      <li>Cumulative profit matters &mdash; consistent performance beats one lucky round</li>
    </ul>
    <div class="tip"><strong>GM tip:</strong> Build the drama! This is the final round. Remind teams of the leaderboard standings. The plant outage adds genuine tension. After results, use the dispatch overview to narrate the story of the round.</div>
  </div>

  <!-- Section 5: Full Game Rounds -->
  <h2 id="full-rounds">6. Full Game &mdash; Round-by-Round Guide (15 Rounds)</h2>

  <h3>Phase 1: Fundamentals (Rounds 1&ndash;4) &mdash; Coal only</h3>
  <p>Teams learn the basics with a single asset type. Focus on understanding the merit order, clearing prices, and basic bidding strategies.</p>

  <div class="round-card">
    <h4>Round 1: Guided Walkthrough</h4>
    <div class="round-meta">
      <span class="tag-season">&#127810; Autumn</span>
      <span class="tag-assets">Coal only</span>
      <span class="tag-time">&#9202; 300s &middot; Day Peak only</span>
    </div>
    <p>Single period with walkthrough. Pre-filled suggested bids with explanations. Deterministic demand (no randomness) so the learning outcome is clear.</p>
  </div>

  <div class="round-card">
    <h4>Round 2: Morning vs Afternoon</h4>
    <div class="round-meta">
      <span class="tag-season">&#127810; Autumn</span>
      <span class="tag-assets">Coal only</span>
      <span class="tag-time">&#9202; 240s &middot; 2 periods</span>
    </div>
    <p>Two periods let teams see how demand varies. Morning is lower demand; afternoon is higher. First exposure to period-specific bidding.</p>
  </div>

  <div class="round-card">
    <h4>Round 3: Full Day Trading</h4>
    <div class="round-meta">
      <span class="tag-season">&#127810; Autumn</span>
      <span class="tag-assets">Coal only</span>
      <span class="tag-time">&#9202; 240s &middot; 4 periods</span>
    </div>
    <p>Full 24-hour cycle with all four periods. Introduces overnight (lowest demand) and evening (highest demand). Still coal only to keep it manageable.</p>
  </div>

  <div class="round-card">
    <h4>Round 4: Market Power &amp; Strategy</h4>
    <div class="round-meta">
      <span class="tag-season">&#127810; Autumn</span>
      <span class="tag-assets">Coal only</span>
      <span class="tag-time">&#9202; 210s &middot; 4 periods</span>
    </div>
    <p>Shorter timer, higher demand variability. Teams start experimenting with price-maker vs price-taker strategies. Key round for understanding market power.</p>
    <div class="tip"><strong>GM tip:</strong> Before this round, explain the concept of &ldquo;price-making&rdquo; vs &ldquo;price-taking.&rdquo; A price-taker bids low to guarantee dispatch. A price-maker bids high to push up the clearing price. Ask: &ldquo;What happens if EVERYONE tries to be a price-maker?&rdquo;</div>
  </div>

  <h3>Phase 2: Technology Mix (Rounds 5&ndash;8) &mdash; New assets each round</h3>
  <p>Each round introduces new generation technology. Teams must learn to manage diverse portfolios with different cost structures and operating characteristics.</p>

  <div class="round-card">
    <h4>Round 5: Gas Enters the Market</h4>
    <div class="round-meta">
      <span class="tag-season">&#127810; Autumn</span>
      <span class="tag-assets">+ Gas CCGT ($65&ndash;85) + Gas Peaker ($120&ndash;160)</span>
      <span class="tag-time">&#9202; 240s &middot; 4 periods</span>
    </div>
    <p>Two new gas assets with very different economics. CCGT is mid-merit (flexible, moderate cost). Peakers are expensive but run only at peak. The merit order gets interesting.</p>
    <div class="highlight"><strong>Seasonal guidance provided to teams:</strong> Moderate autumn demand, comfortable supply margins. Gas is mid-merit &mdash; expect it to set the clearing price in some periods.</div>
  </div>

  <div class="round-card">
    <h4>Round 6: Renewables Revolution</h4>
    <div class="round-meta">
      <span class="tag-season">&#127800; Spring</span>
      <span class="tag-assets">+ Wind (300 MW, $0) + Solar (200 MW, $0)</span>
      <span class="tag-time">&#9202; 270s &middot; 4 periods</span>
    </div>
    <p>Zero-cost renewables flood the market. Spring season amplifies the effect. Duck curve emerges: midday solar suppresses prices, evening demand surges.</p>
    <div class="highlight"><strong>Seasonal guidance:</strong> Spring oversupply likely. Renewables push gas out of the merit order in some periods. Watch for the duck curve &mdash; afternoon prices may be very low.</div>
  </div>

  <div class="round-card">
    <h4>Round 7: Hydro &amp; Opportunity Cost</h4>
    <div class="round-meta">
      <span class="tag-season">&#127810; Autumn</span>
      <span class="tag-assets">+ Hydro (250 MW, $8, limited storage)</span>
      <span class="tag-time">&#9202; 270s &middot; 4 periods</span>
    </div>
    <p>Hydro is cheap but constrained. Limited water each round &mdash; teams must choose WHEN to use it. Opportunity cost: should you use hydro now or save it for a more profitable period?</p>
  </div>

  <div class="round-card">
    <h4>Round 8: Battery Storage</h4>
    <div class="round-meta">
      <span class="tag-season">&#127800; Spring</span>
      <span class="tag-assets">+ Battery (500 MW / 3,000 MWh, 92% eff., 6h duration)</span>
      <span class="tag-time">&#9202; 300s &middot; 4 periods</span>
    </div>
    <p>Full portfolio now complete. Batteries add arbitrage opportunities: use the charge/idle/discharge toggle each period. Charge cheap, discharge expensive. Arbitrage revenue = discharge earnings minus charging cost. Spring season creates wide price spreads perfect for battery strategy. Remind teams that charging adds to market demand.</p>
  </div>

  <h3>Phase 3: Seasons &amp; Scenarios (Rounds 9&ndash;12) &mdash; Real-world challenges</h3>
  <p>All assets available. Each round features a different season and scenario event that mirrors real NEM conditions.</p>

  <div class="round-card">
    <h4>Round 9: Summer Heatwave &#128293;</h4>
    <div class="round-meta">
      <span class="tag-season">&#9728;&#65039; Summer</span>
      <span class="tag-scenario">Extreme heatwave: +40% afternoon demand, coal -10%</span>
      <span class="tag-time">&#9202; 240s</span>
    </div>
    <p>Air conditioning drives demand to near-capacity. Coal derates from heat. Scarcity pricing likely in the afternoon. This is where big money is made (or lost).</p>
  </div>

  <div class="round-card">
    <h4>Round 10: Winter Cold Snap &#10052;&#65039;</h4>
    <div class="round-meta">
      <span class="tag-season">&#10052;&#65039; Winter</span>
      <span class="tag-scenario">Cold snap: +35% evening demand, +30% wind</span>
      <span class="tag-time">&#9202; 240s</span>
    </div>
    <p>Heating demand surges in the evening (6pm&ndash;midnight). Cold fronts bring stronger wind. Solar is weak (short winter days). Evening becomes the critical period.</p>
  </div>

  <div class="round-card">
    <h4>Round 11: Spring Oversupply</h4>
    <div class="round-meta">
      <span class="tag-season">&#127800; Spring</span>
      <span class="tag-scenario">Negative prices: demand &minus;30%, solar +30%, wind +20%</span>
      <span class="tag-time">&#9202; 240s</span>
    </div>
    <p>Extreme oversupply. Demand drops while renewables flood the market. Clearing prices will go negative in some periods. Batteries should charge at negative prices.</p>
  </div>

  <div class="round-card">
    <h4>Round 12: Drought &amp; Gas Crisis</h4>
    <div class="round-meta">
      <span class="tag-season">&#127810; Autumn</span>
      <span class="tag-scenario">Drought (hydro &minus;50%) + Gas price spike (SRMC +60%)</span>
      <span class="tag-time">&#9202; 240s</span>
    </div>
    <p>Dual supply shock: hydro at half capacity, gas costs jump 60%. The merit order restructures dramatically. Coal becomes very valuable. Battery arbitrage opportunities increase.</p>
  </div>

  <h3>Phase 4: Advanced (Rounds 13&ndash;15) &mdash; Policy &amp; complexity</h3>

  <div class="round-card">
    <h4>Round 13: Dunkelflaute &#127761;</h4>
    <div class="round-meta">
      <span class="tag-season">&#10052;&#65039; Winter</span>
      <span class="tag-scenario">Wind at 10% capacity, Solar at 40% capacity</span>
      <span class="tag-time">&#9202; 240s</span>
    </div>
    <p>&ldquo;Dark doldrums&rdquo; &mdash; an extended period of low wind and solar. Thermal generation (coal, gas) becomes essential. Highlights the reliability value of dispatchable generation in a high-renewables grid.</p>
    <div class="tip"><strong>GM tip:</strong> Great opportunity to discuss energy security and &ldquo;firming&rdquo; capacity. Ask: &ldquo;If we retired all coal plants, what would happen during a dunkelflaute?&rdquo;</div>
  </div>

  <div class="round-card">
    <h4>Round 14: Carbon Price World</h4>
    <div class="round-meta">
      <span class="tag-season">&#9728;&#65039; Summer</span>
      <span class="tag-scenario">Carbon price (coal +$45, gas CCGT +$20, peaker +$25) + Demand response (&minus;15% peak)</span>
      <span class="tag-time">&#9202; 240s</span>
    </div>
    <p>A carbon price restructures the merit order. Coal&rsquo;s effective cost jumps from ~$35 to ~$80/MWh. Gas CCGT may now be cheaper than coal! Demand response moderates peak demand. This round shows how policy changes investment signals.</p>
    <div class="tip"><strong>GM tip:</strong> Ask teams before the round: &ldquo;With a carbon price, which assets become more or less valuable?&rdquo; This generates great discussion about the energy transition.</div>
  </div>

  <div class="round-card">
    <h4>Round 15: The Full NEM Challenge &#127942;</h4>
    <div class="round-meta">
      <span class="tag-season">&#9728;&#65039; Summer</span>
      <span class="tag-scenario">Moderate heatwave + Random plant outage</span>
      <span class="tag-time">&#9202; 300s</span>
    </div>
    <p>Final round. Elevated demand, random coal plant outage. Cumulative profit across all 15 rounds determines the winner. Everything teams have learned comes together.</p>
  </div>

  <!-- Section 6: Experienced Replay -->
  <h2 id="experienced-rounds">7. Experienced Replay &mdash; Round-by-Round Guide (4 Rounds)</h2>
  <p>Full portfolio from round 1. One round per season, each with challenging scenarios. Designed for teams who&rsquo;ve played before.</p>

  <div class="round-card">
    <h4>Round 1: Autumn &mdash; Drought &amp; Gas Crisis</h4>
    <div class="round-meta">
      <span class="tag-season">&#127810; Autumn</span>
      <span class="tag-scenario">Drought + Gas price spike</span>
      <span class="tag-time">&#9202; 240s</span>
    </div>
    <p>Hydro at 50%, gas costs +60%. Supply-constrained market. Resource management is key.</p>
  </div>

  <div class="round-card">
    <h4>Round 2: Winter &mdash; Dunkelflaute + Cold Snap</h4>
    <div class="round-meta">
      <span class="tag-season">&#10052;&#65039; Winter</span>
      <span class="tag-scenario">Dunkelflaute + Cold snap</span>
      <span class="tag-time">&#9202; 240s</span>
    </div>
    <p>Low renewables + high heating demand. Thermal generation is critical. Evening is extremely tight.</p>
  </div>

  <div class="round-card">
    <h4>Round 3: Spring &mdash; Renewable Flood</h4>
    <div class="round-meta">
      <span class="tag-season">&#127800; Spring</span>
      <span class="tag-scenario">Negative prices</span>
      <span class="tag-time">&#9202; 240s</span>
    </div>
    <p>Oversupply and negative pricing. Battery arbitrage is the winning strategy. Coal players need to decide whether to bid negative or reprice to higher bands.</p>
  </div>

  <div class="round-card">
    <h4>Round 4: Summer &mdash; Heatwave &amp; Outage &#127942;</h4>
    <div class="round-meta">
      <span class="tag-season">&#9728;&#65039; Summer</span>
      <span class="tag-scenario">Extreme heatwave + Plant outage</span>
      <span class="tag-time">&#9202; 300s</span>
    </div>
    <p>Record demand + capacity constraints. The ultimate test. Winner takes all.</p>
  </div>

  <!-- Section 7: Beginner -->
  <h2 id="beginner-round">8. Beginner Mode</h2>
  <div class="round-card">
    <h4>Single Round: Your First Electricity Market</h4>
    <div class="round-meta">
      <span class="tag-season">&#127810; Autumn</span>
      <span class="tag-assets">Coal + Gas CCGT only</span>
      <span class="tag-time">&#9202; 360s &middot; 2 periods</span>
    </div>
    <p>Simplified introduction with only 2 asset types, 2 periods, and 2 bid bands max. Includes a detailed walkthrough with suggested bids. Very low demand variability so results are predictable.</p>
    <div class="tip"><strong>GM tip:</strong> Use this as a 15-minute warm-up before the main game. After results, walk through the merit order step by step on the main screen. Make sure every team understands clearing price before moving to Quick or Full mode.</div>
  </div>

  <h2 id="progressive-rounds">9. Progressive Learning &mdash; Round-by-Round Guide</h2>
  <p>The Progressive Learning mode builds complexity over 10 rounds. Each round includes <strong>host teaching notes</strong> (displayed in a purple card during briefing) and <strong>educational content slides</strong> for teams.</p>

  <div class="round-card">
    <h4>Round 1: Your First Bid</h4>
    <div class="round-meta"><span class="tag-season">Autumn</span><span class="tag-assets">Coal only</span><span class="tag-time">1 period</span></div>
    <p>Guided walkthrough. Teams see pre-filled bids. Explain: bid = price + quantity, merit order stacking, clearing price concept. Key insight: all dispatched generators earn the same clearing price.</p>
  </div>

  <div class="round-card">
    <h4>Rounds 2&ndash;3: Multiple Periods</h4>
    <div class="round-meta"><span class="tag-season">Autumn</span><span class="tag-assets">Coal only</span><span class="tag-time">2&rarr;4 periods</span></div>
    <p>Teams bid independently. Introduce demand variation across periods. By round 3, teams manage all 4 periods with 5 bid bands and can explore strategic bidding.</p>
  </div>

  <div class="round-card">
    <h4>Round 4: Gas Power Enters</h4>
    <div class="round-meta"><span class="tag-season">Autumn</span><span class="tag-assets">+ Gas CCGT, Peaker</span><span class="tag-time">4 periods</span></div>
    <p>Gas CCGT and peakers unlock. Discuss cost differences: coal ~$35, gas CCGT ~$75, peaker ~$145. Gas only profits when the clearing price exceeds its marginal cost.</p>
  </div>

  <div class="round-card">
    <h4>Rounds 5&ndash;6: Renewables &amp; Battery</h4>
    <div class="round-meta"><span class="tag-season">Spring</span><span class="tag-assets">+ Wind, Solar, Hydro, Battery</span><span class="tag-time">4 periods</span></div>
    <p>Zero-cost renewables reshape the merit order. Hydro has limited water (opportunity cost). Battery (500 MW / 3,000 MWh, 6-hour duration, 92% efficiency) completes the portfolio &mdash; use the charge/idle/discharge toggle with target SOC controls each period. Arbitrage revenue = discharge earnings minus charging cost. Spring brings low demand + strong renewables = potential oversupply.</p>
  </div>

  <div class="round-card">
    <h4>Round 7: Advanced Strategies</h4>
    <div class="round-meta"><span class="tag-season">Autumn</span><span class="tag-assets">Full portfolio</span><span class="tag-time">4 periods</span></div>
    <p>No new assets. Focus on price making, portfolio optimisation, and competitive dynamics. Game theory angle: &ldquo;If everyone bids high, prices spike but nobody gets dispatched.&rdquo;</p>
  </div>

  <div class="round-card">
    <h4>Rounds 8&ndash;10: Crisis Scenarios</h4>
    <div class="round-meta"><span class="tag-scenario">Heatwave</span><span class="tag-scenario">Negative Prices</span><span class="tag-scenario">Plant Outage</span></div>
    <p>Summer heatwave (+40% demand, coal derated), spring negative prices (oversupply), then the ultimate test: heatwave + outage. Highest cumulative profit across all 10 rounds wins!</p>
  </div>

  <!-- Section 9: Game Features -->
  <!-- Section: Facilitation Techniques -->
  <h2 id="facilitation">Facilitation Techniques</h2>

  <div class="highlight">
    <h4 style="margin-top: 0;">&#127919; Top 10 Tips for a Successful Session</h4>
    <ol>
      <li><strong>Test everything beforehand</strong> &mdash; WiFi, projector, server, team devices. Run through at least 2 rounds yourself.</li>
      <li><strong>Start with First Run</strong> for new groups &mdash; lean portfolios mean faster bidding and more discussion time.</li>
      <li><strong>Read the educational slides aloud</strong> during briefing &mdash; don&rsquo;t just skip past them. They set up the learning.</li>
      <li><strong>Use the pause button</strong> if teams are confused &mdash; better to pause and explain than to rush through.</li>
      <li><strong>Walk around the room</strong> during bidding &mdash; check in with each team, answer questions, give hints to struggling teams.</li>
      <li><strong>After each round, discuss results</strong> for 2&ndash;3 minutes &mdash; &ldquo;Who set the clearing price? Why?&rdquo; is the best starting question.</li>
      <li><strong>Celebrate losing teams too</strong> &mdash; a team that bid their gas at $300 and missed dispatch learned something valuable.</li>
      <li><strong>Use surprise events strategically</strong> &mdash; trigger a surprise when energy is flagging or when teams need a challenge.</li>
      <li><strong>Don&rsquo;t rush the final debrief</strong> &mdash; the last 10 minutes of discussion are where the deepest learning happens.</li>
      <li><strong>Have fun!</strong> This is a game. Laughter and competitive banter make the learning stick.</li>
    </ol>
  </div>

  <h3>When to Pause the Game</h3>
  <div class="card">
    <p>Use the <strong>&#9208;&#65039; Pause</strong> button during bidding if:</p>
    <ul>
      <li>Multiple teams are confused about how to bid a new asset type (especially hydro or battery)</li>
      <li>A team is significantly behind and needs help catching up</li>
      <li>You want to explain a scenario event in more detail</li>
      <li>WiFi issues are affecting some teams</li>
      <li>You want to highlight something on the projector screen</li>
    </ul>
    <p>Pausing is always better than letting confused teams submit poor bids &mdash; the learning comes from deliberate strategy choices, not from confusion.</p>
  </div>

  <h3>When to Use Surprise Events</h3>
  <div class="card">
    <p>Surprise events (available from the host sidebar) inject drama and challenge into the game. Best moments to trigger them:</p>
    <ul>
      <li><strong>When teams are coasting:</strong> If all teams are bidding similarly and profits are flat, a demand surge or plant outage shakes things up.</li>
      <li><strong>To reinforce a concept:</strong> After teaching about renewables, trigger a wind surge. After discussing scarcity, trigger a heatwave.</li>
      <li><strong>Between scenarios:</strong> If the current round doesn&rsquo;t have a built-in scenario event, a surprise keeps energy high.</li>
      <li><strong>When time allows:</strong> Don&rsquo;t trigger surprises if you&rsquo;re already running behind schedule.</li>
    </ul>
  </div>

  <h3>Managing Team Dynamics</h3>
  <div class="split">
    <div class="card">
      <h4 style="margin-top: 0;">&#128680; Dominant Teams</h4>
      <p>If one team is running away with the lead:</p>
      <ul>
        <li>Highlight other teams&rsquo; interesting strategies</li>
        <li>Use &ldquo;Edit Demand&rdquo; to tighten or loosen supply</li>
        <li>Remind everyone that the final round often has the biggest swings</li>
        <li>Focus discussion on strategy learning, not just profit numbers</li>
      </ul>
    </div>
    <div class="card">
      <h4 style="margin-top: 0;">&#128148; Disengaged Teams</h4>
      <p>If a team seems lost or disengaged:</p>
      <ul>
        <li>Walk over during bidding and ask what their strategy is</li>
        <li>Suggest using the auto-fill strategy buttons</li>
        <li>Point out their Marginal Cost badges as a starting reference</li>
        <li>After results, specifically highlight their good decisions</li>
      </ul>
    </div>
  </div>

  <h3>Discussion Questions by Topic</h3>
  <div class="card">
    <p>Use these to spark post-round discussion:</p>
    <ul>
      <li><strong>Merit order:</strong> &ldquo;Who was the marginal generator? How much did everyone earn?&rdquo;</li>
      <li><strong>Strategy:</strong> &ldquo;Did anyone reprice capacity to higher bands? What happened to the clearing price?&rdquo;</li>
      <li><strong>Renewables:</strong> &ldquo;How did zero-cost renewables change the clearing price vs last round?&rdquo;</li>
      <li><strong>Battery:</strong> &ldquo;Who made money on their battery? What was the spread between charging and discharging?&rdquo;</li>
      <li><strong>Scenarios:</strong> &ldquo;How would you have bid differently if you knew the heatwave was coming?&rdquo;</li>
      <li><strong>Real world:</strong> &ldquo;This is exactly what happens in the real NEM. Can you see why electricity bills spike during heatwaves?&rdquo;</li>
      <li><strong>Policy:</strong> &ldquo;If you were the energy minister, what policy would you implement based on what you&rsquo;ve seen?&rdquo;</li>
    </ul>
  </div>

  <h3>Keeping Energy Up</h3>
  <div class="tip">
    <ul>
      <li><strong>Pace:</strong> Aim for 5&ndash;8 minutes per round (briefing + bidding + results). Longer rounds lose momentum.</li>
      <li><strong>Timer management:</strong> Adjust bidding time if teams are consistently finishing early (reduce) or struggling (increase).</li>
      <li><strong>Competition:</strong> Update the leaderboard after each round. Teams respond to competitive pressure.</li>
      <li><strong>Variety:</strong> Alternate between teaching moments and competitive rounds. Too much teaching kills energy; too much competition misses the learning.</li>
      <li><strong>Breaks:</strong> For sessions over 60 minutes, take a 5-minute break after the midpoint. Use the pause/lobby as a natural break point.</li>
    </ul>
  </div>

  <h2 id="features">10. Game Features</h2>

  <h3>WiFi Sharing</h3>
  <div class="card">
    <p>In the <strong>Game Setup</strong> screen, you can enter your WiFi network name and password. The game generates a <strong>WiFi QR code</strong> that, when scanned by a phone, automatically connects to the network &mdash; no need to manually type passwords. In the lobby, click <strong>&ldquo;&#128246; Show WiFi for Room&rdquo;</strong> to display the WiFi credentials and QR code on the projector so all participants can connect easily.</p>
    <p>WiFi settings persist across server restarts, so you only need to set them up once.</p>
  </div>

  <h3>Sound Effects</h3>
  <div class="card">
    <p>The game includes procedural sound effects synthesised using the Web Audio API (no audio files needed). Sounds include:</p>
    <ul>
      <li><strong>Countdown beeps</strong> in the final 30 seconds of bidding</li>
      <li><strong>Bid submission</strong> confirmation chime</li>
      <li><strong>All bids in</strong> notification</li>
      <li><strong>Results reveal</strong> &mdash; positive profit fanfare or loss sound</li>
      <li><strong>Clearing price reveal</strong> dramatic sound</li>
    </ul>
    <p>Sound can be muted/unmuted with the &#128266; button in the top bar.</p>
  </div>

  <h3>Dark Mode</h3>
  <div class="card">
    <p>Team screens support <strong>dark mode</strong>, toggled with the &#127769; button. Useful for dimly-lit presentation rooms or evening sessions. The preference is saved to localStorage so it persists across page refreshes.</p>
  </div>

  <h3>Spectator Mode</h3>
  <div class="card">
    <p>Observers can watch the game at <code>/spectate?game=XXXX</code> without taking a team slot. This provides a read-only view of the game state, merit order, and leaderboard. Useful for facilitators, executives, or late arrivals who want to follow along.</p>
  </div>

  <h3>Between-Round Features</h3>
  <div class="card">
    <ul>
      <li><strong>Quick Recap Card:</strong> At the start of each bidding phase, teams see a dismissible card showing last round&rsquo;s clearing prices and a preview of the current round&rsquo;s concept</li>
      <li><strong>Price History Chart:</strong> A line chart tracking clearing prices across all completed rounds, helping teams spot trends</li>
      <li><strong>Market Snapshot:</strong> After results, the host sees a summary infographic with clearing prices per period, the price-setting generator, and market insights</li>
      <li><strong>Teaching Prompts (Progressive mode):</strong> Talking points, discussion questions, and next-round previews for the host</li>
    </ul>
  </div>

  <h3>Bid Presets</h3>
  <div class="card">
    <p>Teams can use <strong>one-tap bid presets</strong> to quickly fill in bids: &ldquo;Play Safe&rdquo; (bid at marginal cost), &ldquo;Go Aggressive&rdquo; (bid high to set prices), or &ldquo;Sit Out&rdquo; (bid at price cap to avoid dispatch). These are especially useful in early rounds when teams are still learning the interface.</p>
  </div>

  <h3>Auto-Advance</h3>
  <div class="card">
    <p>When all teams have submitted their bids, the host dashboard shows a banner: <strong>&ldquo;All bids received &mdash; End Bidding Now?&rdquo;</strong> with a 10-second countdown. This keeps the pace up without the host needing to watch for completions manually. The host can dismiss the banner to keep bidding open longer.</p>
  </div>

  <!-- Section 10: Assets -->
  <h2 id="assets">11. Asset Reference</h2>

  <table>
    <tr>
      <th>Asset</th>
      <th>Icon</th>
      <th>Capacity</th>
      <th>Marginal Cost</th>
      <th>Key Characteristics</th>
      <th>Available From</th>
    </tr>
    <tr>
      <td><strong>Coal</strong></td>
      <td>&#127981;</td>
      <td>800 MW</td>
      <td>$28&ndash;42/MWh</td>
      <td>Baseload. Cheap but slow to start/stop. Derates in extreme heat.</td>
      <td>Round 1</td>
    </tr>
    <tr>
      <td><strong>Gas CCGT</strong></td>
      <td>&#128293;</td>
      <td>350 MW</td>
      <td>$68&ndash;82/MWh</td>
      <td>Mid-merit. Flexible, moderate cost. Profitable when gas sets the price.</td>
      <td>Quick R3 / Full R5</td>
    </tr>
    <tr>
      <td><strong>Gas Peaker</strong></td>
      <td>&#9889;</td>
      <td>150 MW</td>
      <td>$130&ndash;158/MWh</td>
      <td>Peak only. Very fast start. Expensive but earns big in scarcity.</td>
      <td>Quick R3 / Full R5</td>
    </tr>
    <tr>
      <td><strong>Wind</strong></td>
      <td>&#127788;&#65039;</td>
      <td>300 MW</td>
      <td>$0/MWh</td>
      <td>Zero fuel cost. Output varies by weather and wind profile. Auto-bid at $0/MWh &mdash; dispatched first.</td>
      <td>Quick R4 / Full R6</td>
    </tr>
    <tr>
      <td><strong>Solar</strong></td>
      <td>&#9728;&#65039;</td>
      <td>200 MW</td>
      <td>$0/MWh</td>
      <td>Zero fuel cost. Daytime only. Peak output in summer afternoons. Auto-bid at $0/MWh. Zero overnight.</td>
      <td>Quick R4 / Full R6</td>
    </tr>
    <tr>
      <td><strong>Hydro</strong></td>
      <td>&#128167;</td>
      <td>250 MW</td>
      <td>$8/MWh</td>
      <td>Cheap &amp; flexible. Limited water supply. Can only dispatch in ONE period per round &mdash; choose wisely.</td>
      <td>Quick R4 / Full R7</td>
    </tr>
    <tr>
      <td><strong>Battery</strong></td>
      <td>&#128267;</td>
      <td>500 MW / 3,000 MWh</td>
      <td>$0/MWh</td>
      <td>Charge cheap, discharge expensive. 92% round-trip efficiency. 6-hour duration. Target SOC controls. Charging adds to market demand.</td>
      <td>Quick R5 / Full R8</td>
    </tr>
  </table>

  <h3>Renewable Capacity Factors</h3>
  <p>Wind and solar output varies by season and time of day. These are the capacity factors (% of nameplate) used in the game:</p>

  <div class="split">
    <div>
      <h4>Wind Capacity Factors</h4>
      <table>
        <tr><th>Season</th><th>Night</th><th>Morning</th><th>Afternoon</th><th>Evening</th></tr>
        <tr><td>Summer</td><td>25%</td><td>20%</td><td>15%</td><td>30%</td></tr>
        <tr><td>Autumn</td><td>35%</td><td>30%</td><td>25%</td><td>40%</td></tr>
        <tr><td>Winter</td><td>40%</td><td>35%</td><td>30%</td><td>45%</td></tr>
        <tr><td>Spring</td><td>35%</td><td>30%</td><td>25%</td><td>35%</td></tr>
      </table>
    </div>
    <div>
      <h4>Solar Capacity Factors</h4>
      <table>
        <tr><th>Season</th><th>Night</th><th>Morning</th><th>Afternoon</th><th>Evening</th></tr>
        <tr><td>Summer</td><td>0%</td><td>60%</td><td>75%</td><td>10%</td></tr>
        <tr><td>Autumn</td><td>0%</td><td>45%</td><td>55%</td><td>5%</td></tr>
        <tr><td>Winter</td><td>0%</td><td>30%</td><td>40%</td><td>0%</td></tr>
        <tr><td>Spring</td><td>0%</td><td>50%</td><td>65%</td><td>8%</td></tr>
      </table>
    </div>
  </div>

  <!-- Section 11: Scenarios -->
  <h2 id="scenarios">12. Scenario Events Reference</h2>

  <table>
    <tr><th>Scenario</th><th>Effect</th><th>Teaching Point</th></tr>
    <tr>
      <td><strong>Extreme Heatwave</strong></td>
      <td>Afternoon demand +40%, evening +20%, coal &minus;10%</td>
      <td>Extreme weather drives scarcity pricing and thermal derating</td>
    </tr>
    <tr>
      <td><strong>Moderate Heatwave</strong></td>
      <td>Afternoon demand +25%, evening +10%</td>
      <td>Even moderate heat events create supply-demand tension</td>
    </tr>
    <tr>
      <td><strong>Cold Snap</strong></td>
      <td>Evening demand +35%, overnight +15%, wind +30%</td>
      <td>Winter heating demand peaks in the evening; cold fronts bring wind</td>
    </tr>
    <tr>
      <td><strong>Drought</strong></td>
      <td>Hydro capacity &minus;50%</td>
      <td>Water scarcity changes hydro&rsquo;s opportunity cost</td>
    </tr>
    <tr>
      <td><strong>Gas Price Spike</strong></td>
      <td>Gas CCGT and Peaker SRMC +60%</td>
      <td>LNG export competition impacts domestic electricity prices</td>
    </tr>
    <tr>
      <td><strong>Dunkelflaute</strong></td>
      <td>Wind at 10%, solar at 40% of normal</td>
      <td>Extended low-VRE periods require dispatchable generation</td>
    </tr>
    <tr>
      <td><strong>Negative Prices</strong></td>
      <td>Demand &minus;30&ndash;35%, solar +30%, wind +20%</td>
      <td>Oversupply creates negative pricing &mdash; generators pay to stay on</td>
    </tr>
    <tr>
      <td><strong>Plant Outage</strong></td>
      <td>Random coal plant taken offline for one team</td>
      <td>Unexpected outages tighten supply and create uncertainty</td>
    </tr>
    <tr>
      <td><strong>Carbon Price</strong></td>
      <td>Coal +$45, Gas CCGT +$20, Peaker +$25/MWh</td>
      <td>Carbon pricing restructures the merit order and changes investment signals</td>
    </tr>
    <tr>
      <td><strong>Demand Response</strong></td>
      <td>Peak demand &minus;15%, evening &minus;10%</td>
      <td>Industrial demand response moderates peak prices</td>
    </tr>
  </table>

  <!-- Section 12: Surprise Events -->
  <h2 id="surprise-events">13. Surprise Events</h2>

  <p>Surprise events are secret modifications the Game Master can toggle ON during the <strong>briefing phase</strong>, before bidding opens. Teams see the effects (changed demand, outages) but <strong>NOT</strong> the reason. The toggles are found at the bottom of the host sidebar under <strong>&ldquo;&#127922; Game Mechanics&rdquo;</strong>.</p>

  <div class="warning">
    <strong>&#9888;&#65039; Important:</strong> Surprise events modify the round in-place. Once you click &ldquo;Open Bidding,&rdquo; the changes are baked in. Use them intentionally &mdash; they significantly alter the supply-demand balance and can swing results dramatically. Multiple surprise events can be combined for compounding effects.
  </div>

  <h3>Event Reference</h3>
  <table>
    <tr>
      <th>Event</th>
      <th>Category</th>
      <th>Effect</th>
      <th>When to Use</th>
    </tr>
    <tr>
      <td><strong>&#128295; Generator Trip</strong></td>
      <td>Supply</td>
      <td>A random thermal plant loses ~70% capacity. Tightens supply by 200&ndash;500 MW.</td>
      <td>When a round feels too easy or supply margins are comfortable. Creates genuine scarcity.</td>
    </tr>
    <tr>
      <td><strong>&#128200; Demand Surge &mdash; Hot Day</strong></td>
      <td>Demand</td>
      <td>Heatwave increases afternoon &amp; evening demand by 15&ndash;25%.</td>
      <td>For drama and excitement. Great in summer rounds or when you want teams to experience price spikes.</td>
    </tr>
    <tr>
      <td><strong>&#128201; Demand Drop &mdash; Rooftop Solar</strong></td>
      <td>Demand</td>
      <td>Sunny day reduces daytime demand by 15&ndash;25%.</td>
      <td>When you want to demonstrate the duck curve or push prices toward negative territory.</td>
    </tr>
    <tr>
      <td><strong>&#127787;&#65039; Renewable Drought</strong></td>
      <td>Supply</td>
      <td>Wind drops to 30% capacity, solar drops to 40% capacity.</td>
      <td>To highlight dependence on dispatchable generation. Pairs well with high-demand scenarios.</td>
    </tr>
    <tr>
      <td><strong>&#9981; Fuel Price Spike</strong></td>
      <td>Cost</td>
      <td>Gas CCGT and Peaker marginal costs increase by +50%.</td>
      <td>To restructure the merit order mid-game. Gas becomes much more expensive, changing bidding dynamics.</td>
    </tr>
    <tr>
      <td><strong>&#128268; Interconnector Outage</strong></td>
      <td>Demand</td>
      <td>All periods demand increases +10&ndash;20% (region must self-supply).</td>
      <td>To simulate an isolated grid. Tightens the market across all periods, not just peaks.</td>
    </tr>
  </table>

  <h3>How to Use Surprise Events</h3>
  <div class="card">
    <ol>
      <li><strong>Toggle during the briefing phase.</strong> Before you click &ldquo;Open Bidding,&rdquo; scroll to the bottom of the host sidebar and find the &ldquo;&#127922; Game Mechanics&rdquo; panel. Toggle one or more events ON.</li>
      <li><strong>Events are applied when you click &ldquo;Open Bidding.&rdquo;</strong> The modified demand, capacity, or cost values are baked into the round at that moment.</li>
      <li><strong>Teams see a dramatic &ldquo;Developing Situation&rdquo; incident report</strong> with vague descriptions. They see the symptoms (e.g., &ldquo;reports of elevated demand across the network&rdquo;) but NOT the specific cause. This simulates real-world uncertainty &mdash; market participants react to conditions, not explanations.</li>
      <li><strong>Combine events for compounding effects.</strong> For example, a Generator Trip + Demand Surge creates extreme scarcity. A Demand Drop + Renewable Drought partially cancel out. Experiment to find the right level of challenge for your group.</li>
    </ol>
  </div>

  <h3>Tips for Each Event</h3>
  <div class="card">
    <ul>
      <li><strong>&#128295; Generator Trip:</strong> Use when a round feels too comfortable and supply margins are wide. The random nature means one team gets hit hard &mdash; builds empathy for real generator operators dealing with unplanned outages.</li>
      <li><strong>&#128200; Demand Surge:</strong> The go-to event for drama. Afternoon and evening periods become extremely tight. Peakers and batteries become very valuable. Use in summer rounds for maximum realism.</li>
      <li><strong>&#128201; Demand Drop:</strong> Best in spring rounds when renewables are already strong. Can push clearing prices negative during the afternoon. Forces teams to rethink coal and gas strategies.</li>
      <li><strong>&#127787;&#65039; Renewable Drought:</strong> Pairs naturally with winter rounds or when you want to show the value of thermal &ldquo;firming&rdquo; capacity. Without wind and solar, the merit order looks very different.</li>
      <li><strong>&#9981; Fuel Price Spike:</strong> Changes the cost stack without changing supply or demand volumes. Gas plants become more expensive, which can push coal back into favour. Good for discussing LNG export dynamics.</li>
      <li><strong>&#128268; Interconnector Outage:</strong> A steady demand increase across all periods. Less dramatic than a heatwave spike but creates sustained pressure. Good for teaching about grid interconnection and energy security.</li>
    </ul>
  </div>

  <div class="tip">
    <strong>&#128161; Pro tip:</strong> Use surprise events sparingly in early rounds when teams are still learning. Save them for mid-to-late game when teams are confident and need a new challenge. Announce &ldquo;Something unexpected may happen this round...&rdquo; to build anticipation without revealing the details.
  </div>

  <!-- Section 13: Bidding Strategy Reference -->
  <h2 id="strategies">14. Bidding Strategy Reference</h2>

  <p>These are the six core bidding strategies available in the game. Teams can access the full Strategy Guide from the &ldquo;&#129504; Strategies&rdquo; help button during bidding. Below is a concise reference for the Game Master.</p>

  <div class="round-card">
    <h4>&#129001; Price Taker</h4>
    <p>Bid all capacity at $0/MWh. Guaranteed dispatch &mdash; you accept whatever the market pays. This strategy relies entirely on other teams setting a reasonable clearing price. If everyone plays Price Taker, the clearing price collapses to $0 and nobody covers costs.</p>
    <p><strong>Relies on:</strong> Other teams bidding above $0 to set a meaningful clearing price.</p>
    <p><strong>Main risk:</strong> If the clearing price is very low (or negative), you earn little or lose money while being fully dispatched. Best suited for renewables with $0 marginal cost.</p>
  </div>

  <div class="round-card">
    <h4>&#128309; Marginal Cost Bidder</h4>
    <p>Bid every asset at its actual production cost (SRMC). You never lose money on a dispatched megawatt &mdash; the economically rational baseline. Simple to execute and a safe default, but you miss the upside when the market is tight and clearing prices spike well above your costs.</p>
    <p><strong>Relies on:</strong> Nothing &mdash; this is self-sufficient. You break even on marginal dispatch and profit from infra-marginal rent.</p>
    <p><strong>Main risk:</strong> Leaving money on the table in scarcity. When demand exceeds supply, more aggressive bidders capture the price premium you could have earned.</p>
  </div>

  <div class="round-card">
    <h4>&#128992; Price Maker</h4>
    <p>Split capacity into two bands: a cheap &ldquo;dispatch band&rdquo; bid near marginal cost to guarantee most of your fleet runs, plus an expensive &ldquo;price-setting band&rdquo; bid high to try to set the clearing price. If the high band is the marginal unit, it lifts the clearing price for ALL your dispatched capacity. This is the most common real-world strategy.</p>
    <p><strong>Relies on:</strong> Enough demand to reach your price-setting band. If supply is abundant, your expensive band sits idle.</p>
    <p><strong>Main risk:</strong> If the market clears below your price-setting band, that capacity earns nothing. You also risk other teams undercutting you.</p>
  </div>

  <div class="round-card">
    <h4>&#128995; Portfolio Optimizer</h4>
    <p>Each asset plays its optimal role: renewables at $0 for guaranteed dispatch, coal splits into dispatch and price-setting bands, gas CCGT bids at mid-merit, peakers target price spikes, and batteries arbitrage the spread between cheap and expensive periods. This mirrors how a real &ldquo;gentailer&rdquo; (generator-retailer) manages a diverse portfolio.</p>
    <p><strong>Relies on:</strong> Good market reads &mdash; you need to anticipate demand patterns, competitor behaviour, and seasonal conditions to set each asset correctly.</p>
    <p><strong>Main risk:</strong> Complexity. With many moving parts, mistakes are more likely. If you misjudge the market, multiple assets can be mispositioned simultaneously.</p>
  </div>

  <div class="round-card">
    <h4>&#128308; Capacity Repricing</h4>
    <p>Rebid capacity to the market cap ($20,000/MWh), making it unlikely to be dispatched. This tightens supply and can push clearing prices dramatically higher. It is a risky and controversial strategy &mdash; the AER in the real NEM actively monitors for economic withholding.</p>
    <p><strong>Relies on:</strong> Supply already being tight. If other teams have surplus capacity, your repriced capacity is simply not dispatched and you lose revenue.</p>
    <p><strong>Main risk:</strong> Balancing penalties (if enabled) punish teams that reprice too much capacity. Even without penalties, you earn $0 on repriced capacity. If the gambit fails, you lose on both fronts.</p>
  </div>

  <div class="round-card">
    <h4>&#129000; Battery Arbitrageur</h4>
    <p>Focus the strategy around battery storage: set the battery to CHARGE during cheap off-peak or solar-surplus periods, then DISCHARGE at a premium during evening peaks. The arbitrage revenue = discharge earnings minus charging cost minus 8% efficiency loss. Battery Arbitrageur only affects battery settings across all 4 periods, leaving thermal/hydro bids untouched.</p>
    <p><strong>Relies on:</strong> Meaningful price spreads between periods. If clearing prices are flat across the day, the arbitrage opportunity disappears.</p>
    <p><strong>Main risk:</strong> Battery charging adds 500 MW of demand to the market, which can push up the very prices you&rsquo;re trying to buy cheap at. If multiple teams charge simultaneously, the combined load can spike clearing prices dramatically. If peak prices do not materialise (e.g., mild demand or oversupply in the evening), the battery discharges at a low price and the 8% round-trip efficiency loss erodes any slim margin.</p>
  </div>

  <div class="card">
    <h4>Independent Strategy Layers</h4>
    <p>Strategies are now independent layers. Battery Arbitrageur sets battery modes only. Other strategies (Price Taker, Marginal Cost, etc.) affect thermal and hydro assets only. Teams can combine them &mdash; applying Battery Arbitrageur then Price Maker gives the battery arbitrage settings AND thermal price maker pricing. Strategies can be applied to the current period or all periods via a toggle.</p>
  </div>

  <div class="tip">
    <strong>&#128161; Facilitation note:</strong> Encourage teams to try different strategies across rounds rather than sticking with one approach. The game is designed so that no single strategy dominates every scenario &mdash; the best teams adapt to conditions.
  </div>

  <!-- Section 14: Portfolio Strategy -->
  <h2 id="portfolio">15. Portfolio Strategy</h2>

  <p>Once teams have 3+ asset types (typically from Round 4 onward in Progressive Learning), portfolio thinking becomes the key differentiator. The best teams stop optimising each asset individually and start thinking about how their whole fleet works together across different market conditions.</p>

  <div class="round-card">
    <h4>&#127970; Real-World Context: The Gentailer Model</h4>
    <p>In the real NEM, the &ldquo;Big 3&rdquo; &mdash; <strong>AGL</strong>, <strong>Origin</strong>, and <strong>EnergyAustralia</strong> &mdash; operate as &ldquo;gentailers&rdquo; (generator-retailers). They own diverse portfolios spanning coal, gas, wind, solar, hydro, and battery assets. This diversity is a deliberate hedge: when wholesale prices drop (e.g., midday solar flood), generation earns less but retail profits from cheap supply. When prices spike (e.g., evening peak), peakers and batteries earn premium margins. Teams in the game face the same dynamic.</p>
  </div>

  <div class="round-card">
    <h4>&#128200; Three Portfolio Strategies for Teams</h4>
    <p>Encourage teams to think beyond individual asset bidding. Here are three portfolio-level strategies they can apply:</p>

    <p><strong>1. Baseload + Peaker Squeeze</strong></p>
    <p>Bid coal at $0 or marginal cost for guaranteed dispatch (stable revenue floor). Bid the peaker at very high prices targeting peak periods. Coal provides volume; the peaker provides margin when demand spikes. When the peaker sets the clearing price, that high price flows to ALL dispatched assets &mdash; including the cheap coal. Best in high-demand summer/winter rounds.</p>

    <p><strong>2. The Renewable Shield</strong></p>
    <p>Bid renewables at $0 for guaranteed dispatch. During solar-flooded afternoons, the clearing price drops &mdash; but renewables at zero cost are still profitable. Meanwhile, thermal assets are bid higher for the evening when solar drops off. Renewables &ldquo;shield&rdquo; the portfolio during cheap periods; thermals earn during expensive ones. Best in spring/autumn with solar periods.</p>

    <p><strong>3. The Battery Amplifier</strong></p>
    <p>Use the battery to charge during the renewables&rsquo; cheap periods (buying electricity at low prices), then discharge during the evening peak alongside the peaker (double revenue stream). The portfolio creates its own internal arbitrage: renewables suppress prices &rarr; battery charges cheap &rarr; battery discharges at peak rates. Coal and gas bid at marginal cost for steady baseline revenue. Best in any round with batteries, especially spring where solar creates deep midday price troughs.</p>
  </div>

  <div class="tip">
    <strong>&#128161; Teaching tip:</strong> Introduce portfolio thinking at Round 7 (Advanced Strategies) in Progressive Learning. After the round results, ask teams: &ldquo;Which of your assets made a loss this round? Did your portfolio still profit overall?&rdquo; This reframes individual asset losses as portfolio management decisions rather than mistakes. The &ldquo;&#128202; Portfolio&rdquo; help button is available from the bidding screen once teams have 3+ asset types.
  </div>

  <!-- Section 15: Guardrails -->
  <h2 id="guardrails">16. Bidding Guardrails</h2>

  <table>
    <tr><th>Restriction</th><th>Guardrails ON</th><th>Guardrails OFF</th></tr>
    <tr>
      <td>Non-battery assets must bid &gt; 0 MW in every period</td>
      <td>&#10060; Blocked &mdash; submission rejected</td>
      <td>&#9989; Allowed (capacity repricing)</td>
    </tr>
    <tr>
      <td>Warning if &gt;60% of capacity bid at $0/MWh</td>
      <td>&#9888;&#65039; Warning dialog (can dismiss)</td>
      <td>&#9989; No warning</td>
    </tr>
    <tr>
      <td>Below marginal cost warning</td>
      <td colspan="2">&#9888;&#65039; Always shown in bid review (non-blocking)</td>
    </tr>
    <tr>
      <td>Price range</td>
      <td colspan="2">&minus;$1,000 to $20,000/MWh (always enforced)</td>
    </tr>
    <tr>
      <td>Quantity range</td>
      <td colspan="2">0 to asset available MW (always enforced)</td>
    </tr>
    <tr>
      <td>Batteries can bid 0 MW (sit idle)</td>
      <td colspan="2">&#9989; Always allowed</td>
    </tr>
    <tr>
      <td>Renewable assets auto-bid at $0</td>
      <td colspan="2">&#9989; Always (no team action needed)</td>
    </tr>
    <tr>
      <td>Hydro limited to one dispatch period</td>
      <td colspan="2">&#9989; Always enforced</td>
    </tr>
  </table>

  <div class="tip"><strong>Recommendation:</strong> Use guardrails ON for teams new to the NEM. Switch to OFF for experienced players or the Experienced Replay mode, where capacity repricing is a legitimate advanced strategy.</div>

  <!-- Section 16: Tips -->
  <h2 id="tips">17. Tips, Tricks &amp; Facilitation Notes</h2>

  <h3>Pacing the Session</h3>
  <div class="card">
    <ul>
      <li><strong>Don&rsquo;t rush Round 1.</strong> Spend 5&ndash;10 minutes explaining the concept before teams bid. Walk the room and help with the interface.</li>
      <li><strong>Debrief every round.</strong> The walkthrough and dispatch overview are your best teaching tools. Spend 3&ndash;5 minutes narrating what happened: who set the price, who made money, who got caught out.</li>
      <li><strong>Pick up the pace in later rounds.</strong> By round 4&ndash;5, teams should be bidding confidently. Reduce discussion time and let the competitive energy drive engagement.</li>
      <li><strong>Take a break at the technology transition.</strong> When new assets are introduced (Round 3/4 in Quick, Round 5/6 in Full), briefly explain the new asset types and their cost structures before starting the round.</li>
      <li><strong>Build to the climax.</strong> The heatwave and final rounds should feel dramatic. Use the cinematic transitions and sound effects. Announce the leaderboard standings before the final round.</li>
    </ul>
  </div>

  <h3>Team Help Buttons</h3>
  <div class="tip">
    <strong>&#128161; Teams have built-in help:</strong> During bidding, teams can access help resources from the top of their bidding screen: <strong>&ldquo;&#128214; How to Bid&rdquo;</strong> (interface walkthrough), <strong>&ldquo;&#128202; Round Overview&rdquo;</strong> (current round conditions and demand), <strong>&ldquo;&#129504; Strategies&rdquo;</strong> (the full six-strategy guide), <strong>&ldquo;&#9888;&#65039; Common Mistakes&rdquo;</strong> (pitfalls to avoid), and <strong>&ldquo;&#128267; Battery&rdquo;</strong> (8-slide battery explainer &mdash; appears when the team has a battery asset). Remind teams these exist at the start of the session &mdash; they reduce the number of questions you need to field and help slower teams catch up without slowing down the group.
  </div>

  <div class="tip">
    <strong>New Features:</strong>
    <ul>
      <li><strong>Sound effects:</strong> Teams hear countdown beeps, bid confirmation chimes, and results fanfares. They can mute with the &#128266; button.</li>
      <li><strong>Dark mode:</strong> Teams can toggle dark mode with the &#127769; button for dimly-lit rooms.</li>
      <li><strong>Auto-advance:</strong> When all teams submit bids, the host sees a banner with a 5-second countdown before auto-advancing to results.</li>
      <li><strong>Quick Recap Cards:</strong> At the start of each round, teams see a summary of their last round profit and clearing prices.</li>
      <li><strong>Spectator Mode:</strong> Observers can watch at <code>/spectate</code> without taking a team slot.</li>
      <li><strong>Post-Game Report:</strong> After the game, navigate to <code>/report</code> for a printable summary of all standings and clearing prices.</li>
    </ul>
  </div>

  <h3>Dispatch Mechanics</h3>
  <div class="card">
    <p>The game engine mirrors AEMO&rsquo;s NEMDE dispatch process:</p>
    <ol>
      <li>All bid bands from all teams are sorted by price (cheapest first)</li>
      <li>Bands are dispatched up the merit order until demand is met</li>
      <li>The last (most expensive) band dispatched sets the clearing price</li>
      <li><strong>Pro-rata dispatch:</strong> When multiple teams bid the same price at the margin, dispatch is split proportionally by capacity offered &mdash; not &ldquo;first come first served&rdquo;. This means if three teams all bid $75 and only some of their combined capacity is needed, each gets a fair share.</li>
      <li><strong>Battery charging adds to demand:</strong> When batteries charge, their MW is added to consumer demand. This means the merit order must serve more total load, pushing the clearing price higher.</li>
    </ol>
  </div>

  <h3>What to Say Between Rounds</h3>
  <div class="card">
    <p>After each round, use the <strong>dispatch overview</strong> on the host dashboard to narrate the story. Here&rsquo;s a template:</p>
    <ol>
      <li><strong>&ldquo;Let&rsquo;s look at what happened.&rdquo;</strong> Show the merit order walkthrough.</li>
      <li><strong>&ldquo;The clearing price was $X/MWh in [period].&rdquo;</strong> Explain what set the price.</li>
      <li><strong>&ldquo;Team X made the most money because...&rdquo;</strong> Highlight the winning strategy.</li>
      <li><strong>&ldquo;Team Y lost money because...&rdquo;</strong> Explain what went wrong (constructively!).</li>
      <li><strong>&ldquo;For next round, think about...&rdquo;</strong> Set up the next round&rsquo;s challenge.</li>
    </ol>
  </div>

  <h3>Common Team Mistakes to Watch For</h3>
  <div class="card">
    <table>
      <tr><th>Mistake</th><th>What Happens</th><th>What to Say</th></tr>
      <tr>
        <td>Everyone bids $0</td>
        <td>Clearing price = $0, nobody covers costs</td>
        <td>&ldquo;If everyone is a price-taker, who sets the price? You need someone to bid above zero.&rdquo;</td>
      </tr>
      <tr>
        <td>Bidding above price cap</td>
        <td>Not dispatched, earn nothing</td>
        <td>&ldquo;Check your bid prices. The market cap is $20,000/MWh. If you bid higher, you won&rsquo;t be dispatched.&rdquo;</td>
      </tr>
      <tr>
        <td>Forgetting to bid some assets</td>
        <td>Guardrails block submission (or 0 MW bids with guardrails off)</td>
        <td>&ldquo;Make sure you&rsquo;ve bid for every asset in every period. Check the review screen before submitting.&rdquo;</td>
      </tr>
      <tr>
        <td>Bidding coal at peaker prices</td>
        <td>Coal not dispatched, loses money from idle costs</td>
        <td>&ldquo;Look at your marginal cost badge. Coal costs $35/MWh &mdash; bidding it at $150 means it won&rsquo;t run unless demand is extreme.&rdquo;</td>
      </tr>
      <tr>
        <td>Not managing battery modes</td>
        <td>Battery sits idle, misses arbitrage revenue</td>
        <td>&ldquo;Use the charge/idle/discharge toggle and target SOC buttons. Batteries earn from the SPREAD between charging cost and discharge earnings. The 6-hour battery can fully charge or discharge in one period.&rdquo;</td>
      </tr>
      <tr>
        <td>Dispatching hydro in a low-value period</td>
        <td>Hydro water is limited &mdash; save it for the highest-price period. Hold if no period looks profitable enough.</td>
        <td>&ldquo;Check the demand forecast. Evening and afternoon usually have the highest prices.&rdquo;</td>
      </tr>
      <tr>
        <td>Same strategy every round</td>
        <td>Misses seasonal opportunities</td>
        <td>&ldquo;Read the round description! Summer and spring have very different dynamics. Adapt your strategy to the season.&rdquo;</td>
      </tr>
    </table>
  </div>

  <h3>Facilitating Good Discussion</h3>
  <div class="card">
    <h4>Questions to Ask Teams</h4>
    <ul>
      <li>&ldquo;Why did you bid [amount] for your coal plant in the evening?&rdquo;</li>
      <li>&ldquo;What would happen if you repriced 200 MW to the cap and the clearing price doubled?&rdquo;</li>
      <li>&ldquo;With solar flooding the market, should you bid your coal at $0 or reprice it to higher bands?&rdquo;</li>
      <li>&ldquo;If we added a carbon price of $50/tonne, how would that change the merit order?&rdquo;</li>
      <li>&ldquo;Why do batteries love volatile markets?&rdquo;</li>
      <li>&ldquo;In a heatwave, who benefits most &mdash; the coal plant or the gas peaker? Why?&rdquo;</li>
    </ul>

    <h4>Real-World Connections</h4>
    <ul>
      <li><strong>Negative prices:</strong> &ldquo;This happens regularly in the real NEM, especially in spring. South Australia often has negative prices when wind is strong.&rdquo;</li>
      <li><strong>Heatwave pricing:</strong> &ldquo;In January 2019, NEM prices hit $14,500/MWh during a heatwave. Our game cap of $20,000 matches current rules.&rdquo;</li>
      <li><strong>Coal retirement:</strong> &ldquo;Liddell closed in 2023. Eraring is planned for closure. When coal exits, what fills the gap?&rdquo;</li>
      <li><strong>Battery growth:</strong> &ldquo;Hornsdale Power Reserve (Tesla Big Battery) changed how we think about grid storage. Batteries are now the fastest-growing technology in the NEM.&rdquo;</li>
      <li><strong>Duck curve:</strong> &ldquo;California named this phenomenon. Australia&rsquo;s version is even more extreme due to our high rooftop solar penetration.&rdquo;</li>
    </ul>
  </div>

  <h3>Advanced Facilitation: Strategy Workshops</h3>
  <div class="card">
    <p>For experienced groups, consider running strategy workshops between rounds:</p>
    <ul>
      <li><strong>Portfolio allocation exercise:</strong> &ldquo;You have $500M to invest. How would you allocate across coal, gas, wind, solar, and batteries?&rdquo;</li>
      <li><strong>Scenario planning:</strong> &ldquo;How would your bidding change if a carbon price of $75/tonne was introduced?&rdquo;</li>
      <li><strong>Competitor analysis:</strong> &ldquo;Team X has been bidding aggressively. How should you respond?&rdquo;</li>
      <li><strong>Market design:</strong> &ldquo;If you could change one rule about how the NEM works, what would it be?&rdquo;</li>
    </ul>
  </div>

  <h3>End-of-Session Wrap-Up</h3>
  <div class="card">
    <p>After the final round, use the game results to drive a summary discussion:</p>
    <ol>
      <li><strong>Announce the winner</strong> and celebrate! Show the cumulative leaderboard.</li>
      <li><strong>Review the overall story:</strong> How did strategies evolve? Who adapted best to changing conditions?</li>
      <li><strong>Key takeaways:</strong>
        <ul>
          <li>The merit order determines who runs and what everyone gets paid</li>
          <li>Renewables are transforming the market &mdash; zero marginal cost changes everything</li>
          <li>Scarcity creates extreme prices &mdash; this is when peakers and batteries earn their keep</li>
          <li>The energy transition creates winners and losers &mdash; adaptability is key</li>
          <li>Market design (price caps, carbon pricing, capacity mechanisms) shapes investment</li>
        </ul>
      </li>
      <li><strong>Connect to their world:</strong> &ldquo;How does what you&rsquo;ve learned apply to your role?&rdquo;</li>
    </ol>
  </div>

  <!-- Section 17: Troubleshooting -->
  <h2 id="troubleshooting">19. Troubleshooting</h2>

  <div class="card">
    <table>
      <tr><th>Problem</th><th>Solution</th></tr>
      <tr>
        <td>Team can&rsquo;t connect via QR code</td>
        <td>Ensure they&rsquo;re on the same WiFi. Try the direct URL instead of QR. Check if corporate firewalls block WebSocket connections.</td>
      </tr>
      <tr>
        <td>Team disconnected mid-game</td>
        <td>Re-scan the QR code or re-enter the join URL. The game supports reconnection. Their previous bids may be lost for the current round.</td>
      </tr>
      <tr>
        <td>QR code doesn&rsquo;t appear when starting a new game</td>
        <td>This was a known bug (now fixed). If it recurs, refresh the host page and recreate the game.</td>
      </tr>
      <tr>
        <td>Server not responding</td>
        <td>Restart with: <code>npm run server</code> (in the project directory). Check that port 3001 is free.</td>
      </tr>
      <tr>
        <td>Transitions stuck in a loop</td>
        <td>Refresh the browser page. If persistent, restart the server.</td>
      </tr>
      <tr>
        <td>Teams can&rsquo;t submit bids (guardrail error)</td>
        <td>They likely have 0 MW on a non-battery asset. Tell them to add MW to every asset in every period, or toggle guardrails OFF for experienced players.</td>
      </tr>
      <tr>
        <td>Clearing price is always $0</td>
        <td>All teams are bidding too much capacity at $0. Discuss the problem and encourage diverse bidding. Consider enabling guardrails.</td>
      </tr>
      <tr>
        <td>One team is dominating</td>
        <td>Use the balancing mechanic (if enabled). Or use the between-round discussion to help other teams develop better strategies. Remind teams of the strategy dropdown.</td>
      </tr>
      <tr>
        <td>Game feels too slow</td>
        <td>Reduce bidding time (the host can adjust). Shorten debriefs. Skip the beginner mode if teams grasp concepts quickly.</td>
      </tr>
      <tr>
        <td>Port already in use</td>
        <td><code>lsof -ti :3001 | xargs kill -9</code> then restart the server.</td>
      </tr>
    </table>
  </div>

  <div style="margin-top: 3rem; padding: 1.5rem; text-align: center; color: #718096; font-size: 0.85rem; border-top: 1px solid #e2e8f0;">
    <p>GridRival &mdash; Game Master&rsquo;s Guide</p>
    <p>5 game modes &middot; 7 asset types &middot; 4 bidding modes &middot; sound effects &middot; dark mode &middot; WiFi sharing &middot; spectator mode</p>
    <p>Keep this guide handy during sessions. Good luck and have fun!</p>
  </div>
</div>

</body>
</html>`;
}
