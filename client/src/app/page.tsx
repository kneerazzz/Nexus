"use client";

import Link from "next/link";
import { ArrowRight, FileText, Image as ImageIcon, Link2, Tag } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import useAuthStore from "@/src/store/authStore";

const highlights = [
  {
    title: "Documents",
    description:
      "Upload, search, and version your files so changes are always trackable.",
    icon: FileText,
  },
  {
    title: "Images",
    description:
      "Store image assets with metadata and organize them in the same workflow.",
    icon: ImageIcon,
  },
  {
    title: "Tags",
    description:
      "Create reusable tags and attach them across documents and images.",
    icon: Tag,
  },
  {
    title: "Relations",
    description:
      "Connect documents and images together to build a knowledge graph.",
    icon: Link2,
  },
];

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 md:p-10">
        <p className="text-sm uppercase tracking-widest text-zinc-500">Nexus Platform</p>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-100 md:text-4xl">
          Centralize documents and images in one connected workspace
        </h1>
        <p className="mt-4 max-w-3xl text-zinc-400">
          Nexus helps you upload assets, tag them, build relations between them,
          and track activity. It is designed for fast retrieval and clear context.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link href="/documents">
                <Button>
                  Open documents <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">Go to dashboard</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/signup">
                <Button>
                  Get started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline">Sign in</Button>
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {highlights.map(({ title, description, icon: Icon }) => (
          <article
            key={title}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <Icon className="h-5 w-5 text-zinc-300" />
            <h2 className="mt-3 text-lg font-semibold text-zinc-100">{title}</h2>
            <p className="mt-1 text-sm text-zinc-400">{description}</p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h3 className="text-lg font-semibold text-zinc-100">How it works</h3>
        <div className="mt-3 grid gap-2 text-sm text-zinc-400">
          <p>1. Create an account and sign in securely.</p>
          <p>2. Upload documents and images to your personal workspace.</p>
          <p>3. Add tags and relations to organize connected knowledge.</p>
          <p>4. Use dashboard and search to retrieve assets quickly.</p>
        </div>
      </section>
    </div>
  );
}
