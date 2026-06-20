"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  LoaderCircle,
  LogIn,
  MessageSquareText,
  Reply,
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
import { submitMovieReview, submitMovieReviewReply } from "@/lib/movie-reviews-api";

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
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingReviewId, setReplyingReviewId] = useState<number | null>(null);
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
      setComment("");
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
      setError("Vui lòng đăng nhập để bình luận và đánh giá phim.");
      return;
    }

    const trimmedComment = comment.trim();

    if (trimmedComment.length > 1000) {
      setNotice("");
      setError("Bình luận không được vượt quá 1000 ký tự.");
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
      setComment("");
      setNotice(data.message ?? "Đã lưu bình luận và đánh giá phim.");
      router.refresh();
    } catch (reviewError) {
      setError(
        reviewError instanceof Error
          ? reviewError.message
          : "Không thể lưu bình luận và đánh giá.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmitReply(
    event: FormEvent<HTMLFormElement>,
    reviewId: number,
  ) {
    event.preventDefault();

    if (!authUser) {
      setNotice("");
      setError("Vui lòng đăng nhập để trả lời bình luận phim.");
      return;
    }

    const trimmedContent = (replyDrafts[reviewId] ?? "").trim();

    if (!trimmedContent) {
      setNotice("");
      setError("Vui lòng nhập nội dung trả lời.");
      return;
    }

    if (trimmedContent.length > 1000) {
      setNotice("");
      setError("Nội dung trả lời không được vượt quá 1000 ký tự.");
      return;
    }

    setReplyingReviewId(reviewId);
    setNotice("");
    setError("");

    try {
      const data = await submitMovieReviewReply(movieId, reviewId, {
        content: trimmedContent,
      });
      const updatedMovie = data.movie;

      setReviews(updatedMovie.reviews);
      setAverageRating(updatedMovie.rating);
      setReviewCount(updatedMovie.reviewCount);
      setReplyDrafts((current) => ({
        ...current,
        [reviewId]: "",
      }));
      setNotice(data.message ?? "Đã gửi trả lời bình luận.");
      router.refresh();
    } catch (replyError) {
      setError(
        replyError instanceof Error
          ? replyError.message
          : "Không thể gửi trả lời bình luận.",
      );
    } finally {
      setReplyingReviewId(null);
    }
  }

  function updateReplyDraft(reviewId: number, value: string) {
    setReplyDrafts((current) => ({
      ...current,
      [reviewId]: value,
    }));
  }

  return (
    <section className="mt-8 rounded-lg border border-white/10 bg-[#151719] p-5 sm:p-7">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <MessageSquareText className="text-red-300" size={23} />
            <h2 className="text-2xl font-black">Bình luận và đánh giá</h2>
          </div>
          <p className="mt-2 text-sm font-semibold text-white/55">
            {movieTitle}
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-3 sm:w-auto">
          <div className="rounded-md border border-white/10 bg-black/25 px-4 py-3">
            <p className="text-xs font-black uppercase text-white/38">Điểm</p>
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

      <div className="mt-6 grid gap-6">
        <div className="min-w-0">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-black text-white">Danh sách bình luận</h3>
            <span className="text-xs font-black uppercase text-white/38">
              {reviewCount} review
            </span>
          </div>

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
                              Của bạn
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
                    {review.comment || "Người dùng này chỉ đánh giá bằng sao."}
                  </p>

                  {review.replies.length > 0 ? (
                    <div className="mt-4 grid gap-3 border-l border-white/10 pl-3 sm:pl-4">
                      {review.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className={`rounded-md border px-3 py-3 ${
                            reply.isAdminReply
                              ? "border-red-400/20 bg-red-500/10"
                              : "border-white/10 bg-white/5"
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs font-black text-white">
                              {reply.userName}
                            </p>
                            {reply.isAdminReply ? (
                              <span className="rounded-md bg-red-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-red-100">
                                Quản trị
                              </span>
                            ) : null}
                            {authUser?.id === reply.userId ? (
                              <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-black uppercase text-white/70">
                                Của bạn
                              </span>
                            ) : null}
                            <span className="text-xs font-semibold text-white/35">
                              {formatReviewDate(reply.createdAt)}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-white/68">
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {authReady && authUser ? (
                    <form
                      onSubmit={(event) => handleSubmitReply(event, review.id)}
                      className="mt-4 flex flex-col gap-2 sm:flex-row"
                    >
                      <input
                        value={replyDrafts[review.id] ?? ""}
                        maxLength={1000}
                        onChange={(event) => updateReplyDraft(review.id, event.target.value)}
                        placeholder={`Trả lời ${review.userName}...`}
                        className="h-10 min-w-0 flex-1 rounded-md border border-white/10 bg-white/5 px-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/28 focus:border-red-400"
                      />
                      <button
                        type="submit"
                        disabled={
                          replyingReviewId === review.id ||
                          !(replyDrafts[review.id] ?? "").trim()
                        }
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/10 px-3 text-sm font-black text-white transition hover:border-red-300 hover:text-red-100 disabled:cursor-not-allowed disabled:text-white/30"
                      >
                        {replyingReviewId === review.id ? (
                          <LoaderCircle size={16} className="animate-spin" />
                        ) : (
                          <Reply size={16} />
                        )}
                        Gửi
                      </button>
                    </form>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-black/15 px-5 text-center">
              <MessageSquareText className="text-white/28" size={34} />
              <p className="mt-3 text-sm font-black text-white">
                Chưa có bình luận nào
              </p>
              <p className="mt-1 max-w-sm text-sm leading-6 text-white/45">
                Hãy là người đầu tiên chia sẻ cảm nhận về phim này.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-white/10 bg-black/20 p-4 sm:p-5">
          {authReady && authUser ? (
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <p className="text-sm font-black text-white">
                  {ownReview ? "Gửi đánh bình luận" : "Đánh giá phim"}
                </p>
                <p className="mt-1 text-xs font-semibold text-white/48">
                  {authUser.fullName || authUser.email}
                </p>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-white/40">
                  Chọn số sao
                </label>
                <div
                  className="mt-2 flex flex-wrap gap-2"
                  role="radiogroup"
                  aria-label="Chọn số sao"
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
                  Bình luận
                </label>
                <textarea
                  id="movie-review-comment"
                  value={comment}
                  maxLength={1000}
                  onChange={(event) => setComment(event.target.value)}
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
                {isSubmitting ? "Đang lưu" : "Gửi đánh giá"}
              </button>
            </form>
          ) : authReady ? (
            <div className="grid gap-4">
              <div>
                <p className="text-sm font-black text-white">
                  Đăng nhập để bình luận
                </p>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  Bạn vẫn có thể xem bình luận và đánh giá của khán giả khác.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-black text-black transition hover:bg-gray-200"
              >
                <LogIn size={17} />
                Đăng nhập
              </Link>
            </div>
          ) : (
            <div className="rounded-md border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-white/55">
              Đang kiểm tra đăng nhập...
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
