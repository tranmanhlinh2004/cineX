import { notFound } from "next/navigation";
import MovieDetailPage from "@/components/MovieDetailPage";
import { getMovieDetailPageData } from "@/lib/home-movies";

type MovieDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

function parseMovieId(value: string) {
  const movieId = Number.parseInt(value, 10);

  return Number.isFinite(movieId) && movieId > 0 ? movieId : null;
}

export default async function MovieDetailRoute({
  params,
}: MovieDetailRouteProps) {
  const { id } = await params;
  const movieId = parseMovieId(id);

  if (!movieId) {
    notFound();
  }

  const detailData = await getMovieDetailPageData(movieId);

  if (detailData.notFound) {
    notFound();
  }

  return (
    <MovieDetailPage movie={detailData.movie} error={detailData.error} />
  );
}
