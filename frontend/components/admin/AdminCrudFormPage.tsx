import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import type {
  AdminCrudConfig,
  AdminCrudField,
  AdminCrudRow,
} from "@/app/(admin)/admin/admin-crud-config";
import { PermissionButton } from "@/components/admin/PermissionControls";
import type { PermissionRule } from "@/lib/admin-permissions";

type AdminCrudFormPageProps = {
  config: AdminCrudConfig;
  mode: "create" | "edit";
  item?: AdminCrudRow;
};

const inputClass =
  "h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100";
const textareaClass =
  "min-h-32 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100";
const labelClass = "grid gap-2 text-sm font-bold text-slate-700";

function getCrudFormRule(
  config: AdminCrudConfig,
  mode: "create" | "edit",
): PermissionRule {
  const action = mode === "create" ? "create" : "update";

  switch (config.key) {
    case "accounts":
      return { permission: "user.manage" };
    case "permissions":
      return { permission: "role.manage" };
    case "cinemas":
      return {
        permission: action === "create" ? "cinema.create" : "cinema.update",
      };
    case "rooms":
      return { permission: "room.manage" };
    case "showtimes":
      return {
        permission:
          action === "create" ? "showtime.session.create" : "showtime.manage",
      };
    case "bookings":
      return {
        permission: action === "create" ? "booking.create" : "booking.manage",
      };
    case "tickets":
      return { permission: "booking.manage" };
  }
}

function FieldControl({
  field,
  value,
}: {
  field: AdminCrudField;
  value: string;
}) {
  if (field.type === "textarea") {
    return (
      <textarea
        defaultValue={value}
        placeholder={field.placeholder}
        className={textareaClass}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select defaultValue={value} className={inputClass}>
        <option value="">Chọn {field.label.toLowerCase()}</option>
        {field.options?.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={field.type ?? "text"}
      defaultValue={value}
      placeholder={field.placeholder}
      className={inputClass}
    />
  );
}

export default function AdminCrudFormPage({
  config,
  mode,
  item,
}: AdminCrudFormPageProps) {
  const isEdit = mode === "edit";
  const heading = isEdit
    ? `Chỉnh sửa ${config.singularTitle}`
    : `Thêm ${config.singularTitle} mới`;

  return (
    <div className="mx-auto grid max-w-[1440px] gap-6">
      <section className="flex items-start gap-4">
        <Link
          href={config.basePath}
          aria-label={`Quay lại ${config.title.toLowerCase()}`}
          className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950">
            {heading}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {config.description}
          </p>
        </div>
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-black text-slate-950">Thông tin cơ bản</h3>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {config.fields.map((field) => (
            <label
              key={field.key}
              className={`${labelClass} ${
                field.span === "full" ? "lg:col-span-2" : ""
              }`}
            >
              {field.label}
              <FieldControl field={field} value={item?.[field.key] ?? ""} />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-black text-slate-950">Thiết lập hiển thị</h3>
        <div className="mt-5 grid gap-4 text-sm font-semibold leading-6 text-slate-600 sm:grid-cols-2 xl:grid-cols-3">
          <p className="rounded-md border border-slate-200 bg-slate-50 p-4">
            Mã bản ghi:{" "}
            <strong className="text-slate-950">{item?.id ?? "Tự tạo"}</strong>
          </p>
          <p className="rounded-md border border-slate-200 bg-slate-50 p-4">
            Dữ liệu:{" "}
            <strong className="text-slate-950">Khung giao diện mẫu</strong>
          </p>
          <p className="rounded-md border border-slate-200 bg-slate-50 p-4">
            Trạng thái lưu:{" "}
            <strong className="text-slate-950">Chưa nối database</strong>
          </p>
        </div>
      </section>

      <section className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <Link
          href={config.basePath}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
        >
          Hủy
        </Link>
        <PermissionButton
          type="button"
          permissionRule={getCrudFormRule(config, mode)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700"
        >
          <Save size={17} />
          {isEdit ? config.updateAction : config.createAction}
        </PermissionButton>
      </section>
    </div>
  );
}
