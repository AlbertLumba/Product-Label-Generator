// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/debts/[id]/components/DebtDetail.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, DollarSign, Calendar, Mail, Key, FileText, ChevronDown, Pencil } from "lucide-react";
import { AddItemModal } from "./AddItemModal";
import { RecordPaymentModal } from "./RecordPaymentModal";
import { EditItemModal } from "./EditItemModal";
import { EditDebtorModal } from "./EditDebtorModal";
import type { Debt, DebtItem, PaymentMethod } from "../../components/DebtCard";

export interface DebtDetailProps {
  debt: Debt;
}

// ─── Helpers ───────────────────────────────────────────────────

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value);

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

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

const statusStyles: Record<string, string> = {
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

// ─── Component ─────────────────────────────────────────────────

export const DebtDetail: React.FC<DebtDetailProps> = ({ debt }) => {
  const [showAddItem, setShowAddItem] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [currentDebt, setCurrentDebt] = useState(debt);
  const [showPayments, setShowPayments] = useState(false);
  const [prefillAmount, setPrefillAmount] = useState<number | null>(null);
  const [selectedPaymentItemId, setSelectedPaymentItemId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<DebtItem | null>(null);
  const [showEditDebtor, setShowEditDebtor] = useState(false);

  const groupedItems = groupItemsByDate(currentDebt.items);

  function handleItemClick(item: DebtItem) {
    if (currentDebt.status !== "ACTIVE") return;
    setSelectedPaymentItemId(item.id);
    setPrefillAmount(item.totalPrice);
    setShowPayment(true);
  }

  function handleEditClick(e: React.MouseEvent, item: DebtItem) {
    e.stopPropagation();
    setEditingItem(item);
  }

  function handlePaymentClose() {
    setShowPayment(false);
    setPrefillAmount(null);
    setSelectedPaymentItemId(null);
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-1">
          <Link
            href="/debts"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <div className="flex items-center gap-3">
            {currentDebt.status === "ACTIVE" && (
              <>
                <button
                  onClick={() => {
                    setSelectedPaymentItemId(null);
                    setPrefillAmount(null);
                    setShowPayment(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <DollarSign size={15} />
                  Payment
                </button>
                <button
                  onClick={() => setShowAddItem(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus size={15} />
                  Add Item
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {currentDebt.debtorName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{currentDebt.debtorName}</h2>
                <button
                  onClick={() => setShowEditDebtor(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors flex-shrink-0"
                >
                  <Pencil size={12} />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {currentDebt.debtorEmail && (
                  <span className="flex items-center gap-1">
                    <Mail size={12} />
                    <span className="truncate">{currentDebt.debtorEmail}</span>
                  </span>
                )}
                <span className="flex items-center gap-1 flex-shrink-0">
                  <Key size={12} />
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">{currentDebt.accessCode}</span>
                </span>
                {currentDebt.notes && (
                  <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500 truncate">
                    <FileText size={12} />
                    {currentDebt.notes}
                  </span>
                )}
              </div>
            </div>
          </div>
          <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 ml-3 ${statusStyles[currentDebt.status]}`}>
            {currentDebt.status}
          </span>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Items</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{currentDebt.items.length}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(currentDebt.totalAmount)}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
            <p className={`text-lg font-bold ${currentDebt.balance > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {formatCurrency(currentDebt.balance)}
            </p>
          </div>
        </div>
      </div>

      {/* Items by Date */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Purchase History
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {groupedItems.map(([date, items]) => {
            const dateTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
            
            return (
              <div key={date} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
                {/* Date Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-950 rounded-lg flex items-center justify-center">
                      <Calendar size={14} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{date}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {items.length} item{items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {formatCurrency(dateTotal)}
                  </span>
                </div>

                {/* Items Grid */}
                <div className="p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={`bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 transition-colors relative group ${
                          currentDebt.status === "ACTIVE"
                            ? "cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:ring-2 hover:ring-indigo-500/30"
                            : "cursor-default"
                        }`}
                      >
                        {/* Edit button */}
                        {currentDebt.status === "ACTIVE" && (
                          <button
                            onClick={(e) => handleEditClick(e, item)}
                            className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-800 z-10"
                          >
                            <Pencil size={12} className="text-gray-500 dark:text-gray-400" />
                          </button>
                        )}

                        {/* Item Content */}
                        <div onClick={() => handleItemClick(item)}>
                          <div className="flex items-start justify-between mb-1.5">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1 mr-2 pr-6">
                              {item.itemName}
                            </h4>
                            {item.quantity > 1 && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                                ×{item.quantity}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-end justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {formatCurrency(item.totalPrice)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatCurrency(item.unitPrice)}/ea
                              </p>
                            )}
                          </div>
                          {currentDebt.status === "ACTIVE" && (
                            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                                <DollarSign size={11} />
                                Pay this item
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payments Section */}
      {currentDebt.payments.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setShowPayments(!showPayments)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Payment History ({currentDebt.payments.length})
            <ChevronDown size={14} className={`transition-transform ${showPayments ? "rotate-180" : ""}`} />
          </button>

          {showPayments && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {currentDebt.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${paymentMethodStyles[payment.method]}`}>
                        {paymentMethodLabel[payment.method]}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(payment.paymentDate)}
                      </span>
                      {payment.notes && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">— {payment.notes}</span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(payment.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showAddItem && (
        <AddItemModal
          debt={currentDebt}
          onClose={() => setShowAddItem(false)}
          onUpdated={(updatedDebt) => {
            setCurrentDebt(updatedDebt);
            setShowAddItem(false);
          }}
        />
      )}

      {showPayment && (
        <RecordPaymentModal
          debt={currentDebt}
          prefillAmount={prefillAmount}
          prefillItemId={selectedPaymentItemId}
          onClose={handlePaymentClose}
          onUpdated={(updatedDebt) => {
            setCurrentDebt(updatedDebt);
            handlePaymentClose();
          }}
        />
      )}

      {editingItem && (
        <EditItemModal
          debt={currentDebt}
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onUpdated={(updatedDebt) => {
            setCurrentDebt(updatedDebt);
            setEditingItem(null);
          }}
        />
      )}

      {showEditDebtor && (
        <EditDebtorModal
          debt={currentDebt}
          onClose={() => setShowEditDebtor(false)}
          onUpdated={(updatedDebt) => {
            setCurrentDebt(updatedDebt);
            setShowEditDebtor(false);
          }}
        />
      )}
    </div>
  );
};

DebtDetail.displayName = "DebtDetail";