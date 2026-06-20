import GenreMoviesPage from "@/components/GenreMoviesPage";
import {
  getGenreMovieCatalogData,
  normalizeGenreSlugParam,
} from "@/lib/home-movies";

type GenresPageProps = {
  searchParams?: Promise<{
    genre?: string | string[];
  }>;
};

export default async function GenresPage({ searchParams }: GenresPageProps) {
  const params = await searchParams;
  const genreSlug = normalizeGenreSlugParam(params?.genre);
  const data = await getGenreMovieCatalogData(genreSlug);

  return <GenreMoviesPage data={data} />;
}
