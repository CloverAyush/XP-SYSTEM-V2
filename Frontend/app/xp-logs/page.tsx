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
          setError(`System warning: ${err.message}`);
        } else {
          setError("System warning: Failed to load XP logs.");
        }
      } finally {
        setLoading(false);
      }
    }

    void loadLogs();
  }, []);

  return (
    <ProtectedRoute>
      <main className="min-h-screen px-4 py-6 text-slate-100 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <section className="system-panel p-5 sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="text-center lg:text-left">
                <p className="system-eyebrow">Chronicle</p>
                <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                  XP Logs
                </h1>
                <p className="mt-3 system-copy">
                  Reverse chronological system history showing each XP gain or penalty, with the reason recorded by the backend.
                </p>
              </div>

              <Link href="/dashboard" className="system-button-secondary">
                Back to Dashboard
              </Link>
            </div>
          </section>

          {loading ? (
            <section className="system-panel p-6">
              <p className="system-copy">Reading the system archive and sorting the most recent XP records...</p>
            </section>
          ) : null}

          {error ? <section className="system-alert system-alert-error">{error}</section> : null}

          {!loading && !error && logs.length === 0 ? (
            <section className="system-panel p-8 text-sm text-slate-400">
              No XP logs found. Clear a quest or trigger a system XP change to populate the archive.
            </section>
          ) : null}

          {!loading && !error && logs.length > 0 ? (
            <section className="system-panel p-5 sm:p-8">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="text-center sm:text-left">
                  <p className="system-eyebrow">Archive Feed</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Latest System Records
                  </h2>
                </div>
                <span className="system-badge">{logs.length} entries</span>
              </div>

              <div className="space-y-4">
                {logs.map((log) => {
                  const isPositive = log.xp_change >= 0;
                  return (
                    <article key={log.id} className="system-card p-5 sm:p-6">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                                isPositive
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : "bg-rose-500/15 text-rose-300"
                              }`}
                            >
                              {isPositive ? "XP Gained" : "XP Deducted"}
                            </span>
                          </div>

                          <p
                            className={`mt-4 text-center text-3xl font-semibold lg:text-left ${
                              isPositive ? "text-emerald-300" : "text-rose-300"
                            }`}
                          >
                            {isPositive ? `+${log.xp_change} XP` : `${log.xp_change} XP`}
                          </p>

                          <p className="mt-4 text-center text-sm leading-6 text-slate-300 lg:text-left">{log.reason}</p>
                        </div>

                        <div className="grid gap-3 text-sm sm:grid-cols-3 lg:w-[320px] lg:grid-cols-1">
                          <div className="rounded-2xl border border-violet-900/30 bg-slate-950/70 px-4 py-4">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Timestamp</p>
                            <p className="mt-2 text-sm font-medium text-slate-200">
                              {formatTimestamp(log.created_at)}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-violet-900/30 bg-slate-950/70 px-4 py-4">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Level Shift</p>
                            <p className="mt-2 text-sm font-medium text-slate-200">{log.level_change}</p>
                          </div>
                          <div className="rounded-2xl border border-violet-900/30 bg-slate-950/70 px-4 py-4">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Streak Shift</p>
                            <p className="mt-2 text-sm font-medium text-slate-200">{log.streak_change}</p>
                          </div>
                        </div>
                      </div>
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
