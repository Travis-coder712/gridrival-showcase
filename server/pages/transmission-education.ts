/**
 * Transmission Education Piece — Understanding NEM Transmission Infrastructure
 *
 * Served at /api/transmission-education — open in browser, then File > Print > Save as PDF
 *
 * Covers: REZs (SW NSW focus), key transmission projects, curtailment types,
 * connection risks, modelling, and solutions.
 */
export function getTransmissionEducationHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GridRival &mdash; Transmission Education Piece</title>
<style>
  @page { margin: 1.5cm 2cm; size: A4; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1a202c; line-height: 1.6; font-size: 11pt; }
  .page { page-break-after: always; min-height: 100vh; padding: 0; }
  .page:last-child { page-break-after: avoid; }

  /* Cover page */
  .cover { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: linear-gradient(135deg, #1e3a5f 0%, #0f1b2d 100%); color: white; min-height: 100vh; padding: 3rem; }
  .cover h1 { font-size: 2.6rem; font-weight: 800; margin-bottom: 0.5rem; letter-spacing: -1px; }
  .cover .subtitle { font-size: 1.3rem; color: #63b3ed; margin-bottom: 2rem; }
  .cover .bolt { font-size: 5rem; margin-bottom: 1.5rem; }
  .cover .tagline { font-size: 1rem; color: #a0aec0; max-width: 600px; line-height: 1.7; }
  .cover .toc-box { margin-top: 2.5rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 1.5rem 2rem; text-align: left; max-width: 520px; }
  .cover .toc-box h3 { color: #63b3ed; font-size: 0.9rem; margin-bottom: 0.7rem; text-transform: uppercase; letter-spacing: 1px; }
  .cover .toc-box li { color: #e2e8f0; font-size: 0.85rem; margin-bottom: 0.4rem; list-style: none; padding-left: 1.5rem; position: relative; }
  .cover .toc-box li::before { content: "\\2713"; position: absolute; left: 0; color: #48bb78; font-weight: bold; }

  /* Content pages */
  h2 { font-size: 1.5rem; color: #1e3a5f; border-bottom: 3px solid #3182ce; padding-bottom: 0.4rem; margin-bottom: 1rem; margin-top: 1.5rem; }
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

  /* Table styles */
  table { width: 100%; border-collapse: collapse; margin: 0.8rem 0; font-size: 0.85rem; }
  th { background: #1e3a5f; color: white; padding: 0.5rem 0.6rem; text-align: left; font-weight: 600; }
  td { padding: 0.45rem 0.6rem; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) td { background: #f7fafc; }

  /* Formula / code block */
  .formula { background: #edf2f7; border: 1px solid #cbd5e0; border-radius: 8px; padding: 0.8rem 1rem; margin: 0.6rem 0; font-family: monospace; font-size: 0.9rem; white-space: pre-wrap; }

  /* Diagram block */
  .diagram { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin: 0.8rem 0; font-family: monospace; font-size: 0.8rem; line-height: 1.4; white-space: pre; overflow-x: auto; text-align: center; }

  /* Project card */
  .project-card { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1rem; margin: 0.8rem 0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
  .project-card h4 { margin-top: 0; font-size: 1.1rem; }
  .project-card .meta { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0.5rem 0; }
  .project-card .tag { display: inline-block; background: #ebf8ff; color: #2b6cb0; font-size: 0.75rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 4px; }
  .project-card .tag-green { background: #f0fff4; color: #276749; }
  .project-card .tag-amber { background: #fffbeb; color: #975a16; }
  .project-card .tag-red { background: #fff5f5; color: #c53030; }

  /* Curtailment type card */
  .curtail-card { background: white; border-left: 4px solid; border-radius: 0 8px 8px 0; padding: 0.8rem 1rem; margin: 0.6rem 0; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
  .curtail-card.economic { border-color: #3182ce; }
  .curtail-card.system-strength { border-color: #d69e2e; }
  .curtail-card.thermal { border-color: #e53e3e; }
  .curtail-card.voltage { border-color: #805ad5; }
  .curtail-card.mlf { border-color: #38a169; }

  /* Step indicators */
  .steps { counter-reset: step-counter; }
  .step { counter-increment: step-counter; position: relative; padding-left: 2.5rem; margin-bottom: 0.8rem; }
  .step::before { content: counter(step-counter); position: absolute; left: 0; top: 0; width: 1.8rem; height: 1.8rem; background: #3182ce; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; }

  .no-print { background: #1e3a5f; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; }
  .no-print a { color: #63b3ed; text-decoration: none; font-size: 14px; font-weight: 500; }
  .no-print a:hover { color: #90cdf4; }
  .no-print button { background: #3182ce; color: white; border: none; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
  .no-print button:hover { background: #4299e1; }

  @media print {
    .no-print { display: none !important; }
    body { font-size: 10pt; }
    .page { min-height: auto; }
    .cover { min-height: auto; padding: 4rem 2rem; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    h2 { page-break-after: avoid; }
    .card, .project-card, .curtail-card, .highlight, .key-concept { page-break-inside: avoid; }
    table { page-break-inside: avoid; }
    th { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  }

  @media (max-width: 768px) {
    .two-col, .three-col { grid-template-columns: 1fr; }
    .cover h1 { font-size: 2rem; }
    .diagram { font-size: 0.65rem; }
  }
</style>
</head>
<body>

<div class="no-print">
  <a href="/gridrival-showcase/">&larr; Back to Game</a>
  <button onclick="window.print()">Print / Save as PDF</button>
</div>

<!-- ========== COVER PAGE ========== -->
<div class="page cover">
  <div class="bolt">🔌</div>
  <h1>Transmission Education Piece</h1>
  <div class="subtitle">Understanding the Wires That Power Australia's Energy Transition</div>
  <div class="tagline">
    The energy transition isn't just about building solar farms and wind turbines. Without
    transmission infrastructure to transport that energy to where it's needed, renewable generation
    gets curtailed, stranded, or never built at all. This document explains how transmission works
    in the NEM, why it matters, and what risks developers face.
  </div>
  <div class="toc-box">
    <h3>What's Inside</h3>
    <ul>
      <li>Renewable Energy Zones &mdash; SW NSW REZ deep-dive</li>
      <li>Key transmission projects reshaping the NEM</li>
      <li>Five types of curtailment and why they happen</li>
      <li>How NEMDE dispatches around constraints</li>
      <li>Connection risks and what developers must model</li>
      <li>Solutions &mdash; from batteries to dynamic line ratings</li>
      <li>The scale of curtailment today and where it's heading</li>
    </ul>
  </div>
</div>

<!-- ========== SECTION 1: RENEWABLE ENERGY ZONES ========== -->
<div class="page content">
  <h2 id="rez">1. Renewable Energy Zones (REZs)</h2>

  <div class="key-concept">
    <strong>Core Concept:</strong> A Renewable Energy Zone is a geographic area with excellent
    renewable resources where <em>coordinated</em> transmission investment unlocks large-scale
    generation. Think of it as an industrial zone for clean energy &mdash; build the roads (transmission)
    before the factories (generators), not after.
  </div>

  <h3>Why Designate Zones?</h3>
  <div class="two-col">
    <div class="card">
      <h4>Without REZs (Reactive)</h4>
      <ul>
        <li>Each project connects individually</li>
        <li>Transmission augmented one project at a time</li>
        <li>First come, first served</li>
        <li>Cumulative congestion worsens over time</li>
        <li>MLFs degrade as more projects cluster</li>
        <li>Community faces repeated separate consultations</li>
      </ul>
    </div>
    <div class="card">
      <h4>With REZs (Proactive)</h4>
      <ul>
        <li>Shared transmission serves many generators</li>
        <li>Network planned before generators connect</li>
        <li>Access rights allocated with capacity limits</li>
        <li>Economies of scale reduce per-project cost</li>
        <li>MLFs more stable with proper network sizing</li>
        <li>One comprehensive community engagement process</li>
      </ul>
    </div>
  </div>

  <h3>Who Does What?</h3>
  <table>
    <tr><th>Entity</th><th>Role in REZ Development</th></tr>
    <tr><td><strong>AEMO</strong></td><td>Identifies REZs in the Integrated System Plan (ISP). Operates dispatch engine. Does not build transmission.</td></tr>
    <tr><td><strong>EnergyCo (NSW)</strong></td><td>Statutory authority under the EII Act 2020. Coordinates REZ infrastructure, access schemes, and community engagement.</td></tr>
    <tr><td><strong>TransGrid</strong></td><td>NSW Transmission Network Service Provider (TNSP). Builds and operates the actual transmission assets.</td></tr>
    <tr><td><strong>AER</strong></td><td>Approves regulated revenue for transmission investments through the Regulatory Investment Test (RIT-T).</td></tr>
    <tr><td><strong>AEMC</strong></td><td>Sets market rules governing REZs, access, and connections.</td></tr>
  </table>

  <h3>NSW's Five Declared REZs</h3>
  <div class="diagram">
┌──────────────────────────────────────────────────────────────────┐
│                     NEW SOUTH WALES REZs                         │
│                                                                  │
│   ┌─────────────┐        ┌──────────────┐                       │
│   │  New England │        │ Hunter-Central│                       │
│   │  (Armidale)  │        │    Coast     │   ← Repurposing       │
│   └──────┬──────┘        └──────┬───────┘     coal country       │
│          │                      │                                 │
│   ┌──────┴──────┐        ┌──────┴───────┐    ┌──────────────┐   │
│   │Central-West │        │    Sydney    │    │  Illawarra    │   │
│   │   Orana     │───────→│  (demand)    │    │ (offshore     │   │
│   │ (first REZ) │        │             │    │   wind)       │   │
│   └─────────────┘        └──────┬───────┘    └──────────────┘   │
│                                 │                                 │
│                          ┌──────┴───────┐                        │
│                          │  South-West  │ ← Our focus            │
│                          │    NSW       │                         │
│                          │(Hay/Balranald│                         │
│                          │/Darlington Pt│                         │
│                          └──────────────┘                        │
└──────────────────────────────────────────────────────────────────┘</div>

  <h3>Deep Dive: South-West NSW REZ</h3>

  <div class="highlight">
    <strong>Location:</strong> The Riverina and far-western NSW &mdash; centred around <strong>Hay, Balranald,
    Darlington Point, Jerilderie, and Deniliquin</strong>. Flat pastoral plains straddling the
    Murrumbidgee and Murray river corridors.
  </div>

  <h4>Why This Area?</h4>
  <div class="three-col">
    <div class="card">
      <h4>☀️ Solar Resource</h4>
      <p>Among the highest irradiance in NSW: ~5.5&ndash;6.0 kWh/m&sup2;/day annual average</p>
    </div>
    <div class="card">
      <h4>💨 Wind Potential</h4>
      <p>Strong wind profiles, particularly in the western portions of the zone</p>
    </div>
    <div class="card">
      <h4>📍 Strategic Location</h4>
      <p>Sits at the intersection of flows between NSW, Victoria, and South Australia</p>
    </div>
  </div>

  <h4>Existing Generation in the Zone</h4>
  <table>
    <tr><th>Project</th><th>Capacity</th><th>Developer</th><th>Status</th></tr>
    <tr><td>Darlington Point Solar Farm</td><td>333 MW</td><td>Edify Energy</td><td>Operational</td></tr>
    <tr><td>Limondale Solar Farm</td><td>249 MW</td><td>&mdash;</td><td>Operational</td></tr>
    <tr><td>Coleambally Solar Farm</td><td>150 MW</td><td>&mdash;</td><td>Operational</td></tr>
    <tr><td>Finley Solar Farm</td><td>133 MW</td><td>&mdash;</td><td>Operational</td></tr>
    <tr><td>Hay Sun Farm</td><td>150 MW</td><td>Lightsource bp</td><td>Operational</td></tr>
    <tr><td>+ pipeline</td><td>8&ndash;12 GW</td><td>Various</td><td>Various stages</td></tr>
  </table>

  <div class="highlight-amber">
    <strong>The bottleneck:</strong> The SW NSW REZ already has significant generation connected and
    experiencing curtailment due to network congestion. The existing 330kV network from Darlington Point
    and Wagga toward Sydney cannot carry all the solar output during midday peaks. Two critical
    transmission projects must be completed to unlock the zone's full potential.
  </div>
</div>

<!-- ========== SECTION 2: KEY TRANSMISSION INFRASTRUCTURE ========== -->
<div class="page content">
  <h2 id="transmission">2. Key NEM Transmission Infrastructure</h2>

  <h3>The NEM Interconnector Network</h3>
  <p>
    The NEM's five regions (QLD, NSW, VIC, SA, TAS) are connected by regulated interconnectors.
    Each has defined transfer limits in each direction, which vary dynamically based on system conditions.
  </p>

  <div class="diagram">
                    ┌───────────┐
                    │Queensland │
                    └─────┬─────┘
              QNI ~600 MW │ ↕ ~1,078 MW
              Terranora   │ (180 MW)
                    ┌─────┴─────┐
           ┌───────│  New South │────────┐
           │       │   Wales    │        │
           │       └─────┬─────┘        │
           │             │              │
    EnergyConnect    VNI │ ~700-       (future)
    ~800 MW         1,350│ MW          VNI West
           │             │          ~1,900 MW
     ┌─────┴─────┐ ┌─────┴─────┐
     │  South    │ │ Victoria  │
     │ Australia │ │           │
     └─────┬─────┘ └─────┬─────┘
           │             │
    Heywood ~600 MW      │ Basslink ~478 MW
    Murraylink 220 MW    │ (HVDC undersea)
           │       ┌─────┴─────┐
           └───────│ Tasmania  │
                   └───────────┘</div>

  <h3>Existing Interconnectors</h3>

  <table>
    <tr><th>Interconnector</th><th>Regions</th><th>Type</th><th>Capacity</th><th>Typical Flow</th></tr>
    <tr>
      <td><strong>QNI</strong></td>
      <td>QLD &harr; NSW</td>
      <td>330kV AC</td>
      <td>~600 MW south / ~1,078 MW north</td>
      <td>QLD exports midday (solar), NSW can export evening</td>
    </tr>
    <tr>
      <td><strong>Terranora</strong></td>
      <td>QLD &harr; NSW</td>
      <td>HVDC</td>
      <td>180 MW</td>
      <td>Gold Coast corridor</td>
    </tr>
    <tr>
      <td><strong>VNI</strong></td>
      <td>VIC &harr; NSW</td>
      <td>330kV AC</td>
      <td>~700&ndash;1,350 MW</td>
      <td>Bidirectional; increasingly VIC&rarr;NSW midday</td>
    </tr>
    <tr>
      <td><strong>Heywood</strong></td>
      <td>SA &harr; VIC</td>
      <td>275kV AC</td>
      <td>~460&ndash;600 MW</td>
      <td>SA exports midday (wind/solar), imports evening</td>
    </tr>
    <tr>
      <td><strong>Murraylink</strong></td>
      <td>SA &harr; VIC</td>
      <td>HVDC</td>
      <td>220 MW</td>
      <td>Merchant interconnector</td>
    </tr>
    <tr>
      <td><strong>Basslink</strong></td>
      <td>TAS &harr; VIC</td>
      <td>HVDC (undersea)</td>
      <td>~478 MW</td>
      <td>TAS exports hydro at peak; imports off-peak</td>
    </tr>
  </table>

  <div class="highlight">
    <strong>Key insight:</strong> Transfer limits are NOT fixed. They vary dynamically based on
    thermal ratings (ambient temperature, wind cooling), system stability limits, system strength
    at either end, other generation patterns, and outage conditions.
  </div>

  <h3>Major Transmission Projects Under Development</h3>

  <div class="project-card">
    <h4>⚡ Project EnergyConnect</h4>
    <div class="meta">
      <span class="tag">SA &harr; NSW</span>
      <span class="tag">~800 MW</span>
      <span class="tag tag-amber">~$2.3&ndash;2.4B</span>
      <span class="tag tag-green">Nearing completion</span>
    </div>
    <p>
      <strong>Route:</strong> Robertstown (SA) &rarr; Buronga (NSW) &rarr; Wagga Wagga (NSW), with spur to Red Cliffs (VIC).
    </p>
    <p>
      <strong>Why it matters:</strong> Creates SA's second connection to the NEM (currently only via Heywood).
      The Buronga&ndash;Wagga section runs directly through the SW NSW REZ, unlocking renewable generation
      and enabling power to flow east-west.
    </p>
    <p><strong>Developers:</strong> ElectraNet (SA section), TransGrid (NSW section).</p>
  </div>

  <div class="project-card">
    <h4>⛰️ HumeLink</h4>
    <div class="meta">
      <span class="tag">Snowy &harr; Sydney/Melbourne</span>
      <span class="tag">~3,100 MW</span>
      <span class="tag tag-red">~$4.8&ndash;5.0B+</span>
      <span class="tag tag-amber">Early construction</span>
    </div>
    <p>
      <strong>Route:</strong> 500kV double-circuit line: Wagga Wagga &rarr; Bannaby (near Snowy 2.0) &rarr; Maragle (near Khancoban).
    </p>
    <p>
      <strong>Why it matters:</strong> <em>Critical enabler for Snowy 2.0</em> &mdash; without HumeLink,
      Snowy 2.0 cannot export its full 2,200 MW output. Also unlocks the SW NSW REZ by providing
      a high-capacity path to Sydney demand centres. Relieves chronic congestion on existing 330kV lines.
    </p>
    <p><strong>Developer:</strong> TransGrid. Target: 2027&ndash;2028.</p>
  </div>

  <div class="project-card">
    <h4>🌊 MarinusLink</h4>
    <div class="meta">
      <span class="tag">TAS &harr; VIC</span>
      <span class="tag">2 &times; 750 MW</span>
      <span class="tag tag-amber">~$3.5&ndash;4.0B</span>
      <span class="tag tag-amber">Planning</span>
    </div>
    <p>
      <strong>Route:</strong> NW Tasmania (near Burnie) &rarr; Latrobe Valley (VIC), undersea through Bass Strait.
    </p>
    <p>
      <strong>Why it matters:</strong> Unlocks Tasmania's wind, hydro, and pumped hydro resources
      ("Battery of the Nation"). Provides redundancy for the aging Basslink. Supports Victoria's
      coal exit with firm renewable-backed capacity.
    </p>
  </div>

  <div class="project-card">
    <h4>🔄 VNI West</h4>
    <div class="meta">
      <span class="tag">VIC &harr; NSW (western)</span>
      <span class="tag">~1,800&ndash;1,930 MW</span>
      <span class="tag tag-amber">~$3.1&ndash;3.4B</span>
      <span class="tag tag-amber">Planning/approvals</span>
    </div>
    <p>
      <strong>Route:</strong> Western VIC (Sydenham/Bulgana) &rarr; NW VIC &rarr; NSW (Dinawan/Darlington Point).
    </p>
    <p>
      <strong>Why it matters:</strong> Relieves congestion on the existing VNI eastern corridor.
      Opens western Victorian REZs (enormous wind/solar resources currently heavily congested).
      Creates a second geographic corridor between VIC and NSW for resilience.
    </p>
  </div>

  <div class="highlight-green">
    <strong>The network effect:</strong> These projects don't work in isolation. EnergyConnect + HumeLink
    together unlock the SW NSW REZ. VNI West + HumeLink together create pathways from VIC renewables
    to NSW demand. MarinusLink + HumeLink enable Tasmanian hydro to support the mainland during
    Snowy 2.0's peak operations.
  </div>
</div>

<!-- ========== SECTION 3: CURTAILMENT TYPES ========== -->
<div class="page content">
  <h2 id="curtailment">3. Curtailment &mdash; Types and Causes</h2>

  <div class="key-concept">
    <strong>What is curtailment?</strong> The reduction of a generator's output below what it could
    physically produce. Curtailment means lost generation and lost revenue. As renewable share grows,
    curtailment is becoming one of the most critical challenges in the NEM.
  </div>

  <h3>The Five Types of Curtailment</h3>

  <div class="curtail-card economic">
    <h4>1. Economic Curtailment (Negative Prices)</h4>
    <p>
      <strong>What happens:</strong> When spot prices fall to zero or negative, generators with positive
      marginal costs withdraw. Even zero-marginal-cost renewables self-curtail if:
    </p>
    <ul>
      <li>Their PPA has a negative price threshold (commonly &minus;$50 or &minus;$100/MWh)</li>
      <li>LGC value doesn't offset the negative price</li>
      <li>Their contract exposes them to spot price</li>
    </ul>
    <p>
      <strong>Scale:</strong> The <em>largest component</em> of NEM curtailment. SA routinely
      experiences midday negative prices. Some regions see negative prices for 15&ndash;20% of
      trading intervals during high-solar quarters.
    </p>
    <div class="highlight">
      <strong>The signal:</strong> Economic curtailment is a rational market response &mdash; it signals
      oversupply at that time and location. But persistent economic curtailment signals structural
      issues: insufficient transmission to export, insufficient storage to absorb, or too much
      generation in one location.
    </div>
  </div>

  <div class="curtail-card system-strength">
    <h4>2. System Strength Curtailment</h4>
    <p>
      <strong>What happens:</strong> "System strength" is the power system's ability to maintain stable
      voltage waveforms. It comes from synchronous generators (coal, gas, hydro) whose rotating mass
      provides electromagnetic stiffness.
    </p>
    <p>
      As synchronous generators retire and inverter-based resources (IBR) replace them, system strength
      declines. When AEMO declares a <strong>system strength shortfall</strong>, it imposes constraint
      equations limiting IBR output because too many inverters in a weak network can cause:
    </p>
    <ul>
      <li>Voltage instability</li>
      <li>Inverter interaction issues (oscillatory instability between control systems)</li>
      <li>Inability to ride through faults</li>
    </ul>
    <p><strong>Most affected:</strong> SA (fewest synchronous generators), plus parts of regional NSW and QLD.</p>
  </div>

  <div class="curtail-card thermal">
    <h4>3. Thermal Curtailment (Network Congestion)</h4>
    <p>
      <strong>What happens:</strong> Every transmission line has a thermal rating &mdash; the maximum power
      it can carry before conductors overheat. When combined generator output exceeds line capacity,
      some generators must be curtailed.
    </p>
    <p><strong>Worst-affected areas:</strong></p>
    <ul>
      <li><strong>SW NSW</strong> &mdash; 330kV lines from Darlington Point/Wagga toward Sydney, chronically congested during midday solar</li>
      <li><strong>Western VIC</strong> &mdash; 220kV network serving Western Victoria REZ, among the most congested in the NEM</li>
      <li><strong>North QLD</strong> &mdash; 275kV backbone from north QLD to SE QLD congested during high wind/solar</li>
      <li><strong>SA export path</strong> &mdash; Heywood interconnector limits constrain SA exports</li>
    </ul>
  </div>

  <div class="curtail-card voltage">
    <h4>4. Voltage Curtailment</h4>
    <p>
      <strong>What happens:</strong> The power system must maintain voltage within &plusmn;10% of nominal.
      Long transmission distances with high power flows cause voltage rise at the sending end
      and voltage collapse risk at the receiving end.
    </p>
    <p>
      Solar farms at the end of long radial feeders in regional areas are particularly susceptible.
      When voltage limits are approached, NEMDE constrains generation in the affected area.
    </p>
  </div>

  <div class="curtail-card mlf">
    <h4>5. MLF Degradation (Effective Curtailment)</h4>
    <p>
      <strong>What happens:</strong> Marginal Loss Factors represent the electrical losses when power
      travels through the network. Revenue = Spot Price &times; MLF &times; MWh.
    </p>
    <div class="two-col">
      <div class="card">
        <h4>How MLFs Work</h4>
        <ul>
          <li>Calculated by AEMO annually for each connection point</li>
          <li><span class="stat">MLF = 1.0</span> &rarr; no losses (at reference node)</li>
          <li><span class="stat">MLF = 0.90</span> &rarr; 10% of value lost to transmission</li>
          <li>Reference nodes: Sydney West (NSW), Thomastown (VIC), South Pine (QLD), Torrens Island (SA)</li>
        </ul>
      </div>
      <div class="card">
        <h4>The Degradation Problem</h4>
        <ul>
          <li>Each new project in an area pushes everyone's MLFs lower</li>
          <li>Creates a first-mover disadvantage</li>
          <li>Some farms: MLF dropped from ~0.95 to ~0.82 in a few years</li>
          <li>A 15% MLF degradation has the same revenue impact as 15% physical curtailment</li>
          <li>No hedging product exists for MLF risk</li>
        </ul>
      </div>
    </div>
  </div>

  <h3>How NEMDE Handles Constraints</h3>

  <p>
    NEMDE (National Electricity Market Dispatch Engine) runs every 5 minutes, solving a linear
    optimisation: <em>minimise total dispatch cost subject to constraints</em>.
  </p>

  <div class="formula">Constraint equation form:  a1&times;G1 + a2&times;G2 + ... + an&times;Gn &le; Limit

Where:
  G1...Gn = MW output of generators and interconnectors
  a1...an = participation factors (how much each contributes to flow)
  Limit   = maximum permissible flow (thermal, voltage, or stability)

NEMDE manages ~6,000&ndash;8,000 constraint equation sets simultaneously.</div>

  <p>
    When a constraint <strong>binds</strong>, NEMDE redispatches: generators behind the constraint
    are curtailed, while more expensive generators on the demand side are dispatched up.
    Generators do not directly "see" the constraint equations &mdash; they infer curtailment from
    dispatch targets being below their offered capacity. This opacity is one criticism that
    "access reform" proposals aim to address.
  </p>
</div>

<!-- ========== SECTION 4: CONNECTION AND DEVELOPMENT RISKS ========== -->
<div class="page content">
  <h2 id="connection">4. Connection and Development Risks</h2>

  <p>
    Before a new generator can connect to the NEM, it must navigate a process that typically takes
    <strong>2&ndash;5 years</strong> from initial inquiry to commercial operation.
  </p>

  <h3>The Connection Process</h3>

  <div class="steps">
    <div class="step">
      <strong>Connection Enquiry</strong> &mdash; Initial inquiry to the TNSP. Identifies proposed
      connection point, capacity, and technology.
    </div>
    <div class="step">
      <strong>Preliminary Response</strong> &mdash; TNSP provides indicative information about
      available capacity, likely connection works, and costs. (~3&ndash;6 months)
    </div>
    <div class="step">
      <strong>Connection Application</strong> &mdash; Formal application with detailed technical
      information. Triggers detailed technical assessment.
    </div>
    <div class="step">
      <strong>Connection Offer</strong> &mdash; TNSP provides formal offer including required works,
      costs, GPS to be met, system strength obligations, and timeline. (~6&ndash;18+ months)
    </div>
    <div class="step">
      <strong>AEMO Registration</strong> &mdash; Register as a market participant, meeting all
      technical and commercial requirements.
    </div>
    <div class="step">
      <strong>Design, Procurement &amp; Construction</strong> &mdash; Approved designs, equipment
      procurement, construction with ongoing compliance verification.
    </div>
    <div class="step">
      <strong>Commissioning</strong> &mdash; Testing, hold-point inspections, R2 testing, AEMO
      commissioning studies.
    </div>
    <div class="step">
      <strong>Commercial Operation</strong> &mdash; Full market participant registration. Dispatch
      by NEMDE begins.
    </div>
  </div>

  <div class="highlight-amber">
    <strong>The backlog:</strong> AEMO's connection queue currently contains 100+ GW of proposed projects.
    The volume of applications far exceeds the system's capacity to process them efficiently.
  </div>

  <h3>Generator Performance Standards (GPS)</h3>

  <p>
    Under the National Electricity Rules (NER), all new generators must meet technical performance
    standards negotiated with the TNSP and AEMO:
  </p>

  <div class="two-col">
    <div class="card">
      <h4>Automatic Access Standards (Minimum)</h4>
      <ul>
        <li>Reactive power capability (power factor range, typically 0.93 leading to 0.93 lagging)</li>
        <li>Voltage and frequency ride-through capability</li>
        <li>Active power control (ramp rate limits, frequency response)</li>
        <li>Power quality (harmonics, flicker)</li>
      </ul>
    </div>
    <div class="card">
      <h4>Modelling Required</h4>
      <ul>
        <li>Power system modelling (PSS/E, PSCAD, PowerFactory)</li>
        <li>EMT (electromagnetic transient) studies for IBR</li>
        <li>RMS stability studies</li>
        <li>Short-circuit analysis</li>
        <li>Harmonic assessment</li>
        <li>Protection coordination studies</li>
      </ul>
    </div>
  </div>

  <h3>System Strength Assessment</h3>

  <p>
    Since ~2018, new generators must assess their impact on system strength and potentially
    fund remediation:
  </p>

  <ul>
    <li>Generator provides AEMO with detailed inverter/plant models</li>
    <li>AEMO assesses whether the new connection causes a system strength shortfall</li>
    <li>If so, the generator must fund <strong>system strength remediation</strong> &mdash; which could mean paying for synchronous condensers or other services</li>
    <li>Cost: can add <strong>$10&ndash;50M+</strong> depending on location and scale</li>
  </ul>

  <p>
    <strong>Short Circuit Ratio (SCR):</strong> Measures available fault current relative to generator
    rating. SCR &lt; 3 indicates a "weak grid" point. SCR &lt; 2 may require grid-forming inverters
    or specialised tuning.
  </p>

  <h3>MLF Forecasting &mdash; The Biggest Unknown</h3>

  <div class="highlight-red">
    <strong>MLF risk is one of the biggest unmanageable risks for renewable developers.</strong>
    There is no hedging product for MLF risk, and a 5&ndash;10% MLF degradation can turn a profitable
    project into a loss-maker.
  </div>

  <h4>How It's Done</h4>
  <ul>
    <li>Developers commission consultants to run <strong>load flow models</strong> of the NEM network</li>
    <li>Model estimates the MLF at the proposed connection point considering all existing/committed generation, planned augmentations, and demand patterns</li>
    <li>AEMO publishes indicative MLFs annually using a standard methodology</li>
  </ul>

  <h4>Key Unknowns</h4>
  <table>
    <tr><th>Unknown</th><th>Why It Matters</th></tr>
    <tr><td>Other pipeline projects</td><td>If 3 other farms connect nearby before you, your MLF will be significantly lower than modelled</td></tr>
    <tr><td>Demand changes</td><td>If local demand decreases, MLFs degrade</td></tr>
    <tr><td>Network augmentation timing</td><td>If planned transmission upgrades are delayed, MLF forecasts based on them being in place will be wrong</td></tr>
    <tr><td>Retirement timing</td><td>When nearby synchronous generators retire, flow patterns change and MLFs shift</td></tr>
    <tr><td>Year-to-year variability</td><td>AEMO recalculates annually based on previous year's actual flow patterns</td></tr>
  </table>

  <h3>Congestion Modelling</h3>

  <p>Developers must model their expected curtailment exposure:</p>
  <ul>
    <li>Expected dispatch profiles of their plant and all others in the area</li>
    <li>Network transfer capability and which constraint equations bind</li>
    <li>Historical constraint binding patterns (from AEMO MMS data)</li>
    <li>Sensitivity analysis to other projects connecting</li>
    <li>Revenue-at-risk modelling with probabilistic curtailment scenarios</li>
  </ul>
  <p>
    Tools used include <strong>PLEXOS, PROPHET</strong>, and similar power system simulation
    platforms with stochastic wind/solar generation modelling.
  </p>

  <h3>Behind-the-Meter vs In-Front-of-Meter</h3>

  <div class="two-col">
    <div class="card">
      <h4>In-Front-of-Meter (Utility Scale)</h4>
      <ul>
        <li>Connects directly to transmission/distribution</li>
        <li>Full GPS compliance required</li>
        <li>Subject to MLF, dispatch by NEMDE</li>
        <li>Fully exposed to congestion and curtailment</li>
        <li>Earns LGCs</li>
      </ul>
    </div>
    <div class="card">
      <h4>Behind-the-Meter</h4>
      <ul>
        <li>Reduces demand at connection point</li>
        <li>Not dispatched by NEMDE (treated as negative demand)</li>
        <li>Avoids MLF, congestion, and market price risk</li>
        <li>Limited by host site's demand</li>
        <li>Subject to AS4777.2 inverter standards</li>
        <li>AEMO backstop curtailment possible</li>
      </ul>
    </div>
  </div>

  <h3>Access Reform &mdash; The Structural Challenge</h3>

  <p>
    The NEM uses "open access" &mdash; any registered generator can connect, with no property right
    to transmission capacity. This creates a tragedy of the commons: each new entrant imposes
    congestion costs on incumbents without bearing those costs.
  </p>

  <div class="two-col">
    <div class="card">
      <h4>Congestion Management Model (CMM)</h4>
      <p>
        Would introduce locational marginal pricing so generators behind a congested line receive a
        lower effective price, creating incentives to locate where the network has capacity.
      </p>
    </div>
    <div class="card">
      <h4>REZ Access Rights</h4>
      <p>
        NSW's REZ framework introduces some elements of managed access &mdash; generators connecting
        within a REZ receive defined access to transmission capacity, providing more certainty.
      </p>
    </div>
  </div>
</div>

<!-- ========== SECTION 5: SOLUTIONS ========== -->
<div class="page content">
  <h2 id="solutions">5. Curtailment Solutions</h2>

  <p>No single solution resolves curtailment. The NEM needs a combination of approaches, each with different timescales, costs, and trade-offs.</p>

  <table>
    <tr><th>Solution</th><th>Deployment Time</th><th>Cost</th><th>Capacity Increase</th><th>Limitations</th></tr>
    <tr>
      <td><strong>New Transmission</strong></td>
      <td>5&ndash;10+ years</td>
      <td>$1&ndash;5B per project</td>
      <td>Hundreds&ndash;thousands MW</td>
      <td>Slow, expensive, community opposition</td>
    </tr>
    <tr>
      <td><strong>Battery Co-location</strong></td>
      <td>1&ndash;2 years</td>
      <td>~$500&ndash;800K/MWh</td>
      <td>2&ndash;4 hour time-shift</td>
      <td>Duration-limited, still network constrained for export</td>
    </tr>
    <tr>
      <td><strong>Dynamic Line Ratings</strong></td>
      <td>Months</td>
      <td>$1&ndash;10M per circuit</td>
      <td>+10&ndash;40% in good conditions</td>
      <td>Weather-dependent, disappears on hot still days</td>
    </tr>
    <tr>
      <td><strong>System Strength Services</strong></td>
      <td>1&ndash;3 years</td>
      <td>$30&ndash;80M per sync condenser</td>
      <td>Relaxes IBR constraints</td>
      <td>Addresses specific curtailment type only</td>
    </tr>
    <tr>
      <td><strong>Virtual Transmission (BESS)</strong></td>
      <td>1&ndash;2 years</td>
      <td>Variable</td>
      <td>Time-shift only (2&ndash;4h)</td>
      <td>Not continuous transfer, efficiency losses</td>
    </tr>
    <tr>
      <td><strong>Demand-Side Response</strong></td>
      <td>Weeks&ndash;months</td>
      <td>Low (software/tariff)</td>
      <td>Shifts demand to match supply</td>
      <td>Consumer behaviour change is slow</td>
    </tr>
  </table>

  <h3>Solution Deep Dives</h3>

  <div class="project-card">
    <h4>🔋 Battery Co-location</h4>
    <p>
      Co-locating BESS with renewable generators allows absorbing excess energy during curtailment
      periods and discharging when the network has capacity or prices are higher.
    </p>
    <div class="two-col">
      <div class="card" style="border-top: 3px solid #38a169;">
        <h4>Pros</h4>
        <ul>
          <li>Much faster than building transmission</li>
          <li>Additional revenue: FCAS, arbitrage</li>
          <li>Reduces congestion without new lines</li>
          <li>Can be sized to typical curtailment periods</li>
        </ul>
      </div>
      <div class="card" style="border-top: 3px solid #e53e3e;">
        <h4>Cons</h4>
        <ul>
          <li>Battery discharge may also be congested</li>
          <li>Round-trip efficiency losses (~10&ndash;15%)</li>
          <li>Doesn't solve fundamental network capacity</li>
          <li>Adds capital cost to the project</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="project-card">
    <h4>🌡️ Dynamic Line Ratings (DLR)</h4>
    <p>
      Real-time monitoring of line conditions (conductor temperature, sag, weather) to calculate
      actual thermal capacity rather than using conservative static ratings.
    </p>
    <div class="highlight-green">
      <strong>Quick win:</strong> Traditional static ratings assume worst-case (hot, still day).
      Actual capacity is often <strong>20&ndash;40% higher</strong>, particularly on cool or windy days.
      DLR releases this latent capacity at low cost and fast deployment.
    </div>
    <p>
      <strong>The catch:</strong> The additional capacity disappears on hot still days &mdash; often
      exactly when it's most needed (peak demand). DLR is a complement to transmission, not a replacement.
    </p>
  </div>

  <div class="project-card">
    <h4>🔧 System Strength Services</h4>
    <p>
      Providing the electrical characteristics (fault current, inertia, voltage support) that
      synchronous generators naturally provide but are lost as they retire.
    </p>
    <div class="three-col">
      <div class="card">
        <h4>Synchronous Condensers</h4>
        <p>Spin without generating real power, providing reactive power, fault current, and inertia. SA has installed 4 units.</p>
      </div>
      <div class="card">
        <h4>Grid-Forming Batteries</h4>
        <p>Operate in "grid-forming" mode, creating their own voltage reference. Emerging technology providing synthetic system strength.</p>
      </div>
      <div class="card">
        <h4>STATCOMs &amp; SVCs</h4>
        <p>Power electronics providing reactive power and voltage support, but not inertia or fault current.</p>
      </div>
    </div>
  </div>

  <div class="project-card">
    <h4>⚙️ Demand-Side Response</h4>
    <p>Shift demand to match supply rather than curtailing supply to match demand:</p>
    <ul>
      <li><strong>Industrial load shifting</strong> &mdash; Smelters, water pumping, electrolysis increase consumption during high renewable output</li>
      <li><strong>EV charging</strong> &mdash; Smart charging absorbs midday solar</li>
      <li><strong>Green hydrogen</strong> &mdash; Electrolysers as flexible loads absorbing excess renewable generation</li>
      <li><strong>Hot water systems</strong> &mdash; Timing water heating to match solar generation</li>
    </ul>
  </div>
</div>

<!-- ========== SECTION 6: CURTAILMENT SCALE ========== -->
<div class="page content">
  <h2 id="scale">6. The Scale of Curtailment Today</h2>

  <div class="highlight-red">
    <strong>The trend is worsening.</strong> NEM-wide renewable curtailment has grown from an estimated
    3&ndash;5% of potential generation in 2021&ndash;22 to approximately 6&ndash;8% in 2023&ndash;24.
    And it's concentrated: some solar farms in congested areas face curtailment rates of 15&ndash;20%+.
  </div>

  <h3>Curtailment by Region</h3>

  <table>
    <tr><th>Region</th><th>Estimated Curtailment</th><th>Primary Cause</th><th>Outlook</th></tr>
    <tr>
      <td><strong>South Australia</strong></td>
      <td>Highest: solar &gt;15&ndash;20% in some quarters</td>
      <td>High VRE penetration (&gt;100% of demand), limited Heywood export capacity</td>
      <td>EnergyConnect will partially relieve export constraints</td>
    </tr>
    <tr>
      <td><strong>Western Victoria</strong></td>
      <td>5&ndash;10% for affected generators</td>
      <td>220kV network congestion in Western VIC REZ area</td>
      <td>VNI West needed but years away</td>
    </tr>
    <tr>
      <td><strong>SW NSW</strong></td>
      <td>10&ndash;15%+ during midday solar peaks</td>
      <td>330kV lines from Darlington Point to Sydney congested</td>
      <td>EnergyConnect + HumeLink will help; both still in construction</td>
    </tr>
    <tr>
      <td><strong>Queensland</strong></td>
      <td>Growing, particularly north QLD</td>
      <td>QNI transfer limits; 275kV backbone congestion</td>
      <td>QNI upgrades needed</td>
    </tr>
    <tr>
      <td><strong>Tasmania</strong></td>
      <td>Lowest</td>
      <td>Hydro is dispatchable; Basslink provides export</td>
      <td>MarinusLink would increase export capability</td>
    </tr>
  </table>

  <h3>Solar vs Wind</h3>

  <div class="two-col">
    <div class="card" style="border-top: 3px solid #ecc94b;">
      <h4>☀️ Solar &mdash; More Curtailed</h4>
      <ul>
        <li>Output concentrated in a few midday hours</li>
        <li>Creates acute congestion spikes</li>
        <li>Solar farms cluster in same high-irradiance areas</li>
        <li>Coincident output = maximum congestion</li>
      </ul>
    </div>
    <div class="card" style="border-top: 3px solid #48bb78;">
      <h4>💨 Wind &mdash; Less Curtailed</h4>
      <ul>
        <li>Output more distributed across time periods</li>
        <li>Less geographic clustering than solar</li>
        <li>Generates at night when congestion is lower</li>
        <li>Still affected in high-wind corridors</li>
      </ul>
    </div>
  </div>

  <h3>Why Curtailment Is Getting Worse</h3>

  <div class="steps">
    <div class="step">
      <strong>More renewable capacity connecting</strong> &mdash; The NEM pipeline has 16+ GW of
      committed or probable VRE projects, adding generation faster than transmission can keep up.
    </div>
    <div class="step">
      <strong>Transmission lagging generation</strong> &mdash; Major projects (HumeLink, EnergyConnect,
      VNI West) are delayed while solar farms continue to connect.
    </div>
    <div class="step">
      <strong>Increasing negative prices</strong> &mdash; SA has experienced negative prices for
      approximately 15&ndash;20% of trading intervals, driving economic curtailment.
    </div>
    <div class="step">
      <strong>System strength constraints tightening</strong> &mdash; As synchronous generators retire,
      more hours are affected by system strength constraints on IBR output.
    </div>
    <div class="step">
      <strong>MLF degradation accelerating</strong> &mdash; Generators in congested areas face declining
      MLFs year-on-year, compounding the revenue impact.
    </div>
  </div>

  <h3>Positive Developments</h3>

  <div class="highlight-green">
    <strong>It's not all bad news:</strong>
    <ul>
      <li>EnergyConnect nearing completion &mdash; will partially relieve SA export constraints</li>
      <li>Battery deployments absorbing some curtailed energy</li>
      <li>Dynamic line ratings releasing additional capacity on key circuits</li>
      <li>AEMO's system strength framework driving investment in synchronous condensers</li>
      <li>Grid-forming battery technology maturing rapidly</li>
      <li>REZ framework in NSW providing coordinated planning</li>
    </ul>
  </div>
</div>

<!-- ========== SECTION 7: KEY TAKEAWAYS ========== -->
<div class="page content">
  <h2 id="takeaways">7. Key Takeaways</h2>

  <div class="three-col">
    <div class="card" style="border-top: 3px solid #3182ce;">
      <h4>🔌 Transmission Is the Enabler</h4>
      <p>
        Without adequate transmission, renewable energy gets built but can't reach demand.
        The energy transition is as much about wires as it is about panels and turbines.
      </p>
    </div>
    <div class="card" style="border-top: 3px solid #d69e2e;">
      <h4>⚠️ Timing Mismatch</h4>
      <p>
        Solar farms take 1&ndash;2 years to build. Major transmission takes 5&ndash;10+ years.
        This fundamental timing mismatch means congestion will worsen before it improves.
      </p>
    </div>
    <div class="card" style="border-top: 3px solid #38a169;">
      <h4>📍 Location Matters Enormously</h4>
      <p>
        Where you connect determines your MLF, congestion exposure, system strength costs,
        and curtailment risk. The cheapest land often has the worst network access.
      </p>
    </div>
  </div>

  <div class="three-col">
    <div class="card" style="border-top: 3px solid #e53e3e;">
      <h4>📉 Curtailment Is Growing</h4>
      <p>
        From ~3&ndash;5% to ~6&ndash;8% NEM-wide, with hotspots at 15&ndash;20%+. Solar is far
        more curtailed than wind due to coincident midday output patterns.
      </p>
    </div>
    <div class="card" style="border-top: 3px solid #805ad5;">
      <h4>🧩 No Silver Bullet</h4>
      <p>
        The solution is a portfolio: new transmission, batteries, dynamic ratings, system strength
        services, demand response, and market reform. Each addresses different aspects.
      </p>
    </div>
    <div class="card" style="border-top: 3px solid #319795;">
      <h4>🏗️ REZs Are the Future</h4>
      <p>
        Coordinated planning through REZs (build transmission first, then generators) is replacing
        the reactive "connect and hope" approach. But the transition takes time.
      </p>
    </div>
  </div>

  <div class="highlight" style="margin-top: 1.5rem;">
    <strong>For developers and investors:</strong> Understanding transmission constraints, MLF risk,
    curtailment exposure, and the connection process is now as important as understanding wind/solar
    resource assessment. The best renewable resource means nothing if the energy can't reach market.
  </div>

  <h3>Further Reading</h3>

  <table>
    <tr><th>Source</th><th>What It Covers</th></tr>
    <tr><td>AEMO Integrated System Plan (ISP)</td><td>20-year transmission development roadmap, REZ identification, optimal development path</td></tr>
    <tr><td>AEMO Quarterly Energy Dynamics (QED)</td><td>Latest curtailment statistics, price trends, interconnector flows</td></tr>
    <tr><td>AEMO Electricity Statement of Opportunities (ESOO)</td><td>Forward-looking reliability and curtailment projections</td></tr>
    <tr><td>TransGrid project pages</td><td>HumeLink, EnergyConnect status and timelines</td></tr>
    <tr><td>EnergyCo NSW</td><td>REZ access scheme frameworks, community engagement</td></tr>
    <tr><td>OpenNEM (opennem.org.au)</td><td>Real-time generation, curtailment, and price data</td></tr>
    <tr><td>RenewEconomy / WattClarity</td><td>Industry analysis and commentary</td></tr>
    <tr><td>Clean Energy Council</td><td>Industry statistics, project pipeline data</td></tr>
  </table>

  <div class="footer">
    <p>GridRival &mdash; Transmission Education Piece</p>
    <p>Data sourced from AEMO, TransGrid, EnergyCo, and industry publications. Project timelines and statistics should be verified against the latest published data.</p>
  </div>
</div>

</body>
</html>`;
}
