"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  createAdminAccount,
  deleteAdminAccount,
  getAdminAccounts,
  updateAdminAccount,
  type AdminAccountPayload,
  type AdminAccountRecord,
  type AdminAccountsResponse,
} from "@/lib/admin-accounts-api";
import {
  PermissionButton,
  PermissionLink,
} from "@/components/admin/PermissionControls";

type AdminAccount = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  lastLogin: string;
  status: string;
  password?: string;
};

type AccountModalMode = "create" | "edit";
type AccountModalTab = "info" | "permissions";
type AccountSectionKey = "customers" | "system";
type AccountGroupFilter = "" | AccountSectionKey;

type AccountFilters = {
  query: string;
  group: AccountGroupFilter;
  status: string;
};

type AccountColumn = {
  key: keyof AdminAccount;
  label: string;
};

type AccountSection = {
  key: AccountSectionKey;
  title: string;
  description: string;
  columns: AccountColumn[];
  rows: AdminAccount[];
};

type AccountStats = AdminAccountsResponse["stats"];

type PermissionItem = {
  id: string;
  label: string;
};

type PermissionModule = {
  id: string;
  label: string;
  permissions: PermissionItem[];
};

type PermissionGroup = {
  title: string;
  modules: PermissionModule[];
};

const customerAccountColumns: AccountColumn[] = [
  { key: "name", label: "Họ tên" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Số điện thoại" },
  { key: "lastLogin", label: "Đăng nhập gần nhất" },
  { key: "status", label: "Trạng thái" },
];

const systemAccountColumns: AccountColumn[] = [
  { key: "name", label: "Họ tên" },
  { key: "email", label: "Email" },
  { key: "role", label: "Vai trò hệ thống" },
  { key: "lastLogin", label: "Đăng nhập gần nhất" },
  { key: "status", label: "Trạng thái" },
];

const customerAccounts: AdminAccount[] = [];
const systemAccounts: AdminAccount[] = [];
const accountPageSize = 10;
const defaultAccountFilters: AccountFilters = {
  query: "",
  group: "",
  status: "",
};

const roleOptions = [
  "Khách hàng",
  "Nhân viên thu ngân",
  "Nhân viên quản lý phim",
  "Nhân viên kế toán",
  "Nhân viên chăm sóc khách hàng",
  "Quản lý",
  "Quản trị viên",
];

const roleNameByLabel: Record<string, string> = {
  [roleOptions[0]]: "CUSTOMER",
  [roleOptions[1]]: "CASHIER",
  [roleOptions[2]]: "MOVIE_MANAGER",
  [roleOptions[3]]: "ACCOUNTANT",
  [roleOptions[4]]: "CUSTOMER_SUPPORT",
  [roleOptions[5]]: "MANAGER",
  [roleOptions[6]]: "ADMIN",
};

const roleLabelByName: Record<string, string> = {
  ADMIN: roleOptions[6],
  MANAGER: roleOptions[5],
  CASHIER: roleOptions[1],
  STAFF: roleOptions[1],
  MOVIE_MANAGER: roleOptions[2],
  ACCOUNTANT: roleOptions[3],
  CUSTOMER_SUPPORT: roleOptions[4],
  CUSTOMER: roleOptions[0],
};

const statusOptions = ["Đang hoạt động", "Bị khóa"];

const permissionGroups: PermissionGroup[] = [
  {
    title: "Tài khoản",
    modules: [
      {
        id: "customer-account",
        label: "Khách hàng",
        permissions: [
          { id: "customer-account.view", label: "Xem danh sách" },
          { id: "customer-account.update", label: "Cập nhật hồ sơ" },
          { id: "customer-account.verify", label: "Xác minh tài khoản" },
          { id: "customer-account.lock", label: "Khóa / mở khóa" },
        ],
      },
      {
        id: "staff-account",
        label: "Tài khoản nội bộ",
        permissions: [
          { id: "staff-account.view", label: "Xem danh sách" },
          { id: "staff-account.create", label: "Thêm mới" },
          { id: "staff-account.update", label: "Cập nhật" },
          { id: "staff-account.delete", label: "Xóa" },
        ],
      },
      {
        id: "role-assignment",
        label: "Gán vai trò",
        permissions: [
          { id: "role-assignment.view", label: "Xem vai trò" },
          { id: "role-assignment.assign", label: "Gán quyền" },
          { id: "role-assignment.override", label: "Ghi đè quyền riêng" },
          { id: "role-assignment.audit", label: "Xem lịch sử thay đổi" },
        ],
      },
    ],
  },
  {
    title: "Vận hành",
    modules: [
      {
        id: "movie-management",
        label: "Phim",
        permissions: [
          { id: "movie-management.view", label: "Xem danh sách" },
          { id: "movie-management.create", label: "Thêm mới" },
          { id: "movie-management.update", label: "Cập nhật" },
          { id: "movie-management.delete", label: "Xóa" },
        ],
      },
      {
        id: "showtime-management",
        label: "Lịch chiếu",
        permissions: [
          { id: "showtime-management.view", label: "Xem danh sách" },
          { id: "showtime-management.create", label: "Tạo suất chiếu" },
          { id: "showtime-management.update", label: "Cập nhật lịch" },
          { id: "showtime-management.price", label: "Cập nhật giá vé" },
        ],
      },
      {
        id: "booking-management",
        label: "Đặt vé",
        permissions: [
          { id: "booking-management.view", label: "Xem đơn" },
          { id: "booking-management.create", label: "Tạo đơn tại quầy" },
          { id: "booking-management.cancel", label: "Hủy đơn" },
          { id: "booking-management.refund", label: "Hoàn tiền" },
          { id: "booking-management.invoice", label: "Xuất hóa đơn" },
        ],
      },
      {
        id: "customer-support",
        label: "Chăm sóc khách hàng",
        permissions: [
          { id: "customer-support.review-reply", label: "Trả lời bình luận / đánh giá" },
          { id: "customer-support.message-reply", label: "Trả lời tin nhắn liên hệ" },
        ],
      },
    ],
  },
  {
    title: "Báo cáo",
    modules: [
      {
        id: "ticket-report",
        label: "Vé",
        permissions: [
          { id: "ticket-report.view", label: "Xem danh sách" },
          { id: "ticket-report.scan", label: "Soát vé" },
          { id: "ticket-report.export", label: "Xuất danh sách" },
        ],
      },
      {
        id: "revenue-report",
        label: "Doanh thu",
        permissions: [
          { id: "revenue-report.view", label: "Xem báo cáo" },
          { id: "revenue-report.detail", label: "Xem chi tiết giao dịch" },
          { id: "revenue-report.export", label: "Xuất báo cáo" },
          { id: "revenue-report.compare", label: "So sánh kỳ" },
        ],
      },
      {
        id: "system-report",
        label: "Hệ thống",
        permissions: [
          { id: "system-report.audit", label: "Xem nhật ký thao tác" },
          { id: "system-report.settings", label: "Cài đặt hệ thống" },
          { id: "system-report.security", label: "Bảo mật truy cập" },
        ],
      },
    ],
  },
];

const allPermissionIds = permissionGroups.flatMap((group) =>
  group.modules.flatMap((module) =>
    module.permissions.map((permission) => permission.id),
  ),
);

const defaultAccountPermissions: Record<string, string[]> = {
  "admin-minh-anh": allPermissionIds,
  "staff-bao-chau": [
    "customer-account.view",
    "movie-management.view",
    "showtime-management.view",
    "showtime-management.create",
    "showtime-management.update",
    "booking-management.view",
    "booking-management.create",
    "booking-management.cancel",
    "ticket-report.view",
    "ticket-report.scan",
  ],
  "customer-duc-anh": [
    "customer-account.view",
    "booking-management.view",
    "ticket-report.view",
  ],
  "customer-thu-ha": ["customer-account.view"],
};

function getDefaultPermissionIdsForAccount(account: AdminAccount) {
  if (defaultAccountPermissions[account.id]) {
    return defaultAccountPermissions[account.id];
  }

  if (account.role === "Quản trị viên") {
    return allPermissionIds;
  }

  if (account.role === "Quản lý") {
    return [
      "customer-account.view",
      "staff-account.view",
      "role-assignment.view",
      "movie-management.view",
      "movie-management.create",
      "movie-management.update",
      "movie-management.delete",
      "showtime-management.view",
      "showtime-management.create",
      "showtime-management.update",
      "showtime-management.price",
      "booking-management.view",
      "booking-management.create",
      "booking-management.cancel",
      "booking-management.refund",
      "booking-management.invoice",
      "customer-support.review-reply",
      "customer-support.message-reply",
      "ticket-report.view",
      "revenue-report.view",
      "revenue-report.export",
    ];
  }

  if (account.role === "Nhân viên thu ngân") {
    return [
      "customer-account.view",
      "movie-management.view",
      "showtime-management.view",
      "booking-management.view",
      "booking-management.create",
      "booking-management.cancel",
      "booking-management.refund",
      "booking-management.invoice",
      "ticket-report.view",
      "ticket-report.scan",
    ];
  }

  if (account.role === "Nhân viên quản lý phim") {
    return [
      "movie-management.view",
      "movie-management.create",
      "movie-management.update",
      "movie-management.delete",
      "showtime-management.view",
      "showtime-management.create",
      "showtime-management.update",
      "showtime-management.price",
    ];
  }

  if (account.role === "Nhân viên kế toán") {
    return [
      "booking-management.view",
      "booking-management.invoice",
      "ticket-report.view",
      "ticket-report.export",
      "revenue-report.view",
      "revenue-report.detail",
      "revenue-report.export",
      "revenue-report.compare",
    ];
  }

  if (account.role === "Nhân viên chăm sóc khách hàng") {
    return [
      "customer-account.view",
      "booking-management.view",
      "customer-support.review-reply",
      "customer-support.message-reply",
    ];
  }

  return [];
}

function buildPermissionState(accounts: AdminAccount[]) {
  return Object.fromEntries(
    accounts.map((account) => [
      account.id,
      new Set(getDefaultPermissionIdsForAccount(account)),
    ]),
  ) as Record<string, Set<string>>;
}

function buildInitialPermissionState() {
  const accounts = [...customerAccounts, ...systemAccounts];

  return buildPermissionState(accounts);
}

function formatStatValue(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function toAdminAccount(record: AdminAccountRecord): AdminAccount {
  const roleName = record.role.trim().toUpperCase();

  return {
    id: String(record.id),
    name: record.name,
    email: record.email,
    phone: record.phone || "",
    role: roleLabelByName[roleName] ?? record.roleLabel,
    lastLogin: record.lastLogin,
    status: record.status,
  };
}

function buildNewAccount(): AdminAccount {
  return {
    id: "",
    name: "",
    email: "",
    phone: "",
    role: "Khách hàng",
    lastLogin: "Chưa đăng nhập",
    status: "Đang hoạt động",
    password: "",
  };
}

function buildAccountPayload(account: AdminAccount): AdminAccountPayload {
  const password = account.password?.trim();
  const roleName =
    roleNameByLabel[account.role] ??
    (account.role.trim().toUpperCase() === "STAFF"
      ? "CASHIER"
      : undefined);

  return {
    name: account.name.trim(),
    email: account.email.trim(),
    phone: account.phone.trim(),
    role: account.role,
    ...(roleName ? { roleName } : {}),
    status: account.status,
    ...(password ? { password } : {}),
  };
}

function isSystemRole(role: string) {
  const normalizedRole = normalizeText(role);

  return (
    Boolean(normalizedRole) &&
    normalizedRole !== "khach hang" &&
    normalizedRole !== "customer"
  );
}

function isSystemAccountRecord(record: AdminAccountRecord) {
  return record.isSystemAccount || isSystemRole(record.roleLabel || record.role);
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function toRouteId(value: string) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function statusClass(value: string) {
  const normalized = normalizeText(value);

  if (normalized.includes("hoat dong")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalized.includes("cho")) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (normalized.includes("khoa")) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-700";
}

function matchesAccountFilters(account: AdminAccount, filters: AccountFilters) {
  const normalizedQuery = normalizeText(filters.query);
  const searchableText = normalizeText(
    [account.name, account.email, account.phone].join(" "),
  );
  const matchesQuery =
    !normalizedQuery || searchableText.includes(normalizedQuery);
  const matchesStatus =
    !filters.status ||
    normalizeText(account.status) === normalizeText(filters.status);

  return matchesQuery && matchesStatus;
}

export default function AdminAccountsPageClient() {
  const [customerAccountRows, setCustomerAccountRows] =
    useState(customerAccounts);
  const [systemAccountRows, setSystemAccountRows] = useState(systemAccounts);
  const [accountStats, setAccountStats] = useState<AccountStats>({
    totalAccounts: 0,
    activeAccounts: 0,
    systemAccounts: 0,
    blockedAccounts: 0,
  });
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState("");
  const [accountActionError, setAccountActionError] = useState("");
  const [accountModalMode, setAccountModalMode] =
    useState<AccountModalMode>("edit");
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [deletingAccountId, setDeletingAccountId] = useState("");
  const [customerAccountPage, setCustomerAccountPage] = useState(1);
  const [systemAccountPage, setSystemAccountPage] = useState(1);
  const [filterDraft, setFilterDraft] = useState(defaultAccountFilters);
  const [activeFilters, setActiveFilters] = useState(defaultAccountFilters);
  const [selectedAccount, setSelectedAccount] = useState<AdminAccount | null>(
    null,
  );
  const [activeModalTab, setActiveModalTab] =
    useState<AccountModalTab>("info");
  const [accountPermissions, setAccountPermissions] = useState(
    buildInitialPermissionState,
  );

  const loadAccounts = useCallback(async () => {
    setAccountsLoading(true);
    setAccountsError("");

    try {
      const data = await getAdminAccounts();
      const accountRecords =
        data.accounts.length > 0
          ? data.accounts
          : [...data.customerAccounts, ...data.systemAccounts];
      const nextCustomerAccounts = accountRecords
        .filter((account) => !isSystemAccountRecord(account))
        .map(toAdminAccount);
      const nextSystemAccounts = accountRecords
        .filter(isSystemAccountRecord)
        .map(toAdminAccount);
      const nextAccounts = [...nextCustomerAccounts, ...nextSystemAccounts];
      const activeAccounts = accountRecords.filter((account) => account.isActive);

      setCustomerAccountRows(nextCustomerAccounts);
      setSystemAccountRows(nextSystemAccounts);
      setAccountStats({
        ...data.stats,
        totalAccounts: accountRecords.length,
        activeAccounts: activeAccounts.length,
        systemAccounts: nextSystemAccounts.length,
        blockedAccounts: accountRecords.length - activeAccounts.length,
      });
      setAccountPermissions(buildPermissionState(nextAccounts));
    } catch (error) {
      setAccountsError(
        error instanceof Error
          ? error.message
          : "Không thể tải dữ liệu tài khoản từ database.",
      );
    } finally {
      setAccountsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    setCustomerAccountPage((currentPage) =>
      Math.min(
        currentPage,
        Math.max(
          1,
          Math.ceil(
            customerAccountRows.filter((account) =>
              matchesAccountFilters(account, activeFilters),
            ).length / accountPageSize,
          ),
        ),
      ),
    );
  }, [activeFilters, customerAccountRows]);

  useEffect(() => {
    setSystemAccountPage((currentPage) =>
      Math.min(
        currentPage,
        Math.max(
          1,
          Math.ceil(
            systemAccountRows.filter((account) =>
              matchesAccountFilters(account, activeFilters),
            ).length / accountPageSize,
          ),
        ),
      ),
    );
  }, [activeFilters, systemAccountRows]);

  useEffect(() => {
    if (!selectedAccount) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedAccount(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedAccount]);

  const selectedPermissionSet = selectedAccount
    ? accountPermissions[selectedAccount.id] ??
      new Set(getDefaultPermissionIdsForAccount(selectedAccount))
    : new Set<string>();
  const isSelectedSystemAccount = selectedAccount
    ? isSystemRole(selectedAccount.role)
    : false;
  const selectedRoleOptions =
    accountModalMode === "create" || !isSelectedSystemAccount
      ? roleOptions
      : roleOptions.filter((role) => role !== "Khách hàng");
  const selectedStatusOptions = statusOptions;
  const filteredCustomerAccountRows = customerAccountRows.filter((account) =>
    matchesAccountFilters(account, activeFilters),
  );
  const filteredSystemAccountRows = systemAccountRows.filter((account) =>
    matchesAccountFilters(account, activeFilters),
  );
  const hasActiveFilters = Boolean(
    activeFilters.query || activeFilters.group || activeFilters.status,
  );
  const allAccountTableSections: AccountSection[] = [
    {
      key: "customers",
      title: "Tài khoản khách hàng",
      description:
        "Quản lý hồ sơ, xác minh và trạng thái truy cập của khách đặt vé.",
      columns: customerAccountColumns,
      rows: filteredCustomerAccountRows,
    },
    {
      key: "system",
      title: "Tài khoản quản trị hệ thống",
      description:
        "Quản lý nhân viên rạp, quản trị viên và vai trò vận hành nội bộ.",
      columns: systemAccountColumns,
      rows: filteredSystemAccountRows,
    },
  ];
  const accountTableSections = allAccountTableSections.filter(
    (section) => !activeFilters.group || section.key === activeFilters.group,
  );

  useEffect(() => {
    if (selectedAccount && !isSelectedSystemAccount && activeModalTab === "permissions") {
      setActiveModalTab("info");
    }
  }, [activeModalTab, isSelectedSystemAccount, selectedAccount]);

  const applyAccountFilters = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setActiveFilters({
      query: filterDraft.query.trim(),
      group: filterDraft.group,
      status: filterDraft.status,
    });
    setCustomerAccountPage(1);
    setSystemAccountPage(1);
  };

  const openCreateAccountModal = () => {
    setAccountActionError("");
    setAccountModalMode("create");
    setSelectedAccount(buildNewAccount());
    setActiveModalTab("info");
  };

  const openAccountModal = (account: AdminAccount) => {
    setAccountActionError("");
    setAccountModalMode("edit");
    setSelectedAccount({ ...account, password: "" });
    setActiveModalTab("info");
  };

  const updateSelectedAccount = <Key extends keyof AdminAccount>(
    key: Key,
    value: AdminAccount[Key],
  ) => {
    setSelectedAccount((current) =>
      current
        ? {
            ...current,
            [key]: value,
          }
        : current,
    );
  };

  const saveSelectedAccount = async () => {
    if (!selectedAccount) {
      return;
    }

    setAccountActionError("");

    if (!selectedAccount.name.trim() || !selectedAccount.email.trim()) {
      setAccountActionError("Vui lòng nhập họ tên và email.");
      return;
    }

    if (accountModalMode === "create" && !selectedAccount.password?.trim()) {
      setAccountActionError("Vui lòng nhập mật khẩu cho tài khoản mới.");
      return;
    }

    setIsSavingAccount(true);

    try {
      const payload = buildAccountPayload(selectedAccount);
      const shouldResetSystemPage =
        accountModalMode === "create" && isSystemRole(selectedAccount.role);
      const shouldResetCustomerPage =
        accountModalMode === "create" && !isSystemRole(selectedAccount.role);

      if (accountModalMode === "create") {
        await createAdminAccount(payload);
      } else {
        await updateAdminAccount(selectedAccount.id, payload);
      }

      await loadAccounts();

      if (shouldResetSystemPage) {
        setSystemAccountPage(1);
      }

      if (shouldResetCustomerPage) {
        setCustomerAccountPage(1);
      }

      setSelectedAccount(null);
    } catch (error) {
      setAccountActionError(
        error instanceof Error
          ? error.message
          : "Không thể lưu tài khoản vào database.",
      );
    } finally {
      setIsSavingAccount(false);
    }
  };

  const deleteAccount = async (account: AdminAccount) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa tài khoản "${account.name}" không?`,
    );

    if (!confirmed) {
      return;
    }

    setAccountsError("");
    setDeletingAccountId(account.id);

    try {
      await deleteAdminAccount(account.id);
      await loadAccounts();
    } catch (error) {
      setAccountsError(
        error instanceof Error
          ? error.message
          : "Không thể xóa tài khoản khỏi database.",
      );
    } finally {
      setDeletingAccountId("");
    }
  };

  const updateAccountPermissionSet = (
    accountId: string,
    updater: (permissions: Set<string>) => void,
  ) => {
    setAccountPermissions((current) => {
      const nextSet = new Set(current[accountId] ?? []);
      updater(nextSet);

      return {
        ...current,
        [accountId]: nextSet,
      };
    });
  };

  const togglePermission = (permissionId: string) => {
    if (!selectedAccount) {
      return;
    }

    updateAccountPermissionSet(selectedAccount.id, (permissions) => {
      if (permissions.has(permissionId)) {
        permissions.delete(permissionId);
        return;
      }

      permissions.add(permissionId);
    });
  };

  const toggleModulePermissions = (module: PermissionModule, checked: boolean) => {
    if (!selectedAccount) {
      return;
    }

    updateAccountPermissionSet(selectedAccount.id, (permissions) => {
      module.permissions.forEach((permission) => {
        if (checked) {
          permissions.add(permission.id);
          return;
        }

        permissions.delete(permission.id);
      });
    });
  };

  return (
    <div className="mx-auto grid max-w-[1440px] gap-5">
      <section className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-black uppercase text-red-700">
            3.4.1
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Quản lý tài khoản
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Khung quản trị tài khoản khách hàng và tài khoản quản trị hệ thống.
          </p>
        </div>

        <PermissionButton
          type="button"
          permissionRule={{ permission: "user.manage" }}
          onClick={openCreateAccountModal}
          className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-700"
        >
          <Plus size={17} />
          Thêm tài khoản
        </PermissionButton>
      </section>

      

      {accountsError ? (
        <section className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
          {accountsError}
        </section>
      ) : null}

      {accountsLoading ? (
        <section className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-500 shadow-sm">
          Đang tải dữ liệu tài khoản từ database...
        </section>
      ) : null}

      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <form
          onSubmit={applyAccountFilters}
          className="grid gap-3 lg:grid-cols-[1fr_repeat(2,210px)_auto]"
        >
          <label className="relative block">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={filterDraft.query}
              onChange={(event) =>
                setFilterDraft((current) => ({
                  ...current,
                  query: event.target.value,
                }))
              }
              placeholder="Tìm theo tên, email, số điện thoại..."
              className="h-11 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white"
            />
          </label>

          <select
            value={filterDraft.group}
            onChange={(event) =>
              setFilterDraft((current) => ({
                ...current,
                group: event.target.value as AccountGroupFilter,
              }))
            }
            className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-red-500"
          >
            <option value="">Tất cả nhóm tài khoản</option>
            <option value="customers">Khách hàng</option>
            <option value="system">Quản trị hệ thống</option>
          </select>

          <select
            value={filterDraft.status}
            onChange={(event) =>
              setFilterDraft((current) => ({
                ...current,
                status: event.target.value,
              }))
            }
            className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-red-500"
          >
            <option value="">Tất cả trạng thái</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            <SlidersHorizontal size={17} />
            Lọc
          </button>
        </form>
      </section>

      {accountTableSections.map((section) => {
        const currentPage =
          section.key === "customers" ? customerAccountPage : systemAccountPage;
        const setCurrentPage =
          section.key === "customers"
            ? setCustomerAccountPage
            : setSystemAccountPage;
        const totalRows = section.rows.length;
        const totalPages = Math.max(1, Math.ceil(totalRows / accountPageSize));
        const startIndex = (currentPage - 1) * accountPageSize;
        const endIndex = Math.min(startIndex + accountPageSize, totalRows);
        const paginatedRows = section.rows.slice(startIndex, endIndex);
        const canGoPrevious = currentPage > 1;
        const canGoNext = currentPage < totalPages;

        return (
          <section
            key={section.title}
            className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-950">
                  {section.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {section.description}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] border-collapse text-left">
                <thead className="bg-slate-200 text-sm uppercase text-slate-950">
                  <tr>
                    {section.columns.map((column) => (
                      <th key={column.key} className="px-4 py-4 font-black">
                        {column.label}
                      </th>
                    ))}
                    <th className="px-4 py-4 text-center font-black">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="text-slate-900">
                  {totalRows > 0 ? (
                    paginatedRows.map((account) => (
                      <tr
                        key={account.id}
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                      >
                        {section.columns.map((column, index) => {
                          const value = account[column.key] ?? "";
                          const isStatus = column.key === "status";
                          const displayValue =
                            column.key === "phone" && !value
                              ? "Chưa cập nhật"
                              : value;

                          return (
                            <td
                              key={column.key}
                              className={`px-4 py-4 text-sm ${
                                index === 0
                                  ? "font-black text-slate-950"
                                  : "font-semibold text-slate-600"
                              }`}
                            >
                              {isStatus ? (
                                <span
                                  className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-black ${statusClass(
                                    value,
                                  )}`}
                                >
                                  {displayValue}
                                </span>
                              ) : (
                                displayValue
                              )}
                            </td>
                          );
                        })}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <PermissionLink
                              href={`/admin/accounts/${toRouteId(account.name)}`}
                              permissionRule={{ permission: "user.view" }}
                              aria-label={`Xem ${account.name}`}
                              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-400 text-slate-600 transition hover:bg-slate-50"
                            >
                              <Eye size={16} />
                            </PermissionLink>
                            <PermissionButton
                              type="button"
                              aria-label={`Sửa ${account.name}`}
                              permissionRule={{ permission: "user.manage" }}
                              onClick={() => openAccountModal(account)}
                              className="flex h-9 w-9 items-center justify-center rounded-md border border-blue-500 text-blue-600 transition hover:bg-blue-50"
                            >
                              <Pencil size={16} />
                            </PermissionButton>
                            <PermissionButton
                              type="button"
                              aria-label={`Xóa ${account.name}`}
                              permissionRule={{ permission: "user.manage" }}
                              disabled={deletingAccountId === account.id}
                              onClick={() => void deleteAccount(account)}
                              className="flex h-9 w-9 items-center justify-center rounded-md border border-red-500 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 size={16} />
                            </PermissionButton>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={section.columns.length + 1}
                        className="px-4 py-10 text-center text-sm font-bold text-slate-500"
                      >
                        {accountsLoading
                          ? "Đang tải dữ liệu..."
                          : hasActiveFilters
                            ? "Không tìm thấy tài khoản phù hợp."
                            : "Chưa có tài khoản trong nhóm này."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalRows > accountPageSize ? (
              <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-bold text-slate-500">
                  Hiển thị {startIndex + 1}-{endIndex} / {totalRows} tài khoản
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!canGoPrevious}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    className="inline-flex h-9 items-center justify-center gap-1 rounded-md border border-slate-200 px-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                    Trước
                  </button>
                  <span className="min-w-24 text-center text-sm font-black text-slate-700">
                    Trang {currentPage}/{totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={!canGoNext}
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    className="inline-flex h-9 items-center justify-center gap-1 rounded-md border border-slate-200 px-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Sau
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        );
      })}

      {selectedAccount ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="account-permission-modal-title"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 px-4 py-6"
        >
          <div className="flex max-h-[calc(100vh-48px)] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 px-6">
              <div className="min-w-0">
                <h3
                  id="account-permission-modal-title"
                  className="text-xl font-black text-slate-950"
                >
                  {accountModalMode === "create"
                    ? "Thêm tài khoản"
                    : "Cập nhật thông tin người dùng"}
                </h3>
                <p className="mt-1 truncate text-sm font-semibold text-slate-500">
                  {accountModalMode === "create"
                    ? "Nhập thông tin để tạo tài khoản mới"
                    : `${selectedAccount.name} - ${selectedAccount.email}`}
                </p>
              </div>
              <button
                type="button"
                aria-label="Đóng phân quyền tài khoản"
                onClick={() => setSelectedAccount(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <X size={22} />
              </button>
            </div>

            <div className="border-b border-slate-200 px-6">
              <div className="flex gap-8">
                <button
                  type="button"
                  onClick={() => setActiveModalTab("info")}
                  className={`min-h-12 text-sm font-black ${
                    activeModalTab === "info"
                      ? "border-b-2 border-blue-500 text-slate-950"
                      : "text-slate-400"
                  }`}
                >
                  Thông tin
                </button>
                {isSelectedSystemAccount ? (
                  <button
                    type="button"
                    onClick={() => setActiveModalTab("permissions")}
                    className={`min-h-12 text-sm font-black ${
                      activeModalTab === "permissions"
                        ? "border-b-2 border-blue-500 text-slate-950"
                        : "text-slate-400"
                    }`}
                  >
                    Phân quyền
                  </button>
                ) : null}
              </div>
            </div>

            {accountActionError ? (
              <div className="border-b border-red-100 bg-red-50 px-6 py-3 text-sm font-bold text-red-700">
                {accountActionError}
              </div>
            ) : null}

            <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[300px_1fr]">
              <aside className="border-b border-slate-200 bg-slate-50 lg:border-b-0 lg:border-r">
                <div className="border-b border-slate-200 px-5 py-4 text-sm font-black text-slate-950">
                  Chi nhánh
                </div>
                <div className="grid gap-3 p-5">
                  <button
                    type="button"
                    className="w-full rounded-md border border-blue-100 bg-blue-50 px-4 py-4 text-left text-sm font-black leading-6 text-slate-950"
                  >
                    CineX Vinh Center
                  </button>
                  <div className="rounded-md border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                    <p className="font-black text-slate-950">
                      {selectedAccount.phone || "Chưa cập nhật"}
                    </p>
                    <p>{selectedAccount.status}</p>
                    <p>{selectedAccount.lastLogin}</p>
                  </div>
                </div>
              </aside>

              <div className="flex min-h-0 flex-col">
                {activeModalTab === "info" ? (
                  <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                    <div className="grid gap-5 lg:grid-cols-2">
                      <label className="grid gap-2">
                        <span className="text-sm font-black text-slate-700">
                          Họ tên
                        </span>
                        <input
                          value={selectedAccount.name}
                          onChange={(event) =>
                            updateSelectedAccount("name", event.target.value)
                          }
                          className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500"
                        />
                      </label>

                      <label className="grid gap-2">
                        <span className="text-sm font-black text-slate-700">
                          Email
                        </span>
                        <input
                          type="email"
                          value={selectedAccount.email}
                          onChange={(event) =>
                            updateSelectedAccount("email", event.target.value)
                          }
                          className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500"
                        />
                      </label>

                      <label className="grid gap-2">
                        <span className="text-sm font-black text-slate-700">
                          {accountModalMode === "create"
                            ? "Mật khẩu"
                            : "Mật khẩu mới"}
                        </span>
                        <input
                          type="password"
                          value={selectedAccount.password ?? ""}
                          placeholder={
                            accountModalMode === "create"
                              ? "Tối thiểu 6 ký tự"
                              : "Để trống nếu không đổi"
                          }
                          onChange={(event) =>
                            updateSelectedAccount(
                              "password",
                              event.target.value,
                            )
                          }
                          className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500"
                        />
                      </label>

                      <label className="grid gap-2">
                        <span className="text-sm font-black text-slate-700">
                          Số điện thoại
                        </span>
                        <input
                          value={selectedAccount.phone}
                          onChange={(event) =>
                            updateSelectedAccount("phone", event.target.value)
                          }
                          className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500"
                        />
                      </label>

                      <label className="grid gap-2">
                        <span className="text-sm font-black text-slate-700">
                          Vai trò
                        </span>
                        <select
                          value={selectedAccount.role}
                          onChange={(event) =>
                            updateSelectedAccount("role", event.target.value)
                          }
                          className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500"
                        >
                          {selectedRoleOptions.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="grid gap-2">
                        <span className="text-sm font-black text-slate-700">
                          Trạng thái
                        </span>
                        <select
                          value={selectedAccount.status}
                          onChange={(event) =>
                            updateSelectedAccount("status", event.target.value)
                          }
                          className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500"
                        >
                          {selectedStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="grid gap-2">
                        <span className="text-sm font-black text-slate-700">
                          Đăng nhập gần nhất
                        </span>
                        <input
                          value={selectedAccount.lastLogin}
                          readOnly
                          className="h-11 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-500 outline-none"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center">
                      <label className="text-sm font-bold text-slate-700">
                        Vai trò
                      </label>
                      <select
                        value={selectedAccount.role}
                        onChange={(event) =>
                          updateSelectedAccount("role", event.target.value)
                        }
                        className="h-11 min-w-64 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
                      >
                        {selectedRoleOptions
                          .filter((role) => role !== "Khách hàng")
                          .map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        aria-label="Chỉnh sửa vai trò"
                        className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-50"
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        type="button"
                        aria-label="Thêm vai trò"
                        className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-50"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                      <div className="grid gap-8 xl:grid-cols-3">
                        {permissionGroups.map((group) => (
                          <section key={group.title} className="min-w-0">
                            <h4 className="text-sm font-black text-blue-600">
                              {group.title}
                            </h4>
                            <div className="mt-5 grid gap-6">
                              {group.modules.map((module) => {
                                const modulePermissionIds =
                                  module.permissions.map(
                                    (permission) => permission.id,
                                  );
                                const moduleChecked =
                                  modulePermissionIds.every((permissionId) =>
                                    selectedPermissionSet.has(permissionId),
                                  );

                                return (
                                  <div key={module.id} className="grid gap-3">
                                    <label className="flex items-start gap-3 text-sm font-bold text-slate-800">
                                      <ChevronDown
                                        size={16}
                                        className="mt-1 shrink-0 text-slate-700"
                                      />
                                      <input
                                        type="checkbox"
                                        checked={moduleChecked}
                                        onChange={(event) =>
                                          toggleModulePermissions(
                                            module,
                                            event.target.checked,
                                          )
                                        }
                                        className="mt-0.5 h-5 w-5 rounded border-slate-300 accent-blue-600"
                                      />
                                      <span className="leading-6">
                                        {module.label}
                                      </span>
                                    </label>

                                    <div className="ml-11 grid gap-3">
                                      {module.permissions.map((permission) => (
                                        <label
                                          key={permission.id}
                                          className="flex items-start gap-3 text-sm font-semibold text-slate-600"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={selectedPermissionSet.has(
                                              permission.id,
                                            )}
                                            onChange={() =>
                                              togglePermission(permission.id)
                                            }
                                            className="mt-0.5 h-5 w-5 rounded border-slate-300 accent-blue-600"
                                          />
                                          <span className="leading-6">
                                            {permission.label}
                                          </span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </section>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedAccount(null)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                <X size={17} />
                Đóng
              </button>
              <PermissionButton
                type="button"
                onClick={saveSelectedAccount}
                permissionRule={{ permission: "user.manage" }}
                disabled={isSavingAccount}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                <Save size={17} />
                {isSavingAccount ? "Đang lưu..." : "Lưu"}
              </PermissionButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
