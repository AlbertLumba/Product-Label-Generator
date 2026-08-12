// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data in correct order (respect foreign keys)
  console.log('🧹 Cleaning existing data...');
  await prisma.payment.deleteMany();
  await prisma.debtItem.deleteMany();
  await prisma.debt.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ All existing data removed');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@example.com',
      passwordHash: hashedPassword,
    },
  });

  console.log('👤 Admin created:', admin.email);
  console.log('\n✅ Seed completed!');
  console.log('   - 1 Admin (admin@example.com / admin123)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });