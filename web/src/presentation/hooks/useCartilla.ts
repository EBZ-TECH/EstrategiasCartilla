import { useMemo } from 'react'
import { cartillaService } from '../../application/services/CartillaService'

export function useCartillaMeta() {
  return useMemo(() => cartillaService.getMeta(), [])
}

export function useIntroduction() {
  return useMemo(() => cartillaService.getIntroduction(), [])
}

export function useLevels() {
  return useMemo(() => cartillaService.listLevels(), [])
}

export function useLevel(levelId: string | undefined) {
  return useMemo(
    () => (levelId ? cartillaService.getLevel(levelId) : undefined),
    [levelId],
  )
}

export function useOccupations(levelId: string | undefined) {
  return useMemo(
    () => (levelId ? cartillaService.listOccupations(levelId) : []),
    [levelId],
  )
}

export function useOccupation(levelId: string | undefined, occupationId: string | undefined) {
  return useMemo(
    () =>
      levelId && occupationId
        ? cartillaService.getOccupation(levelId, occupationId)
        : undefined,
    [levelId, occupationId],
  )
}

export function useActivity(
  levelId: string | undefined,
  occupationId: string | undefined,
  activityId: string | undefined,
) {
  return useMemo(
    () =>
      levelId && occupationId && activityId
        ? cartillaService.getActivity(levelId, occupationId, activityId)
        : undefined,
    [levelId, occupationId, activityId],
  )
}

export function useSearch(query: string) {
  return useMemo(() => cartillaService.search(query), [query])
}
