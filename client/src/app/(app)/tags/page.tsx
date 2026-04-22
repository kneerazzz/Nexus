"use client";

import { FormEvent, useEffect, useState } from "react";
import { createTag, deleteTag, getTags } from "@/src/api/tag";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { getApiErrorMessage } from "@/src/lib/get-api-error";
import type { TagItem } from "@/src/types/tag";

export default function TagsPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#977e7c");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadTags = async () => {
    try {
      const response = await getTags();
      setTags(response.data.tags);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to load tags."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const response = await getTags();
        if (!active) return;
        setTags(response.data.tags);
      } catch (requestError) {
        if (!active) return;
        setError(getApiErrorMessage(requestError, "Failed to load tags."));
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const onCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      await createTag({ name, color });
      setName("");
      setColor("#977e7c");
      await loadTags();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to create tag."));
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async (tagId: number) => {
    try {
      await deleteTag(tagId);
      await loadTags();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to delete tag."));
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-100">Tags</h1>
      <p className="text-zinc-400">
        Create, edit, and assign tags to both documents and images.
      </p>

      <form
        onSubmit={onCreate}
        className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 md:grid-cols-3"
      >
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="tag-name">Tag name</Label>
          <Input
            id="tag-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tag-color">Color</Label>
          <Input
            id="tag-color"
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
          />
        </div>
        <div className="md:col-span-3">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Creating..." : "Create tag"}
          </Button>
        </div>
      </form>

      {isLoading ? <p className="text-zinc-400">Loading tags...</p> : null}
      {error ? <p className="text-red-400">{error}</p> : null}

      <div className="grid gap-3 md:grid-cols-2">
        {tags.map((tag) => (
          <article
            key={tag.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-medium text-zinc-100">{tag.name}</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Documents: {tag.document_count} | Images: {tag.image_count}
                </p>
              </div>
              <span
                className="h-5 w-5 rounded-full border border-zinc-700"
                style={{ backgroundColor: tag.color }}
              />
            </div>
            <div className="mt-4">
              <Button size="sm" variant="ghost" onClick={() => void onDelete(tag.id)}>
                Delete
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
