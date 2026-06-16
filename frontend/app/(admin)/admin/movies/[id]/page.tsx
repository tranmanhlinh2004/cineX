import AdminMovieDetailPageClient from "./AdminMovieDetailPageClient";

type AdminMovieDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminMovieDetailPage({
  params,
}: AdminMovieDetailPageProps) {
  const { id } = await params;

  return <AdminMovieDetailPageClient movieId={id} />;
}
