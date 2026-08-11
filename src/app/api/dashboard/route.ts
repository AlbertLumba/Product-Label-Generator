// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/dashboard/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { apiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/server";
import prisma from "@/lib/prisma";

export const GET = apiHandler(async () => {
  // Total stats
  const totalDebts = await prisma.debt.count();
  const activeDebts = await prisma.debt.count({ where: { status: "ACTIVE" } });
  const paidDebts = await prisma.debt.count({ where: { status: "PAID" } });
  const cancelledDebts = await prisma.debt.count({ where: { status: "CANCELLED" } });

  // Amount stats
  const amountAgg = await prisma.debt.aggregate({
    _sum: { totalAmount: true, balance: true },
  });

  const totalAmount = Number(amountAgg._sum.totalAmount) || 0;
  const totalBalance = Number(amountAgg._sum.balance) || 0;
  const totalCollected = totalAmount - totalBalance;

  // Payment stats
  const paymentAgg = await prisma.payment.aggregate({
    _sum: { amount: true },
    _count: true,
  });

  const totalPayments = paymentAgg._count;
  const totalPaymentAmount = Number(paymentAgg._sum.amount) || 0;

  // Top debts by balance (top 5)
  const topDebts = await prisma.debt.findMany({
    where: { status: "ACTIVE" },
    orderBy: { balance: "desc" },
    take: 5,
    include: {
      items: true,
      payments: {
        orderBy: { paymentDate: "desc" },
        take: 1,
      },
    },
  });

  // Recent activity (latest 5 payments)
  const recentPayments = await prisma.payment.findMany({
    orderBy: { paymentDate: "desc" },
    take: 5,
    include: {
      debt: {
        select: {
          id: true,
          debtorName: true,
          accessCode: true,
        },
      },
    },
  });

  // Recent debts (latest 5)
  const recentDebts = await prisma.debt.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      items: true,
      payments: true,
    },
  });

  // Monthly collection (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyPayments = await prisma.payment.findMany({
    where: {
      paymentDate: { gte: sixMonthsAgo },
    },
    orderBy: { paymentDate: "asc" },
  });

  // Group by month
  const monthlyData: Record<string, number> = {};
  monthlyPayments.forEach((p) => {
    const key = p.paymentDate.toLocaleDateString("en-US", { year: "numeric", month: "short" });
    monthlyData[key] = (monthlyData[key] || 0) + Number(p.amount);
  });

  return ok({
    stats: {
      totalDebts,
      activeDebts,
      paidDebts,
      cancelledDebts,
      totalAmount,
      totalBalance,
      totalCollected,
      totalPayments,
      totalPaymentAmount,
      collectionRate: totalAmount > 0 ? Math.round((totalCollected / totalAmount) * 100) : 0,
    },
    topDebts: topDebts.map((d) => ({
      id: d.id,
      debtorName: d.debtorName,
      debtorEmail: d.debtorEmail,
      accessCode: d.accessCode,
      totalAmount: Number(d.totalAmount),
      balance: Number(d.balance),
      status: d.status,
      itemsCount: d.items.length,
      lastPayment: d.payments[0] ? {
        amount: Number(d.payments[0].amount),
        date: d.payments[0].paymentDate,
      } : null,
    })),
    recentPayments: recentPayments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      paymentDate: p.paymentDate,
      method: p.method,
      notes: p.notes,
      debt: {
        id: p.debt.id,
        debtorName: p.debt.debtorName,
        accessCode: p.debt.accessCode,
      },
    })),
    recentDebts: recentDebts.map((d) => ({
      id: d.id,
      debtorName: d.debtorName,
      accessCode: d.accessCode,
      totalAmount: Number(d.totalAmount),
      balance: Number(d.balance),
      status: d.status,
      itemsCount: d.items.length,
      createdAt: d.createdAt,
    })),
    monthlyData,
  });
});