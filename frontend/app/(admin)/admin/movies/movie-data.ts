export type AdminMovie = {
  id: string;
  title: string;
  genre: string;
  country: string;
  ageRating: string;
  status: string;
  poster: string;
  banner: string;
  duration: string;
  language: string;
  releaseDate: string;
  endDate: string;
  director: string;
  description: string;
  trailerUrl: string;
  cinemas: string[];
  schedule: string[];
};

export const adminMovies: AdminMovie[] = [
  {
    id: "dune-part-two",
    title: "Dune: Part Two",
    genre: "Khoa học viễn tưởng",
    country: "Hoa Kỳ",
    ageRating: "T13",
    status: "Đang hoạt động",
    poster:
      "https://image.tmdb.org/t/p/w154/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    banner:
      "https://image.tmdb.org/t/p/w780/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    duration: "166 phút",
    language: "Phụ đề Việt",
    releaseDate: "01/06/2026",
    endDate: "07/06/2026",
    director: "Denis Villeneuve",
    description:
      "Paul Atreides hợp lực cùng Chani và người Fremen để trả thù những kẻ đã hủy hoại gia đình mình.",
    trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
    cinemas: ["CineX Vinh Center", "CineX Lê Lợi"],
    schedule: ["09:30 - IMAX 01", "18:45 - Dolby 02", "21:10 - Phòng 03"],
  },
  {
    id: "inside-out-2",
    title: "Inside Out 2",
    genre: "Hoạt hình",
    country: "Hoa Kỳ",
    ageRating: "P",
    status: "Đang hoạt động",
    poster:
      "https://image.tmdb.org/t/p/w154/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
    banner:
      "https://image.tmdb.org/t/p/w780/stKGOm8UyhuLPR9sZLjs5AkmncA.jpg",
    duration: "96 phút",
    language: "Lồng tiếng Việt",
    releaseDate: "05/06/2026",
    endDate: "12/06/2026",
    director: "Kelsey Mann",
    description:
      "Riley bước vào tuổi mới với những cảm xúc mới, khiến trung tâm điều khiển trở nên hỗn loạn.",
    trailerUrl: "https://www.youtube.com/watch?v=LEjhY15eCx0",
    cinemas: ["CineX Lê Lợi", "CineX Quang Trung"],
    schedule: ["10:15 - Phòng 03", "14:30 - Phòng 05", "19:00 - Phòng 02"],
  },
  {
    id: "quiet-place-day-one",
    title: "A Quiet Place: Day One",
    genre: "Kinh dị",
    country: "Hoa Kỳ",
    ageRating: "T16",
    status: "Sắp chiếu",
    poster:
      "https://image.tmdb.org/t/p/w154/hU42CRk14JuPEdqZG3AWmagiPAP.jpg",
    banner:
      "https://image.tmdb.org/t/p/w780/yrpPYKijwdMHyTGIOd1iK1h0Xno.jpg",
    duration: "99 phút",
    language: "Phụ đề Việt",
    releaseDate: "20/06/2026",
    endDate: "18/06/2026",
    director: "Michael Sarnoski",
    description:
      "Câu chuyện về ngày đầu tiên khi Trái Đất bị xâm lược bởi những sinh vật săn mồi bằng âm thanh.",
    trailerUrl: "https://www.youtube.com/watch?v=YPY7J-flzE8",
    cinemas: ["CineX Vinh Center"],
    schedule: ["20:20 - Dolby 02", "22:15 - Phòng 04"],
  },
  {
    id: "deadpool-wolverine",
    title: "Deadpool & Wolverine",
    genre: "Hành động",
    country: "Hoa Kỳ",
    ageRating: "T18",
    status: "Sắp chiếu",
    poster:
      "https://image.tmdb.org/t/p/w154/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    banner:
      "https://image.tmdb.org/t/p/w780/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg",
    duration: "127 phút",
    language: "Phụ đề Việt",
    releaseDate: "28/06/2026",
    endDate: "23/07/2026",
    director: "Shawn Levy",
    description:
      "Deadpool lôi kéo Wolverine vào một nhiệm vụ hỗn loạn có thể thay đổi dòng thời gian.",
    trailerUrl: "https://www.youtube.com/watch?v=73_1biulkYk",
    cinemas: ["CineX Vinh Center", "CineX Quang Trung"],
    schedule: ["13:45 - Phòng 06", "20:30 - IMAX 01"],
  },
  {
    id: "lat-mat-7",
    title: "Lật Mặt 7",
    genre: "Tâm lý gia đình",
    country: "Việt Nam",
    ageRating: "T13",
    status: "Tạm dừng",
    poster:
      "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=180&q=80",
    banner:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
    duration: "138 phút",
    language: "Tiếng Việt",
    releaseDate: "30/05/2026",
    endDate: "30/07/2026",
    director: "Lý Hải",
    description:
      "Một câu chuyện gia đình nhiều cảm xúc, xoay quanh các mối quan hệ và lựa chọn trong cuộc sống.",
    trailerUrl: "https://www.youtube.com/",
    cinemas: ["CineX Lê Lợi"],
    schedule: ["16:00 - Phòng 02"],
  },
];

export function getAdminMovieById(id: string) {
  return adminMovies.find((movie) => movie.id === id) ?? adminMovies[0];
}
