import { apiClient } from "./client";

export interface ModulePermissions {
  [module: string]: string[];
}

export const permissionsApi = {
  available: () =>
    apiClient
      .get<{ permissions: string[]; modules: ModulePermissions }>("/permissions/available")
      .then(r => r.data),

  getForUser: (userId: string) =>
    apiClient.get<{ permissions: string[] }>(`/permissions/user/${userId}`).then(r => r.data),

  setForUser: (userId: string, permissions: string[]) =>
    apiClient.put<{ permissions: string[] }>(`/permissions/user/${userId}`, { permissions }).then(r => r.data),

  me: () =>
    apiClient.get<{ permissions: string[] }>("/permissions/me").then(r => r.data),
};