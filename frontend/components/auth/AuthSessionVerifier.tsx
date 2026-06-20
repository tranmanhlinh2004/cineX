"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearAuthUser,
  getAuthToken,
  getAuthUser,
  saveAuthUser,
  type AuthUser,
} from "@/lib/auth";
import { getProfile, isAuthApiError } from "@/lib/auth-api";
import { createLoadingPath } from "@/lib/navigation";

function isLoginPath(pathname: string) {
  return pathname === "/login" || pathname.startsWith("/login/");
}

function normalizeRole(role?: string | null) {
  return role?.trim().toUpperCase() ?? "";
}

function hasUserChanged(localUser: AuthUser, serverUser: AuthUser) {
  return (
    typeof localUser.id === "number" &&
    typeof serverUser.id === "number" &&
    localUser.id !== serverUser.id
  );
}

function hasRoleChanged(localUser: AuthUser, serverUser: AuthUser) {
  const localRole = normalizeRole(localUser.role);
  const serverRole = normalizeRole(serverUser.role);

  if (localRole && serverRole) {
    return localRole !== serverRole;
  }

  return (
    typeof localUser.roleId === "number" &&
    typeof serverUser.roleId === "number" &&
    localUser.roleId !== serverUser.roleId
  );
}

function normalizePermissions(user: AuthUser) {
  return [...(user.permissions ?? [])].sort().join("|");
}

function hasPermissionsChanged(localUser: AuthUser, serverUser: AuthUser) {
  return normalizePermissions(localUser) !== normalizePermissions(serverUser);
}

function shouldEndSession(error: unknown) {
  return isAuthApiError(error) && (error.status === 401 || error.status === 403);
}

export default function AuthSessionVerifier() {
  const pathname = usePathname();
  const router = useRouter();
  const validationIdRef = useRef(0);

  useEffect(() => {
    let isMounted = true;

    const redirectToLogin = () => {
      if (!isLoginPath(pathname)) {
        router.replace(createLoadingPath("/login"));
      }
    };

    const endSession = () => {
      validationIdRef.current += 1;
      clearAuthUser();
      redirectToLogin();
    };

    const validateSession = async () => {
      const token = getAuthToken();
      const localUser = token ? getAuthUser() : null;

      if (!token) {
        return;
      }

      if (!localUser) {
        endSession();
        return;
      }

      const requestId = ++validationIdRef.current;

      try {
        const { user } = await getProfile();

        if (!isMounted || requestId !== validationIdRef.current || getAuthToken() !== token) {
          return;
        }

        if (hasUserChanged(localUser, user) || hasRoleChanged(localUser, user)) {
          endSession();
          return;
        }

        if (hasPermissionsChanged(localUser, user)) {
          saveAuthUser(user, token);
          return;
        }

        saveAuthUser(user, token);
      } catch (error) {
        if (!isMounted || requestId !== validationIdRef.current || getAuthToken() !== token) {
          return;
        }

        if (shouldEndSession(error)) {
          endSession();
        }
      }
    };

    const handleSessionCheck = () => {
      void validateSession();
    };

    handleSessionCheck();
    window.addEventListener("pageshow", handleSessionCheck);
    window.addEventListener("focus", handleSessionCheck);

    return () => {
      isMounted = false;
      window.removeEventListener("pageshow", handleSessionCheck);
      window.removeEventListener("focus", handleSessionCheck);
    };
  }, [pathname, router]);

  return null;
}
