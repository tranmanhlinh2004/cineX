import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Eye,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

type AdminModuleStat = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone: string;
};

type AdminModuleFilter = {
  label: string;
  options: string[];
};

type AdminModuleColumn = {
  key: string;
  label: string;
};

type AdminModuleRow = Record<string, string>;

type AdminModuleTableSection = {
  tableTitle: string;
  tableDescription: string;
  columns?: AdminModuleColumn[];
  rows: AdminModuleRow[];
};

type AdminModulePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: string;
  basePath?: string;
  searchPlaceholder: string;
  stats: AdminModuleStat[];
  filters: AdminModuleFilter[];
  tableTitle: string;
  tableDescription: string;
  columns: AdminModuleColumn[];
  rows: AdminModuleRow[];
  tableSections?: AdminModuleTableSection[];
  sideTitle: string;
  sideItems: string[];
  checklistTitle: string;
  checklist: string[];
};

const adminModuleBasePaths: Record<string, string> = {
  "3.4.1": "/admin/accounts",
  "3.4.2": "/admin/permissions",
  "3.4.4": "/admin/cinemas",
  "3.4.5": "/admin/rooms",
  "3.4.6": "/admin/showtimes",
  "3.4.7": "/admin/bookings",
  "3.4.8": "/admin/tickets",
};

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

function getRowRouteId(row: AdminModuleRow, columns: AdminModuleColumn[]) {
  const preferredKeys = [
    "id",
    "code",
    "ticketCode",
    columns[0]?.key,
    "role",
    "name",
    "room",
    "movie",
  ];

  for (const key of preferredKeys) {
    const value = key ? row[key] : "";

    if (value) {
      return toRouteId(value);
    }
  }

  return toRouteId(Object.values(row).join("-"));
}

function statusClass(value: string) {
  const normalized = normalizeText(value);

  if (
    normalized.includes("hoat dong") ||
    normalized.includes("da thanh toan") ||
    normalized.includes("da phat hanh") ||
    normalized.includes("da soat ve") ||
    normalized.includes("dang chieu") ||
    normalized.includes("da xac nhan") ||
    normalized.includes("dang mo ban")
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    normalized.includes("cho") ||
    normalized.includes("chua") ||
    normalized.includes("sap") ||
    normalized.includes("bao tri") ||
    normalized.includes("dang xu ly")
  ) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (
    normalized.includes("khoa") ||
    normalized.includes("huy") ||
    normalized.includes("het") ||
    normalized.includes("tam dung")
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-700";
}

export default function AdminModulePage({
  eyebrow,
  title,
  description,
  primaryAction,
  basePath,
  searchPlaceholder,
  stats,
  filters,
  tableTitle,
  tableDescription,
  columns,
  rows,
  tableSections,
}: AdminModulePageProps) {
  const activeBasePath = basePath ?? adminModuleBasePaths[eyebrow];
  const sections = tableSections ?? [
    {
      tableTitle,
      tableDescription,
      columns,
      rows,
    },
  ];

  return (
    <div className="mx-auto grid max-w-[1440px] gap-5">
      <section className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-black uppercase text-red-700">
            {eyebrow}
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>

        {activeBasePath ? (
          <Link
            href={`${activeBasePath}/new`}
            className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-700"
          >
            <Plus size={17} />
            {primaryAction}
          </Link>
        ) : (
          <button
            type="button"
            className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-700"
          >
            <Plus size={17} />
            {primaryAction}
          </button>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
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
              placeholder={searchPlaceholder}
              className="h-11 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white"
            />
          </label>

          {filters.slice(0, 2).map((filter) => (
            <select
              key={filter.label}
              className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-red-500"
              defaultValue=""
            >
              <option value="">{filter.label}</option>
              {filter.options.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          ))}

          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            <SlidersHorizontal size={17} />
            Lọc
          </button>
        </div>
      </section>

      {sections.map((section) => {
        const sectionColumns = section.columns ?? columns;

        return (
          <section
            key={section.tableTitle}
            className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm"
          >
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-950">
                {section.tableTitle}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {section.tableDescription}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] border-collapse text-left">
              <thead className="bg-slate-200 text-sm uppercase text-slate-950">
                <tr>
                  {sectionColumns.map((column) => (
                    <th key={column.key} className="px-4 py-4 font-black">
                      {column.label}
                    </th>
                  ))}
                  <th className="px-4 py-4 text-center font-black">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-slate-900">
                {section.rows.map((row) => {
                  const rowKey = row.id ?? Object.values(row).join("-");
                  const rowTitle = row[sectionColumns[0]?.key] ?? "bản ghi";
                  const routeId = getRowRouteId(row, sectionColumns);
                  const detailHref =
                    activeBasePath && routeId
                      ? `${activeBasePath}/${routeId}`
                      : "";
                  const editHref = detailHref ? `${detailHref}/edit` : "";

                  return (
                    <tr
                      key={rowKey}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      {sectionColumns.map((column, index) => {
                        const value = row[column.key] ?? "";
                        const isStatus =
                          column.key === "status" ||
                          normalizeText(column.label).includes("trang thai");

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
                                className={`inline-flex rounded-full px-3 py-1.5 text-sm font-black ${statusClass(
                                  value,
                                )}`}
                              >
                                {value}
                              </span>
                            ) : (
                              value
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {detailHref ? (
                            <Link
                              href={detailHref}
                              aria-label={`Xem ${rowTitle}`}
                              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-400 text-slate-600 transition hover:bg-slate-50"
                            >
                              <Eye size={16} />
                            </Link>
                          ) : (
                            <button
                              type="button"
                              aria-label="Xem chi tiết"
                              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-400 text-slate-600 transition hover:bg-slate-50"
                            >
                              <Eye size={16} />
                            </button>
                          )}

                          {editHref ? (
                            <Link
                              href={editHref}
                              aria-label={`Sửa ${rowTitle}`}
                              className="flex h-9 w-9 items-center justify-center rounded-md border border-blue-500 text-blue-600 transition hover:bg-blue-50"
                            >
                              <Pencil size={16} />
                            </Link>
                          ) : (
                            <button
                              type="button"
                              aria-label="Chỉnh sửa"
                              className="flex h-9 w-9 items-center justify-center rounded-md border border-blue-500 text-blue-600 transition hover:bg-blue-50"
                            >
                              <Pencil size={16} />
                            </button>
                          )}

                          <button
                            type="button"
                            aria-label={`Xóa ${rowTitle}`}
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
        );
      })}
    </div>
  );
}
