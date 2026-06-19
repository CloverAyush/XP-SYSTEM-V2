"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

type RegisterResponse = {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
};

export default function RegisterPage() {
  const router = useRouter();
  const { token, isReady } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isReady && token) {
      router.replace("/dashboard");
    }
  }, [isReady, router, token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const response = await apiFetch<RegisterResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });

      setSuccess(response.message);
      setTimeout(() => {
        router.replace("/login");
      }, 800);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Registration failed");
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
          <h1 className="mt-3 text-3xl font-semibold text-ink">Register</h1>
          <p className="mt-2 text-sm text-slate-600">
            Create an account using the documented auth API.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="alice"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="alice@example.com"
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
              placeholder="Choose a password"
              required
            />
          </div>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-accentDark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          Already registered?{" "}
          <Link className="font-semibold text-accent" href="/login">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
