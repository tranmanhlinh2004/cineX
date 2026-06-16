import { getAuthToken } from "@/lib/auth";
import type { MovieDetailData } from "@/lib/home-movies";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export type MovieReviewPayload = {
  rating: number;
  comment: string;
};

type MovieReviewResponse = Omit<MovieDetailData, "movie"> & {
  movie: NonNullable<MovieDetailData["movie"]>;
  message?: string;
};

export async function submitMovieReview(
  movieId: number,
  payload: MovieReviewPayload,
) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Vui long dang nhap de binh luan va danh gia phim.");
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/movies/${movieId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Khong ket noi duoc backend. Hay chay backend o cong 4000.");
  }

  const data = (await response.json().catch(() => null)) as
    | ({ message?: string } & Partial<MovieDetailData>)
    | null;

  if (!response.ok) {
    throw new Error(data?.message || "Khong the luu binh luan va danh gia.");
  }

  if (!data?.movie) {
    throw new Error("Phan hoi danh gia khong hop le.");
  }

  return data as MovieReviewResponse;
}
