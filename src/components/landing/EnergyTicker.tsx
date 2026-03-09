import { TICKER_HEADLINES } from '../../data/landingContent';

export default function EnergyTicker() {
  const sentimentDot = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-400';
      case 'negative': return 'bg-red-400';
      default: return 'bg-amber-400';
    }
  };

  // Double the headlines for seamless loop
  const headlines = [...TICKER_HEADLINES, ...TICKER_HEADLINES];

  return (
    <div className="fixed top-0 left-0 right-0 z-10 overflow-hidden bg-navy-950/85 backdrop-blur-sm border-b border-white/5">
      <div
        className="whitespace-nowrap py-2.5 ticker-scroll"
        style={{ display: 'inline-block' }}
      >
        {headlines.map((h, i) => (
          <span key={i} className="inline-flex items-center mx-6">
            <span className={`w-1.5 h-1.5 rounded-full ${sentimentDot(h.sentiment)} mr-2 flex-shrink-0`} />
            <span className="text-xs font-mono text-navy-300 tracking-wide uppercase">
              {h.text}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
