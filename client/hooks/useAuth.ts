"use client";

import { useState, useEffect } from "react";
import { User } from "@/types";
import { authService } from "@/lib/services/auth.service";
import { setTokens, clearTokens, getAccessToken } from "@/lib/api/interceptors";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .getProfile()
      .then((res) => setUser(res.data.data))
      .catch(() => clearTokens())
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const res = await authService.login({ username, password });
    const { accessToken, refreshToken, user } = res.data.data;
    setTokens(accessToken, refreshToken);
    setUser(user);
    return user;
  };

  const logout = async () => {
    await authService.logout().catch(() => {});
    clearTokens();
    setUser(null);
  };

  return { user, loading, login, logout };
}
