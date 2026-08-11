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
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--gw-bg)] px-4 py-12">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="text-center">
          <h1 className="font-mono text-[24px] tracking-[0.05em] text-[var(--gw-text)]">
            TRACK YOUR DEBT
          </h1>
          <p className="mt-2 font-mono text-[13px] text-[var(--gw-muted)]">
            Enter your access code to view your balance
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && <Alert variant="error">{error}</Alert>}

            <Input
              label="Access Code"
              id="accessCode"
              name="accessCode"
              type="text"
              autoComplete="off"
              required
              status="key"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="JOHN123"
            />

            <Button type="submit" variant="primary" size="md" loading={loading} className="w-full">
              {loading ? "Looking up..." : "View My Debt"}
            </Button>
          </form>
        </Card>

        {debt && <DebtCard debt={debt} />}
      </div>
    </div>
  );
}