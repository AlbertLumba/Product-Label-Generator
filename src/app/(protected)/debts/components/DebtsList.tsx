// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/debts/components/DebtsList.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Inbox } from "lucide-react";
import type { Debt, DebtStatus } from "./DebtCard";

export interface DebtsListProps {
  debts: Debt[];
}

const ITEMS_PER_PAGE = 10;

const statusStyles: Record<DebtStatus, string> = {
  ACTIVE: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  PAID: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  CANCELLED: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value);

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export const DebtsList: React.FC<DebtsListProps> = ({ debts }) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(debts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDebts = debts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  function goToPage(page: number) {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }

  if (debts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
          <Inbox size={28} className="text-gray-400" />
        </div>
        <div className="text-center">
          <p className="text-base font-medium text-gray-900 dark:text-white">No debts yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create your first debt to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[1fr_120px_100px_80px_120px_120px] gap-4 px-6 py-3.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Debtor</span>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</span>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Items</span>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Total</span>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Balance</span>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</span>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {paginatedDebts.map((debt) => (
            <div
              key={debt.id}
              onClick={() => router.push(`/debts/${debt.id}`)}
              className="grid grid-cols-1 md:grid-cols-[1fr_120px_100px_80px_120px_120px] gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors items-center"
            >
              {/* Debtor Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-950 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {debt.debtorName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {debt.debtorName}
                  </p>
                  {debt.debtorEmail && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {debt.debtorEmail}
                    </p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${statusStyles[debt.status]}`}>
                  {debt.status}
                </span>
              </div>

              {/* Items Count */}
              <div className="text-right">
                <span className="text-sm text-gray-600 dark:text-gray-300">{debt.items.length}</span>
              </div>

              {/* Total */}
              <div className="text-right">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {formatCurrency(debt.totalAmount)}
                </span>
              </div>

              {/* Balance */}
              <div className="text-right">
                <span className={`text-sm font-medium ${
                  debt.balance > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                }`}>
                  {formatCurrency(debt.balance)}
                </span>
              </div>

              {/* Created + Access Code */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(debt.createdAt)}</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{debt.accessCode}</p>
                </div>
                <ChevronRight size={16} className="text-gray-400 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, debts.length)} of {debts.length}
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
  );
};

DebtsList.displayName = "DebtsList";