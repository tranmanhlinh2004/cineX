import Link from "next/link";
import { ArrowLeft, ClipboardList, Pencil } from "lucide-react";
import type {
  AdminCrudConfig,
  AdminCrudRow,
} from "@/app/(admin)/admin/admin-crud-config";

type AdminCrudDetailPageProps = {
  config: AdminCrudConfig;
  item: AdminCrudRow;
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function statusClass(value: string) {
  const normalized = normalizeText(value);

  if (
    normalized.includes("hoat dong") ||
    normalized.includes("da thanh toan") ||
    normalized.includes("da phat hanh") ||
    normalized.includes("da soat ve") ||
    normalized.includes("dang mo ban")
  ) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (
    normalized.includes("cho") ||
    normalized.includes("chua") ||
    normalized.includes("bao tri") ||
    normalized.includes("dang xu ly")
  ) {
    return "bg-amber-50 text-amber-700";
  }

  if (
    normalized.includes("khoa") ||
    normalized.includes("huy") ||
    normalized.includes("tam dung")
  ) {
    return "bg-red-50 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}

export default function AdminCrudDetailPage({
  config,
  item,
}: AdminCrudDetailPageProps) {
  const primaryColumn = config.columns[0];
  const primaryValue = item[primaryColumn.key] ?? item.id;
  const status = item.status;

  return (
    <div className="mx-auto grid max-w-[1440px] gap-6">
      <section className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            href={config.basePath}
            aria-label={`Quay lại ${config.title.toLowerCase()}`}
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">
              Chi tiết {config.singularTitle}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Thông tin chi tiết ID: {item.id}
            </p>
          </div>
        </div>

        <Link
          href={`${config.basePath}/${item.id}/edit`}
          className="hidden min-h-10 items-center gap-2 rounded-md bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-700 sm:inline-flex"
        >
          <Pencil size={17} />
          Sửa
        </Link>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-black uppercase text-red-600">
                {config.title}
              </p>
              <h3 className="mt-2 text-2xl font-black text-slate-950">
                {primaryValue}
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                {config.description}
              </p>
            </div>

            {status ? (
              <span
                className={`w-fit rounded-full px-3 py-1.5 text-sm font-black ${statusClass(
                  status,
                )}`}
              >
                {status}
              </span>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {config.columns.map((column) => (
              <div
                key={column.key}
                className="rounded-md border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-xs font-black uppercase text-slate-500">
                  {column.label}
                </p>
                <p className="mt-2 break-words text-sm font-black text-slate-950">
                  {item[column.key] || "Chưa cập nhật"}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-red-50 text-red-600">
            <ClipboardList size={21} />
          </span>
          <h3 className="mt-4 text-lg font-black text-slate-950">
            Trạng thái dữ liệu
          </h3>
          <div className="mt-4 grid gap-3 text-sm font-semibold leading-6 text-slate-600">
            <p>
              Mã bản ghi: <strong>{item.id}</strong>
            </p>
            <p>Giao diện này đang dùng dữ liệu mẫu để dựng khung trước.</p>
            <p>Có thể thay bằng API thật mà không đổi cấu trúc route.</p>
          </div>
        </article>
      </section>

      <article className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-black text-slate-950">Thông tin mở rộng</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {config.fields.map((field) => (
            <div
              key={field.key}
              className={`rounded-md border border-slate-200 p-4 ${
                field.span === "full" ? "md:col-span-2" : ""
              }`}
            >
              <p className="text-xs font-black uppercase text-slate-500">
                {field.label}
              </p>
              <p className="mt-2 break-words text-sm font-semibold leading-6 text-slate-700">
                {item[field.key] || "Chưa cập nhật"}
              </p>
            </div>
          ))}
        </div>
      </article>

      <Link
        href={`${config.basePath}/${item.id}/edit`}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700 sm:hidden"
      >
        <Pencil size={17} />
        Sửa
      </Link>
    </div>
  );
}
