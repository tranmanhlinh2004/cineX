import MovieFormPage from "@/components/admin/MovieFormPage";
import { getAdminMovieById } from "../../movie-data";

type AdminEditMoviePageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditMoviePage({
  params,
}: AdminEditMoviePageProps) {
  const { id } = await params;
  const movie = getAdminMovieById(id);

  return <MovieFormPage mode="edit" movie={movie} />;
}
