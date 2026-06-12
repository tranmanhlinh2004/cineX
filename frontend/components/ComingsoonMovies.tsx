import HomeMovieSection from "@/components/HomeMovieSection";
import type { HomeMovie } from "@/lib/home-movies";

type ComingSoonMoviesProps = {
  movies: HomeMovie[];
};

export default function ComingSoonMovies({ movies }: ComingSoonMoviesProps) {
  return (
    <HomeMovieSection
      eyebrow="Coming soon"
      title="Phim sắp chiếu"
      description="Những phim chuẩn bị mở bán, có ngày dự kiến rõ ràng và lựa chọn nhắc lịch trước khi ra rạp."
      href="/movies/coming-soon"
      movies={movies}
      variant="soon"
    />
  );
}
