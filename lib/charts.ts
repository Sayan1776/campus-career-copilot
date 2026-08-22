/**
 * Chart theme — every visualization reads from the same instrument
 * palette; no chart picks its own colors again.
 */
export const chart = {
  ink: '#16233B',
  instrument: '#E8501A',
  pass: '#1E7A55',
  warn: '#96660F',
  info: '#2E6E8E',
  neutral: '#8A97AB',
  grid: '#D7E0EC',
  axis: '#5B6B84',
  sheet: '#FFFFFF',
} as const;

export const severityColor = (severity: string) => {
  const s = (severity || '').toLowerCase();
  if (s === 'high') return chart.instrument;
  if (s === 'medium') return chart.warn;
  return chart.neutral;
};

export const axisProps = {
  stroke: chart.axis,
  fontSize: 11,
  fontFamily: 'var(--font-mono), ui-monospace, monospace',
  tickLine: false,
} as const;

export const gridStrokeProps = {
  stroke: chart.grid,
  strokeDasharray: '1 0',
} as const;
