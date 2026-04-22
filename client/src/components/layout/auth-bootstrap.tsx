"use client";

import { useEffect } from "react";
import { getCurrentUser } from "@/src/api/auth";
import useAuthStore from "@/src/store/authStore";

export default function AuthBootstrap() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    const syncAuth = async () => {
      try {
        const response = await getCurrentUser();
        setAuth(response.data.user);
      } catch {
        clearAuth();
      }
    };

    void syncAuth();
  }, [clearAuth, setAuth]);

  return null;
}
