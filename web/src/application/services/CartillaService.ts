import { cartillaRepository } from '../../data/repositories/CartillaRepository'
import type {
  CartillaContent,
  CartillaMeta,
  CognitiveLevel,
  Occupation,
  StrategyActivity,
} from '../../domain/types'

export class CartillaService {
  private readonly repository

  constructor(repository = cartillaRepository) {
    this.repository = repository
  }

  getMeta(): CartillaMeta {
    return this.repository.getContent().meta
  }

  getIntroduction(): CartillaContent['introduction'] {
    return this.repository.getContent().introduction
  }

  listLevels(): CognitiveLevel[] {
    return this.repository.getLevels()
  }

  getLevel(levelId: string): CognitiveLevel | undefined {
    return this.repository.getLevelById(levelId)
  }

  listOccupations(levelId: string): Occupation[] {
    const level = this.repository.getLevelById(levelId)
    if (!level) return []
    return [...level.occupations].sort((a, b) => a.order - b.order)
  }

  getOccupation(levelId: string, occupationId: string): Occupation | undefined {
    return this.repository.getOccupation(levelId, occupationId)
  }

  getActivity(
    levelId: string,
    occupationId: string,
    activityId: string,
  ): StrategyActivity | undefined {
    return this.repository.getActivity(levelId, occupationId, activityId)
  }

  search(query: string): Array<{
    levelId: string
    levelTitle: string
    occupationId: string
    occupationTitle: string
    activityId: string
    activityTitle: string
  }> {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []

    const results: Array<{
      levelId: string
      levelTitle: string
      occupationId: string
      occupationTitle: string
      activityId: string
      activityTitle: string
    }> = []

    for (const level of this.repository.getLevels()) {
      for (const occupation of level.occupations) {
        for (const activity of occupation.activities) {
          const haystack = [
            activity.title,
            ...activity.strategies,
            occupation.title,
            level.title,
          ]
            .join(' ')
            .toLowerCase()

          if (haystack.includes(q)) {
            results.push({
              levelId: level.id,
              levelTitle: level.shortTitle,
              occupationId: occupation.id,
              occupationTitle: occupation.shortTitle,
              activityId: activity.id,
              activityTitle: activity.title,
            })
          }
        }
      }
    }

    return results.slice(0, 40)
  }
}

export const cartillaService = new CartillaService()
