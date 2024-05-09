import { ID } from "graphql-ws";
import { prisma } from "../db";
import {
  Category,
  MutationCreateCategoryArgs,
} from "../../__generated__/resolvers-types";

export async function resolveCategory(
  parent,
  args: { ids: ID[] },
  context,
  info
): Promise<Category[]> {
  const categoryInformationFromDB = await prisma.category.findMany({
    where: args.ids
      ? {
          id: { in: args.ids },
        }
      : undefined,
  });

  const categories: Category[] = await Promise.all(
    categoryInformationFromDB.map(async (category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
    }))
  );

  return categories;
}

export async function createCategory(
  _,
  args: MutationCreateCategoryArgs
): Promise<Category> {
  console.info("Creating category with args: ", args);

  const category = await prisma.category.create({
    data: {
      name: args.name,
      description: args.description,
    },
  });

  return {
    id: category.id,
    name: category.name,
    description: category.description,
  };
}
