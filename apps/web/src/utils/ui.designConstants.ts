export const COLORS = {
  primary: 'var(--color-primary)',
  primarySoft: 'var(--color-primary-soft)',
  secondary: 'var(--color-secondary)',
  secondarySoft: 'var(--color-secondary-soft)',
  button: {
    border: 'var(--color-accent-card)',
    bg: 'var(--color-surface-card)',
    active: {
      border: 'var(--color-accent-button)',
      bg: 'var(--color-surface-card)',
    },
  },
  card: {
    border: 'var(--color-accent-card)',
    bg: 'var(--color-surface-card)',
  },
  text: {
    primary: 'var(--color-text-primary)',
    muted: 'var(--color-text-muted)',
  },
} as const;

export const BEVEL_CONSTANTS = {
  layerOffset: 4,
} as const;

export const OPACITY_VALUES = {
  border: {
    simple: 0.7,
    inner: 0.4,
  },
} as const;

export const LAYERED_BORDER = {
  innerBevelMultiplier: 0.75,
  innerInset: 4,
  innerStrokeMultiplier: 0.6,
  innerOpacity: 0.5,
} as const;

export const FILLED_GRADIENTS = {
  primary: {
    top: 'rgba(120,230,250,1)',
    middle: 'rgba(34,211,238,1)',
    bottom: 'rgba(25,180,210,1)',
    glow: 'rgba(34,211,238,0.5)',
  },
  secondary: {
    top: 'rgba(250,140,245,1)',
    middle: 'rgba(233,70,225,1)',
    bottom: 'rgba(200,60,195,1)',
    glow: 'rgba(233,70,225,0.5)',
  },
  shimmer: {
    transparent: 'rgba(255,255,255,0)',
    opaque: 'rgba(255,255,255,0.4)',
  },
} as const;

export const COMPONENT_DEFAULTS = {
  borderWidth: 1,
  button: {
    paddingInline: 24,
    paddingBlock: 12,
    innerPadding: 10,
  },
  card: {
    paddingInline: 24,
    paddingBlock: 16,
  },
} as const;
