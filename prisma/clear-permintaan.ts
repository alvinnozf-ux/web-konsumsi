import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const items = await prisma.itemKonsumsi.deleteMany({});
  const perms  = await prisma.permintaan.deleteMany({});
  console.log("ItemKonsumsi dihapus:", items.count);
  console.log("Permintaan dihapus:", perms.count);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
