import { getStorageNS } from "@follow/utils/ns"
import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

import { createAtomHooks } from "~/lib/jotai"

export type FeedListSortBy = "count" | "alphabetical"
export type FeedListSortOrder = "asc" | "desc"
const [, , useFeedListSort, , getFeedListSort, setFeedListSort, useFeedListSortSelector] =
  createAtomHooks(
    atomWithStorage(
      getStorageNS("feedListSort"),
      {
        by: "count" as FeedListSortBy,
        order: "desc" as FeedListSortOrder,
      },
      undefined,
      { getOnInit: true },
    ),
  )

export { getFeedListSort, useFeedListSort, useFeedListSortSelector }

export const setFeedListSortBy = (by: FeedListSortBy) => {
  setFeedListSort({
    ...getFeedListSort(),
    by,
  })
}

export const setFeedListSortOrder = (order: FeedListSortOrder) => {
  setFeedListSort({
    ...getFeedListSort(),
    order,
  })
}

export const [
  ,
  useSelectedFeedIds,
  ,
  useSetSelectedFeedIds,
  getSelectedFeedIds,
  setSelectedFeedIds,
  useSelectedFeedIdsSelector,
] = createAtomHooks(atom<string[]>([]))

export const [, , useFeedAreaScrollProgressValue, , , setFeedAreaScrollProgressValue] =
  createAtomHooks(atom(0))
