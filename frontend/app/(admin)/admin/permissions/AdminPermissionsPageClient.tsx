"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
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
import { useEffect, useState } from "react";

type PermissionRole = {
  id: string;
  role: string;
  scope: string;
  users: string;
  permissions: string;
  status: string;
};

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

const roleRows: PermissionRole[] = [
  {
    id: "admin",
    role: "Quản trị viên",
    scope: "Toàn bộ website quản trị",
    users: "2",
    permissions: "Tất cả",
    status: "Đang hoạt động",
  },
  {
    id: "manager",
    role: "Quản lý",
    scope: "Vận hành tổng quan",
    users: "8",
    permissions: "36",
    status: "Đang hoạt động",
  },
  {
    id: "cashier",
    role: "Nhân viên thu ngân",
    scope: "Đơn hàng, hoàn tiền, hóa đơn",
    users: "18",
    permissions: "12",
    status: "Đang hoạt động",
  },
  {
    id: "movie-manager",
    role: "Nhân viên quản lý phim",
    scope: "Phim, thể loại, lịch chiếu",
    users: "5",
    permissions: "14",
    status: "Đang hoạt động",
  },
  {
    id: "accountant",
    role: "Nhân viên kế toán",
    scope: "Doanh thu, thanh toán",
    users: "4",
    permissions: "7",
    status: "Đang hoạt động",
  },
  {
    id: "customer-support",
    role: "Nhân viên chăm sóc khách hàng",
    scope: "Bình luận, đánh giá, liên hệ",
    users: "6",
    permissions: "7",
    status: "Đang hoạt động",
  },
  {
    id: "customer",
    role: "Khách hàng",
    scope: "Website người dùng",
    users: "1.240",
    permissions: "12",
    status: "Đang hoạt động",
  },
];

const permissionGroups: PermissionGroup[] = [
  {
    title: "Phim",
    modules: [
      {
        id: "movie-catalog",
        label: "Danh mục phim",
        permissions: [
          { id: "movie-catalog.view", label: "Xem danh sách" },
          { id: "movie-catalog.create", label: "Thêm mới" },
          { id: "movie-catalog.update", label: "Cập nhật" },
          { id: "movie-catalog.delete", label: "Xóa" },
          { id: "movie-catalog.import", label: "Import" },
          { id: "movie-catalog.export", label: "Xuất file" },
        ],
      },
      {
        id: "movie-status",
        label: "Trạng thái phim",
        permissions: [
          { id: "movie-status.now", label: "Quản lý phim đang chiếu" },
          { id: "movie-status.soon", label: "Quản lý phim sắp chiếu" },
          { id: "movie-status.pause", label: "Tạm dừng hiển thị" },
          { id: "movie-status.publish", label: "Mở bán vé" },
        ],
      },
      {
        id: "movie-genre",
        label: "Thể loại phim",
        permissions: [
          { id: "movie-genre.view", label: "Xem danh sách" },
          { id: "movie-genre.create", label: "Thêm mới" },
          { id: "movie-genre.update", label: "Cập nhật" },
          { id: "movie-genre.delete", label: "Xóa" },
        ],
      },
    ],
  },
  {
    title: "Giao dịch",
    modules: [
      {
        id: "showtime",
        label: "Lịch chiếu",
        permissions: [
          { id: "showtime.view", label: "Xem danh sách" },
          { id: "showtime.create", label: "Thêm mới" },
          { id: "showtime.update", label: "Cập nhật" },
          { id: "showtime.delete", label: "Xóa" },
          { id: "showtime.price", label: "Cập nhật giá vé" },
        ],
      },
      {
        id: "booking",
        label: "Đặt vé",
        permissions: [
          { id: "booking.view", label: "Xem danh sách" },
          { id: "booking.create", label: "Tạo đơn tại quầy" },
          { id: "booking.update", label: "Cập nhật đơn" },
          { id: "booking.cancel", label: "Hủy đơn" },
          { id: "booking.refund", label: "Hoàn tiền" },
          { id: "booking.invoice", label: "Xuất hóa đơn" },
        ],
      },
      {
        id: "ticket",
        label: "Vé",
        permissions: [
          { id: "ticket.view", label: "Xem danh sách" },
          { id: "ticket.issue", label: "Phát hành vé" },
          { id: "ticket.scan", label: "Soát vé" },
          { id: "ticket.cancel", label: "Hủy vé" },
        ],
      },
    ],
  },
  {
    title: "Báo cáo",
    modules: [
      {
        id: "daily-report",
        label: "Cuối ngày",
        permissions: [
          { id: "daily-report.summary", label: "Tổng hợp" },
          { id: "daily-report.movies", label: "Theo phim" },
          { id: "daily-report.cinemas", label: "Theo rạp" },
          { id: "daily-report.payments", label: "Thanh toán" },
        ],
      },
      {
        id: "revenue",
        label: "Doanh thu",
        permissions: [
          { id: "revenue.view", label: "Xem báo cáo" },
          { id: "revenue.export", label: "Xuất báo cáo" },
          { id: "revenue.compare", label: "So sánh kỳ" },
          { id: "revenue.detail", label: "Xem chi tiết giao dịch" },
        ],
      },
      {
        id: "system",
        label: "Hệ thống",
        permissions: [
          { id: "system.accounts", label: "Quản lý tài khoản" },
          { id: "system.roles", label: "Phân quyền vai trò" },
          { id: "system.audit", label: "Xem nhật ký thao tác" },
          { id: "system.settings", label: "Cài đặt hệ thống" },
        ],
      },
    ],
  },
  {
    title: "Chăm sóc khách hàng",
    modules: [
      {
        id: "customer-feedback",
        label: "Bình luận và đánh giá",
        permissions: [
          { id: "customer-feedback.view", label: "Xem bình luận / đánh giá" },
          { id: "customer-feedback.reply", label: "Trả lời bình luận / đánh giá" },
        ],
      },
      {
        id: "contact-channel",
        label: "Kênh liên hệ",
        permissions: [
          { id: "contact-channel.view", label: "Xem tin nhắn liên hệ" },
          { id: "contact-channel.reply", label: "Trả lời tin nhắn liên hệ" },
        ],
      },
    ],
  },
  {
    title: "Website người dùng",
    modules: [
      {
        id: "customer-site",
        label: "Chức năng khách hàng",
        permissions: [
          { id: "customer-site.access", label: "Truy cập website người dùng" },
          { id: "customer-site.booking", label: "Đặt vé và thanh toán" },
          { id: "customer-site.refund", label: "Gửi yêu cầu hoàn tiền" },
          { id: "customer-site.review", label: "Bình luận / đánh giá" },
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

const defaultRolePermissions: Record<string, string[]> = {
  admin: allPermissionIds,
  manager: [
    "movie-catalog.view",
    "movie-catalog.create",
    "movie-catalog.update",
    "movie-catalog.delete",
    "movie-status.now",
    "movie-status.soon",
    "movie-status.publish",
    "movie-genre.view",
    "showtime.view",
    "showtime.create",
    "showtime.update",
    "showtime.price",
    "booking.view",
    "booking.create",
    "booking.update",
    "booking.cancel",
    "booking.refund",
    "booking.invoice",
    "ticket.view",
    "daily-report.summary",
    "daily-report.movies",
    "revenue.view",
    "revenue.export",
    "customer-feedback.view",
    "customer-feedback.reply",
    "contact-channel.view",
    "contact-channel.reply",
  ],
  cashier: [
    "movie-catalog.view",
    "showtime.view",
    "booking.view",
    "booking.create",
    "booking.update",
    "booking.cancel",
    "booking.refund",
    "booking.invoice",
    "ticket.view",
    "ticket.issue",
    "ticket.scan",
  ],
  "movie-manager": [
    "movie-catalog.view",
    "movie-catalog.create",
    "movie-catalog.update",
    "movie-catalog.delete",
    "movie-status.now",
    "movie-status.soon",
    "movie-status.pause",
    "movie-status.publish",
    "movie-genre.view",
    "movie-genre.create",
    "movie-genre.update",
    "movie-genre.delete",
    "showtime.view",
    "showtime.create",
    "showtime.update",
    "showtime.price",
  ],
  accountant: [
    "booking.view",
    "booking.invoice",
    "ticket.view",
    "daily-report.summary",
    "daily-report.payments",
    "revenue.view",
    "revenue.export",
    "revenue.compare",
    "revenue.detail",
  ],
  "customer-support": [
    "booking.view",
    "customer-feedback.view",
    "customer-feedback.reply",
    "contact-channel.view",
    "contact-channel.reply",
  ],
  customer: [
    "customer-site.access",
    "customer-site.booking",
    "customer-site.refund",
    "customer-site.review",
  ],
};

function buildInitialPermissionState() {
  return Object.fromEntries(
    roleRows.map((role) => [
      role.id,
      new Set(defaultRolePermissions[role.id] ?? []),
    ]),
  ) as Record<string, Set<string>>;
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

  return "border-slate-200 bg-slate-100 text-slate-700";
}

export default function AdminPermissionsPageClient() {
  const [selectedRole, setSelectedRole] = useState<PermissionRole | null>(null);
  const [rolePermissions, setRolePermissions] = useState(
    buildInitialPermissionState,
  );

  useEffect(() => {
    if (!selectedRole) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedRole(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedRole]);

  const selectedPermissionSet = selectedRole
    ? rolePermissions[selectedRole.id] ?? new Set<string>()
    : new Set<string>();

  const updateRolePermissionSet = (
    roleId: string,
    updater: (permissions: Set<string>) => void,
  ) => {
    setRolePermissions((current) => {
      const nextSet = new Set(current[roleId] ?? []);
      updater(nextSet);

      return {
        ...current,
        [roleId]: nextSet,
      };
    });
  };

  const togglePermission = (permissionId: string) => {
    if (!selectedRole) {
      return;
    }

    updateRolePermissionSet(selectedRole.id, (permissions) => {
      if (permissions.has(permissionId)) {
        permissions.delete(permissionId);
        return;
      }

      permissions.add(permissionId);
    });
  };

  const toggleModulePermissions = (module: PermissionModule, checked: boolean) => {
    if (!selectedRole) {
      return;
    }

    updateRolePermissionSet(selectedRole.id, (permissions) => {
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
            3.4.2
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Quản lý phân quyền
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Khung quản lý vai trò, nhóm quyền và phạm vi truy cập của từng nhóm
            người dùng trong hệ thống quản trị.
          </p>
        </div>

        <Link
          href="/admin/permissions/new"
          className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-700"
        >
          <Plus size={17} />
          Thêm vai trò
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Vai trò",
            value: "6",
            helper: "Theo mô hình RBAC",
            icon: ShieldCheck,
            tone: "bg-red-50 text-red-700",
          },
          {
            label: "Nhóm quyền",
            value: "42",
            helper: "Theo từng module quản trị",
            icon: CheckCircle2,
            tone: "bg-emerald-50 text-emerald-700",
          },
          {
            label: "Tài khoản nội bộ",
            value: "38",
            helper: "Đang được gán quyền",
            icon: Users,
            tone: "bg-blue-50 text-blue-700",
          },
          {
            label: "Quyền nhạy cảm",
            value: "9",
            helper: "Cần kiểm tra định kỳ",
            icon: AlertTriangle,
            tone: "bg-amber-50 text-amber-700",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="rounded-md border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-black text-slate-950">
                    {stat.value}
                  </p>
                </div>
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${stat.tone}`}
                >
                  <Icon size={21} />
                </span>
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-500">
                {stat.helper}
              </p>
            </article>
          );
        })}
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_repeat(2,210px)_auto]">
          <label className="relative block">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              placeholder="Tìm vai trò, mã quyền, nhóm người dùng..."
              className="h-11 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white"
            />
          </label>

          <select
            className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-red-500"
            defaultValue=""
          >
            <option value="">Tất cả module</option>
            <option>Tài khoản</option>
            <option>Phim</option>
            <option>Rạp</option>
            <option>Doanh thu</option>
          </select>

          <select
            className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-red-500"
            defaultValue=""
          >
            <option value="">Tất cả trạng thái</option>
            <option>Đang hoạt động</option>
            <option>Tạm dừng</option>
            <option>Chờ rà soát</option>
          </select>

          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            <SlidersHorizontal size={17} />
            Lọc
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-950">
              Danh sách vai trò
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Bấm nút sửa để mở ma trận phân quyền chi tiết cho từng vai trò.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] border-collapse text-left">
            <thead className="bg-slate-200 text-sm uppercase text-slate-950">
              <tr>
                <th className="px-4 py-4 font-black">Vai trò</th>
                <th className="px-4 py-4 font-black">Phạm vi</th>
                <th className="px-4 py-4 font-black">Số tài khoản</th>
                <th className="px-4 py-4 font-black">Số quyền</th>
                <th className="px-4 py-4 font-black">Trạng thái</th>
                <th className="px-4 py-4 text-center font-black">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-slate-900">
              {roleRows.map((role) => {
                const detailHref = `/admin/permissions/${toRouteId(role.role)}`;

                return (
                  <tr
                    key={role.id}
                    className="border-b border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-4 text-sm font-black text-slate-950">
                      {role.role}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                      {role.scope}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                      {role.users}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                      {role.permissions}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-black ${statusClass(
                          role.status,
                        )}`}
                      >
                        {role.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={detailHref}
                          aria-label={`Xem ${role.role}`}
                          className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-400 text-slate-600 transition hover:bg-slate-50"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          type="button"
                          aria-label={`Sửa ${role.role}`}
                          onClick={() => setSelectedRole(role)}
                          className="flex h-9 w-9 items-center justify-center rounded-md border border-blue-500 text-blue-600 transition hover:bg-blue-50"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Xóa ${role.role}`}
                          className="flex h-9 w-9 items-center justify-center rounded-md border border-red-500 text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {selectedRole ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="permission-modal-title"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 px-4 py-6"
        >
          <div className="flex max-h-[calc(100vh-48px)] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 px-6">
              <div className="min-w-0">
                <h3
                  id="permission-modal-title"
                  className="text-xl font-black text-slate-950"
                >
                  Người dùng
                </h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Vai trò: {selectedRole.role}
                </p>
              </div>
              <button
                type="button"
                aria-label="Đóng phân quyền"
                onClick={() => setSelectedRole(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <X size={22} />
              </button>
            </div>

            <div className="border-b border-slate-200 px-6">
              <div className="flex gap-8">
                <button
                  type="button"
                  className="min-h-12 text-sm font-bold text-slate-400"
                >
                  Thông tin
                </button>
                <button
                  type="button"
                  className="min-h-12 border-b-2 border-blue-500 text-sm font-black text-slate-950"
                >
                  Phân quyền
                </button>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[300px_1fr]">
              <aside className="border-b border-slate-200 bg-slate-50 lg:border-b-0 lg:border-r">
                <div className="border-b border-slate-200 px-5 py-4 text-sm font-black text-slate-950">
                  Chi nhánh
                </div>
                <div className="p-5">
                  <button
                    type="button"
                    className="w-full rounded-md border border-blue-100 bg-blue-50 px-4 py-4 text-left text-sm font-black leading-6 text-slate-950"
                  >
                    CineX Vinh Center
                  </button>
                </div>
              </aside>

              <div className="flex min-h-0 flex-col">
                <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center">
                  <label className="text-sm font-bold text-slate-700">
                    Vai trò
                  </label>
                  <select
                    value={selectedRole.id}
                    onChange={(event) => {
                      const nextRole = roleRows.find(
                        (role) => role.id === event.target.value,
                      );

                      if (nextRole) {
                        setSelectedRole(nextRole);
                      }
                    }}
                    className="h-11 min-w-64 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
                  >
                    {roleRows.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.role}
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
                            const modulePermissionIds = module.permissions.map(
                              (permission) => permission.id,
                            );
                            const moduleChecked = modulePermissionIds.every(
                              (permissionId) =>
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
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                <X size={17} />
                Bỏ qua
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700"
              >
                <Save size={17} />
                Lưu
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
