/**
 * Vibe Coding Notes — for lay audiences explaining how the game was built
 * Served at /api/notes/vibe-coding
 */
export function getVibeCodingNotesHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GridRival — How We "Vibe Coded" This Game with AI</title>
<style>
  @page { margin: 1.5cm 2cm; size: A4; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1a202c; line-height: 1.8; font-size: 11pt; background: #f7fafc; }
  .container { max-width: 820px; margin: 0 auto; padding: 2rem 2rem 4rem; }
  .header { background: linear-gradient(135deg, #553c9a 0%, #1e3a5f 100%); color: white; padding: 2.5rem 2rem; border-radius: 12px; margin-bottom: 2rem; text-align: center; }
  .header h1 { font-size: 1.8rem; font-weight: 800; margin-bottom: 0.3rem; }
  .header .subtitle { color: #d6bcfa; font-size: 1.05rem; }
  .header .date { color: #a0aec0; font-size: 0.85rem; margin-top: 0.5rem; }
  h2 { font-size: 1.4rem; color: #553c9a; border-bottom: 3px solid #805ad5; padding-bottom: 0.4rem; margin: 2rem 0 1rem; }
  h3 { font-size: 1.15rem; color: #2d3748; margin-top: 1.3rem; margin-bottom: 0.5rem; }
  p { margin-bottom: 0.8rem; }
  ul, ol { margin: 0.5rem 0 1rem 1.5rem; }
  li { margin-bottom: 0.4rem; }
  .card { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.2rem 1.5rem; margin: 1rem 0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
  .human { background: #faf5ff; border-left: 4px solid #805ad5; padding: 0.8rem 1rem; border-radius: 0 8px 8px 0; margin: 0.8rem 0; }
  .ai { background: #ebf8ff; border-left: 4px solid #3182ce; padding: 0.8rem 1rem; border-radius: 0 8px 8px 0; margin: 0.8rem 0; }
  .highlight { background: #f0fff4; border-left: 4px solid #38a169; padding: 0.8rem 1rem; border-radius: 0 8px 8px 0; margin: 0.8rem 0; }
  .callout { background: #fffbeb; border: 1px solid #f6e05e; border-radius: 10px; padding: 1.2rem 1.5rem; margin: 1rem 0; }
  .quote { font-style: italic; color: #4a5568; border-left: 3px solid #cbd5e0; padding-left: 1rem; margin: 1rem 0; }
  .timeline { position: relative; padding-left: 2rem; }
  .timeline::before { content: ''; position: absolute; left: 0.5rem; top: 0; bottom: 0; width: 3px; background: #805ad5; border-radius: 2px; }
  .timeline-item { position: relative; margin-bottom: 1.5rem; }
  .timeline-item::before { content: ''; position: absolute; left: -1.75rem; top: 0.5rem; width: 12px; height: 12px; background: #805ad5; border-radius: 50%; border: 2px solid white; }
  .timeline-item h3 { margin-top: 0; }
  .badge { display: inline-block; font-size: 0.75rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 20px; color: white; }
  .badge-purple { background: #805ad5; }
  .badge-blue { background: #3182ce; }
  .back-link { display: inline-block; margin-bottom: 1rem; color: #805ad5; text-decoration: none; font-weight: 600; }
  .back-link:hover { text-decoration: underline; }
  .print-btn { display: inline-block; background: #805ad5; color: white; border: none; padding: 0.5rem 1.2rem; border-radius: 8px; font-size: 0.9rem; cursor: pointer; text-decoration: none; margin-left: 0.5rem; }
  .print-btn:hover { background: #6b46c1; }
  .split { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  @media (max-width: 700px) { .split { grid-template-columns: 1fr; } }
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
    <h1>How We "Vibe Coded" This Game with AI</h1>
    <div class="subtitle">A non-technical guide to building software with artificial intelligence</div>
    <div class="date">February 2026</div>
  </div>

  <h2>What is "Vibe Coding"?</h2>
  <div class="card">
    <p><strong>Vibe coding</strong> is a new way of building software where a person describes what they want in plain English, and an AI assistant writes all the actual computer code. The human provides the <em>vision, ideas, and feedback</em>. The AI provides the <em>technical execution</em>.</p>
    <p>Think of it like being an architect who sketches a building design, while a highly skilled builder interprets the sketches and does all the construction&mdash;choosing the right materials, calculating structural loads, and laying every brick. Except this builder works at superhuman speed and never needs a tea break.</p>
    <p>The term was coined in early 2025 and has since become a widespread approach to building applications quickly. It does not mean the human has zero skill or involvement&mdash;it means the human focuses on <em>what</em> to build and <em>why</em>, while the AI handles <em>how</em>.</p>
  </div>

  <h2>The Tools We Used</h2>
  <div class="card">
    <h3>Claude Code (by Anthropic)</h3>
    <p>The AI assistant that wrote this game is called <strong>Claude</strong>, made by a company called <strong>Anthropic</strong>. Specifically, we used <strong>Claude Code</strong>&mdash;a version of Claude that runs in a computer terminal and can directly create, edit, and manage files on your computer.</p>
    <p>Claude Code can:</p>
    <ul>
      <li>Write code in any programming language</li>
      <li>Create entire applications from a description</li>
      <li>Read and understand existing code</li>
      <li>Search the internet for current information</li>
      <li>Run commands to test and start applications</li>
      <li>Fix bugs and improve code based on feedback</li>
    </ul>
    <p>The specific AI model used was <strong>Claude Opus 4.6</strong>&mdash;Anthropic's most capable model as of early 2026.</p>
  </div>

  <h2>What the Human Provided vs What the AI Did</h2>

  <div class="split">
    <div class="card" style="border-top: 4px solid #805ad5;">
      <h3 style="color: #805ad5;">The Human's Role</h3>
      <p>The human user provided:</p>
      <ul>
        <li><strong>The core idea:</strong> "Build a game that simulates the NEM merit order dispatch"</li>
        <li><strong>Domain knowledge:</strong> Understanding of how Australia's electricity market works, what assets exist (coal, gas, wind, solar, hydro, batteries), and what the game should teach</li>
        <li><strong>Design direction:</strong> Requests for specific visual styles (dark theme, Bloomberg/trading floor aesthetic), cinematic transitions, and sound effects</li>
        <li><strong>Gameplay decisions:</strong> How many teams, what game modes, what scenarios to include, what the market price cap should be ($20,000/MWh, matching real NEM rules)</li>
        <li><strong>Quality feedback:</strong> Testing the game, identifying bugs ("the $0 is not displaying correctly"), requesting improvements ("add exit buttons, we need a way to leave the game")</li>
        <li><strong>Real-world validation:</strong> Ensuring the game mechanics match actual NEM operations</li>
      </ul>
    </div>
    <div class="card" style="border-top: 4px solid #3182ce;">
      <h3 style="color: #3182ce;">The AI's Role</h3>
      <p>Claude handled all the technical work:</p>
      <ul>
        <li><strong>Architecture design:</strong> Chose the right software components (React, Node.js, Socket.IO, etc.) and how they fit together</li>
        <li><strong>All code writing:</strong> ~35,000+ lines of TypeScript/JavaScript across ~120+ files</li>
        <li><strong>Algorithm implementation:</strong> Built the merit order dispatch algorithm, profit calculations, demand curve generation</li>
        <li><strong>Real-time networking:</strong> Set up WebSocket communication so all players see updates instantly</li>
        <li><strong>Visual design:</strong> Created animations, charts, responsive layouts, and the landing page visual effects</li>
        <li><strong>Sound design:</strong> Built a procedural audio engine that synthesises all sound effects in real time using mathematical waveforms (no audio files needed)</li>
        <li><strong>Performance optimisation:</strong> Implemented React.lazy() code splitting, reducing the main bundle from 1180KB to 432KB</li>
        <li><strong>Bug fixing:</strong> Diagnosed and fixed issues as they were reported</li>
        <li><strong>Documentation:</strong> Created the player pre-read, game guide, and these very notes</li>
      </ul>
    </div>
  </div>

  <h2>The Development Story: How It Actually Happened</h2>
  <p>The entire game was built across <strong>23+ conversation sessions</strong> over several weeks, with <strong>~320+ human prompts</strong> in total. Here is how it unfolded:</p>

  <div class="timeline">
    <div class="timeline-item">
      <h3>Phase 1: The Big Bang <span class="badge badge-blue">28 prompts &middot; Session 1</span></h3>
      <p><span class="badge badge-purple">Friday &ndash; Saturday</span> The user described the concept in a single, detailed opening prompt&mdash;over 500 words long&mdash;covering game modes, asset types, bidding mechanics, demand curves, seasonal scenarios, and output requirements.</p>
      <div class="human"><strong>Actual opening prompt (excerpt):</strong> &ldquo;I would like to build an app which can be used to run a training program for people who work in the energy industry to better understand the NEM merit order mechanism. To do this I would like to create a relatively simple game, that enables up to 15 teams to play the role of an energy company&hellip;&rdquo;</div>
      <div class="ai"><strong>What Claude did:</strong> Within a single conversation, Claude designed the entire application architecture, created 59 files, and wrote over 15,000 lines of code. This included the game engine, the merit order algorithm, the user interfaces for hosts and teams, real-time WebSocket communication, data visualisation charts, a QR code joining system, and an animated landing page. The game was playable at the end of this first session.</div>
      <div class="highlight"><strong>Key insight:</strong> Claude drew on its training knowledge of electricity markets, the Australian NEM specifically, software architecture patterns, and dozens of web technologies to build a complete working system from a high-level description. No line-by-line coding instructions were needed.</div>
      <p style="margin-top: 0.8rem;"><strong>Other prompts in this phase included:</strong></p>
      <ul style="font-size: 0.9rem; color: #4a5568;">
        <li>&ldquo;when using my phone I was able to connect but then when my phone went on standby it lost connection and I couldn&rsquo;t reconnect&rdquo;</li>
        <li>&ldquo;can you please add Bidding strategy pre-fill buttons on team page&rdquo;</li>
        <li>&ldquo;each round needs a descriptor of the demand and supply balance&rdquo;</li>
        <li>&ldquo;can you make the opening screen more exciting. Can you add music?&rdquo;</li>
        <li>&ldquo;create a pre-read pdf that can be sent to players the week before they play&rdquo;</li>
      </ul>
    </div>

    <div class="timeline-item">
      <h3>Phase 2: Testing and Hardening <span class="badge badge-blue">26 prompts &middot; Sessions 2&ndash;3</span></h3>
      <p><span class="badge badge-purple">Saturday morning</span> The user tested the game with a colleague and reported real-world issues.</p>
      <div class="human"><strong>What the human said (examples):</strong></div>
      <ul style="font-size: 0.9rem; color: #4a5568;">
        <li>&ldquo;the server crashes sometimes&rdquo;</li>
        <li>&ldquo;the $0 is not showing in bids&rdquo;</li>
        <li>&ldquo;the connections drop on mobile hotspot&rdquo;</li>
        <li>&ldquo;need a beginner mode for people who don&rsquo;t know the NEM&rdquo;</li>
        <li>&ldquo;make the SRMC badges bigger and more prominent&rdquo;</li>
        <li>&ldquo;demand should be an average 50&ndash;90% of capacity&rdquo;</li>
        <li>&ldquo;create an overview dashboard for the game master of each generator, broken down by asset type&rdquo;</li>
        <li>&ldquo;can you make a super simplified version, which has only one round two assets, just for beginners?&rdquo;</li>
      </ul>
      <div class="ai"><strong>What Claude did:</strong> Added global error handlers to prevent server crashes, fixed the display bug, relaxed network timeout settings for poor WiFi connections, created a new Beginner game mode with only 2 asset types and a guided walkthrough, rewrote demand generation to target 50&ndash;95% of fleet capacity, built a dispatch overview dashboard, and improved various UI elements.</div>
      <div class="highlight"><strong>Key insight:</strong> The human didn't need to know <em>how</em> to fix a server crash or a display bug. They just reported what was wrong, and Claude diagnosed the root cause and implemented the fix.</div>
    </div>

    <div class="timeline-item">
      <h3>Phase 3: Making It Educational <span class="badge badge-blue">10 prompts &middot; Sessions 4&ndash;5</span></h3>
      <p><span class="badge badge-purple">Saturday afternoon</span> The user wanted features that would help players learn, not just play.</p>
      <div class="human"><strong>What the human said (examples):</strong></div>
      <ul style="font-size: 0.9rem; color: #4a5568;">
        <li>&ldquo;at the end of each round, create a walkthrough which shows how the merit order dispatch was built up&rdquo;</li>
        <li>&ldquo;instead of submitting bids, the button should be review bids&rdquo; with warnings for zero-MW and below-SRMC bids</li>
        <li>&ldquo;the host should have a button to view what is being shown to each of the teams&rdquo;</li>
        <li>&ldquo;at the end of the game, there is no way to start again and go back to the main page&rdquo;</li>
        <li>&ldquo;the walkthrough is great, but when someone bids zero you need to be able to see the bid&rdquo;</li>
      </ul>
      <div class="ai"><strong>What Claude did:</strong> Built an animated merit order walkthrough that visually steps through the dispatch process, created a bid review modal that warns about common mistakes (bidding below cost, zero-MW bids), added a host team view feature, and added exit buttons throughout the application.</div>
    </div>

    <div class="timeline-item">
      <h3>Phase 4: Making It Theatrical <span class="badge badge-blue">29 prompts &middot; Session 6</span></h3>
      <p><span class="badge badge-purple">Saturday evening</span> The user wanted the game to feel like an event, not just a web page. This was also the session with the infamous transition loop bug.</p>
      <div class="human"><strong>What the human said (examples):</strong></div>
      <ul style="font-size: 0.9rem; color: #4a5568;">
        <li>&ldquo;create a nice dramatic transition slide for when the game is selected&rdquo;</li>
        <li>&ldquo;can you add some appropriate audio to the transitions?&rdquo;</li>
        <li>&ldquo;the transition slide for round 1 got stuck in a loop&rdquo;</li>
        <li>&ldquo;the loop is still there&rdquo; (reported <strong>8 times</strong> across 45 minutes)</li>
        <li>&ldquo;I think the problem is I don&rsquo;t know how to explain it to you clearly&rdquo;</li>
        <li>[Installed Claude Chrome Extension so the AI could <em>see</em> the bug visually]</li>
        <li>&ldquo;add a bidding guardrail toggle&rdquo; and &ldquo;call out SRMC as its full name, not an acronym&rdquo;</li>
      </ul>
      <div class="ai"><strong>What Claude did:</strong> Created a &ldquo;MARKET OPEN&rdquo; cinematic sequence with visual effects and built an entire procedural audio engine from scratch. Rather than using pre-recorded sound files, Claude wrote code that generates sounds using mathematical waveforms&mdash;buzzes, chimes, whooshes, and zaps&mdash;all synthesised in real time by the browser. After struggling to diagnose the transition loop bug through text descriptions alone, the Claude Chrome Extension allowed the AI to observe the bug visually, identify the root cause (a state update triggering a re-render loop), and fix it.</div>
      <div class="highlight"><strong>Key insight:</strong> This phase perfectly illustrates both the power and the limits of vibe coding. The human said &ldquo;make it sound dramatic&rdquo; and Claude independently built a procedural audio engine using the Web Audio API. But when a visual bug appeared, 8 rounds of &ldquo;the loop is still there&rdquo; couldn&rsquo;t convey what 5 seconds of screen observation could. The Chrome Extension bridged that gap.</div>
    </div>

    <div class="timeline-item">
      <h3>Phase 5: Polish and Customisation <span class="badge badge-blue">21 prompts &middot; Sessions 7&ndash;8</span></h3>
      <p><span class="badge badge-purple">Saturday night &ndash; Sunday morning</span> The user wanted customisation, documentation, and final polish.</p>
      <div class="human"><strong>What the human said (examples):</strong></div>
      <ul style="font-size: 0.9rem; color: #4a5568;">
        <li>&ldquo;make it so the key parameters of the game are editable&mdash;the names and SRMC for each plant&rdquo;</li>
        <li>&ldquo;make the dispatch overview have the same type of graphic as the walkthrough&rdquo;</li>
        <li>&ldquo;make the scrolling sidebar a little larger, I find it hard to grab&rdquo;</li>
        <li>&ldquo;prepare some notes regarding how it has been developed&rdquo; (IT notes and vibe coding notes)</li>
        <li>&ldquo;when you end a game and try to start another, the QR code does not appear&rdquo;</li>
        <li>&ldquo;let me toggle through the other options on the left hand side while bidding is in progress&rdquo;</li>
      </ul>
      <div class="ai"><strong>What Claude did:</strong> Built a complete asset configuration editor (save/load presets), renamed &ldquo;SRMC&rdquo; to &ldquo;Marginal Cost&rdquo; across all code and user-facing content, rewrote the transition animations from a library-based approach to pure CSS for better reliability, created technical and vibe coding documentation, fixed the QR code bug through socket room management, and added various quality-of-life improvements.</div>
    </div>

    <div class="timeline-item">
      <h3>Phase 6: Final Refinements <span class="badge badge-blue">13 prompts &middot; Session 9</span></h3>
      <p><span class="badge badge-purple">Tuesday</span> Final bug fixes, mobile UX improvements, and documentation updates.</p>
      <div class="human"><strong>What the human said (examples):</strong></div>
      <ul style="font-size: 0.9rem; color: #4a5568;">
        <li>&ldquo;the QR code for the next game seems to disappear&rdquo; (deeper fix for socket room cleanup)</li>
        <li>&ldquo;make the Learn the NEM, Player Pre-Read, and Download Guide all downloadable as PDF&rdquo;</li>
        <li>&ldquo;put a comma for every thousand to make dollar amounts clearer&rdquo;</li>
        <li>&ldquo;on an iPhone, the cursor defaults to being after the 0 rather than before it&rdquo;</li>
        <li>&ldquo;make sure the guardrails don&rsquo;t put users in a doom loop where they can&rsquo;t submit a bid&rdquo;</li>
        <li>&ldquo;add the guardrails table into the game guide&rdquo;</li>
      </ul>
      <div class="ai"><strong>What Claude did:</strong> Deep-dived into socket room management to permanently fix the QR code bug, added PDF download capability using browser print dialogs, improved currency formatting with comma separators, added mobile-friendly input selection, relaxed bidding restrictions when guardrails are disabled, and updated documentation.</div>
    </div>

    <div class="timeline-item">
      <h3>Phase 7: Advanced Game Mechanics &amp; Documentation <span class="badge badge-blue">30+ prompts &middot; Sessions 10&ndash;11</span></h3>
      <p><span class="badge badge-purple">Wednesday &ndash; Thursday</span> The user wanted deeper gameplay mechanics, better onboarding for new players, and comprehensive documentation for game masters and future improvements.</p>
      <div class="human"><strong>What the human said (examples):</strong></div>
      <ul style="font-size: 0.9rem; color: #4a5568;">
        <li>&ldquo;Can you add buttons to the teams bidding page so that they can access the Bid explainer and the Round explainer and the strategy explainer&rdquo;</li>
        <li>&ldquo;Can you update the round briefing to include when a surprise event was called &mdash; mimicking real life where something happens but you&rsquo;re not sure why&rdquo;</li>
        <li>&ldquo;Can you give me a written plan detailing further improvements that could be made to the game prioritised into desirability/impact&rdquo;</li>
      </ul>
      <div class="ai"><strong>What Claude did:</strong> This was a major expansion phase. Claude built an entire <strong>Surprise Events system</strong>&mdash;6 host-triggered secret disruptions (Generator Trip, Demand Surge, Demand Drop/Solar, Renewable Drought, Fuel Price Spike, Interconnector Outage) that the game master can toggle during the briefing phase. When active, teams see dramatic &ldquo;Developing Situation&rdquo; incident reports with deliberately vague descriptions, mimicking the real-world uncertainty that energy traders face. Claude also built a <strong>full-screen cinematic Round Briefing</strong> slide deck (season overview, demand profiles, fleet capacity, scenario events, and incident reports), a <strong>6-slide Strategy Guide</strong> covering bidding approaches (Price Taker, Marginal Cost, Price Maker, Portfolio Optimizer, Capacity Repricing, Battery Arbitrageur) with mock examples and game theory, a <strong>How to Bid tutorial</strong> for first-time players, <strong>quick-access help buttons</strong> during bidding, a <strong>Common Mistakes reference</strong> drawn from the Game Master&rsquo;s Guide, and a comprehensive <strong>Recommended Improvements document</strong> proposing a new &ldquo;Progressive Learning&rdquo; 10-round game mode. The Game Master&rsquo;s Guide was also updated with surprise event documentation and facilitation notes.</div>
      <div class="highlight"><strong>Key insight:</strong> This phase shows how vibe coding enables a domain expert to rapidly layer sophisticated game mechanics on top of a working product. Features like the surprise events system&mdash;which required changes to game state, host controls, team UI, round briefing presentations, and the dispatch engine&mdash;would typically need a multi-sprint planning effort. Here, each feature went from idea to working implementation in a single conversation exchange.</div>
    </div>

    <div class="timeline-item">
      <h3>Phase 8: Enhancement Sprint <span class="badge badge-blue">60+ prompts &middot; Sessions 12&ndash;14</span></h3>
      <p><span class="badge badge-purple">Following week</span> With the core game proven in live sessions, the user launched an intensive enhancement sprint&mdash;adding an entirely new game mode, quality-of-life features for hosts and players, performance optimisation, and new ways to access and share the game.</p>
      <div class="human"><strong>What the human said (examples):</strong></div>
      <ul style="font-size: 0.9rem; color: #4a5568;">
        <li>&ldquo;Build the Progressive Learning mode&mdash;10 rounds that start with just 1 asset and gradually build to the full portfolio&rdquo;</li>
        <li>&ldquo;Add a WiFi QR code so the host can share the network details at a venue&rdquo;</li>
        <li>&ldquo;Can we add sound effects? But synthesised, no audio files&rdquo;</li>
        <li>&ldquo;Add a dark mode toggle&rdquo;</li>
        <li>&ldquo;Auto-advance to results when all teams have submitted their bids&rdquo;</li>
        <li>&ldquo;The host needs teaching notes with checkable talking points for each round&rdquo;</li>
        <li>&ldquo;Create a market snapshot infographic for the results screen&rdquo;</li>
        <li>&ldquo;Add quick recap cards that show a summary of the last round before the next one starts&rdquo;</li>
        <li>&ldquo;I want a price history chart that tracks clearing prices across all rounds&rdquo;</li>
        <li>&ldquo;Add explain tooltips for key NEM terms like clearing price, merit order, marginal cost&rdquo;</li>
        <li>&ldquo;Give teams bid presets&mdash;Price Taker, Cost Recovery, Split Strategy, Aggressive&rdquo;</li>
        <li>&ldquo;Can we have a spectator mode so observers can watch without joining a team?&rdquo;</li>
        <li>&ldquo;Create a printable post-game report&rdquo;</li>
        <li>&ldquo;Stop teams from joining with duplicate names&rdquo;</li>
        <li>&ldquo;The bundle size is too big&mdash;can you split the code?&rdquo;</li>
      </ul>
      <div class="ai"><strong>What Claude did:</strong> This was the largest single expansion of the application. Claude built the <strong>Progressive Learning game mode</strong>&mdash;a 10-round pedagogical experience that starts players with just 1 asset (a baseload coal plant) and progressively introduces new generation types round by round, building to the full 7-asset portfolio by the final rounds. Each round includes tailored teaching moments explaining why the new asset changes market dynamics. Claude also added a <strong>WiFi QR code sharing system</strong> so hosts can display network credentials for venue setup, implemented <strong>synthesised sound effects via the Web Audio API</strong> (click feedback, bid confirmations, round transitions&mdash;all generated mathematically with no audio files), built a <strong>dark mode toggle</strong> with persistent preference storage, created <strong>auto-advance logic</strong> that detects when all teams have submitted bids and automatically moves to results, designed <strong>host teaching notes</strong> with checkable talking points for each round phase, built a <strong>market snapshot infographic</strong> summarising key round outcomes visually, added <strong>quick recap cards</strong> showing the previous round&rsquo;s results at the start of each new round, implemented a <strong>price history chart</strong> tracking clearing prices and historical trends across all rounds, created <strong>explain tooltips</strong> for key NEM terminology throughout the interface, built <strong>bid preset buttons</strong> (Price Taker, Cost Recovery, Split Strategy, Aggressive) so teams can quickly apply common bidding strategies, created a <strong>spectator mode</strong> at the /spectate route allowing observers to watch the game without joining a team, built a <strong>post-game printable report</strong> at the /report route with comprehensive game analytics, added <strong>duplicate team name prevention</strong> with real-time validation, and implemented <strong>React.lazy() code splitting</strong> that reduced the main JavaScript bundle from 1180KB down to 432KB&mdash;a 63% reduction in initial load size.</div>
      <div class="highlight"><strong>Key insight:</strong> This phase demonstrated that vibe coding scales beyond initial creation into sustained product evolution. Over 60 prompts across 3 sessions, the application grew by roughly 13,000 lines of code and 50 new files. The Progressive Learning mode alone&mdash;requiring new round data, a modified game engine, progressive asset unlocking logic, and round-by-round teaching content&mdash;went from concept to working implementation within a single session. The performance optimisation work (code splitting reducing the bundle by 63%) shows that AI-assisted development can handle not just feature building but also the technical debt and optimisation work that mature applications require.</div>
    </div>

    <div class="timeline-item">
      <h3>Phase 9: Battery Mechanics &amp; Market Realism <span class="badge badge-blue">30+ prompts &middot; Sessions 15&ndash;17</span></h3>
      <p><span class="badge badge-purple">Following weeks</span> The user wanted batteries to become a first-class mechanic&mdash;not just a generator that bids into the market, but a genuine charge/discharge/arbitrage experience. They also wanted the dispatch engine to match real AEMO behaviour for tied bids.</p>
      <div class="human"><strong>What the human said (examples):</strong></div>
      <ul style="font-size: 0.9rem; color: #4a5568;">
        <li>&ldquo;I want to be able to implement a charge/discharge feature for batteries&rdquo;</li>
        <li>&ldquo;Build a battery explainer that teaches players how batteries work in the NEM&rdquo;</li>
        <li>&ldquo;Create a battery arbitrage mini-game where players practise charging and discharging across a 24-hour period&rdquo;</li>
        <li>&ldquo;The results should label battery earnings as &lsquo;arbitrage revenue&rsquo; not just profit&rdquo;</li>
        <li>&ldquo;Battery charging should add to market demand&mdash;if you charge 500 MW, that&rsquo;s 500 MW more demand&rdquo;</li>
        <li>&ldquo;When two teams bid the same price, how is it dispatched? It should be pro-rata, like the real NEM&rdquo;</li>
        <li>&ldquo;Update all the guides on the main page based upon the changes&rdquo;</li>
      </ul>
      <div class="ai"><strong>What Claude did:</strong> This was a major engine and UI overhaul. Claude implemented <strong>full battery charge/discharge mechanics</strong>&mdash;a 3-way mode toggle (Charge/Idle/Discharge) per period, State of Charge (SOC) tracking across periods with a visual bar, 92% round-trip efficiency on charging, and charging cost calculated at the clearing price. The battery was upgraded from 150 MW to <strong>500 MW / 2,000 MWh</strong> (4-hour duration) to match modern grid-scale batteries. Claude built an <strong>8-slide Battery Explainer</strong> modal covering SOC, efficiency, arbitrage, the diurnal price pattern, and how charging adds to market demand. A <strong>Battery Arbitrage Mini-Game</strong> was created&mdash;an interactive 24-hour exercise where players set charge/idle/discharge for each hour against a realistic predispatch price curve, then watch as actual prices are revealed with variability, calculating their real profit versus optimal. Claude also replaced the dispatch engine&rsquo;s random tie-breaking with <strong>pro-rata dispatch</strong>&mdash;when multiple bid bands are at the same price and straddle the margin, dispatch is now split proportionally by capacity offered, matching how AEMO&rsquo;s NEMDE actually works. All educational content was then updated across 10+ files: the Game Guide, Game Master&rsquo;s Guide, Strategy Guide, Common Mistakes, Explain Tooltips, Landing Page educational slides, and more&mdash;adding pro-rata dispatch explanations, updated battery specs, &ldquo;arbitrage revenue&rdquo; terminology, and the concept that battery charging adds to market demand.</div>
      <div class="highlight"><strong>Key insight:</strong> This phase shows how vibe coding enables deep engine changes to ripple cleanly through an entire application. The battery mechanics required coordinated changes across shared types, the server dispatch engine, profit calculations, client UI components, bidding strategies, and all educational content. In traditional development this would be a multi-sprint epic requiring careful coordination between backend and frontend developers. Here, each change was described in plain English and Claude propagated it consistently across all 15+ affected files.</div>
    </div>

    <div class="timeline-item">
      <h3>Phase 10: Rebrand, Market Realism &amp; Portfolio Strategy <span class="badge badge-blue">20+ prompts &middot; Sessions 18&ndash;19</span></h3>
      <p><span class="badge badge-purple">Following weeks</span> The user wanted to give the game a memorable brand identity, add realistic negative pricing mechanics, and build educational content around portfolio strategy&mdash;a key NEM concept that was implicit in gameplay but never explicitly taught.</p>
      <div class="human"><strong>What the human said (examples):</strong></div>
      <ul style="font-size: 0.9rem; color: #4a5568;">
        <li>&ldquo;Can you suggest some good names for the game?&rdquo;</li>
        <li>&ldquo;Can you use Watt Street with tagline &lsquo;Bid. Dispatch. Dominate.&rsquo; and update all items including the guides and the movie trailer&rdquo;</li>
        <li>&ldquo;Add negative pricing / oversupply mechanics&mdash;when supply exceeds 3&times; demand, price drops to -$1,000/MWh&rdquo;</li>
        <li>&ldquo;Add a portfolio strategy explainer linked to real NEM examples with three in-game strategies&rdquo;</li>
        <li>&ldquo;Update the guides and vibe coding notes to describe these sessions&rdquo;</li>
      </ul>
      <div class="ai"><strong>What Claude did:</strong> This phase combined branding, engine enhancements, and educational content. Claude <strong>rebranded the entire application to &ldquo;Watt Street&rdquo;</strong>, updating 18+ files across the codebase: all HTML guides (cinematic trailer, game master guide, player pre-read, learn NEM, technical notes, vibe coding notes, recommended improvements), client pages (landing page with animated title reveal, dashboard, game setup, post-game report, game guide), package.json, and the server startup message. Seven parallel background agents were used to update the server-rendered HTML pages simultaneously. Claude then implemented <strong>negative pricing / oversupply mechanics</strong> in the dispatch engine: when total supply offered exceeds 3&times; demand, the clearing price crashes to -$1,000/MWh, matching real AEMO market floor behaviour. This was integrated with educational content explaining how oversupply creates opportunities for battery charging. <strong>Three pre-existing TypeScript errors</strong> were diagnosed and fixed: an <code>AssetDefinition</code> import path issue in surprises.ts and a missing <code>game:reset</code> event in the ServerToClientEvents socket interface. Finally, Claude built a <strong>6-slide Portfolio Strategy Explainer</strong> modal teaching portfolio diversification with real NEM context (the gentailer model used by AGL, Origin, and EnergyAustralia) and three concrete in-game strategies: the Baseload + Peaker Squeeze, the Renewable Shield, and the Battery Amplifier. A &ldquo;&#128202; Portfolio&rdquo; help button was added to the bidding screen (visible when teams have 3+ asset types). The Game Master&rsquo;s Guide and Player Pre-Read were updated with new portfolio strategy sections and glossary terms.</div>
      <div class="highlight"><strong>Key insight:</strong> The rebrand demonstrated a common vibe coding pattern&mdash;a single &ldquo;rename everything&rdquo; request touches 18+ files across the entire stack (HTML templates, React components, config files, console output), which would be tedious manual work but is well-suited to AI-assisted development. The portfolio explainer shows how domain expertise (NEM market knowledge) can be woven into educational game content through iterative conversation, with the AI drawing on real-world examples (specific power stations, company strategies) to make abstract concepts concrete and actionable for players.</div>
    </div>

    <div class="timeline-item">
      <h3>Phase 11: Asset-Type Bidding &amp; Guides Consolidation <span class="badge badge-blue">20+ prompts &middot; Sessions 20&ndash;21</span></h3>
      <p><span class="badge badge-purple">Following weeks</span> The user wanted each asset type to have its own distinct bidding interface matching how it works in the real NEM, rather than treating all assets the same way.</p>
      <div class="human"><strong>What the human said (examples):</strong></div>
      <ul style="font-size: 0.9rem; color: #4a5568;">
        <li>&ldquo;Can you consider how the hydro game mechanic works. Maybe it can only be bid in one period?&rdquo;</li>
        <li>&ldquo;The bidding page will now have four different types of bidding: thermal normal bids, renewables always at $0, hydro one-period dispatch, and battery charge/discharge&rdquo;</li>
        <li>&ldquo;Battery should be a 6-hour battery to match the 6-hour periods&rdquo;</li>
        <li>&ldquo;The battery arbitrageur should only affect battery bidding and you should be able to choose another strategy for thermal independently&rdquo;</li>
        <li>&ldquo;Add a battery bidding explainer after the minigame completes&rdquo;</li>
        <li>&ldquo;Move all the guides off the front page into a dedicated Guides page&rdquo;</li>
      </ul>
      <div class="ai"><strong>What Claude did:</strong> This was a major bidding system overhaul touching 15+ files. Claude implemented <strong>4 distinct bidding modes</strong> grouped by asset type: <strong>Thermal</strong> (coal, gas) with traditional price + quantity bid bands; <strong>Renewables</strong> (wind, solar) with auto-bid at $0/MWh showing read-only capacity cards per period; <strong>Hydro</strong> with a strategic single-period dispatch selector, water level bar, and storage-capped MW; and <strong>Battery</strong> with upgraded 6-hour duration (nameplateMW &times; 6), target SOC controls (&ldquo;Charge to 50%&rdquo;, &ldquo;Discharge to 0%&rdquo;), and a 4-slide post-minigame explainer bridging hourly play to 6-hour period bidding. Claude also built <strong>independent strategy layers</strong> so Battery Arbitrageur only affects battery settings (all periods) while thermal strategies (Price Taker, Marginal Cost, etc.) only affect coal/gas/hydro with a per-period or all-periods toggle. A <strong>hydro SOC tracking system</strong> was added to the profit calculator, parallel to the existing battery SOC. The asset category breakdown was expanded from 3 to 4 categories (renewables, battery, hydro, fossil). Multiple guardrails were updated to handle the new bidding modes correctly. The <strong>landing page was decluttered</strong> by moving all guide and educational links into a dedicated <code>/guides</code> page with organised sections (Player Guides, Host, Tools, Development). All existing guides (Gameplay Summary, Game Master&rsquo;s Guide, Vibe Coding Notes, Pre-Read, Quick Reference, Learn the NEM) were updated to reflect the new mechanics.</div>
      <div class="highlight"><strong>Key insight:</strong> This phase demonstrates how a domain expert&rsquo;s understanding of real-world energy market mechanics translates directly into game design improvements. Each of the four bidding modes matches how that asset type actually operates in the NEM: renewables bid at $0 and are dispatched first; hydro operators choose strategically when to release limited water; batteries arbitrage price differences; and thermal plants make conventional price/quantity bids. The independent strategy layers were designed so that a team could apply &ldquo;Battery Arbitrageur&rdquo; and then separately apply &ldquo;Price Maker&rdquo; to their thermal assets without either overriding the other&mdash;a UI pattern that required careful state management across the bidding form, strategy system, and submission logic.</div>
    </div>

    <div class="timeline-item">
      <h3>Phase 12: Documentation Restructure &amp; Teaching Content <span class="badge badge-blue">40+ prompts &middot; Sessions 22&ndash;23</span></h3>
      <p><span class="badge badge-purple">Following week</span> With the game mechanics now mature, the user wanted to rationalise the documentation ecosystem&mdash;8 overlapping server-side HTML pages plus several frontend components, produced at different development stages&mdash;into a coherent library where each document has a clear audience and purpose.</p>
      <div class="human"><strong>What the human said:</strong> &ldquo;The guides were produced at different stages. I want to restructure the whole documentation set: merge overlapping content, add what&rsquo;s missing, build a post-game educational compendium, and make sure every round in every mode has host teaching notes.&rdquo;</div>
      <div class="ai"><strong>What Claude did:</strong> This was a comprehensive documentation overhaul touching 17 files. Claude <strong>merged the Learn the NEM and Player Pre-Read</strong> into a single 8-page pre-session document with NEM basics, generator profiles, bidding strategies, and a glossary. The <strong>Quick Reference Guide</strong> gained a 7-step annotated bidding walkthrough with mock UI diagrams for each asset type. An entirely new <strong>Educational Compendium</strong> was created&mdash;a 14-page post-game take-home reference covering merit order mechanics, generator cost structures, seasonal demand, battery arbitrage formulas, all 6 bidding strategies, 8 market scenarios, and a glossary. A <strong>Round Bidding Guide</strong> overlay component was built for the team game interface, dynamically detecting what changed from the previous round (new assets, more periods, season changes, scenario events, battery introduction) and presenting it in an animated card stack. <strong>hostTeachingNotes</strong> were added to all rounds across all 6 game modes&mdash;beginner (1 round), quick (8 rounds), full (15 rounds), and experienced replay (4 rounds) had been missing these entirely. The <strong>Game Master&rsquo;s Guide</strong> was enhanced with a complete First Run round-by-round guide and a Facilitation Techniques section covering pause timing, surprise events, dominant/disengaged team management, and discussion questions. The <strong>Gameplay Summary</strong> was updated with UI Complexity Levels and Walkthrough Mode documentation. The <strong>Recommended Improvements</strong> page was rewritten from scratch into three categories (IT/Infrastructure, UX, Gameplay) with a game mode rationalisation analysis. The <strong>Guides index page</strong> was restructured into Player, Host, Tools, and Development sections. All route registrations and imports were updated.</div>
      <div class="highlight"><strong>Key insight:</strong> This phase illustrates a distinctive challenge of AI-assisted development: documentation sprawl. When features are built rapidly over many sessions, guides and docs accumulate organically. The restructure required understanding the <em>information architecture</em> of the entire project&mdash;who reads what, when, and why&mdash;and reorganising accordingly. Claude managed this across 17 files simultaneously, including server-side HTML templates, React components, round configuration data, and route registrations, keeping everything consistent.</div>
    </div>
  </div>

  <h2>The Prompts: What the Human Actually Said</h2>
  <div class="card">
    <p>Across all 23+ sessions, the human sent <strong>~320+ prompts</strong>. These ranged from a 500-word opening brief to single-word continuations like &ldquo;yes&rdquo; and &ldquo;continue.&rdquo; Here is how they break down by category:</p>

    <div class="split" style="margin-top: 1rem;">
      <div>
        <h3 style="color: #805ad5;">Feature Requests (~130 prompts, 40%)</h3>
        <p style="font-size: 0.9rem;">New features and capabilities, described in plain English:</p>
        <ul style="font-size: 0.85rem;">
          <li>Game concept and structure (initial 500-word brief)</li>
          <li>Bidding strategies and pre-fill buttons</li>
          <li>Merit order walkthrough animation</li>
          <li>Cinematic transitions and sound effects</li>
          <li>Bid review modal with warnings</li>
          <li>Asset configuration editor</li>
          <li>Host team view and dispatch overview</li>
          <li>Beginner mode</li>
          <li>PDF downloads for all resources</li>
          <li>Bidding guardrails</li>
          <li>Surprise events system (6 disruptions)</li>
          <li>Strategy guide, how-to-bid tutorial, help buttons</li>
          <li>Round briefing presentations</li>
          <li>Recommended improvements roadmap</li>
          <li>Progressive Learning mode (10 rounds)</li>
          <li>WiFi QR code sharing for venues</li>
          <li>Dark mode toggle</li>
          <li>Auto-advance on all bids submitted</li>
          <li>Host teaching notes with talking points</li>
          <li>Market snapshot infographic</li>
          <li>Quick recap cards and price history chart</li>
          <li>Explain tooltips for NEM terminology</li>
          <li>Bid presets (Price Taker, Cost Recovery, etc.)</li>
          <li>Spectator mode and post-game report</li>
          <li>Code splitting and performance optimisation</li>
          <li>Battery charge/discharge/idle mechanics with SOC tracking</li>
          <li>Battery Explainer (8-slide educational modal)</li>
          <li>Battery Arbitrage Mini-Game (24-hour exercise)</li>
          <li>Pro-rata dispatch for tied bids (matching real NEMDE)</li>
        </ul>
      </div>
      <div>
        <h3 style="color: #e53e3e;">Bug Reports (~25 prompts, 8%)</h3>
        <p style="font-size: 0.9rem;">Issues discovered through testing:</p>
        <ul style="font-size: 0.85rem;">
          <li>&ldquo;$0 is not showing in bids&rdquo;</li>
          <li>&ldquo;phone lost connection on standby&rdquo;</li>
          <li>&ldquo;server crashes sometimes&rdquo;</li>
          <li>&ldquo;transition slide stuck in a loop&rdquo; (&times;8)</li>
          <li>&ldquo;QR code disappears on second game&rdquo;</li>
          <li>&ldquo;iPhone cursor after the 0&rdquo;</li>
          <li>&ldquo;exit takes you back to lobby, not setup&rdquo;</li>
          <li>&ldquo;duplicate team names causing confusion&rdquo;</li>
          <li>&ldquo;the bundle is too large for mobile&rdquo;</li>
        </ul>
      </div>
    </div>
    <div class="split" style="margin-top: 1rem;">
      <div>
        <h3 style="color: #3182ce;">UI/UX Improvements (~45 prompts, 14%)</h3>
        <p style="font-size: 0.9rem;">Visual and usability refinements:</p>
        <ul style="font-size: 0.85rem;">
          <li>&ldquo;make the SRMC badges bigger&rdquo;</li>
          <li>&ldquo;put demand at the top of the bidding screen&rdquo;</li>
          <li>&ldquo;add commas in dollar amounts&rdquo;</li>
          <li>&ldquo;call out SRMC as its full name&rdquo;</li>
          <li>&ldquo;make the scrollbar a little larger&rdquo;</li>
          <li>&ldquo;make the opening screen more exciting&rdquo;</li>
          <li>&ldquo;add help buttons during bidding&rdquo;</li>
          <li>&ldquo;incident reports should feel dramatic&rdquo;</li>
          <li>&ldquo;add dark mode for evening sessions&rdquo;</li>
          <li>&ldquo;add tooltips explaining NEM terms&rdquo;</li>
        </ul>
      </div>
      <div>
        <h3 style="color: #718096;">Tooling Delegation (~90 prompts, 28%)</h3>
        <p style="font-size: 0.9rem;">Tasks a developer would do themselves, delegated to the AI:</p>
        <ul style="font-size: 0.85rem;">
          <li>&ldquo;give me a link to click to start&rdquo; (&times;8)</li>
          <li>&ldquo;please restart the server&rdquo; (&times;7)</li>
          <li>&ldquo;commit the changes to git&rdquo; (&times;5)</li>
          <li>&ldquo;please continue&rdquo; / &ldquo;tokens reset&rdquo; (&times;15)</li>
          <li>&ldquo;how many tokens do I have left?&rdquo;</li>
          <li>&ldquo;how do I open my previous work?&rdquo;</li>
          <li>&ldquo;I&rsquo;m going to turn off the computer&rdquo;</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="callout" style="margin-top: 1.5rem;">
    <p><strong>What&rsquo;s striking:</strong> Only <strong>40%</strong> of prompts were feature requests&mdash;the creative, directional input. Another <strong>8%</strong> were bug reports and <strong>14%</strong> were UI/UX refinements. The remaining <strong>28%</strong> were what we call <strong>&ldquo;tooling delegation&rdquo;</strong>&mdash;tasks like starting the server, committing to git, generating a clickable link, or managing conversation sessions. A professional developer would do these things themselves without thinking; they&rsquo;re not really &ldquo;operational&rdquo; prompts so much as a non-coder <em>delegating the mechanics of software development</em> to the AI. This is a distinctive feature of vibe coding by non-developers: the AI isn&rsquo;t just writing the code, it&rsquo;s also handling all the tooling around it.</p>
  </div>

  <h2>What Did Claude Already Know?</h2>
  <div class="card">
    <p>Claude's AI model was trained on a vast body of text from the internet and books, which means it already "knew" many things that were essential for building this game. Here are some examples:</p>

    <h3>Electricity Market Knowledge</h3>
    <ul>
      <li>How merit order dispatch works (sorting generators by cost, dispatching cheapest first)</li>
      <li>The concept of a clearing price (the last dispatched generator sets the price for all)</li>
      <li>Types of generation assets in the NEM and their approximate costs</li>
      <li>What scenarios affect electricity markets (heatwaves increasing demand, droughts reducing hydro, etc.)</li>
      <li>Market rules like price caps, negative pricing, and startup costs</li>
    </ul>

    <h3>Software Engineering Knowledge</h3>
    <ul>
      <li>How to build real-time multiplayer web applications</li>
      <li>How to create data visualisations (charts, graphs)</li>
      <li>How to make responsive designs that work on phones and desktops</li>
      <li>How to generate QR codes, create animations, and synthesise audio</li>
      <li>Best practices for error handling, network resilience, and application architecture</li>
      <li>Performance optimisation techniques like code splitting and lazy loading</li>
    </ul>

    <h3>Game Design Knowledge</h3>
    <ul>
      <li>How to structure a turn-based multiplayer game with bidding mechanics</li>
      <li>How to create progressive difficulty (beginner through to expert modes)</li>
      <li>How to provide feedback that teaches rather than just scores</li>
      <li>How to make interfaces intuitive for mobile users</li>
    </ul>
  </div>

  <h2>The Numbers</h2>
  <div class="card">
    <div class="split">
      <div>
        <h3>Scale of Work</h3>
        <ul>
          <li><strong>~50,000+ lines of code</strong> written</li>
          <li><strong>~150+ files</strong> created</li>
          <li><strong>22+ major versions</strong> committed to git</li>
          <li><strong>Several weeks</strong> elapsed, <strong>~10 hours</strong> active human time</li>
          <li><strong>7 asset types</strong> with realistic parameters</li>
          <li><strong>16+ scenario events</strong> (including 6 surprise events)</li>
          <li><strong>6 game modes</strong> (including Progressive Learning)</li>
          <li><strong>Pro-rata dispatch</strong> matching real AEMO NEMDE</li>
          <li><strong>Full battery arbitrage</strong> with charge/discharge/SOC</li>
        </ul>
      </div>
      <div>
        <h3>Human Input</h3>
        <ul>
          <li><strong>~320+ prompts</strong> across 23+ conversation sessions</li>
          <li><strong>~130 feature requests</strong> (40%)</li>
          <li><strong>~25 bug reports</strong> (8%)</li>
          <li><strong>~45 UI/UX improvements</strong> (14%)</li>
          <li><strong>~90 tooling delegation prompts</strong> (28%): server restarts, git commits, session continuations&mdash;tasks a developer would handle themselves, delegated to the AI by a non-coder</li>
          <li>Longest prompt: <strong>~500 words</strong> (opening game concept)</li>
          <li>Shortest prompt: <strong>1 word</strong> (&ldquo;continue&rdquo;, &ldquo;yes&rdquo;, &ldquo;both&rdquo;)</li>
        </ul>
      </div>
    </div>
    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
      <h3>What Would This Normally Take?</h3>
      <p>Let us compare the vibe coding approach with what a traditional corporate IT project would realistically look like for the same deliverable.</p>

      <div class="split" style="margin-top: 1rem;">
        <div class="card" style="border-top: 4px solid #38a169; margin: 0;">
          <h3 style="color: #38a169; margin-top: 0;">Vibe Coding Approach</h3>
          <ul>
            <li><strong>Team:</strong> 1 person (domain expert + AI)</li>
            <li><strong>Elapsed time:</strong> Several weeks</li>
            <li><strong>Human active time:</strong> ~10 hours</li>
            <li><strong>Equivalent AI dev effort:</strong> ~700 hours</li>
            <li><strong>Tooling cost:</strong> Claude Code subscription ~$200/month</li>
            <li><strong>Total cost:</strong> ~$200 + ~10 hours of the person&rsquo;s time</li>
          </ul>
          <p style="font-size: 0.9rem; margin-top: 0.8rem; color: #4a5568;">The person spent ~10 hours describing features in plain English, testing the game, reporting bugs, and providing domain expertise. Claude delivered the equivalent of ~700 hours of professional development work: 50,000+ lines of code, architecture design, UI, procedural audio engine, battery arbitrage mechanics, pro-rata dispatch, performance optimisation, and all documentation. A <strong>70:1 leverage ratio</strong>.</p>
        </div>

        <div class="card" style="border-top: 4px solid #e53e3e; margin: 0;">
          <h3 style="color: #e53e3e; margin-top: 0;">Traditional Corporate IT Approach</h3>
          <p style="font-size: 0.9rem;"><strong>Team required (minimum):</strong></p>
          <ul style="font-size: 0.85rem;">
            <li>1&times; Project Manager / BA &mdash; $1,400&ndash;1,800/day</li>
            <li>1&times; UX/UI Designer &mdash; $1,200&ndash;1,600/day</li>
            <li>2&times; Senior Full-Stack Developers &mdash; $1,400&ndash;1,800/day each</li>
            <li>1&times; QA/Test Engineer &mdash; $1,000&ndash;1,400/day</li>
            <li>1&times; Subject Matter Expert (0.3 FTE) &mdash; $1,200&ndash;1,600/day</li>
            <li>1&times; DevOps / Infrastructure (0.2 FTE) &mdash; $1,200&ndash;1,600/day</li>
          </ul>
        </div>
      </div>

      <div class="card" style="margin-top: 1rem;">
        <h3 style="margin-top: 0;">Traditional Timeline (realistic corporate)</h3>
        <div class="split">
          <div>
            <ul style="font-size: 0.9rem;">
              <li><strong>Weeks 1&ndash;3:</strong> Requirements gathering, stakeholder alignment, design sprints, procurement</li>
              <li><strong>Weeks 4&ndash;5:</strong> Architecture design, tech stack selection, environment setup, security review</li>
              <li><strong>Weeks 6&ndash;10:</strong> Core development (game engine, dispatch algorithm, real-time networking, multiplayer UI)</li>
            </ul>
          </div>
          <div>
            <ul style="font-size: 0.9rem;">
              <li><strong>Weeks 11&ndash;13:</strong> Battery mechanics, advanced features, educational content, game balancing</li>
              <li><strong>Weeks 14&ndash;15:</strong> Integration testing, cross-device QA, user acceptance testing</li>
              <li><strong>Week 16:</strong> Bug fixes, polish, deployment, documentation</li>
              <li><strong>Total: 14&ndash;16 weeks</strong></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top: 1rem; border-left: 4px solid #e53e3e;">
        <h3 style="margin-top: 0; color: #e53e3e;">Traditional Cost Estimate</h3>
        <ul style="font-size: 0.9rem;">
          <li><strong>Core team</strong> (PM + Designer + 2 Devs + QA): ~5 people &times; 16 weeks &times; 5 days &times; $1,400 avg = <strong>~$560,000</strong></li>
          <li><strong>Part-time specialists</strong> (SME at 0.3 FTE + DevOps at 0.2 FTE): <strong>~$65,000</strong></li>
          <li><strong>Corporate overhead</strong> (meetings, approvals, change requests, procurement, security reviews): <strong>+40&ndash;60%</strong></li>
          <li><strong>Infrastructure and tooling</strong> (cloud environments, CI/CD, licences, staging): <strong>~$10,000&ndash;20,000</strong></li>
          <li><strong>Testing and UAT cycles</strong> (multiplayer testing across devices, game balancing): <strong>~$40,000&ndash;60,000</strong></li>
        </ul>
        <p style="font-size: 1.1rem; font-weight: 700; color: #e53e3e; margin-top: 0.8rem; text-align: center;">Estimated total: $1,000,000 &ndash; $1,300,000</p>
      </div>

      <div class="callout" style="margin-top: 1rem;">
        <p><strong>And even then:</strong></p>
        <ul style="font-size: 0.9rem;">
          <li>No guarantee of the same creative iteration speed &mdash; features that took minutes in vibe coding would take days through sprint cycles</li>
          <li>Requirements would need to be locked much earlier &mdash; the organic discovery process (&ldquo;what if we added surprise events?&rdquo;) does not fit neatly into a waterfall or even an agile process</li>
          <li>Change requests mid-development are expensive &mdash; each new idea goes through estimation, prioritisation, and replanning</li>
          <li>The &ldquo;vibe&rdquo; &mdash; the rapid creative back-and-forth where ideas become working features in minutes &mdash; would be replaced by sprint planning, Jira tickets, and fortnightly demos</li>
        </ul>
      </div>

      <div class="highlight" style="margin-top: 1rem;">
        <p style="font-size: 0.9rem;"><strong>A note on the traditional estimate:</strong> The $1,000,000+ figure reflects the reality of corporate IT delivery. Projects of this complexity routinely involve procurement processes, security reviews, architectural review boards, multiple environments (dev/staging/prod), accessibility compliance, cross-device testing matrices, and documentation requirements that simply do not apply to a vibe-coding approach. In many large organisations, even getting a new project approved and a team assembled can take 4&ndash;6 weeks before any code is written. The game&rsquo;s real-time multiplayer architecture, procedural audio engine, battery arbitrage mechanics, pro-rata dispatch algorithm, and 6 game modes represent significant technical scope that would span multiple development sprints.</p>
      </div>

      <p style="margin-top: 1rem;">The vibe coding approach reduced this to <strong>~10 hours of human effort + AI over several weeks, using ~320 plain-English prompts and a $200 subscription</strong>. That&rsquo;s a 70:1 leverage ratio&mdash;every hour the human invested yielded roughly 70 hours of development output.</p>
    </div>
  </div>

  <h2>Common Questions</h2>

  <div class="card">
    <h3>Does the human need to know how to code?</h3>
    <p>Not necessarily, though it helps. In this case, the human had domain expertise in electricity markets and a general understanding of how software works, but did not write any of the code. The prompts were given in plain English&mdash;things like "add exit buttons" and "make the transitions more cinematic." Claude interpreted these instructions and made all the technical decisions.</p>
  </div>

  <div class="card">
    <h3>Is the code any good?</h3>
    <p>The code is written in TypeScript (a type-safe version of JavaScript), follows modern best practices, uses well-established open-source libraries, and includes error handling and network resilience features. It is structured in a way that would be familiar and maintainable to any professional developer. The architecture separates concerns cleanly: game logic is on the server, presentation is on the client, and shared types ensure consistency between both.</p>
  </div>

  <div class="card">
    <h3>Could this game be modified or extended?</h3>
    <p>Yes. Because the code is well-structured and uses standard technologies, any developer with JavaScript/TypeScript experience could modify it. Alternatively, the same vibe coding approach could be used&mdash;describe the changes you want to Claude and it will implement them. The game's data files (asset definitions, scenarios, demand profiles) are separated from the game logic, making it easy to adjust game parameters without touching the core code.</p>
  </div>

  <div class="card">
    <h3>What are the limitations of vibe coding?</h3>
    <ul>
      <li><strong>You need clear ideas.</strong> The AI is excellent at execution, but it needs direction. Vague requests produce vague results. Specific, well-thought-out requests produce impressive results.</li>
      <li><strong>Testing is still essential.</strong> AI-generated code can have bugs, just like human-written code. The iterative testing and feedback cycle (Phase 2) was crucial.</li>
      <li><strong>Domain expertise matters.</strong> Without the human's knowledge of the NEM, the game might have been technically impressive but factually wrong. The human validated that the game mechanics matched real market operations.</li>
      <li><strong>Complex debugging can be tricky.</strong> When something goes wrong, explaining the problem to the AI sometimes takes more effort than explaining what you want built. In one case, a cinematic transition between game phases was getting stuck in an infinite loop. Describing the visual bug in text wasn&rsquo;t enough for the AI to diagnose it. The solution was to use the <strong>Claude Chrome Extension</strong>&mdash;a browser plugin that lets Claude actually <em>see</em> what&rsquo;s on screen, read the live DOM, and inspect the running application in real time. Once Claude could observe the transition loop happening visually, it identified the root cause (a state update triggering a re-render that re-triggered the transition) and fixed it within minutes. This highlights an important lesson: some bugs are inherently <em>visual</em> and need to be seen, not just described.</li>
    </ul>
  </div>

  <div class="card">
    <h3>Is this the future of software development?</h3>
    <p>Vibe coding is rapidly becoming a mainstream approach for building applications, especially prototypes, internal tools, and educational software. It dramatically lowers the barrier to entry for software creation and compresses development timelines from weeks to hours. However, large-scale enterprise systems, safety-critical software, and highly regulated environments will likely continue to require traditional development practices with extensive testing, code review, and quality assurance for the foreseeable future.</p>
    <p>What is clear is that AI-assisted development&mdash;whether through vibe coding or more traditional AI pair-programming&mdash;is becoming a standard tool in every developer's toolkit.</p>
  </div>

  <h2>The Takeaway</h2>
  <div class="callout" style="background: linear-gradient(135deg, #fffbeb 0%, #faf5ff 100%); border: 2px solid #805ad5;">
    <p style="font-size: 1.15rem; font-weight: 700; color: #553c9a; text-align: center; margin-bottom: 0.8rem;">~10 hours of human effort. ~700 hours of equivalent AI development. $200.</p>
    <p>The human spent roughly <strong>10 active hours</strong> across several weeks&mdash;describing features, testing the game, reporting bugs, and providing domain expertise. In that same window, Claude delivered the equivalent of <strong>~700 hours of professional developer effort</strong>: 50,000+ lines of code, 150+ files, a real-time multiplayer architecture, a procedural audio engine, full battery arbitrage mechanics, pro-rata dispatch matching the real AEMO NEMDE, cinematic animations, and comprehensive documentation.</p>
    <p style="margin-top: 0.8rem;">That is a <strong>70:1 leverage ratio</strong>. For every hour the human invested in conversation, the AI delivered roughly 70 hours of development work&mdash;at a total AI cost of ~$200.</p>
    <p style="margin-top: 0.8rem;">That is the power of vibe coding: <strong>ideas become software at the speed of conversation</strong>.</p>
  </div>

  <div style="margin-top: 3rem; padding: 1.5rem; text-align: center; color: #718096; font-size: 0.85rem; border-top: 1px solid #e2e8f0;">
    <p>GridRival &mdash; Vibe Coding Notes</p>
    <p>Built with Claude Code (Anthropic Claude Opus 4.6) + human direction, February&ndash;March 2026</p>
  </div>
</div>
</body>
</html>`;
}
