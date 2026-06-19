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
};

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-panel">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-4 text-4xl font-semibold text-ink">{value}</p>
      <p className="mt-3 text-sm text-slate-600">{hint}</p>
    </section>
  );
}

export default function DashboardPage() {
  const { logout } = useAuth();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [quests, setQuests] = useState<QuestInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
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
      }
    }

    void load();
  }, []);

  return (
    <ProtectedRoute>
      <main className="min-h-screen px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="rounded-3xl bg-white p-6 shadow-panel sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
                    XP System
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">
                    Dashboard V1
                  </h1>
                </div>

                <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                  <div className="rounded-2xl border border-line bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Username
                    </p>
                    <p className="mt-1 font-semibold text-ink">
                      {authUser?.username ?? "..."}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-line bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Email
                    </p>
                    <p className="mt-1 font-semibold text-ink">
                      {authUser?.email ?? "..."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-slate-50 p-4 sm:min-w-56">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Session
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Authenticated with current JWT token.
                </p>
                <button
                  onClick={logout}
                  className="mt-4 w-full rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Logout
                </button>
              </div>
            </div>
          </section>

          {loading ? (
            <section className="rounded-3xl bg-white p-8 shadow-panel">
              <p className="text-sm text-slate-600">Loading dashboard...</p>
            </section>
          ) : null}

          {error ? (
            <section className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-panel">
              {error}
            </section>
          ) : null}

          {!loading && !error && profile ? (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Level"
                  value={profile.level}
                  hint="Calculated from total XP."
                />
                <StatCard
                  label="XP"
                  value={profile.xp}
                  hint="Current accumulated experience points."
                />
                <StatCard
                  label="Streak"
                  value={profile.streak}
                  hint="Current completion streak."
                />
                <StatCard
                  label="Fail Streak"
                  value={profile.fail_streak}
                  hint="Current penalty streak."
                />
              </section>

              <section className="rounded-3xl bg-white p-6 shadow-panel sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                      Existing Quests
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-ink">
                      Today&apos;s quest instances
                    </h2>
                  </div>
                  <div className="rounded-full border border-line px-4 py-2 text-sm text-slate-600">
                    {quests.length} total
                  </div>
                </div>

                {quests.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-line bg-slate-50 px-5 py-8 text-sm text-slate-600">
                    No quest instances returned by the current API for today.
                  </div>
                ) : (
                  <div className="mt-6 grid gap-4">
                    {quests.map((quest) => (
                      <article
                        key={quest.id}
                        className="rounded-2xl border border-line bg-slate-50 p-5"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                              Quest #{quest.id}
                            </p>
                            <p className="mt-2 text-lg font-semibold text-ink">
                              Template ID: {quest.template_id}
                            </p>
                          </div>

                          <span className="inline-flex w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                            {quest.state}
                          </span>
                        </div>

                        <dl className="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-2 xl:grid-cols-4">
                          <div>
                            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
                              Date
                            </dt>
                            <dd className="mt-1 font-medium text-ink">{quest.date}</dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
                              Deadline
                            </dt>
                            <dd className="mt-1 font-medium text-ink">
                              {quest.deadline_date ?? "N/A"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
                              Period Key
                            </dt>
                            <dd className="mt-1 font-medium text-ink">
                              {quest.period_key ?? "N/A"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
                              Completed At
                            </dt>
                            <dd className="mt-1 font-medium text-ink">
                              {quest.completed_at ?? "Not completed"}
                            </dd>
                          </div>
                        </dl>
                      </article>
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
