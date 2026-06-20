import { getAuthToken } from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export type AdminMovieReviewStatusCode = "VISIBLE" | "HIDDEN";

export type AdminMovieReview = {
  id: number;
  movieId: number;
  movieSlug: string;
  movieTitle: string;
  customer: {
    id: number;
    fullName: string;
    email: string;
    phone: string | null;
  };
  customerName: string;
  rating: number;
  ratingLabel: string;
  content: string;
  status: AdminMovieReviewStatusCode;
  statusLabel: string;
  isHidden: boolean;
  replyCount: number;
  replies: AdminMovieReviewReply[];
  createdAt: string;
  updatedAt: string;
};

export type AdminMovieReviewReply = {
  id: number;
  reviewId: number;
  userId: number;
  userName: string;
  userEmail: string;
  content: string;
  isAdminReply: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminMovieReviewStats = {
  totalReviews: number;
  totalReplies: number;
  visibleReviews: number;
  hiddenReviews: number;
  pendingReviews: number;
  averageRating: number;
  averageRatingLabel: string;
};

export type AdminMovieReviewsResponse = {
  generatedAt: string;
  reviews: AdminMovieReview[];
  stats: AdminMovieReviewStats;
};

export type AdminMovieReviewMutationResponse = {
  message: string;
  review: AdminMovieReview;
};

export type AdminMovieReviewReplyResponse = {
  message: string;
  reply: AdminMovieReviewReply;
  review: AdminMovieReview;
};

type RequestAdminOptions = {
  method?: "GET" | "POST";
  body?: unknown;
};

async function requestAdmin<T>(path: string, options: RequestAdminOptions = {}) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Vui lòng đăng nhập quản trị để quản lý đánh giá.");
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
    throw new Error(data?.message || "Không thể tải dữ liệu đánh giá từ database.");
  }

  return data as T;
}

export function getAdminMovieReviews() {
  return requestAdmin<AdminMovieReviewsResponse>("/admin/reviews");
}

export function hideAdminMovieReview(id: number) {
  return requestAdmin<AdminMovieReviewMutationResponse>(`/admin/reviews/${id}/hide`, {
    method: "POST",
  });
}

export function showAdminMovieReview(id: number) {
  return requestAdmin<AdminMovieReviewMutationResponse>(`/admin/reviews/${id}/show`, {
    method: "POST",
  });
}

export function sendAdminMovieReviewReply(id: number, content: string) {
  return requestAdmin<AdminMovieReviewReplyResponse>(`/admin/reviews/${id}/replies`, {
    method: "POST",
    body: { content },
  });
}
