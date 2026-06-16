const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";
const catalogDateParamPattern = /^\d{4}-\d{2}-\d{2}$/;

export type MovieStatusCode = "COMING_SOON" | "NOW_SHOWING" | "ENDED";

export type HomeReview = {
  id: number;
  userId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  userName: string;
};

export type HomeMovieImage = {
  id: number;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
};

export type HomeShowtime = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  time: string;
  room: {
    id: number;
    name: string;
    totalSeats: number;
  };
  cinema: {
    id: number;
    slug: string;
    name: string;
    address: string;
    city: string;
    district: string | null;
    ward: string | null;
    phone: string | null;
    email: string | null;
    imageUrl: string | null;
  };
  movieId: number;
  movieSlug: string;
  movie: string;
  movieLanguage: string | null;
  movieAgeLimit: string | null;
  basePrice: number;
  price: string;
  availableSeats: number;
  totalSeats: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type HomeMovie = {
  id: number;
  slug: string;
  title: string;
  description: string;
  director: string | null;
  actors: string | null;
  durationMinutes: number;
  duration: string;
  releaseDate?: string;
  releaseDateIso: string | null;
  endDate?: string;
  endDateIso: string | null;
  language: string;
  country: string | null;
  ageRating: string;
  trailerUrl: string | null;
  posterUrl: string | null;
  bannerUrl: string | null;
  image: string;
  bannerImage: string;
  statusCode: MovieStatusCode;
  status: string;
  rating: string;
  reviewCount: number;
  reviews: HomeReview[];
  genres: string[];
  images: HomeMovieImage[];
  showtimes: string[];
  showtimeDetails: HomeShowtime[];
  createdAt: string;
  updatedAt: string;
};

export type HomeScheduleDate = {
  value: string;
  label: string;
  hint: string;
};

export type HomeCinemaBranch = {
  value: string;
  label: string;
  address: string;
  phone: string | null;
  roomCount: number;
};

export type HomePageData = {
  generatedAt: string | null;
  movies: HomeMovie[];
  heroMovies: HomeMovie[];
  nowShowingMovies: HomeMovie[];
  comingSoonMovies: HomeMovie[];
  quickBooking: {
    dates: HomeScheduleDate[];
    cinemas: HomeCinemaBranch[];
    showtimes: HomeShowtime[];
  };
  error?: string;
};

export type MovieCatalogData = {
  generatedAt: string | null;
  movies: HomeMovie[];
  pagination: MovieCatalogPagination;
  error?: string;
};

export type MovieDetailData = {
  generatedAt: string | null;
  movie: HomeMovie | null;
  error?: string;
  notFound?: boolean;
};

export type MovieRecommendationBasis = {
  type: "PERSONALIZED" | "SAME_GENRE";
  isPersonalized: boolean;
  topGenre: string | null;
  topGenres: string[];
  bookingGenres: {
    id: number;
    name: string;
    bookingCount: number;
  }[];
};

export type MovieRecommendationsData = {
  generatedAt: string | null;
  movieId: number;
  basis: MovieRecommendationBasis;
  recommendations: HomeMovie[];
  error?: string;
  notFound?: boolean;
};

export type MovieCatalogPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type MovieCatalogParams = {
  page?: number;
  pageSize?: number;
  date?: string;
};

export function normalizeMovieCatalogDateParam(value?: string | string[]) {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (!rawValue || !catalogDateParamPattern.test(rawValue)) {
    return undefined;
  }

  const [year, month, day] = rawValue.split("-").map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return undefined;
  }

  return rawValue;
}

function createEmptyHomePageData(error?: string): HomePageData {
  return {
    generatedAt: null,
    movies: [],
    heroMovies: [],
    nowShowingMovies: [],
    comingSoonMovies: [],
    quickBooking: {
      dates: [],
      cinemas: [],
      showtimes: [],
    },
    error,
  };
}

export async function getHomePageData(): Promise<HomePageData> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/home`, {
      cache: "no-store",
    });
  } catch {
    return createEmptyHomePageData(
      "Không kết nối được backend.",
    );
  }

  if (!response.ok) {
    return createEmptyHomePageData(
      "Không thể tải dữ liệu phim từ database.",
    );
  }

  return (await response.json()) as HomePageData;
}

function createEmptyMovieCatalogData(error?: string): MovieCatalogData {
  return {
    generatedAt: null,
    movies: [],
    pagination: {
      page: 1,
      pageSize: 9,
      totalItems: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    },
    error,
  };
}

function createEmptyMovieDetailData(
  error?: string,
  options: { notFound?: boolean } = {},
): MovieDetailData {
  return {
    generatedAt: null,
    movie: null,
    error,
    notFound: options.notFound,
  };
}

function buildCatalogPath(path: string, params: MovieCatalogParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize !== undefined) {
    searchParams.set("pageSize", String(params.pageSize));
  }

  if (params.date) {
    searchParams.set("date", params.date);
  }

  const query = searchParams.toString();

  return query ? `${path}?${query}` : path;
}

async function getMovieCatalogData(
  path: string,
  params: MovieCatalogParams = {},
): Promise<MovieCatalogData> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${buildCatalogPath(path, params)}`, {
      cache: "no-store",
    });
  } catch {
    return createEmptyMovieCatalogData(
      "Không kết nối được backend.",
    );
  }

  if (!response.ok) {
    return createEmptyMovieCatalogData(
      "Không thể tải dữ liệu phim từ database.",
    );
  }

  return (await response.json()) as MovieCatalogData;
}

export function getNowShowingPageData(params?: MovieCatalogParams) {
  return getMovieCatalogData("/movies/now-showing", params);
}

export function getComingSoonPageData(params?: MovieCatalogParams) {
  return getMovieCatalogData("/movies/coming-soon", params);
}

export async function getMovieDetailPageData(
  movieId: number,
): Promise<MovieDetailData> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/movies/${movieId}`, {
      cache: "no-store",
    });
  } catch {
    return createEmptyMovieDetailData(
      "Khong ket noi duoc backend. Hay chay backend o cong 4000.",
    );
  }

  if (response.status === 404) {
    return createEmptyMovieDetailData("Khong tim thay phim.", {
      notFound: true,
    });
  }

  if (!response.ok) {
    return createEmptyMovieDetailData(
      "Khong the tai du lieu chi tiet phim tu database.",
    );
  }

  return (await response.json()) as MovieDetailData;
}
