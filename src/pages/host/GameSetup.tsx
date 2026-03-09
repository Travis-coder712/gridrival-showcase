import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';
import type { AssetConfigOverrides, AssetConfigPreset, AssetType } from '../../../shared/types';

const FEATURED_MODE = {
  id: 'progressive',
  name: 'Progressive Learning',
  rounds: 10,
  duration: '90-120 min',
  description: 'Builds complexity gradually: 1 asset → full portfolio over 10 rounds. Best for a single 2-hour session with new learners.',
  detail: 'Coal → Gas → Renewables → Battery → Crisis scenarios. Includes host teaching prompts.',
  icon: '📈',
  tag: 'Recommended',
};

const GAME_MODES = [
  {
    id: 'beginner',
    name: 'Beginner Intro',
    rounds: 1,
    duration: '10-15 min',
    description: 'One guided round with 2 assets. Perfect for first-timers.',
    icon: '🎓',
  },
  {
    id: 'first_run',
    name: 'First Run JD Remix',
    rounds: 9,
    duration: '45-60 min',
    description: 'Lean portfolio: 1 coal, 1 gas, 1 renewable, 1 battery. Includes battery arbitrage challenge. Fast full-mix intro.',
    icon: '🚀',
  },
  {
    id: 'quick',
    name: 'Quick Game',
    rounds: 8,
    duration: '60-90 min',
    description: 'All key concepts in 8 fast-paced rounds. Great for workshops.',
    icon: '⚡',
  },
  {
    id: 'full',
    name: 'Full Game',
    rounds: 15,
    duration: '2.5-3.5 hrs',
    description: 'Deep-dive with seasonal scenarios, carbon pricing & advanced strategy.',
    icon: '🏆',
  },
  {
    id: 'experienced',
    name: 'Experienced Replay',
    rounds: 4,
    duration: '30-45 min',
    description: 'Full portfolio from round 1. One round per season for returning players.',
    icon: '🔄',
  },
];

const ASSET_ROWS: { type: AssetType; icon: string; label: string; hasSrmc: boolean }[] = [
  { type: 'coal', icon: '🔥', label: 'Coal', hasSrmc: true },
  { type: 'gas_ccgt', icon: '⚡', label: 'Gas CCGT', hasSrmc: true },
  { type: 'gas_peaker', icon: '🔶', label: 'Gas Peaker', hasSrmc: true },
  { type: 'wind', icon: '💨', label: 'Wind', hasSrmc: false },
  { type: 'solar', icon: '☀️', label: 'Solar', hasSrmc: false },
  { type: 'hydro', icon: '💧', label: 'Hydro', hasSrmc: true },
  { type: 'battery', icon: '🔋', label: 'Battery', hasSrmc: false },
];

const DEFAULT_ASSET_CONFIG: AssetConfigOverrides = {
  coal: { name: 'Coal', nameplateMW: 800, srmcPerMWh: 35 },
  gas_ccgt: { name: 'Gas CCGT', nameplateMW: 350, srmcPerMWh: 75 },
  gas_peaker: { name: 'Gas Peaker', nameplateMW: 150, srmcPerMWh: 145 },
  wind: { name: 'Wind', nameplateMW: 300 },
  solar: { name: 'Solar', nameplateMW: 200 },
  hydro: { name: 'Hydro', nameplateMW: 250, srmcPerMWh: 8 },
  battery: { name: 'Battery', nameplateMW: 150 },
};

export default function GameSetup() {
  const navigate = useNavigate();
  const { createGame, gameState, connected } = useSocket();
  const [selectedMode, setSelectedMode] = useState('beginner');
  const [teamCount, setTeamCount] = useState(6);
  const [balancingEnabled, setBalancingEnabled] = useState(true);
  const [biddingGuardrailEnabled, setBiddingGuardrailEnabled] = useState(false);

  // Asset configuration
  const [useCustomConfig, setUseCustomConfig] = useState(false);
  const [showAssetConfig, setShowAssetConfig] = useState(false);
  const [assetConfig, setAssetConfig] = useState<AssetConfigOverrides>(() =>
    JSON.parse(JSON.stringify(DEFAULT_ASSET_CONFIG))
  );
  const [applyVariation, setApplyVariation] = useState(true);
  const [savedConfigs, setSavedConfigs] = useState<AssetConfigPreset[]>([]);
  const [configName, setConfigName] = useState('');
  const [saveFeedback, setSaveFeedback] = useState('');

  // WiFi configuration (persisted to server)
  const [showWifiConfig, setShowWifiConfig] = useState(false);
  const [wifiName, setWifiName] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiSaved, setWifiSaved] = useState(false);
  const [wifiQrUrl, setWifiQrUrl] = useState<string | null>(null);
  const [wifiLoading, setWifiLoading] = useState(false);
  const [showWifiPassword, setShowWifiPassword] = useState(false);

  // Track whether WE created the game in this session.
  const createdByUs = useRef(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if ((createdByUs.current || creating) && gameState && gameState.phase === 'lobby') {
      navigate('/host/dashboard');
    }
  }, [gameState, navigate, creating]);

  // Fetch saved configs on mount
  useEffect(() => {
    fetch('/api/asset-configs')
      .then(r => r.json())
      .then(data => setSavedConfigs(data.configs || []))
      .catch(() => {});
  }, []);

  // Fetch saved WiFi config on mount
  useEffect(() => {
    fetch('/api/wifi')
      .then(r => r.json())
      .then(data => {
        if (data.wifi) {
          setWifiName(data.wifi.networkName);
          setWifiPassword(data.wifi.password);
          setWifiSaved(true);
          setWifiQrUrl(data.qrDataUrl || null);
        }
      })
      .catch(() => {});
  }, []);

  const handleCreate = () => {
    createdByUs.current = true;
    setCreating(true);
    createGame(
      selectedMode,
      teamCount,
      balancingEnabled,
      biddingGuardrailEnabled,
      useCustomConfig ? assetConfig : undefined,
      useCustomConfig ? applyVariation : undefined,
    );
    // Safety: if navigation hasn't happened after 5s, reset the button
    setTimeout(() => setCreating(false), 5000);
  };

  const updateAsset = (type: AssetType, field: string, value: string | number) => {
    setAssetConfig(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const handleSaveConfig = async () => {
    if (!configName.trim()) return;
    try {
      const resp = await fetch('/api/asset-configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: configName.trim(), assets: assetConfig, applyVariation }),
      });
      const saved = await resp.json();
      setSavedConfigs(prev => [saved, ...prev]);
      setConfigName('');
      setSaveFeedback('Saved!');
      setTimeout(() => setSaveFeedback(''), 2000);
    } catch {
      setSaveFeedback('Error saving');
      setTimeout(() => setSaveFeedback(''), 2000);
    }
  };

  const handleLoadConfig = (preset: AssetConfigPreset) => {
    setAssetConfig(JSON.parse(JSON.stringify(preset.assets)));
    setApplyVariation(preset.applyVariation);
    setUseCustomConfig(true);
  };

  const handleDeleteConfig = async (id: string) => {
    try {
      await fetch(`/api/asset-configs/${id}`, { method: 'DELETE' });
      setSavedConfigs(prev => prev.filter(c => c.id !== id));
    } catch {}
  };

  const handleSaveWifi = async () => {
    if (!wifiName.trim()) return;
    setWifiLoading(true);
    try {
      const resp = await fetch('/api/wifi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ networkName: wifiName.trim(), password: wifiPassword }),
      });
      const data = await resp.json();
      setWifiSaved(true);
      setWifiQrUrl(data.qrDataUrl || null);
    } catch {}
    setWifiLoading(false);
  };

  const handleDeleteWifi = async () => {
    try {
      await fetch('/api/wifi', { method: 'DELETE' });
      setWifiName('');
      setWifiPassword('');
      setWifiSaved(false);
      setWifiQrUrl(null);
    } catch {}
  };

  const handleResetDefaults = () => {
    setAssetConfig(JSON.parse(JSON.stringify(DEFAULT_ASSET_CONFIG)));
    setApplyVariation(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-800 to-navy-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-start mb-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Exit
            </button>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Game Setup</h1>
          <p className="text-navy-300">Configure your GridRival training session</p>
          <div className={`inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs font-medium ${
            connected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            {connected ? 'Server Connected' : 'Connecting...'}
          </div>
        </div>

        {/* Game Mode Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-navy-200 mb-3">Game Mode</label>

          {/* Featured Mode — full width */}
          <button
            onClick={() => setSelectedMode(FEATURED_MODE.id)}
            className={`relative w-full text-left rounded-xl p-5 border-2 transition-all duration-200 mb-3 ${
              selectedMode === FEATURED_MODE.id
                ? 'border-electric-400 bg-electric-500/10 shadow-lg shadow-electric-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/30'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl mt-0.5">{FEATURED_MODE.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white">{FEATURED_MODE.name}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-electric-500/25 text-electric-300 rounded-full">
                    {FEATURED_MODE.tag}
                  </span>
                </div>
                <div className="text-xs text-electric-300 mt-0.5">{FEATURED_MODE.rounds} rounds &bull; {FEATURED_MODE.duration}</div>
                <div className="text-xs text-navy-300 mt-1">{FEATURED_MODE.description}</div>
                <div className="text-[11px] text-navy-500 mt-1">{FEATURED_MODE.detail}</div>
              </div>
            </div>
            {selectedMode === FEATURED_MODE.id && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-electric-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>

          {/* Other modes — responsive grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {GAME_MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`relative text-left rounded-xl p-4 border-2 transition-all duration-200 ${
                  selectedMode === mode.id
                    ? 'border-electric-400 bg-electric-500/10 shadow-lg shadow-electric-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/30'
                }`}
              >
                <div className="text-2xl mb-2">{mode.icon}</div>
                <div className="font-semibold text-white text-sm">{mode.name}</div>
                <div className="text-xs text-electric-300 mb-1">{mode.rounds} rounds &bull; {mode.duration}</div>
                <div className="text-xs text-navy-400 leading-snug">{mode.description}</div>
                {selectedMode === mode.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-electric-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Team Count */}
        <div className="mb-6 bg-white/5 rounded-xl p-5 border border-white/10">
          <label className="block text-sm font-medium text-navy-200 mb-3">
            Number of Teams: <span className="text-electric-400 font-bold text-lg">{teamCount}</span>
          </label>
          <input
            type="range"
            min="2"
            max="15"
            value={teamCount}
            onChange={(e) => setTeamCount(parseInt(e.target.value))}
            className="w-full h-2 bg-navy-600 rounded-lg appearance-none cursor-pointer accent-electric-500"
          />
          <div className="flex justify-between text-xs text-navy-500 mt-1">
            <span>2 teams</span>
            <span>15 teams</span>
          </div>
        </div>

        {/* Balancing Toggle */}
        <div className="mb-4 bg-white/5 rounded-xl p-5 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-navy-200">Catch-Up Mechanic</div>
              <div className="text-xs text-navy-400 mt-1">
                Leading teams may experience "plant failures" to keep the game competitive
              </div>
            </div>
            <button
              onClick={() => setBalancingEnabled(!balancingEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                balancingEnabled ? 'bg-electric-500' : 'bg-navy-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                balancingEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Bidding Guardrail Toggle */}
        <div className="mb-4 bg-white/5 rounded-xl p-5 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-navy-200">Bidding Guardrail</div>
              <div className="text-xs text-navy-400 mt-1">
                Shows warnings when assets have 0 MW bids or too much capacity at $0 &mdash; off by default to give teams full freedom
              </div>
            </div>
            <button
              onClick={() => setBiddingGuardrailEnabled(!biddingGuardrailEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                biddingGuardrailEnabled ? 'bg-electric-500' : 'bg-navy-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                biddingGuardrailEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* WiFi Configuration — Collapsible (persisted across restarts) */}
        <div className="mb-4 bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <button
            onClick={() => setShowWifiConfig(!showWifiConfig)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
          >
            <div className="text-left flex items-center gap-3">
              <span className="text-xl">📶</span>
              <div>
                <div className="text-sm font-medium text-navy-200">
                  WiFi for Teams
                  {wifiSaved && (
                    <span className="ml-2 text-xs text-green-400 font-normal">✓ Saved</span>
                  )}
                </div>
                <div className="text-xs text-navy-400 mt-0.5">
                  {wifiSaved ? `Network: ${wifiName}` : 'Set WiFi details so teams can connect before joining'}
                </div>
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-navy-400 transition-transform ${showWifiConfig ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showWifiConfig && (
            <div className="px-5 pb-5 border-t border-white/10">
              <div className="pt-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-navy-300 mb-1">Network Name (SSID)</label>
                  <input
                    type="text"
                    value={wifiName}
                    onChange={(e) => { setWifiName(e.target.value); setWifiSaved(false); }}
                    placeholder="e.g. Workshop-WiFi"
                    className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white focus:border-electric-500 focus:outline-none placeholder-navy-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy-300 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showWifiPassword ? 'text' : 'password'}
                      value={wifiPassword}
                      onChange={(e) => { setWifiPassword(e.target.value); setWifiSaved(false); }}
                      placeholder="WiFi password"
                      className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 pr-16 text-sm text-white focus:border-electric-500 focus:outline-none placeholder-navy-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowWifiPassword(!showWifiPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-navy-400 hover:text-white transition-colors px-1.5 py-0.5"
                    >
                      {showWifiPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleSaveWifi}
                    disabled={!wifiName.trim() || wifiLoading}
                    className="px-4 py-2 text-sm bg-electric-500/20 text-electric-300 hover:bg-electric-500/30 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                  >
                    {wifiLoading ? 'Saving...' : wifiSaved ? '✓ Saved' : 'Save WiFi'}
                  </button>
                  {wifiSaved && (
                    <button
                      onClick={handleDeleteWifi}
                      className="px-4 py-2 text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors font-medium"
                    >
                      🗑️ Delete All
                    </button>
                  )}
                </div>

                {/* WiFi QR Code for auto-connect */}
                {wifiSaved && wifiQrUrl && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-xs text-navy-300 mb-2 font-medium">📱 Scan to connect to WiFi</div>
                    <div className="flex items-start gap-4">
                      <div className="bg-white rounded-xl p-2 flex-shrink-0">
                        <img src={wifiQrUrl} alt="WiFi QR Code" className="w-32 h-32" />
                      </div>
                      <div className="text-xs text-navy-400 space-y-2">
                        <p className="text-navy-200 font-medium">How it works:</p>
                        <ul className="space-y-1 list-disc list-inside">
                          <li><strong>iPhones / iPads:</strong> Open Camera app → point at QR code → tap the notification to join WiFi</li>
                          <li><strong>Android:</strong> Open Camera or Google Lens → scan QR code → tap Connect</li>
                          <li><strong>Laptops:</strong> Show this QR to the room, or share the network name and password verbally</li>
                        </ul>
                        <p className="text-navy-500 italic">This QR code uses the standard WIFI: format that phones recognise natively — no app needed.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Asset Configuration — Collapsible */}
        <div className="mb-8 bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          {/* Header — click to expand */}
          <button
            onClick={() => setShowAssetConfig(!showAssetConfig)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
          >
            <div className="text-left">
              <div className="text-sm font-medium text-navy-200">Asset Configuration</div>
              <div className="text-xs text-navy-400 mt-0.5">
                Customise plant names, capacity (MW), and marginal costs
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-navy-400 transition-transform ${showAssetConfig ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAssetConfig && (
            <div className="px-5 pb-5 border-t border-white/10">
              {/* Use Custom Config Toggle */}
              <div className="flex items-center justify-between py-4">
                <div>
                  <div className="text-sm font-medium text-navy-200">Use Custom Asset Configuration</div>
                  <div className="text-xs text-navy-400 mt-0.5">
                    Override default Australian plant names and values
                  </div>
                </div>
                <button
                  onClick={() => setUseCustomConfig(!useCustomConfig)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    useCustomConfig ? 'bg-electric-500' : 'bg-navy-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    useCustomConfig ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {useCustomConfig && (
                <div className="space-y-4">
                  {/* Asset Rows */}
                  <div className="space-y-2">
                    {/* Header row */}
                    <div className="grid grid-cols-12 gap-2 text-[10px] uppercase tracking-wider text-navy-500 px-1">
                      <div className="col-span-2">Type</div>
                      <div className="col-span-4">Name</div>
                      <div className="col-span-3">Capacity (MW)</div>
                      <div className="col-span-3">Marginal Cost</div>
                    </div>

                    {ASSET_ROWS.map(row => {
                      const asset = assetConfig[row.type];
                      return (
                        <div key={row.type} className="grid grid-cols-12 gap-2 items-center bg-navy-800/50 rounded-lg px-2 py-2">
                          <div className="col-span-2 flex items-center gap-1.5">
                            <span className="text-sm">{row.icon}</span>
                            <span className="text-[11px] text-navy-300 font-medium">{row.label}</span>
                          </div>
                          <div className="col-span-4">
                            <input
                              type="text"
                              value={asset?.name || ''}
                              onChange={(e) => updateAsset(row.type, 'name', e.target.value)}
                              className="w-full bg-navy-700 border border-navy-600 rounded px-2 py-1.5 text-xs text-white focus:border-electric-500 focus:outline-none"
                              placeholder={row.label}
                            />
                          </div>
                          <div className="col-span-3">
                            <div className="relative">
                              <input
                                type="number"
                                min="1"
                                value={asset?.nameplateMW || 0}
                                onChange={(e) => updateAsset(row.type, 'nameplateMW', Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full bg-navy-700 border border-navy-600 rounded px-2 py-1.5 text-xs text-white font-mono focus:border-electric-500 focus:outline-none"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-navy-500">MW</span>
                            </div>
                          </div>
                          <div className="col-span-3">
                            {row.hasSrmc ? (
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-navy-500">$</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={asset?.srmcPerMWh ?? 0}
                                  onChange={(e) => updateAsset(row.type, 'srmcPerMWh', Math.max(0, parseInt(e.target.value) || 0))}
                                  className="w-full bg-navy-700 border border-navy-600 rounded pl-5 pr-10 py-1.5 text-xs text-white font-mono focus:border-electric-500 focus:outline-none"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-navy-500">/MWh</span>
                              </div>
                            ) : (
                              <div className="px-2 py-1.5 text-xs text-navy-500 italic">$0/MWh (fixed)</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Variation Toggle */}
                  <div className="flex items-center justify-between bg-navy-800/30 rounded-lg px-4 py-3">
                    <div>
                      <div className="text-xs font-medium text-navy-200">Apply SRMC variation across teams</div>
                      <div className="text-[11px] text-navy-500 mt-0.5">
                        When enabled, each team gets a slightly different marginal cost to create natural merit order diversity
                      </div>
                    </div>
                    <button
                      onClick={() => setApplyVariation(!applyVariation)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ml-3 ${
                        applyVariation ? 'bg-electric-500' : 'bg-navy-600'
                      }`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        applyVariation ? 'translate-x-[18px]' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  {/* Reset + Save */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleResetDefaults}
                      className="px-3 py-1.5 text-xs bg-navy-700 hover:bg-navy-600 text-navy-300 hover:text-white rounded-lg transition-colors"
                    >
                      Reset to Defaults
                    </button>
                    <div className="flex-1" />
                    <input
                      type="text"
                      value={configName}
                      onChange={(e) => setConfigName(e.target.value)}
                      placeholder="Preset name..."
                      className="w-40 bg-navy-700 border border-navy-600 rounded-lg px-3 py-1.5 text-xs text-white focus:border-electric-500 focus:outline-none placeholder-navy-500"
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveConfig()}
                    />
                    <button
                      onClick={handleSaveConfig}
                      disabled={!configName.trim()}
                      className="px-3 py-1.5 text-xs bg-electric-500/20 text-electric-300 hover:bg-electric-500/30 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Save Preset
                    </button>
                    {saveFeedback && (
                      <span className="text-xs text-green-400">{saveFeedback}</span>
                    )}
                  </div>

                  {/* Saved Configurations */}
                  {savedConfigs.length > 0 && (
                    <div className="pt-2">
                      <div className="text-xs text-navy-400 mb-2">Saved Presets</div>
                      <div className="space-y-1.5">
                        {savedConfigs.map(preset => (
                          <div
                            key={preset.id}
                            className="flex items-center justify-between bg-navy-800/40 rounded-lg px-3 py-2"
                          >
                            <div>
                              <div className="text-xs text-white font-medium">{preset.name}</div>
                              <div className="text-[10px] text-navy-500">
                                {new Date(preset.createdAt).toLocaleDateString()}
                                {preset.applyVariation ? ' · With variation' : ' · No variation'}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleLoadConfig(preset)}
                                className="px-2.5 py-1 text-[11px] bg-electric-500/20 text-electric-300 hover:bg-electric-500/30 rounded transition-colors"
                              >
                                Load
                              </button>
                              <button
                                onClick={() => handleDeleteConfig(preset.id)}
                                className="px-2 py-1 text-[11px] bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreate}
          disabled={!connected || creating}
          className="w-full py-4 bg-gradient-to-r from-electric-500 to-electric-600 hover:from-electric-400 hover:to-electric-500 text-white font-bold text-lg rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-electric-500/30 hover:shadow-electric-500/50"
        >
          {creating ? 'Creating Game...' : 'Create Game'}
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-3 py-2 text-navy-400 hover:text-white text-sm transition-colors"
        >
          &larr; Back to Home
        </button>
      </div>
    </div>
  );
}
