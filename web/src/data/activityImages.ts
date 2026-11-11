/**
 * Fotos de Unsplash (licencia libre para uso).
 * https://unsplash.com/license
 */

const u = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const ACTIVITY_IMAGES: Record<string, string> = {
  bath: u('photo-1507652313519-d4e9174996dd'), // baño / ducha
  toilet: u('photo-1584622650111-993a426fbf0a'), // baño aseo
  dress: u('photo-1489987707025-afc232f7ea0f'), // ropa / vestirse
  eat: u('photo-1512621776951-a57141f2eefd'), // comida / comer
  food: u('photo-1498837167922-ddd27525d352'), // alimentación
  walk: u('photo-1571019613454-1cb2f99b2d8b'), // movilidad / caminar
  hygiene: u('photo-1556228578-0d85b1a4d571'), // higiene personal
  heart: u('photo-1516589178581-6cd7833ae3b2'), // afecto / pareja
  care: u('photo-1576765608535-5f04d1e3f289'), // cuidado de otros
  pet: u('photo-1548199973-03cce0bbc87b'), // mascotas
  child: u('photo-1503454537195-1dcabb73ffb9'), // niños
  phone: u('photo-1511707171634-5f897ff02aa9'), // comunicación
  car: u('photo-1449965408869-eaa3f722e40d'), // movilidad comunidad
  money: u('photo-1554224155-6726b3ff858f'), // finanzas
  home: u('photo-1560448204-e02f11c3d0e2'), // hogar
  cook: u('photo-1556909114-f6e7ad7d3136'), // cocina / limpieza
  pray: u('photo-1507692049790-de58290a4334'), // espiritualidad
  shield: u('photo-1558618666-fcd25c85cd64'), // seguridad hogar
  shop: u('photo-1578911373434-0cb395d2cbfb'), // compras
  health: u('photo-1576091160399-112ba8d25d1d'), // salud emocional/social
  symptom: u('photo-1579684385127-1ef15d508118'), // síntomas
  clinic: u('photo-1519494026892-80bbd2d6fd0d'), // sistema de salud
  pills: u('photo-1584308666744-24d5c474f2ae'), // medicamentos
  exercise: u('photo-1571019614242-c5c5dee9f50b'), // actividad física
  nutrition: u('photo-1490645935967-10de6ba17061'), // nutricional
  device: u('photo-1576091160550-2173dba999ef'), // dispositivos cuidado
  rest: u('photo-1506126613408-eca07ce68773'), // descanso
  bed: u('photo-1631049307264-da0ec9d70304'), // preparación sueño
  sleep: u('photo-1541781774459-bb2af2f05b55'), // sueño
  work: u('photo-1454165804606-c3d57bc86b40'), // trabajo
  job: u('photo-1486312338219-ce68d2c6f44d'), // búsqueda empleo
  retire: u('photo-1469571486292-0ba18fe07589'), // jubilación
  volunteer: u('photo-1559027615-cd4628902d4a'), // voluntariado
  leisure: u('photo-1513475382585-d06e58bcb0e0'), // exploración ocio
  play: u('photo-1511379938547-c1f69419868d'), // participación ocio
  community: u('photo-1511632765486-a01980e01a18'), // comunitaria
  family: u('photo-1511895426328-dc8714191300'), // familiar
  friends: u('photo-1529156069898-49953e39b3ac'), // amistades
  couple: u('photo-1516589178581-6cd7833ae3b2'), // pareja
  group: u('photo-1529156069898-49953e39b3ac'), // grupo pares
  default: u('photo-1576765608535-5f04d1e3f289'),
}

/** Imágenes temáticas para consejos (por palabra clave). */
export const STRATEGY_THEME_IMAGES: Array<{ keys: string[]; image: string }> = [
  {
    keys: ['rutina', 'horario', 'misma hora', 'secuencia', 'orden conocido'],
    image: u('photo-1501139083538-0139583c060f'),
  },
  {
    keys: ['autonomía', 'por sí', 'independiente', 'permitir que'],
    image: u('photo-1576765608535-5f04d1e3f289'),
  },
  {
    keys: ['seguridad', 'caída', 'piso', 'antideslizante', 'obstáculo'],
    image: u('photo-1584622650111-993a426fbf0a'),
  },
  {
    keys: ['jabón', 'champú', 'toalla', 'elementos', 'productos'],
    image: u('photo-1556228578-0d85b1a4d571'),
  },
  {
    keys: ['ropa', 'vest', 'prenda', 'camisa', 'pantalón'],
    image: u('photo-1489987707025-afc232f7ea0f'),
  },
  {
    keys: ['comida', 'alimento', 'utensilio', 'mastic', 'tragar'],
    image: u('photo-1512621776951-a57141f2eefd'),
  },
  {
    keys: ['medicamento', 'dosis', 'pastilla', 'tratamiento'],
    image: u('photo-1584308666744-24d5c474f2ae'),
  },
  {
    keys: ['camin', 'desplaz', 'movilidad', 'paseo'],
    image: u('photo-1571019613454-1cb2f99b2d8b'),
  },
  {
    keys: ['sueño', 'dormir', 'noche', 'cama', 'acost'],
    image: u('photo-1541781774459-bb2af2f05b55'),
  },
  {
    keys: ['descanso', 'reposo', 'pausa'],
    image: u('photo-1506126613408-eca07ce68773'),
  },
  {
    keys: ['familia', 'familiar'],
    image: u('photo-1511895426328-dc8714191300'),
  },
  {
    keys: ['amigo', 'amistad', 'social'],
    image: u('photo-1529156069898-49953e39b3ac'),
  },
]

const ACTIVITY_ALIASES: Record<string, string> = {
  'bano-y-ducha': 'bath',
  'banarse-y-ducha': 'bath',
  'higiene-del-bano-y-del-aseo': 'toilet',
  vestirse: 'dress',
  'comer-y-tragar': 'eat',
  alimentacion: 'food',
  'movilidad-funcional': 'walk',
  'higiene-personal-y-aseo': 'hygiene',
  'actividad-sexual': 'heart',
  'cuidado-de-otros': 'care',
  'cuidado-de-mascotas-y-animales': 'pet',
  'crianza-de-los-ninos': 'child',
  'gestion-de-la-comunicacion': 'phone',
  'conduccion-y-movilidad-en-la-comunidad': 'car',
  'conduccion-y-movilidad-de-la-comunidad': 'car',
  'gestion-financiera': 'money',
  'establecimiento-y-gestion-del-hogar': 'home',
  'preparacion-de-la-comida-y-limpieza': 'cook',
  'expresion-religiosa-y-espiritual': 'pray',
  'mantenimiento-de-la-seguridad': 'shield',
  'mantenimiento-de-seguridad': 'shield',
  compras: 'shop',
  'promocion-y-mantenimiento-de-la-salud-social-y-emocional': 'health',
  'manejo-de-sintomas-y-afecciones': 'symptom',
  'comunicacion-con-el-sistema-de-salud': 'clinic',
  'manejo-de-medicamentos': 'pills',
  'actividad-fisica': 'exercise',
  'manejo-nutricional': 'nutrition',
  'manejo-de-dispositivos-de-cuidado-personal': 'device',
  descanso: 'rest',
  'preparacion-del-sueno': 'bed',
  'participacion-del-sueno': 'sleep',
  'interes-y-persecucion-laboral': 'work',
  'busqueda-y-adquisicion-de-empleo': 'job',
  'rendimiento-en-el-trabajo-y-su-mantenimiento': 'work',
  'preparacion-y-ajuste-de-la-jubilacion': 'retire',
  'exploracion-de-voluntariados': 'volunteer',
  'participacion-en-voluntariados': 'volunteer',
  'exploracion-del-ocio': 'leisure',
  'participacion-del-ocio': 'play',
  'participacion-en-el-ocio': 'play',
  'participacion-comunitaria': 'community',
  'participacion-familiar': 'family',
  amistades: 'friends',
  'relaciones-intimas-de-pareja': 'couple',
  'participacion-en-grupo-de-pares': 'group',
}

export function getActivityImage(activityId: string): string {
  const key = ACTIVITY_ALIASES[activityId] ?? ACTIVITY_ALIASES[activityId.replace(/-\d+$/, '')]
  return ACTIVITY_IMAGES[key] ?? ACTIVITY_IMAGES.default
}

export function getStrategyImage(strategyText: string, activityId: string): string {
  const lower = strategyText.toLowerCase()
  for (const theme of STRATEGY_THEME_IMAGES) {
    if (theme.keys.some((key) => lower.includes(key))) {
      return theme.image
    }
  }
  return getActivityImage(activityId)
}

export function splitStrategyTitle(strategyText: string): { title: string; body: string } {
  const match = strategyText.match(/^([^:]{3,60}):\s*(.+)$/s)
  if (match) {
    return { title: match[1].trim(), body: match[2].trim() }
  }
  return { title: '', body: strategyText.trim() }
}
