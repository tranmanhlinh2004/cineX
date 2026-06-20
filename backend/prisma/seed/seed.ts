import { prisma } from "./client";
import { seedAuditLogs } from "./auditLogs.seed";
import { seedBanners } from "./banners.seed";
import { seedBookings } from "./bookings.seed";
import { seedCinemas } from "./cinemas.seed";
import { seedContactMessages } from "./contactMessages.seed";
import { seedGenres } from "./genres.seed";
import { seedMovies } from "./movies.seed";
import { syncMovieMetadata } from "./movieMetadata.seed";
import { seedNews } from "./news.seed";
import { seedPermissions } from "./permissions.seed";
import { seedPromotions } from "./promotions.seed";
import { seedReviews } from "./reviews.seed";
import { seedRolePermissions } from "./rolePermissions.seed";
import { seedRoles } from "./roles.seed";
import { seedRooms } from "./rooms.seed";
import { seedSeats } from "./seats.seed";
import { seedSeatHolds } from "./seatHolds.seed";
import { seedSeatTypes } from "./seatTypes.seed";
import { seedShowtimes } from "./showtimes.seed";
import { seedUsers } from "./users.seed";

async function main() {
  console.log("Bat dau seed du lieu...");

  await seedRoles();
  await seedPermissions();
  await seedRolePermissions();
  await seedUsers();

  await seedGenres();
  await seedMovies();
  await syncMovieMetadata();

  await seedCinemas();
  await seedRooms();
  await seedSeatTypes();
  await seedSeats();
  await seedShowtimes();
  await seedPromotions();

  await seedBanners();
  await seedNews();
  await seedReviews();
  await seedContactMessages();
  await seedBookings();
  await seedSeatHolds();
  await seedAuditLogs();

  console.log("Seed du lieu hoan tat");
}

main()
  .catch((error) => {
    console.error("Seed that bai:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
