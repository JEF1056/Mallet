import { ID } from "graphql-ws";
import { Category, Judge, Project } from "../__generated__/resolvers-types";

// TODO: This function is really poorly typed...
// It should have less strict promise return types and a better typed reducer
export async function batchResolveAndMap(
  batchResolverFunction: (
    parent: any,
    args: { ids: ID[] },
    context: any,
    info: any
  ) => Promise<Project[] | Judge[] | Category[]>,
  ids: ID[]
) {
  return (
    await batchResolverFunction(
      null,
      {
        ids,
      },
      null,
      null
    )
  ).reduce((acc: { [key: string]: any }, item: any) => {
    acc[item.id] = item;
    return acc;
  }, {});
}
