"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  deleteImage,
  getImages,
  updateImage,
  uploadImage,
} from "@/src/api/content";
import { addTagToImage, getTags, removeTagFromImage } from "@/src/api/tag";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { getApiErrorMessage } from "@/src/lib/get-api-error";
import type { ImageItem } from "@/src/types/content";
import type { TagItem } from "@/src/types/tag";

export default function ImagesPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTagByImage, setSelectedTagByImage] = useState<
    Record<number, string>
  >({});
  const [editingImageId, setEditingImageId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const loadPageData = async () => {
    try {
      const [imagesResponse, tagsResponse] = await Promise.all([
        getImages(),
        getTags(),
      ]);
      setImages(imagesResponse.data.images);
      setTags(tagsResponse.data.tags);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to load images."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const [imagesResponse, tagsResponse] = await Promise.all([
          getImages(),
          getTags(),
        ]);
        if (!active) return;
        setImages(imagesResponse.data.images);
        setTags(tagsResponse.data.tags);
      } catch (requestError) {
        if (!active) return;
        setError(getApiErrorMessage(requestError, "Failed to load images."));
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const onUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("Please choose an image file.");
      return;
    }

    setIsUploading(true);
    setError("");
    try {
      await uploadImage({ file, title });
      setFile(null);
      setTitle("");
      await loadPageData();
    } catch (uploadError) {
      setError(getApiErrorMessage(uploadError, "Failed to upload image."));
    } finally {
      setIsUploading(false);
    }
  };

  const onAddTag = async (imageId: number) => {
    const rawTagId = selectedTagByImage[imageId];
    if (!rawTagId) return;

    try {
      await addTagToImage(imageId, Number(rawTagId));
      await loadPageData();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to add tag to image."));
    }
  };

  const onRemoveTag = async (imageId: number) => {
    const rawTagId = selectedTagByImage[imageId];
    if (!rawTagId) return;
    try {
      await removeTagFromImage(imageId, Number(rawTagId));
      await loadPageData();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to remove tag from image."));
    }
  };

  const onSaveImage = async (imageId: number) => {
    try {
      await updateImage(imageId, { title: editingTitle });
      setEditingImageId(null);
      await loadPageData();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to update image."));
    }
  };

  const onDeleteImage = async (imageId: number) => {
    try {
      await deleteImage(imageId);
      await loadPageData();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to delete image."));
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-100">Images</h1>
      <p className="text-sm text-zinc-400">
        Your visual assets with metadata and tag support.
      </p>

      <form
        onSubmit={onUpload}
        className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 md:grid-cols-2"
      >
        <div className="space-y-2">
          <Label htmlFor="image-title">Title</Label>
          <Input
            id="image-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="image-file">Image file</Label>
          <Input
            id="image-file"
            type="file"
            required
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload image"}
          </Button>
        </div>
      </form>

      {isLoading ? <p className="text-zinc-400">Loading images...</p> : null}
      {error ? <p className="text-red-400">{error}</p> : null}

      {!isLoading && !error && images.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-zinc-400">
          No images found. Upload your first image from this module next.
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        {images.map((image) => (
          <article
            key={image.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
          >
            <h2 className="text-lg font-medium text-zinc-100">{image.title}</h2>
            {editingImageId === image.id ? (
              <div className="mt-3 flex gap-2">
                <Input
                  value={editingTitle}
                  onChange={(event) => setEditingTitle(event.target.value)}
                />
                <Button size="sm" onClick={() => void onSaveImage(image.id)}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingImageId(null)}
                >
                  Cancel
                </Button>
              </div>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
              <span>
                Size: {image.width || "?"} x {image.height || "?"}
              </span>
              <span>Tags: {image.tags || "None"}</span>
              <a
                href={image.file_url}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-300 underline"
              >
                View image
              </a>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <select
                className="h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100"
                value={selectedTagByImage[image.id] ?? ""}
                onChange={(event) =>
                  setSelectedTagByImage((prev) => ({
                    ...prev,
                    [image.id]: event.target.value,
                  }))
                }
              >
                <option value="">Select tag</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void onAddTag(image.id)}
                disabled={!selectedTagByImage[image.id]}
              >
                Add tag
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void onRemoveTag(image.id)}
                disabled={!selectedTagByImage[image.id]}
              >
                Remove tag
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingImageId(image.id);
                  setEditingTitle(image.title);
                }}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void onDeleteImage(image.id)}
              >
                Delete
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
