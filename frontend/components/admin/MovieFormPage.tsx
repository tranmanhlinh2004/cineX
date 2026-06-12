"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ImagePlus,
  Clock3,
  Globe2,
  Image as ImageIcon,
  Save,
  ShieldAlert,
  Video,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import type { AdminMovie } from "@/app/(admin)/admin/movies/movie-data";

type MovieFormPageProps = {
  mode: "create" | "edit";
  movie?: AdminMovie;
};

const inputClass =
  "h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100";
const labelClass = "grid gap-2 text-sm font-bold text-slate-700";

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
          <label className={labelClass}>
            Ngày khởi chiếu
            <span className="relative">
              <CalendarDays
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                defaultValue={movie?.releaseDate}
                placeholder="dd/mm/yyyy"
                className={`${inputClass} pl-10`}
              />
            </span>
          </label>

          <label className={labelClass}>
            Ngày kết thúc dự kiến
            <input
              defaultValue={movie?.endDate}
              placeholder="dd/mm/yyyy"
              className={inputClass}
            />
          </label>

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
