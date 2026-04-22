export type ActivityItem = {
  id: number;
  user_id: number;
  action: string;
  entity_type: string | null;
  entity_id: number | null;
  metadata: string | null;
  created_at: string;
};
