export type OccupationIcon =
  | 'home'
  | 'list'
  | 'heart'
  | 'moon'
  | 'briefcase'
  | 'sparkles'
  | 'users'

export interface StrategyActivity {
  id: string
  title: string
  strategies: string[]
}

export interface Occupation {
  id: string
  title: string
  shortTitle: string
  icon: OccupationIcon
  order: number
  activities: StrategyActivity[]
}

export interface CognitiveLevel {
  id: string
  title: string
  shortTitle: string
  order: number
  color: string
  description: string
  whyCaregiverTitle: string
  whyCaregiver: string
  occupations: Occupation[]
}

export interface CartillaMeta {
  title: string
  subtitle: string
  audience: string
  version: string
  source: string
}

export interface CartillaContent {
  meta: CartillaMeta
  introduction: {
    title: string
    paragraphs: string[]
  }
  levels: CognitiveLevel[]
}
