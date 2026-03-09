/**
 * Technical Notes — for IT teams evaluating deployment / transfer
 * Served at /api/notes/technical
 */
export function getTechnicalNotesHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GridRival — Technical Notes for IT Teams</title>
<style>
  @page { margin: 1.5cm 2cm; size: A4; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1a202c; line-height: 1.7; font-size: 11pt; background: #f7fafc; }
  .container { max-width: 900px; margin: 0 auto; padding: 2rem 2rem 4rem; }
  .header { background: linear-gradient(135deg, #1e3a5f 0%, #0f1b2d 100%); color: white; padding: 2.5rem 2rem; border-radius: 12px; margin-bottom: 2rem; text-align: center; }
  .header h1 { font-size: 2rem; font-weight: 800; margin-bottom: 0.3rem; }
  .header .subtitle { color: #63b3ed; font-size: 1.1rem; }
  .header .date { color: #a0aec0; font-size: 0.85rem; margin-top: 0.5rem; }
  h2 { font-size: 1.4rem; color: #1e3a5f; border-bottom: 3px solid #3182ce; padding-bottom: 0.4rem; margin: 2rem 0 1rem; }
  h3 { font-size: 1.15rem; color: #2d3748; margin-top: 1.3rem; margin-bottom: 0.5rem; }
  p { margin-bottom: 0.7rem; }
  ul, ol { margin: 0.5rem 0 1rem 1.5rem; }
  li { margin-bottom: 0.4rem; }
  .card { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.2rem 1.5rem; margin: 1rem 0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
  .highlight { background: #ebf8ff; border-left: 4px solid #3182ce; padding: 0.8rem 1rem; border-radius: 0 8px 8px 0; margin: 0.8rem 0; }
  .warning { background: #fffbeb; border-left: 4px solid #d69e2e; padding: 0.8rem 1rem; border-radius: 0 8px 8px 0; margin: 0.8rem 0; }
  .risk-high { background: #fff5f5; border-left: 4px solid #e53e3e; padding: 0.8rem 1rem; border-radius: 0 8px 8px 0; margin: 0.8rem 0; }
  .risk-low { background: #f0fff4; border-left: 4px solid #38a169; padding: 0.8rem 1rem; border-radius: 0 8px 8px 0; margin: 0.8rem 0; }
  table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.95rem; }
  th { background: #1e3a5f; color: white; text-align: left; padding: 0.6rem 0.8rem; font-weight: 600; }
  td { padding: 0.5rem 0.8rem; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) td { background: #f7fafc; }
  code { background: #edf2f7; padding: 0.15rem 0.4rem; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.9em; }
  pre { background: #1a202c; color: #e2e8f0; padding: 1rem 1.2rem; border-radius: 8px; overflow-x: auto; margin: 0.8rem 0; font-size: 0.85rem; line-height: 1.5; }
  pre code { background: none; padding: 0; color: inherit; }
  .badge { display: inline-block; font-size: 0.75rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 20px; color: white; }
  .badge-blue { background: #3182ce; }
  .badge-green { background: #38a169; }
  .badge-amber { background: #d69e2e; }
  .badge-red { background: #e53e3e; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  @media (max-width: 700px) { .two-col { grid-template-columns: 1fr; } }
  .back-link { display: inline-block; margin-bottom: 1rem; color: #3182ce; text-decoration: none; font-weight: 600; }
  .back-link:hover { text-decoration: underline; }
  .toc { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.2rem 1.5rem; margin: 1rem 0; }
  .toc a { color: #3182ce; text-decoration: none; }
  .toc a:hover { text-decoration: underline; }
  .toc ol { margin: 0.5rem 0 0 1.5rem; }
  .toc li { margin-bottom: 0.3rem; }
  .print-btn { display: inline-block; background: #3182ce; color: white; border: none; padding: 0.5rem 1.2rem; border-radius: 8px; font-size: 0.9rem; cursor: pointer; text-decoration: none; margin-left: 0.5rem; }
  .print-btn:hover { background: #2c5282; }
  @media print { .no-print { display: none !important; } body { background: white; } .container { padding: 0; } }
</style>
</head>
<body>
<div class="container">
  <div class="no-print" style="display: flex; justify-content: space-between; align-items: center;">
    <a href="/" class="back-link">&larr; Back to Game</a>
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="header">
    <h1>GridRival</h1>
    <div class="subtitle">Technical Notes &amp; Deployment Guide</div>
    <div class="date">Prepared February 2026 | For IT &amp; Engineering Teams</div>
  </div>

  <div class="toc">
    <strong>Contents</strong>
    <ol>
      <li><a href="#overview">Application Overview</a></li>
      <li><a href="#architecture">Architecture &amp; Technology Stack</a></li>
      <li><a href="#software">Complete Software Inventory</a></li>
      <li><a href="#infrastructure">Infrastructure Requirements</a></li>
      <li><a href="#deployment">Deployment to an Internal System</a></li>
      <li><a href="#revisions">Development Revision History</a></li>
      <li><a href="#risks">Risk Assessment</a></li>
      <li><a href="#transfer">Transfer Difficulty Assessment</a></li>
      <li><a href="#recommendations">Recommendations</a></li>
    </ol>
  </div>

  <h2 id="overview">1. Application Overview</h2>
  <div class="card">
    <p><strong>GridRival</strong> is a real-time multiplayer web application that simulates Australia's National Electricity Market (NEM). It is used as a training and educational tool where participants (organised into teams) bid electricity generation into a simulated wholesale market. A merit order dispatch algorithm determines which generators run and at what price&mdash;teaching participants how the NEM works in practice.</p>
    <p><strong>Key capabilities:</strong></p>
    <ul>
      <li>Up to 15 teams play simultaneously from their phones/laptops</li>
      <li>A host controls the game from a dashboard (typically projected onto a large screen)</li>
      <li>Real-time synchronisation via WebSockets&mdash;all players see results at the same time</li>
      <li>6 game modes: Beginner (10 min), First Run (45&ndash;60 min), Quick (60&ndash;90 min), Full (2.5&ndash;3.5 hrs), Experienced Replay (30&ndash;45 min), Progressive Learning (90&ndash;120 min)</li>
      <li>7 asset types modelling real NEM generators: coal, gas CCGT, gas peaker, hydro, wind, solar, battery</li>
      <li>Scenario events: heatwave, drought, carbon price, plant outage, negative prices, and more</li>
      <li>Educational features: animated merit order walkthrough, bid review warnings, pre-read document</li>
      <li>Sound effects via Web Audio API (countdown beeps, bid confirmation, results fanfare&mdash;no audio files)</li>
      <li>Dark mode toggle with localStorage persistence</li>
      <li>WiFi QR code sharing for easy venue setup</li>
      <li>Auto-advance when all team bids are submitted</li>
      <li>Spectator mode for read-only game observation</li>
      <li>Post-game printable report with round-by-round analysis</li>
      <li>Duplicate team name prevention</li>
      <li>Host teaching notes per round</li>
      <li>Historical clearing price tracking across rounds</li>
      <li>Battery charge/discharge/arbitrage mechanics with SOC tracking</li>
      <li>4 distinct bidding interfaces: thermal, renewables (auto-bid), hydro (single-period), battery (charge/idle/discharge)</li>
      <li>Pro-rata dispatch for tied bids (matching real AEMO NEMDE)</li>
      <li>Surprise events system with dramatic incident reports</li>
      <li>Progressive UI complexity (minimal &rarr; standard &rarr; full) in First Run mode</li>
      <li>Round Bidding Guide overlay showing what changed each round</li>
      <li>Battery Arbitrage Mini-Game (interactive 24-hour exercise)</li>
      <li>Educational Compendium (post-game take-home reference)</li>
      <li>Jump-to-round for host mid-game navigation</li>
    </ul>
  </div>

  <h2 id="architecture">2. Architecture &amp; Technology Stack</h2>

  <h3>High-Level Architecture</h3>
  <div class="card">
    <p>The application follows a <strong>client-server architecture</strong> with real-time communication:</p>
    <pre><code>┌─────────────────────────────────────────────────────┐
│                     Clients                         │
│  Host Dashboard (browser)  │  Team phones (browser) │
│         React SPA          │       React SPA        │
└────────────┬───────────────┴───────────┬────────────┘
             │  HTTP REST + WebSocket    │
             └───────────┬───────────────┘
                         │
            ┌────────────▼────────────┐
            │     Node.js Server      │
            │  Express + Socket.IO    │
            │                         │
            │  ┌───────────────────┐  │
            │  │   Game Engine     │  │
            │  │ Merit Order Algo  │  │
            │  │ Profit Calculator │  │
            │  │ Round Analyser    │  │
            │  └───────────────────┘  │
            │                         │
            │  In-memory state (no DB)│
            └─────────────────────────┘</code></pre>
    <p><strong>There is no database.</strong> All game state is held in-memory on the server process. This simplifies deployment but means game data is lost if the server restarts.</p>
  </div>

  <h3>Frontend Stack</h3>
  <div class="card">
    <table>
      <tr><th>Technology</th><th>Version</th><th>Purpose</th></tr>
      <tr><td>React</td><td>19.x</td><td>UI component framework</td></tr>
      <tr><td>TypeScript</td><td>5.7</td><td>Type-safe JavaScript</td></tr>
      <tr><td>Vite</td><td>6.0</td><td>Build tool and dev server</td></tr>
      <tr><td>React Router DOM</td><td>7.1</td><td>Client-side page routing</td></tr>
      <tr><td>React.lazy() + Suspense</td><td>React 19.x</td><td>Route-level code splitting for bundle optimisation</td></tr>
      <tr><td>Framer Motion</td><td>12.x</td><td>Animations and transitions</td></tr>
      <tr><td>Recharts</td><td>2.15</td><td>Data visualisation (charts, graphs)</td></tr>
      <tr><td>TailwindCSS</td><td>4.x</td><td>Utility-first CSS styling</td></tr>
      <tr><td>Socket.IO Client</td><td>4.8.1</td><td>WebSocket communication with server</td></tr>
      <tr><td>Web Audio API</td><td>Browser-native</td><td>Procedural sound effects (no audio files needed)</td></tr>
      <tr><td>ThemeContext</td><td>Custom</td><td>Dark mode support with localStorage persistence</td></tr>
    </table>

    <div class="highlight">
      <strong>Bundle optimisation:</strong> Route-level code splitting via <code>React.lazy()</code> reduced the main bundle from ~1180 KB to ~432 KB. Each route (host, team, spectator, report) is loaded on demand, improving initial page load times significantly.
    </div>
  </div>

  <h3>Backend Stack</h3>
  <div class="card">
    <table>
      <tr><th>Technology</th><th>Version</th><th>Purpose</th></tr>
      <tr><td>Node.js</td><td>18+ (LTS)</td><td>JavaScript runtime</td></tr>
      <tr><td>Express</td><td>4.21</td><td>HTTP web framework</td></tr>
      <tr><td>Socket.IO</td><td>4.8.1</td><td>Real-time bidirectional events (WebSockets)</td></tr>
      <tr><td>TypeScript</td><td>5.7</td><td>Type-safe server code</td></tr>
      <tr><td>tsx</td><td>4.19</td><td>Run TypeScript directly without separate compile step</td></tr>
      <tr><td>UUID</td><td>10.x</td><td>Generate unique game &amp; team identifiers</td></tr>
      <tr><td>QRCode</td><td>1.5.4</td><td>Generate QR codes for team joining and WiFi sharing (standard <code>WIFI:</code> format)</td></tr>
      <tr><td>CORS</td><td>2.x</td><td>Cross-origin request handling</td></tr>
      <tr><td>ngrok</td><td>5.0-beta</td><td>Optional public tunnel for remote access</td></tr>
    </table>
  </div>

  <h3>Routes &amp; API Endpoints</h3>
  <div class="card">
    <table>
      <tr><th>Route</th><th>Method</th><th>Purpose</th></tr>
      <tr><td><code>/</code></td><td>GET</td><td>Landing page</td></tr>
      <tr><td><code>/host</code></td><td>GET</td><td>Host dashboard (game control)</td></tr>
      <tr><td><code>/team/join</code></td><td>GET</td><td>Team join page</td></tr>
      <tr><td><code>/team/game</code></td><td>GET</td><td>Team game interface</td></tr>
      <tr><td><code>/spectate</code></td><td>GET</td><td>Spectator mode (read-only)</td></tr>
      <tr><td><code>/report</code></td><td>GET</td><td>Post-game printable report</td></tr>
      <tr><td><code>/guide</code></td><td>GET</td><td>Quick Reference Guide (React SPA)</td></tr>
      <tr><td><code>/guides</code></td><td>GET</td><td>Guides index page (React SPA)</td></tr>
      <tr><td><code>/api/health</code></td><td>GET</td><td>Health check</td></tr>
      <tr><td><code>/api/network-info</code></td><td>GET</td><td>Server URL and port info</td></tr>
      <tr><td><code>/api/game/:gameId</code></td><td>GET</td><td>Game state snapshot</td></tr>
      <tr><td><code>/api/game/:gameId/qr</code></td><td>GET</td><td>QR code for team joining</td></tr>
      <tr><td><code>/api/game/:gameId/export</code></td><td>GET</td><td>Export game data as JSON</td></tr>
      <tr><td><code>/api/games</code></td><td>GET</td><td>List active games</td></tr>
      <tr><td><code>/api/pre-read</code></td><td>GET</td><td>Player Pre-Read document</td></tr>
      <tr><td><code>/api/learn-nem</code></td><td>GET</td><td>Redirects to /api/pre-read</td></tr>
      <tr><td><code>/api/game-master-guide</code></td><td>GET</td><td>Game Master's Guide</td></tr>
      <tr><td><code>/api/gameplay-summary</code></td><td>GET</td><td>Gameplay Mechanics Summary</td></tr>
      <tr><td><code>/api/educational-compendium</code></td><td>GET</td><td>Educational Compendium (post-game)</td></tr>
      <tr><td><code>/api/recommended-improvements</code></td><td>GET</td><td>Recommended Improvements</td></tr>
      <tr><td><code>/api/notes/technical</code></td><td>GET</td><td>Technical Notes (this page)</td></tr>
      <tr><td><code>/api/notes/vibe-coding</code></td><td>GET</td><td>How This Was Built</td></tr>
      <tr><td><code>/api/trailer</code></td><td>GET</td><td>Cinematic trailer</td></tr>
      <tr><td><code>/api/asset-configs</code></td><td>GET/POST</td><td>Asset config presets</td></tr>
      <tr><td><code>/api/asset-configs/:id</code></td><td>DELETE</td><td>Delete asset config</td></tr>
      <tr><td><code>/api/wifi</code></td><td>GET/POST/DELETE</td><td>WiFi configuration</td></tr>
    </table>
  </div>

  <h2 id="software">3. Complete Software Inventory</h2>
  <div class="card">
    <p>Every piece of software used in development and operation:</p>

    <h3>Runtime Requirements</h3>
    <table>
      <tr><th>Software</th><th>Required?</th><th>Notes</th></tr>
      <tr><td><strong>Node.js</strong> (v18+ LTS)</td><td>Yes</td><td>JavaScript runtime. Download from nodejs.org</td></tr>
      <tr><td><strong>npm</strong> (bundled with Node)</td><td>Yes</td><td>Package manager for installing dependencies</td></tr>
      <tr><td><strong>Modern web browser</strong></td><td>Yes</td><td>Chrome, Edge, Firefox, or Safari. Host uses desktop browser, teams use phone browsers. Web Audio API required for sound effects.</td></tr>
    </table>

    <h3>Development Tools (used to build the game)</h3>
    <table>
      <tr><th>Tool</th><th>Purpose</th><th>Needed for deployment?</th></tr>
      <tr><td><strong>Claude Code</strong> (Anthropic)</td><td>AI coding assistant that wrote the application</td><td>No&mdash;only needed if modifying code</td></tr>
      <tr><td><strong>Git</strong></td><td>Version control</td><td>Only to clone the repository</td></tr>
      <tr><td><strong>VS Code / Terminal</strong></td><td>Code editor and command line</td><td>Only for development/debugging</td></tr>
      <tr><td><strong>macOS</strong></td><td>Development OS (Darwin 24.6.0)</td><td>No&mdash;runs on any OS with Node.js</td></tr>
    </table>

    <h3>npm Dependencies (installed automatically)</h3>
    <p>Running <code>npm install</code> fetches all dependencies listed in <code>package.json</code>. There are approximately <strong>15 direct dependencies</strong> and their transitive dependencies. All are standard, well-maintained open-source packages available on the npm registry.</p>

    <h3>Optional External Services</h3>
    <table>
      <tr><th>Service</th><th>Purpose</th><th>Required?</th></tr>
      <tr><td><strong>ngrok</strong></td><td>Public tunnel for remote access</td><td>No&mdash;only needed if players connect from outside the local network</td></tr>
    </table>
  </div>

  <h2 id="infrastructure">4. Infrastructure Requirements</h2>
  <div class="card">
    <h3>Minimum Server Requirements</h3>
    <ul>
      <li><strong>CPU:</strong> 1 core (2+ recommended)</li>
      <li><strong>RAM:</strong> 512 MB (1 GB recommended)</li>
      <li><strong>Disk:</strong> 200 MB for application + dependencies</li>
      <li><strong>OS:</strong> Any OS that runs Node.js (Linux, Windows, macOS)</li>
      <li><strong>Network:</strong> One open port (default: 3001)</li>
    </ul>

    <h3>Network Requirements</h3>
    <ul>
      <li>All clients (host + teams) must be able to reach the server on port 3001 via HTTP/WebSocket</li>
      <li>For a workshop room: WiFi network where all devices are on the same subnet, OR the server is accessible via a corporate network route</li>
      <li>No outbound internet access required once dependencies are installed (fully self-contained)</li>
      <li>No database, no cloud services, no third-party APIs required at runtime</li>
    </ul>

    <div class="highlight">
      <strong>Key point:</strong> The application is entirely self-contained. Once <code>npm install</code> has been run (which requires internet access to download packages), the game can run fully offline on an isolated network.
    </div>
  </div>

  <h2 id="deployment">5. Deployment to an Internal System</h2>

  <h3>Option A: Run Directly on a Server (Simplest)</h3>
  <div class="card">
    <ol>
      <li>Install Node.js 18+ on the target server</li>
      <li>Copy the entire project folder to the server</li>
      <li>Run <code>npm install</code> to install dependencies</li>
      <li>Run <code>npm run build</code> to compile the TypeScript and bundle the frontend</li>
      <li>Run <code>npm start</code> to start the production server</li>
      <li>Access via <code>http://&lt;server-ip&gt;:3001</code></li>
    </ol>
    <pre><code># On the target server:
cd /path/to/nem-merit-order-game
npm install
npm run build
npm start</code></pre>
    <div class="risk-low"><strong>Difficulty:</strong> <span class="badge badge-green">Easy</span> &mdash; Standard Node.js deployment, 5 minutes setup time.</div>
  </div>

  <h3>Option B: Docker Container</h3>
  <div class="card">
    <p>A Dockerfile could be created to package the application as a container. This would provide:</p>
    <ul>
      <li>Consistent environment across deployments</li>
      <li>Easy scaling and orchestration</li>
      <li>No Node.js installation required on the host</li>
    </ul>
    <p>A basic Dockerfile would be approximately 15 lines. The application has no external database or service dependencies, making containerisation straightforward.</p>
    <div class="risk-low"><strong>Difficulty:</strong> <span class="badge badge-green">Easy</span> &mdash; Standard single-container Node.js Docker pattern.</div>
  </div>

  <h3>Option C: Behind a Reverse Proxy (Corporate Standard)</h3>
  <div class="card">
    <p>For corporate environments, place the Node.js server behind nginx or IIS with:</p>
    <ul>
      <li>TLS termination (HTTPS)</li>
      <li>WebSocket proxy pass (critical&mdash;Socket.IO requires WebSocket upgrade headers)</li>
      <li>URL path routing if hosting alongside other applications</li>
    </ul>
    <div class="warning"><strong>Important:</strong> The reverse proxy <strong>must</strong> support WebSocket connections. Standard HTTP proxying is not sufficient. Both nginx and IIS support this with specific configuration directives.</div>
  </div>

  <h3>Option D: Cloud Hosting</h3>
  <div class="card">
    <p>Deploy to any cloud platform that supports Node.js:</p>
    <ul>
      <li><strong>AWS:</strong> EC2 instance, Elastic Beanstalk, or ECS (Fargate)</li>
      <li><strong>Azure:</strong> App Service (with WebSocket support enabled), or AKS</li>
      <li><strong>GCP:</strong> Cloud Run (with WebSocket support), or GKE</li>
      <li><strong>Simple PaaS:</strong> Railway, Render, or Fly.io (all support WebSockets out of the box)</li>
    </ul>
    <div class="warning"><strong>Verify WebSocket support:</strong> Some cloud platforms disable or limit WebSocket connections by default. Socket.IO will fall back to HTTP long-polling, but this increases latency and reduces the real-time experience.</div>
  </div>

  <h2 id="revisions">6. Development Revision History</h2>
  <div class="card">
    <p>The application was developed over an intensive ~20-hour period on 16&ndash;17 February 2026. All code was co-authored by a human user and <strong>Claude Opus 4.6</strong> (Anthropic's AI coding assistant). Below is the complete commit history:</p>
  </div>

  <div class="card">
    <h3>Commit 1 &mdash; 16 Feb 2026, 12:38 PM</h3>
    <p><strong>"Initial commit: NEM Merit Order Game with round analysis and pre-read"</strong></p>
    <p><span class="badge badge-blue">59 files</span> <span class="badge badge-green">+15,024 lines</span></p>
    <p>Complete working application from scratch:</p>
    <ul>
      <li>Full client-server architecture (Express + Socket.IO + React + Vite)</li>
      <li>Game engine with merit order dispatch algorithm, profit calculator, and round analyser</li>
      <li>Host dashboard, team game interface, and team join flow</li>
      <li>7 asset types with realistic NEM parameters</li>
      <li>3 game modes (Quick, Full, Experienced Replay)</li>
      <li>10+ scenario events (heatwave, drought, carbon price, etc.)</li>
      <li>QR code team joining, CSV export, and printable pre-read document</li>
      <li>Animated landing page with particle effects, photo carousel, and energy news ticker</li>
    </ul>
  </div>

  <div class="card">
    <h3>Commit 2 &mdash; 16 Feb 2026, 5:08 PM</h3>
    <p><strong>"Add server stability, 10 gameplay/UI improvements, and beginner mode"</strong></p>
    <p><span class="badge badge-blue">15 files</span> <span class="badge badge-green">+804</span> <span class="badge badge-red">-224 lines</span></p>
    <ul>
      <li>Global error handlers preventing server crashes</li>
      <li>Socket handlers wrapped in try/catch for resilience</li>
      <li>Relaxed Socket.IO timeouts for poor WiFi/hotspot connections</li>
      <li>Fixed $0 display bug in bid inputs</li>
      <li>Larger marginal cost badges on asset cards</li>
      <li>Demand/fleet summary banners</li>
      <li>Added <strong>Beginner mode</strong> (1 round, 2 assets, guided walkthrough)</li>
      <li>Bidding strategies filtered by available asset types</li>
      <li>Host dispatch overview dashboard</li>
    </ul>
  </div>

  <div class="card">
    <h3>Commit 3 &mdash; 16 Feb 2026, 7:57 PM</h3>
    <p><strong>"Add exit buttons, bid review, host team view, and merit order walkthrough"</strong></p>
    <p><span class="badge badge-blue">8 files</span> <span class="badge badge-green">+1,167</span> <span class="badge badge-red">-32 lines</span></p>
    <ul>
      <li>Exit game buttons (players could not previously leave gracefully)</li>
      <li><strong>Bid review modal</strong> with warnings: marginal cost violations, zero-MW bids, pro-rata exposure</li>
      <li>Host can view any team's screen in real time</li>
      <li><strong>Animated merit order walkthrough</strong>&mdash;step-by-step visual showing how dispatch works</li>
    </ul>
  </div>

  <div class="card">
    <h3>Commit 4 &mdash; 16 Feb 2026, 9:34 PM</h3>
    <p><strong>"Update market price cap to $20,000/MWh, add cinematic transitions with audio, and pre-read button"</strong></p>
    <p><span class="badge badge-blue">18 files</span> <span class="badge badge-green">+1,241</span> <span class="badge badge-red">-120 lines</span></p>
    <ul>
      <li>Market price cap updated from $17,500 to $20,000/MWh (matching real NEM rules)</li>
      <li><strong>Cinematic "MARKET OPEN" transition</strong> with bolt zap, title boom, and flash effects</li>
      <li><strong>Season-themed round start transitions</strong> (summer, winter, autumn, spring visuals)</li>
      <li><strong>Procedural Web Audio API sound engine</strong>&mdash;all sound effects synthesised in real time (no audio files)</li>
      <li>Transitions synchronised across host and all team devices</li>
    </ul>
  </div>

  <div class="card">
    <h3>Commit 5 &mdash; 17 Feb 2026, 8:37 AM</h3>
    <p><strong>"Add transition sound effects, dispatch overview chart, editable asset config, and UI polish"</strong></p>
    <p><span class="badge badge-blue">28 files</span> <span class="badge badge-green">+1,559</span> <span class="badge badge-red">-711 lines</span></p>
    <ul>
      <li>Transitions rewritten from Framer Motion to pure CSS (fixing React re-render issues)</li>
      <li>Dispatch overview redesigned with walkthrough bar chart</li>
      <li><strong>Editable asset configuration</strong>&mdash;customise plant names, marginal costs, and MW capacity</li>
      <li>Save/load asset configuration presets</li>
      <li>Renamed "SRMC" to "Marginal Cost" throughout (more accessible language)</li>
      <li>Bidding guardrail toggle and zero-generation validation</li>
      <li>Wider scrollbar for easier navigation</li>
    </ul>
  </div>

  <div class="card">
    <h3>Commit 6 &mdash; 19 Feb 2026</h3>
    <p><strong>"Add spectator mode, dark mode, WiFi QR sharing, progressive learning mode, post-game report, and code splitting"</strong></p>
    <ul>
      <li><strong>Spectator mode</strong>&mdash;read-only game observation at <code>/spectate</code></li>
      <li><strong>Dark mode</strong> with ThemeContext and localStorage persistence</li>
      <li><strong>WiFi QR code sharing</strong> for venue setup (standard <code>WIFI:</code> format, <code>/api/wifi</code> endpoints)</li>
      <li><strong>Progressive Learning mode</strong>&mdash;10 rounds, 90&ndash;120 min, builds complexity from 1 asset to full portfolio</li>
      <li><strong>Post-game printable report</strong> at <code>/report</code></li>
      <li><strong>Route-level code splitting</strong> via <code>React.lazy()</code>&mdash;main bundle reduced from ~1180 KB to ~432 KB</li>
      <li>Auto-advance when all team bids are submitted</li>
      <li>Duplicate team name prevention</li>
      <li>Host teaching notes per round</li>
      <li>Historical clearing price tracking across rounds</li>
    </ul>
  </div>

  <div class="card">
    <h3>Commit 7 &mdash; 21&ndash;22 Feb 2026</h3>
    <p><strong>&ldquo;Documentation restructure: merge pre-read, add educational compendium, round bidding guide, and teaching notes&rdquo;</strong></p>
    <ul>
      <li>Merged <strong>Learn the NEM</strong> into <strong>Player Pre-Read</strong> &mdash; single comprehensive pre-session document</li>
      <li><strong>Educational Compendium</strong> &mdash; new 14-page post-game take-home reference at <code>/api/educational-compendium</code></li>
      <li><strong>Round Bidding Guide</strong> &mdash; in-game overlay showing what changed this round (new assets, periods, scenarios, seasons)</li>
      <li><strong>hostTeachingNotes</strong> added to all rounds across all 6 game modes (was only in First Run + Progressive Learning)</li>
      <li><strong>Game Master's Guide</strong> enhanced with First Run round-by-round walkthrough and Facilitation Techniques section</li>
      <li><strong>Quick Reference Guide</strong> expanded with 7-step annotated bidding process walkthrough</li>
      <li><strong>Gameplay Summary</strong> updated with UI Complexity Levels and Walkthrough Mode sections</li>
      <li><strong>Recommended Improvements</strong> rewritten into 3 categories: IT/Infrastructure, UX, Gameplay</li>
      <li><strong>Guides page</strong> restructured into Player, Host, Tools, and Development sections</li>
    </ul>
  </div>

  <h2 id="risks">7. Risk Assessment</h2>

  <h3>Security Risks</h3>
  <div class="card">
    <table>
      <tr><th>Risk</th><th>Severity</th><th>Notes</th></tr>
      <tr><td>No authentication on host controls</td><td><span class="badge badge-amber">Medium</span></td><td>Anyone with the URL can access the host dashboard. For internal use, network isolation is sufficient. For public deployment, add authentication.</td></tr>
      <tr><td>No HTTPS by default</td><td><span class="badge badge-amber">Medium</span></td><td>Traffic is unencrypted on the local network. Use a reverse proxy with TLS for sensitive environments.</td></tr>
      <tr><td>CORS set to allow all origins</td><td><span class="badge badge-blue">Low</span></td><td>Required for cross-device access. In production behind a proxy, restrict to your domain.</td></tr>
      <tr><td>No input sanitisation for team names</td><td><span class="badge badge-blue">Low</span></td><td>Team names are rendered in React (which escapes HTML by default), so XSS risk is minimal.</td></tr>
      <tr><td>No database&mdash;all state in memory</td><td><span class="badge badge-blue">Low</span></td><td>No data persistence risk; no data breach exposure. But game state is lost on server restart.</td></tr>
    </table>
  </div>

  <h3>Operational Risks</h3>
  <div class="card">
    <table>
      <tr><th>Risk</th><th>Severity</th><th>Mitigation</th></tr>
      <tr><td>Server crash loses all game state</td><td><span class="badge badge-amber">Medium</span></td><td>Global error handlers prevent most crashes. Consider adding periodic state snapshots to disk.</td></tr>
      <tr><td>WiFi congestion with many devices</td><td><span class="badge badge-amber">Medium</span></td><td>Socket.IO uses efficient binary framing. Test with expected device count. Consider a dedicated WiFi access point.</td></tr>
      <tr><td>Browser compatibility issues</td><td><span class="badge badge-blue">Low</span></td><td>Uses standard Web APIs. Tested on Chrome, Safari, Firefox. Web Audio API is supported on all modern browsers.</td></tr>
      <tr><td>Node.js version mismatch</td><td><span class="badge badge-blue">Low</span></td><td>Requires Node 18+. Use nvm or Docker to pin the version.</td></tr>
    </table>
  </div>

  <h3>Licensing Risks</h3>
  <div class="card">
    <div class="risk-low">
      <strong>Low risk.</strong> All npm dependencies use permissive open-source licences (MIT, Apache 2.0, ISC). No GPL or copyleft licences that would impose restrictions on internal corporate use. The application itself was purpose-built and has no external licence constraints.
    </div>
  </div>

  <h2 id="transfer">8. Transfer Difficulty Assessment</h2>
  <div class="card">
    <h3>Overall Verdict: <span class="badge badge-green" style="font-size: 1rem;">Easy to Transfer</span></h3>
    <p>This application is well-suited for transfer to a corporate IT environment because:</p>

    <div class="two-col">
      <div>
        <h3 style="color: #38a169;">Factors Making Transfer Easy</h3>
        <ul>
          <li>Single runtime dependency (Node.js)</li>
          <li>No database to provision or migrate</li>
          <li>No cloud service dependencies</li>
          <li>No API keys or secrets required</li>
          <li>No licence fees or subscriptions</li>
          <li>Standard npm package ecosystem</li>
          <li>TypeScript provides readable, self-documenting code</li>
          <li>Fully works on isolated/air-gapped networks (once <code>npm install</code> done)</li>
        </ul>
      </div>
      <div>
        <h3 style="color: #d69e2e;">Things to Watch Out For</h3>
        <ul>
          <li>WebSocket support required through any proxy/firewall</li>
          <li>Corporate firewalls may block WebSocket upgrade handshake</li>
          <li>If using a locked-down npm registry, ensure all packages are available</li>
          <li>Port 3001 must be accessible (configurable via <code>PORT</code> env var)</li>
          <li>No built-in authentication (add if exposed beyond trusted network)</li>
          <li>Game state not persisted&mdash;consider adding file/DB backup for long sessions</li>
        </ul>
      </div>
    </div>
  </div>

  <h3>Estimated Effort to Deploy</h3>
  <div class="card">
    <table>
      <tr><th>Scenario</th><th>Effort</th><th>Notes</th></tr>
      <tr><td>Run on a developer laptop at a workshop</td><td><span class="badge badge-green">5 minutes</span></td><td>Install Node, clone repo, npm install, npm start</td></tr>
      <tr><td>Deploy to internal Linux server</td><td><span class="badge badge-green">30 minutes</span></td><td>Standard Node.js deployment with systemd/pm2</td></tr>
      <tr><td>Containerise with Docker</td><td><span class="badge badge-green">1 hour</span></td><td>Write Dockerfile, test, push to registry</td></tr>
      <tr><td>Deploy behind corporate reverse proxy (nginx/IIS)</td><td><span class="badge badge-amber">2-4 hours</span></td><td>WebSocket config, TLS, firewall rules</td></tr>
      <tr><td>Add authentication layer</td><td><span class="badge badge-amber">4-8 hours</span></td><td>SSO/LDAP integration for host access</td></tr>
      <tr><td>Add persistent game state (database)</td><td><span class="badge badge-amber">8-16 hours</span></td><td>SQLite or PostgreSQL for game history</td></tr>
    </table>
  </div>

  <h2 id="recommendations">9. Recommendations</h2>
  <div class="card">
    <h3>For Immediate Use (Workshops &amp; Training)</h3>
    <ol>
      <li>Run directly on a laptop with <code>npm start</code></li>
      <li>Ensure all devices are on the same WiFi network</li>
      <li>Use the QR code feature for easy team joining</li>
      <li>Use WiFi QR code sharing (<code>/api/wifi</code>) to help participants connect to the venue network</li>
      <li>For remote participants, use <code>npm run tunnel</code> for ngrok public access</li>
    </ol>

    <h3>For Corporate Deployment</h3>
    <ol>
      <li>Containerise with Docker for consistent deployment</li>
      <li>Run behind nginx or IIS with WebSocket proxy support and TLS</li>
      <li>Use a process manager (pm2 or systemd) to auto-restart on failure</li>
      <li>Consider adding host authentication if exposed beyond a trusted network</li>
      <li>Set up periodic state snapshots to prevent data loss during long game sessions</li>
      <li>Lock Node.js version using <code>.nvmrc</code> or Docker base image</li>
    </ol>

    <h3>For Long-Term Maintenance</h3>
    <ol>
      <li>Run <code>npm audit</code> periodically to check for dependency vulnerabilities</li>
      <li>Keep Node.js updated to the latest LTS release</li>
      <li>The codebase is in TypeScript, which provides strong type safety and editor support for future modifications</li>
      <li>All game parameters (asset costs, demand curves, scenarios) are in clearly separated data files that can be modified without touching game logic</li>
    </ol>
  </div>

  <div style="margin-top: 3rem; padding: 1.5rem; text-align: center; color: #718096; font-size: 0.85rem; border-top: 1px solid #e2e8f0;">
    <p>GridRival &mdash; Technical Notes</p>
    <p>Developed February 2026 using Claude Code (Anthropic) + human direction</p>
  </div>
</div>
</body>
</html>`;
}
