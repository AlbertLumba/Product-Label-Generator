// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/debts/[id]/components/AddItemModal.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api/client";
import type { Debt } from "../../components/DebtCard";

interface ItemRow {
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

const emptyItem = (): ItemRow => ({
  itemName: "",
  description: "",
  quantity: 1,
  unitPrice: 0,
});

interface AddItemModalProps {
  debt: Debt;
  onClose: () => void;
  onUpdated: (debt: Debt) => void;
}

export function AddItemModal({ debt, onClose, onUpdated }: AddItemModalProps) {
  const [items, setItems] = useState<ItemRow[]>([emptyItem()]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  function updateItem(index: number, patch: Partial<ItemRow>) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      // Use the same register endpoint — it auto-detects existing debtor
      const res = await api.post<Debt>("/api/debts/register", {
        debtorName: debt.debtorName,
        debtorEmail: debt.debtorEmail || undefined,
        items: items.map((item) => ({
          itemName: item.itemName,
          description: item.description || undefined,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });

      if (!res.success || !res.data) {
        setError(res.message || "Failed to add items");
        return;
      }

      onUpdated(res.data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden m-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Items</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Adding to <span className="font-medium text-gray-700 dark:text-gray-300">{debt.debtorName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 flex flex-col gap-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3">
              {items.map((item, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-[1fr_80px_100px] gap-3">
                        <input
                          type="text"
                          required
                          value={item.itemName}
                          onChange={(e) => updateItem(index, { itemName: e.target.value })}
                          placeholder="Item name"
                          className="px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                        <input
                          type="number"
                          min={1}
                          required
                          value={item.quantity}
                          onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                          placeholder="Qty"
                          className="px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            required
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, { unitPrice: Number(e.target.value) })}
                            placeholder="0.00"
                            className="w-full pl-7 pr-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, { description: e.target.value })}
                        placeholder="Description (optional)"
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl transition-all"
            >
              <Plus size={16} />
              Add another item
            </button>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">New Items Total</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Items"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}