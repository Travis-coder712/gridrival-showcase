/**
 * Recommended Improvements — Organised into 3 categories for GridRival
 * Served at /api/recommended-improvements
 */
export function getRecommendedImprovementsHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GridRival &mdash; Recommended Improvements</title>
<style>
  @page { margin: 1.5cm 2cm; size: A4; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1a202c; line-height: 1.7; font-size: 11pt; background: #f7fafc; }
  .container { max-width: 960px; margin: 0 auto; padding: 2rem 2rem 4rem; }
  .header { background: linear-gradient(135deg, #1e3a5f 0%, #0f1b2d 100%); color: white; padding: 2.5rem 2rem; border-radius: 12px; margin-bottom: 2rem; text-align: center; }
  .header h1 { font-size: 2rem; font-weight: 800; margin-bottom: 0.3rem; }
  .header .subtitle { color: #63b3ed; font-size: 1.05rem; }
  .header .date { color: #a0aec0; font-size: 0.85rem; margin-top: 0.5rem; }
  h2 { font-size: 1.5rem; color: #1e3a5f; border-bottom: 3px solid #3182ce; padding-bottom: 0.4rem; margin: 2.5rem 0 1rem; }
  h3 { font-size: 1.15rem; color: #2d3748; margin-top: 1.5rem; margin-bottom: 0.5rem; }
  h4 { font-size: 1rem; color: #4a5568; margin-top: 1rem; margin-bottom: 0.3rem; }
  p { margin-bottom: 0.8rem; }
  ul, ol { margin: 0.5rem 0 1rem 1.5rem; }
  li { margin-bottom: 0.4rem; }
  strong { color: #1a202c; }
  table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem; }
  th, td { border: 1px solid #e2e8f0; padding: 0.6rem 0.8rem; text-align: left; }
  th { background: #1e3a5f; color: white; font-weight: 600; }
  td { vertical-align: top; }
  tr:nth-child(even) td { background: #f7fafc; }
  code { background: #edf2f7; padding: 0.15rem 0.4rem; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.9em; }
  .card { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.2rem 1.5rem; margin: 1rem 0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
  .tip { background: #ebf8ff; border-left: 4px solid #3182ce; padding: 0.8rem 1rem; border-radius: 0 8px 8px 0; margin: 0.8rem 0; }
  .warning { background: #fffbeb; border-left: 4px solid #d69e2e; padding: 0.8rem 1rem; border-radius: 0 8px 8px 0; margin: 0.8rem 0; }
  .highlight { background: #f0fff4; border-left: 4px solid #38a169; padding: 0.8rem 1rem; border-radius: 0 8px 8px 0; margin: 0.8rem 0; }
  .section-card { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.2rem 1.5rem; margin: 1rem 0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); page-break-inside: avoid; }
  .section-card h3 { margin-top: 0; color: #1e3a5f; font-size: 1.1rem; }
  .back-link { display: inline-block; margin-bottom: 1rem; color: #3182ce; text-decoration: none; font-weight: 600; }
  .back-link:hover { text-decoration: underline; }
  .print-btn { display: inline-block; background: #3182ce; color: white; border: none; padding: 0.5rem 1.2rem; border-radius: 8px; font-size: 0.9rem; cursor: pointer; text-decoration: none; margin-left: 0.5rem; }
  .print-btn:hover { background: #2b6cb0; }
  .toc { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.2rem 1.5rem; margin: 1rem 0; }
  .toc ol { margin-left: 1.2rem; }
  .toc ol ol { margin-top: 0.3rem; margin-bottom: 0.3rem; }
  .toc li { margin-bottom: 0.3rem; }
  .toc a { color: #3182ce; text-decoration: none; }
  .toc a:hover { text-decoration: underline; }
  .category-banner { background: linear-gradient(135deg, #1e3a5f 0%, #2d4a7a 100%); color: white; padding: 1rem 1.5rem; border-radius: 10px; margin: 2.5rem 0 1rem; }
  .category-banner h2 { color: white; border-bottom: none; margin: 0; padding: 0; font-size: 1.4rem; }
  .category-banner .cat-desc { color: #bee3f8; font-size: 0.95rem; margin-top: 0.3rem; }
  @media (max-width: 700px) { .container { padding: 1rem; } }
  @media print {
    .no-print { display: none !important; }
    body { background: white; }
    .container { padding: 0; }
    .section-card { page-break-inside: avoid; }
    .category-banner { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
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
    <h1>Recommended Improvements</h1>
    <div class="subtitle">Organised into three categories: IT / Infrastructure, UX, and Gameplay</div>
    <div class="date">GridRival &mdash; February 2026</div>
  </div>

  <!-- Table of Contents -->
  <div class="toc">
    <strong>Contents</strong>
    <ol>
      <li>
        <a href="#cat-it">IT / Infrastructure</a>
        <ol>
          <li><a href="#web-deployment">Web Deployment</a></li>
          <li><a href="#wifi-reliability">WiFi Reliability &amp; Network Setup</a></li>
          <li><a href="#state-persistence">State Persistence &amp; Reliability</a></li>
          <li><a href="#code-quality">Code Quality &amp; Testing</a></li>
          <li><a href="#public-availability">Public Availability</a></li>
        </ol>
      </li>
      <li>
        <a href="#cat-ux">UX Improvements</a>
        <ol>
          <li><a href="#host-experience">Game Maker (Host) Experience</a></li>
          <li><a href="#team-experience">Team Player Experience</a></li>
          <li><a href="#post-game">Post-Game Experience</a></li>
        </ol>
      </li>
      <li>
        <a href="#cat-gameplay">Gameplay Improvements</a>
        <ol>
          <li><a href="#mode-rationalisation">Game Mode Rationalisation</a></li>
          <li><a href="#feature-parity">Feature Parity Across Modes</a></li>
          <li><a href="#new-scenarios">New Scenario Ideas</a></li>
          <li><a href="#mechanics-enhancements">Gameplay Mechanics Enhancements</a></li>
        </ol>
      </li>
    </ol>
  </div>


  <!-- ═══════════════════════════════════════════════════════════ -->
  <!--  CATEGORY 1: IT / INFRASTRUCTURE                           -->
  <!-- ═══════════════════════════════════════════════════════════ -->
  <div class="category-banner" id="cat-it">
    <h2>Category 1: IT / Infrastructure</h2>
    <div class="cat-desc">Deployment, networking, persistence, code quality, and public availability</div>
  </div>


  <!-- 1.1 Web Deployment -->
  <div class="section-card" id="web-deployment">
    <h3>1.1 &nbsp; Web Deployment</h3>
    <p>GridRival currently runs on a local network only &mdash; a Node.js server with a Vite-built React frontend. Moving to a hosted environment opens up remote play and eliminates venue WiFi dependency.</p>
    <ul>
      <li><strong>Docker containerisation:</strong> Single Dockerfile with multi-stage build (build frontend, then serve from Node). Consider Docker Compose for dev vs prod configurations.</li>
      <li><strong>Cloud hosting options:</strong> AWS (EC2 / ECS / Fargate), Google Cloud Run, Azure Container Instances, Railway, Render, Fly.io. All support containerised Node.js apps.</li>
      <li><strong>CDN for static assets:</strong> Vite build output could be served from Cloudflare or Vercel edge for faster initial page loads.</li>
      <li><strong>Domain + HTTPS:</strong> Consider a <code>gridrival.app</code> or <code>gridrival.energy</code> domain with Let&rsquo;s Encrypt SSL.</li>
    </ul>
    <div class="warning">
      <strong>Considerations:</strong> WebSocket support is required (rules out some static hosts). Session state is currently in-memory on a single server. No database is required at present &mdash; but adding one would unlock persistence and multi-server scaling.
    </div>
  </div>


  <!-- 1.2 WiFi Reliability -->
  <div class="section-card" id="wifi-reliability">
    <h3>1.2 &nbsp; WiFi Reliability &amp; Network Setup</h3>
    <p>When running locally, all player devices must connect to the same WiFi network as the host machine. Reliability of that network is critical to a smooth session.</p>
    <ul>
      <li><strong>Current approach:</strong> Local WiFi network, all devices connect to the same SSID. Works well for small groups on a good network.</li>
      <li><strong>Dedicated WiFi access point:</strong> A dedicated router/AP (e.g., TP-Link travel router) avoids competing with corporate WiFi. Gives the host full control over the network.</li>
      <li><strong>WiFi dongle / portable hotspot:</strong> A USB WiFi adapter on the host laptop can create an ad-hoc network. Pros: portable, no extra hardware. Cons: limited range, device compatibility varies.</li>
      <li><strong>Mesh networking:</strong> For larger rooms, a mesh system (e.g., Google Nest WiFi) provides broader coverage across the space.</li>
    </ul>
    <div class="tip">
      <strong>Venue checklist:</strong> Test WiFi before the session. Check max simultaneous device count. Consider wired ethernet for the host machine. Have a QR code ready for WiFi credentials (the game already supports this).
    </div>
    <p><strong>Fallback:</strong> If WiFi drops mid-game, the game state is preserved in server memory. Teams can reconnect and resume where they left off &mdash; no progress is lost.</p>
  </div>


  <!-- 1.3 State Persistence -->
  <div class="section-card" id="state-persistence">
    <h3>1.3 &nbsp; State Persistence &amp; Reliability</h3>
    <p>All game state is currently held in-memory (<code>Map</code> objects in GameEngine). A server restart means the game is lost.</p>
    <ul>
      <li><strong>File-based backup:</strong> Auto-save game state to a JSON file after each round. Restore from the file on server restart. Simple, no dependencies.</li>
      <li><strong>Optional database:</strong> SQLite for single-server deployments, PostgreSQL for multi-server. Store games, rounds, results, and team data.</li>
      <li><strong>Auto-save cadence:</strong> Save after each phase transition (briefing shown, bidding ends, results calculated). Each snapshot is approximately 5 KB per game.</li>
    </ul>
    <div class="highlight">
      <strong>Quick win:</strong> File-based JSON backup is low effort and eliminates the most common failure mode (accidental server restart during a session).
    </div>
  </div>


  <!-- 1.4 Code Quality -->
  <div class="section-card" id="code-quality">
    <h3>1.4 &nbsp; Code Quality &amp; Testing</h3>
    <ul>
      <li><strong>TypeScript strictness:</strong> Enable stricter <code>tsconfig</code> options such as <code>noUncheckedIndexedAccess</code> and <code>exactOptionalPropertyTypes</code> to catch more bugs at compile time.</li>
      <li><strong>Test coverage:</strong> Currently no automated tests. Priority areas: unit tests for GameEngine dispatch logic, integration tests for socket event handlers, snapshot tests for round configuration validity.</li>
      <li><strong>Linting:</strong> ESLint with the TypeScript plugin for code quality rules. Prettier for consistent formatting across the codebase.</li>
      <li><strong>CI/CD:</strong> GitHub Actions workflow that runs build + type-check + lint on every pull request. Prevents regressions from merging.</li>
    </ul>
  </div>


  <!-- 1.5 Public Availability -->
  <div class="section-card" id="public-availability">
    <h3>1.5 &nbsp; Public Availability</h3>
    <p>If GridRival moves beyond local-network use to a publicly accessible deployment, several additional concerns arise.</p>
    <ul>
      <li><strong>Authentication:</strong> Currently none. For public hosting, add a simple game PIN system or host authentication to prevent unauthorised game creation.</li>
      <li><strong>Scaling:</strong> Each game is independent &mdash; horizontal scaling is possible with sticky sessions (WebSocket affinity). A load balancer routes each game&rsquo;s connections to the same server instance.</li>
      <li><strong>Rate limiting:</strong> Protect against abuse if publicly accessible. Limit game creation, connection attempts, and bid submissions per IP.</li>
      <li><strong>Analytics:</strong> Track games played, round durations, and common bidding strategies for research purposes. Useful for understanding how people learn energy markets.</li>
    </ul>
  </div>


  <!-- ═══════════════════════════════════════════════════════════ -->
  <!--  CATEGORY 2: UX IMPROVEMENTS                               -->
  <!-- ═══════════════════════════════════════════════════════════ -->
  <div class="category-banner" id="cat-ux">
    <h2>Category 2: UX Improvements</h2>
    <div class="cat-desc">Host experience, team player experience, and post-game experience</div>
  </div>


  <!-- 2.1 Host Experience -->
  <div class="section-card" id="host-experience">
    <h3>2.1 &nbsp; Game Maker (Host) Experience</h3>
    <ul>
      <li><strong>Game creation flow:</strong> Wizard-style setup with mode selection, team count configuration, and a preview of the game structure before launching.</li>
      <li><strong>Round customisation:</strong> Allow hosts to customise individual round parameters (demand levels, scenarios, timer duration) before starting, rather than relying entirely on presets.</li>
      <li><strong>Demand editor:</strong> Visual demand curve editor (drag points on a chart) instead of numeric input. Makes it intuitive to shape the demand profile for each period.</li>
      <li><strong>Mid-game controls:</strong> Already have pause/resume, timer adjust, surprise events, and jump-to-round. Consider adding: mid-round demand override, per-team messaging, and a &ldquo;replay round&rdquo; option.</li>
      <li><strong>Results presentation:</strong> Animated merit order reveal, team-by-team profit breakdown, and a &ldquo;best play&rdquo; analysis showing what the optimal strategy would have been.</li>
      <li><strong>Game templates:</strong> Save and load custom game configurations so hosts can refine their setup across sessions.</li>
    </ul>
  </div>


  <!-- 2.2 Team Player Experience -->
  <div class="section-card" id="team-experience">
    <h3>2.2 &nbsp; Team Player Experience</h3>
    <ul>
      <li><strong>Mobile optimisation:</strong> The bidding interface works on phones but could be more thumb-friendly. Larger touch targets (minimum 44px), swipe navigation between periods, and a bottom-anchored submit button.</li>
      <li><strong>Accessibility:</strong> Screen reader support, high-contrast mode, and full keyboard navigation for the bidding interface. Ensures inclusivity in diverse groups.</li>
      <li><strong>Clearer onboarding:</strong> First-time players get a 30-second animated intro explaining the core concept. Progressive disclosure of advanced features so the interface never overwhelms.</li>
      <li><strong>Real-time feedback:</strong> Show estimated profit as bids are adjusted, based on the previous round&rsquo;s clearing price. Helps teams understand the impact of their choices before submitting.</li>
      <li><strong>Team collaboration:</strong> Multiple devices per team with synced state. One team member submits, but all see the current bids and can discuss. Currently single-device per team.</li>
    </ul>
  </div>


  <!-- 2.3 Post-Game Experience -->
  <div class="section-card" id="post-game">
    <h3>2.3 &nbsp; Post-Game Experience</h3>
    <ul>
      <li><strong>Enhanced results dashboard:</strong> Game-wide statistics, strategy evolution charts showing how each team&rsquo;s approach changed over rounds, and &ldquo;what-if&rdquo; scenario comparisons.</li>
      <li><strong>Export options:</strong> PDF report of all rounds with charts, CSV of raw bid/dispatch data for further analysis, and a shareable results link that works without the server running.</li>
      <li><strong>Leaderboard sharing:</strong> Social-media-friendly results card showing team name, rank, and total profit. Easy to screenshot and share.</li>
      <li><strong>Educational Compendium:</strong> Already being built &mdash; a comprehensive post-game reference document linking game concepts to real NEM dynamics.</li>
    </ul>
  </div>


  <!-- ═══════════════════════════════════════════════════════════ -->
  <!--  CATEGORY 3: GAMEPLAY IMPROVEMENTS                         -->
  <!-- ═══════════════════════════════════════════════════════════ -->
  <div class="category-banner" id="cat-gameplay">
    <h2>Category 3: Gameplay Improvements</h2>
    <div class="cat-desc">Mode rationalisation, feature parity, new scenarios, and mechanics enhancements</div>
  </div>


  <!-- 3.1 Game Mode Rationalisation -->
  <div class="section-card" id="mode-rationalisation">
    <h3>3.1 &nbsp; Game Mode Rationalisation</h3>
    <p>The current 6 modes have evolved organically. Several overlap in target audience and structure. Below is an analysis with recommendations.</p>

    <table>
      <tr>
        <th>Mode</th>
        <th>Rounds</th>
        <th>Duration</th>
        <th>Status</th>
        <th>Recommendation</th>
      </tr>
      <tr>
        <td><strong>First Run</strong></td>
        <td>8</td>
        <td>45&ndash;60 min</td>
        <td>Best starting mode. Lean portfolio (4 assets), good teaching notes, progressive unlock.</td>
        <td><strong>Recommended default.</strong> Best balance of depth and time.</td>
      </tr>
      <tr>
        <td><strong>Beginner</strong></td>
        <td>1</td>
        <td>10&ndash;15 min</td>
        <td>Single guided round. Good for demos only.</td>
        <td>Keep for quick demos. Consider expanding to 2&ndash;3 rounds.</td>
      </tr>
      <tr>
        <td><strong>Progressive Learning</strong></td>
        <td>10</td>
        <td>90&ndash;120 min</td>
        <td>Full portfolio, builds complexity. Overlaps significantly with Quick Game (both 8&ndash;10 rounds, progressive unlock).</td>
        <td>Consider merging with Quick Game or differentiating more clearly. Progressive has better teaching notes.</td>
      </tr>
      <tr>
        <td><strong>Quick Game</strong></td>
        <td>8</td>
        <td>60&ndash;90 min</td>
        <td>Full portfolio, scenarios. Similar progression to Progressive but with scenarios earlier.</td>
        <td>Overlaps with Progressive. Differentiate: Quick = scenarios focus, Progressive = learning focus?</td>
      </tr>
      <tr>
        <td><strong>Full Game</strong></td>
        <td>15</td>
        <td>2.5&ndash;3.5 hrs</td>
        <td>Most comprehensive. May be too long for most groups.</td>
        <td>Consider a 10&ndash;12 round variant. Some rounds could be combined.</td>
      </tr>
      <tr>
        <td><strong>Experienced Replay</strong></td>
        <td>4</td>
        <td>30&ndash;45 min</td>
        <td>One round per season, full portfolio. Well-positioned for returning players.</td>
        <td>Keep as-is. Good for replay sessions.</td>
      </tr>
    </table>

    <div class="card">
      <h4 style="margin-top: 0;">Key Observations</h4>
      <ul>
        <li><strong>First Run</strong> should be promoted as the default starting mode for new hosts and groups.</li>
        <li><strong>Progressive Learning</strong> and <strong>Quick Game</strong> overlap significantly &mdash; consider differentiating them more clearly (learning-focused vs scenario-focused) or merging into a single configurable mode.</li>
        <li><strong>Full Game&rsquo;s</strong> 15 rounds may be excessive for most sessions &mdash; a 10&ndash;12 round &ldquo;Extended&rdquo; variant could serve the same audience with tighter pacing.</li>
        <li>Not all modes benefit equally from recent improvements (<code>batteryMiniGame</code>, <code>portfolioExplainer</code>, <code>hostTeachingNotes</code>).</li>
        <li>Consider a <strong>&ldquo;Custom&rdquo; mode</strong> where hosts can pick and sequence rounds from any existing mode, building a bespoke game for their audience.</li>
      </ul>
    </div>
  </div>


  <!-- 3.2 Feature Parity -->
  <div class="section-card" id="feature-parity">
    <h3>3.2 &nbsp; Feature Parity Across Modes</h3>
    <p>Recent improvements exist in some modes but not all. Ensuring consistency across modes improves the experience regardless of which mode a host selects.</p>

    <table>
      <tr>
        <th>Feature</th>
        <th>Current Coverage</th>
        <th>Recommendation</th>
      </tr>
      <tr>
        <td><code>batteryMiniGame</code></td>
        <td>Only in modes with battery-introduction rounds</td>
        <td>Add to all rounds where battery is first introduced</td>
      </tr>
      <tr>
        <td><code>portfolioExplainer</code></td>
        <td>Only in First Run round 7</td>
        <td>Could benefit Progressive Learning and Full Game at similar portfolio milestones</td>
      </tr>
      <tr>
        <td><code>hostTeachingNotes</code></td>
        <td>Now added to all modes</td>
        <td>Complete &mdash; maintain as new rounds are added</td>
      </tr>
      <tr>
        <td><code>walkthrough</code> / <code>suggestedBids</code></td>
        <td>Beginner, First Run R1, Full Game R1</td>
        <td>Consider adding to Progressive Learning R1</td>
      </tr>
      <tr>
        <td><code>seasonalGuidance</code></td>
        <td>Most scenario rounds but not all</td>
        <td>Ensure consistency across all scenario rounds in every mode</td>
      </tr>
      <tr>
        <td><code>uiComplexity</code></td>
        <td>Only in First Run</td>
        <td>Could benefit Progressive Learning &mdash; gradually reveal UI features</td>
      </tr>
    </table>
  </div>


  <!-- 3.3 New Scenario Ideas -->
  <div class="section-card" id="new-scenarios">
    <h3>3.3 &nbsp; New Scenario Ideas</h3>
    <p>Fresh scenarios keep the game interesting for returning players and cover additional real-world NEM dynamics.</p>
    <ul>
      <li><strong>Interconnector failure:</strong> Isolate NEM regions with different prices in each. Teaches the role of interconnectors in price convergence.</li>
      <li><strong>Demand response event:</strong> Large industrial loads shed 10% during peak. Demonstrates demand-side participation in the market.</li>
      <li><strong>EV charging surge:</strong> Evening demand spike from electric vehicle charging adds a new peak pattern on top of traditional demand.</li>
      <li><strong>Hydrogen electrolyser:</strong> New flexible demand source that can shift between periods. Introduces the concept of dispatchable demand.</li>
      <li><strong>Coal retirement:</strong> Force coal offline permanently mid-game, requiring an immediate strategy pivot. Mirrors real-world closures like Liddell and Eraring.</li>
      <li><strong>Renewable investment round:</strong> Between rounds, teams choose to invest profits in new wind, solar, or battery capacity. Links operational bidding to longer-term investment decisions.</li>
    </ul>
  </div>


  <!-- 3.4 Gameplay Mechanics Enhancements -->
  <div class="section-card" id="mechanics-enhancements">
    <h3>3.4 &nbsp; Gameplay Mechanics Enhancements</h3>
    <p>These are larger-scope ideas that would deepen the simulation significantly. Each represents a substantial development effort but would move GridRival closer to a comprehensive NEM training platform.</p>
    <ul>
      <li><strong>Multi-region NEM:</strong> Simulate interconnectors between QLD / NSW / VIC / SA / TAS with flow limits. Teams could operate in different regions with inter-regional price separation when lines are congested.</li>
      <li><strong>Retail contracts:</strong> Teams also manage a retail customer base, introducing hedging and risk management. Profit depends on both wholesale trading and retail margin.</li>
      <li><strong>Investment decisions:</strong> Between rounds, invest accumulated profits in new generation capacity. Adds a strategic layer beyond per-round bidding.</li>
      <li><strong>Environmental scoring:</strong> Track carbon emissions alongside profit, creating a dual-optimisation challenge. Teams must balance financial returns with environmental outcomes.</li>
      <li><strong>Dynamic demand response:</strong> Demand adjusts based on the clearing price (price elasticity). High prices cause some demand to withdraw, moderating extreme spikes.</li>
    </ul>
    <div class="tip">
      <strong>Implementation note:</strong> These features are best introduced as optional modules that can be toggled on/off per game, rather than being built into the core flow. This preserves simplicity for introductory sessions while adding depth for advanced groups.
    </div>
  </div>


  <!-- Footer -->
  <div style="margin-top: 3rem; padding: 1.5rem; text-align: center; color: #718096; font-size: 0.85rem; border-top: 1px solid #e2e8f0;">
    <p>GridRival &mdash; Recommended Improvements</p>
    <p>Prepared by Claude, informed by development experience and NEM domain knowledge</p>
  </div>

</div>
</body>
</html>`;
}
