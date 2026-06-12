import MovieCatalogPage from "@/components/MovieCatalogPage";
import { getComingSoonPageData } from "@/lib/home-movies";

type MoviePageProps = {
  searchParams?: Promise<{
    page?: string | string[];
  }>;
};

function parsePageParam(value?: string | string[]) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const page = Number.parseInt(rawValue ?? "", 10);

  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function ComingSoonPage({ searchParams }: MoviePageProps) {
  const params = await searchParams;
  const catalogData = await getComingSoonPageData({
    page: parsePageParam(params?.page),
  });

  return (
    <MovieCatalogPage
      movies={catalogData.movies}
      pagination={catalogData.pagination}
      variant="soon"
      error={catalogData.error}
    />
  );
}
