import { ID } from "graphql-ws";
import { prisma } from "../db";
import {
  Category,
  MutationSetCategoriesArgs,
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
    orderBy: {
      name: "asc",
    },
  });

  //   const categories: Category[] = await Promise.all(
  //     categoryInformationFromDB.map(async (category) => ({
  //       id: category.id,
  //       name: category.name,
  //       description: category.description,
  //       global: category.global,
  //     }))
  //   );

  return categoryInformationFromDB;
}

export async function setCategories(
  _,
  args: MutationSetCategoriesArgs
): Promise<Category[]> {
  console.info("Creating category with args: ", args);

  const categories = await Promise.all(
    args.categories.map(
      async (category) =>
        await prisma.category.upsert({
          where: { name: category.name },
          update: {
            description: category.description,
            global: category.global,
          },
          create: {
            name: category.name,
            description: category.description,
            global: category.global,
          },
        })
    )
  );

  return categories;
}

export async function deleteCategory(_, args: { id: ID }) {
  console.info("Deleting category with args: ", args);

  const category = await prisma.category.delete({
    where: { id: args.id },
  });

  return category;
}
