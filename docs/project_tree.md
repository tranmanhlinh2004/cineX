# File Tree: CineX

**Generated:** 6/19/2026, 4:46:24 PM
**Root Path:** `c:\TranManhLinh\Code\my_Project\CineX`

```
├── 📁 backend
│   ├── 📁 prisma
│   │   ├── 📁 migrations
│   │   │   ├── 📁 20260501191705_init
│   │   │   │   └── 📄 migration.sql
│   │   │   ├── 📁 20260501204652_add_permission
│   │   │   │   └── 📄 migration.sql
│   │   │   ├── 📁 20260501210647_add_permissions
│   │   │   │   └── 📄 migration.sql
│   │   │   ├── 📁 20260615090000_add_showtime_no_overlap_constraint
│   │   │   │   └── 📄 migration.sql
│   │   │   ├── 📁 20260619090000_use_seat_holds_for_booking_locks
│   │   │   │   └── 📄 migration.sql
│   │   │   └── ⚙️ migration_lock.toml
│   │   ├── 📁 seed
│   │   │   ├── 📄 auditLogs.seed.ts
│   │   │   ├── 📄 banners.seed.ts
│   │   │   ├── 📄 bookings.seed.ts
│   │   │   ├── 📄 cinemas.seed.ts
│   │   │   ├── 📄 client.ts
│   │   │   ├── 📄 genres.seed.ts
│   │   │   ├── 📄 index.ts
│   │   │   ├── 📄 movieMetadata.seed.ts
│   │   │   ├── 📄 movies.seed.ts
│   │   │   ├── 📄 news.seed.ts
│   │   │   ├── 📄 permissions.seed.ts
│   │   │   ├── 📄 promotions.seed.ts
│   │   │   ├── 📄 reviews.seed.ts
│   │   │   ├── 📄 rolePermissions.seed.ts
│   │   │   ├── 📄 roles.seed.ts
│   │   │   ├── 📄 rooms.seed.ts
│   │   │   ├── 📄 seatHolds.seed.ts
│   │   │   ├── 📄 seatTypes.seed.ts
│   │   │   ├── 📄 seats.seed.ts
│   │   │   ├── 📄 seed.ts
│   │   │   ├── 📄 showtimes.seed.ts
│   │   │   └── 📄 users.seed.ts
│   │   └── 📄 schema.prisma
│   ├── 📁 src
│   │   └── 📄 server.ts
│   ├── ⚙️ .gitignore
│   ├── ⚙️ package-lock.json
│   ├── ⚙️ package.json
│   └── 📄 prisma.config.ts
├── 📁 database
│   ├── 📄 cineX_diagram.pgerd
│   └── 📄 insert-data.sql
├── 📁 documents
│   ├── 📝 BAO_CAO_KIEM_TRA_DATABASE.md
│   ├── 📝 CHUC_NANG_HIEN_CO.md
│   ├── 📝 DANH_SACH_BANG_DATABASE.md
│   ├── 📝 Danh mục các bảng.md
│   ├── 📝 Danh mục các hình.md
│   ├── 📄 Danh mục các hình.txt
│   ├── 📝 LOGIC_VA_LUONG_HOAT_DONG_CINEX.md
│   ├── 📝 MO_TA_CHI_TIET_BANG_DATABASE.md
│   ├── 📄 Menu-admin.txt
│   ├── 📘 Phân tích nghiệp vụ khách hàng.docx
│   ├── 📘 Phân tích nghiệp vụ quản trị.docx
│   ├── 📝 THU_VIEN_VA_PACKAGE_SU_DUNG.md
│   ├── 📘 Tổng quan đề tài.docx
│   ├── 🖼️ diagram.png
│   ├── 📘 ~$ án chuyên ngành Công nghệ thông tin - Trần Mạnh Linh.docx
│   ├── 📘 ~$ng quan đề tài.docx
│   └── 📘 Đồ án chuyên ngành Công nghệ thông tin - Trần Mạnh Linh.docx
├── 📁 frontend
│   ├── 📁 app
│   │   ├── 📁 (admin)
│   │   │   └── 📁 admin
│   │   │       ├── 📁 [module]
│   │   │       │   ├── 📁 [id]
│   │   │       │   │   ├── 📁 edit
│   │   │       │   │   │   └── 📄 page.tsx
│   │   │       │   │   └── 📄 page.tsx
│   │   │       │   └── 📁 new
│   │   │       │       └── 📄 page.tsx
│   │   │       ├── 📁 accounts
│   │   │       │   ├── 📄 AdminAccountsPageClient.tsx
│   │   │       │   └── 📄 page.tsx
│   │   │       ├── 📁 bookings
│   │   │       │   └── 📄 page.tsx
│   │   │       ├── 📁 cinemas
│   │   │       │   ├── 📁 room-types
│   │   │       │   │   └── 📄 page.tsx
│   │   │       │   ├── 📁 seat-maps
│   │   │       │   │   └── 📄 page.tsx
│   │   │       │   ├── 📁 seat-types
│   │   │       │   │   └── 📄 page.tsx
│   │   │       │   └── 📄 page.tsx
│   │   │       ├── 📁 dashboard
│   │   │       │   └── 📄 page.tsx
│   │   │       ├── 📁 movies
│   │   │       │   ├── 📁 [id]
│   │   │       │   │   ├── 📁 edit
│   │   │       │   │   │   └── 📄 page.tsx
│   │   │       │   │   ├── 📄 AdminMovieDetailPageClient.tsx
│   │   │       │   │   └── 📄 page.tsx
│   │   │       │   ├── 📁 coming-soon
│   │   │       │   │   └── 📄 page.tsx
│   │   │       │   ├── 📁 genres
│   │   │       │   │   ├── 📄 AdminMovieGenresPageClient.tsx
│   │   │       │   │   └── 📄 page.tsx
│   │   │       │   ├── 📁 new
│   │   │       │   │   └── 📄 page.tsx
│   │   │       │   ├── 📁 now-showing
│   │   │       │   │   └── 📄 page.tsx
│   │   │       │   ├── 📁 reviews
│   │   │       │   │   └── 📄 page.tsx
│   │   │       │   ├── 📄 AdminMoviesListPage.tsx
│   │   │       │   └── 📄 movie-data.ts
│   │   │       ├── 📁 payments
│   │   │       │   ├── 📁 invoices
│   │   │       │   │   └── 📄 page.tsx
│   │   │       │   ├── 📁 refund-approvals
│   │   │       │   │   └── 📄 page.tsx
│   │   │       │   ├── 📁 transactions
│   │   │       │   │   └── 📄 page.tsx
│   │   │       │   └── 📄 page.tsx
│   │   │       ├── 📁 permissions
│   │   │       │   ├── 📄 AdminPermissionsPageClient.tsx
│   │   │       │   └── 📄 page.tsx
│   │   │       ├── 📁 promotions
│   │   │       │   └── 📄 page.tsx
│   │   │       ├── 📁 revenue
│   │   │       │   └── 📄 page.tsx
│   │   │       ├── 📁 rooms
│   │   │       │   └── 📄 page.tsx
│   │   │       ├── 📁 showtimes
│   │   │       │   ├── 📁 schedules
│   │   │       │   │   └── 📄 page.tsx
│   │   │       │   ├── 📁 sessions
│   │   │       │   │   └── 📄 page.tsx
│   │   │       │   ├── 📄 AdminShowtimeManagerPage.tsx
│   │   │       │   └── 📄 page.tsx
│   │   │       ├── 📁 tickets
│   │   │       │   └── 📄 page.tsx
│   │   │       ├── 📄 admin-crud-config.ts
│   │   │       ├── 📄 layout.tsx
│   │   │       └── 📄 page.tsx
│   │   ├── 📁 (site)
│   │   │   ├── 📁 about
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 account
│   │   │   │   ├── 📁 booking
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   └── 📁 profile
│   │   │   │       └── 📄 page.tsx
│   │   │   ├── 📁 genres
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 login
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 movies
│   │   │   │   ├── 📁 [id]
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 coming-soon
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   └── 📁 now-showing
│   │   │   │       └── 📄 page.tsx
│   │   │   ├── 📁 register
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 showtimes
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 ticket-booking
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📄 layout.tsx
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 loading
│   │   │   └── 📄 page.tsx
│   │   ├── 📄 favicon.ico
│   │   ├── 🎨 globals.css
│   │   └── 📄 layout.tsx
│   ├── 📁 components
│   │   ├── 📁 admin
│   │   │   ├── 📄 AdminCrudDetailPage.tsx
│   │   │   ├── 📄 AdminCrudFormPage.tsx
│   │   │   ├── 📄 AdminModulePage.tsx
│   │   │   ├── 📄 AdminShell.tsx
│   │   │   ├── 📄 MovieFormPage.tsx
│   │   │   └── 📄 admin-menu-page-configs.ts
│   │   ├── 📁 auth
│   │   │   └── 📄 DevAuthSessionReset.tsx
│   │   ├── 📁 card
│   │   ├── 📁 layout
│   │   │   ├── 📄 Footer.tsx
│   │   │   └── 📄 Header.tsx
│   │   ├── 📁 navigation
│   │   │   ├── 📄 LoadingRedirectTemplate.tsx
│   │   │   └── 📄 NavigationInterceptor.tsx
│   │   ├── 📁 support
│   │   │   └── 📄 FloatingSupportWidget.tsx
│   │   ├── 📄 CalendarDatePicker.tsx
│   │   ├── 📄 ComingsoonMovies.tsx
│   │   ├── 📄 HeroMoviesSlider.tsx
│   │   ├── 📄 HomeMovieSection.tsx
│   │   ├── 📄 MovieCatalogPage.tsx
│   │   ├── 📄 MovieDetailPage.tsx
│   │   ├── 📄 MovieRecommendationsSection.tsx
│   │   ├── 📄 MovieReviewsSection.tsx
│   │   ├── 📄 NowShowingMovies.tsx
│   │   └── 📄 QuickBookingPanel.tsx
│   ├── 📁 lib
│   │   ├── 📄 admin-accounts-api.ts
│   │   ├── 📄 admin-genres-api.ts
│   │   ├── 📄 admin-movies-api.ts
│   │   ├── 📄 admin-showtimes-api.ts
│   │   ├── 📄 auth-api.ts
│   │   ├── 📄 auth.ts
│   │   ├── 📄 chatbot-api.ts
│   │   ├── 📄 home-movies.ts
│   │   ├── 📄 movie-recommendations-api.ts
│   │   ├── 📄 movie-reviews-api.ts
│   │   ├── 📄 navigation.ts
│   │   ├── 📄 ticket-booking-api.ts
│   │   └── 📄 youtube.ts
│   ├── 📁 public
│   │   ├── 📁 movies
│   │   │   ├── 📁 banner
│   │   │   │   ├── 📁 coming-soon
│   │   │   │   │   ├── 🖼️ amelie.jpg
│   │   │   │   │   ├── 🖼️ avengers-infinity-war.jpg
│   │   │   │   │   ├── 🖼️ avengers-secret-wars.jpg
│   │   │   │   │   ├── 🖼️ baahubali-2-the-conclusion.jpg
│   │   │   │   │   ├── 🖼️ barbie.jpg
│   │   │   │   │   ├── 🖼️ captain-america-civil-war.jpg
│   │   │   │   │   ├── 🖼️ dad-im-sorry.jpg
│   │   │   │   │   ├── 🖼️ demon-slayer-infinity-castle.jpg
│   │   │   │   │   ├── 🖼️ detective-chinatown-3.jpg
│   │   │   │   │   ├── 🖼️ dreamy-eyes.jpg
│   │   │   │   │   ├── 🖼️ elite-squad.jpg
│   │   │   │   │   ├── 🖼️ face-off-7-one-wish.jpg
│   │   │   │   │   ├── 🖼️ full-river-red.jpg
│   │   │   │   │   ├── 🖼️ inside-out-2.jpg
│   │   │   │   │   ├── 🖼️ interstellar.jpg
│   │   │   │   │   ├── 🖼️ minions.jpg
│   │   │   │   │   ├── 🖼️ pathaan.jpg
│   │   │   │   │   ├── 🖼️ portrait-of-a-lady-on-fire.jpg
│   │   │   │   │   ├── 🖼️ star-wars-the-force-awakens.jpg
│   │   │   │   │   ├── 🖼️ veteran.jpg
│   │   │   │   │   ├── 🖼️ weathering-with-you.jpg
│   │   │   │   │   └── 🖼️ wolf-warrior-2.jpg
│   │   │   │   ├── 📁 ended
│   │   │   │   │   ├── 🖼️ along-with-the-gods-the-two-worlds.jpg
│   │   │   │   │   ├── 🖼️ avatar.jpg
│   │   │   │   │   ├── 🖼️ avengers-endgame.jpg
│   │   │   │   │   ├── 🖼️ bad-genius.jpg
│   │   │   │   │   ├── 🖼️ bajrangi-bhaijaan.jpg
│   │   │   │   │   ├── 🖼️ city-of-god.jpg
│   │   │   │   │   ├── 🖼️ crouching-tiger-hidden-dragon.jpg
│   │   │   │   │   ├── 🖼️ dangal.jpg
│   │   │   │   │   ├── 🖼️ deadpool-and-wolverine.jpg
│   │   │   │   │   ├── 🖼️ demon-slayer-mugen-train.jpg
│   │   │   │   │   ├── 🖼️ frozen-ii.jpg
│   │   │   │   │   ├── 🖼️ frozen.jpg
│   │   │   │   │   ├── 🖼️ furie.jpg
│   │   │   │   │   ├── 🖼️ furious-7.jpg
│   │   │   │   │   ├── 🖼️ harry-potter-and-the-deathly-hallows-part-2.jpg
│   │   │   │   │   ├── 🖼️ howls-moving-castle.jpg
│   │   │   │   │   ├── 🖼️ incendies.jpg
│   │   │   │   │   ├── 🖼️ inception.jpg
│   │   │   │   │   ├── 🖼️ incredibles-2.jpg
│   │   │   │   │   ├── 🖼️ iron-man-3.jpg
│   │   │   │   │   ├── 🖼️ jurassic-world.jpg
│   │   │   │   │   ├── 🖼️ kantara.jpg
│   │   │   │   │   ├── 🖼️ kung-fu-hustle.jpg
│   │   │   │   │   ├── 🖼️ lagaan.jpg
│   │   │   │   │   ├── 🖼️ ne-zha-2.jpg
│   │   │   │   │   ├── 🖼️ ne-zha.jpg
│   │   │   │   │   ├── 🖼️ princess-mononoke.jpg
│   │   │   │   │   ├── 🖼️ pushpa-2-the-rule.jpg
│   │   │   │   │   ├── 🖼️ spider-man-no-way-home.jpg
│   │   │   │   │   ├── 🖼️ star-wars-the-last-jedi.jpg
│   │   │   │   │   ├── 🖼️ the-admiral-roaring-currents.jpg
│   │   │   │   │   ├── 🖼️ the-battle-at-lake-changjin.jpg
│   │   │   │   │   ├── 🖼️ the-dark-knight.jpg
│   │   │   │   │   ├── 🖼️ the-fate-of-the-furious.jpg
│   │   │   │   │   ├── 🖼️ the-first-slam-dunk.jpg
│   │   │   │   │   ├── 🖼️ the-roundup.jpg
│   │   │   │   │   ├── 🖼️ the-super-mario-bros-movie.jpg
│   │   │   │   │   ├── 🖼️ the-wandering-earth.jpg
│   │   │   │   │   ├── 🖼️ titanic.jpg
│   │   │   │   │   ├── 🖼️ top-gun-maverick.jpg
│   │   │   │   │   ├── 🖼️ train-to-busan.jpg
│   │   │   │   │   └── 🖼️ your-name.jpg
│   │   │   │   └── 📁 now-showing
│   │   │   │       ├── 🖼️ 3-idiots.jpg
│   │   │   │       ├── 🖼️ a-taxi-driver.jpg
│   │   │   │       ├── 🖼️ anatomy-of-a-fall.jpg
│   │   │   │       ├── 🖼️ aquaman.jpg
│   │   │   │       ├── 🖼️ avatar-the-way-of-water.jpg
│   │   │   │       ├── 🖼️ avengers-age-of-ultron.jpg
│   │   │   │       ├── 🖼️ avengers-secret-wars.jpg
│   │   │   │       ├── 🖼️ beauty-and-the-beast-2017.jpg
│   │   │   │       ├── 🖼️ black-panther.jpg
│   │   │   │       ├── 🖼️ cinema-paradiso.jpg
│   │   │   │       ├── 🖼️ dragon-ball-super-broly.jpg
│   │   │   │       ├── 🖼️ dune-part-two.jpg
│   │   │   │       ├── 🖼️ exhuma.jpg
│   │   │   │       ├── 🖼️ extreme-job.jpg
│   │   │   │       ├── 🖼️ face-off-6-the-ticket-of-destiny.jpg
│   │   │   │       ├── 🖼️ godzilla-minus-one.jpg
│   │   │   │       ├── 🖼️ hi-mom.jpg
│   │   │   │       ├── 🖼️ jawan.jpg
│   │   │   │       ├── 🖼️ joker.jpg
│   │   │   │       ├── 🖼️ jurassic-world-fallen-kingdom.jpg
│   │   │   │       ├── 🖼️ kalki-2898-ad.jpg
│   │   │   │       ├── 🖼️ kgf-chapter-2.jpg
│   │   │   │       ├── 🖼️ lat-mat-8.jpg
│   │   │   │       ├── 🖼️ life-is-beautiful.jpg
│   │   │   │       ├── 🖼️ mai.jpg
│   │   │   │       ├── 🖼️ ode-to-my-father.jpg
│   │   │   │       ├── 🖼️ one-piece-film-red.jpg
│   │   │   │       ├── 🖼️ oppenheimer.jpg
│   │   │   │       ├── 🖼️ pans-labyrinth.jpg
│   │   │   │       ├── 🖼️ parasite.jpg
│   │   │   │       ├── 🖼️ rrr.jpg
│   │   │   │       ├── 🖼️ spirited-away.jpg
│   │   │   │       ├── 🖼️ suzume.jpg
│   │   │   │       ├── 🖼️ the-house-of-no-man.jpg
│   │   │   │       ├── 🖼️ the-intouchables.jpg
│   │   │   │       ├── 🖼️ the-kings-speech.jpg
│   │   │   │       ├── 🖼️ the-lion-king-2019.jpg
│   │   │   │       ├── 🖼️ the-raid.jpg
│   │   │   │       ├── 🖼️ the-secret-in-their-eyes.jpg
│   │   │   │       ├── 🖼️ the-wandering-earth-2.jpg
│   │   │   │       └── 🖼️ yellow-flowers-on-the-green-grass.jpg
│   │   │   ├── 📁 poster
│   │   │   │   ├── 📁 coming-soon
│   │   │   │   │   ├── 🖼️ amelie.jpg
│   │   │   │   │   ├── 🖼️ avengers-infinity-war.jpg
│   │   │   │   │   ├── 🖼️ avengers-secret-wars.jpg
│   │   │   │   │   ├── 🖼️ baahubali-2-the-conclusion.jpg
│   │   │   │   │   ├── 🖼️ barbie.jpg
│   │   │   │   │   ├── 🖼️ captain-america-civil-war.jpg
│   │   │   │   │   ├── 🖼️ dad-im-sorry.jpg
│   │   │   │   │   ├── 🖼️ demon-slayer-infinity-castle.jpg
│   │   │   │   │   ├── 🖼️ detective-chinatown-3.jpg
│   │   │   │   │   ├── 🖼️ dreamy-eyes.jpg
│   │   │   │   │   ├── 🖼️ elite-squad.jpg
│   │   │   │   │   ├── 🖼️ face-off-7-one-wish.jpg
│   │   │   │   │   ├── 🖼️ full-river-red.jpg
│   │   │   │   │   ├── 🖼️ inside-out-2.jpg
│   │   │   │   │   ├── 🖼️ interstellar.jpg
│   │   │   │   │   ├── 🖼️ minions.jpg
│   │   │   │   │   ├── 🖼️ pathaan.jpg
│   │   │   │   │   ├── 🖼️ portrait-of-a-lady-on-fire.jpg
│   │   │   │   │   ├── 🖼️ star-wars-the-force-awakens.jpg
│   │   │   │   │   ├── 🖼️ veteran.jpg
│   │   │   │   │   ├── 🖼️ weathering-with-you.jpg
│   │   │   │   │   └── 🖼️ wolf-warrior-2.jpg
│   │   │   │   ├── 📁 ended
│   │   │   │   │   ├── 🖼️ along-with-the-gods-the-two-worlds.jpg
│   │   │   │   │   ├── 🖼️ avatar.jpg
│   │   │   │   │   ├── 🖼️ avengers-endgame.jpg
│   │   │   │   │   ├── 🖼️ bad-genius.jpg
│   │   │   │   │   ├── 🖼️ bajrangi-bhaijaan.jpg
│   │   │   │   │   ├── 🖼️ city-of-god.jpg
│   │   │   │   │   ├── 🖼️ crouching-tiger-hidden-dragon.jpg
│   │   │   │   │   ├── 🖼️ dangal.jpg
│   │   │   │   │   ├── 🖼️ deadpool-and-wolverine.jpg
│   │   │   │   │   ├── 🖼️ demon-slayer-mugen-train.jpg
│   │   │   │   │   ├── 🖼️ frozen-ii.jpg
│   │   │   │   │   ├── 🖼️ frozen.jpg
│   │   │   │   │   ├── 🖼️ furie.jpg
│   │   │   │   │   ├── 🖼️ furious-7.jpg
│   │   │   │   │   ├── 🖼️ harry-potter-and-the-deathly-hallows-part-2.jpg
│   │   │   │   │   ├── 🖼️ howls-moving-castle.jpg
│   │   │   │   │   ├── 🖼️ incendies.jpg
│   │   │   │   │   ├── 🖼️ inception.jpg
│   │   │   │   │   ├── 🖼️ incredibles-2.jpg
│   │   │   │   │   ├── 🖼️ iron-man-3.jpg
│   │   │   │   │   ├── 🖼️ jurassic-world.jpg
│   │   │   │   │   ├── 🖼️ kantara.jpg
│   │   │   │   │   ├── 🖼️ kung-fu-hustle.jpg
│   │   │   │   │   ├── 🖼️ lagaan.jpg
│   │   │   │   │   ├── 🖼️ ne-zha-2.jpg
│   │   │   │   │   ├── 🖼️ ne-zha.jpg
│   │   │   │   │   ├── 🖼️ princess-mononoke.jpg
│   │   │   │   │   ├── 🖼️ pushpa-2-the-rule.jpg
│   │   │   │   │   ├── 🖼️ spider-man-no-way-home.jpg
│   │   │   │   │   ├── 🖼️ star-wars-the-last-jedi.jpg
│   │   │   │   │   ├── 🖼️ the-admiral-roaring-currents.jpg
│   │   │   │   │   ├── 🖼️ the-battle-at-lake-changjin.jpg
│   │   │   │   │   ├── 🖼️ the-dark-knight.jpg
│   │   │   │   │   ├── 🖼️ the-fate-of-the-furious.jpg
│   │   │   │   │   ├── 🖼️ the-first-slam-dunk.jpg
│   │   │   │   │   ├── 🖼️ the-roundup.jpg
│   │   │   │   │   ├── 🖼️ the-super-mario-bros-movie.jpg
│   │   │   │   │   ├── 🖼️ the-wandering-earth.jpg
│   │   │   │   │   ├── 🖼️ titanic.jpg
│   │   │   │   │   ├── 🖼️ top-gun-maverick.jpg
│   │   │   │   │   ├── 🖼️ train-to-busan.jpg
│   │   │   │   │   └── 🖼️ your-name.jpg
│   │   │   │   ├── 📁 now-showing
│   │   │   │   │   ├── 🖼️ 3-idiots.jpg
│   │   │   │   │   ├── 🖼️ a-taxi-driver.jpg
│   │   │   │   │   ├── 🖼️ anatomy-of-a-fall.jpg
│   │   │   │   │   ├── 🖼️ aquaman.jpg
│   │   │   │   │   ├── 🖼️ avatar-the-way-of-water.jpg
│   │   │   │   │   ├── 🖼️ avengers-age-of-ultron.jpg
│   │   │   │   │   ├── 🖼️ avengers-secret-wars.jpg
│   │   │   │   │   ├── 🖼️ beauty-and-the-beast-2017.jpg
│   │   │   │   │   ├── 🖼️ black-panther.jpg
│   │   │   │   │   ├── 🖼️ cinema-paradiso.jpg
│   │   │   │   │   ├── 🖼️ dragon-ball-super-broly.jpg
│   │   │   │   │   ├── 🖼️ dune-part-two.jpg
│   │   │   │   │   ├── 🖼️ exhuma.jpg
│   │   │   │   │   ├── 🖼️ extreme-job.jpg
│   │   │   │   │   ├── 🖼️ face-off-6-the-ticket-of-destiny.jpg
│   │   │   │   │   ├── 🖼️ godzilla-minus-one.jpg
│   │   │   │   │   ├── 🖼️ hi-mom.jpg
│   │   │   │   │   ├── 🖼️ jawan.jpg
│   │   │   │   │   ├── 🖼️ joker.jpg
│   │   │   │   │   ├── 🖼️ jurassic-world-fallen-kingdom.jpg
│   │   │   │   │   ├── 🖼️ kalki-2898-ad.jpg
│   │   │   │   │   ├── 🖼️ kgf-chapter-2.jpg
│   │   │   │   │   ├── 🖼️ lat-mat-8.jpg
│   │   │   │   │   ├── 🖼️ life-is-beautiful.jpg
│   │   │   │   │   ├── 🖼️ mai.jpg
│   │   │   │   │   ├── 🖼️ ode-to-my-father.jpg
│   │   │   │   │   ├── 🖼️ one-piece-film-red.jpg
│   │   │   │   │   ├── 🖼️ oppenheimer.jpg
│   │   │   │   │   ├── 🖼️ pans-labyrinth.jpg
│   │   │   │   │   ├── 🖼️ parasite.jpg
│   │   │   │   │   ├── 🖼️ rrr.jpg
│   │   │   │   │   ├── 🖼️ spirited-away.jpg
│   │   │   │   │   ├── 🖼️ suzume.jpg
│   │   │   │   │   ├── 🖼️ the-house-of-no-man.jpg
│   │   │   │   │   ├── 🖼️ the-intouchables.jpg
│   │   │   │   │   ├── 🖼️ the-kings-speech.jpg
│   │   │   │   │   ├── 🖼️ the-lion-king-2019.jpg
│   │   │   │   │   ├── 🖼️ the-raid.jpg
│   │   │   │   │   ├── 🖼️ the-secret-in-their-eyes.jpg
│   │   │   │   │   ├── 🖼️ the-wandering-earth-2.jpg
│   │   │   │   │   └── 🖼️ yellow-flowers-on-the-green-grass.jpg
│   │   │   │   └── 📁 uploaded
│   │   │   │       ├── 🖼️ poster-1781554473723-e3511ac357b3acc7.jpg
│   │   │   │       └── 🖼️ poster-1781554577437-db570d90cacc547e.jpg
│   │   │   ├── 🖼️ Interstellar.jpg
│   │   │   ├── 🖼️ b840e925aef8552957e968a1218d4757.jpg
│   │   │   ├── 🖼️ b92670b4eddb8b9ecb424afa7e19b791.jpg
│   │   │   ├── 🖼️ broly.jpg
│   │   │   ├── 🖼️ dark-knight.jpg
│   │   │   ├── 🖼️ demo.png
│   │   │   ├── 🖼️ end-game.jpg
│   │   │   └── 🖼️ infinity-castle.jpg
│   │   ├── 🖼️ file.svg
│   │   ├── 🖼️ globe.svg
│   │   ├── 🖼️ next.svg
│   │   ├── 🖼️ vercel.svg
│   │   └── 🖼️ window.svg
│   ├── 📁 scripts
│   │   └── 📄 set-dev-session.mjs
│   ├── ⚙️ .gitignore
│   ├── 📝 AGENTS.md
│   ├── 📝 CLAUDE.md
│   ├── 📝 README.md
│   ├── 📄 eslint.config.mjs
│   ├── 📄 next-env.d.ts
│   ├── 📄 next.config.ts
│   ├── ⚙️ package-lock.json
│   ├── ⚙️ package.json
│   ├── 📄 postcss.config.mjs
│   ├── ⚙️ tsconfig.json
│   └── 📄 tsconfig.tsbuildinfo
└── 📝 PROJECT_STRUCTURE.md
```

---
*Generated by FileTree Pro Extension*