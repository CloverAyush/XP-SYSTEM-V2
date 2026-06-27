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
          setError("System warning: Unable to load authenticated user profile.");
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
      setError("System warning: Authenticated user is not loaded yet.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    if (targetDeadline && targetDeadline < todayString) {
      setError("System warning: Target deadline cannot be in the past.");
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

      setSuccess(`System message: Template "${response.title}" registered successfully.`);
      setTimeout(() => {
        router.replace("/dashboard");
      }, 900);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`System warning: ${err.message}`);
      } else {
        setError("System warning: Template creation failed.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const showScheduledDays = questType === "scheduled";
  const showTargetDeadline = questType === "ONE_TIME";

  return (
    <ProtectedRoute>
      <main className="min-h-screen px-4 py-6 text-slate-100 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <section className="system-panel p-5 sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="text-center lg:text-left">
                <p className="system-eyebrow">System Forge</p>
                <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                  Create Quest Template
                </h1>
                <p className="mt-3 max-w-2xl system-copy">
                  Register a new quest template. The system will convert it into quest instances based on your selected type and schedule.
                </p>
              </div>

              <Link href="/dashboard" className="system-button-secondary">
                Back to Dashboard
              </Link>
            </div>
          </section>

          {loadingUser ? (
            <section className="system-panel p-6">
              <p className="system-copy">Synchronizing hunter identity before template submission...</p>
            </section>
          ) : null}

          {error ? <section className="system-alert system-alert-error">{error}</section> : null}
          {success ? <section className="system-alert system-alert-success">{success}</section> : null}

          {!loadingUser && user ? (
            <section className="system-panel p-5 sm:p-8">
              <div className="mb-6 grid gap-4 md:grid-cols-[1.35fr_0.65fr]">
                <div className="system-card p-5 text-center md:text-left">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Template Target</p>
                  <p className="mt-3 text-lg font-semibold text-white">{user.username}</p>
                  <p className="mt-2 text-sm text-slate-400 break-all">{user.email}</p>
                </div>
                <div className="system-card p-5 text-center md:text-left">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">System Hint</p>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    One-time quests require a deadline. Scheduled quests expect lowercase day values like `mon,wed,fri`.
                  </p>
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-300">Title</label>
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Arise Before Dawn"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-300">Description</label>
                    <textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Describe the mission parameters and completion condition."
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Quest Type</label>
                    <select
                      value={questType}
                      onChange={(event) => setQuestType(event.target.value)}
                    >
                      {questTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(event) => setDifficulty(event.target.value)}
                    >
                      {difficulties.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>

                  {showScheduledDays ? (
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Scheduled Days
                      </label>
                      <input
                        value={scheduledDays}
                        onChange={(event) =>
                          setScheduledDays(
                            event.target.value.toLowerCase().replace(/\s+/g, "")
                          )
                        }
                        placeholder="mon,wed,fri"
                        required={showScheduledDays}
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        Lowercase comma-separated day names only for now, for example `mon,wed,fri`.
                      </p>
                    </div>
                  ) : null}

                  {showTargetDeadline ? (
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Target Deadline
                      </label>
                      <input
                        type="date"
                        value={targetDeadline}
                        onChange={(event) => setTargetDeadline(event.target.value)}
                        required={showTargetDeadline}
                        min={todayString}
                      />
                    </div>
                  ) : null}
                </div>

                <button type="submit" disabled={submitting} className="system-button-primary w-full sm:w-auto">
                  {submitting ? "Submitting quest template..." : "Create Quest Template"}
                </button>
              </form>
            </section>
          ) : null}
        </div>
      </main>
    </ProtectedRoute>
  );
}
