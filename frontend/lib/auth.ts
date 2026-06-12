export type AuthUser = {
  id?: number;
  username?: string;
  roleId?: number;
  role?: string;
  phone?: string | null;
  fullName?: string;
  email?: string;
  avatarUrl?: string | null;
};

export const AUTH_USER_KEY = "cinex_auth_user";
export const AUTH_TOKEN_KEY = "cinex_auth_token";
export const AUTH_STORAGE_EVENT = "cinex-auth-change";

const adminRoles = new Set(["ADMIN", "MANAGER", "STAFF"]);
const isBrowser = () => typeof window !== "undefined";

const notifyAuthChange = () => {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(AUTH_STORAGE_EVENT));
};

export function getAuthUser(): AuthUser | null {
  if (!isBrowser()) {
    return null;
  }

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
    };
  } catch {
    return null;
  }
}

export function getAuthToken() {
  if (!isBrowser()) {
    return "";
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY) ?? "";
}

export function saveAuthUser(user: AuthUser, token?: string) {
  if (!isBrowser()) {
    return;
  }

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

export function getRedirectPathForRole(role?: string | null) {
  return isAdminRole(role) ? "/admin" : "/";
}
