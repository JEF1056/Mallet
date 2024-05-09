import { ID } from "graphql-ws";
import { Category, Judge, Project } from "../__generated__/resolvers-types";

// TODO: This function is really poorly typed...
// It should have less strict promise return types and a better typed reducer
export async function batchResolveUniqueAndMap(
  depth: number | undefined,
  batchResolverFunction: (
    parent: any,
    args: { ids: ID[] },
    context: any,
    info: any
  ) => Promise<Project[] | Judge[] | Category[]>,
  ids: ID[]
) {
  // Only resolve unique IDs
  const uniqueIds = [...new Set(ids)];

  return (
    await batchResolverFunction(
      (depth || 0) + 1,
      {
        ids: uniqueIds,
      },
      null,
      null
    )
  ).reduce((acc: { [key: string]: any }, item: any) => {
    acc[item.id] = item;
    return acc;
  }, {});
}

export function findFirstNonContinuousNumber(sortedArray: number[]) {
  for (let i = 0; i < sortedArray.length; i++) {
    if (sortedArray[i] !== i) {
      return i;
    }
  }
  return sortedArray.length;
}
