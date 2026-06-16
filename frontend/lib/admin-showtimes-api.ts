import { getAuthToken } from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export type AdminShowtimeStatusCode = "ACTIVE" | "CANCELLED" | "FINISHED";
export type AdminShowtimeSortMode = "schedule" | "recent";

export type AdminShowtimeRecord = {
  id: number;
  movieId: number;
  movieTitle: string;
  movieSlug: string;
  movieDuration: number;
  movieLanguage: string;
  movieAgeLimit: string;
  roomId: number;
  roomName: string;
  totalSeats: number;
  cinemaId: number;
  cinemaName: string;
  cinemaSlug: string;
  startTime: string;
  endTime: string;
  dateKey: string;
  date: string;
  startLabel: string;
  endLabel: string;
  time: string;
  timeRange: string;
  basePrice: number;
  price: string;
  statusCode: AdminShowtimeStatusCode;
  status: string;
  bookedSeats: number;
  heldSeats: number;
  ticketsSold: number;
  availableSeats: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminShowtimeMovieOption = {
  id: number;
  title: string;
  duration: number;
};

export type AdminShowtimeRoomOption = {
  id: number;
  name: string;
  totalSeats: number;
  cinemaId: number;
  cinemaName: string;
};

export type AdminShowtimeOptions = {
  movies: AdminShowtimeMovieOption[];
  rooms: AdminShowtimeRoomOption[];
};

export type AdminShowtimeStats = {
  totalShowtimes: number;
  todayShowtimes: number;
  activeShowtimes: number;
  cancelledShowtimes: number;
  finishedShowtimes: number;
  ticketsSold: number;
};

export type AdminShowtimesResponse = {
  generatedAt: string;
  showtimes: AdminShowtimeRecord[];
  options: AdminShowtimeOptions;
  stats: AdminShowtimeStats;
};

export type AdminShowtimeResponse = {
  generatedAt: string;
  showtime: AdminShowtimeRecord;
};

export type AdminShowtimePayload = {
  movieId: number;
  roomId: number;
  startTime: string;
  endTime: string;
  basePrice: number;
  statusCode: AdminShowtimeStatusCode;
};

export type AdminShowtimeMutationResponse = {
  message: string;
  showtime: AdminShowtimeRecord;
};

export type DeleteAdminShowtimeResponse = {
  message: string;
  deletedId: number;
};

type RequestAdminOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
};

async function requestAdmin<T>(path: string, options: RequestAdminOptions = {}) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Vui lòng đăng nhập quản trị để quản lý lịch chiếu.");
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
    throw new Error(data?.message || "Không thể tải dữ liệu lịch chiếu từ database.");
  }

  return data as T;
}

export function getAdminShowtimes(options: { sort?: AdminShowtimeSortMode } = {}) {
  const searchParams = new URLSearchParams();

  if (options.sort) {
    searchParams.set("sort", options.sort);
  }

  const query = searchParams.toString();

  return requestAdmin<AdminShowtimesResponse>(
    `/admin/showtimes${query ? `?${query}` : ""}`,
  );
}

export function getAdminShowtime(id: string | number) {
  return requestAdmin<AdminShowtimeResponse>(`/admin/showtimes/${id}`);
}

export function createAdminShowtime(payload: AdminShowtimePayload) {
  return requestAdmin<AdminShowtimeMutationResponse>("/admin/showtimes", {
    method: "POST",
    body: payload,
  });
}

export function updateAdminShowtime(
  id: string | number,
  payload: AdminShowtimePayload,
) {
  return requestAdmin<AdminShowtimeMutationResponse>(`/admin/showtimes/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteAdminShowtime(id: string | number) {
  return requestAdmin<DeleteAdminShowtimeResponse>(`/admin/showtimes/${id}`, {
    method: "DELETE",
  });
}
