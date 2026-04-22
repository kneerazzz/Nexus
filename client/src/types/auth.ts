export type User = {
  name: string;
  username: string;
  email: string;
};

export type ApiEnvelope<T> = {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
};

export type AuthUserResponse = ApiEnvelope<{
  user: User;
}>;
