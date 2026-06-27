"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/components/auth-provider";
import { apiFetch, ApiError } from "@/lib/api";

type AuthUser = {
  id: number;
  username: string;
  email: string;
  xp: number;
  level: number;
  streak: number;
  fail_streak: number;
};

type UserProfile = {
  id: number;
  username: string;
  xp: number;
  level: number;
  streak: number;
  fail_streak: number;
};

type QuestInstance = {
  id: number;
  template_id: number;
  user_id: number;
  date: string;
  period_key: string | null;
  state: string;
  completed_at: string | null;
  created_at: string;
  deadline_date: string | null;
  title: string;
  description: string | null;
  quest_type: string;
  difficulty: string;
  xp_reward: number;
};

type XpLog = {
  id: number;
  user_id: number;
  xp_change: number;
  level_change: number;
  streak_change: number;
  reason: string;
  created_at: string;
};

type CompletionResponse = {
  message: string;
  xp_gained: number;
  total_xp: number;
  level: number;
  user_id: number;
  username: string;
  last_completed_date: string | null;
};

type ViewMode = "dashboard" | "quests" | "logs";

function formatTimestamp(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  hint: string;
  accent: string;
}) {
  return (
    <section className="system-card p-4 sm:p-5">
      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className={`mt-3 text-3xl font-semibold sm:text-4xl ${accent}`}>{value}</p>
      <p className="mt-2 text-sm text-slate-400">{hint}</p>
    </section>
  );
}

function ProgressBar({
  current,
  total,
  level,
}: {
  current: number;
  total: number;
  level: number;
}) {
  const safeCurrent = Math.max(0, current);
  const safeTotal = Math.max(1, total);
  const percent = Math.min(100, Math.max(0, (safeCurrent / safeTotal) * 100));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.14em] text-slate-400">
        <span>XP Progress</span>
        <span>Level {level} to {level + 1}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-900">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-cyan-300"
          style={{ width: `${percent.toFixed(2)}%` }}
        />
      </div>
      <p className="mt-3 text-sm text-slate-400">
        {safeCurrent}/{safeTotal} XP until the next level.
      </p>
    </div>
  );
}

function NavButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "system-button-primary min-h-[44px] w-full sm:w-auto"
          : "system-button-secondary min-h-[44px] w-full sm:w-auto"
      }
    >
      {children}
    </button>
  );
}

function SummaryMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="system-card px-4 py-4 text-center">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function QuestCard({
  quest,
  isCompleting,
  onComplete,
}: {
  quest: QuestInstance;
  isCompleting: boolean;
  onComplete: (questId: number) => void;
}) {
  const difficultyTone =
    quest.difficulty === "hard"
      ? "text-rose-300"
      : quest.difficulty === "medium"
        ? "text-amber-300"
        : "text-emerald-300";

  return (
    <article className="system-card p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-white">{quest.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {quest.description || "No description attached to this quest template."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.14em]">
            <span className={`rounded-full bg-slate-900 px-3 py-1 font-semibold ${difficultyTone}`}>
              {quest.difficulty}
            </span>
            <span className="rounded-full bg-slate-900 px-3 py-1 font-semibold text-cyan-200">
              {quest.quest_type}
            </span>
            <span className="rounded-full bg-slate-900 px-3 py-1 font-semibold text-violet-200">
              +{quest.xp_reward} XP
            </span>
            {quest.deadline_date ? (
              <span className="rounded-full bg-slate-900 px-3 py-1 font-semibold text-slate-300">
                Due {quest.deadline_date}
              </span>
            ) : null}
          </div>
        </div>

        <button
          onClick={() => onComplete(quest.id)}
          disabled={isCompleting}
          className="rounded-xl border border-violet-500/50 bg-violet-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-violet-100 hover:border-violet-400 hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCompleting ? "Clearing..." : "Complete"}
        </button>
      </div>
    </article>
  );
}

function LogCard({ log }: { log: XpLog }) {
  const isPositive = log.xp_change >= 0;

  return (
    <article className="system-card p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p
            className={`text-lg font-semibold ${
              isPositive ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {isPositive ? `+${log.xp_change} XP` : `${log.xp_change} XP`}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{log.reason}</p>
        </div>
        <div className="text-sm text-slate-400 sm:text-right">
          <p>{formatTimestamp(log.created_at)}</p>
        </div>
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const { logout } = useAuth();
  const [activeView, setActiveView] = useState<ViewMode>("dashboard");
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [quests, setQuests] = useState<QuestInstance[]>([]);
  const [logs, setLogs] = useState<XpLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [completingQuestId, setCompletingQuestId] = useState<number | null>(null);

  const activeQuests = quests.filter((quest) => quest.state === "ACTIVE");
  const completedQuests = quests.filter((quest) => quest.state === "COMPLETED");

  const currentLevel = profile?.level ?? 0;
  const currentXp = profile?.xp ?? 0;
  const currentLevelFloor = currentLevel * currentLevel * 100;
  const nextLevelCeiling = (currentLevel + 1) * (currentLevel + 1) * 100;
  const xpIntoLevel = Math.max(0, currentXp - currentLevelFloor);
  const xpRequiredForNextLevel = Math.max(1, nextLevelCeiling - currentLevelFloor);

  async function loadDashboardData(showRefreshing = false) {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const me = await apiFetch<AuthUser>("/auth/me", { auth: true });
      setAuthUser(me);

      const [userProfile, questList, logList] = await Promise.all([
        apiFetch<UserProfile>(`/users/${me.id}`, { auth: true }),
        apiFetch<QuestInstance[]>(`/quests?user_id=${me.id}`, { auth: true }),
        apiFetch<XpLog[]>("/xp-logs", { auth: true }),
      ]);

      setProfile(userProfile);
      setQuests(questList);
      setLogs(logList);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("The system failed to sync your hunter data.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadDashboardData();
  }, []);

  async function handleCompleteQuest(questId: number) {
    setActionError("");
    setSuccessMessage("");
    setCompletingQuestId(questId);

    try {
      const response = await apiFetch<CompletionResponse>(`/quests/${questId}/complete`, {
        method: "POST",
        auth: true,
      });

      setSuccessMessage(
        `System notice: Quest cleared. You gained ${response.xp_gained} XP and now hold ${response.total_xp} total XP.`
      );
      await loadDashboardData(true);
      setActiveView("quests");
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(`System warning: ${err.message}`);
      } else {
        setActionError("System warning: Quest completion could not be confirmed.");
      }
    } finally {
      setCompletingQuestId(null);
    }
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen px-4 py-5 text-slate-100 sm:px-6 sm:py-7">
        <div className="system-shell">
          <section className="system-panel p-5 sm:p-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1 text-center lg:text-left">
                  <p className="system-eyebrow">Solo Leveling System</p>
                  <h1 className="mt-2 system-title">Hunter Dashboard</h1>
                  <p className="mt-3 mx-auto max-w-2xl system-copy lg:mx-0">
                    {activeQuests.length > 0
                      ? `${activeQuests.length} active quest${activeQuests.length > 1 ? "s are" : " is"} waiting for clearance. Stay consistent and keep the system satisfied.`
                      : "No active quests are waiting right now. Your board is clear until the next cycle or template trigger."}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px]">
                  <SummaryMetric
                    label="Hunter"
                    value={authUser?.username ?? "Synchronizing..."}
                  />
                  <SummaryMetric
                    label="Status"
                    value={refreshing ? "Refreshing..." : "Synchronized"}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_auto_auto]">
                <NavButton active={activeView === "dashboard"} onClick={() => setActiveView("dashboard")}>
                  Dashboard
                </NavButton>
                <NavButton active={activeView === "quests"} onClick={() => setActiveView("quests")}>
                  Quests
                </NavButton>
                <NavButton active={activeView === "logs"} onClick={() => setActiveView("logs")}>
                  XP Logs
                </NavButton>
                <Link href="/templates/new" className="system-button-secondary min-h-[44px] w-full">
                  Create Template
                </Link>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="w-full sm:max-w-xl">
                  <ProgressBar current={xpIntoLevel} total={xpRequiredForNextLevel} level={currentLevel} />
                </div>
                <button
                  onClick={logout}
                  className="inline-flex min-h-[40px] items-center justify-center self-center rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200 hover:border-violet-500/60 sm:self-auto"
                >
                  Logout
                </button>
              </div>
            </div>
          </section>

          {loading ? (
            <section className="system-panel p-6">
              <p className="system-eyebrow">System Sync</p>
              <p className="mt-3 system-copy">
                Reading hunter stats, quest board, and recent XP records...
              </p>
            </section>
          ) : null}

          {error ? <section className="system-alert system-alert-error">{error}</section> : null}
          {actionError ? <section className="system-alert system-alert-error">{actionError}</section> : null}
          {successMessage ? (
            <section className="system-alert system-alert-success">{successMessage}</section>
          ) : null}

          {!loading && !error && profile && activeView === "dashboard" ? (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Level"
                  value={profile.level}
                  hint="Your current progression tier."
                  accent="text-violet-200"
                />
                <StatCard
                  label="XP"
                  value={profile.xp}
                  hint="Total experience earned so far."
                  accent="text-cyan-200"
                />
                <StatCard
                  label="Streak"
                  value={profile.streak}
                  hint="Consecutive successful days."
                  accent="text-emerald-200"
                />
                <StatCard
                  label="Fail Streak"
                  value={profile.fail_streak}
                  hint="Penalty pressure currently tracked."
                  accent="text-amber-200"
                />
              </section>

              <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <section className="system-panel p-5 sm:p-6">
                  <p className="system-eyebrow">Quick Summary</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">One-look overview</h2>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <SummaryMetric
                      label="Active Quests"
                      value={`${activeQuests.length}`}
                    />
                    <SummaryMetric
                      label="Cleared Today"
                      value={`${completedQuests.length}`}
                    />
                    <SummaryMetric
                      label="Recent Logs"
                      value={`${logs.length}`}
                    />
                  </div>
                  <p className="mt-5 text-sm leading-6 text-slate-400">
                    {activeQuests.length > 0
                      ? `You have ${activeQuests.length} quest${activeQuests.length > 1 ? "s" : ""} ready. Open Quests to clear them with one tap.`
                      : "Your active board is empty right now. Use Create Template to prepare the next quest cycle."}
                  </p>
                </section>

                <section className="system-panel p-5 sm:p-6">
                  <p className="system-eyebrow">Latest Record</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Recent system message</h2>
                  {logs.length > 0 ? (
                    <div className="mt-5">
                      <LogCard log={logs[0]} />
                    </div>
                  ) : (
                    <div className="mt-5 system-card p-5 text-sm text-slate-400">
                      No XP records yet. Clear a quest and the system will start your log history.
                    </div>
                  )}
                </section>
              </section>
            </>
          ) : null}

          {!loading && !error && profile && activeView === "quests" ? (
            <section className="system-panel p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="text-center sm:text-left">
                  <p className="system-eyebrow">Quest Board</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Active Quests</h2>
                  <p className="mt-2 system-copy">
                    Complete active quests before their deadlines to secure your XP and protect your streak.
                  </p>
                </div>
                <span className="system-badge">
                  {refreshing ? "Refreshing" : `${activeQuests.length} active`}
                </span>
              </div>

              {activeQuests.length === 0 ? (
                <div className="mt-6 system-card border-dashed p-6 text-sm text-slate-400">
                  No active quests are assigned right now. Create a template or wait for the next quest cycle.
                </div>
              ) : (
                <div className="mt-6 grid gap-4">
                  {activeQuests.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      isCompleting={completingQuestId === quest.id}
                      onComplete={handleCompleteQuest}
                    />
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {!loading && !error && profile && activeView === "logs" ? (
            <section className="system-panel p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="text-center sm:text-left">
                  <p className="system-eyebrow">XP Archive</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Recent XP Logs</h2>
                  <p className="mt-2 system-copy">
                    Your latest gains and penalties are listed here in reverse chronological order.
                  </p>
                </div>
                <Link href="/xp-logs" className="system-button-secondary w-full sm:w-auto">
                  Open Full Log Page
                </Link>
              </div>

              {logs.length === 0 ? (
                <div className="mt-6 system-card border-dashed p-6 text-sm text-slate-400">
                  No XP logs found yet. Once the system records XP movement, it will appear here.
                </div>
              ) : (
                <div className="mt-6 grid gap-4">
                  {logs.map((log) => (
                    <LogCard key={log.id} log={log} />
                  ))}
                </div>
              )}
            </section>
          ) : null}
        </div>
      </main>
    </ProtectedRoute>
  );
}
