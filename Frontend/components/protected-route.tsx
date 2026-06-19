"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, isReady } = useAuth();

  useEffect(() => {
    if (isReady && !token) {
      router.replace("/login");
    }
  }, [isReady, router, token]);

  if (!isReady || !token) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-2xl bg-white px-6 py-5 text-sm text-slate-600 shadow-panel">
          Checking authentication...
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
