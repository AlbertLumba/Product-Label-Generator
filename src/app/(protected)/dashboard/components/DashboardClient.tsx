// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/dashboard/components/DashboardClient.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"use client";

import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  DollarSign,
  Users,
  ArrowRight,
} from "lucide-react";
import type { DashboardData } from "../page";

interface DashboardClientProps {
  data: DashboardData;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const paymentMethodLabel: Record<string, string> = {
  CASH: "Cash",
  BANK_TRANSFER: "Bank Transfer",
  E_WALLET: "E-Wallet",
  OTHER: "Other",
};

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  PAID: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  CANCELLED: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400",
};

export function DashboardClient({ data }: DashboardClientProps) {
  const router = useRouter();
  const { stats, topDebts, recentPayments, recentDebts } = data;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950 rounded-xl flex items-center justify-center">
          <LayoutDashboard size={20} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Overview of your debt tracker</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={16} className="text-indigo-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Active Debts</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeDebts}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">of {stats.totalDebts} total</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-red-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Outstanding</span>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(stats.totalBalance)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats.collectionRate}% collected</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-emerald-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Collected</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.totalCollected)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats.totalPayments} payments</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-blue-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Debtors</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDebts}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats.paidDebts} fully paid</p>
        </div>
      </div>

      {/* Top Debts + Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Debts */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Top Debts</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">By balance</span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {topDebts.map((debt, i) => (
              <div
                key={debt.id}
                onClick={() => router.push(`/debts/${debt.id}`)}
                className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{debt.debtorName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{debt.itemsCount} items</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(debt.balance)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">of {formatCurrency(debt.totalAmount)}</p>
                </div>
              </div>
            ))}
            {topDebts.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No active debts
              </div>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Payments</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">Latest</span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentPayments.map((payment) => (
              <div
                key={payment.id}
                onClick={() => router.push(`/debts/${payment.debt.id}`)}
                className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {payment.debt.debtorName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(payment.paymentDate)}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{paymentMethodLabel[payment.method]}</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex-shrink-0 ml-3">
                  +{formatCurrency(payment.amount)}
                </span>
              </div>
            ))}
            {recentPayments.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No payments yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Debts */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Debts</h3>
          <button
            onClick={() => router.push("/debts")}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {recentDebts.map((debt) => (
            <div
              key={debt.id}
              onClick={() => router.push(`/debts/${debt.id}`)}
              className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${statusStyles[debt.status]}`}>
                  {debt.status}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{debt.debtorName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {debt.itemsCount} items · Created {formatDate(debt.createdAt)}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(debt.totalAmount)}</p>
                {debt.balance > 0 && (
                  <p className="text-xs text-red-600 dark:text-red-400">{formatCurrency(debt.balance)} remaining</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}