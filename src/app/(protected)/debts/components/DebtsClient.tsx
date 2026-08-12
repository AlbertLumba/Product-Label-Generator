// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/debts/components/DebtsClient.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"use client";

import { useState, useEffect } from "react";
import { Plus, Receipt } from "lucide-react";
import { api } from "@/lib/api/client";
import { DebtsList } from "./DebtsList";
import { NewDebtModal } from "./NewDebtModal";
import type { Debt } from "./DebtCard";

interface DebtsClientProps {
  initialDebts: Debt[];
}

const POLL_INTERVAL_MS = 5000;

export function DebtsClient({ initialDebts }: DebtsClientProps) {
  const [debts, setDebts] = useState<Debt[]>(initialDebts);
  const [showModal, setShowModal] = useState(false);

  function handleDebtCreated(debt: Debt) {
    setDebts((prev) => [debt, ...prev]);
    setShowModal(false);
  }

  // Lightweight polling so changes from other sessions/tabs show up without
  // a manual page refresh. Silent on failure — keeps showing the last known
  // list rather than flashing an error on a transient network blip.
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get<Debt[]>("/api/debts/fetch");
        if (res.success && res.data) {
          setDebts(res.data);
        }
      } catch {
        // ignore — will retry on next tick
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950 rounded-xl flex items-center justify-center">
            <Receipt size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Debts</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {debts.length} debt{debts.length === 1 ? "" : "s"} on record
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus size={16} />
          New Debt
        </button>
      </div>

      <DebtsList debts={debts} />

      {showModal && (
        <NewDebtModal
          onClose={() => setShowModal(false)}
          onCreated={handleDebtCreated}
        />
      )}
    </div>
  );
}