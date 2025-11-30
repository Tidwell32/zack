export const CHART_PALETTE = {
  // Core theme colors
  cyan: '#22d3ee',
  magenta: '#e946e1',
  purple: '#7031c7',

  // Similar vibe colors
  amber: '#f59e0b',
  emerald: '#10b981',
  rose: '#f43f5e',
  violet: '#8b5cf6',
  sky: '#0ea5e9',
  lime: '#84cc16',
  fuchsia: '#d946ef',
  orange: '#f97316',
  teal: '#14b8a6',
} as const;

export const SERIES_COLORS = [
  CHART_PALETTE.cyan,
  CHART_PALETTE.magenta,
  CHART_PALETTE.amber,
  CHART_PALETTE.emerald,
  CHART_PALETTE.violet,
  CHART_PALETTE.rose,
  CHART_PALETTE.sky,
  CHART_PALETTE.lime,
  CHART_PALETTE.orange,
  CHART_PALETTE.teal,
  CHART_PALETTE.fuchsia,
  CHART_PALETTE.purple,
] as const;

export const CHART_COLORS = {
  primary: CHART_PALETTE.cyan,
  secondary: CHART_PALETTE.magenta,
  tertiary: CHART_PALETTE.purple,
  series: SERIES_COLORS,
  grid: '#1e293b',
  axis: '#7b8a97',
  axisLine: '#1e293b',
  tooltip: {
    bg: 'rgba(15, 20, 47, 0.95)',
    border: '#22d3ee',
    text: '#d9e2ec',
    label: '#22d3ee',
  },
  areaFill: {
    primary: 'rgba(34, 211, 238, 0.2)',
    secondary: 'rgba(233, 70, 225, 0.2)',
    tertiary: 'rgba(112, 49, 199, 0.2)',
  },
} as const;

export const CHART_STYLES = {
  margin: {
    top: 10,
    right: 30,
    left: 10,
    bottom: 10,
  },

  marginDualAxis: {
    top: 10,
    right: 60,
    left: 10,
    bottom: 10,
  },

  grid: {
    strokeDasharray: '3 3',
    strokeOpacity: 0.3,
  },

  axis: {
    fontSize: 12,
    tickLine: false,
    axisLine: false,
  },

  stroke: {
    width: 2,
    activeDotRadius: 6,
    dotRadius: 3,
  },

  scatter: {
    size: 64,
    sizeRange: [40, 400] as [number, number],
  },

  animation: {
    duration: 300,
    easing: 'ease-out' as const,
  },
} as const;

export const CHART_ASPECT_RATIO = 1.618;
