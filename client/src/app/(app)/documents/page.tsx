"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  deleteDocument,
  getDocumentVersions,
  getDocuments,
  updateDocument,
  uploadDocument,
  uploadDocumentVersion,
} from "@/src/api/content";
import {
  addTagToDocument,
  getTags,
  removeTagFromDocument,
} from "@/src/api/tag";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { getApiErrorMessage } from "@/src/lib/get-api-error";
import type { DocumentItem, DocumentVersionItem } from "@/src/types/content";
import type { TagItem } from "@/src/types/tag";

const buildDocumentViewUrl = (fileUrl: string, fileType?: string | null) => {
  const lowerType = (fileType ?? "").toLowerCase();
  const isOfficeDoc =
    lowerType.includes("msword") ||
    lowerType.includes(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

  if (isOfficeDoc) {
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`;
  }

  return fileUrl;
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTagByDoc, setSelectedTagByDoc] = useState<Record<number, string>>(
    {}
  );
  const [editingDocId, setEditingDocId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [versionFile, setVersionFile] = useState<File | null>(null);
  const [versionNote, setVersionNote] = useState("");
  const [selectedVersionDoc, setSelectedVersionDoc] = useState<number | null>(null);
  const [versions, setVersions] = useState<DocumentVersionItem[]>([]);

  const loadPageData = async () => {
    try {
      const [documentsResponse, tagsResponse] = await Promise.all([
        getDocuments(),
        getTags(),
      ]);
      setDocuments(documentsResponse.data.documents);
      setTags(tagsResponse.data.tags);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to load documents."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const [documentsResponse, tagsResponse] = await Promise.all([
          getDocuments(),
          getTags(),
        ]);
        if (!active) return;
        setDocuments(documentsResponse.data.documents);
        setTags(tagsResponse.data.tags);
      } catch (requestError) {
        if (!active) return;
        setError(getApiErrorMessage(requestError, "Failed to load documents."));
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
      setError("Please choose a document file.");
      return;
    }

    setIsUploading(true);
    setError("");
    try {
      await uploadDocument({ file, title, description });
      setFile(null);
      setTitle("");
      setDescription("");
      await loadPageData();
    } catch (uploadError) {
      setError(getApiErrorMessage(uploadError, "Failed to upload document."));
    } finally {
      setIsUploading(false);
    }
  };

  const onAddTag = async (documentId: number) => {
    const rawTagId = selectedTagByDoc[documentId];
    if (!rawTagId) return;

    try {
      await addTagToDocument(documentId, Number(rawTagId));
      await loadPageData();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to add tag to document."));
    }
  };

  const onRemoveTag = async (documentId: number) => {
    const rawTagId = selectedTagByDoc[documentId];
    if (!rawTagId) return;

    try {
      await removeTagFromDocument(documentId, Number(rawTagId));
      await loadPageData();
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "Failed to remove tag from document.")
      );
    }
  };

  const onSaveDocument = async (documentId: number) => {
    try {
      await updateDocument(documentId, {
        title: editingTitle || undefined,
        description: editingDescription || undefined,
      });
      setEditingDocId(null);
      await loadPageData();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to update document."));
    }
  };

  const onDeleteDocument = async (documentId: number) => {
    try {
      await deleteDocument(documentId);
      await loadPageData();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to delete document."));
    }
  };

  const onLoadVersions = async (documentId: number) => {
    try {
      const response = await getDocumentVersions(documentId);
      setSelectedVersionDoc(documentId);
      setVersions(response.data.versions);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to fetch versions."));
    }
  };

  const onUploadVersion = async (documentId: number) => {
    if (!versionFile) {
      setError("Select a file for new version.");
      return;
    }
    try {
      const response = await uploadDocumentVersion({
        documentId,
        file: versionFile,
        change_note: versionNote || undefined,
      });
      setVersions(response.data.versions);
      setVersionFile(null);
      setVersionNote("");
      await loadPageData();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to upload version."));
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-100">Documents</h1>
      <p className="text-sm text-zinc-400">
        Your uploaded documents, searchable and version-aware.
      </p>

      <form
        onSubmit={onUpload}
        className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 md:grid-cols-2"
      >
        <div className="space-y-2">
          <Label htmlFor="doc-title">Title</Label>
          <Input
            id="doc-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="doc-file">File</Label>
          <Input
            id="doc-file"
            type="file"
            required
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="doc-description">Description (optional)</Label>
          <Input
            id="doc-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload document"}
          </Button>
        </div>
      </form>

      {isLoading ? <p className="text-zinc-400">Loading documents...</p> : null}
      {error ? <p className="text-red-400">{error}</p> : null}

      {!isLoading && !error && documents.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-zinc-400">
          No documents found. Upload your first file from this module next.
        </div>
      ) : null}

      <div className="grid gap-3">
        {documents.map((doc) => (
          <article
            key={doc.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
          >
            <h2 className="text-lg font-medium text-zinc-100">{doc.title}</h2>
            <p className="mt-1 text-sm text-zinc-400">
              {doc.description || "No description"}
            </p>
            {editingDocId === doc.id ? (
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <Input
                  value={editingTitle}
                  onChange={(event) => setEditingTitle(event.target.value)}
                />
                <Input
                  value={editingDescription}
                  onChange={(event) => setEditingDescription(event.target.value)}
                />
                <div className="md:col-span-2 flex gap-2">
                  <Button size="sm" onClick={() => void onSaveDocument(doc.id)}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingDocId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
              <span>Type: {doc.file_type}</span>
              <span>Version: {doc.current_version}</span>
              <span>Tags: {doc.tags || "None"}</span>
              <a
                href={buildDocumentViewUrl(doc.current_file_url, doc.file_type)}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-300 underline"
              >
                View document
              </a>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <select
                className="h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100"
                value={selectedTagByDoc[doc.id] ?? ""}
                onChange={(event) =>
                  setSelectedTagByDoc((prev) => ({
                    ...prev,
                    [doc.id]: event.target.value,
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
                onClick={() => void onAddTag(doc.id)}
                disabled={!selectedTagByDoc[doc.id]}
              >
                Add tag
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void onRemoveTag(doc.id)}
                disabled={!selectedTagByDoc[doc.id]}
              >
                Remove tag
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingDocId(doc.id);
                  setEditingTitle(doc.title);
                  setEditingDescription(doc.description ?? "");
                }}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void onDeleteDocument(doc.id)}
              >
                Delete
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void onLoadVersions(doc.id)}
              >
                Versions
              </Button>
            </div>
            {selectedVersionDoc === doc.id ? (
              <div className="mt-4 rounded-md border border-zinc-800 bg-zinc-950 p-3">
                <div className="flex flex-wrap gap-2">
                  <Input
                    type="file"
                    onChange={(event) => setVersionFile(event.target.files?.[0] ?? null)}
                  />
                  <Input
                    placeholder="Change note"
                    value={versionNote}
                    onChange={(event) => setVersionNote(event.target.value)}
                  />
                  <Button
                    size="sm"
                    onClick={() => void onUploadVersion(doc.id)}
                    disabled={!versionFile}
                  >
                    Upload version
                  </Button>
                </div>
                <div className="mt-3 space-y-1 text-xs text-zinc-400">
                  {versions.map((version) => (
                    <p key={version.id}>
                      v{version.version_num} - {version.change_note || "No note"} -{" "}
                      <a
                        href={buildDocumentViewUrl(version.file_url, doc.file_type)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-300 underline"
                      >
                        View
                      </a>
                    </p>
                  ))}
                </div>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
