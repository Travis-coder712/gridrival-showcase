export default function GameGuide() {
  return (
    <div className="min-h-screen bg-navy-950 text-white print:bg-white print:text-black">
      {/* Print button - hidden when printing */}
      <div className="no-print sticky top-0 z-10 bg-navy-900/90 backdrop-blur-sm border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <a href="/" className="text-electric-400 hover:text-electric-300 text-sm font-medium">
          ← Back to Game
        </a>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-electric-500 hover:bg-electric-400 text-white text-sm font-medium rounded-lg transition-all"
        >
          Print / Save as PDF
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 print:py-4 print:px-2">
        {/* Title */}
        <div className="text-center mb-10 print:mb-6">
          <div className="text-4xl mb-2 print:text-2xl">⚡</div>
          <h1 className="text-3xl md:text-4xl font-bold print:text-2xl">
            GridRival
          </h1>
          <p className="text-navy-300 print:text-gray-600 mt-2 text-lg print:text-sm">
            Quick Reference Guide
          </p>
        </div>

        {/* Overview */}
        <Section title="Overview">
          <p>
            You and your team own a portfolio of power generation assets in Australia's
            National Electricity Market (NEM). Each round, you submit price bids for your
            assets. The game engine dispatches the cheapest generation first (merit order)
            to meet demand. All dispatched generators receive the same clearing price.
            Your profit depends on the difference between the clearing price and your costs.
          </p>
        </Section>

        {/* Asset Types */}
        <Section title="Asset Types">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/20 print:border-gray-300">
                  <th className="text-left py-2 pr-4">Type</th>
                  <th className="text-left py-2 pr-4">Icon</th>
                  <th className="text-right py-2 pr-4">Capacity</th>
                  <th className="text-right py-2 pr-4">Marginal Cost ($/MWh)</th>
                  <th className="text-left py-2">Characteristics</th>
                </tr>
              </thead>
              <tbody>
                <AssetRow icon="🏭" type="Coal" capacity="800 MW" srmc="$25–45" desc="Baseload. Low cost, slow to ramp. Runs 24/7." />
                <AssetRow icon="🔥" type="Gas CCGT" capacity="350 MW" srmc="$65–85" desc="Mid-merit. Flexible, moderate cost." />
                <AssetRow icon="⚡" type="Gas Peaker" capacity="150 MW" srmc="$120–160" desc="Peak only. Very fast start, expensive." />
                <AssetRow icon="💧" type="Hydro" capacity="250 MW" srmc="$8" desc="Flexible, cheap, limited water. Can only dispatch in ONE period per round." />
                <AssetRow icon="🌬️" type="Wind" capacity="300 MW" srmc="$0" desc="Zero fuel cost. Auto-bid at $0. Output varies by wind profile." />
                <AssetRow icon="☀️" type="Solar" capacity="200 MW" srmc="$0" desc="Zero fuel cost. Auto-bid at $0. Daytime only, zero overnight." />
                <AssetRow icon="🔋" type="Battery" capacity="500 MW / 3,000 MWh" srmc="$0" desc="Charge cheap, discharge expensive. 92% round-trip efficiency. 6-hour duration. Target SOC controls." />
              </tbody>
            </table>
          </div>
        </Section>

        {/* How Bidding Works */}
        <Section title="How Bidding Works">
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Each round has <strong>time periods</strong> (Overnight, Morning, Afternoon, Evening)</li>
            <li>For each asset + period, submit a <strong>price bid</strong> ($/MWh) and <strong>quantity</strong> (MW)</li>
            <li>You can split bids into <strong>multiple bands</strong> (e.g., 200 MW at $30, 300 MW at $80)</li>
            <li>Bids can range from <strong>-$1,000</strong> to <strong>$20,000</strong> per MWh</li>
            <li>Wind and solar bids are limited by weather-dependent capacity factors</li>
            <li>Asset types bid differently: renewables <strong>auto-bid at $0</strong>, hydro picks <strong>one dispatch period</strong>, batteries toggle <strong>charge/idle/discharge</strong> with target SOC</li>
          </ol>
        </Section>

        {/* Bidding Process Walkthrough */}
        <Section title="Bidding Process Walkthrough">
          <p className="mb-4">Follow these steps each round. The bidding screen guides you through each asset type.</p>

          {/* Step 1: Review Your Assets */}
          <WalkthroughStep
            number={1}
            title="Review Your Assets"
            description="Start by checking what assets you have and their costs."
          >
            <div className="flex flex-col gap-2">
              {/* Mock asset cards */}
              <div className="flex gap-2 flex-wrap">
                <MockAssetCard icon="🏭" name="Coal" capacity="800 MW" srmc="$35" srmcColor="bg-blue-500/20 text-blue-300 print:bg-blue-100 print:text-blue-700" />
                <MockAssetCard icon="🔥" name="Gas CCGT" capacity="350 MW" srmc="$75" srmcColor="bg-amber-500/20 text-amber-300 print:bg-amber-100 print:text-amber-700" />
                <MockAssetCard icon="⚡" name="Peaker" capacity="150 MW" srmc="$145" srmcColor="bg-red-500/20 text-red-300 print:bg-red-100 print:text-red-700" />
              </div>
              <div className="flex gap-3 mt-1 text-xs text-navy-400 print:text-gray-500">
                <span>① Check each asset's <strong className="text-navy-200 print:text-gray-700">capacity</strong> (MW available)</span>
                <span>② Note the <strong className="text-navy-200 print:text-gray-700">Marginal Cost badge</strong> — your break-even price</span>
              </div>
            </div>
          </WalkthroughStep>

          {/* Step 2: Check Demand */}
          <WalkthroughStep
            number={2}
            title="Check Demand Each Period"
            description="Higher demand % = tighter market = likely higher prices."
          >
            <div className="flex gap-2 flex-wrap">
              <MockPeriodDemand icon="🌙" period="Overnight" demand="1,200 MW" pct="45%" tight={false} />
              <MockPeriodDemand icon="🌅" period="Morning" demand="2,100 MW" pct="68%" tight={false} />
              <MockPeriodDemand icon="☀️" period="Afternoon" demand="2,600 MW" pct="85%" tight={true} />
              <MockPeriodDemand icon="🌆" period="Evening" demand="2,900 MW" pct="95%" tight={true} />
            </div>
            <div className="flex gap-3 mt-2 text-xs text-navy-400 print:text-gray-500">
              <span>① Demand MW shown per period</span>
              <span>② <strong className="text-navy-200 print:text-gray-700">% of fleet</strong> tells you how tight supply is</span>
              <span>③ {">"} 80% = prices likely to be high</span>
            </div>
          </WalkthroughStep>

          {/* Step 3: Renewables (auto-bid) */}
          <WalkthroughStep
            number={3}
            title="Renewables — No Action Needed"
            description="Wind and solar auto-bid at $0. Just check your available output."
          >
            <div className="flex gap-2 flex-wrap">
              <div className="bg-navy-800/50 print:bg-green-50 border border-green-500/20 print:border-green-200 rounded-lg p-2.5 flex-1 min-w-[140px]">
                <div className="flex items-center gap-1.5 mb-1">
                  <span>🌬️</span>
                  <span className="font-semibold text-xs text-white print:text-black">Wind Farm</span>
                  <span className="text-[10px] bg-green-500/20 text-green-300 print:bg-green-100 print:text-green-700 px-1.5 rounded">$0/MWh</span>
                </div>
                <div className="text-xs text-navy-300 print:text-gray-600">
                  <div>🌙 85 MW <span className="text-navy-500 print:text-gray-400">(28%)</span></div>
                  <div>🌅 120 MW <span className="text-navy-500 print:text-gray-400">(40%)</span></div>
                  <div>☀️ 90 MW <span className="text-navy-500 print:text-gray-400">(30%)</span></div>
                  <div>🌆 105 MW <span className="text-navy-500 print:text-gray-400">(35%)</span></div>
                </div>
              </div>
              <div className="bg-navy-800/50 print:bg-yellow-50 border border-yellow-500/20 print:border-yellow-200 rounded-lg p-2.5 flex-1 min-w-[140px]">
                <div className="flex items-center gap-1.5 mb-1">
                  <span>☀️</span>
                  <span className="font-semibold text-xs text-white print:text-black">Solar Farm</span>
                  <span className="text-[10px] bg-green-500/20 text-green-300 print:bg-green-100 print:text-green-700 px-1.5 rounded">$0/MWh</span>
                </div>
                <div className="text-xs text-navy-300 print:text-gray-600">
                  <div>🌙 0 MW <span className="text-navy-500 print:text-gray-400">(0%)</span></div>
                  <div>🌅 120 MW <span className="text-navy-500 print:text-gray-400">(60%)</span></div>
                  <div>☀️ 160 MW <span className="text-navy-500 print:text-gray-400">(80%)</span></div>
                  <div>🌆 20 MW <span className="text-navy-500 print:text-gray-400">(10%)</span></div>
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-navy-400 print:text-gray-500">
              ① Availability changes each period — <strong className="text-navy-200 print:text-gray-700">solar is zero overnight</strong>, wind varies.
              No bids to set — these dispatch automatically.
            </div>
          </WalkthroughStep>

          {/* Step 4: Thermal Bidding */}
          <WalkthroughStep
            number={4}
            title="Bid Your Thermal Assets"
            description="Set price & MW for coal and gas. Use auto-fill strategies or set manually."
          >
            <div className="bg-navy-800/50 print:bg-gray-50 border border-white/10 print:border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span>🏭</span>
                <span className="font-semibold text-xs text-white print:text-black">Coal — Afternoon</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 print:bg-blue-100 print:text-blue-700 px-1.5 rounded">SRMC: $35</span>
              </div>
              {/* Mock bid table */}
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-navy-400 print:text-gray-500 border-b border-white/10 print:border-gray-200">
                    <th className="text-left py-1 pr-2">Band</th>
                    <th className="text-right py-1 pr-2">Price $/MWh</th>
                    <th className="text-right py-1 pr-2">MW</th>
                    <th className="text-right py-1">% Cap</th>
                  </tr>
                </thead>
                <tbody className="text-navy-200 print:text-gray-700">
                  <tr className="border-b border-white/5 print:border-gray-100">
                    <td className="py-1 pr-2">1</td>
                    <td className="py-1 pr-2 text-right font-mono">$0</td>
                    <td className="py-1 pr-2 text-right font-mono">400</td>
                    <td className="py-1 text-right">50%</td>
                  </tr>
                  <tr className="border-b border-white/5 print:border-gray-100">
                    <td className="py-1 pr-2">2</td>
                    <td className="py-1 pr-2 text-right font-mono">$35</td>
                    <td className="py-1 pr-2 text-right font-mono">200</td>
                    <td className="py-1 text-right">25%</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-2">3</td>
                    <td className="py-1 pr-2 text-right font-mono">$120</td>
                    <td className="py-1 pr-2 text-right font-mono">200</td>
                    <td className="py-1 text-right">25%</td>
                  </tr>
                </tbody>
              </table>
              {/* Mock strategy buttons */}
              <div className="flex gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] px-2 py-0.5 rounded bg-electric-500/20 text-electric-300 print:bg-blue-100 print:text-blue-700 border border-electric-500/30 print:border-blue-200">Price Taker</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-navy-700/50 text-navy-300 print:bg-gray-100 print:text-gray-600 border border-white/10 print:border-gray-200">SRMC</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-navy-700/50 text-navy-300 print:bg-gray-100 print:text-gray-600 border border-white/10 print:border-gray-200">Split</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-navy-700/50 text-navy-300 print:bg-gray-100 print:text-gray-600 border border-white/10 print:border-gray-200">Aggressive</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 mt-2 text-xs text-navy-400 print:text-gray-500">
              <span>① Set <strong className="text-navy-200 print:text-gray-700">price per MWh</strong> and <strong className="text-navy-200 print:text-gray-700">MW to offer</strong> in each band</span>
              <span>② Use <strong className="text-navy-200 print:text-gray-700">auto-fill strategies</strong> to quickly apply a bidding approach</span>
              <span>③ Band 1 cheap = guaranteed dispatch. Higher bands = price-setting potential</span>
            </div>
          </WalkthroughStep>

          {/* Step 5: Hydro */}
          <WalkthroughStep
            number={5}
            title="Hydro — Pick Your Period"
            description="Limited water means you can only dispatch in ONE period. Choose the highest-price period."
          >
            <div className="bg-navy-800/50 print:bg-gray-50 border border-white/10 print:border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span>💧</span>
                <span className="font-semibold text-xs text-white print:text-black">Hydro — 250 MW / 1,000 MWh water</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {(['🌙 Overnight', '🌅 Morning', '☀️ Afternoon', '🌆 Evening'] as const).map((p, i) => (
                  <div key={i} className={`text-xs px-3 py-1.5 rounded-lg border ${i === 3 ? 'bg-electric-500/20 border-electric-500/40 text-electric-300 print:bg-blue-100 print:border-blue-300 print:text-blue-700 font-semibold' : 'bg-navy-700/30 border-white/10 text-navy-400 print:bg-gray-100 print:border-gray-200 print:text-gray-500'}`}>
                    {p} {i === 3 && '← SELECTED'}
                  </div>
                ))}
              </div>
              <div className="text-xs text-navy-400 print:text-gray-500 mt-2">Set bid price: <span className="font-mono text-navy-200 print:text-gray-700">$85/MWh</span></div>
            </div>
            <div className="mt-2 text-xs text-navy-400 print:text-gray-500">
              ① Select the period with highest expected prices (usually <strong className="text-navy-200 print:text-gray-700">Evening</strong>).
              ② Set your bid price above your $8 SRMC but below expected clearing price.
            </div>
          </WalkthroughStep>

          {/* Step 6: Battery Controls */}
          <WalkthroughStep
            number={6}
            title="Battery — Charge, Idle, or Discharge"
            description="Toggle mode each period. Charge when cheap, discharge when expensive."
          >
            <div className="bg-navy-800/50 print:bg-gray-50 border border-white/10 print:border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span>🔋</span>
                <span className="font-semibold text-xs text-white print:text-black">Battery — 500 MW / 3,000 MWh</span>
                <span className="text-[10px] bg-green-500/20 text-green-300 print:bg-green-100 print:text-green-700 px-1.5 rounded">SOC: 50%</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <MockBatteryPeriod icon="🌙" period="Overnight" mode="charge" soc="→ 80%" />
                <MockBatteryPeriod icon="🌅" period="Morning" mode="charge" soc="→ 100%" />
                <MockBatteryPeriod icon="☀️" period="Afternoon" mode="idle" soc="100%" />
                <MockBatteryPeriod icon="🌆" period="Evening" mode="discharge" soc="→ 40%" />
              </div>
              {/* SOC target buttons */}
              <div className="flex gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] px-2 py-0.5 rounded bg-navy-700/50 text-navy-300 print:bg-gray-100 print:text-gray-600 border border-white/10 print:border-gray-200">25%</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-navy-700/50 text-navy-300 print:bg-gray-100 print:text-gray-600 border border-white/10 print:border-gray-200">50%</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-navy-700/50 text-navy-300 print:bg-gray-100 print:text-gray-600 border border-white/10 print:border-gray-200">75%</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-electric-500/20 text-electric-300 print:bg-blue-100 print:text-blue-700 border border-electric-500/30 print:border-blue-200">100%</span>
                <span className="text-[10px] text-navy-500 print:text-gray-400 ml-1">← Target SOC buttons</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 mt-2 text-xs text-navy-400 print:text-gray-500">
              <span>① <strong className="text-green-300 print:text-green-700">Charge</strong> during low/negative price periods (Overnight, solar surplus)</span>
              <span>② <strong className="text-red-300 print:text-red-700">Discharge</strong> during high-price periods (Evening peak)</span>
              <span>③ Watch your <strong className="text-navy-200 print:text-gray-700">SOC bar</strong> — can't discharge below 0% or charge above 100%</span>
            </div>
          </WalkthroughStep>

          {/* Step 7: Review & Submit */}
          <WalkthroughStep
            number={7}
            title="Review & Submit"
            description="Check the bid review summary for warnings before confirming."
          >
            <div className="bg-navy-800/50 print:bg-gray-50 border border-white/10 print:border-gray-200 rounded-lg p-3">
              <div className="text-xs font-semibold text-white print:text-black mb-2">Bid Review Summary</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-400 print:text-green-600">✓</span>
                  <span className="text-navy-300 print:text-gray-600">Coal — 800 MW across 3 bands</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-400 print:text-green-600">✓</span>
                  <span className="text-navy-300 print:text-gray-600">Gas CCGT — 350 MW, $75 SRMC bid</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-amber-400 print:text-amber-600">⚠</span>
                  <span className="text-navy-300 print:text-gray-600">Peaker — 60% bid below marginal cost</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-400 print:text-green-600">✓</span>
                  <span className="text-navy-300 print:text-gray-600">Battery — Charge overnight, discharge evening</span>
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <span className="text-[10px] px-4 py-1.5 rounded-lg bg-electric-500 text-white print:bg-blue-600 font-semibold">Submit Bids</span>
                <span className="text-[10px] px-3 py-1.5 rounded-lg bg-navy-700 text-navy-300 print:bg-gray-200 print:text-gray-600">Edit</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-navy-400 print:text-gray-500">
              ① Check for <strong className="text-amber-300 print:text-amber-700">⚠ warnings</strong> — bidding below SRMC means potential losses.
              ② Hit <strong className="text-navy-200 print:text-gray-700">Submit</strong> before the timer expires!
            </div>
          </WalkthroughStep>
        </Section>

        {/* Merit Order Dispatch */}
        <Section title="Merit Order Dispatch">
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>All bids from all teams are sorted <strong>lowest to highest price</strong></li>
            <li>AEMO dispatches the cheapest bids first until demand is met</li>
            <li>The <strong>last (most expensive) bid dispatched</strong> sets the <strong>clearing price</strong></li>
            <li><strong>ALL</strong> dispatched generators receive the clearing price — even if they bid lower</li>
            <li>Generators not dispatched earn nothing (but avoid fuel costs)</li>
            <li>When multiple teams bid the <strong>same price</strong> at the margin, dispatch is split <strong>pro-rata</strong> (proportionally by capacity offered) — just like the real AEMO NEMDE</li>
            <li>Renewables (wind, solar) are dispatched <strong>first</strong> at tied prices — matching AEMO's real dispatch priority</li>
          </ol>
          <div className="bg-navy-800/30 print:bg-blue-50 rounded-lg p-3 mt-3 text-xs">
            <strong>Pro-rata example:</strong> If 200 MW of demand remains and three teams all bid $75/MWh offering 300, 200, and 100 MW respectively (600 MW total), each gets dispatched proportionally: 100, 67, and 33 MW.
          </div>
        </Section>

        {/* Profit Calculation */}
        <Section title="Profit Calculation">
          <div className="bg-navy-800/50 print:bg-gray-100 rounded-xl p-4 font-mono text-center text-lg print:text-sm my-4">
            <strong>Profit = (Clearing Price − Marginal Cost) × MW Dispatched × Hours</strong>
          </div>
          <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
            <li>If you bid <strong>below</strong> the clearing price → dispatched, earn profit</li>
            <li>If you bid <strong>above</strong> the clearing price → not dispatched, earn nothing</li>
            <li>If you bid <strong>at</strong> your marginal cost → break even (cover costs exactly)</li>
            <li>If clearing price goes <strong>negative</strong> → dispatched generators lose money!</li>
            <li>If supply exceeds <strong>3× demand</strong> → price crashes to <strong>-$1,000/MWh</strong> (oversupply trigger)</li>
            <li><strong>Battery arbitrage P&L</strong> = discharge revenue − charging cost − efficiency losses</li>
            <li>Batteries <strong>get paid to charge</strong> during negative prices — pure profit!</li>
          </ul>
        </Section>

        {/* Strategies */}
        <Section title="Bidding Strategies">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:gap-2">
            <StrategyCard name="Price Taker" desc="Bid $0 on everything. Guarantees dispatch, accepts whatever clearing price results." />
            <StrategyCard name="Marginal Cost Bidder" desc="Bid at your Short Run Marginal Cost. Rational baseline — covers costs, earns when price is high." />
            <StrategyCard name="Price Maker" desc="Bid high on some capacity to push up the clearing price for all your dispatched units." />
            <StrategyCard name="Portfolio Optimizer" desc="Mix strategies: $0 on renewables, marginal cost on baseload, high on peakers." />
            <StrategyCard name="Capacity Repricing" desc="Reprice 20-30% of capacity to higher bands to tighten effective supply and influence clearing prices." />
            <StrategyCard name="Battery Arbitrage" desc="Charge at low prices, discharge at peak. 6-hour battery. Use target SOC buttons. Battery strategy is independent — combine with thermal strategies." />
          </div>
        </Section>

        {/* Time Periods */}
        <Section title="Time Periods">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:gap-2">
            <PeriodCard icon="🌙" name="Overnight" time="12am–6am" demand="Low" desc="Base load only. Potential negative prices with wind." />
            <PeriodCard icon="🌅" name="Morning" time="6am–12pm" demand="Medium" desc="Demand ramps up. Solar begins generating." />
            <PeriodCard icon="☀️" name="Afternoon" time="12pm–6pm" demand="Medium-High" desc="Solar at peak. Duck curve — prices can drop." />
            <PeriodCard icon="🌆" name="Evening" time="6pm–12am" demand="High" desc="Solar drops off. Peak demand. Highest prices." />
          </div>
        </Section>

        {/* Bidding Guardrails */}
        <Section title="Bidding Guardrails">
          <p className="mb-3">
            The host can toggle <strong>bidding guardrails</strong> on or off when creating a game.
            Guardrails help beginners avoid common mistakes, while experienced players get full freedom.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/20 print:border-gray-300">
                  <th className="text-left py-2 pr-4">Restriction</th>
                  <th className="text-center py-2 pr-4">Guardrails ON</th>
                  <th className="text-center py-2 pr-4">Guardrails OFF</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5 print:border-gray-200">
                  <td className="py-2 pr-4">Non-battery assets must bid &gt; 0 MW in every period</td>
                  <td className="py-2 pr-4 text-center">❌ Blocked</td>
                  <td className="py-2 pr-4 text-center">✅ Allowed (capacity repricing)</td>
                </tr>
                <tr className="border-b border-white/5 print:border-gray-200">
                  <td className="py-2 pr-4">Warning if &gt;60% of capacity bid at $0/MWh</td>
                  <td className="py-2 pr-4 text-center">⚠️ Warning (can dismiss)</td>
                  <td className="py-2 pr-4 text-center">✅ No warning</td>
                </tr>
                <tr className="border-b border-white/5 print:border-gray-200">
                  <td className="py-2 pr-4">Below marginal cost warning</td>
                  <td className="py-2 pr-4 text-center" colSpan={2}>⚠️ Always shown in bid review (non-blocking)</td>
                </tr>
                <tr className="border-b border-white/5 print:border-gray-200">
                  <td className="py-2 pr-4">Price range</td>
                  <td className="py-2 pr-4 text-center" colSpan={2}>-$1,000 to $20,000/MWh (always)</td>
                </tr>
                <tr className="border-b border-white/5 print:border-gray-200">
                  <td className="py-2 pr-4">Quantity range</td>
                  <td className="py-2 pr-4 text-center" colSpan={2}>0 to asset available MW (always)</td>
                </tr>
                <tr className="border-b border-white/5 print:border-gray-200">
                  <td className="py-2 pr-4">Batteries can bid 0 MW (sit idle)</td>
                  <td className="py-2 pr-4 text-center" colSpan={2}>✅ Always allowed</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-navy-400 print:text-gray-500">
            💡 Tip: With guardrails off, experienced players can use capacity repricing — rebidding capacity to higher price bands to tighten effective supply and influence the clearing price.
          </p>
        </Section>

        {/* Game Modes */}
        <Section title="Game Modes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:gap-2">
            <StrategyCard name="🎯 First Run JD Remix (9 rounds, 45-60 min)" desc="Lean portfolio (4 assets) with battery arbitrage challenge. Best starting point for groups new to the NEM. Progressive unlock with teaching notes." />
            <StrategyCard name="🎓 Beginner Intro (1 round, 10-15 min)" desc="One guided round with 2 assets (coal + gas). Perfect for quick demos." />
            <StrategyCard name="📈 Progressive Learning (10 rounds, 90-120 min)" desc="Builds complexity gradually: 1 asset → full portfolio over 10 rounds. Best for 2-hour sessions." />
            <StrategyCard name="⚡ Quick Game (8 rounds, 60-90 min)" desc="Compressed version covering all key concepts. Great for time-limited workshops." />
            <StrategyCard name="🏆 Full Game (15 rounds, 2.5-3.5 hours)" desc="Complete learning journey from coal basics to full NEM simulation with all scenarios." />
            <StrategyCard name="🔄 Experienced Replay (4 rounds, 30-45 min)" desc="One round per season with full portfolio. For participants who want to try different strategies." />
          </div>
        </Section>

        {/* Tips & Features */}
        <Section title="Tips & Features">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 print:gap-2">
            <RefCard label="🔊 Sound Effects" value="Countdown beeps, bid chimes, results fanfare. Mute with 🔊 button." />
            <RefCard label="🌙 Dark Mode" value="Toggle with 🌙 button for dimly-lit rooms." />
            <RefCard label="📋 Quick Recap" value="See last round profit & prices at the start of each new round." />
            <RefCard label="🎯 Bid Presets" value="One-click strategies: Price Taker, Cost Recovery, Split, Aggressive." />
            <RefCard label="📈 Price History" value="Track clearing price trends across all rounds." />
            <RefCard label="👁️ Spectator Mode" value="Observers can watch at /spectate without taking a team slot." />
          </div>
        </Section>

        {/* Quick Reference */}
        <Section title="Quick Reference">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <RefCard label="Price Cap" value="$20,000/MWh" />
            <RefCard label="Price Floor" value="-$1,000/MWh" />
            <RefCard label="Dispatch Interval" value="5 minutes (real NEM)" />
            <RefCard label="NEM Regions" value="QLD, NSW, VIC, SA, TAS" />
            <RefCard label="Marginal Cost Badge Colors" value="Green=$0, Blue=<$50, Amber=<$100, Red=$100+" />
            <RefCard label="Game Periods" value="4 per round (after Round 1)" />
          </div>
        </Section>

        {/* Footer */}
        <div className="text-center mt-10 pt-6 border-t border-white/10 print:border-gray-300">
          <p className="text-navy-400 print:text-gray-500 text-xs">
            GridRival — Bid. Dispatch. DOMINATE. — Every Megawatt has its price. — 6 game modes, 7 asset types, 6 bidding strategies, sound effects, dark mode, spectator mode & more
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper components
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 print:mb-5">
      <h2 className="text-xl font-bold text-electric-400 print:text-blue-700 mb-3 print:text-lg border-b border-white/10 print:border-gray-300 pb-2">
        {title}
      </h2>
      <div className="text-navy-200 print:text-gray-800 text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function AssetRow({ icon, type, capacity, srmc, desc }: { icon: string; type: string; capacity: string; srmc: string; desc: string }) {
  return (
    <tr className="border-b border-white/5 print:border-gray-200">
      <td className="py-2 pr-4 font-medium">{type}</td>
      <td className="py-2 pr-4">{icon}</td>
      <td className="py-2 pr-4 text-right font-mono">{capacity}</td>
      <td className="py-2 pr-4 text-right font-mono">{srmc}</td>
      <td className="py-2 text-navy-300 print:text-gray-600">{desc}</td>
    </tr>
  );
}

function StrategyCard({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="bg-navy-800/50 print:bg-gray-50 rounded-lg p-3 print:border print:border-gray-200">
      <div className="font-semibold text-white print:text-black text-sm">{name}</div>
      <div className="text-navy-300 print:text-gray-600 text-xs mt-1">{desc}</div>
    </div>
  );
}

function PeriodCard({ icon, name, time, demand, desc }: { icon: string; name: string; time: string; demand: string; desc: string }) {
  return (
    <div className="bg-navy-800/50 print:bg-gray-50 rounded-lg p-3 text-center print:border print:border-gray-200">
      <div className="text-2xl print:text-xl">{icon}</div>
      <div className="font-semibold text-white print:text-black text-sm">{name}</div>
      <div className="text-navy-400 print:text-gray-500 text-xs">{time}</div>
      <div className="text-electric-400 print:text-blue-600 text-xs font-medium mt-1">Demand: {demand}</div>
      <div className="text-navy-300 print:text-gray-600 text-xs mt-1">{desc}</div>
    </div>
  );
}

function RefCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-navy-800/50 print:bg-gray-50 rounded-lg p-3 print:border print:border-gray-200">
      <div className="text-navy-400 print:text-gray-500 text-xs">{label}</div>
      <div className="font-mono font-bold text-white print:text-black text-sm mt-0.5">{value}</div>
    </div>
  );
}

// ── Bidding Walkthrough Helper Components ──

function WalkthroughStep({ number, title, description, children }: {
  number: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 print:mb-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-electric-500/20 print:bg-blue-100 flex items-center justify-center text-electric-400 print:text-blue-700 text-xs font-bold border border-electric-500/30 print:border-blue-300">
          {number}
        </span>
        <h3 className="font-semibold text-white print:text-black text-sm">{title}</h3>
      </div>
      <p className="text-xs text-navy-400 print:text-gray-500 mb-2 ml-8">{description}</p>
      <div className="ml-8">
        {children}
      </div>
    </div>
  );
}

function MockAssetCard({ icon, name, capacity, srmc, srmcColor }: {
  icon: string;
  name: string;
  capacity: string;
  srmc: string;
  srmcColor: string;
}) {
  return (
    <div className="bg-navy-800/50 print:bg-gray-50 border border-white/10 print:border-gray-200 rounded-lg p-2 flex items-center gap-2 min-w-[120px]">
      <span className="text-lg">{icon}</span>
      <div>
        <div className="font-semibold text-xs text-white print:text-black">{name}</div>
        <div className="text-[10px] text-navy-400 print:text-gray-500">{capacity}</div>
      </div>
      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ml-auto ${srmcColor}`}>{srmc}</span>
    </div>
  );
}

function MockPeriodDemand({ icon, period, demand, pct, tight }: {
  icon: string;
  period: string;
  demand: string;
  pct: string;
  tight: boolean;
}) {
  return (
    <div className={`bg-navy-800/50 print:bg-gray-50 border rounded-lg p-2 text-center min-w-[80px] flex-1 ${tight ? 'border-red-500/30 print:border-red-200' : 'border-white/10 print:border-gray-200'}`}>
      <div className="text-lg">{icon}</div>
      <div className="text-[10px] text-navy-400 print:text-gray-500">{period}</div>
      <div className="font-mono font-bold text-xs text-white print:text-black">{demand}</div>
      <div className={`text-[10px] font-semibold ${tight ? 'text-red-400 print:text-red-600' : 'text-navy-400 print:text-gray-500'}`}>{pct}</div>
    </div>
  );
}

function MockBatteryPeriod({ icon, period, mode, soc }: {
  icon: string;
  period: string;
  mode: 'charge' | 'idle' | 'discharge';
  soc: string;
}) {
  const modeStyles = {
    charge: 'bg-green-500/20 text-green-300 border-green-500/30 print:bg-green-100 print:text-green-700 print:border-green-200',
    idle: 'bg-navy-700/30 text-navy-400 border-white/10 print:bg-gray-100 print:text-gray-500 print:border-gray-200',
    discharge: 'bg-red-500/20 text-red-300 border-red-500/30 print:bg-red-100 print:text-red-700 print:border-red-200',
  };
  const modeLabels = { charge: '⬇ CHARGE', idle: '— IDLE', discharge: '⬆ DISCHARGE' };

  return (
    <div className={`border rounded-lg p-2 text-center min-w-[80px] flex-1 ${modeStyles[mode]}`}>
      <div className="text-xs">{icon} {period}</div>
      <div className="text-[10px] font-bold mt-0.5">{modeLabels[mode]}</div>
      <div className="text-[10px] font-mono mt-0.5">{soc}</div>
    </div>
  );
}
