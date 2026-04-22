import api from "@/src/api/axios";
import type { ApiEnvelope } from "@/src/types/auth";
import type { RelationItem } from "@/src/types/relation";

export const getRelationsForEntity = async (
  type: "document" | "image",
  id: number
) => {
  const response = await api.get<ApiEnvelope<{ relations: RelationItem[] }>>(
    `/relations/${type}/${id}`
  );
  return response.data;
};

export const createRelation = async (payload: {
  source_type: "document" | "image";
  source_id: number;
  target_type: "document" | "image";
  target_id: number;
  relation_label?: string;
}) => {
  const response = await api.post<ApiEnvelope<{ relation: RelationItem }>>(
    "/relations",
    payload
  );
  return response.data;
};

export const deleteRelation = async (id: number) => {
  await api.delete(`/relations/${id}`);
};
