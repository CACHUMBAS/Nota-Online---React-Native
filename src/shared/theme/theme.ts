/**
 * Tokens de diseño. Los pares de texto y fondo se eligieron con ratio de contraste WCAG AA (≥ 4,5:1),
 * medido con un script (ver ADR-013). Cambiar un color aquí lo cambia en toda la app.
 */
export const colors = {
  background: '#F3F5FB',
  surface: '#FFFFFF',
  surfaceAlt: '#EAEEFB',
  text: '#16213E',
  textMuted: '#4A5578',
  primary: '#3B4BD8',
  primaryDark: '#2A37A8',
  primarySoft: '#E3E7FD',
  onPrimary: '#FFFFFF',
  border: '#D5DBEE',
  /** Borde de los campos de texto: más marcado para que se vea dónde escribir (≥ 3:1 sobre blanco). */
  borderStrong: '#7A86B2',
  danger: '#B3261E',
  dangerSoft: '#FDE7E5',
  success: '#146C34',
  successSoft: '#DDF3E4',
  warning: '#8A5300',
  warningSoft: '#FCEFD2',
  infoSoft: '#E3E7FD',
  pendingSoft: '#E9ECF5',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const radius = { sm: 10, md: 14, lg: 20 } as const;
export const fontSize = { caption: 12, small: 14, body: 16, title: 20, heading: 28, display: 44 } as const;

/** Tamaño mínimo cómodo para pulsar con el dedo. */
export const touchTarget = 48;

/** Sombras suaves (iOS usa shadow*, Android usa elevation). */
export const shadows = {
  card: {
    shadowColor: '#16213E',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#2A37A8',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
} as const;
