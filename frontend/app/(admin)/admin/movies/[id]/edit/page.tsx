import MovieFormPage from "@/components/admin/MovieFormPage";

type AdminEditMoviePageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditMoviePage({
  params,
}: AdminEditMoviePageProps) {
  const { id } = await params;

  return <MovieFormPage mode="edit" movieId={id} />;
}
