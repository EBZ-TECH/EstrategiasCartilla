import illustrationMap from './illustrationMap.json'

const activityPaths = illustrationMap.activities as Record<string, string>

const STEP = (name: string) => `/illustrations/steps/${name}`

/** Ilustraciones paso a paso con los dos personajes de la cartilla. */
export const STRATEGY_THEME_IMAGES: Array<{ keys: string[]; image: string }> = [
  {
    keys: ['rutina', 'horario', 'misma hora', 'secuencia', 'orden conocido', 'hábitos regulares'],
    image: STEP('step-rutina.jpg'),
  },
  {
    keys: ['autonomía', 'por sí', 'independiente', 'permitir que', 'elección', 'participación'],
    image: STEP('step-autonomia.jpg'),
  },
  {
    keys: ['seguridad', 'caída', 'piso', 'antideslizante', 'obstáculo', 'apoyo', 'barra'],
    image: STEP('step-seguridad.jpg'),
  },
  {
    keys: ['jabón', 'champú', 'toalla', 'higiene', 'aseo', 'lavado', 'cepill'],
    image: STEP('step-higiene.jpg'),
  },
  {
    keys: ['ropa', 'vest', 'prenda', 'camisa', 'pantalón', 'vestido'],
    image: STEP('step-vestir.jpg'),
  },
  {
    keys: ['comida', 'alimento', 'utensilio', 'mastic', 'tragar', 'comida', 'hidratación', 'nutric'],
    image: STEP('step-comida.jpg'),
  },
  {
    keys: ['medicamento', 'dosis', 'pastilla', 'tratamiento', 'píldora'],
    image: STEP('step-medicamentos.jpg'),
  },
  {
    keys: ['camin', 'movilidad', 'desplaz', 'ejercicio', 'actividad física', 'paseo'],
    image: STEP('step-movilidad.jpg'),
  },
  {
    keys: ['sueño', 'dormir', 'descanso', 'noche', 'cama', 'siesta'],
    image: STEP('step-sueno.jpg'),
  },
  {
    keys: ['familia', 'amigo', 'amistad', 'social', 'visita', 'grupo', 'comunidad', 'pareja'],
    image: STEP('step-social.jpg'),
  },
  {
    keys: ['acompañar', 'cuidar', 'cuidador', 'apoyo emocional', 'calma', 'paciencia'],
    image: STEP('step-cuidado.jpg'),
  },
  {
    keys: ['hogar', 'casa', 'orden', 'limpieza', 'organización', 'entorno'],
    image: STEP('step-hogar.jpg'),
  },
]

function findActivityPath(activityId: string, levelId?: string, occupationId?: string): string | undefined {
  if (levelId && occupationId) {
    const exact = activityPaths[`${levelId}/${occupationId}/${activityId}`]
    if (exact) return exact
  }

  const suffix = `/${activityId}`
  const match = Object.entries(activityPaths).find(([key]) => key.endsWith(suffix))
  return match?.[1]
}

export function getActivityImage(
  activityId: string,
  levelId?: string,
  occupationId?: string,
): string {
  return (
    findActivityPath(activityId, levelId, occupationId) ??
    STEP('step-cuidado.jpg')
  )
}

export function getStrategyImage(
  strategyText: string,
  activityId: string,
  levelId?: string,
  occupationId?: string,
): string {
  const lower = strategyText.toLowerCase()
  for (const theme of STRATEGY_THEME_IMAGES) {
    if (theme.keys.some((key) => lower.includes(key))) {
      return theme.image
    }
  }
  return getActivityImage(activityId, levelId, occupationId)
}

export function splitStrategyTitle(strategyText: string): { title: string; body: string } {
  const match = strategyText.match(/^([^:]{3,60}):\s*(.+)$/s)
  if (match) {
    return { title: match[1].trim(), body: match[2].trim() }
  }
  return { title: '', body: strategyText.trim() }
}
