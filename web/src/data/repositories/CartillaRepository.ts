import type { CartillaContent, CognitiveLevel, Occupation, StrategyActivity } from '../../domain/types'
import cartillaData from '../content/cartilla.json' with { type: 'json' }

export class CartillaRepository {
  private readonly content: CartillaContent

  constructor(content: CartillaContent = cartillaData as CartillaContent) {
    this.content = content
  }

  getContent(): CartillaContent {
    return this.content
  }

  getLevels(): CognitiveLevel[] {
    return [...this.content.levels].sort((a, b) => a.order - b.order)
  }

  getLevelById(levelId: string): CognitiveLevel | undefined {
    return this.content.levels.find((level) => level.id === levelId)
  }

  getOccupation(levelId: string, occupationId: string): Occupation | undefined {
    return this.getLevelById(levelId)?.occupations.find((item) => item.id === occupationId)
  }

  getActivity(
    levelId: string,
    occupationId: string,
    activityId: string,
  ): StrategyActivity | undefined {
    return this.getOccupation(levelId, occupationId)?.activities.find(
      (item) => item.id === activityId,
    )
  }
}

export const cartillaRepository = new CartillaRepository()
