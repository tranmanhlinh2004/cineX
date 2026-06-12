"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Armchair,
  Building2,
  CalendarClock,
  CircleDollarSign,
  Clapperboard,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const adminNavItems = [
  { label: "Tổng quan", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Tài khoản", href: "/admin/accounts", icon: Users },
  { label: "Phân quyền", href: "/admin/permissions", icon: Shield },
  { label: "Quản lý phim", href: "/admin/movies", icon: Clapperboard },
  { label: "Quản lý rạp", href: "/admin/cinemas", icon: Building2 },
  { label: "Phòng chiếu", href: "/admin/rooms", icon: Armchair },
  { label: "Lịch chiếu, giá vé", href: "/admin/showtimes", icon: CalendarClock },
  { label: "Đặt vé, thanh toán", href: "/admin/bookings", icon: CreditCard },
  { label: "Quản lý vé", href: "/admin/tickets", icon: Ticket },
  { label: "Thống kê doanh thu", href: "/admin/revenue", icon: CircleDollarSign },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin/dashboard") {
    return pathname === "/admin" || pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navList = (
    <nav className="grid gap-1">
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={() => setMobileMenuOpen(false)}
            className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-bold transition ${
              active
                ? "bg-red-600 text-white shadow-sm shadow-red-600/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            }`}
          >
            <Icon size={18} className="shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-slate-200 px-5">
          <Link href="/admin" className="flex min-w-0 items-baseline gap-2">
            <span className="text-2xl font-black italic tracking-tight text-slate-950">
              Cine<span className="text-red-600">X</span>
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-black uppercase text-slate-500">
              Quản trị
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <p className="px-3 text-xs font-black uppercase text-slate-400">
            Vận hành
          </p>
          <div className="mt-3">{navList}</div>

          <div className="mt-6 rounded-md border border-red-100 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-sm font-black text-red-700">
              <ShieldCheck size={17} />
              Trực hệ thống
            </div>
            <p className="mt-2 text-sm leading-6 text-red-900/70">
              3 cụm rạp đang mở bán vé. 1 cụm cần cập nhật lịch chiếu trong ngày.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 p-4">
          <Link
            href="/"
            className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <LogOut size={17} />
            Về website
          </Link>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              aria-label={mobileMenuOpen ? "Đóng menu quản trị" : "Mở menu quản trị"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((current) => !current)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-50 lg:hidden"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase text-slate-400">
                Vận hành CineX
              </p>
              <h1 className="truncate text-lg font-black text-slate-950 sm:text-xl">
                Trung tâm quản trị
              </h1>
            </div>

            <label className="relative hidden w-full max-w-sm lg:block">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                placeholder="Tìm phim, rạp, mã vé..."
                className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white"
              />
            </label>

            <button
              type="button"
              aria-label="Thông báo"
              className="relative hidden h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-50 sm:flex"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-600" />
            </button>

            <button
              type="button"
              aria-label="Cài đặt"
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-50 sm:flex"
            >
              <Settings size={18} />
            </button>
          </div>

          {mobileMenuOpen ? (
            <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-lg lg:hidden">
              <label className="relative block">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  placeholder="Tìm phim, rạp, mã vé..."
                  className="h-11 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none focus:border-red-500"
                />
              </label>
              <div className="mt-4">{navList}</div>
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-200 text-sm font-black text-slate-700"
              >
                <LogOut size={17} />
                Về website
              </Link>
            </div>
          ) : null}
        </header>

        <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-7">{children}</main>
      </div>
    </div>
  );
}
