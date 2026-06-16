"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  LoaderCircle,
  LogIn,
  MessageSquareText,
  Send,
  Star,
  UserCircle,
} from "lucide-react";
import {
  AUTH_STORAGE_EVENT,
  getAuthToken,
  getAuthUser,
  type AuthUser,
} from "@/lib/auth";
import type { HomeReview } from "@/lib/home-movies";
import { submitMovieReview } from "@/lib/movie-reviews-api";

type MovieReviewsSectionProps = {
  movieId: number;
  movieTitle: string;
  initialRating: string;
  initialReviewCount: number;
  initialReviews: HomeReview[];
};

const ratingOptions = [1, 2, 3, 4, 5] as const;

export default function MovieReviewsSection({
  movieId,
  movieTitle,
  initialRating,
  initialReviewCount,
  initialReviews,
}: MovieReviewsSectionProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [averageRating, setAverageRating] = useState(initialRating);
  const [reviewCount, setReviewCount] = useState(initialReviewCount);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const authUserIdRef = useRef<number | null>(null);

  const ownReview = authUser?.id
    ? reviews.find((review) => review.userId === authUser.id) ?? null
    : null;

  useEffect(() => {
    const syncAuthUser = () => {
      const token = getAuthToken();
      const user = token ? getAuthUser() : null;
      const nextUserId = user?.id ?? null;

      setAuthUser(user);
      setAuthReady(true);

      if (authUserIdRef.current === nextUserId) {
        return;
      }

      authUserIdRef.current = nextUserId;

      const userReview = nextUserId
        ? reviews.find((review) => review.userId === nextUserId) ?? null
        : null;

      setSelectedRating(userReview?.rating ?? 5);
      setComment(userReview?.comment ?? "");
    };

    syncAuthUser();

    window.addEventListener("storage", syncAuthUser);
    window.addEventListener(AUTH_STORAGE_EVENT, syncAuthUser);
    window.addEventListener("pageshow", syncAuthUser);
    window.addEventListener("focus", syncAuthUser);

    return () => {
      window.removeEventListener("storage", syncAuthUser);
      window.removeEventListener(AUTH_STORAGE_EVENT, syncAuthUser);
      window.removeEventListener("pageshow", syncAuthUser);
      window.removeEventListener("focus", syncAuthUser);
    };
  }, [reviews]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!authUser) {
      setNotice("");
      setError("Vui long dang nhap de binh luan va danh gia phim.");
      return;
    }

    const trimmedComment = comment.trim();

    if (trimmedComment.length > 1000) {
      setNotice("");
      setError("Binh luan khong duoc vuot qua 1000 ky tu.");
      return;
    }

    setIsSubmitting(true);
    setNotice("");
    setError("");

    try {
      const data = await submitMovieReview(movieId, {
        rating: selectedRating,
        comment: trimmedComment,
      });
      const updatedMovie = data.movie;
      const updatedOwnReview =
        updatedMovie.reviews.find((review) => review.userId === authUser.id) ?? null;

      setReviews(updatedMovie.reviews);
      setAverageRating(updatedMovie.rating);
      setReviewCount(updatedMovie.reviewCount);
      setSelectedRating(updatedOwnReview?.rating ?? selectedRating);
      setComment(updatedOwnReview?.comment ?? trimmedComment);
      setNotice(data.message ?? "Da luu binh luan va danh gia phim.");
      router.refresh();
    } catch (reviewError) {
      setError(
        reviewError instanceof Error
          ? reviewError.message
          : "Khong the luu binh luan va danh gia.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-8 rounded-lg border border-white/10 bg-[#151719] p-5 sm:p-7">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <MessageSquareText className="text-red-300" size={23} />
            <h2 className="text-2xl font-black">Binh luan va danh gia</h2>
          </div>
          <p className="mt-2 text-sm font-semibold text-white/55">
            {movieTitle}
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-3 sm:w-auto">
          <div className="rounded-md border border-white/10 bg-black/25 px-4 py-3">
            <p className="text-xs font-black uppercase text-white/38">Diem</p>
            <p className="mt-1 text-2xl font-black text-yellow-300">
              {averageRating}/10
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/25 px-4 py-3">
            <p className="text-xs font-black uppercase text-white/38">Review</p>
            <p className="mt-1 text-2xl font-black text-white">{reviewCount}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="rounded-lg border border-white/10 bg-black/20 p-4 sm:p-5">
          {authReady && authUser ? (
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <p className="text-sm font-black text-white">
                  {ownReview ? "Cap nhat danh gia cua ban" : "Danh gia phim"}
                </p>
                <p className="mt-1 text-xs font-semibold text-white/48">
                  {authUser.fullName || authUser.email}
                </p>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-white/40">
                  Chon so sao
                </label>
                <div
                  className="mt-2 flex flex-wrap gap-2"
                  role="radiogroup"
                  aria-label="Chon so sao"
                >
                  {ratingOptions.map((rating) => {
                    const isActive = selectedRating >= rating;

                    return (
                      <button
                        key={rating}
                        type="button"
                        role="radio"
                        aria-checked={selectedRating === rating}
                        aria-label={`${rating} sao`}
                        onClick={() => setSelectedRating(rating)}
                        className={`flex h-10 w-10 items-center justify-center rounded-md border transition ${
                          isActive
                            ? "border-yellow-300 bg-yellow-300 text-black"
                            : "border-white/10 bg-white/5 text-white/38 hover:border-yellow-300 hover:text-yellow-200"
                        }`}
                      >
                        <Star size={18} fill="currentColor" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="movie-review-comment"
                  className="text-xs font-black uppercase text-white/40"
                >
                  Binh luan
                </label>
                <textarea
                  id="movie-review-comment"
                  value={comment}
                  maxLength={1000}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Chia se cam nhan cua ban ve phim..."
                  className="mt-2 min-h-[132px] w-full resize-y rounded-md border border-white/10 bg-[#101214] px-3 py-3 text-sm font-semibold leading-6 text-white outline-none transition placeholder:text-white/28 focus:border-red-400"
                />
                <p className="mt-1 text-right text-xs font-semibold text-white/35">
                  {comment.length}/1000
                </p>
              </div>

              {error ? (
                <p className="rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-100">
                  {error}
                </p>
              ) : null}

              {notice ? (
                <p className="rounded-md border border-emerald-300/25 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-100">
                  {notice}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-600/55"
              >
                {isSubmitting ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <Send size={17} />
                )}
                {isSubmitting ? "Dang luu" : "Gui danh gia"}
              </button>
            </form>
          ) : authReady ? (
            <div className="grid gap-4">
              <div>
                <p className="text-sm font-black text-white">
                  Dang nhap de binh luan
                </p>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  Ban van co the xem binh luan va danh gia cua khan gia khac.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-black text-black transition hover:bg-gray-200"
              >
                <LogIn size={17} />
                Dang nhap
              </Link>
            </div>
          ) : (
            <div className="rounded-md border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-white/55">
              Dang kiem tra dang nhap...
            </div>
          )}
        </div>

        <div className="min-w-0">
          {reviews.length > 0 ? (
            <div className="grid gap-3">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-lg border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-black">
                        {getInitials(review.userName) || (
                          <UserCircle size={22} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-black text-white">
                            {review.userName}
                          </h3>
                          {authUser?.id === review.userId ? (
                            <span className="rounded-md bg-red-500/15 px-2 py-1 text-[11px] font-black text-red-100">
                              Cua ban
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-xs font-semibold text-white/38">
                          {formatReviewDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    <ReviewStars rating={review.rating} />
                  </div>

                  <p className="mt-4 text-sm leading-6 text-white/68">
                    {review.comment || "Nguoi dung nay chi danh gia bang sao."}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-black/15 px-5 text-center">
              <MessageSquareText className="text-white/28" size={34} />
              <p className="mt-3 text-sm font-black text-white">
                Chua co binh luan nao
              </p>
              <p className="mt-1 max-w-sm text-sm leading-6 text-white/45">
                Hay la nguoi dau tien chia se cam nhan ve phim nay.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ReviewStars({ rating }: { rating: number }) {
  return (
    <div className="flex shrink-0 items-center gap-1 text-yellow-300">
      {ratingOptions.map((value) => (
        <Star
          key={value}
          size={15}
          className={value <= rating ? "fill-yellow-300" : "text-white/18"}
          fill={value <= rating ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

function formatReviewDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}
