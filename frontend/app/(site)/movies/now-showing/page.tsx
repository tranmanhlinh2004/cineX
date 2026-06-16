import MovieCatalogPage from "@/components/MovieCatalogPage";
import {
  getNowShowingPageData,
  normalizeMovieCatalogDateParam,
} from "@/lib/home-movies";

type MoviePageProps = {
  searchParams?: Promise<{
    page?: string | string[];
    date?: string | string[];
  }>;
};

function parsePageParam(value?: string | string[]) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const page = Number.parseInt(rawValue ?? "", 10);

  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function NowShowingPage({ searchParams }: MoviePageProps) {
  const params = await searchParams;
  const date = normalizeMovieCatalogDateParam(params?.date);
  const catalogData = await getNowShowingPageData({
    page: parsePageParam(params?.page),
    date,
  });

  return (
    <MovieCatalogPage
      movies={catalogData.movies}
      pagination={catalogData.pagination}
      variant="now"
      error={catalogData.error}
      date={date}
    />
  );
}
