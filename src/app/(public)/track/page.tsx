// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(public)/track/page.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"use client";


import { useState } from "react";
import { api } from "@/lib/api/client";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { DebtCard, type Debt } from "@/app/(protected)/debts/components/DebtCard";

export default function TrackPage() {
  const [accessCode, setAccessCode] = useState("");
  const [debt, setDebt] = useState<Debt | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();


    if (loading) return;

    setError("");
    setDebt(null);
    setLoading(true);

    try {
      const res = await api.post<Debt>("/api/public/debts/lookup", { accessCode });

      if (!res.success || !res.data) {
        setError(res.message);
        return;
      }

      setDebt(res.data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-8 sm:py-12">
      <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl flex flex-col gap-4 sm:gap-6">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Track Your Debt & Never Pay
          </h1>
          <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400">
            Enter your access code to view your balance
          </p>
        </div>

        <Card className="p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
            {error && <Alert variant="error">{error}</Alert>}

            <Input
              label="Access Code"
              id="accessCode"
              name="accessCode"
              type="text"
              autoComplete="off"
              required
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              placeholder="JOHN123"
              className="text-base sm:text-sm"
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full py-3 sm:py-2.5"
            >
              {loading ? "Looking up..." : "View My Debt"}
            </Button>
          </form>
        </Card>

        {/* DebtCard now shows, per payment, which item it was applied to
            (via the itemName field the lookup API attaches) — no separate
            "Payment History" section needed here anymore. */}
        {debt && <DebtCard debt={debt} />}
      </div>
    </div>
  );
}