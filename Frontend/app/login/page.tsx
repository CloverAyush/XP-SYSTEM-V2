"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

type LoginResponse = {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
};

export default function LoginPage() {
  const router = useRouter();
  const { login, token, isReady } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isReady && token) {
      router.replace("/dashboard");
    }
  }, [isReady, router, token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      });

      login(response.access_token);
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Login failed");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="system-panel w-full max-w-md p-8">
        <div className="mb-8">
          <p className="system-eyebrow">Solo Leveling System</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Enter the Gate</h1>
          <p className="mt-2 text-sm text-slate-400">
            Authentication required. Sign in with your hunter account to access your active quests and progression data.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Username or email
            </label>
            <input
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="alice or alice@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              required
            />
          </div>

          {error ? (
            <p className="system-alert system-alert-error">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="system-button-primary w-full"
          >
            {submitting ? "Syncing with the system..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-400">
          Need an account?{" "}
          <Link className="font-semibold text-violet-300" href="/register">
            Register
          </Link>
        </p>
      </section>
    </main>
  );
}
