/**
 * Warning modal shown when a team tries to submit bids with 0 MW
 * offered for any thermal/hydro asset in any period.
 *
 * This is an always-on safety check (not gated by biddingGuardrailEnabled)
 * because submitting 0 capacity is almost certainly a mistake and can
 * trigger the $20,000/MWh price cap.
 */

interface MissingBid {
  assetName: string;
  period: string;
}

interface ZeroCapacityWarningModalProps {
  missingBids: MissingBid[];
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ZeroCapacityWarningModal({
  missingBids,
  onConfirm,
  onCancel,
}: ZeroCapacityWarningModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-navy-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Warning header */}
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-4 flex items-center gap-3">
          <div className="text-3xl">⚠️</div>
          <div>
            <h3 className="text-lg font-bold text-amber-300">Zero Capacity Warning</h3>
            <p className="text-sm text-amber-200/70">Some assets have no MW bid</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          <p className="text-sm text-navy-200 leading-relaxed">
            The following assets have <strong className="text-white">0 MW</strong> bid and will{' '}
            <strong className="text-red-400">not be dispatched</strong>:
          </p>

          {/* List of affected assets */}
          <div className="bg-navy-800/50 border border-white/10 rounded-xl p-3 max-h-40 overflow-y-auto">
            <ul className="space-y-1.5">
              {missingBids.map((bid, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-red-400">✗</span>
                  <span className="text-white font-medium">{bid.assetName}</span>
                  <span className="text-navy-400">—</span>
                  <span className="text-navy-300">{bid.period}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Explanation */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-xs text-red-200 leading-relaxed">
              <strong className="text-red-300">Risk:</strong> If total supply doesn't cover demand,
              the market price will hit the <strong className="text-white">$20,000/MWh price cap</strong>.
              This is usually a mistake — did you forget to set bids for these assets?
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="px-6 py-4 border-t border-white/10 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 bg-electric-500 hover:bg-electric-400 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Go Back and Fix
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-navy-300 rounded-lg text-sm font-medium transition-colors"
          >
            Submit Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
