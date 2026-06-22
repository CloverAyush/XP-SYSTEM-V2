"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { apiFetch, ApiError } from "@/lib/api";

type XpLog = {
  id: number;
  user_id: number;
  xp_change: number;
  level_change: number;
  streak_change: number;
  reason: string;
  created_at: string;
};

function formatTimestamp(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

export default function XpLogsPage() {
  const [logs, setLogs] = useState<XpLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLogs() {
      setError("");

      try {
        const response = await apiFetch<XpLog[]>("/xp-logs", { auth: true });
        setLogs(response);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to load XP logs");
        }
      } finally {
        setLoading(false);
      }
    }

    void loadLogs();
  }, []);

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-panel sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-300">
                  XP System
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-white">
                  XP Logs
                </h1>
                <p className="mt-2 text-sm text-slate-400">
                  Authenticated XP log history in reverse chronological order.
                </p>
              </div>

              <Link
                href="/dashboard"
                className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-white hover:border-slate-500 hover:bg-slate-950"
              >
                Back to Dashboard
              </Link>
            </div>
          </section>

          {loading ? (
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">
              Loading XP logs...
            </section>
          ) : null}

          {error ? (
            <section className="rounded-3xl border border-red-900 bg-red-950/50 p-6 text-sm text-red-300">
              {error}
            </section>
          ) : null}

          {!loading && !error && logs.length === 0 ? (
            <section className="rounded-3xl border border-dashed border-slate-800 bg-slate-900 p-8 text-sm text-slate-400">
              No XP log entries found for this user.
            </section>
          ) : null}

          {!loading && !error && logs.length > 0 ? (
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-panel sm:p-8">
              <div className="space-y-4">
                {logs.map((log) => {
                  const isPositive = log.xp_change >= 0;

                  return (
                    <article
                      key={log.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                            XP Change
                          </p>
                          <p
                            className={`mt-2 text-2xl font-semibold ${
                              isPositive ? "text-emerald-300" : "text-red-300"
                            }`}
                          >
                            {isPositive ? `+${log.xp_change}` : log.xp_change}
                          </p>
                        </div>

                        <div className="text-sm text-slate-400">
                          {formatTimestamp(log.created_at)}
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-slate-300">
                        {log.reason}
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </ProtectedRoute>
  );
}
