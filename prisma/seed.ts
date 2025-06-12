import { PrismaClient, UserType } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create test admin user
  const adminPassword = await hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      type: UserType.ADMIN,
      emailVerified: true,
    },
  });

  // Create test client user
  const clientPassword = await hash('client123', 10);
  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      name: 'Test Client',
      password: clientPassword,
      type: UserType.CLIENT,
      emailVerified: true,
      client: {
        create: {
          fullName: 'Test Client',
          contact: '1234567890',
          address: '123 Test St',
        },
      },
    },
  });

  console.log({ admin, client });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });