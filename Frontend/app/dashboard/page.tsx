"use client";

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
  accent,
}: {
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-panel">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className={`mt-4 text-4xl font-semibold ${accent}`}>{value}</p>
    </section>
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
  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Quest #{quest.id}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">
            {quest.title}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            {quest.description || "No description provided for this quest."}
          </p>
        </div>

        <span
          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
            quest.state === "COMPLETED"
              ? "bg-emerald-500/15 text-emerald-300"
              : "bg-cyan-500/15 text-cyan-300"
          }`}
        >
          {quest.state}
        </span>
      </div>

      <dl className="mt-5 grid gap-4 text-sm text-slate-300 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Quest Type
          </dt>
          <dd className="mt-1">{quest.quest_type}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Difficulty
          </dt>
          <dd className="mt-1">{quest.difficulty}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Deadline Date
          </dt>
          <dd className="mt-1">{quest.deadline_date ?? "N/A"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Completed At
          </dt>
          <dd className="mt-1">{quest.completed_at ?? "Not completed"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
            XP Reward
          </dt>
          <dd className="mt-1">{quest.xp_reward}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span>Date: {quest.date}</span>
        <span>State: {quest.state}</span>
        <span>Period Key: {quest.period_key ?? "N/A"}</span>
      </div>

      {canComplete ? (
        <button
          onClick={() => onComplete(quest.id)}
          disabled={isCompleting}
          className="mt-5 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCompleting ? "Completing..." : "Complete Quest"}
        </button>
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
        setError("Failed to load dashboard data");
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
        `${response.message}. Gained ${response.xp_gained} XP.`
      );
      await loadDashboardData(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(err.message);
      } else {
        setActionError("Failed to complete quest");
      }
    } finally {
      setCompletingQuestId(null);
    }
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-panel sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-300">
                    XP System
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
                    Quest Dashboard
                  </h1>
                </div>

                <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Username
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      {authUser?.username ?? "..."}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      User Info
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      {authUser?.email ?? "Authenticated user"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:min-w-64">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Logout
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  JWT session is active and automatically attached to protected requests.
                </p>
                <button
                  onClick={logout}
                  className="mt-4 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </section>

          {loading ? (
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
              <p className="text-sm text-slate-400">Loading dashboard and quests...</p>
            </section>
          ) : null}

          {error ? (
            <section className="rounded-3xl border border-red-900 bg-red-950/50 p-6 text-sm text-red-300">
              {error}
            </section>
          ) : null}

          {!loading && !error && profile ? (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Level" value={profile.level} accent="text-cyan-300" />
                <StatCard label="XP" value={profile.xp} accent="text-white" />
                <StatCard label="Streak" value={profile.streak} accent="text-emerald-300" />
                <StatCard
                  label="Fail Streak"
                  value={profile.fail_streak}
                  accent="text-amber-300"
                />
              </section>

              <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                      Today
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Active Quests
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                      Complete active quests here. The quest list refreshes after each successful completion.
                    </p>
                  </div>

                  <div className="rounded-full border border-slate-800 px-4 py-2 text-sm text-slate-400">
                    {refreshing ? "Refreshing..." : `${activeQuests.length} active`}
                  </div>
                </div>

                {actionError ? (
                  <div className="mt-6 rounded-2xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                    {actionError}
                  </div>
                ) : null}

                {successMessage ? (
                  <div className="mt-6 rounded-2xl border border-emerald-900 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300">
                    {successMessage}
                  </div>
                ) : null}

                {activeQuests.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-slate-800 bg-slate-950 px-5 py-8 text-sm text-slate-400">
                    No active quests returned for today.
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

              <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                      Today
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Completed Quests
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                      Completed quest instances returned by the current day quest API.
                    </p>
                  </div>

                  <div className="rounded-full border border-slate-800 px-4 py-2 text-sm text-slate-400">
                    {completedQuests.length} completed
                  </div>
                </div>

                {completedQuests.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-slate-800 bg-slate-950 px-5 py-8 text-sm text-slate-400">
                    No completed quests returned for today.
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
