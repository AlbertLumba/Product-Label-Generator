// src/app/(protected)/debts/components/DebtCard.tsx
"use client";

import React from "react";
import { Mail, Key, FileText, Calendar } from "lucide-react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type DebtStatus = "ACTIVE" | "PAID" | "CANCELLED";
export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "E_WALLET" | "OTHER";

export interface DebtItem {
  id: string;
  itemName: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  purchasedAt: string | Date;
}

export interface Payment {
  id: string;
  amount: number;
  paymentDate: string | Date;
  method: PaymentMethod;
  notes?: string | null;
}

export interface Debt {
  id: string;
  debtorName: string;
  debtorEmail?: string | null;
  accessCode: string;
  totalAmount: number;
  balance: number;
  status: DebtStatus;
  notes?: string | null;
  createdAt: string | Date;
  items: DebtItem[];
  payments: Payment[];
}

export interface DebtCardProps {
  debt: Debt;
  onRecordPayment?: (debtId: string) => void;
  className?: string;
}

// ─────────────────────────────────────────────
// STYLE MAPS
// ─────────────────────────────────────────────

const statusStyles: Record<DebtStatus, string> = {
  ACTIVE: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  PAID: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  CANCELLED: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400",
};

const paymentMethodLabel: Record<PaymentMethod, string> = {
  CASH: "Cash",
  BANK_TRANSFER: "Bank Transfer",
  E_WALLET: "E-Wallet",
  OTHER: "Other",
};

const paymentMethodStyles: Record<PaymentMethod, string> = {
  CASH: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  BANK_TRANSFER: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  E_WALLET: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400",
  OTHER: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400",
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

// Group items by date
function groupItemsByDate(items: DebtItem[]) {
  const groups: Record<string, DebtItem[]> = {};
  
  items.forEach((item) => {
    const dateKey = formatDate(item.purchasedAt);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(item);
  });

  return Object.entries(groups).sort((a, b) => 
    new Date(b[0]).getTime() - new Date(a[0]).getTime()
  );
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export const DebtCard: React.FC<DebtCardProps> = ({
  debt,
  onRecordPayment,
  className = "",
}) => {
  const isSettled = debt.status !== "ACTIVE";
  const groupedItems = groupItemsByDate(debt.items);

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-indigo-100 dark:bg-indigo-950 rounded-xl flex items-center justify-center">
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {debt.debtorName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">{debt.debtorName}</h3>
              {debt.debtorEmail && (
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <Mail size={12} />
                  {debt.debtorEmail}
                </p>
              )}
            </div>
          </div>
          <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${statusStyles[debt.status]}`}>
            {debt.status}
          </span>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <Key size={13} />
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">{debt.accessCode}</span>
          </div>
          {debt.notes && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <FileText size={13} />
              <span className="truncate max-w-[200px]">{debt.notes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Items grouped by date */}
      <div className="px-6 py-4 space-y-4">
        {groupedItems.map(([date, items]) => {
          const dateTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
          
          return (
            <div key={date} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden">
              {/* Date header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-gray-500 dark:text-gray-400" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{date}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({items.length} item{items.length !== 1 ? "s" : ""})
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {formatCurrency(dateTotal)}
                </span>
              </div>

              {/* Items for this date */}
              <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {item.quantity > 1 && (
                          <span className="text-gray-500 dark:text-gray-400">{item.quantity}× </span>
                        )}
                        {item.itemName}
                      </p>
                      {item.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300 ml-3 shrink-0">
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payments */}
      {debt.payments.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Payments ({debt.payments.length})
          </h4>
          <div className="space-y-2">
            {debt.payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium ${paymentMethodStyles[payment.method]}`}>
                    {paymentMethodLabel[payment.method]}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(payment.paymentDate)}
                  </span>
                </div>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(debt.totalAmount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Balance</span>
          <span className={`text-lg font-bold ${
            debt.balance > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
          }`}>
            {formatCurrency(debt.balance)}
          </span>
        </div>
      </div>

      {/* Action */}
      {onRecordPayment && (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <button
            disabled={isSettled}
            onClick={() => onRecordPayment(debt.id)}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Record Payment
          </button>
        </div>
      )}
    </div>
  );
};

DebtCard.displayName = "DebtCard";