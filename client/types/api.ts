export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  success: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
