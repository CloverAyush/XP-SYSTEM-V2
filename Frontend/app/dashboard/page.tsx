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

type CompletionResponse = {
  message: string;
  xp_gained: number;
  total_xp: number;
  level: number;
  user_id: number;
  username: string;
  last_completed_date: string | null;
};

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
    <section className="system-card p-5 sm:p-6">
      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className={`mt-4 text-4xl font-semibold ${accent}`}>{value}</p>
      <p className="mt-3 text-sm text-slate-400">{hint}</p>
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
      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-slate-400">
        <span>Level Progress</span>
        <span>Level {level} to {level + 1}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-900">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-cyan-300"
          style={{ width: `${percent.toFixed(2)}%` }}
        />
      </div>
      <p className="mt-3 text-sm text-slate-400">
        {safeCurrent}/{safeTotal} XP toward the next level.
      </p>
    </div>
  );
}

function QuestCard({
  quest,
  canComplete,
  isCompleting,
  onComplete,
}: {
  quest: QuestInstance;
  canComplete: boolean;
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
    <article className="system-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 text-center lg:text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="system-badge">{quest.quest_type}</span>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-white">{quest.title}</h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            {quest.description || "The system has not attached a quest description to this quest."}
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 lg:items-end">
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
              quest.state === "COMPLETED"
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-cyan-400/15 text-cyan-300"
            }`}
          >
            {quest.state === "COMPLETED" ? "Quest Cleared" : "Active Quest"}
          </span>
          <span className={`text-sm font-semibold uppercase tracking-[0.14em] ${difficultyTone}`}>
            {quest.difficulty}
          </span>
        </div>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-violet-900/30 bg-slate-950/70 px-4 py-4">
          <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">XP Reward</dt>
          <dd className="mt-2 text-lg font-semibold text-violet-200">+{quest.xp_reward} XP</dd>
        </div>
        <div className="rounded-2xl border border-violet-900/30 bg-slate-950/70 px-4 py-4">
          <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Deadline</dt>
          <dd className="mt-2 text-sm font-medium text-slate-200">{quest.deadline_date ?? "No deadline"}</dd>
        </div>
        <div className="rounded-2xl border border-violet-900/30 bg-slate-950/70 px-4 py-4">
          <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Scheduled Date</dt>
          <dd className="mt-2 text-sm font-medium text-slate-200">{quest.date}</dd>
        </div>
        <div className="rounded-2xl border border-violet-900/30 bg-slate-950/70 px-4 py-4">
          <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Completion Record</dt>
          <dd className="mt-2 text-sm font-medium text-slate-200">{quest.completed_at ?? "Pending"}</dd>
        </div>
      </dl>

      {canComplete ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-sm text-slate-400 sm:text-left">
            The system is awaiting confirmation. Clear this quest to claim its XP reward.
          </p>
          <button
            onClick={() => onComplete(quest.id)}
            disabled={isCompleting}
            className="system-button-primary w-full sm:w-auto"
          >
            {isCompleting ? "Confirming clear..." : "Mark as Completed"}
          </button>
        </div>
      ) : null}
    </article>
  );
}

export default function DashboardPage() {
  const { logout } = useAuth();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [quests, setQuests] = useState<QuestInstance[]>([]);
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

      const [userProfile, questList] = await Promise.all([
        apiFetch<UserProfile>(`/users/${me.id}`, { auth: true }),
        apiFetch<QuestInstance[]>(`/quests?user_id=${me.id}`, { auth: true }),
      ]);

      setProfile(userProfile);
      setQuests(questList);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("The system failed to sync your dashboard data.");
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
      const response = await apiFetch<CompletionResponse>(
        `/quests/${questId}/complete`,
        {
          method: "POST",
          auth: true,
        }
      );

      setSuccessMessage(
        `System message: Quest cleared. Gained ${response.xp_gained} XP and updated total to ${response.total_xp} XP.`
      );
      await loadDashboardData(true);
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
      <main className="min-h-screen px-4 py-6 text-slate-100 sm:px-6 sm:py-8">
        <div className="system-shell">
          <section className="system-panel overflow-hidden p-5 sm:p-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1 text-center xl:text-left">
                <p className="system-eyebrow">Solo Leveling System</p>
                <h1 className="mt-3 system-title">Hunter Card</h1>
                <p className="mt-3 max-w-2xl system-copy">
                  {activeQuests.length > 0
                    ? `System notice: ${activeQuests.length} active quest${activeQuests.length > 1 ? "s are" : " is"} available for immediate clearance.`
                    : "System notice: No active quests detected. Create a new template to generate quests."}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                  <div className="system-card px-4 py-4 text-center sm:text-left">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Hunter</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {authUser?.username ?? "Synchronizing..."}
                    </p>
                  </div>
                  <div className="system-card px-4 py-4 text-center sm:text-left">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">System State</p>
                    <p className="mt-2 text-sm font-medium text-violet-200">
                      {refreshing ? "Refreshing quest telemetry..." : "Quest board synchronized"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-sm shrink-0 space-y-3 self-center xl:self-start">
                <div className="system-card p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Control Panel</p>
                  <div className="mt-4 grid gap-3">
                    <Link href="/templates/new" className="system-button-secondary">
                      Create Quest Template
                    </Link>
                    <Link href="/xp-logs" className="system-button-secondary">
                      View XP Logs
                    </Link>
                    <button
                      onClick={logout}
                      className="inline-flex items-center justify-center self-start rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200 hover:border-violet-500/60"
                    >
                      Logout
                    </button>
                  </div>
                </div>

                <div className="system-card p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">XP Channel</p>
                  <div className="mt-4">
                    <ProgressBar current={xpIntoLevel} total={xpRequiredForNextLevel} level={currentLevel} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {loading ? (
            <section className="system-panel p-8">
              <p className="system-eyebrow">System Sync</p>
              <p className="mt-3 system-copy">
                Calibrating hunter records, quest state, and progression telemetry...
              </p>
            </section>
          ) : null}

          {error ? (
            <section className="system-alert system-alert-error">
              {error}
            </section>
          ) : null}

          {!loading && !error && profile ? (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Level"
                  value={profile.level}
                  hint="Current hunter rank."
                  accent="text-violet-200"
                />
                <StatCard
                  label="XP"
                  value={profile.xp}
                  hint="Accumulated system experience."
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
                  hint="Penalty chain being tracked."
                  accent="text-amber-200"
                />
              </section>

              {actionError ? (
                <section className="system-alert system-alert-error">
                  {actionError}
                </section>
              ) : null}

              {successMessage ? (
                <section className="system-alert system-alert-success">
                  {successMessage}
                </section>
              ) : null}

              <section className="system-panel p-5 sm:p-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="text-center sm:text-left">
                    <p className="system-eyebrow">Quest Board</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Active Quests</h2>
                    <p className="mt-2 system-copy">
                      {activeQuests.length > 0
                        ? `System notice: ${activeQuests.length} active quest${activeQuests.length > 1 ? "s are" : " is"} currently ready for clearance.`
                        : "System notice: No active quests detected for today."}
                    </p>
                  </div>
                  <span className="system-badge">
                    {refreshing ? "Refreshing" : `${activeQuests.length} active`}
                  </span>
                </div>

                {activeQuests.length === 0 ? (
                  <div className="mt-6 system-card border-dashed p-6 text-sm text-slate-400">
                    No active quests are currently assigned. Create a template and the system will generate the next quest cycle.
                  </div>
                ) : (
                  <div className="mt-6 grid gap-4">
                    {activeQuests.map((quest) => (
                      <QuestCard
                        key={quest.id}
                        quest={quest}
                        canComplete
                        isCompleting={completingQuestId === quest.id}
                        onComplete={handleCompleteQuest}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section className="system-panel p-5 sm:p-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="text-center sm:text-left">
                    <p className="system-eyebrow">Archive</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Completed Quests</h2>
                    <p className="mt-2 system-copy">
                      Cleared quests remain visible here as system-confirmed records of today&apos;s progress.
                    </p>
                  </div>
                  <span className="system-badge">{completedQuests.length} cleared</span>
                </div>

                {completedQuests.length === 0 ? (
                  <div className="mt-6 system-card border-dashed p-6 text-sm text-slate-400">
                    No completed quests recorded yet. Clear an active quest to populate this archive.
                  </div>
                ) : (
                  <div className="mt-6 grid gap-4">
                    {completedQuests.map((quest) => (
                      <QuestCard
                        key={quest.id}
                        quest={quest}
                        canComplete={false}
                        isCompleting={false}
                        onComplete={handleCompleteQuest}
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : null}
        </div>
      </main>
    </ProtectedRoute>
  );
}
