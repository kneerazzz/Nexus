import api from "@/src/api/axios";
import type { ApiEnvelope } from "@/src/types/auth";
import type { ActivityItem } from "@/src/types/activity";

export const getActivityLogs = async () => {
  const response = await api.get<ApiEnvelope<{ logs: ActivityItem[] }>>("/activity");
  return response.data;
};
