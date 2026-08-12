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
  prefillItemId?: string | null;
  onClose: () => void;
  onUpdated: (debt: Debt) => void;
}

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "E_WALLET", label: "E-Wallet" },
  { value: "OTHER", label: "Other" },
];

export function RecordPaymentModal({ debt, prefillAmount, prefillItemId, onClose, onUpdated }: RecordPaymentModalProps) {
  const [amount, setAmount] = useState(() =>
    prefillAmount && prefillAmount > 0 ? prefillAmount.toString() : ""
  );
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    prefillItemId || null
  );

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

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value);

  // ─── Real per-item remaining, sourced directly from item.paidAmount ───
  const itemsWithRemaining = debt.items.map((item) => {
    const paidForThisItem = item.paidAmount ?? 0;
    const remaining = Math.max(0, item.totalPrice - paidForThisItem);
    return {
      ...item,
      remaining,
      isFullyPaid: remaining <= 0,
    };
  });

  const unpaidItems = itemsWithRemaining.filter((item) => !item.isFullyPaid);
  const fullyPaidItems = itemsWithRemaining.filter((item) => item.isFullyPaid);

  const quickAmounts = unpaidItems.slice(0, 4).map((item) => ({
    id: item.id,
    label: item.itemName,
    amount: item.remaining,
    fullAmount: item.totalPrice,
    isPartiallyPaid: item.remaining < item.totalPrice,
  }));

  // "Full Balance" is only offered as a one-tap preset when there's exactly
  // one unpaid item left — a single ItemPayment can't span multiple items,
  // so offering it with >1 unpaid item would misattribute the payment.
  const singleUnpaidItem = unpaidItems.length === 1 ? unpaidItems[0] : null;
  if (singleUnpaidItem && singleUnpaidItem.remaining === debt.balance) {
    quickAmounts.push({
      id: singleUnpaidItem.id,
      label: "Full Balance",
      amount: debt.balance,
      fullAmount: debt.balance,
      isPartiallyPaid: false,
    });
  }

  function handlePresetClick(itemId: string, presetAmount: number) {
    setSelectedItemId(itemId);
    setAmount(presetAmount.toString());
    setError("");
  }

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

    // Resolve which item this payment applies to.
    let activeItemId: string | null =
      selectedItemId && selectedItemId !== "prefilled" ? selectedItemId : null;

    if (!activeItemId) {
      if (unpaidItems.length === 1) {
        // Only one item left to pay — safe to default to it.
        activeItemId = unpaidItems[0].id;
      } else if (unpaidItems.length > 1) {
        setError("Multiple items are unpaid — please select which item this payment is for");
        return;
      }
    }

    if (!activeItemId) {
      setError("No unpaid item available to apply this payment to");
      return;
    }

    const targetItem = itemsWithRemaining.find((i) => i.id === activeItemId);
    if (!targetItem) {
      setError("Selected item not found");
      return;
    }
    if (paymentAmount > targetItem.remaining) {
      setError(
        `Amount cannot exceed this item's remaining balance of ${formatCurrency(targetItem.remaining)}`
      );
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await api.post<Debt>("/api/debts/payment", {
        debtId: debt.id,
        itemId: activeItemId,
        amount: paymentAmount,
        method,
        notes: notes || undefined,
      });

      if (!res.success || !res.data) {
        setError(res.message || "Failed to record payment");
        return;
      }

      onUpdated(res.data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
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
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400">₱</span>
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
                  setError("");
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
                    key={`${quick.id}-${quick.label}`}
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

            {/* Manual item picker — shown when multiple items are unpaid and
                no preset has been selected, so the amount can be attributed
                correctly instead of guessing. */}
            {unpaidItems.length > 1 && !selectedItemId && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                Multiple items are unpaid — tap one above to apply this payment to it.
              </p>
            )}

            {/* Show paid items summary */}
            {fullyPaidItems.length > 0 && (
              <div className="mt-3 space-y-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Check size={12} className="text-emerald-500" />
                  {fullyPaidItems.length} item{fullyPaidItems.length !== 1 ? "s" : ""} fully paid
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {fullyPaidItems.map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                    >
                      <Check size={10} />
                      {item.itemName}
                    </span>
                  ))}
                </div>
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