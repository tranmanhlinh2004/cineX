import { getAuthToken } from "@/lib/auth";
import type { MovieRecommendationsData } from "@/lib/home-movies";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

function createEmptyRecommendationsData(
  movieId: number,
  error?: string,
  options: { notFound?: boolean } = {},
): MovieRecommendationsData {
  return {
    generatedAt: null,
    movieId,
    basis: {
      type: "SAME_GENRE",
      isPersonalized: false,
      topGenre: null,
      topGenres: [],
      bookingGenres: [],
    },
    recommendations: [],
    error,
    notFound: options.notFound,
  };
}

export async function getMovieRecommendations(movieId: number) {
  const token = getAuthToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/movies/${movieId}/recommendations`, {
      cache: "no-store",
      headers,
    });
  } catch {
    return createEmptyRecommendationsData(
      movieId,
      "Không kết nối được backend. Hãy chạy backend ở cổng 4000.",
    );
  }

  if (response.status === 404) {
    return createEmptyRecommendationsData(movieId, "Không tìm thấy phim.", {
      notFound: true,
    });
  }

  if (!response.ok) {
    return createEmptyRecommendationsData(
      movieId,
      "Không thể tải gợi ý phim từ database.",
    );
  }

  return (await response.json()) as MovieRecommendationsData;
}
