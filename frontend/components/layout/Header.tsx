"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  History,
  Loader2,
  LogOut,
  Menu,
  QrCode,
  Search,
  User,
  UserCircle,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  AUTH_STORAGE_EVENT,
  clearAuthUser,
  getAuthToken,
  getAuthUser,
  type AuthUser,
} from "@/lib/auth";
import {
  getAccountNotifications,
  markAllNotificationsRead,
  type AccountNotification,
} from "@/lib/auth-api";
import { createLoadingPath } from "@/lib/navigation";

const navItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Phim đang chiếu", href: "/movies/now-showing" },
  { label: "Phim sắp chiếu", href: "/movies/coming-soon" },
  { label: "Lịch chiếu", href: "/showtimes" },
  { label: "Thể loại", href: "/genres" },
  { label: "Giới thiệu", href: "/about" },
  { label: "Đặt vé", href: "/ticket-booking" },
];

const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

const accountMenuItems = [
  { label: "Thông tin cá nhân", href: "/account/profile", icon: UserCircle },
  { label: "Lịch sử đặt vé", href: "/account/booking", icon: History },
  { label: "QR code vé của tôi", href: "/account/tickets", icon: QrCode },
];

const notificationDateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [notifications, setNotifications] = useState<AccountNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const isAuthPage = authRoutes.includes(pathname);
  const showAuthActions = !isAuthPage;
  const displayName = authUser?.fullName || authUser?.username || authUser?.email || "username";

  useEffect(() => {
    const syncAuthUser = () => {
      const token = getAuthToken();
      const user = token ? getAuthUser() : null;

      setAuthUser(user);
      setAuthReady(true);

      if (!user) {
        setOpenMenu(false);
        setNotificationsOpen(false);
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    syncAuthUser();

    window.addEventListener("storage", syncAuthUser);
    window.addEventListener(AUTH_STORAGE_EVENT, syncAuthUser);
    window.addEventListener("pageshow", syncAuthUser);
    window.addEventListener("focus", syncAuthUser);

    return () => {
      window.removeEventListener("storage", syncAuthUser);
      window.removeEventListener(AUTH_STORAGE_EVENT, syncAuthUser);
      window.removeEventListener("pageshow", syncAuthUser);
      window.removeEventListener("focus", syncAuthUser);
    };
  }, []);

  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = () => {
    clearAuthUser();
    setAuthUser(null);
    setOpenMenu(false);
    setNotificationsOpen(false);
    setNotifications([]);
    setUnreadCount(0);
    router.replace(createLoadingPath("/"));
  };

  const loadNotifications = async () => {
    if (!getAuthToken()) {
      return;
    }

    setNotificationsLoading(true);
    setNotificationError("");

    try {
      const data = await getAccountNotifications();

      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);

      if (data.unreadCount > 0) {
        await markAllNotificationsRead();
        setUnreadCount(0);
        setNotifications((current) =>
          current.map((notification) => ({ ...notification, isRead: true })),
        );
      }
    } catch (error) {
      setNotificationError(
        error instanceof Error ? error.message : "Không thể tải thông báo.",
      );
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleNotificationToggle = () => {
    setNotificationsOpen((current) => {
      const nextOpen = !current;

      if (nextOpen) {
        void loadNotifications();
      }

      return nextOpen;
    });
  };

  const authButtons = (
    <div className="flex h-14 items-center gap-3 rounded-full bg-[#1f1f1f] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <Link
        href="/login"
        className="rounded-full bg-gray-200 px-5 py-2 text-sm font-bold text-black transition hover:bg-white"
      >
        Đăng nhập
      </Link>

      <Link
        href="/register"
        className="rounded-full bg-[#130909] px-5 py-2 text-sm font-bold text-white transition hover:bg-red-700"
      >
        Đăng ký
      </Link>
    </div>
  );

  const userActions = (
    <div className="flex items-center gap-3">
      <div className="relative">
      <button
        type="button"
        aria-label="Thông báo"
        aria-expanded={notificationsOpen}
        onClick={handleNotificationToggle}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-red-500 transition hover:bg-white/10"
      >
        <Bell size={21} fill="currentColor" strokeWidth={2.2} />
        {unreadCount > 0 ? (
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-[#121212] bg-red-500" />
        ) : null}
      </button>

      {notificationsOpen ? (
        <NotificationDropdown
          notifications={notifications}
          isLoading={notificationsLoading}
          error={notificationError}
        />
      ) : null}
      </div>

      <div className="group relative flex h-14 items-center gap-3 rounded-full bg-[#1f1f1f] px-4 pr-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <Link
        href="/account/profile"
        aria-label="Thông tin cá nhân"
        className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white text-gray-400 transition hover:bg-gray-100"
      >
        {authUser?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={authUser.avatarUrl}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          <User size={29} fill="currentColor" strokeWidth={0} />
        )}
      </Link>

      <button
        type="button"
        aria-haspopup="menu"
        className="flex max-w-[190px] items-center gap-1 text-left text-sm font-extrabold text-white outline-none"
      >
        <span className="shrink-0">Hi,</span>
        <span className="truncate">{displayName}</span>
        <ChevronDown size={15} className="shrink-0 transition group-hover:rotate-180" />
      </button>

      <div className="invisible absolute right-0 top-full w-64 pt-3 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        <div className="overflow-hidden rounded-md border border-white/10 bg-[#1b1b1b] p-2 shadow-2xl">
          <div className="border-b border-white/10 px-3 py-3">
            <p className="truncate text-sm font-bold text-white">Xin chào, {displayName}</p>
            {authUser?.email && (
              <p className="mt-0.5 truncate text-xs text-white/50">{authUser.email}</p>
            )}
          </div>

          <div className="py-1" role="menu">
            {accountMenuItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-white/78 transition hover:bg-white/8 hover:text-white"
                >
                  <Icon size={17} className="text-red-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-white/78 transition hover:bg-red-600 hover:text-white"
            >
              <LogOut size={17} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#121212]/92 px-3 py-3 text-white shadow-lg backdrop-blur-md sm:px-5 lg:px-8">
      <div className="mx-auto flex min-h-[58px] w-full max-w-[1500px] items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:gap-5">
          <Link
            href="/"
            className="shrink-0 text-2xl font-black italic tracking-tight sm:text-3xl"
            onClick={() => setOpenMenu(false)}
          >
            Cine<span className="text-red-600">X</span>
          </Link>

          <div className="hidden h-10 w-full max-w-[360px] items-center gap-3 rounded-md bg-[#2a2a2a] px-4 md:flex">
            <Search size={16} className="shrink-0 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm phim, rạp..."
              className="w-full bg-transparent text-sm text-gray-300 outline-none placeholder:text-gray-500"
            />
          </div>

          <nav className="hidden min-w-0 items-center gap-1 xl:flex">
            {navItems.map((item) => {
              const active = isActiveRoute(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-red-600 text-white"
                      : "text-white/72 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          {authReady && showAuthActions && (authUser ? userActions : authButtons)}
        </div>

        <button
          type="button"
          aria-label={openMenu ? "Đóng menu" : "Mở menu"}
          aria-expanded={openMenu}
          onClick={() => setOpenMenu((current) => !current)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#242424] text-white transition hover:bg-[#333] xl:hidden"
        >
          {openMenu ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className="mx-auto mt-3 flex h-10 w-full max-w-[1500px] items-center gap-3 rounded-md bg-[#242424] px-4 md:hidden">
        <Search size={16} className="shrink-0 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm phim, rạp, thể loại..."
          className="w-full bg-transparent text-sm text-gray-300 outline-none placeholder:text-gray-500"
        />
      </div>

      {openMenu && (
        <div className="mx-auto mt-3 w-full max-w-[1500px] rounded-md border border-white/10 bg-[#1b1b1b] p-2 shadow-xl xl:hidden">
          <nav className="grid gap-1">
            {navItems.map((item) => {
              const active = isActiveRoute(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpenMenu(false)}
                  className={`rounded-md px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-red-600 text-white"
                      : "text-white/76 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {authReady && showAuthActions && !authUser && (
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-white/10 pt-2 sm:hidden">
              <Link
                href="/login"
                onClick={() => setOpenMenu(false)}
                className="rounded-md bg-gray-200 px-4 py-3 text-center text-sm font-bold text-black transition hover:bg-white"
              >
                Đăng nhập
              </Link>

              <Link
                href="/register"
                onClick={() => setOpenMenu(false)}
                className="rounded-md bg-red-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-red-700"
              >
                Đăng ký
              </Link>
            </div>
          )}

          {authReady && showAuthActions && authUser && (
            <div className="mt-2 grid gap-1 border-t border-white/10 pt-2 sm:hidden">
              <div className="flex items-center gap-3 rounded-md bg-white/5 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white text-gray-400">
                  {authUser.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={authUser.avatarUrl}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={27} fill="currentColor" strokeWidth={0} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">
                    Xin chào, {displayName}
                  </p>
                  <p className="text-xs font-semibold text-red-400">Thông báo mới</p>
                </div>
              </div>

              {accountMenuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpenMenu(false)}
                    className="flex items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold text-white/76 transition hover:bg-white/8 hover:text-white"
                  >
                    <Icon size={17} className="text-red-400" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-semibold text-white/76 transition hover:bg-red-600 hover:text-white"
              >
                <LogOut size={17} />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function NotificationDropdown({
  notifications,
  isLoading,
  error,
}: {
  notifications: AccountNotification[];
  isLoading: boolean;
  error: string;
}) {
  return (
    <div className="absolute right-0 top-full z-50 mt-3 w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-md border border-white/10 bg-[#1b1b1b] shadow-2xl">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-sm font-black text-white">Thông báo</p>
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center gap-2 px-4 py-5 text-sm font-bold text-white/60">
            <Loader2 size={17} className="animate-spin" />
            Đang tải thông báo...
          </div>
        ) : error ? (
          <div className="px-4 py-5 text-sm font-bold text-red-200">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-5 text-sm font-bold text-white/55">
            Chưa có thông báo mới.
          </div>
        ) : (
          <div className="grid">
            {notifications.map((notification) => (
              <article
                key={notification.id}
                className="border-b border-white/8 px-4 py-3 last:border-b-0"
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                      notification.isRead ? "bg-white/20" : "bg-red-500"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-black text-white">{notification.title}</p>
                    <p className="mt-1 text-sm leading-5 text-white/65">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs font-bold text-white/35">
                      {formatNotificationDateTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatNotificationDateTime(value: string) {
  return notificationDateTimeFormatter.format(new Date(value)).replace(",", "");
}
