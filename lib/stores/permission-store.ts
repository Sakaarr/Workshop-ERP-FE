import { create } from "zustand";
import { apiClient } from "@/lib/api/client";

interface PermissionState {
  permissions: string[];
  loaded: boolean;
  fetchPermissions: () => Promise<void>;
  hasPermission: (perm: string) => boolean;
  hasAnyPermission: (perms: string[]) => boolean;
  reset: () => void;
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  permissions: [],
  loaded: false,

  fetchPermissions: async () => {
    try {
      const { data } = await apiClient.get<{ permissions: string[] }>("/permissions/me");
      set({ permissions: data.permissions, loaded: true });
    } catch {
      set({ permissions: [], loaded: true });
    }
  },

  hasPermission: (perm: string) => get().permissions.includes(perm),

  hasAnyPermission: (perms: string[]) =>
    perms.some(p => get().permissions.includes(p)),

  reset: () => set({ permissions: [], loaded: false }),
}));