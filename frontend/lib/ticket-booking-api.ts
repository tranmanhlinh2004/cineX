import { getAuthToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export type TicketPaymentMethodCode =
  | "CASH"
  | "MOMO"
  | "VNPAY"
  | "ZALOPAY"
  | "BANKING"
  | "CARD";

export type TicketBookingMovie = {
  id: number;
  slug: string;
  title: string;
  description: string;
  durationMinutes: number;
  duration: string;
  language: string | null;
  country: string | null;
  ageLimit: string;
  posterUrl: string;
  bannerUrl: string;
  rating: string;
  genres: string[];
};

export type TicketBookingCinema = {
  id: number;
  slug: string;
  name: string;
  address: string;
  city: string;
  district: string | null;
  ward: string | null;
  phone: string | null;
  imageUrl: string | null;
  roomCount: number;
};

export type TicketBookingDate = {
  value: string;
  label: string;
  dateLabel: string;
  hint: string;
};

export type TicketBookingShowtime = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  time: string;
  basePrice: number;
  price: string;
  availableSeats: number;
  totalSeats: number;
  movieId: number;
  movieSlug: string;
  cinemaSlug: string;
  room: {
    id: number;
    name: string;
    totalRows: number;
    totalColumns: number;
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
  };
};

export type TicketBookingOptions = {
  generatedAt: string;
  paymentMethods: TicketPaymentMethodCode[];
  dates: TicketBookingDate[];
  movies: TicketBookingMovie[];
  cinemas: TicketBookingCinema[];
  showtimes: TicketBookingShowtime[];
};

export type TicketBookingSeat = {
  id: number;
  seatCode: string;
  rowName: string;
  seatNumber: number;
  status: string;
  availabilityStatus:
    | "AVAILABLE"
    | "BOOKED"
    | "PENDING_PAYMENT"
    | "MAINTENANCE"
    | "LOCKED";
  statusLabel: string;
  price: number;
  priceLabel: string;
  isAvailable: boolean;
  unavailableReason: string | null;
  type: {
    id: number;
    name: string;
    label: string;
    priceExtra: number;
  };
};

export type TicketBookingSeatMap = {
  showtime: TicketBookingShowtime;
  movie: TicketBookingMovie;
  room: TicketBookingShowtime["room"];
  cinema: {
    id: number;
    slug: string;
    name: string;
    address: string;
    city: string;
  };
  seats: TicketBookingSeat[];
};

export type TicketBookingCheckoutResponse = {
  message: string;
  booking: {
    id: number;
    bookingCode: string;
    paymentDeadlineAt: string;
  };
};

export type TicketBookingPromotionPreview = {
  message: string;
  code: string;
  name: string;
  description: string | null;
  discountAmount: number;
  discountLabel: string;
  totalAmount: number;
  totalLabel: string;
  finalAmount: number;
  finalLabel: string;
};

async function requestJson<T>(
  path: string,
  options: {
    method?: "GET" | "POST";
    payload?: unknown;
    authenticated?: boolean;
  } = {},
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.authenticated) {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Vui lòng đăng nhập để đặt vé.");
    }

    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.payload ? JSON.stringify(options.payload) : undefined,
    });
  } catch {
    throw new Error("Không kết nối được backend.");
  }

  const data = (await response.json().catch(() => null)) as ({ message?: string } & T) | null;

  if (!response.ok) {
    throw new Error(data?.message || "Không thể kết nối đến máy chủ.");
  }

  return data as T;
}

export function getTicketBookingOptions() {
  return requestJson<TicketBookingOptions>("/booking/options");
}

export function getTicketBookingSeatMap(showtimeId: number) {
  return requestJson<TicketBookingSeatMap>(`/booking/showtimes/${showtimeId}/seats`);
}

export function applyTicketBookingPromotion(payload: {
  code: string;
  totalAmount: number;
}) {
  return requestJson<TicketBookingPromotionPreview>("/booking/promotions/apply", {
    method: "POST",
    payload,
  });
}

export function createTicketBooking(payload: {
  showtimeId: number;
  seatIds: number[];
  paymentMethod: TicketPaymentMethodCode;
  promotionCode?: string;
}) {
  return requestJson<TicketBookingCheckoutResponse>("/booking/checkout", {
    method: "POST",
    payload,
    authenticated: true,
  });
}
