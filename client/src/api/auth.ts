import api from "@/src/api/axios";
import type { ApiEnvelope, AuthUserResponse } from "@/src/types/auth";

type AuthPayload = {
  email: string;
  password: string;
};

type RegisterPayload = AuthPayload & {
  name: string;
  username: string;
};

export const registerUser = async (payload: RegisterPayload) => {
  const response = await api.post<AuthUserResponse>("/users/register", payload);
  return response.data;
};

export const loginUser = async (payload: AuthPayload) => {
  const response = await api.post<AuthUserResponse>("/users/login", payload);
  return response.data;
};

export const logoutUser = async () => {
  await api.get("/users/logout");
};

export const getCurrentUser = async () => {
  const response = await api.get<AuthUserResponse>("/users/me");
  return response.data;
};

export const updateCurrentUser = async (payload: {
  name?: string;
  username?: string;
  email?: string;
}) => {
  const response = await api.patch<AuthUserResponse>("/users/me", payload);
  return response.data;
};

export const updateCurrentPassword = async (payload: {
  oldPassword: string;
  newPassword: string;
}) => {
  const response = await api.patch<ApiEnvelope<Record<string, never>>>(
    "/users/password",
    payload
  );
  return response.data;
};

export const deleteCurrentUser = async (password: string) => {
  const response = await api.delete<ApiEnvelope<Record<string, never>>>("/users/me", {
    data: { password },
  });
  return response.data;
};
