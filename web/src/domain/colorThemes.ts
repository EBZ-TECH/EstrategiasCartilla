export type LevelTheme = {
  id: string
  primary: string
  soft: string
  accent: string
  ink: string
}

/** Temática de color por nivel cognitivo. */
export const LEVEL_THEMES: Record<string, LevelTheme> = {
  normal: {
    id: 'normal',
    primary: '#1F8A70',
    soft: '#E7F7F2',
    accent: '#F2C94C',
    ink: '#0F3D33',
  },
  leve: {
    id: 'leve',
    primary: '#2F6FE0',
    soft: '#EAF1FC',
    accent: '#7EB6FF',
    ink: '#14356E',
  },
  moderado: {
    id: 'moderado',
    primary: '#D9920B',
    soft: '#FFF6E5',
    accent: '#F2C14E',
    ink: '#6B4505',
  },
  severo: {
    id: 'severo',
    primary: '#D64545',
    soft: '#FDECEC',
    accent: '#F0A0A0',
    ink: '#6E1C1C',
  },
}

/** Color base por área ocupacional. */
export const OCCUPATION_TONES: Record<string, string> = {
  avd: '#2A9D8F',
  aivd: '#457B9D',
  salud: '#E76F51',
  descanso: '#7B68A6',
  trabajo: '#2D6A4F',
  ocio: '#E9A825',
  social: '#9B5DE5',
}

const DEFAULT_THEME: LevelTheme = {
  id: 'default',
  primary: '#1F8A70',
  soft: '#EAF7F3',
  accent: '#F2C94C',
  ink: '#12233F',
}

export function getLevelTheme(levelId?: string): LevelTheme {
  if (!levelId) return DEFAULT_THEME
  return LEVEL_THEMES[levelId] ?? DEFAULT_THEME
}

export function getOccupationTone(occupationId?: string, levelId?: string): string {
  if (occupationId && OCCUPATION_TONES[occupationId]) {
    return OCCUPATION_TONES[occupationId]
  }
  return getLevelTheme(levelId).primary
}

/** Variación suave por actividad dentro del área. */
export function getActivityTone(
  occupationId: string | undefined,
  activityIndex: number,
  levelId?: string,
): string {
  const base = getOccupationTone(occupationId, levelId)
  const shift = ((activityIndex % 5) - 2) * 6
  return shiftHexLightness(base, shift)
}

function shiftHexLightness(hex: string, amount: number): string {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  const num = Number.parseInt(full, 16)
  let r = (num >> 16) & 255
  let g = (num >> 8) & 255
  let b = num & 255
  r = Math.max(0, Math.min(255, r + amount))
  g = Math.max(0, Math.min(255, g + amount))
  b = Math.max(0, Math.min(255, b + amount))
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}
