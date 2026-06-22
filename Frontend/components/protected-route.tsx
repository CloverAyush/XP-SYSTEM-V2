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
        <div className="system-panel max-w-sm px-6 py-6 text-sm text-slate-300">
          <p className="system-eyebrow">System Check</p>
          <p className="mt-3 leading-6">
            Verifying hunter authorization. Stand by while the system restores your session.
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
