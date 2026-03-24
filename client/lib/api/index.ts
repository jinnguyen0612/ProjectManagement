import apiClient from "./client";
import { setupInterceptors } from "./interceptors";

setupInterceptors();

export { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./interceptors";
export default apiClient;
