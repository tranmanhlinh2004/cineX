import { hasAnyPermission, hasPermission, type AuthUser } from "@/lib/auth";

export type PermissionRule = {
  permission?: string;
  anyPermission?: readonly string[];
};

export const permissionDeniedMessage =
  "Tài khoản không được cấp quyền thao tác chức năng này.";

export function canUsePermissionRule(
  user: AuthUser | null | undefined,
  rule?: PermissionRule,
) {
  if (!rule) {
    return true;
  }

  if (rule.permission && !hasPermission(user, rule.permission)) {
    return false;
  }

  if (rule.anyPermission && !hasAnyPermission(user, rule.anyPermission)) {
    return false;
  }

  return true;
}

export function getAdminPathPermissionRule(pathname: string): PermissionRule {
  if (pathname === "/admin" || pathname === "/admin/dashboard") {
    return { permission: "admin.access" };
  }

  if (pathname.startsWith("/admin/accounts")) {
    return { permission: "user.view" };
  }

  if (pathname.startsWith("/admin/permissions")) {
    return { permission: "role.manage" };
  }

  if (pathname.startsWith("/admin/movies/new")) {
    return { permission: "movie.create" };
  }

  if (/^\/admin\/movies\/[^/]+\/edit/.test(pathname)) {
    return { permission: "movie.update" };
  }

  if (pathname.startsWith("/admin/movies/genres")) {
    return { permission: "genre.view" };
  }

  if (pathname.startsWith("/admin/movies/reviews")) {
    return { permission: "review.manage" };
  }

  if (pathname.startsWith("/admin/movies")) {
    return { permission: "movie.view" };
  }

  if (
    pathname.startsWith("/admin/cinemas/room-types") ||
    pathname.startsWith("/admin/cinemas/seat-maps") ||
    pathname.startsWith("/admin/cinemas/seat-types") ||
    pathname.startsWith("/admin/rooms")
  ) {
    return { permission: "room.manage" };
  }

  if (pathname.startsWith("/admin/cinemas")) {
    return { permission: "cinema.view" };
  }

  if (pathname.startsWith("/admin/showtimes")) {
    return { permission: "showtime.view" };
  }

  if (pathname.startsWith("/admin/payments/transactions")) {
    return { permission: "payment.view" };
  }

  if (pathname.startsWith("/admin/payments/refund-approvals")) {
    return { permission: "refund.manage" };
  }

  if (pathname.startsWith("/admin/payments/invoices")) {
    return { permission: "invoice.export" };
  }

  if (pathname.startsWith("/admin/payments")) {
    return {
      anyPermission: ["payment.view", "refund.manage", "invoice.export"],
    };
  }

  if (pathname.startsWith("/admin/bookings")) {
    return { permission: "booking.view" };
  }

  if (pathname.startsWith("/admin/tickets")) {
    return { permission: "booking.view" };
  }

  if (pathname.startsWith("/admin/contact-messages")) {
    return { permission: "support.message.view" };
  }

  if (pathname.startsWith("/admin/promotions")) {
    return { permission: "promotion.manage" };
  }

  if (pathname.startsWith("/admin/revenue")) {
    return { permission: "report.revenue.view" };
  }

  return { permission: "admin.access" };
}

export function canAccessAdminPath(
  user: AuthUser | null | undefined,
  pathname: string,
) {
  return canUsePermissionRule(user, getAdminPathPermissionRule(pathname));
}

export function getDefaultAdminPath(user: AuthUser | null | undefined) {
  const fallbackPaths = [
    "/admin/dashboard",
    "/admin/accounts",
    "/admin/movies/now-showing",
    "/admin/showtimes/schedules",
    "/admin/payments/transactions",
    "/admin/payments/refund-approvals",
    "/admin/payments/invoices",
    "/admin/tickets",
    "/admin/contact-messages",
    "/admin/promotions",
    "/admin/revenue",
  ];

  return (
    fallbackPaths.find((path) => canAccessAdminPath(user, path)) ?? "/admin/dashboard"
  );
}
