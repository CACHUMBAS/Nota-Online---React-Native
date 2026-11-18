export const colors = {
  background: '#f5f7fb',
  surface: '#ffffff',
  text: '#172947',
  textMuted: '#52627d',
  primary: '#2f5bea',
  onPrimary: '#ffffff',
  border: '#ccd5e4',
  danger: '#b3261e',
  dangerSoft: '#fdecea',
  success: '#17692f',
  successSoft: '#e4f3e8',
  infoSoft: '#e6edfc',
  pendingSoft: '#e9ecf2',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 16 } as const;
export const fontSize = { small: 14, body: 16, title: 20, heading: 28 } as const;

/** Tamaño mínimo cómodo para pulsar con el dedo. */
export const touchTarget = 48;
