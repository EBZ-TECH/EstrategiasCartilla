/** Ilustraciones SVG propias (sin derechos de autor) por actividad. */

import type { ReactNode } from 'react'

type VisualKey =
  | 'bath'
  | 'toilet'
  | 'dress'
  | 'eat'
  | 'food'
  | 'walk'
  | 'hygiene'
  | 'heart'
  | 'care'
  | 'pet'
  | 'child'
  | 'phone'
  | 'car'
  | 'money'
  | 'home'
  | 'cook'
  | 'pray'
  | 'shield'
  | 'shop'
  | 'health'
  | 'symptom'
  | 'clinic'
  | 'pills'
  | 'exercise'
  | 'nutrition'
  | 'device'
  | 'rest'
  | 'bed'
  | 'sleep'
  | 'work'
  | 'job'
  | 'retire'
  | 'volunteer'
  | 'leisure'
  | 'play'
  | 'community'
  | 'family'
  | 'friends'
  | 'couple'
  | 'group'
  | 'default'

const ALIASES: Record<string, VisualKey> = {
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

function resolveKey(activityId: string): VisualKey {
  if (ALIASES[activityId]) return ALIASES[activityId]
  const base = activityId.replace(/-\d+$/, '')
  return ALIASES[base] ?? 'default'
}

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 64 64" className="activity-visual__svg" aria-hidden="true">
      {children}
    </svg>
  )
}

function VisualArtwork({ kind }: { kind: VisualKey }) {
  switch (kind) {
    case 'bath':
      return (
        <Svg>
          <rect x="10" y="18" width="44" height="34" rx="8" fill="#7EB6FF" />
          <path d="M18 28h28v18H18z" fill="#EAF4FF" />
          <circle cx="46" cy="22" r="5" fill="#1C5AA6" />
          <path d="M14 40c6 6 30 6 36 0" stroke="#1C5AA6" strokeWidth="3" fill="none" />
        </Svg>
      )
    case 'toilet':
      return (
        <Svg>
          <rect x="18" y="12" width="28" height="14" rx="4" fill="#B7C7DB" />
          <path d="M16 28h32v18a10 10 0 0 1-10 10H26a10 10 0 0 1-10-10V28z" fill="#EAF4FF" />
          <rect x="22" y="32" width="20" height="10" rx="5" fill="#1C5AA6" />
        </Svg>
      )
    case 'dress':
      return (
        <Svg>
          <path d="M22 14h8l2 8h-4l-6 24h20l-6-24h-4l2-8h8l6 10v4H16v-4l6-10z" fill="#F2A012" />
          <circle cx="26" cy="12" r="3" fill="#12233F" />
          <circle cx="38" cy="12" r="3" fill="#12233F" />
        </Svg>
      )
    case 'eat':
      return (
        <Svg>
          <ellipse cx="32" cy="36" rx="18" ry="12" fill="#E7EFFA" stroke="#1C5AA6" strokeWidth="3" />
          <circle cx="26" cy="34" r="4" fill="#E53935" />
          <circle cx="36" cy="32" r="3.5" fill="#43A047" />
          <path d="M48 14v28M52 14v12M44 14v12" stroke="#12233F" strokeWidth="3" strokeLinecap="round" />
        </Svg>
      )
    case 'food':
      return (
        <Svg>
          <rect x="14" y="22" width="36" height="26" rx="6" fill="#FFE0A3" />
          <path d="M20 22c0-8 24-8 24 0" fill="#F2A012" />
          <circle cx="32" cy="34" r="6" fill="#E53935" />
        </Svg>
      )
    case 'walk':
      return (
        <Svg>
          <circle cx="34" cy="14" r="6" fill="#12233F" />
          <path
            d="M34 20 28 34l-8 4M28 34l8 6 8 10M36 28l10 4 6-8"
            stroke="#1C5AA6"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'hygiene':
      return (
        <Svg>
          <rect x="26" y="10" width="12" height="18" rx="6" fill="#7EB6FF" />
          <path d="M20 28h24l-3 24H23L20 28z" fill="#EAF4FF" stroke="#1C5AA6" strokeWidth="3" />
          <path d="M28 40h8" stroke="#1C5AA6" strokeWidth="3" strokeLinecap="round" />
        </Svg>
      )
    case 'heart':
      return (
        <Svg>
          <path
            d="M32 50 14 32a12 12 0 0 1 18-16 12 12 0 0 1 18 16L32 50z"
            fill="#E53935"
          />
        </Svg>
      )
    case 'care':
      return (
        <Svg>
          <circle cx="24" cy="18" r="7" fill="#12233F" />
          <circle cx="42" cy="20" r="6" fill="#5A6B82" />
          <path d="M10 50c2-12 12-16 14-16s10 2 12 10c2-6 8-10 12-10 4 0 8 4 8 16" fill="#7EB6FF" />
        </Svg>
      )
    case 'pet':
      return (
        <Svg>
          <ellipse cx="32" cy="36" rx="16" ry="12" fill="#C48A4A" />
          <circle cx="22" cy="22" r="6" fill="#C48A4A" />
          <circle cx="42" cy="22" r="6" fill="#C48A4A" />
          <circle cx="27" cy="34" r="2" fill="#12233F" />
          <circle cx="37" cy="34" r="2" fill="#12233F" />
          <ellipse cx="32" cy="40" rx="4" ry="3" fill="#12233F" />
        </Svg>
      )
    case 'child':
      return (
        <Svg>
          <circle cx="32" cy="18" r="8" fill="#F2A012" />
          <path d="M18 52c2-14 8-18 14-18s12 4 14 18" fill="#7EB6FF" />
          <circle cx="18" cy="30" r="4" fill="#F2A012" />
          <circle cx="46" cy="30" r="4" fill="#F2A012" />
        </Svg>
      )
    case 'phone':
      return (
        <Svg>
          <rect x="20" y="8" width="24" height="48" rx="6" fill="#12233F" />
          <rect x="24" y="14" width="16" height="28" rx="2" fill="#EAF4FF" />
          <circle cx="32" cy="50" r="3" fill="#F2A012" />
        </Svg>
      )
    case 'car':
      return (
        <Svg>
          <path d="M12 36 18 22h28l6 14v10H12V36z" fill="#1C5AA6" />
          <rect x="20" y="24" width="10" height="8" rx="2" fill="#EAF4FF" />
          <rect x="34" y="24" width="10" height="8" rx="2" fill="#EAF4FF" />
          <circle cx="20" cy="46" r="5" fill="#12233F" />
          <circle cx="44" cy="46" r="5" fill="#12233F" />
        </Svg>
      )
    case 'money':
      return (
        <Svg>
          <rect x="10" y="18" width="44" height="28" rx="6" fill="#43A047" />
          <circle cx="32" cy="32" r="9" fill="#EAF4FF" />
          <path d="M32 25v14M28 29h7c2 0 3 1 3 3s-1 3-3 3h-8" stroke="#43A047" strokeWidth="3" fill="none" />
        </Svg>
      )
    case 'home':
      return (
        <Svg>
          <path d="M8 30 32 12l24 18v22H8V30z" fill="#F2A012" />
          <rect x="26" y="34" width="12" height="18" fill="#EAF4FF" />
          <rect x="14" y="34" width="10" height="10" fill="#EAF4FF" />
        </Svg>
      )
    case 'cook':
      return (
        <Svg>
          <ellipse cx="32" cy="42" rx="18" ry="8" fill="#5A6B82" />
          <path d="M14 42c0-14 8-22 18-22s18 8 18 22" fill="#E53935" />
          <path d="M24 20c0-8 16-8 16 0" stroke="#12233F" strokeWidth="3" fill="none" />
        </Svg>
      )
    case 'pray':
      return (
        <Svg>
          <path d="M32 8 36 24h16L40 34l6 16-14-10-14 10 6-16L12 24h16L32 8z" fill="#F2A012" />
        </Svg>
      )
    case 'shield':
      return (
        <Svg>
          <path d="M32 8 52 16v16c0 14-8 22-20 26C20 54 12 46 12 32V16L32 8z" fill="#1C5AA6" />
          <path d="M24 32l6 6 12-14" stroke="#EAF4FF" strokeWidth="4" fill="none" strokeLinecap="round" />
        </Svg>
      )
    case 'shop':
      return (
        <Svg>
          <path d="M16 20h32l-4 28H20L16 20z" fill="#F2A012" />
          <path d="M22 20c0-8 20-8 20 0" stroke="#12233F" strokeWidth="4" fill="none" />
          <circle cx="24" cy="48" r="3" fill="#12233F" />
          <circle cx="40" cy="48" r="3" fill="#12233F" />
        </Svg>
      )
    case 'health':
      return (
        <Svg>
          <circle cx="32" cy="32" r="20" fill="#E7EFFA" />
          <path d="M32 18v28M18 32h28" stroke="#E53935" strokeWidth="6" strokeLinecap="round" />
        </Svg>
      )
    case 'symptom':
      return (
        <Svg>
          <circle cx="32" cy="32" r="20" fill="#FFE0A3" />
          <circle cx="24" cy="28" r="3" fill="#12233F" />
          <circle cx="40" cy="28" r="3" fill="#12233F" />
          <path d="M24 42c4-6 12-6 16 0" stroke="#12233F" strokeWidth="3" fill="none" />
        </Svg>
      )
    case 'clinic':
      return (
        <Svg>
          <rect x="12" y="18" width="40" height="34" rx="4" fill="#EAF4FF" stroke="#1C5AA6" strokeWidth="3" />
          <path d="M32 10v12M26 16h12" stroke="#E53935" strokeWidth="4" strokeLinecap="round" />
          <rect x="22" y="36" width="20" height="16" fill="#1C5AA6" />
        </Svg>
      )
    case 'pills':
      return (
        <Svg>
          <rect x="12" y="24" width="22" height="14" rx="7" fill="#E53935" />
          <rect x="30" y="24" width="22" height="14" rx="7" fill="#EAF4FF" stroke="#1C5AA6" strokeWidth="3" />
          <circle cx="24" cy="44" r="6" fill="#F2A012" />
          <circle cx="40" cy="48" r="5" fill="#43A047" />
        </Svg>
      )
    case 'exercise':
      return (
        <Svg>
          <rect x="8" y="26" width="10" height="12" rx="3" fill="#12233F" />
          <rect x="46" y="26" width="10" height="12" rx="3" fill="#12233F" />
          <rect x="18" y="30" width="28" height="4" rx="2" fill="#1C5AA6" />
          <circle cx="32" cy="18" r="5" fill="#F2A012" />
        </Svg>
      )
    case 'nutrition':
      return (
        <Svg>
          <path d="M32 10c10 10 16 18 16 28a16 16 0 0 1-32 0c0-10 6-18 16-28z" fill="#43A047" />
          <path d="M32 10c0 8-4 12-8 16" stroke="#EAF4FF" strokeWidth="3" fill="none" />
        </Svg>
      )
    case 'device':
      return (
        <Svg>
          <circle cx="32" cy="32" r="16" fill="#EAF4FF" stroke="#1C5AA6" strokeWidth="4" />
          <circle cx="32" cy="32" r="6" fill="#1C5AA6" />
          <path d="M20 20 14 14M44 20l6-6M20 44l-6 6M44 44l6 6" stroke="#F2A012" strokeWidth="3" />
        </Svg>
      )
    case 'rest':
      return (
        <Svg>
          <path d="M12 40h40v8H12z" fill="#5A6B82" />
          <path d="M16 40c0-10 8-16 16-16s16 6 16 16" fill="#7EB6FF" />
          <circle cx="44" cy="18" r="8" fill="#F2A012" opacity="0.7" />
        </Svg>
      )
    case 'bed':
      return (
        <Svg>
          <path d="M8 38h48v10H8z" fill="#1C5AA6" />
          <path d="M12 38v-8h18c8 0 14 4 14 8" fill="#EAF4FF" />
          <rect x="12" y="24" width="12" height="8" rx="3" fill="#F2A012" />
        </Svg>
      )
    case 'sleep':
      return (
        <Svg>
          <path d="M40 18a14 14 0 1 0 8 22 18 18 0 1 1-8-22z" fill="#1C5AA6" />
          <path d="M46 12h6l-6 6h6M50 24h5l-5 5h5" stroke="#F2A012" strokeWidth="3" fill="none" />
        </Svg>
      )
    case 'work':
      return (
        <Svg>
          <rect x="12" y="24" width="40" height="26" rx="4" fill="#1C5AA6" />
          <path d="M24 24v-4a8 8 0 0 1 16 0v4" stroke="#12233F" strokeWidth="4" fill="none" />
          <rect x="28" y="34" width="8" height="6" rx="2" fill="#F2A012" />
        </Svg>
      )
    case 'job':
      return (
        <Svg>
          <rect x="10" y="14" width="34" height="40" rx="4" fill="#EAF4FF" stroke="#1C5AA6" strokeWidth="3" />
          <path d="M18 24h18M18 32h18M18 40h12" stroke="#1C5AA6" strokeWidth="3" />
          <circle cx="46" cy="44" r="10" fill="#F2A012" />
          <path d="M46 38v12M40 44h12" stroke="#fff" strokeWidth="3" />
        </Svg>
      )
    case 'retire':
      return (
        <Svg>
          <circle cx="32" cy="18" r="8" fill="#12233F" />
          <path d="M16 54c2-14 8-20 16-20s14 6 16 20" fill="#7EB6FF" />
          <path d="M44 28c8 2 12 10 12 18" stroke="#F2A012" strokeWidth="4" fill="none" />
        </Svg>
      )
    case 'volunteer':
      return (
        <Svg>
          <path d="M32 48 14 30a10 10 0 0 1 14-14l4 4 4-4a10 10 0 0 1 14 14L32 48z" fill="#E53935" />
          <path d="M20 48h24v6H20z" fill="#1C5AA6" />
        </Svg>
      )
    case 'leisure':
      return (
        <Svg>
          <circle cx="32" cy="32" r="18" fill="#FFE0A3" />
          <path d="M32 14v8M32 42v8M14 32h8M42 32h8M20 20l6 6M38 38l6 6M44 20l-6 6M26 38l-6 6" stroke="#F2A012" strokeWidth="3" />
        </Svg>
      )
    case 'play':
      return (
        <Svg>
          <rect x="10" y="18" width="44" height="30" rx="6" fill="#1C5AA6" />
          <path d="M28 26v14l14-7-14-7z" fill="#F2A012" />
        </Svg>
      )
    case 'community':
      return (
        <Svg>
          <path d="M8 48 20 24h8l4 8 4-8h8l12 24H8z" fill="#43A047" />
          <rect x="28" y="34" width="8" height="14" fill="#EAF4FF" />
        </Svg>
      )
    case 'family':
      return (
        <Svg>
          <circle cx="22" cy="18" r="6" fill="#12233F" />
          <circle cx="42" cy="18" r="6" fill="#12233F" />
          <circle cx="32" cy="28" r="5" fill="#F2A012" />
          <path d="M8 52c2-12 8-16 14-16s10 6 10 12c0-8 5-14 12-14s12 6 12 18" fill="#7EB6FF" />
        </Svg>
      )
    case 'friends':
      return (
        <Svg>
          <circle cx="22" cy="22" r="8" fill="#1C5AA6" />
          <circle cx="42" cy="22" r="8" fill="#F2A012" />
          <path d="M8 52c2-12 8-16 14-16s12 4 14 12c2-10 8-14 14-14s12 6 12 18" fill="#E7EFFA" stroke="#1C5AA6" strokeWidth="2" />
        </Svg>
      )
    case 'couple':
      return (
        <Svg>
          <circle cx="24" cy="18" r="7" fill="#12233F" />
          <circle cx="40" cy="18" r="7" fill="#12233F" />
          <path d="M10 50c2-14 8-18 14-18s10 6 12 12c2-8 7-14 14-14s12 8 12 20" fill="#E53935" opacity="0.85" />
        </Svg>
      )
    case 'group':
      return (
        <Svg>
          <circle cx="18" cy="20" r="6" fill="#1C5AA6" />
          <circle cx="32" cy="16" r="7" fill="#F2A012" />
          <circle cx="46" cy="20" r="6" fill="#43A047" />
          <path d="M6 52c2-12 8-16 12-16s10 4 12 10c2-8 6-12 12-12s10 4 12 18" fill="#E7EFFA" stroke="#1C5AA6" strokeWidth="2" />
        </Svg>
      )
    default:
      return (
        <Svg>
          <rect x="12" y="12" width="40" height="40" rx="12" fill="#E7EFFA" />
          <path d="M22 32h20M32 22v20" stroke="#1C5AA6" strokeWidth="4" strokeLinecap="round" />
        </Svg>
      )
  }
}

interface Props {
  activityId: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ActivityVisual({ activityId, size = 'md', className = '' }: Props) {
  const kind = resolveKey(activityId)
  return (
    <span className={`activity-visual activity-visual--${size} ${className}`.trim()} aria-hidden="true">
      <VisualArtwork kind={kind} />
    </span>
  )
}
