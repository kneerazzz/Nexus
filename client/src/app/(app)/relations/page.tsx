"use client";

import { FormEvent, useEffect, useState } from "react";
import { getDocuments, getImages } from "@/src/api/content";
import {
  createRelation,
  deleteRelation,
  getRelationsForEntity,
} from "@/src/api/relation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { getApiErrorMessage } from "@/src/lib/get-api-error";
import type { DocumentItem, ImageItem } from "@/src/types/content";
import type { RelationItem } from "@/src/types/relation";

export default function RelationsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [relations, setRelations] = useState<RelationItem[]>([]);
  const [sourceType, setSourceType] = useState<"document" | "image">("document");
  const [sourceId, setSourceId] = useState("");
  const [targetType, setTargetType] = useState<"document" | "image">("image");
  const [targetId, setTargetId] = useState("");
  const [relationLabel, setRelationLabel] = useState("");
  const [browseType, setBrowseType] = useState<"document" | "image">("document");
  const [browseId, setBrowseId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const [documentsResponse, imagesResponse] = await Promise.all([
          getDocuments(),
          getImages(),
        ]);
        if (!active) return;
        setDocuments(documentsResponse.data.documents);
        setImages(imagesResponse.data.images);
      } catch (requestError) {
        if (!active) return;
        setError(getApiErrorMessage(requestError, "Failed to load entities."));
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const onCreateRelation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      await createRelation({
        source_type: sourceType,
        source_id: Number(sourceId),
        target_type: targetType,
        target_id: Number(targetId),
        relation_label: relationLabel || undefined,
      });
      setRelationLabel("");
      if (browseId) {
        const response = await getRelationsForEntity(browseType, Number(browseId));
        setRelations(response.data.relations);
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to create relation."));
    }
  };

  const onLoadRelations = async () => {
    if (!browseId) return;
    setError("");
    try {
      const response = await getRelationsForEntity(browseType, Number(browseId));
      setRelations(response.data.relations);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to fetch relations."));
    }
  };

  const onDeleteRelation = async (relationId: number) => {
    try {
      await deleteRelation(relationId);
      await onLoadRelations();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to delete relation."));
    }
  };

  const sourceOptions = sourceType === "document" ? documents : images;
  const targetOptions = targetType === "document" ? documents : images;
  const browseOptions = browseType === "document" ? documents : images;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-100">Relations</h1>
      <p className="text-zinc-400">
        Connect documents and images to build contextual links.
      </p>

      {isLoading ? <p className="text-zinc-400">Loading entities...</p> : null}
      {error ? <p className="text-red-400">{error}</p> : null}

      <form
        onSubmit={onCreateRelation}
        className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 md:grid-cols-2"
      >
        <div className="space-y-2">
          <Label>Source type</Label>
          <select
            className="h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100"
            value={sourceType}
            onChange={(event) => setSourceType(event.target.value as "document" | "image")}
          >
            <option value="document">Document</option>
            <option value="image">Image</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Source item</Label>
          <select
            className="h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100"
            value={sourceId}
            onChange={(event) => setSourceId(event.target.value)}
            required
          >
            <option value="">Select source</option>
            {sourceOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Target type</Label>
          <select
            className="h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100"
            value={targetType}
            onChange={(event) => setTargetType(event.target.value as "document" | "image")}
          >
            <option value="document">Document</option>
            <option value="image">Image</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Target item</Label>
          <select
            className="h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100"
            value={targetId}
            onChange={(event) => setTargetId(event.target.value)}
            required
          >
            <option value="">Select target</option>
            {targetOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="relation-label">Relation label (optional)</Label>
          <Input
            id="relation-label"
            value={relationLabel}
            onChange={(event) => setRelationLabel(event.target.value)}
            placeholder="e.g. references, derived-from"
          />
        </div>
        <div className="md:col-span-2">
          <Button type="submit">Create relation</Button>
        </div>
      </form>

      <div className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 md:grid-cols-[180px_1fr_auto]">
        <select
          className="h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100"
          value={browseType}
          onChange={(event) => setBrowseType(event.target.value as "document" | "image")}
        >
          <option value="document">Document</option>
          <option value="image">Image</option>
        </select>
        <select
          className="h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100"
          value={browseId}
          onChange={(event) => setBrowseId(event.target.value)}
        >
          <option value="">Select entity to view relations</option>
          {browseOptions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
        <Button variant="outline" onClick={() => void onLoadRelations()} disabled={!browseId}>
          Load relations
        </Button>
      </div>

      <div className="grid gap-3">
        {relations.map((relation) => (
          <article
            key={relation.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
          >
            <p className="text-sm text-zinc-300">
              {relation.source_type} #{relation.source_id} → {relation.target_type} #
              {relation.target_id}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Label: {relation.relation_label || "none"}
            </p>
            <div className="mt-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void onDeleteRelation(relation.id)}
              >
                Delete relation
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
