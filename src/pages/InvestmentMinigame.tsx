import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = 'INTRO' | 'DECIDE' | 'REVEAL' | 'RESULTS';

interface Project {
  id: number;
  name: string;
  type: 'build-ready' | 'rnd';
  capacity: number;       // MW
  cost: number;           // $M
  srmc: number;           // $/MWh
  successRate?: number;   // 0-1 for R&D projects
  icon: string;
}

interface SelectedProject {
  project: Project;
  investorFunded: boolean;
  effectiveCost: number;  // $M actually paid
}

interface RevealedProject extends SelectedProject {
  succeeded: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STARTING_BUDGET = 200; // $M
const RETIRING_CAPACITY = 400; // MW
const AVG_PRICE = 65; // $/MWh
const OPERATING_HOURS = 4000; // hours/year
const INVESTOR_COST_SHARE = 0.50;
const INVESTOR_REVENUE_SHARE = 0.30;

const BUILD_READY_PROJECTS: Project[] = [
  { id: 1, name: 'Solar Farm', type: 'build-ready', capacity: 200, cost: 80, srmc: 0, icon: '\u2600\uFE0F' },
  { id: 2, name: 'Wind Farm', type: 'build-ready', capacity: 300, cost: 120, srmc: 0, icon: '\uD83C\uDF2C\uFE0F' },
  { id: 3, name: 'Gas Peaker', type: 'build-ready', capacity: 150, cost: 60, srmc: 130, icon: '\uD83D\uDD25' },
  { id: 4, name: 'Battery Storage', type: 'build-ready', capacity: 250, cost: 150, srmc: 0, icon: '\uD83D\uDD0B' },
];

const RND_PROJECTS: Project[] = [
  { id: 5, name: 'Advanced Solar', type: 'rnd', capacity: 300, cost: 40, srmc: 0, successRate: 0.65, icon: '\u2728' },
  { id: 6, name: 'Next-Gen Battery', type: 'rnd', capacity: 400, cost: 55, srmc: 0, successRate: 0.55, icon: '\u26A1' },
  { id: 7, name: 'Small Modular Reactor', type: 'rnd', capacity: 500, cost: 50, srmc: 8, successRate: 0.35, icon: '\u2622\uFE0F' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calculateProjectProfit(
  project: Project,
  investorFunded: boolean,
): number {
  const revenueMultiplier = investorFunded ? (1 - INVESTOR_REVENUE_SHARE) : 1;
  const annualRevenue = project.capacity * OPERATING_HOURS * AVG_PRICE * revenueMultiplier;
  const annualCost = project.capacity * OPERATING_HOURS * project.srmc;
  return (annualRevenue - annualCost) / 1_000_000; // Convert to $M
}

function calculateHealthScore(
  capacityReplaced: number,
  remainingCash: number,
  annualProfit: number,
): number {
  const capacityScore = Math.min(100, (capacityReplaced / RETIRING_CAPACITY) * 100);
  const cashScore = (remainingCash / STARTING_BUDGET) * 100;
  const profitScore = Math.min(100, Math.max(0, (annualProfit / 150) * 100));
  return Math.round(capacityScore * 0.5 + cashScore * 0.25 + profitScore * 0.25);
}

// Optimal strategy: Solar Farm ($80M) + Wind Farm ($120M) = 500 MW for $200M
const OPTIMAL_CAPACITY = 500;
const OPTIMAL_PROFIT = calculateProjectProfit(BUILD_READY_PROJECTS[0], false)
  + calculateProjectProfit(BUILD_READY_PROJECTS[1], false);
const OPTIMAL_SCORE = calculateHealthScore(OPTIMAL_CAPACITY, 0, OPTIMAL_PROFIT);

// ─── Sub-components ──────────────────────────────────────────────────────────

function BudgetBar({ remaining, total }: { remaining: number; total: number }) {
  const pct = Math.max(0, (remaining / total) * 100);
  const color = pct > 50 ? 'bg-green-500' : pct > 25 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-navy-400">Budget Remaining</span>
        <span className="text-white font-mono font-bold">${remaining}M / ${total}M</span>
      </div>
      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: '100%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  onBuild,
  onBuildWithInvestor,
  disabled,
  alreadySelected,
  canAffordFull,
  canAffordInvestor,
}: {
  project: Project;
  onBuild: () => void;
  onBuildWithInvestor: () => void;
  disabled: boolean;
  alreadySelected: boolean;
  canAffordFull: boolean;
  canAffordInvestor: boolean;
}) {
  const isRnd = project.type === 'rnd';
  const borderColor = alreadySelected
    ? 'border-green-500/50'
    : isRnd
      ? 'border-purple-500/30 hover:border-purple-400/60'
      : 'border-electric-500/30 hover:border-electric-400/60';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: alreadySelected ? 0.5 : 1, y: 0 }}
      className={`relative bg-white/5 border ${borderColor} rounded-2xl p-5 transition-all ${
        alreadySelected ? 'pointer-events-none' : ''
      }`}
    >
      {alreadySelected && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 z-10">
          <span className="text-green-400 text-2xl font-bold">SELECTED</span>
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{project.icon}</span>
          <div>
            <h3 className="text-white font-bold text-lg">{project.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isRnd
                ? 'bg-purple-500/20 text-purple-300'
                : 'bg-electric-500/20 text-electric-300'
            }`}>
              {isRnd ? 'R&D Project' : 'Build Ready'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-navy-400 text-xs">Capacity</div>
          <div className="text-white font-mono font-bold">{project.capacity} MW</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-navy-400 text-xs">Cost</div>
          <div className="text-white font-mono font-bold">${project.cost}M</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-navy-400 text-xs">SRMC</div>
          <div className="text-white font-mono font-bold">
            {project.srmc === 0 ? '$0' : `$${project.srmc}`}/MWh
          </div>
        </div>
        {isRnd && project.successRate != null && (
          <div className="bg-white/5 rounded-lg p-2">
            <div className="text-navy-400 text-xs">Success Rate</div>
            <div className={`font-mono font-bold ${
              project.successRate >= 0.6 ? 'text-green-400' :
              project.successRate >= 0.5 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {Math.round(project.successRate * 100)}%
            </div>
          </div>
        )}
        {!isRnd && (
          <div className="bg-white/5 rounded-lg p-2">
            <div className="text-navy-400 text-xs">Delivery</div>
            <div className="text-green-400 font-mono font-bold">Certain</div>
          </div>
        )}
      </div>

      {isRnd && project.successRate != null && (
        <div className="mb-3">
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                project.successRate >= 0.6 ? 'bg-green-500' :
                project.successRate >= 0.5 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${project.successRate * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onBuild}
          disabled={disabled || alreadySelected || !canAffordFull}
          className="flex-1 px-3 py-2 text-sm font-medium rounded-xl transition-all
            bg-electric-500/20 text-electric-300 border border-electric-500/30
            hover:bg-electric-500/30 hover:border-electric-400
            disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-electric-500/20"
        >
          Build (${project.cost}M)
        </button>
        <button
          onClick={onBuildWithInvestor}
          disabled={disabled || alreadySelected || !canAffordInvestor}
          className="flex-1 px-3 py-2 text-sm font-medium rounded-xl transition-all
            bg-amber-500/20 text-amber-300 border border-amber-500/30
            hover:bg-amber-500/30 hover:border-amber-400
            disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-amber-500/20"
        >
          Investor (${Math.round(project.cost * INVESTOR_COST_SHARE)}M)
        </button>
      </div>
    </motion.div>
  );
}

function SpinnerWheel({
  project,
  onComplete,
}: {
  project: RevealedProject;
  onComplete: () => void;
}) {
  const [spinning, setSpinning] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const successRate = project.project.successRate ?? 0.5;

  useEffect(() => {
    const spinTimer = setTimeout(() => {
      setSpinning(false);
      setShowResult(true);
    }, 2500);
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4000);
    return () => {
      clearTimeout(spinTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  // Calculate rotation: success sector covers successRate * 360 degrees starting from top
  // We want the arrow to land in success or failure sector
  const successDegrees = successRate * 360;
  const failureDegrees = 360 - successDegrees;
  // Target angle for the wheel to stop at (arrow points up/top)
  // For success: land in the middle of success sector
  // For failure: land in the middle of failure sector
  const targetAngle = project.succeeded
    ? successDegrees / 2
    : successDegrees + failureDegrees / 2;
  // Add several full rotations for dramatic effect
  const totalRotation = 360 * 5 + targetAngle;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4 p-6"
    >
      <h3 className="text-white font-bold text-xl flex items-center gap-2">
        <span>{project.project.icon}</span>
        {project.project.name}
      </h3>

      <div className="text-sm text-navy-400 mb-2">
        Success chance: {Math.round(successRate * 100)}%
      </div>

      {/* Spinner */}
      <div className="relative w-48 h-48">
        {/* Arrow indicator at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px]
            border-l-transparent border-r-transparent border-t-white drop-shadow-lg" />
        </div>

        {/* Wheel */}
        <motion.div
          className="w-48 h-48 rounded-full overflow-hidden relative border-4 border-white/20"
          animate={{ rotate: spinning ? totalRotation : totalRotation }}
          transition={{
            duration: spinning ? 2.5 : 0,
            ease: [0.2, 0.8, 0.3, 1],
          }}
        >
          {/* Success sector */}
          <div
            className="absolute inset-0"
            style={{
              background: `conic-gradient(
                from 0deg,
                #22c55e 0deg ${successDegrees}deg,
                #ef4444 ${successDegrees}deg 360deg
              )`,
            }}
          />
          {/* Center circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-navy-950 rounded-full flex items-center justify-center border-2 border-white/20">
              <span className="text-2xl">{project.project.icon}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Result */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="text-center"
          >
            {project.succeeded ? (
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-full
                    flex items-center justify-center"
                >
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <div className="text-green-400 font-bold text-xl">SUCCESS!</div>
                <div className="text-navy-400 text-sm">+{project.project.capacity} MW added</div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="w-16 h-16 bg-red-500/20 border-2 border-red-500 rounded-full
                    flex items-center justify-center"
                >
                  <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.div>
                <div className="text-red-400 font-bold text-xl">FAILED</div>
                <div className="text-navy-400 text-sm">Project did not deliver</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function HealthScoreGauge({ score }: { score: number }) {
  const color = score >= 75 ? 'text-green-400' : score >= 50 ? 'text-amber-400' : 'text-red-400';
  const bgColor = score >= 75 ? 'stroke-green-500' : score >= 50 ? 'stroke-amber-500' : 'stroke-red-500';
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-sm text-navy-400 uppercase tracking-wide">Company Health Score</div>
      <div className="relative w-36 h-36">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <motion.circle
            cx="60" cy="60" r="54" fill="none"
            className={bgColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-3xl font-mono font-bold ${color}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-navy-500">/100</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function InvestmentMinigame() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('INTRO');
  const [selectedProjects, setSelectedProjects] = useState<SelectedProject[]>([]);
  const [revealedProjects, setRevealedProjects] = useState<RevealedProject[]>([]);
  const [revealIndex, setRevealIndex] = useState(0);
  const [allRevealed, setAllRevealed] = useState(false);

  // ─── Derived State ─────────────────────────────────────────────────────

  const totalSpent = selectedProjects.reduce((sum, sp) => sum + sp.effectiveCost, 0);
  const remainingBudget = STARTING_BUDGET - totalSpent;
  const totalPotentialMW = selectedProjects.reduce((sum, sp) => sum + sp.project.capacity, 0);
  const selectedIds = new Set(selectedProjects.map(sp => sp.project.id));

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handleBuild = useCallback((project: Project, withInvestor: boolean) => {
    const effectiveCost = withInvestor
      ? Math.round(project.cost * INVESTOR_COST_SHARE)
      : project.cost;

    if (effectiveCost > remainingBudget) return;

    setSelectedProjects(prev => [...prev, {
      project,
      investorFunded: withInvestor,
      effectiveCost,
    }]);
  }, [remainingBudget]);

  const handleRemoveProject = useCallback((projectId: number) => {
    setSelectedProjects(prev => prev.filter(sp => sp.project.id !== projectId));
  }, []);

  const handleStartReveal = useCallback(() => {
    // Determine outcomes for all selected projects
    const revealed: RevealedProject[] = selectedProjects.map(sp => ({
      ...sp,
      succeeded: sp.project.type === 'build-ready'
        ? true
        : Math.random() < (sp.project.successRate ?? 0.5),
    }));
    setRevealedProjects(revealed);
    setRevealIndex(0);
    setAllRevealed(false);
    setPhase('REVEAL');
  }, [selectedProjects]);

  const handleRevealNext = useCallback(() => {
    if (revealIndex < revealedProjects.length - 1) {
      setRevealIndex(prev => prev + 1);
    } else {
      setAllRevealed(true);
    }
  }, [revealIndex, revealedProjects.length]);

  const handleReset = useCallback(() => {
    setPhase('INTRO');
    setSelectedProjects([]);
    setRevealedProjects([]);
    setRevealIndex(0);
    setAllRevealed(false);
  }, []);

  // ─── Results Calculations ──────────────────────────────────────────────

  const successfulProjects = revealedProjects.filter(rp => rp.succeeded);
  const totalCapacityAdded = successfulProjects.reduce((sum, rp) => sum + rp.project.capacity, 0);
  const totalAnnualProfit = successfulProjects.reduce(
    (sum, rp) => sum + calculateProjectProfit(rp.project, rp.investorFunded),
    0,
  );
  const finalRemainingCash = STARTING_BUDGET - totalSpent;
  const healthScore = calculateHealthScore(totalCapacityAdded, finalRemainingCash, totalAnnualProfit);

  // Auto-advance to RESULTS when all revealed
  useEffect(() => {
    if (allRevealed && phase === 'REVEAL') {
      const timer = setTimeout(() => setPhase('RESULTS'), 1500);
      return () => clearTimeout(timer);
    }
  }, [allRevealed, phase]);

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      <AnimatePresence mode="wait">
        {/* ═══════════════════ INTRO ═══════════════════ */}
        {phase === 'INTRO' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center px-4 py-12"
          >
            <div className="max-w-2xl w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full mb-6">
                  <span className="text-amber-400 text-sm font-medium">Investment Challenge</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-electric-300 to-purple-400 bg-clip-text text-transparent">
                  Generation Investment
                </h1>
                <p className="text-navy-400 text-lg">The Energy Transition Demands Action</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 mb-8 space-y-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-500/20 border border-red-500/40 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Coal Unit Retiring</h3>
                    <p className="text-navy-400 text-sm">
                      Your company's oldest coal unit (<span className="text-red-400 font-mono font-bold">400 MW</span>) is retiring this year.
                      You need to invest in replacement generation or your company shrinks.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-electric-500/20 border border-electric-500/40 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-electric-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Two Investment Paths</h3>
                    <p className="text-navy-400 text-sm">
                      <span className="text-electric-300 font-medium">Build Ready</span> projects are certain but expensive.{' '}
                      <span className="text-purple-300 font-medium">R&D Development</span> projects are cheaper but have a probability of failure.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/40 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Outside Investors</h3>
                    <p className="text-navy-400 text-sm">
                      You can bring in investors who fund <span className="text-amber-400 font-mono">50%</span> of the cost,
                      but they take a <span className="text-amber-400 font-mono">30%</span> revenue share from that asset.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-500/20 border border-green-500/40 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Your Budget</h3>
                    <p className="text-navy-400 text-sm">
                      You have <span className="text-green-400 font-mono font-bold">$200M</span> to spend.
                      Replace as much of the 400 MW as possible to keep your company competitive.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <button
                  onClick={() => setPhase('DECIDE')}
                  className="px-8 py-4 bg-gradient-to-r from-electric-500 to-purple-500
                    hover:from-electric-400 hover:to-purple-400
                    text-white font-bold text-lg rounded-2xl
                    shadow-lg shadow-electric-500/25 hover:shadow-electric-500/40
                    transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Start Investment Challenge
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════ DECIDE ═══════════════════ */}
        {phase === 'DECIDE' && (
          <motion.div
            key="decide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen px-4 py-8"
          >
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">Choose Your Investments</h2>
                <p className="text-navy-400">Select projects to replace your retiring coal capacity</p>
              </div>

              {/* Status Bar */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Retiring Coal */}
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                    <div className="text-xs text-red-400 uppercase tracking-wide mb-1">Coal Retiring</div>
                    <div className="text-2xl font-mono font-bold text-red-400 line-through">
                      400 MW
                    </div>
                  </div>

                  {/* Potential Replacement */}
                  <div className="bg-electric-500/10 border border-electric-500/20 rounded-xl p-3 text-center">
                    <div className="text-xs text-electric-300 uppercase tracking-wide mb-1">Potential Replacement</div>
                    <div className={`text-2xl font-mono font-bold ${
                      totalPotentialMW >= 400 ? 'text-green-400' :
                      totalPotentialMW >= 200 ? 'text-amber-400' : 'text-white'
                    }`}>
                      {totalPotentialMW} MW
                    </div>
                  </div>

                  {/* Projects Selected */}
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
                    <div className="text-xs text-purple-300 uppercase tracking-wide mb-1">Projects Selected</div>
                    <div className="text-2xl font-mono font-bold text-white">
                      {selectedProjects.length}
                    </div>
                  </div>
                </div>

                <BudgetBar remaining={remainingBudget} total={STARTING_BUDGET} />
              </div>

              {/* Selected Projects Summary */}
              <AnimatePresence>
                {selectedProjects.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <h3 className="text-sm text-navy-400 uppercase tracking-wide mb-3">Your Portfolio</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProjects.map(sp => (
                          <motion.div
                            key={sp.project.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2 bg-white/5 border border-white/10
                              rounded-xl px-3 py-2 text-sm"
                          >
                            <span>{sp.project.icon}</span>
                            <span className="text-white font-medium">{sp.project.name}</span>
                            <span className="text-navy-500">|</span>
                            <span className="text-navy-400 font-mono">{sp.project.capacity} MW</span>
                            <span className="text-navy-500">|</span>
                            <span className="text-navy-400 font-mono">${sp.effectiveCost}M</span>
                            {sp.investorFunded && (
                              <span className="text-xs px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-md">
                                Investor
                              </span>
                            )}
                            {sp.project.type === 'rnd' && (
                              <span className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded-md">
                                {Math.round((sp.project.successRate ?? 0) * 100)}%
                              </span>
                            )}
                            <button
                              onClick={() => handleRemoveProject(sp.project.id)}
                              className="ml-1 text-navy-500 hover:text-red-400 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Project Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Build Ready */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-electric-500 rounded-full" />
                    <h3 className="text-lg font-bold text-white">Build Ready</h3>
                    <span className="text-xs text-navy-500 ml-1">Certain delivery next year</span>
                  </div>
                  <div className="space-y-4">
                    {BUILD_READY_PROJECTS.map(project => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onBuild={() => handleBuild(project, false)}
                        onBuildWithInvestor={() => handleBuild(project, true)}
                        disabled={false}
                        alreadySelected={selectedIds.has(project.id)}
                        canAffordFull={remainingBudget >= project.cost}
                        canAffordInvestor={remainingBudget >= Math.round(project.cost * INVESTOR_COST_SHARE)}
                      />
                    ))}
                  </div>
                </div>

                {/* R&D Projects */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    <h3 className="text-lg font-bold text-white">R&D Development</h3>
                    <span className="text-xs text-navy-500 ml-1">Cheaper but uncertain</span>
                  </div>
                  <div className="space-y-4">
                    {RND_PROJECTS.map(project => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onBuild={() => handleBuild(project, false)}
                        onBuildWithInvestor={() => handleBuild(project, true)}
                        disabled={false}
                        alreadySelected={selectedIds.has(project.id)}
                        canAffordFull={remainingBudget >= project.cost}
                        canAffordInvestor={remainingBudget >= Math.round(project.cost * INVESTOR_COST_SHARE)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Confirm Button */}
              <div className="text-center pb-8">
                <button
                  onClick={handleStartReveal}
                  disabled={selectedProjects.length === 0}
                  className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-500
                    hover:from-green-400 hover:to-emerald-400
                    text-white font-bold text-lg rounded-2xl
                    shadow-lg shadow-green-500/25 hover:shadow-green-500/40
                    transition-all duration-300 transform hover:scale-[1.02]
                    disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none
                    disabled:shadow-none"
                >
                  Confirm Investments & Reveal Outcomes
                </button>
                {selectedProjects.length === 0 && (
                  <p className="text-navy-500 text-sm mt-2">Select at least one project to continue</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════ REVEAL ═══════════════════ */}
        {phase === 'REVEAL' && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
          >
            <div className="max-w-2xl w-full">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Project Outcomes</h2>
                <p className="text-navy-400">
                  Revealing {revealIndex + 1} of {revealedProjects.length}
                </p>
              </div>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mb-8">
                {revealedProjects.map((rp, i) => (
                  <motion.div
                    key={rp.project.id}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      i < revealIndex
                        ? rp.succeeded
                          ? 'bg-green-500'
                          : 'bg-red-500'
                        : i === revealIndex
                          ? 'bg-white ring-2 ring-white/30'
                          : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>

              {/* Current Reveal */}
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-8">
                <AnimatePresence mode="wait">
                  {revealedProjects[revealIndex] && (
                    <motion.div
                      key={revealedProjects[revealIndex].project.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {revealedProjects[revealIndex].project.type === 'build-ready' ? (
                        /* Build Ready - Guaranteed success with checkmark animation */
                        <div className="flex flex-col items-center gap-4 p-8">
                          <h3 className="text-white font-bold text-xl flex items-center gap-2">
                            <span>{revealedProjects[revealIndex].project.icon}</span>
                            {revealedProjects[revealIndex].project.name}
                          </h3>
                          <div className="text-sm text-navy-400 mb-2">Build Ready - Guaranteed Delivery</div>

                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              type: 'spring',
                              stiffness: 200,
                              damping: 15,
                              delay: 0.5,
                            }}
                            className="w-24 h-24 bg-green-500/20 border-4 border-green-500 rounded-full
                              flex items-center justify-center"
                          >
                            <motion.svg
                              className="w-12 h-12 text-green-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ delay: 0.8, duration: 0.5 }}
                            >
                              <motion.path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 0.8, duration: 0.5 }}
                              />
                            </motion.svg>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            className="text-center"
                          >
                            <div className="text-green-400 font-bold text-xl">CONSTRUCTED</div>
                            <div className="text-navy-400 text-sm mt-1">
                              +{revealedProjects[revealIndex].project.capacity} MW online
                            </div>
                          </motion.div>

                          {/* Auto-advance for build-ready after animation */}
                          <BuildReadyAutoAdvance onAdvance={handleRevealNext} />
                        </div>
                      ) : (
                        /* R&D Project - Spinner wheel */
                        <SpinnerWheel
                          project={revealedProjects[revealIndex]}
                          onComplete={handleRevealNext}
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tally so far */}
              {revealIndex > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4"
                >
                  <div className="text-center">
                    <div className="text-sm text-navy-400 mb-1">Capacity Added So Far</div>
                    <div className="text-2xl font-mono font-bold text-white">
                      {revealedProjects
                        .slice(0, revealIndex)
                        .filter(rp => rp.succeeded)
                        .reduce((sum, rp) => sum + rp.project.capacity, 0)} MW
                      <span className="text-navy-500 text-lg"> / {RETIRING_CAPACITY} MW target</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Final Summary before transition */}
              <AnimatePresence>
                {allRevealed && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 text-center"
                  >
                    <div className={`text-2xl font-bold mb-2 ${
                      totalCapacityAdded >= 400 ? 'text-green-400' :
                      totalCapacityAdded >= 200 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      You replaced {totalCapacityAdded} MW of {RETIRING_CAPACITY} MW retired coal
                    </div>
                    <div className={`text-lg ${
                      totalCapacityAdded >= 400 ? 'text-green-300' :
                      totalCapacityAdded >= 200 ? 'text-amber-300' : 'text-red-300'
                    }`}>
                      {totalCapacityAdded >= 400
                        ? 'Fully replaced! Your fleet is stronger than ever.'
                        : totalCapacityAdded >= 200
                          ? 'Partially replaced - some market exposure remains.'
                          : 'Significant capacity gap - company at risk.'}
                    </div>
                    <p className="text-navy-500 text-sm mt-3">Loading results...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════ RESULTS ═══════════════════ */}
        {phase === 'RESULTS' && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen px-4 py-12"
          >
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Investment Results</h2>
                <p className="text-navy-400">Your 1-year forward projection</p>
              </div>

              {/* Capacity Result Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-6 mb-8 text-center border ${
                  totalCapacityAdded >= 400
                    ? 'bg-green-500/10 border-green-500/30'
                    : totalCapacityAdded >= 200
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                <div className={`text-4xl font-mono font-bold mb-2 ${
                  totalCapacityAdded >= 400 ? 'text-green-400' :
                  totalCapacityAdded >= 200 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {totalCapacityAdded} MW / {RETIRING_CAPACITY} MW
                </div>
                <div className={`text-lg font-medium ${
                  totalCapacityAdded >= 400 ? 'text-green-300' :
                  totalCapacityAdded >= 200 ? 'text-amber-300' : 'text-red-300'
                }`}>
                  {totalCapacityAdded >= 400
                    ? 'Fully Replaced!'
                    : totalCapacityAdded >= 200
                      ? 'Partially Replaced - Some Market Exposure'
                      : 'Significant Capacity Gap - Company at Risk'}
                </div>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Health Score */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-center"
                >
                  <HealthScoreGauge score={healthScore} />
                </motion.div>

                {/* Financial Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:col-span-2"
                >
                  <h3 className="text-sm text-navy-400 uppercase tracking-wide mb-4">Financial Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="text-xs text-navy-400 mb-1">Total Investment</div>
                      <div className="text-xl font-mono font-bold text-white">${totalSpent}M</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="text-xs text-navy-400 mb-1">Remaining Cash</div>
                      <div className={`text-xl font-mono font-bold ${
                        finalRemainingCash > 50 ? 'text-green-400' :
                        finalRemainingCash > 0 ? 'text-amber-400' : 'text-white'
                      }`}>
                        ${finalRemainingCash}M
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 col-span-2">
                      <div className="text-xs text-navy-400 mb-1">Projected Annual Profit</div>
                      <div className={`text-2xl font-mono font-bold ${
                        totalAnnualProfit >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ${totalAnnualProfit.toFixed(1)}M
                      </div>
                      <div className="text-xs text-navy-500 mt-1">
                        Based on {OPERATING_HOURS} operating hours at ${AVG_PRICE}/MWh avg price
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Portfolio Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8"
              >
                <h3 className="text-sm text-navy-400 uppercase tracking-wide mb-4">Portfolio Details</h3>
                <div className="space-y-3">
                  {revealedProjects.map(rp => {
                    const profit = rp.succeeded
                      ? calculateProjectProfit(rp.project, rp.investorFunded)
                      : 0;
                    return (
                      <motion.div
                        key={rp.project.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center gap-4 p-4 rounded-xl border ${
                          rp.succeeded
                            ? 'bg-green-500/5 border-green-500/20'
                            : 'bg-red-500/5 border-red-500/20 opacity-60'
                        }`}
                      >
                        <span className="text-2xl">{rp.project.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-medium">{rp.project.name}</span>
                            {rp.investorFunded && (
                              <span className="text-xs px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-md">
                                Investor Funded
                              </span>
                            )}
                            {!rp.succeeded && (
                              <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-md">
                                Failed
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-navy-400 mt-0.5">
                            {rp.succeeded ? `${rp.project.capacity} MW` : '0 MW'} | Cost: ${rp.effectiveCost}M
                            {rp.project.srmc > 0 && ` | SRMC: $${rp.project.srmc}/MWh`}
                          </div>
                        </div>
                        <div className="text-right">
                          {rp.succeeded ? (
                            <div>
                              <div className="text-xs text-navy-400">Annual Profit</div>
                              <div className={`font-mono font-bold ${
                                profit >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                ${profit.toFixed(1)}M
                                {rp.investorFunded && (
                                  <span className="text-xs text-navy-500 block">(-30% to investor)</span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-red-400 font-mono font-bold">-${rp.effectiveCost}M lost</div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Comparison to Optimal */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8"
              >
                <h3 className="text-sm text-navy-400 uppercase tracking-wide mb-4">Compared to Optimal Strategy</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xs text-navy-500 mb-1">Capacity</div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono font-bold text-white">{totalCapacityAdded} MW</span>
                      <span className="text-navy-500">vs</span>
                      <span className="font-mono font-bold text-electric-300">{OPTIMAL_CAPACITY} MW</span>
                    </div>
                    <ComparisonBar value={totalCapacityAdded} optimal={OPTIMAL_CAPACITY} />
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-navy-500 mb-1">Annual Profit</div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono font-bold text-white">${totalAnnualProfit.toFixed(1)}M</span>
                      <span className="text-navy-500">vs</span>
                      <span className="font-mono font-bold text-electric-300">${OPTIMAL_PROFIT.toFixed(1)}M</span>
                    </div>
                    <ComparisonBar value={totalAnnualProfit} optimal={OPTIMAL_PROFIT} />
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-navy-500 mb-1">Health Score</div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono font-bold text-white">{healthScore}</span>
                      <span className="text-navy-500">vs</span>
                      <span className="font-mono font-bold text-electric-300">{OPTIMAL_SCORE}</span>
                    </div>
                    <ComparisonBar value={healthScore} optimal={OPTIMAL_SCORE} />
                  </div>
                </div>
                <div className="mt-4 p-3 bg-electric-500/10 border border-electric-500/20 rounded-xl">
                  <p className="text-sm text-electric-300 text-center">
                    Optimal strategy: <span className="font-medium">Solar Farm + Wind Farm</span> = 500 MW for $200M, fully self-funded
                  </p>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-4 pb-8"
              >
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-white/5 border border-white/10
                    hover:bg-white/10 hover:border-white/20
                    text-white font-medium rounded-xl transition-all"
                >
                  Play Again
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-electric-500/20 border border-electric-500/30
                    hover:bg-electric-500/30 hover:border-electric-400
                    text-electric-300 font-medium rounded-xl transition-all"
                >
                  Back to Home
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Utility Sub-components ──────────────────────────────────────────────────

function BuildReadyAutoAdvance({ onAdvance }: { onAdvance: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onAdvance, 2000);
    return () => clearTimeout(timer);
  }, [onAdvance]);
  return null;
}

function ComparisonBar({ value, optimal }: { value: number; optimal: number }) {
  const pct = Math.min(100, Math.max(0, (value / optimal) * 100));
  const color = pct >= 90 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-2">
      <motion.div
        className={`h-full ${color} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
      />
    </div>
  );
}
