"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  Link2,
  Search,
  Tag,
  UserCircle2,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import useAuthStore from "@/src/store/authStore";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/images", label: "Images", icon: ImageIcon },
  { href: "/tags", label: "Tags", icon: Tag },
  { href: "/relations", label: "Relations", icon: Link2 },
  { href: "/search", label: "Search", icon: Search },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  return (
    <aside className="w-full border-r border-zinc-800 bg-zinc-950 md:w-64">
      <nav className="flex h-full flex-col p-4">
        <div className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto rounded-md border border-zinc-800 bg-zinc-900 p-3">
          <Link
            href="/profile"
            className="flex items-center gap-2 text-sm text-zinc-300 hover:text-zinc-100"
          >
            <UserCircle2 className="h-4 w-4" />
            <span>Profile</span>
          </Link>
          <p className="mt-2 truncate text-xs text-zinc-500">
            {user?.email ?? "Not signed in"}
          </p>
        </div>
      </nav>
    </aside>
  );
}
