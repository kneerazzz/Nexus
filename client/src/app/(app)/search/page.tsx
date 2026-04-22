"use client";

import { FormEvent, useState } from "react";
import { searchDocuments } from "@/src/api/content";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { getApiErrorMessage } from "@/src/lib/get-api-error";
import type { DocumentItem } from "@/src/types/content";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DocumentItem[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await searchDocuments(query);
      setResults(response.data.documents);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Search failed."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-100">Search</h1>
      <p className="text-zinc-400">
        Search across document title and content using full-text search.
      </p>

      <form
        onSubmit={onSearch}
        className="flex flex-wrap gap-2 rounded-xl border border-zinc-800 bg-zinc-900 p-4"
      >
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for documents..."
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </form>

      {error ? <p className="text-red-400">{error}</p> : null}

      <div className="grid gap-3">
        {results.map((doc) => (
          <article
            key={doc.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
          >
            <h2 className="text-lg font-medium text-zinc-100">{doc.title}</h2>
            <p className="mt-1 text-sm text-zinc-400">
              {doc.description || "No description"}
            </p>
            <p className="mt-2 text-xs text-zinc-500">Type: {doc.file_type}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
