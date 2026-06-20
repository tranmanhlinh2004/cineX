import { getAuthToken } from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export type AdminMovieStatusCode = "COMING_SOON" | "NOW_SHOWING" | "ENDED";

export type AdminMovieRecord = {
  id: number;
  slug: string;
  title: string;
  genre: string;
  genres: string[];
  country: string;
  ageRating: string;
  statusCode: AdminMovieStatusCode;
  status: string;
  poster: string;
  banner: string;
  posterUrl: string;
  bannerUrl: string;
  durationMinutes: number;
  duration: string;
  language: string;
  releaseDate: string;
  releaseDateIso: string | null;
  endDate: string;
  endDateIso: string | null;
  director: string;
  actors: string;
  description: string;
  trailerUrl: string;
  cinemas: string[];
  schedule: string[];
  ticketsSold: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminMoviesStats = {
  totalMovies: number;
  nowShowingMovies: number;
  comingSoonMovies: number;
  endedMovies: number;
  ticketsSold: number;
};

export type AdminMoviesResponse = {
  generatedAt: string;
  movies: AdminMovieRecord[];
  stats: AdminMoviesStats;
};

export type AdminMovieResponse = {
  generatedAt: string;
  movie: AdminMovieRecord;
};

export type AdminMoviePayload = {
  title: string;
  genre: string;
  genres: string[];
  description: string;
  trailerUrl: string;
  durationMinutes: number;
  country: string;
  ageRating: string;
  language: string;
  releaseDate: string;
  endDate: string;
  statusCode: AdminMovieStatusCode;
  director: string;
  actors: string;
  posterUrl: string;
  bannerUrl: string;
};

export type AdminMovieSchedulePayload = {
  releaseDate?: string;
  endDate?: string;
  statusCode?: AdminMovieStatusCode;
};

export type AdminMovieMutationResponse = {
  message: string;
  movie: AdminMovieRecord;
};

export type DeleteAdminMovieResponse = {
  message: string;
  deletedId: number;
};

export type AdminMovieImageUploadKind = "poster" | "banner";

export type AdminMovieImageUploadResponse = {
  message: string;
  url: string;
  fileName: string;
  size: number;
  contentType: string;
};

type RequestAdminOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Không thể đọc file ảnh."));
    };
    reader.onerror = () => reject(new Error("Không thể đọc file ảnh."));
    reader.readAsDataURL(file);
  });
  
}

async function requestAdmin<T>(path: string, options: RequestAdminOptions = {}) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Vui lòng đăng nhập quản trị để quản lý phim.");
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error("Không kết nối được backend.");
  }

  const data = (await response.json().catch(() => null)) as
    | ({ message?: string } & Partial<T>)
    | null;

  if (!response.ok) {
    throw new Error(data?.message || "Không thể tải dữ liệu phim từ database.");
  }

  return data as T;
}

export function getAdminMovies() {
  return requestAdmin<AdminMoviesResponse>("/admin/movies");
}

export function getAdminMovie(id: string | number) {
  return requestAdmin<AdminMovieResponse>(`/admin/movies/${id}`);
}

export function createAdminMovie(payload: AdminMoviePayload) {
  return requestAdmin<AdminMovieMutationResponse>("/admin/movies", {
    method: "POST",
    body: payload,
  });
}

export function updateAdminMovie(id: string | number, payload: AdminMoviePayload) {
  return requestAdmin<AdminMovieMutationResponse>(`/admin/movies/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function updateAdminMovieSchedule(
  id: string | number,
  payload: AdminMovieSchedulePayload,
) {
  return requestAdmin<AdminMovieMutationResponse>(`/admin/movies/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function uploadAdminMovieImage(
  kind: AdminMovieImageUploadKind,
  file: File,
) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Vui lòng chọn đúng file ảnh.");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Dung lượng ảnh tối đa 10 MB.");
  }

  const dataUrl = await readFileAsDataUrl(file);

  return requestAdmin<AdminMovieImageUploadResponse>("/admin/movies/upload-image", {
    method: "POST",
    body: {
      kind,
      dataUrl,
    },
  });
}

export function deleteAdminMovie(id: string | number) {
  return requestAdmin<DeleteAdminMovieResponse>(`/admin/movies/${id}`, {
    method: "DELETE",
  });
}
