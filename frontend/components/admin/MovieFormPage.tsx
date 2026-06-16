"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ImagePlus,
  Clock3,
  Globe2,
  Image as ImageIcon,
  Save,
  ShieldAlert,
  Video,
} from "lucide-react";
import { useEffect, useId, useState, type FormEvent } from "react";
import CalendarDatePicker from "@/components/CalendarDatePicker";
import {
  createAdminMovie,
  getAdminMovie,
  updateAdminMovie,
  uploadAdminMovieImage,
  type AdminMoviePayload,
  type AdminMovieRecord,
  type AdminMovieStatusCode,
} from "@/lib/admin-movies-api";

type MovieFormPageProps = {
  mode: "create" | "edit";
  movieId?: string;
  movie?: AdminMovieRecord;
};

const inputClass =
  "h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100";
const labelClass = "grid gap-2 text-sm font-bold text-slate-700";
const genreOptions = [
  "Hành động",
  "Hoạt hình",
  "Khoa học viễn tưởng",
  "Kinh dị",
  "Tâm lý",
  "Tình cảm",
  "Hài",
  "Gia đình",
  "Phiêu lưu",
  "Anime",
];
const statusOptions: Array<{ value: AdminMovieStatusCode; label: string }> = [
  { value: "NOW_SHOWING", label: "Đang chiếu" },
  { value: "COMING_SOON", label: "Sắp chiếu" },
  { value: "ENDED", label: "Ngừng chiếu" },
];

const adminMoviesFallbackPath = "/admin/movies/now-showing";

function getAdminMovieListPath(statusCode?: AdminMovieStatusCode) {
  if (statusCode === "COMING_SOON") {
    return "/admin/movies/coming-soon";
  }

  return adminMoviesFallbackPath;
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getFormFile(formData: FormData, key: string) {
  const value = formData.get(key);

  return value instanceof File && value.size > 0 ? value : null;
}

function getStatusCode(value: string): AdminMovieStatusCode {
  if (value === "NOW_SHOWING" || value === "COMING_SOON" || value === "ENDED") {
    return value;
  }

  return "COMING_SOON";
}

function buildMoviePayload(formData: FormData): AdminMoviePayload {
  const genre = getFormString(formData, "genre");
  const durationMinutes = Number.parseInt(
    getFormString(formData, "duration").replace(/[^\d]/g, ""),
    10,
  );

  return {
    title: getFormString(formData, "title"),
    genre,
    genres: genre ? [genre] : [],
    description: getFormString(formData, "description"),
    trailerUrl: getFormString(formData, "trailerUrl"),
    durationMinutes: Number.isFinite(durationMinutes) ? durationMinutes : 0,
    country: getFormString(formData, "country"),
    ageRating: getFormString(formData, "ageRating"),
    language: getFormString(formData, "language"),
    releaseDate: getFormString(formData, "releaseDate"),
    endDate: getFormString(formData, "endDate"),
    statusCode: getStatusCode(getFormString(formData, "statusCode")),
    director: getFormString(formData, "director"),
    actors: getFormString(formData, "actors"),
    posterUrl: getFormString(formData, "posterUrl"),
    bannerUrl: getFormString(formData, "bannerUrl"),
  };
}

function MovieDatePicker({
  name,
  initialValue,
}: {
  name: string;
  initialValue?: string;
}) {
  return (
    <CalendarDatePicker
      name={name}
      defaultValue={initialValue}
      outputFormat="display"
      placeholder="dd/mm/yyyy"
      theme="light"
      accent="red"
      buttonClassName={`${inputClass} pl-10 pr-10 text-left`}
    />
  );
}

export default function MovieFormPage({ mode, movieId, movie }: MovieFormPageProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [loadedMovie, setLoadedMovie] = useState<AdminMovieRecord | null>(
    movie ?? null,
  );
  const [movieLoading, setMovieLoading] = useState(isEdit && !movie);
  const [movieLoadError, setMovieLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isEdit || movie || !movieId) {
      return;
    }

    const currentMovieId = movieId;
    let cancelled = false;

    async function loadMovie() {
      setMovieLoading(true);
      setMovieLoadError("");

      try {
        const data = await getAdminMovie(currentMovieId);

        if (!cancelled) {
          setLoadedMovie(data.movie);
        }
      } catch (error) {
        if (!cancelled) {
          setMovieLoadError(
            error instanceof Error
              ? error.message
              : "Không thể tải dữ liệu phim từ database.",
          );
        }
      } finally {
        if (!cancelled) {
          setMovieLoading(false);
        }
      }
    }

    void loadMovie();

    return () => {
      cancelled = true;
    };
  }, [isEdit, movie, movieId]);

  const currentMovie = isEdit ? loadedMovie : null;
  const movieListPath = getAdminMovieListPath(currentMovie?.statusCode);
  const primaryGenre = currentMovie?.genres[0] ?? "";

  const saveMovie = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionError("");

    const formData = new FormData(event.currentTarget);
    const payload = buildMoviePayload(formData);
    const posterFile = getFormFile(formData, "posterFile");
    const bannerFile = getFormFile(formData, "bannerFile");

    if (!payload.title) {
      setActionError("Vui lòng nhập tên phim.");
      return;
    }

    if (!payload.durationMinutes) {
      setActionError("Vui lòng nhập thời lượng phim hợp lệ.");
      return;
    }

    setIsSaving(true);

    try {
      const [posterUpload, bannerUpload] = await Promise.all([
        posterFile ? uploadAdminMovieImage("poster", posterFile) : null,
        bannerFile ? uploadAdminMovieImage("banner", bannerFile) : null,
      ]);

      if (posterUpload) {
        payload.posterUrl = posterUpload.url;
      }

      if (bannerUpload) {
        payload.bannerUrl = bannerUpload.url;
      }

      const result =
        isEdit && (currentMovie || movieId)
          ? await updateAdminMovie(currentMovie?.id ?? movieId ?? "", payload)
          : await createAdminMovie(payload);

      router.push(`/admin/movies/${result.movie.id}`);
      router.refresh();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Không thể lưu phim vào database.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (movieLoading) {
    return (
      <div className="mx-auto grid max-w-[1440px] gap-6">
        <section className="rounded-md border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500 shadow-sm">
          Đang tải dữ liệu phim từ database...
        </section>
      </div>
    );
  }

  if (isEdit && movieLoadError) {
    return (
      <div className="mx-auto grid max-w-[1440px] gap-6">
        <Link
          href={movieListPath}
          className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={17} />
          Quay lại danh sách phim
        </Link>
        <section className="rounded-md border border-red-200 bg-red-50 p-6 text-sm font-bold text-red-700">
          {movieLoadError}
        </section>
      </div>
    );
  }

  return (
    <form
      key={currentMovie?.id ?? "create-movie"}
      onSubmit={saveMovie}
      className="mx-auto grid max-w-[1440px] gap-6"
    >
      <section className="flex items-start gap-4">
        <Link
          href={movieListPath}
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

      {actionError ? (
        <section className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {actionError}
        </section>
      ) : null}

      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-black text-slate-950">Thông tin cơ bản</h3>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <label className={labelClass}>
            Tên phim
            <input
              name="title"
              defaultValue={currentMovie?.title}
              placeholder="Nhập tên phim"
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            Thể loại
            <select
              name="genre"
              defaultValue={primaryGenre}
              className={inputClass}
            >
              <option value="">Chọn thể loại</option>
              {genreOptions.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className={`${labelClass} mt-5`}>
          Mô tả phim
          <textarea
            name="description"
            defaultValue={currentMovie?.description}
            placeholder="Nhập mô tả phim, nội dung tóm tắt, điểm nổi bật..."
            className="min-h-32 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </label>

        <label className={`${labelClass} mt-5`}>
          Trailer phim hoặc video review
          <span className="relative">
            <Video
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              name="trailerUrl"
              defaultValue={currentMovie?.trailerUrl}
              placeholder="https://... YouTube hoặc link video"
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
                name="duration"
                defaultValue={currentMovie?.durationMinutes}
                placeholder="120"
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
                name="country"
                defaultValue={currentMovie?.country}
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
              <select
                name="ageRating"
                defaultValue={currentMovie?.ageRating ?? ""}
                className={`${inputClass} pl-10`}
              >
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
              name="language"
              defaultValue={currentMovie?.language}
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
              initialValue={currentMovie?.releaseDate}
            />
          </div>

          <div className={labelClass}>
            Ngày kết thúc dự kiến
            <MovieDatePicker name="endDate" initialValue={currentMovie?.endDate} />
          </div>

          <label className={labelClass}>
            Trạng thái
            <select
              name="statusCode"
              defaultValue={currentMovie?.statusCode ?? "NOW_SHOWING"}
              className={inputClass}
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            Đạo diễn
            <input
              name="director"
              defaultValue={currentMovie?.director}
              placeholder="Tên đạo diễn"
              className={inputClass}
            />
          </label>
        </div>

        <label className={`${labelClass} mt-5`}>
          Diễn viên
          <input
            name="actors"
            defaultValue={currentMovie?.actors}
            placeholder="Tên diễn viên, phân tách bằng dấu phẩy"
            className={inputClass}
          />
        </label>
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-black text-slate-950">Hình ảnh hiển thị</h3>
        <p className="hidden">
          Link poster và banner sẽ được lưu vào database. Upload từ máy tính chỉ
          dùng để xem thử ảnh tại trình duyệt.
        </p>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          Chọn ảnh từ máy tính, hệ thống sẽ upload và lưu đường dẫn ảnh khi lưu phim.
        </p>

        <div className="mt-6 grid gap-5 lg:grid-cols-[320px_1fr]">
          <ImagePicker
            name="posterFile"
            label="Poster phim"
            description="Khuyến nghị ảnh dọc tỷ lệ 2:3."
            initialImage={currentMovie?.poster}
            previewClassName="aspect-[2/3]"
          />

          <ImagePicker
            name="bannerFile"
            label="Banner phim"
            description="Khuyến nghị ảnh ngang tỷ lệ 16:9 hoặc 21:9."
            initialImage={currentMovie?.banner}
            previewClassName="aspect-[16/7]"
          />
        </div>

        <input
          type="hidden"
          name="posterUrl"
          defaultValue={currentMovie?.posterUrl || currentMovie?.poster}
        />
        <input
          type="hidden"
          name="bannerUrl"
          defaultValue={currentMovie?.bannerUrl || currentMovie?.banner}
        />
      </section>

      <section className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <Link
          href={movieListPath}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
        >
          Hủy
        </Link>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
        >
          <Save size={17} />
          {isSaving
            ? "Đang lưu..."
            : isEdit
              ? "Lưu thay đổi"
              : "Tạo phim mới"}
        </button>
      </section>
    </form>
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
    </div>
  );
}
