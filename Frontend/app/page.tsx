"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export default function HomePage() {
  const router = useRouter();
  const { token, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    router.replace(token ? "/dashboard" : "/login");
  }, [isReady, router, token]);

  return null;
}
