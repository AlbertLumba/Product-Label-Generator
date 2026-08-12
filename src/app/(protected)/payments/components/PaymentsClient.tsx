// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/payments/components/PaymentsClient.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, User, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { PaymentRecord } from "../page";

interface PaymentsClientProps {
  payments: PaymentRecord[];
}

const ITEMS_PER_PAGE = 15;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value);

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const paymentMethodLabel: Record<string, string> = {
  CASH: "Cash",
  BANK_TRANSFER: "Bank Transfer",
  E_WALLET: "E-Wallet",
  OTHER: "Other",
};

const paymentMethodStyles: Record<string, string> = {
  CASH: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  BANK_TRANSFER: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  E_WALLET: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400",
  OTHER: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400",
};

export function PaymentsClient({ payments }: PaymentsClientProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(payments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPayments = payments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  function goToPage(page: number) {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950 rounded-xl flex items-center justify-center">
          <CreditCard size={20} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payments</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {payments.length} payment{payments.length !== 1 ? "s" : ""} · {formatCurrency(totalCollected)} collected
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Payments</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{payments.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Collected</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(totalCollected)}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Avg Payment</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {payments.length > 0 ? formatCurrency(totalCollected / payments.length) : "$0.00"}
          </p>
        </div>
      </div>

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
            <CreditCard size={28} className="text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-base font-medium text-gray-900 dark:text-white">No payments yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Record a payment on a debt to see it here</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginatedPayments.map((payment) => (
                <div
                  key={payment.id}
                  onClick={() => router.push(`/debts/${payment.debt.id}`)}
                  className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className={`inline-flex px-2.5 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 ${paymentMethodStyles[payment.method]}`}>
                      {paymentMethodLabel[payment.method]}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <User size={13} className="text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {payment.debt.debtorName}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                          · {payment.debt.accessCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(payment.paymentDate)}
                        </span>
                        {payment.notes && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
                            — {payment.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(payment.amount)}
                    </span>
                    <ArrowRight size={14} className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, payments.length)} of {payments.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${
                      page === currentPage
                        ? "bg-indigo-600 text-white"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}