import api from "@/src/api/axios";
import type { ApiEnvelope } from "@/src/types/auth";
import type {
  DocumentItem,
  DocumentVersionItem,
  ImageItem,
} from "@/src/types/content";

export const getDocuments = async () => {
  const response = await api.get<ApiEnvelope<{ documents: DocumentItem[] }>>(
    "/documents"
  );
  return response.data;
};

export const getImages = async () => {
  const response = await api.get<ApiEnvelope<{ images: ImageItem[] }>>("/images");
  return response.data;
};

export const uploadDocument = async (payload: {
  file: File;
  title: string;
  description?: string;
}) => {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("title", payload.title);
  if (payload.description) {
    formData.append("description", payload.description);
  }

  const response = await api.post<ApiEnvelope<{ document: DocumentItem }>>(
    "/documents",
    formData
  );
  return response.data;
};

export const uploadImage = async (payload: { file: File; title: string }) => {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("title", payload.title);

  const response = await api.post<ApiEnvelope<{ image: ImageItem }>>(
    "/images",
    formData
  );
  return response.data;
};

export const updateDocument = async (
  id: number,
  payload: { title?: string; description?: string }
) => {
  const response = await api.patch<ApiEnvelope<{ document: DocumentItem }>>(
    `/documents/${id}`,
    payload
  );
  return response.data;
};

export const deleteDocument = async (id: number) => {
  await api.delete(`/documents/${id}`);
};

export const searchDocuments = async (query: string) => {
  const response = await api.get<ApiEnvelope<{ documents: DocumentItem[] }>>(
    `/documents/search?q=${encodeURIComponent(query)}`
  );
  return response.data;
};

export const getDocumentVersions = async (id: number) => {
  const response = await api.get<ApiEnvelope<{ versions: DocumentVersionItem[] }>>(
    `/documents/${id}/versions`
  );
  return response.data;
};

export const uploadDocumentVersion = async (payload: {
  documentId: number;
  file: File;
  change_note?: string;
}) => {
  const formData = new FormData();
  formData.append("file", payload.file);
  if (payload.change_note) {
    formData.append("change_note", payload.change_note);
  }
  const response = await api.post<ApiEnvelope<{ versions: DocumentVersionItem[] }>>(
    `/documents/${payload.documentId}/versions`,
    formData
  );
  return response.data;
};

export const updateImage = async (id: number, payload: { title: string }) => {
  const response = await api.patch<ApiEnvelope<{ image: ImageItem }>>(
    `/images/${id}`,
    payload
  );
  return response.data;
};

export const deleteImage = async (id: number) => {
  await api.delete(`/images/${id}`);
};
