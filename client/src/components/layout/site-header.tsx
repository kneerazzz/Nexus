"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut } from "lucide-react";
import { logoutUser } from "@/src/api/auth";
import { Button } from "@/src/components/ui/button";
import useAuthStore from "@/src/store/authStore";

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      clearAuth();
      router.push("/");
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-zinc-100">
          <span className="rounded bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-950">
            NX
          </span>
          <span className="font-semibold">Nexus</span>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-zinc-400 md:block">
                {user?.name ?? "User"}
              </span>
              {!pathname.startsWith("/dashboard") && !isAuthRoute ? (
                <Link href="/dashboard">
                  <Button size="sm" variant="outline">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              ) : null}
              <Button size="sm" variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button size="sm" variant="outline">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
