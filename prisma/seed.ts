// prisma/seed.ts
import { PrismaClient, PaymentMethod } from '@prisma/client';
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

  // ── Sample Debts ────────────────────────────────────────────────

  // Debt 1: John - Electronics (items spread across different dates)
  await prisma.debt.create({
    data: {
      debtorName: 'John Doe',
      debtorEmail: 'john@example.com',
      accessCode: 'JOHN1234',
      totalAmount: 1500.00,
      balance: 1000.00,
      status: 'ACTIVE',
      notes: 'Electronics purchase',
      items: {
        create: [
          {
            itemName: 'iPhone 15',
            description: '128GB Black',
            quantity: 1,
            unitPrice: 1000.00,
            totalPrice: 1000.00,
            purchasedAt: new Date('2024-10-01'),
          },
          {
            itemName: 'AirPods Pro',
            description: '2nd Generation',
            quantity: 1,
            unitPrice: 250.00,
            totalPrice: 250.00,
            purchasedAt: new Date('2024-10-15'),
          },
          {
            itemName: 'Phone Case',
            description: 'Silicone Case',
            quantity: 1,
            unitPrice: 250.00,
            totalPrice: 250.00,
            purchasedAt: new Date('2024-10-15'),
          },
        ],
      },
      payments: {
        create: [
          {
            amount: 500.00,
            method: PaymentMethod.CASH,
            paymentDate: new Date('2024-10-20'),
            notes: 'Partial payment for iPhone',
          },
        ],
      },
    },
  });

  // Debt 2: Jane - Groceries over time (Fully Paid)
  await prisma.debt.create({
    data: {
      debtorName: 'Jane Smith',
      debtorEmail: 'jane@example.com',
      accessCode: 'JANE4567',
      totalAmount: 450.00,
      balance: 0.00,
      status: 'PAID',
      notes: 'Monthly groceries',
      items: {
        create: [
          {
            itemName: 'Groceries',
            description: 'Week 1 groceries',
            quantity: 1,
            unitPrice: 150.00,
            totalPrice: 150.00,
            purchasedAt: new Date('2024-10-05'),
          },
          {
            itemName: 'Groceries',
            description: 'Week 2 groceries',
            quantity: 1,
            unitPrice: 135.00,
            totalPrice: 135.00,
            purchasedAt: new Date('2024-10-12'),
          },
          {
            itemName: 'Groceries',
            description: 'Week 3 groceries',
            quantity: 1,
            unitPrice: 165.00,
            totalPrice: 165.00,
            purchasedAt: new Date('2024-10-19'),
          },
        ],
      },
      payments: {
        create: [
          {
            amount: 200.00,
            method: PaymentMethod.BANK_TRANSFER,
            paymentDate: new Date('2024-10-20'),
            notes: 'Partial payment',
          },
          {
            amount: 250.00,
            method: PaymentMethod.CASH,
            paymentDate: new Date('2024-10-28'),
            notes: 'Settled remaining balance',
          },
        ],
      },
    },
  });

  // Debt 3: Bob - Furniture (no payments yet, items on different dates)
  await prisma.debt.create({
    data: {
      debtorName: 'Bob Johnson',
      debtorEmail: 'bob@example.com',
      accessCode: 'BOB7890',
      totalAmount: 3500.00,
      balance: 3500.00,
      status: 'ACTIVE',
      notes: 'Home furniture',
      items: {
        create: [
          {
            itemName: 'Sofa',
            description: '3-seater gray sofa',
            quantity: 1,
            unitPrice: 2500.00,
            totalPrice: 2500.00,
            purchasedAt: new Date('2024-11-01'),
          },
          {
            itemName: 'Coffee Table',
            description: 'Wooden coffee table',
            quantity: 1,
            unitPrice: 500.00,
            totalPrice: 500.00,
            purchasedAt: new Date('2024-11-03'),
          },
          {
            itemName: 'Floor Lamp',
            description: 'Standing lamp',
            quantity: 1,
            unitPrice: 300.00,
            totalPrice: 300.00,
            purchasedAt: new Date('2024-11-03'),
          },
          {
            itemName: 'Rug',
            description: '5x7 area rug',
            quantity: 1,
            unitPrice: 200.00,
            totalPrice: 200.00,
            purchasedAt: new Date('2024-11-05'),
          },
        ],
      },
    },
  });

  // Debt 4: Alice - Books (multiple partial payments)
  await prisma.debt.create({
    data: {
      debtorName: 'Alice Williams',
      debtorEmail: 'alice@example.com',
      accessCode: 'ALICE321',
      totalAmount: 180.00,
      balance: 60.00,
      status: 'ACTIVE',
      notes: 'Bookstore purchases',
      items: {
        create: [
          {
            itemName: 'Programming Books',
            description: 'JavaScript & TypeScript',
            quantity: 2,
            unitPrice: 45.00,
            totalPrice: 90.00,
            purchasedAt: new Date('2024-10-10'),
          },
          {
            itemName: 'Design Books',
            description: 'UI/UX Design',
            quantity: 1,
            unitPrice: 50.00,
            totalPrice: 50.00,
            purchasedAt: new Date('2024-10-18'),
          },
          {
            itemName: 'Notebooks',
            description: 'Moleskine set',
            quantity: 2,
            unitPrice: 20.00,
            totalPrice: 40.00,
            purchasedAt: new Date('2024-10-25'),
          },
        ],
      },
      payments: {
        create: [
          {
            amount: 50.00,
            method: PaymentMethod.E_WALLET,
            paymentDate: new Date('2024-10-20'),
            notes: 'Payment for books',
          },
          {
            amount: 70.00,
            method: PaymentMethod.E_WALLET,
            paymentDate: new Date('2024-10-30'),
            notes: 'Second payment',
          },
        ],
      },
    },
  });

  // Debt 5: Charlie - Cancelled order
  await prisma.debt.create({
    data: {
      debtorName: 'Charlie Brown',
      debtorEmail: 'charlie@example.com',
      accessCode: 'CHARL555',
      totalAmount: 500.00,
      balance: 500.00,
      status: 'CANCELLED',
      notes: 'Cancelled - changed mind',
      items: {
        create: [
          {
            itemName: 'Headphones',
            description: 'Wireless noise-cancelling',
            quantity: 1,
            unitPrice: 350.00,
            totalPrice: 350.00,
            purchasedAt: new Date('2024-10-08'),
          },
          {
            itemName: 'Headphone Stand',
            description: 'Wooden stand',
            quantity: 1,
            unitPrice: 150.00,
            totalPrice: 150.00,
            purchasedAt: new Date('2024-10-08'),
          },
        ],
      },
    },
  });

  // Debt 6: Diana - Mixed items across many dates
  await prisma.debt.create({
    data: {
      debtorName: 'Diana Martinez',
      debtorEmail: 'diana@example.com',
      accessCode: 'DIAN4567',
      totalAmount: 820.00,
      balance: 420.00,
      status: 'ACTIVE',
      notes: 'Various household items',
      items: {
        create: [
          {
            itemName: 'Kitchen Mixer',
            description: 'Stand mixer',
            quantity: 1,
            unitPrice: 300.00,
            totalPrice: 300.00,
            purchasedAt: new Date('2024-10-02'),
          },
          {
            itemName: 'Cookware Set',
            description: 'Non-stick pots and pans',
            quantity: 1,
            unitPrice: 200.00,
            totalPrice: 200.00,
            purchasedAt: new Date('2024-10-12'),
          },
          {
            itemName: 'Utensils',
            description: 'Kitchen utensils set',
            quantity: 1,
            unitPrice: 80.00,
            totalPrice: 80.00,
            purchasedAt: new Date('2024-10-20'),
          },
          {
            itemName: 'Dish Towels',
            description: 'Set of 6',
            quantity: 2,
            unitPrice: 25.00,
            totalPrice: 50.00,
            purchasedAt: new Date('2024-10-28'),
          },
          {
            itemName: 'Storage Containers',
            description: 'Glass containers set',
            quantity: 1,
            unitPrice: 120.00,
            totalPrice: 120.00,
            purchasedAt: new Date('2024-11-01'),
          },
          {
            itemName: 'Spice Rack',
            description: 'Wall-mounted',
            quantity: 1,
            unitPrice: 70.00,
            totalPrice: 70.00,
            purchasedAt: new Date('2024-11-05'),
          },
        ],
      },
      payments: {
        create: [
          {
            amount: 200.00,
            method: PaymentMethod.BANK_TRANSFER,
            paymentDate: new Date('2024-10-25'),
            notes: 'First payment',
          },
          {
            amount: 200.00,
            method: PaymentMethod.CASH,
            paymentDate: new Date('2024-11-03'),
            notes: 'Second payment',
          },
        ],
      },
    },
  });

  console.log('\n✅ Seed completed!');
  console.log('\n📊 Summary:');
  console.log('   - 1 Admin (admin@example.com / admin123)');
  console.log('   - 6 Debts (4 ACTIVE, 1 PAID, 1 CANCELLED)');
  console.log('   - 21 Items across multiple dates');
  console.log('   - 8 Payments recorded');
  
  console.log('\n🔑 Access Codes:');
  console.log('   John Doe        → JOHN1234  (Balance: $1,000.00)');
  console.log('   Jane Smith      → JANE4567  (PAID)');
  console.log('   Bob Johnson     → BOB7890   (Balance: $3,500.00)');
  console.log('   Alice Williams  → ALICE321  (Balance: $60.00)');
  console.log('   Charlie Brown   → CHARL555  (CANCELLED)');
  console.log('   Diana Martinez  → DIAN4567  (Balance: $420.00)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });