import api from "@/src/api/axios";
import type { ApiEnvelope } from "@/src/types/auth";
import type { DocumentItem, ImageItem } from "@/src/types/content";
import type { TagItem } from "@/src/types/tag";

export const getTags = async () => {
  const response = await api.get<ApiEnvelope<{ tags: TagItem[] }>>("/tags");
  return response.data;
};

export const createTag = async (payload: { name: string; color?: string }) => {
  const response = await api.post<ApiEnvelope<{ tag: TagItem }>>("/tags", payload);
  return response.data;
};

export const deleteTag = async (id: number) => {
  await api.delete(`/tags/${id}`);
};

export const addTagToDocument = async (documentId: number, tagId: number) => {
  const response = await api.post<ApiEnvelope<{ document: DocumentItem }>>(
    `/tags/document/${documentId}/${tagId}`
  );
  return response.data;
};

export const removeTagFromDocument = async (documentId: number, tagId: number) => {
  const response = await api.delete<ApiEnvelope<{ document: DocumentItem }>>(
    `/tags/document/${documentId}/${tagId}`
  );
  return response.data;
};

export const addTagToImage = async (imageId: number, tagId: number) => {
  const response = await api.post<ApiEnvelope<{ image: ImageItem }>>(
    `/tags/image/${imageId}/${tagId}`
  );
  return response.data;
};

export const removeTagFromImage = async (imageId: number, tagId: number) => {
  const response = await api.delete<ApiEnvelope<{ image: ImageItem }>>(
    `/tags/image/${imageId}/${tagId}`
  );
  return response.data;
};
