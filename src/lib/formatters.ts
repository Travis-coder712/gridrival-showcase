export function formatCurrency(value: number): string {
  const rounded = Math.round(value);
  return rounded < 0
    ? `-$${Math.abs(rounded).toLocaleString('en-AU')}`
    : `$${rounded.toLocaleString('en-AU')}`;
}

export function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMW(value: number): string {
  return `${Math.round(value)} MW`;
}

export function formatMWh(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)} GWh`;
  }
  return `${Math.round(value)} MWh`;
}

export function formatPrice(value: number): string {
  const rounded = Math.round(value);
  const formatted = rounded < 0
    ? `-$${Math.abs(rounded).toLocaleString('en-AU')}`
    : `$${rounded.toLocaleString('en-AU')}`;
  return `${formatted}/MWh`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/** Format a number with commas (e.g. 1,234 or 1,234,567) */
export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString('en-AU');
}

/** Format a dollar amount per MWh (e.g. $1,234/MWh) */
export function formatDollarPerMWh(value: number): string {
  const rounded = Math.round(value);
  const formatted = rounded < 0
    ? `-$${Math.abs(rounded).toLocaleString('en-AU')}`
    : `$${rounded.toLocaleString('en-AU')}`;
  return `${formatted}/MWh`;
}
