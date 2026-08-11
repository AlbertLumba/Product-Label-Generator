// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/debts/[id]/components/RecordPaymentModal.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"use client";

import { useState, useEffect } from "react";
import { X, DollarSign, CreditCard, User, Check } from "lucide-react";
import { api } from "@/lib/api/client";
import type { Debt, PaymentMethod } from "../../components/DebtCard";

interface RecordPaymentModalProps {
  debt: Debt;
  prefillAmount?: number | null;
  onClose: () => void;
  onUpdated: (debt: Debt) => void;
}

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "E_WALLET", label: "E-Wallet" },
  { value: "OTHER", label: "Other" },
];

export function RecordPaymentModal({ debt, prefillAmount, onClose, onUpdated }: RecordPaymentModalProps) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Set prefill amount when item is clicked
  useEffect(() => {
    if (prefillAmount && prefillAmount > 0) {
      setAmount(prefillAmount.toString());
      setSelectedItemId("prefilled");
    }
  }, [prefillAmount]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (paymentAmount > debt.balance) {
      setError(`Amount cannot exceed balance of ${formatCurrency(debt.balance)}`);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await api.post<Debt>("/api/debts/payment", {
        debtId: debt.id,
        amount: paymentAmount,
        method,
        notes: notes || undefined,
      });

      if (!res.success || !res.data) {
        setError(res.message || "Failed to record payment");
        return;
      }

      onUpdated(res.data);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  // Calculate remaining per item based on payments made
  const totalPaid = debt.totalAmount - debt.balance;

  // Calculate remaining amount for each item
  const itemsWithRemaining = debt.items.map((item, index) => {
    const previousTotal = debt.items
      .slice(0, index)
      .reduce((sum, i) => sum + i.totalPrice, 0);
    const itemStart = previousTotal;
    
    const paidForThisItem = Math.max(0, Math.min(totalPaid - itemStart, item.totalPrice));
    const remaining = item.totalPrice - paidForThisItem;

    return {
      ...item,
      remaining,
      isFullyPaid: remaining <= 0,
    };
  });

  // Only show items that still have remaining balance
  const unpaidItems = itemsWithRemaining.filter((item) => !item.isFullyPaid);

  // Quick amounts based on individual remaining item prices
  const quickAmounts = unpaidItems
    .slice(0, 4)
    .map((item) => ({
      id: item.id,
      label: item.itemName,
      amount: item.remaining,
      fullAmount: item.totalPrice,
      isPartiallyPaid: item.remaining < item.totalPrice,
    }));

  // Add "Full Balance" option
  if (unpaidItems.length > 1 || debt.balance > 0) {
    quickAmounts.push({
      id: "full",
      label: "Full Balance",
      amount: debt.balance,
      fullAmount: debt.balance,
      isPartiallyPaid: false,
    });
  }

  function handlePresetClick(itemId: string, presetAmount: number) {
    setSelectedItemId(itemId);
    setAmount(presetAmount.toString());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden m-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Record Payment</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <User size={13} />
                <span className="font-medium text-gray-700 dark:text-gray-300">{debt.debtorName}</span>
              </div>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                Balance: {formatCurrency(debt.balance)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <DollarSign size={14} />
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400">$</span>
              <input
                type="number"
                min={0.01}
                step="0.01"
                max={debt.balance}
                required
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setSelectedItemId(null);
                }}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 text-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                autoFocus
              />
            </div>

            {/* Quick amounts with item names */}
            {quickAmounts.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {quickAmounts.map((quick) => (
                  <button
                    key={quick.id}
                    type="button"
                    onClick={() => handlePresetClick(quick.id, quick.amount)}
                    className={`py-2 px-3 text-left rounded-lg transition-colors relative ${
                      selectedItemId === quick.id
                        ? "bg-indigo-100 dark:bg-indigo-950 ring-2 ring-indigo-500"
                        : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="block text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                      {quick.label}
                    </span>
                    <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {formatCurrency(quick.amount)}
                    </span>
                    {quick.isPartiallyPaid && (
                      <span className="block text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                        of {formatCurrency(quick.fullAmount)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Show paid items summary */}
            {itemsWithRemaining.filter(i => i.isFullyPaid).length > 0 && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <Check size={12} className="inline mr-1 text-emerald-500" />
                {itemsWithRemaining.filter(i => i.isFullyPaid).length} item{itemsWithRemaining.filter(i => i.isFullyPaid).length !== 1 ? 's' : ''} fully paid
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <CreditCard size={14} />
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((pm) => (
                <button
                  key={pm.value}
                  type="button"
                  onClick={() => setMethod(pm.value)}
                  className={`py-2.5 px-3 text-sm font-medium rounded-xl border transition-all ${
                    method === pm.value
                      ? "bg-indigo-50 dark:bg-indigo-950 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400"
                      : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Notes <span className="text-gray-400 text-xs font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment reference..."
              className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? "Recording..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}