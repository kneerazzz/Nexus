export type RelationItem = {
  id: number;
  source_type: "document" | "image";
  source_id: number;
  target_type: "document" | "image";
  target_id: number;
  relation_label: string | null;
  created_at: string;
};
