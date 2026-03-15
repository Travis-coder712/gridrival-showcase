import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AudioController from './components/landing/AudioController';
import VersionBadge from './components/VersionBadge';

// Eagerly load the landing page (first paint)
import Landing from './pages/Landing';

// Lazy-load heavy route components for code splitting
const GameGuide = lazy(() => import('./pages/presentation/GameGuide'));
const GuidesPage = lazy(() => import('./pages/GuidesPage'));
const BatteryTest = lazy(() => import('./pages/BatteryTest'));
const RetailMinigame = lazy(() => import('./pages/RetailMinigame'));
const HedgingMinigame = lazy(() => import('./pages/HedgingMinigame'));
const InvestmentMinigame = lazy(() => import('./pages/InvestmentMinigame'));
const BatteryForecast = lazy(() => import('./pages/BatteryForecast'));
const EnergyMixGame = lazy(() => import('./pages/EnergyMixGame'));

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-spin">⚡</div>
        <div className="text-sm text-gray-500 font-medium">Loading...</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/guide" element={<GameGuide />} />
          <Route path="/guides" element={<GuidesPage />} />
          <Route path="/battery-test" element={<BatteryTest />} />
          <Route path="/retail-minigame" element={<RetailMinigame />} />
          <Route path="/hedging-minigame" element={<HedgingMinigame />} />
          <Route path="/investment-minigame" element={<InvestmentMinigame />} />
          <Route path="/battery-forecast" element={<BatteryForecast />} />
          <Route path="/energy-mix" element={<EnergyMixGame />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <AudioController />
      <VersionBadge />
    </>
  );
}
