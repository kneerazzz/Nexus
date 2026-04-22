"use client";

import { ReactNode } from "react";
import Link from "next/link";
import AppSidebar from "@/src/components/layout/app-sidebar";
import { Button } from "@/src/components/ui/button";
import useAuthStore from "@/src/store/authStore";

export default function AppLayout({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <h2 className="text-2xl font-semibold text-zinc-100">Sign in required</h2>
          <p className="mt-2 text-zinc-400">
            Please sign in to access your dashboard, documents, images, and profile.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Link href="/login">
              <Button>Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline">Create account</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <AppSidebar />
      <section className="flex-1 p-4 md:p-8">{children}</section>
    </div>
  );
}
