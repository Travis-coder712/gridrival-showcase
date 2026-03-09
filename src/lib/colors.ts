import type { AssetType } from '../../shared/types';

export const ASSET_COLORS: Record<AssetType, string> = {
  coal: '#4a5568',
  gas_ccgt: '#ed8936',
  gas_peaker: '#f56565',
  hydro: '#4299e1',
  wind: '#48bb78',
  solar: '#ecc94b',
  battery: '#9f7aea',
};

export const ASSET_ICONS: Record<AssetType, string> = {
  coal: '🏭',
  gas_ccgt: '🔥',
  gas_peaker: '⚡',
  hydro: '💧',
  wind: '🌬️',
  solar: '☀️',
  battery: '🔋',
};

export const TEAM_COLORS = [
  '#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#319795',
  '#3182ce', '#5a67d8', '#805ad5', '#d53f8c', '#e53e3e',
  '#c05621', '#2f855a', '#2b6cb0', '#6b46c1', '#b83280',
];
