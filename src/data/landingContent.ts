// Static content for the cinematic landing page

export interface LandingSlide {
  heading: string;
  body: string;
  imageUrl?: string;
  icon: string;
}

export interface TickerHeadline {
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

// Bloomberg-style scrolling ticker headlines
export const TICKER_HEADLINES: TickerHeadline[] = [
  { text: 'AGL announces 2GW battery storage pipeline across eastern states', sentiment: 'positive' },
  { text: 'NEM clearing price hits $15,500/MWh during summer heatwave event', sentiment: 'negative' },
  { text: 'Wind generation reaches record 64% of South Australia demand overnight', sentiment: 'positive' },
  { text: 'Liddell coal station closes after 52 years of continuous operation', sentiment: 'neutral' },
  { text: 'Snowy 2.0 pumped hydro commissioning progresses on schedule', sentiment: 'positive' },
  { text: 'Negative prices recorded for 6 consecutive hours in Queensland', sentiment: 'negative' },
  { text: 'AEMO warns of summer reliability gaps in Victoria and New South Wales', sentiment: 'negative' },
  { text: 'Battery revenue surges 340% on increased NEM price volatility', sentiment: 'positive' },
  { text: 'Rooftop solar passes 20GW installed capacity milestone nationally', sentiment: 'positive' },
  { text: 'Gas peaker profits squeezed as renewables undercut mid-merit generation', sentiment: 'neutral' },
  { text: 'Origin Energy accelerates exit from coal generation portfolio', sentiment: 'neutral' },
  { text: 'Transmission investment critical for Renewable Energy Zones development', sentiment: 'positive' },
  { text: 'FCAS market reform opens new revenue streams for battery operators', sentiment: 'positive' },
  { text: 'Duck curve deepens as midday solar pushes wholesale prices below zero', sentiment: 'neutral' },
  { text: 'Interconnector upgrade boosts cross-border electricity trading capacity', sentiment: 'positive' },
];

// Unsplash background photos (free hotlinking for open source/educational)
export const ENERGY_PHOTOS = [
  { url: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=1920&q=80', alt: 'Wind turbines at sunset' },
  { url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1920&q=80', alt: 'Solar panel array' },
  { url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1920&q=80', alt: 'Power transmission lines' },
  { url: 'https://images.unsplash.com/photo-1548337138-e87d889cc369?w=1920&q=80', alt: 'Wind farm aerial view' },
  { url: 'https://images.unsplash.com/photo-1595437193398-f24279553f4f?w=1920&q=80', alt: 'Battery energy storage' },
  { url: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1920&q=80', alt: 'Coal power station at dusk' },
  { url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&q=80', alt: 'Green energy landscape' },
];

// Animated stat counters on landing page
export const LANDING_STATS: StatItem[] = [
  { value: 30, suffix: '+ GW', label: 'Fleet Capacity' },
  { value: 5, suffix: ' Regions', label: 'NEM Network' },
  { value: 7, suffix: ' Types', label: 'Asset Classes' },
];

// Educational slide deck content (pre-game NEM education)
export const EDUCATION_SLIDES: LandingSlide[] = [
  {
    icon: '🇦🇺',
    heading: 'Welcome to the NEM',
    body: "The **National Electricity Market** is one of the world's longest interconnected power systems, spanning **5 regions** across eastern Australia: Queensland, New South Wales, Victoria, South Australia, and Tasmania. It serves over 10 million customers and trades approximately **200 TWh** of electricity annually.",
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80',
  },
  {
    icon: '📊',
    heading: 'How the Market Works',
    body: "Every **5 minutes**, generators submit bids to AEMO (Australian Energy Market Operator) offering to supply electricity at various prices. AEMO dispatches the cheapest generation first to meet demand. The price paid by all generators is set by the **last (most expensive) unit dispatched** \u2014 this is called the **clearing price** or spot price.",
  },
  {
    icon: '📈',
    heading: 'The Merit Order',
    body: "Bids are stacked from lowest to highest price \u2014 this is the **merit order**. Renewables (wind, solar) typically bid at **$0** since their fuel is free. Coal bids around **$25\u201345/MWh**, gas at **$65\u2013160/MWh**. The merit order determines which generators run and which sit idle. Cheaper plants run more often; expensive plants only run when demand is high. When multiple generators bid the **same price** at the margin, dispatch is split **pro-rata** (proportionally by capacity offered).",
  },
  {
    icon: '💰',
    heading: 'Clearing Price & Uniform Pricing',
    body: "The key insight: **ALL dispatched generators receive the same clearing price**, regardless of their bid. If demand requires a gas peaker bidding at $150/MWh, then coal plants that bid $30/MWh also receive $150/MWh. This means **infra-marginal generators** (those below the clearing price) earn significant profits. Your goal: maximise your profit by bidding strategically.",
  },
  {
    icon: '🏭',
    heading: 'Generator Types',
    body: "**Coal** \u2014 Large baseload plants, low cost ($25\u201345), slow to start/stop.\n**Gas CCGT** \u2014 Mid-merit, moderate cost ($65\u201385), flexible.\n**Gas Peaker** \u2014 Fast start, high cost ($120\u2013160), runs only at peak times.\n**Hydro** \u2014 Very flexible, low cost ($8), but limited water supply.\n**Wind & Solar** \u2014 Zero fuel cost, but output depends on weather.\n**Battery** \u2014 500 MW / 2,000 MWh, 92% efficiency. Charge when cheap, discharge when expensive. Earns arbitrage revenue from price spreads. Charging adds to market demand.",
  },
  {
    icon: '💲',
    heading: 'Understanding Costs',
    body: "**Short Run Marginal Cost (SRMC)** is the cost to generate one additional MWh. It includes fuel and variable O&M but NOT capital costs. Bidding at marginal cost covers your costs \u2014 anything above marginal cost is profit. The game shows each asset\u2019s marginal cost with a **coloured badge** so you always know your break-even price.",
  },
  {
    icon: '🔄',
    heading: 'The Energy Transition',
    body: "Australia\u2019s NEM is undergoing a dramatic transformation. Coal plants are **retiring** (Liddell 2023, Eraring planned 2025). **Renewables** now provide over 35% of NEM generation. **Batteries** are emerging as the new flexible capacity. This creates new market dynamics: the **duck curve**, **negative prices**, and increased **volatility** \u2014 all of which you\u2019ll experience in this game.",
    imageUrl: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800&q=80',
  },
  {
    icon: '📉',
    heading: 'Market Dynamics',
    body: "NEM prices swing from **-$1,000/MWh** (negative! generators pay to stay on) to **$20,000/MWh** (the price cap during scarcity). Key dynamics:\n\u2022 **Negative prices** \u2014 when supply exceeds 3\u00d7 demand, prices crash to -$1,000/MWh. Batteries get **paid to charge**!\n\u2022 **Price spikes** \u2014 during heatwaves, plant outages, or low wind\n\u2022 **The duck curve** \u2014 midday solar suppresses prices, evening demand surges\n\u2022 **Volatility** \u2014 creates opportunities for strategic bidders",
  },
  {
    icon: '🎯',
    heading: 'Bidding Strategies',
    body: "**Price Taker** \u2014 Bid $0, guarantee dispatch, accept the clearing price.\n**Marginal Cost Bidder** \u2014 Bid at cost. Rational baseline, covers costs.\n**Price Maker** \u2014 Bid high to push up the clearing price for all your units.\n**Portfolio Optimizer** \u2014 Mix strategies across your different assets.\n**Capacity Repricing** \u2014 Reprice capacity to higher bands to tighten effective supply and influence clearing prices.\n**Battery Arbitrage** \u2014 Charge cheap, discharge expensive. Arbitrage revenue = discharge earnings minus charging cost.",
  },
  {
    icon: '🎮',
    heading: 'How This Game Works',
    body: "You and your team own a **portfolio of power generation assets**. Each round represents a day in the NEM. You submit **price bids** for each asset across multiple time periods (overnight, morning, afternoon, evening). The game engine runs the **merit order dispatch** to determine which generators run and what price everyone receives. Your **profit = (Clearing Price \u2212 Marginal Cost) \u00d7 MW \u00d7 Hours**.",
  },
  {
    icon: '🕹️',
    heading: 'Game Modes',
    body: "**Quick Game (8 rounds, ~60\u201390 min)** \u2014 Fast-paced introduction. Start with coal, progressively add gas, renewables, hydro, and batteries. Perfect for workshops.\n\n**Full Game (15 rounds, ~2.5\u20133.5 hours)** \u2014 Deep dive. Includes seasonal scenarios (heatwaves, droughts, dunkelflaute), carbon pricing, and advanced strategy.\n\n**Experienced Replay (4 rounds, ~30\u201345 min)** \u2014 Full portfolio from the start. One round per season. For teams who\u2019ve played before.",
  },
  {
    icon: '🚀',
    heading: "Let's Play!",
    body: "**Tips for success:**\n\u2022 Watch the **Marginal Cost badges** \u2014 always know your costs\n\u2022 Read the **period descriptions** \u2014 they tell you what\u2019s typically dispatched\n\u2022 Think about what **other teams** will bid \u2014 the clearing price depends on everyone\n\u2022 **Renewables** change everything \u2014 watch for negative price opportunities\n\u2022 **Batteries** are your secret weapon for volatile markets\n\nReady? The host will start the game. Good luck!",
  },
];
