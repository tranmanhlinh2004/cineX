export type AuthUser = {
  id?: number;
  username?: string;
  roleId?: number;
  role?: string;
  phone?: string | null;
  fullName?: string;
  email?: string;
  avatarUrl?: string | null;
  permissions?: string[];
};

export const AUTH_USER_KEY = "cinex_auth_user";
export const AUTH_TOKEN_KEY = "cinex_auth_token";
export const AUTH_STORAGE_EVENT = "cinex-auth-change";
export const AUTH_DEV_SESSION_KEY = "cinex_auth_dev_session";

const adminRoles = new Set([
  "ADMIN",
  "MANAGER",
  "CASHIER",
  "MOVIE_MANAGER",
  "ACCOUNTANT",
  "CUSTOMER_SUPPORT",
]);
const isBrowser = () => typeof window !== "undefined";
let authResetForDevSession = false;

const notifyAuthChange = () => {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(AUTH_STORAGE_EVENT));
};

export function syncAuthDevSession() {
  const currentDevSessionId =
    process.env.NODE_ENV === "development"
      ? (process.env.NEXT_PUBLIC_CINEX_DEV_SESSION_ID ?? "")
      : "";

  if (!isBrowser() || !currentDevSessionId) {
    return false;
  }

  const storedDevSessionId = window.localStorage.getItem(AUTH_DEV_SESSION_KEY);

  if (storedDevSessionId === currentDevSessionId) {
    return false;
  }

  window.localStorage.setItem(AUTH_DEV_SESSION_KEY, currentDevSessionId);

  const hadAuthSession = Boolean(
    window.localStorage.getItem(AUTH_USER_KEY) ||
      window.localStorage.getItem(AUTH_TOKEN_KEY),
  );

  window.localStorage.removeItem(AUTH_USER_KEY);
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  authResetForDevSession = true;

  if (hadAuthSession) {
    notifyAuthChange();
  }

  return true;
}

export function consumeAuthDevSessionReset() {
  syncAuthDevSession();

  if (!authResetForDevSession) {
    return false;
  }

  authResetForDevSession = false;
  return true;
}

export function getAuthUser(): AuthUser | null {
  if (!isBrowser()) {
    return null;
  }

  syncAuthDevSession();

  const rawUser = window.localStorage.getItem(AUTH_USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    const user = JSON.parse(rawUser) as Partial<AuthUser>;

    if (!user.username && !user.fullName && !user.email) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      roleId: user.roleId,
      role: user.role,
      phone: user.phone,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      permissions: Array.isArray(user.permissions)
        ? user.permissions.filter((permission) => typeof permission === "string")
        : undefined,
    };
  } catch {
    return null;
  }
}

export function getAuthToken() {
  if (!isBrowser()) {
    return "";
  }

  syncAuthDevSession();

  return window.localStorage.getItem(AUTH_TOKEN_KEY) ?? "";
}

export function saveAuthUser(user: AuthUser, token?: string) {
  if (!isBrowser()) {
    return;
  }

  syncAuthDevSession();

  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  notifyAuthChange();
}

export function clearAuthUser() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_USER_KEY);
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  notifyAuthChange();
}

export function isAdminRole(role?: string | null) {
  return role ? adminRoles.has(role.toUpperCase()) : false;
}

export function hasPermission(
  user: AuthUser | null | undefined,
  permission: string,
) {
  return Boolean(user?.permissions?.includes(permission));
}

export function hasAnyPermission(
  user: AuthUser | null | undefined,
  permissions: readonly string[],
) {
  return permissions.some((permission) => hasPermission(user, permission));
}

export function getRedirectPathForRole(role?: string | null) {
  return isAdminRole(role) ? "/admin" : "/";
}
