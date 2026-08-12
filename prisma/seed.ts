// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── Raw data pulled from Sheet3: Aug 10 group + Aug 3 (2nd) group ───

const AUG_10 = new Date('2026-08-10');
const AUG_3 = new Date('2026-08-03');

interface RawEntry {
  name: string;
  amount: number;
  paid: boolean;
  date: Date;
}

const rawEntries: RawEntry[] = [
  // Aug 10 group
  { name: 'Jasmin', amount: 194, paid: false, date: AUG_10 },
  { name: 'Shan', amount: 47, paid: false, date: AUG_10 },
  { name: 'Star', amount: 119, paid: true, date: AUG_10 },
  { name: 'Vinz', amount: 196, paid: true, date: AUG_10 },
  { name: 'Jem', amount: 155, paid: true, date: AUG_10 },
  { name: 'Rev', amount: 117, paid: true, date: AUG_10 },
  { name: 'Lawrence', amount: 117, paid: true, date: AUG_10 },

  // Aug 3 (2nd) group
  { name: 'Tene', amount: 162, paid: true, date: AUG_3 },
  { name: 'Norman', amount: 164, paid: true, date: AUG_3 },
  { name: 'Jer', amount: 162, paid: true, date: AUG_3 },
  { name: 'Ber', amount: 98, paid: true, date: AUG_3 },
  { name: 'Star', amount: 105, paid: true, date: AUG_3 },
  { name: 'Shan', amount: 162, paid: false, date: AUG_3 },
  { name: 'Pat C', amount: 162, paid: true, date: AUG_3 },
  { name: 'Artem', amount: 162, paid: true, date: AUG_3 },
  { name: 'Vinz', amount: 178, paid: true, date: AUG_3 },
  { name: 'Bago', amount: 178, paid: false, date: AUG_3 },
  { name: 'Mhay', amount: 200, paid: true, date: AUG_3 },
  { name: 'Jasmin', amount: 223, paid: false, date: AUG_3 },
];

// ─── Group entries by debtor name ───

function groupByName(entries: RawEntry[]): Map<string, RawEntry[]> {
  const map = new Map<string, RawEntry[]>();
  for (const entry of entries) {
    const existing = map.get(entry.name);
    if (existing) {
      existing.push(entry);
    } else {
      map.set(entry.name, [entry]);
    }
  }
  return map;
}

// ─── Access code generator (mirrors /api/debts/register logic) ───

const usedCodes = new Set<string>();

function generateAccessCode(debtorName: string): string {
  const base = debtorName
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

  if (!usedCodes.has(base)) {
    usedCodes.add(base);
    return base;
  }

  // Same name already used as a code within this seed run —
  // append an incrementing number, still fully derived from the name.
  for (let n = 2; n < 100; n++) {
    const code = `${base}${n}`;
    if (!usedCodes.has(code)) {
      usedCodes.add(code);
      return code;
    }
  }

  throw new Error(`Could not generate a unique access code for ${debtorName}`);
}

async function main() {
  // Clean existing data in correct order (respect foreign keys)
  console.log('🧹 Cleaning existing data...');
  await prisma.itemPayment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.debtItem.deleteMany();
  await prisma.debt.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ All existing data removed');

  // Create admin user
  const hashedPassword = await bcrypt.hash('123123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@example.com',
      passwordHash: hashedPassword,
    },
  });

  console.log('👤 Admin created:', admin.email);

  // ─── Seed debts from Aug 3 / Aug 10 data ───

  const grouped = groupByName(rawEntries);
  let debtsCreated = 0;

  for (const [name, entries] of grouped) {
    const items = entries.map((e) => ({
      itemName: 'item',
      quantity: 1,
      unitPrice: e.amount,
      totalPrice: e.amount,
      paidAmount: e.paid ? e.amount : 0,
      purchasedAt: e.date,
      payments: e.paid
        ? {
            create: [
              {
                amount: e.amount,
                method: 'OTHER' as const,
                paymentDate: e.date,
              },
            ],
          }
        : undefined,
    }));

    const totalAmount = items.reduce((sum, i) => sum + i.totalPrice, 0);
    const totalPaid = items.reduce((sum, i) => sum + i.paidAmount, 0);
    const balance = totalAmount - totalPaid;
    const status = balance <= 0 ? 'PAID' : 'ACTIVE';

    const debtLevelPayments = entries
      .filter((e) => e.paid)
      .map((e) => ({
        amount: e.amount,
        method: 'OTHER' as const,
        paymentDate: e.date,
      }));

    const accessCode = generateAccessCode(name);

    await prisma.debt.create({
      data: {
        debtorName: name,
        accessCode,
        totalAmount,
        balance,
        status,
        items: { create: items },
        payments: { create: debtLevelPayments },
      },
    });

    debtsCreated++;
  }

  console.log(`💸 ${debtsCreated} debts created from Aug 3 / Aug 10 data`);
  console.log('\n✅ Seed completed!');
  console.log('   - 1 Admin (admin@example.com / admin123)');
  console.log(`   - ${debtsCreated} Debts`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });