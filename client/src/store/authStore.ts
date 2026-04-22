"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/src/types/auth";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User) => void;
  clearAuth: () => void;
  updateUser: (user: User) => void;
};

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),
      clearAuth: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
      updateUser: (user) =>
        set({
          user,
        }),
    }),
    {
      name: "nexus-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;