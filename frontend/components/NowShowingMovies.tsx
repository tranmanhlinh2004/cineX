import HomeMovieSection from "@/components/HomeMovieSection";
import type { HomeMovie } from "@/lib/home-movies";

type NowShowingMoviesProps = {
  movies: HomeMovie[];
};

export default function NowShowingMovies({ movies }: NowShowingMoviesProps) {
  return (
    <HomeMovieSection
      eyebrow="Now showing"
      title="Phim đang chiếu"
      description="Các phim đang có suất bán tại CineX, nổi bật với lịch chiếu dày và nhiều lựa chọn định dạng."
      href="/movies/now-showing"
      movies={movies}
      variant="now"
    />
  );
}
