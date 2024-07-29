import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  // Create general category
  await prisma.category.upsert({
    where: { name: "General" },
    update: {},
    create: {
      name: "General",
      description: "General category for projects",
      global: true,
      id: "general",
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
