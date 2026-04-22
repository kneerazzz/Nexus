"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Files, Image as ImageIcon, Link2, Tag } from "lucide-react";
import { getActivityLogs } from "@/src/api/activity";
import { getApiErrorMessage } from "@/src/lib/get-api-error";
import useAuthStore from "@/src/store/authStore";
import type { ActivityItem } from "@/src/types/activity";

const modules = [
  {
    href: "/documents",
    title: "Documents",
    description: "Manage uploads, metadata, and versions.",
    icon: Files,
  },
  {
    href: "/images",
    title: "Images",
    description: "Browse and organize visual assets.",
    icon: ImageIcon,
  },
  {
    href: "/tags",
    title: "Tags",
    description: "Create reusable taxonomy for content.",
    icon: Tag,
  },
  {
    href: "/relations",
    title: "Relations",
    description: "Connect related documents and images.",
    icon: Link2,
  },
];

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      try {
        const response = await getActivityLogs();
        if (!active) return;
        setActivity(response.data.logs);
      } catch (requestError) {
        if (!active) return;
        setError(getApiErrorMessage(requestError, "Failed to load activity."));
      }
    };
    void bootstrap();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold text-zinc-100">
          Welcome, {user?.name ?? "User"}
        </h1>
        <p className="mt-2 text-zinc-400">
          This is your Nexus dashboard. Use the modules below to manage your
          workspace.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {modules.map(({ href, title, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700"
          >
            <Icon className="h-5 w-5 text-zinc-300" />
            <h2 className="mt-3 text-lg font-semibold text-zinc-100">{title}</h2>
            <p className="mt-1 text-sm text-zinc-400">{description}</p>
          </Link>
        ))}
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-lg font-semibold text-zinc-100">Recent activity</h2>
        {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
        <div className="mt-3 space-y-2 text-sm text-zinc-400">
          {activity.slice(0, 10).map((item) => (
            <p key={item.id}>
              {item.action} {item.entity_type ? `(${item.entity_type})` : ""}
            </p>
          ))}
          {!activity.length ? <p>No activity yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
