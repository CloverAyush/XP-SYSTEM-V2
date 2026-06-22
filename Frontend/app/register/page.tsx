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
      <section className="system-panel w-full max-w-md p-8">
        <div className="mb-8">
          <p className="system-eyebrow">Solo Leveling System</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Awaken Hunter</h1>
          <p className="mt-2 text-sm text-slate-400">
            Register your account to unlock quest tracking, XP gain, streak progression, and system logs.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
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
            <label className="mb-2 block text-sm font-medium text-slate-300">
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
            <label className="mb-2 block text-sm font-medium text-slate-300">
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
            <p className="system-alert system-alert-error">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="system-alert system-alert-success">
              {success}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="system-button-primary w-full"
          >
            {submitting ? "Initializing hunter profile..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-400">
          Already registered?{" "}
          <Link className="font-semibold text-violet-300" href="/login">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
