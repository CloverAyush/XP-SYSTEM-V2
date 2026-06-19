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
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-panel">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
            XP System
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-ink">Login</h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in with your username or email and stored password.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
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
            <label className="mb-2 block text-sm font-medium text-slate-700">
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
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-accentDark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          Need an account?{" "}
          <Link className="font-semibold text-accent" href="/register">
            Register
          </Link>
        </p>
      </section>
    </main>
  );
}
