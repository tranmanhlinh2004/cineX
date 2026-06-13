"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Clock3,
  Globe2,
  Image as ImageIcon,
  Save,
  ShieldAlert,
  Video,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { AdminMovie } from "@/app/(admin)/admin/movies/movie-data";

type MovieFormPageProps = {
  mode: "create" | "edit";
  movie?: AdminMovie;
};

const inputClass =
  "h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100";
const labelClass = "grid gap-2 text-sm font-bold text-slate-700";
const weekDayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function formatMovieDate(date: Date) {
  return `${padDatePart(date.getDate())}/${padDatePart(
    date.getMonth() + 1,
  )}/${date.getFullYear()}`;
}

function parseMovieDate(value?: string) {
  if (!value) {
    return null;
  }

  const displayMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  const day = displayMatch ? Number(displayMatch[1]) : Number(isoMatch?.[3]);
  const month = displayMatch ? Number(displayMatch[2]) : Number(isoMatch?.[2]);
  const year = displayMatch ? Number(displayMatch[3]) : Number(isoMatch?.[1]);

  if (!day || !month || !year) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function isSameCalendarDate(first: Date | null, second: Date | null) {
  return Boolean(
    first &&
      second &&
      first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth() &&
      first.getDate() === second.getDate(),
  );
}

function getCalendarDays(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const mondayBasedOffset = (firstDay.getDay() + 6) % 7;

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(year, month, index - mondayBasedOffset + 1);

    return {
      date,
      currentMonth: date.getMonth() === month,
    };
  });
}

function MovieDatePicker({
  name,
  initialValue,
}: {
  name: string;
  initialValue?: string;
}) {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(() =>
    parseMovieDate(initialValue),
  );
  const [viewDate, setViewDate] = useState(() => {
    const initialDate = parseMovieDate(initialValue) ?? new Date();

    return new Date(initialDate.getFullYear(), initialDate.getMonth(), 1);
  });
  const displayValue = selectedDate ? formatMovieDate(selectedDate) : "";
  const today = new Date();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Node) || pickerRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const moveMonth = (offset: number) => {
    setViewDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    setViewDate(new Date(date.getFullYear(), date.getMonth(), 1));
    setOpen(false);
  };

  return (
    <div ref={pickerRef} className="relative">
      <input type="hidden" name={name} value={displayValue} />
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`${inputClass} relative flex cursor-pointer items-center pl-10 text-left`}
      >
        <CalendarDays
          size={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <span className={displayValue ? "text-slate-900" : "text-slate-400"}>
          {displayValue || "dd/mm/yyyy"}
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Chon ngay"
          className="absolute left-0 top-full z-30 mt-2 w-full min-w-72 rounded-md border border-slate-200 bg-white p-3 shadow-xl"
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Thang truoc"
              onClick={() => moveMonth(-1)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            >
              <ChevronLeft size={17} />
            </button>

            <select
              aria-label="Chon thang"
              value={viewDate.getMonth()}
              onChange={(event) =>
                setViewDate(
                  new Date(viewDate.getFullYear(), Number(event.target.value), 1),
                )
              }
              className="h-9 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2 text-sm font-black text-slate-800 outline-none focus:border-red-500"
            >
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index} value={index}>
                  Tháng {index + 1}
                </option>
              ))}
            </select>

            <input
              aria-label="Chon nam"
              type="number"
              min={1900}
              max={2100}
              value={viewDate.getFullYear()}
              onChange={(event) => {
                const year = event.target.valueAsNumber;

                if (Number.isNaN(year)) {
                  return;
                }

                setViewDate(new Date(year, viewDate.getMonth(), 1));
              }}
              className="h-9 w-20 rounded-md border border-slate-200 bg-white px-2 text-sm font-black text-slate-800 outline-none focus:border-red-500"
            />

            <button
              type="button"
              aria-label="Thang sau"
              onClick={() => moveMonth(1)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            >
              <ChevronRight size={17} />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-black uppercase text-slate-400">
            {weekDayLabels.map((label) => (
              <span key={label} className="py-1">
                {label}
              </span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {getCalendarDays(viewDate).map(({ date, currentMonth }) => {
              const selected = isSameCalendarDate(date, selectedDate);
              const currentDay = isSameCalendarDate(date, today);

              return (
                <button
                  key={formatMovieDate(date)}
                  type="button"
                  aria-label={`Chon ngay ${formatMovieDate(date)}`}
                  aria-pressed={selected}
                  onClick={() => selectDate(date)}
                  className={`flex aspect-square min-h-9 items-center justify-center rounded-md text-sm font-black transition ${
                    selected
                      ? "bg-red-600 text-white shadow-sm shadow-red-600/20"
                      : currentMonth
                        ? "text-slate-800 hover:bg-red-50 hover:text-red-700"
                        : "text-slate-300 hover:bg-slate-50 hover:text-slate-500"
                  } ${currentDay && !selected ? "ring-1 ring-red-200" : ""}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => selectDate(today)}
              className="rounded-md px-2 py-1.5 text-xs font-black text-red-600 transition hover:bg-red-50"
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedDate(null);
                setOpen(false);
              }}
              className="rounded-md px-2 py-1.5 text-xs font-black text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
            >
              Xóa
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function MovieFormPage({ mode, movie }: MovieFormPageProps) {
  const isEdit = mode === "edit";

  return (
    <div className="mx-auto grid max-w-[1440px] gap-6">
      <section className="flex items-start gap-4">
        <Link
          href="/admin/movies"
          aria-label="Quay lại danh sách phim"
          className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950">
            {isEdit ? "Chỉnh sửa phim" : "Thêm phim mới"}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Cập nhật thông tin đầy đủ để hiển thị nhất quán ở trang khách hàng.
          </p>
        </div>
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-black text-slate-950">Thông tin cơ bản</h3>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <label className={labelClass}>
            Tên phim
            <input
              defaultValue={movie?.title}
              placeholder="Nhập tên phim"
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            Thể loại
            <select defaultValue={movie?.genre ?? ""} className={inputClass}>
              <option value="">Chọn thể loại</option>
              <option>Hành động</option>
              <option>Hoạt hình</option>
              <option>Khoa học viễn tưởng</option>
              <option>Kinh dị</option>
              <option>Tâm lý gia đình</option>
            </select>
          </label>
        </div>

        <label className={`${labelClass} mt-5`}>
          Mô tả phim
          <textarea
            defaultValue={movie?.description}
            placeholder="Nhập mô tả phim, nội dung tóm tắt, điểm nổi bật..."
            className="min-h-32 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </label>

        <label className={`${labelClass} mt-5`}>
          Trailer phim hoặc video review (tùy chọn)
          <span className="relative">
            <Video
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              defaultValue={movie?.trailerUrl}
              placeholder="https://... (YouTube, TikTok hoặc link video trực tiếp)"
              className={`${inputClass} pl-10`}
            />
          </span>
        </label>
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-black text-slate-950">
          Thời lượng và phân loại
        </h3>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <label className={labelClass}>
            Thời lượng
            <span className="relative">
              <Clock3
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                defaultValue={movie?.duration}
                placeholder="120 phút"
                className={`${inputClass} pl-10`}
              />
            </span>
          </label>

          <label className={labelClass}>
            Quốc gia
            <span className="relative">
              <Globe2
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                defaultValue={movie?.country}
                placeholder="Việt Nam"
                className={`${inputClass} pl-10`}
              />
            </span>
          </label>

          <label className={labelClass}>
            Giới hạn độ tuổi
            <span className="relative">
              <ShieldAlert
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select defaultValue={movie?.ageRating ?? ""} className={`${inputClass} pl-10`}>
                <option value="">Chọn độ tuổi</option>
                <option>P</option>
                <option>K</option>
                <option>T13</option>
                <option>T16</option>
                <option>T18</option>
              </select>
            </span>
          </label>

          <label className={labelClass}>
            Ngôn ngữ
            <input
              defaultValue={movie?.language}
              placeholder="Phụ đề Việt"
              className={inputClass}
            />
          </label>
        </div>
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-black text-slate-950">
          Lịch phát hành và hiển thị
        </h3>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className={labelClass}>
            Ngày khởi chiếu
            <MovieDatePicker
              name="releaseDate"
              initialValue={movie?.releaseDate}
            />
          </div>

          <div className={labelClass}>
            Ngày kết thúc dự kiến
            <MovieDatePicker
              name="endDate"
              initialValue={movie?.endDate}
            />
          </div>

          <label className={labelClass}>
            Trạng thái
            <select defaultValue={movie?.status ?? "Đang hoạt động"} className={inputClass}>
              <option>Đang hoạt động</option>
              <option>Sắp chiếu</option>
              <option>Tạm dừng</option>
              <option>Ngừng chiếu</option>
            </select>
          </label>

          <label className={labelClass}>
            Đạo diễn
            <input
              defaultValue={movie?.director}
              placeholder="Tên đạo diễn"
              className={inputClass}
            />
          </label>
        </div>

      </section>

      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-black text-slate-950">Hình ảnh hiển thị</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Chọn ảnh từ máy tính để thay đổi poster và banner phim. Ảnh đang được
          preview tại trình duyệt, chưa upload lên server.
        </p>

        <div className="mt-6 grid gap-5 lg:grid-cols-[320px_1fr]">
          <ImagePicker
            name="posterFile"
            label="Poster phim"
            description="Khuyến nghị ảnh dọc tỷ lệ 2:3."
            initialImage={movie?.poster}
            previewClassName="aspect-[2/3]"
          />

          <ImagePicker
            name="bannerFile"
            label="Banner phim"
            description="Khuyến nghị ảnh ngang tỷ lệ 16:9 hoặc 21:9."
            initialImage={movie?.banner}
            previewClassName="aspect-[16/7]"
          />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <label className={labelClass}>
            Link poster hiện tại
            <span className="relative">
              <ImageIcon
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                defaultValue={movie?.poster}
                placeholder="https://... poster phim"
                className={`${inputClass} pl-10`}
              />
            </span>
          </label>

          <label className={labelClass}>
            Link banner hiện tại
            <span className="relative">
              <ImageIcon
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                defaultValue={movie?.banner}
                placeholder="https://... banner phim"
                className={`${inputClass} pl-10`}
              />
            </span>
          </label>
        </div>
      </section>

      <section className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <Link
          href="/admin/movies"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
        >
          Hủy
        </Link>
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700"
        >
          <Save size={17} />
          {isEdit ? "Lưu thay đổi" : "Tạo phim mới"}
        </button>
      </section>

    </div>
  );
}

function ImagePicker({
  name,
  label,
  description,
  initialImage,
  previewClassName,
}: {
  name: string;
  label: string;
  description: string;
  initialImage?: string;
  previewClassName: string;
}) {
  const inputId = useId();
  const [preview, setPreview] = useState(initialImage ?? "");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="grid gap-3">
      <div>
        <p className="text-sm font-black text-slate-950">{label}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div
        className={`relative overflow-hidden rounded-md border border-slate-200 bg-slate-100 ${previewClassName}`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={`Preview ${label.toLowerCase()}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <ImageIcon size={32} />
          </div>
        )}
      </div>

      <label
        htmlFor={inputId}
        className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
      >
        <ImagePlus size={17} />
        Upload
      </label>
      <input
        id={inputId}
        name={name}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (!file) {
            return;
          }

          setPreview(URL.createObjectURL(file));
          setFileName(file.name);
        }}
      />

      <p className="min-h-5 truncate text-xs font-bold text-slate-500">
        {fileName || "Chưa chọn ảnh mới"}
      </p>
    </div>
  );
}
