import { getAuthToken } from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export type AdminGenreRecord = {
  id: number;
  name: string;
  slug: string;
  description: string;
  movieCount: number;
  movieCountLabel: string;
  displayArea: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminGenresStats = {
  totalGenres: number;
  activeGenres: number;
  unusedGenres: number;
  movieGenreLinks: number;
};

export type AdminGenresResponse = {
  generatedAt: string;
  genres: AdminGenreRecord[];
  stats: AdminGenresStats;
};

async function requestAdmin<T>(path: string) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Vui lòng đăng nhập quản trị để xem thể loại phim.");
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error("Không kết nối được backend.");
  }

  const data = (await response.json().catch(() => null)) as
    | ({ message?: string } & Partial<T>)
    | null;

  if (!response.ok) {
    throw new Error(data?.message || "Không thể tải thể loại phim từ database.");
  }

  return data as T;
}

export function getAdminGenres() {
  return requestAdmin<AdminGenresResponse>("/admin/genres");
}
