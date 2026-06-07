import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  plan: string;
  avatar?: string;
  credits?: number;
  telegramEnabled?: boolean;
  usageThisMonth?: number;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      fetchMe: async () => {
        const { data } = await api.get("/auth/me");
        set({ user: data });
      },
    }),
    { name: "auth", partialize: (s) => ({ token: s.token, user: s.user }) },
  ),
);
