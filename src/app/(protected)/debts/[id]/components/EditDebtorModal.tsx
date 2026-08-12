// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/debts/[id]/components/EditDebtorModal.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"use client";

import { useState, useEffect } from "react";
import { X, User, Mail, FileText, Key } from "lucide-react";
import { api } from "@/lib/api/client";
import type { Debt } from "../../components/DebtCard";

interface EditDebtorModalProps {
  debt: Debt;
  onClose: () => void;
  onUpdated: (debt: Debt) => void;
}

export function EditDebtorModal({ debt, onClose, onUpdated }: EditDebtorModalProps) {
  const [debtorName, setDebtorName] = useState(debt.debtorName);
  const [debtorEmail, setDebtorEmail] = useState(debt.debtorEmail || "");
  const [notes, setNotes] = useState(debt.notes || "");
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (!debtorName.trim()) {
      setError("Name is required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await api.post<Debt>("/api/debts/update", {
        action: "updateDebt",
        debtId: debt.id,
        debtorName: debtorName.trim(),
        debtorEmail: debtorEmail.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (!res.success || !res.data) {
        setError(res.message || "Failed to update");
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Debtor</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
              <Key size={11} />
              <span className="font-mono text-emerald-600 dark:text-emerald-400">{debt.accessCode}</span>
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
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <User size={14} />
              Name
            </label>
            <input
              type="text"
              required
              value={debtorName}
              onChange={(e) => setDebtorName(e.target.value)}
              placeholder="Debtor name"
              className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <Mail size={14} />
              Email <span className="text-gray-400 text-xs font-normal">(optional)</span>
            </label>
            <input
              type="email"
              value={debtorEmail}
              onChange={(e) => setDebtorEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <FileText size={14} />
              Notes <span className="text-gray-400 text-xs font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
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
              disabled={loading || !debtorName.trim()}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
