"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { usePermissionStore } from "@/lib/stores/permission-store";

export function usePermissions() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user);
  const { permissions, loaded, fetchPermissions, hasPermission, hasAnyPermission } = usePermissionStore();

  useEffect(() => {
    if (isAuthenticated && !loaded) {
      fetchPermissions();
    }
  }, [isAuthenticated, loaded, fetchPermissions]);

  // Admins and super admins bypass all permission checks
  const isAdmin = user?.role === "super_admin" || user?.role === "admin";

  return {
    permissions,
    loaded,
    isAdmin,
    can: (perm: string) => isAdmin || hasPermission(perm),
    canAny: (perms: string[]) => isAdmin || hasAnyPermission(perms),
  };
}