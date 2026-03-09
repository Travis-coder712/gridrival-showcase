import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BatteryExplainer from '../components/game/BatteryExplainer';
import BatteryArbitrageMiniGame from '../components/game/BatteryArbitrageMiniGame';

type Phase = 'explainer' | 'minigame' | 'done';

export default function BatteryTest() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('explainer');
  const [lastResult, setLastResult] = useState<{
    totalProfit: number;
    optimalProfit: number;
    predispatchOptimalProfit?: number;
    decisionsCorrect?: number;
    decisionsTotal?: number;
  } | null>(null);

  return (
    <div className="min-h-screen bg-navy-950">
      {phase === 'explainer' && (
        <BatteryExplainer onClose={() => setPhase('minigame')} />
      )}
      {phase === 'minigame' && (
        <BatteryArbitrageMiniGame
          onComplete={(result) => {
            setLastResult(result);
            setPhase('done');
          }}
          onSkip={() => setPhase('done')}
        />
      )}
      {phase === 'done' && (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
          <div className="text-5xl">🔋</div>
          <h2 className="text-3xl font-bold text-white">Battery Test Complete</h2>
          {lastResult && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center max-w-sm">
              <div className="text-sm text-navy-400 uppercase tracking-wide mb-2">Last Result</div>
              <div className={`text-2xl font-mono font-bold ${lastResult.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${Math.round(lastResult.totalProfit).toLocaleString()}
              </div>
              <div className="text-xs text-navy-500 mt-1">
                Perfect foresight: ${Math.round(lastResult.optimalProfit).toLocaleString()}
                {lastResult.optimalProfit > 0 && (
                  <> ({Math.round((lastResult.totalProfit / lastResult.optimalProfit) * 100)}% capture)</>
                )}
              </div>
              {lastResult.decisionsCorrect != null && lastResult.decisionsTotal != null && (
                <div className="text-xs text-navy-400 mt-1">
                  Decision quality: {lastResult.decisionsCorrect}/{lastResult.decisionsTotal} matched optimal
                  {' '}({Math.round((lastResult.decisionsCorrect / lastResult.decisionsTotal) * 100)}%)
                </div>
              )}
            </div>
          )}
          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={() => setPhase('explainer')}
              className="px-5 py-2.5 text-sm font-medium text-electric-300 border border-electric-500/30 hover:border-electric-400 hover:bg-electric-500/10 rounded-xl transition-all"
            >
              Restart Explainer
            </button>
            <button
              onClick={() => { setLastResult(null); setPhase('minigame'); }}
              className="px-5 py-2.5 text-sm font-medium text-electric-300 border border-electric-500/30 hover:border-electric-400 hover:bg-electric-500/10 rounded-xl transition-all"
            >
              Restart Minigame
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 text-sm font-medium text-navy-300 border border-white/10 hover:border-white/30 hover:bg-white/5 rounded-xl transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
