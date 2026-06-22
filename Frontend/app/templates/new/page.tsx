"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
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

type TemplateResponse = {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  quest_type: string;
  difficulty: string;
  scheduled_days: string | null;
  is_active: boolean;
  created_at: string;
  target_deadline: string | null;
};

const questTypes = ["DAILY", "WEEKLY", "MONTHLY", "scheduled", "ONE_TIME"];
const difficulties = ["easy", "medium", "hard"];

export default function NewTemplatePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questType, setQuestType] = useState("DAILY");
  const [difficulty, setDifficulty] = useState("medium");
  const [scheduledDays, setScheduledDays] = useState("");
  const [targetDeadline, setTargetDeadline] = useState("");
  const todayString = new Date().toISOString().split("T")[0];

  useEffect(() => {
    async function loadUser() {
      setError("");
      try {
        const me = await apiFetch<AuthUser>("/auth/me", { auth: true });
        setUser(me);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to load authenticated user");
        }
      } finally {
        setLoadingUser(false);
      }
    }

    void loadUser();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      setError("Authenticated user is not loaded yet");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    if (targetDeadline && targetDeadline < todayString) {
      setError("Target deadline cannot be in the past");
      setSubmitting(false);
      return;
    }

    const params = new URLSearchParams({
      user_id: String(user.id),
      title,
      description,
      quest_type: questType,
      difficulty,
    });

    if (scheduledDays.trim()) {
      params.set("scheduled_days", scheduledDays.trim());
    }

    if (targetDeadline) {
      params.set("target_deadline", targetDeadline);
    }

    try {
      const response = await apiFetch<TemplateResponse>(
        `/quest-templates?${params.toString()}`,
        {
          method: "POST",
          auth: true,
        }
      );

      setSuccess(`Template created: ${response.title}`);
      setTimeout(() => {
        router.replace("/dashboard");
      }, 900);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to create quest template");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const showScheduledDays = questType === "scheduled";
  const showTargetDeadline = questType === "ONE_TIME";

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-panel sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-300">
                  XP System
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-white">
                  Create Quest Template
                </h1>
                <p className="mt-2 text-sm text-slate-400">
                  This submits directly to the existing `POST /quest-templates` API using your current JWT session.
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

          {loadingUser ? (
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">
              Loading user session...
            </section>
          ) : null}

          {error ? (
            <section className="rounded-3xl border border-red-900 bg-red-950/50 p-6 text-sm text-red-300">
              {error}
            </section>
          ) : null}

          {success ? (
            <section className="rounded-3xl border border-emerald-900 bg-emerald-950/40 p-6 text-sm text-emerald-300">
              {success}
            </section>
          ) : null}

          {!loadingUser && user ? (
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-panel sm:p-8">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Title
                    </label>
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Morning Run"
                      required
                      className="border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Run 5km before work"
                      rows={4}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Quest Type
                    </label>
                    <select
                      value={questType}
                      onChange={(event) => setQuestType(event.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    >
                      {questTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Difficulty
                    </label>
                    <select
                      value={difficulty}
                      onChange={(event) => setDifficulty(event.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    >
                      {difficulties.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>

                  {showScheduledDays ? (
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Scheduled Days
                      </label>
                      <input
                        value={scheduledDays}
                        onChange={(event) => setScheduledDays(event.target.value)}
                        placeholder="mon,wed,fri"
                        required={showScheduledDays}
                        className="border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20"
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        Comma-separated lowercase day names expected by the current backend, for example `mon,wed,fri`.
                      </p>
                    </div>
                  ) : null}

                  {showTargetDeadline ? (
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Target Deadline
                      </label>
                      <input
                        type="date"
                        value={targetDeadline}
                        onChange={(event) => setTargetDeadline(event.target.value)}
                        required={showTargetDeadline}
                        min={todayString}
                        className="border-slate-700 bg-slate-950 text-slate-100 focus:border-cyan-400 focus:ring-cyan-400/20"
                      />
                    </div>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-4 text-sm text-slate-400">
                  Template will be created for user:{" "}
                  <span className="font-semibold text-white">{user.username}</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Creating template..." : "Create Quest Template"}
                </button>
              </form>
            </section>
          ) : null}
        </div>
      </main>
    </ProtectedRoute>
  );
}
