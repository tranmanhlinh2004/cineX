import { getAuthToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export type AdminAccountRecord = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  roleLabel: string;
  roleId: number;
  isSystemAccount: boolean;
  isActive: boolean;
  status: string;
  lastLogin: string;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminAccountsResponse = {
  generatedAt: string;
  accounts: AdminAccountRecord[];
  customerAccounts: AdminAccountRecord[];
  systemAccounts: AdminAccountRecord[];
  stats: {
    totalAccounts: number;
    activeAccounts: number;
    systemAccounts: number;
    blockedAccounts: number;
  };
};

export type AdminAccountPayload = {
  name: string;
  email: string;
  phone: string;
  role: string;
  roleName?: string;
  status: string;
  password?: string;
};

export type AdminAccountMutationResponse = {
  message: string;
  account: AdminAccountRecord;
};

export type DeleteAdminAccountResponse = {
  message: string;
  deletedId: number;
};

type RequestAdminOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
};

async function requestAdmin<T>(path: string, options: RequestAdminOptions = {}) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Vui lòng đăng nhập quản trị để xem dữ liệu tài khoản.");
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error("Không kết nối được backend.");
  }

  const data = (await response.json().catch(() => null)) as
    | ({ message?: string } & Partial<T>)
    | null;

  if (!response.ok) {
    throw new Error(data?.message || "Không thể tải dữ liệu từ database.");
  }

  return data as T;
}

export function getAdminAccounts() {
  return requestAdmin<AdminAccountsResponse>("/admin/accounts");
}

export function createAdminAccount(payload: AdminAccountPayload) {
  return requestAdmin<AdminAccountMutationResponse>("/admin/accounts", {
    method: "POST",
    body: payload,
  });
}

export function updateAdminAccount(id: string | number, payload: AdminAccountPayload) {
  return requestAdmin<AdminAccountMutationResponse>(`/admin/accounts/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteAdminAccount(id: string | number) {
  return requestAdmin<DeleteAdminAccountResponse>(`/admin/accounts/${id}`, {
    method: "DELETE",
  });
}
