BEGIN;

INSERT INTO roles (name, description, "createdAt", "updatedAt")
VALUES
  ('ADMIN', 'Quản trị viên hệ thống', NOW(), NOW()),
  ('MANAGER', 'Quản lý rạp phim', NOW(), NOW()),
  ('STAFF', 'Nhân viên rạp phim', NOW(), NOW()),
  ('CUSTOMER', 'Khách hàng', NOW(), NOW())
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description,
    "updatedAt" = NOW();

INSERT INTO permissions (name, description, "createdAt", "updatedAt")
VALUES
  ('movie.view', 'Xem danh sách phim', NOW(), NOW()),
  ('movie.create', 'Thêm phim', NOW(), NOW()),
  ('movie.update', 'Cập nhật phim', NOW(), NOW()),
  ('movie.delete', 'Xóa phim', NOW(), NOW()),
  ('cinema.view', 'Xem danh sách rạp', NOW(), NOW()),
  ('cinema.create', 'Thêm rạp', NOW(), NOW()),
  ('booking.view', 'Xem đơn đặt vé', NOW(), NOW()),
  ('booking.manage', 'Quản lý đặt vé', NOW(), NOW()),
  ('user.view', 'Xem người dùng', NOW(), NOW()),
  ('user.manage', 'Quản lý người dùng', NOW(), NOW())
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description,
    "updatedAt" = NOW();

INSERT INTO role_permissions ("roleId", "permissionId", "createdAt")
SELECT r.id, p.id, NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ADMIN'
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

INSERT INTO role_permissions ("roleId", "permissionId", "createdAt")
SELECT r.id, p.id, NOW()
FROM roles r
JOIN permissions p ON p.name IN (
  'movie.view',
  'cinema.view',
  'booking.view',
  'booking.manage'
)
WHERE r.name = 'STAFF'
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

INSERT INTO genres (name, description, "createdAt", "updatedAt")
VALUES
  ('Hành động', 'Phim hành động, chiến đấu, rượt đuổi', NOW(), NOW()),
  ('Tình cảm', 'Phim tình cảm, lãng mạn', NOW(), NOW()),
  ('Kinh dị', 'Phim kinh dị, giật gân', NOW(), NOW()),
  ('Hài', 'Phim hài hước, giải trí', NOW(), NOW()),
  ('Hoạt hình', 'Phim hoạt hình dành cho mọi lứa tuổi', NOW(), NOW()),
  ('Phiêu lưu', 'Phim khám phá, hành trình, mạo hiểm', NOW(), NOW()),
  ('Khoa học viễn tưởng', 'Phim giả tưởng, công nghệ, tương lai', NOW(), NOW()),
  ('Tâm lý', 'Phim tâm lý, đời sống, xã hội', NOW(), NOW()),
  ('Tội phạm', 'Phim điều tra, băng nhóm, thế giới ngầm', NOW(), NOW()),
  ('Gia đình', 'Phim phù hợp gia đình và thiếu nhi', NOW(), NOW()),
  ('Giả tưởng', 'Phim phép thuật, thần thoại, thế giới tưởng tượng', NOW(), NOW()),
  ('Lịch sử', 'Phim lấy bối cảnh hoặc nhân vật lịch sử', NOW(), NOW()),
  ('Chiến tranh', 'Phim chiến tranh, quân sự, chiến trường', NOW(), NOW()),
  ('Bí ẩn', 'Phim bí ẩn, phá án, điều tra', NOW(), NOW()),
  ('Giật gân', 'Phim hồi hộp, căng thẳng, truy đuổi', NOW(), NOW()),
  ('Âm nhạc', 'Phim âm nhạc, nghệ sĩ, biểu diễn', NOW(), NOW()),
  ('Tài liệu', 'Phim tài liệu, ghi chép hiện thực', NOW(), NOW()),
  ('Viễn Tây', 'Phim cao bồi, miền Tây', NOW(), NOW()),
  ('Anime', 'Phim hoạt hình Nhật Bản', NOW(), NOW())
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description,
    "updatedAt" = NOW();

INSERT INTO movies (
  title,
  slug,
  description,
  director,
  actors,
  duration,
  "releaseDate",
  language,
  country,
  "ageLimit",
  "trailerUrl",
  "posterUrl",
  "bannerUrl",
  status,
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'Lật Mặt 8',
    'lat-mat-8',
    'Bộ phim điện ảnh Việt Nam.',
    'Lý Hải',
    'Quách Ngọc Tuyên, Huy Khánh',
    120,
    '2026-04-30',
    'Tiếng Việt',
    'Việt Nam',
    'T16',
    'https://youtube.com',
    '/uploads/movies/lat-mat-8.jpg',
    '/uploads/movies/lat-mat-8-banner.jpg',
    'NOW_SHOWING',
    NOW(),
    NOW()
  ),
  (
    'Avengers: Secret Wars',
    'avengers-secret-wars',
    'Phim siêu anh hùng.',
    'Marvel Studios',
    'Robert Downey Jr., Chris Hemsworth',
    150,
    '2026-05-15',
    'Tiếng Anh',
    'Mỹ',
    'T13',
    'https://youtube.com',
    '/uploads/movies/avengers-secret-wars.jpg',
    '/uploads/movies/avengers-secret-wars-banner.jpg',
    'COMING_SOON',
    NOW(),
    NOW()
  )
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    director = EXCLUDED.director,
    actors = EXCLUDED.actors,
    duration = EXCLUDED.duration,
    "releaseDate" = EXCLUDED."releaseDate",
    language = EXCLUDED.language,
    country = EXCLUDED.country,
    "ageLimit" = EXCLUDED."ageLimit",
    "trailerUrl" = EXCLUDED."trailerUrl",
    "posterUrl" = EXCLUDED."posterUrl",
    "bannerUrl" = EXCLUDED."bannerUrl",
    status = EXCLUDED.status,
    "updatedAt" = NOW();

INSERT INTO movie_genres ("movieId", "genreId")
SELECT m.id, g.id
FROM movies m
JOIN genres g ON (
  (m.slug = 'lat-mat-8' AND g.name IN ('Hành động', 'Tâm lý')) OR
  (m.slug = 'avengers-secret-wars' AND g.name IN ('Hành động', 'Khoa học viễn tưởng'))
)
ON CONFLICT ("movieId", "genreId") DO NOTHING;

WITH movie_seed (
  title,
  slug,
  description,
  director,
  actors,
  duration,
  release_date,
  language,
  country,
  age_limit,
  trailer_url,
  poster_url,
  banner_url,
  status,
  genres
) AS (
  VALUES
    ('Avatar', 'avatar', 'Phim chiếu rạp Mỹ thuộc nhóm khoa học viễn tưởng, phiêu lưu, hành động.', 'James Cameron', 'Sam Worthington, Zoe Saldana, Sigourney Weaver', 162, '2009-12-18', 'Tiếng Anh', 'Mỹ', 'T13', 'https://www.youtube.com/results?search_query=Avatar+official+trailer', '/uploads/movies/avatar.jpg', '/uploads/movies/avatar-banner.jpg', 'ENDED', ARRAY['Khoa học viễn tưởng', 'Phiêu lưu', 'Hành động']::text[]),
    ('Avatar: The Way of Water', 'avatar-the-way-of-water', 'Phim chiếu rạp Mỹ thuộc nhóm khoa học viễn tưởng, phiêu lưu, hành động.', 'James Cameron', 'Sam Worthington, Zoe Saldana, Sigourney Weaver', 192, '2022-12-16', 'Tiếng Anh', 'Mỹ', 'T13', 'https://www.youtube.com/results?search_query=Avatar+The+Way+of+Water+official+trailer', '/uploads/movies/avatar-the-way-of-water.jpg', '/uploads/movies/avatar-the-way-of-water-banner.jpg', 'ENDED', ARRAY['Khoa học viễn tưởng', 'Phiêu lưu', 'Hành động']::text[]),
    ('Avengers: Endgame', 'avengers-endgame', 'Phim chiếu rạp Mỹ thuộc nhóm hành động, phiêu lưu, khoa học viễn tưởng.', 'Anthony Russo, Joe Russo', 'Robert Downey Jr., Chris Evans, Scarlett Johansson', 181, '2019-04-26', 'Tiếng Anh', 'Mỹ', 'T13', 'https://www.youtube.com/results?search_query=Avengers+Endgame+official+trailer', '/uploads/movies/avengers-endgame.jpg', '/uploads/movies/avengers-endgame-banner.jpg', 'ENDED', ARRAY['Hành động', 'Phiêu lưu', 'Khoa học viễn tưởng']::text[]),
    ('Titanic', 'titanic', 'Phim chiếu rạp Mỹ thuộc nhóm tình cảm, tâm lý, lịch sử.', 'James Cameron', 'Leonardo DiCaprio, Kate Winslet, Billy Zane', 195, '1997-12-19', 'Tiếng Anh', 'Mỹ', 'T13', 'https://www.youtube.com/results?search_query=Titanic+official+trailer', '/uploads/movies/titanic.jpg', '/uploads/movies/titanic-banner.jpg', 'ENDED', ARRAY['Tình cảm', 'Tâm lý', 'Lịch sử']::text[]),
    ('Star Wars: The Force Awakens', 'star-wars-the-force-awakens', 'Phim chiếu rạp Mỹ thuộc nhóm khoa học viễn tưởng, phiêu lưu, hành động.', 'J.J. Abrams', 'Daisy Ridley, John Boyega, Harrison Ford', 138, '2015-12-18', 'Tiếng Anh', 'Mỹ', 'T13', 'https://www.youtube.com/results?search_query=Star+Wars+The+Force+Awakens+official+trailer', '/uploads/movies/star-wars-the-force-awakens.jpg', '/uploads/movies/star-wars-the-force-awakens-banner.jpg', 'ENDED', ARRAY['Khoa học viễn tưởng', 'Phiêu lưu', 'Hành động']::text[]),
    ('Avengers: Infinity War', 'avengers-infinity-war', 'Phim chiếu rạp Mỹ thuộc nhóm hành động, phiêu lưu, khoa học viễn tưởng.', 'Anthony Russo, Joe Russo', 'Robert Downey Jr., Chris Hemsworth, Josh Brolin', 149, '2018-04-27', 'Tiếng Anh', 'Mỹ', 'T13', 'https://www.youtube.com/results?search_query=Avengers+Infinity+War+official+trailer', '/uploads/movies/avengers-infinity-war.jpg', '/uploads/movies/avengers-infinity-war-banner.jpg', 'ENDED', ARRAY['Hành động', 'Phiêu lưu', 'Khoa học viễn tưởng']::text[]),
    ('Spider-Man: No Way Home', 'spider-man-no-way-home', 'Phim chiếu rạp Mỹ thuộc nhóm hành động, phiêu lưu, khoa học viễn tưởng.', 'Jon Watts', 'Tom Holland, Zendaya, Benedict Cumberbatch', 148, '2021-12-17', 'Tiếng Anh', 'Mỹ', 'T13', 'https://www.youtube.com/results?search_query=Spider-Man+No+Way+Home+official+trailer', '/uploads/movies/spider-man-no-way-home.jpg', '/uploads/movies/spider-man-no-way-home-banner.jpg', 'ENDED', ARRAY['Hành động', 'Phiêu lưu', 'Khoa học viễn tưởng']::text[]),
    ('Inside Out 2', 'inside-out-2', 'Phim chiếu rạp Mỹ thuộc nhóm hoạt hình, gia đình, hài.', 'Kelsey Mann', 'Amy Poehler, Maya Hawke, Kensington Tallman', 96, '2024-06-14', 'Tiếng Anh', 'Mỹ', 'P', 'https://www.youtube.com/results?search_query=Inside+Out+2+official+trailer', '/uploads/movies/inside-out-2.jpg', '/uploads/movies/inside-out-2-banner.jpg', 'ENDED', ARRAY['Hoạt hình', 'Gia đình', 'Hài']::text[]),
    ('Jurassic World', 'jurassic-world', 'Phim chiếu rạp Mỹ thuộc nhóm phiêu lưu, khoa học viễn tưởng, hành động.', 'Colin Trevorrow', 'Chris Pratt, Bryce Dallas Howard, Vincent D''Onofrio', 124, '2015-06-12', 'Tiếng Anh', 'Mỹ', 'T13', 'https://www.youtube.com/results?search_query=Jurassic+World+official+trailer', '/uploads/movies/jurassic-world.jpg', '/uploads/movies/jurassic-world-banner.jpg', 'ENDED', ARRAY['Phiêu lưu', 'Khoa học viễn tưởng', 'Hành động']::text[]),
    ('The Lion King', 'the-lion-king-2019', 'Phim chiếu rạp Mỹ thuộc nhóm hoạt hình, gia đình, phiêu lưu.', 'Jon Favreau', 'Donald Glover, Beyonce Knowles-Carter, Chiwetel Ejiofor', 118, '2019-07-19', 'Tiếng Anh', 'Mỹ', 'P', 'https://www.youtube.com/results?search_query=The+Lion+King+2019+official+trailer', '/uploads/movies/the-lion-king-2019.jpg', '/uploads/movies/the-lion-king-2019-banner.jpg', 'ENDED', ARRAY['Hoạt hình', 'Gia đình', 'Phiêu lưu']::text[]),
    ('Furious 7', 'furious-7', 'Phim chiếu rạp Mỹ thuộc nhóm hành động, tội phạm, giật gân.', 'James Wan', 'Vin Diesel, Paul Walker, Dwayne Johnson', 137, '2015-04-03', 'Tiếng Anh', 'Mỹ', 'T13', 'https://www.youtube.com/results?search_query=Furious+7+official+trailer', '/uploads/movies/furious-7.jpg', '/uploads/movies/furious-7-banner.jpg', 'ENDED', ARRAY['Hành động', 'Tội phạm', 'Giật gân']::text[]),
    ('Top Gun: Maverick', 'top-gun-maverick', 'Phim chiếu rạp Mỹ thuộc nhóm hành động, tâm lý.', 'Joseph Kosinski', 'Tom Cruise, Miles Teller, Jennifer Connelly', 130, '2022-05-27', 'Tiếng Anh', 'Mỹ', 'T13', 'https://www.youtube.com/results?search_query=Top+Gun+Maverick+official+trailer', '/uploads/movies/top-gun-maverick.jpg', '/uploads/movies/top-gun-maverick-banner.jpg', 'ENDED', ARRAY['Hành động', 'Tâm lý']::text[]),
    ('Frozen II', 'frozen-ii', 'Phim chiếu rạp Mỹ thuộc nhóm hoạt hình, gia đình, giả tưởng.', 'Chris Buck, Jennifer Lee', 'Idina Menzel, Kristen Bell, Josh Gad', 103, '2019-11-22', 'Tiếng Anh', 'Mỹ', 'P', 'https://www.youtube.com/results?search_query=Frozen+II+official+trailer', '/uploads/movies/frozen-ii.jpg', '/uploads/movies/frozen-ii-banner.jpg', 'ENDED', ARRAY['Hoạt hình', 'Gia đình', 'Giả tưởng']::text[]),
    ('Barbie', 'barbie', 'Phim chiếu rạp Mỹ thuộc nhóm hài, phiêu lưu, giả tưởng.', 'Greta Gerwig', 'Margot Robbie, Ryan Gosling, America Ferrera', 114, '2023-07-21', 'Tiếng Anh', 'Mỹ', 'T13', 'https://www.youtube.com/results?search_query=Barbie+official+trailer', '/uploads/movies/barbie.jpg', '/uploads/movies/barbie-banner.jpg', 'ENDED', ARRAY['Hài', 'Phiêu lưu', 'Giả tưởng']::text[]),
    ('Avengers: Age of Ultron', 'avengers-age-of-ultron', 'Phim chiếu rạp Mỹ thuộc nhóm hành động, phiêu lưu, khoa học viễn tưởng.', 'Joss Whedon', 'Robert Downey Jr., Chris Evans, Mark Ruffalo', 141, '2015-05-01', 'Tiếng Anh', 'Mỹ', 'T13', 'https://www.youtube.com/results?search_query=Avengers+Age+of+Ultron+official+trailer', '/uploads/movies/avengers-age-of-ultron.jpg', '/uploads/movies/avengers-age-of-ultron-banner.jpg', 'ENDED', ARRAY['Hành động', 'Phiêu lưu', 'Khoa học viễn tưởng']::text[]),
    ('The Super Mario Bros. Movie', 'the-super-mario-bros-movie', 'Phim chiếu rạp Mỹ thuộc nhóm hoạt hình, gia đình, phiêu lưu.', 'Aaron Horvath, Michael Jelenic', 'Chris Pratt, Anya Taylor-Joy, Jack Black', 92, '2023-04-05', 'Tiếng Anh', 'Mỹ', 'P', 'https://www.youtube.com/results?search_query=The+Super+Mario+Bros+Movie+official+trailer', '/uploads/movies/the-super-mario-bros-movie.jpg', '/uploads/movies/the-super-mario-bros-movie-banner.jpg', 'ENDED', ARRAY['Hoạt hình', 'Gia đình', 'Phiêu lưu']::text[]),
    ('Black Panther', 'black-panther', 'Phim chiếu rạp Mỹ thuộc nhóm hành động, phiêu lưu, khoa học viễn tưởng.', 'Ryan Coogler', 'Chadwick Boseman, Michael B. Jordan, Lupita Nyong''o', 134, '2018-02-16', 'Tiếng Anh', 'Mỹ', 'T13', 'https://www.youtube.com/results?search_query=Black+Panther+official+trailer', '/uploads/movies/black-panther.jpg', '/uploads/movies/black-panther-banner.jpg', 'ENDED', ARRAY['Hành động', 'Phiêu lưu', 'Khoa học viễn tưởng']::text[]),
    ('Harry Potter and the Deathly Hallows: Part 2', 'harry-potter-and-the-deathly-hallows-part-2', 'Phim chiếu rạp Anh, Mỹ thuộc nhóm giả tưởng, phiêu lưu.', 'David Yates', 'Daniel Radcliffe, Emma Watson, Rupert Grint', 130, '2011-07-15', 'Tiếng Anh', 'Anh, Mỹ', 'T13', 'https://www.youtube.com/results?search_query=Harry+Potter+Deathly+Hallows+Part+2+official+trailer', '/uploads/movies/harry-potter-and-the-deathly-hallows-part-2.jpg', '/uploads/movies/harry-potter-and-the-deathly-hallows-part-2-banner.jpg', 'ENDED', ARRAY['Giả tưởng', 'Phiêu lưu']::text[]),
    ('Deadpool & Wolverine', 'deadpool-and-wolverine', 'Phim chiếu rạp Mỹ thuộc nhóm hành động, hài, khoa học viễn tưởng.', 'Shawn Levy', 'Ryan Reynolds, Hugh Jackman, Emma Corrin', 128, '2024-07-26', 'Tiếng Anh', 'Mỹ', 'T18', 'https://www.youtube.com/results?search_query=Deadpool+and+Wolverine+official+trailer', '/uploads/movies/deadpool-and-wolverine.jpg', '/uploads/movies/deadpool-and-wolverine-banner.jpg', 'ENDED', ARRAY['Hành động', 'Hài', 'Khoa học viễn tưởng']::text[]),
    ('Star Wars: The Last Jedi', 'star-wars-the-last-jedi', 'Phim chiếu rạp Mỹ thuộc nhóm khoa học viễn tưởng, phiêu lưu, hành động.', 'Rian Johnson', 'Daisy Ridley, Mark Hamill, Adam Driver', 152, '2017-12-15', 'Tiếng Anh', 'Mỹ', 'T13', 'https://www.youtube.com/results?search_query=Star+Wars+The+Last+Jedi+official+trailer', '/uploads/movies/star-wars-the-last-jedi.jpg', '/uploads/movies/star-wars-the-last-jedi-banner.jpg', 'ENDED', ARRAY['Khoa học viễn tưởng', 'Phiêu lưu', 'Hành động']::text[]),
    ('Jurassic World: Fallen Kingdom', 'jurassic-world-fallen-kingdom', 'Phim chiếu rạp Mỹ thuộc nhóm phiêu lưu, khoa học viễn tưởng, hành động.', 'J.A. Bayona', 'Chris Pratt, Bryce Dallas Howard, Rafe Spall', 128, '2018-06-22', 'Tiếng Anh', 'Mỹ', 'T13', 'https://www.youtube.com/results?search_query=Jurassic+World+Fallen+Kingdom+official+trailer', '/uploads/movies/jurassic-world-fallen-kingdom.jpg', '/uploads/movies/jurassic-world-fallen-kingdom-banner.jpg', 'ENDED', ARRAY['Phiêu lưu', 'Khoa học viễn tưởng', 'Hành động']::text[]),
    ('Frozen', 'frozen', 'Phim chiếu rạp Mỹ thuộc nhóm hoạt hình, gia đình, giả tưởng.', 'Chris Buck, Jennifer Lee', 'Idina Menzel, Kristen Bell, Josh Gad', 102, '2013-11-27', 'Tiếng Anh', 'Mỹ', 'P', 'https://www.youtube.com/results?search_query=Frozen+official+trailer', '/uploads/movies/frozen.jpg', '/uploads/movies/frozen-banner.jpg', 'ENDED', ARRAY['Hoạt hình', 'Gia đình', 'Giả tưởng']::text[]),
    ('Beauty and the Beast', 'beauty-and-the-beast-2017', 'Phim chiếu rạp Mỹ thuộc nhóm gia đình, giả tưởng, tình cảm.', 'Bill Condon', 'Emma Watson, Dan Stevens, Luke Evans', 129, '2017-03-17', 'Tiếng Anh', 'Mỹ', 'P', 'https://www.youtube.com/results?search_query=Beauty+and+the+Beast+2017+official+trailer', '/uploads/movies/beauty-and-the-beast-2017.jpg', '/uploads/movies/beauty-and-the-beast-2017-banner.jpg', 'ENDED', ARRAY['Gia đình', 'Giả tưởng', 'Tình cảm']::text[]),
    ('Incredibles 2', 'incredibles-2', 'Phim chiếu rạp Mỹ thuộc nhóm hoạt hình, gia đình, hành động.', 'Brad Bird', 'Craig T. Nelson, Holly Hunter, Sarah Vowell', 118, '2018-06-15', 'Tiếng Anh', 'Mỹ', 'P', 'https://www.youtube.com/results?search_query=Incredibles+2+official+trailer', '/uploads/movies/incredibles-2.jpg', '/uploads/movies/incredibles-2-banner.jpg', 'ENDED', ARRAY['Hoạt hình', 'Gia đình', 'Hành động']::text[]),
    ('The Fate of the Furious', 'the-fate-of-the-furious', 'Phim chiếu rạp Mỹ thuộc nhóm hành động, tội phạm, giật gân.', 'F. Gary Gray', 'Vin Diesel, Dwayne Johnson, Charlize Theron', 136, '2017-04-14', 'Tiếng Anh', 'Mỹ', 'T13', 'https://www.youtube.com/results?search_query=The+Fate+of+the+Furious+official+trailer', '/uploads/movies/the-fate-of-the-furious.jpg', '/uploads/movies/the-fate-of-the-furious-banner.jpg', 'ENDED', ARRAY['Hành động', 'Tội phạm', 'Giật gân']::text[]),
    ('Iron Man 3', 'iron-man-3', 'Phim chiếu rạp Mỹ thuộc nhóm hành động, phiêu lưu, khoa học viễn tưởng.', 'Shane Black', 'Robert Downey Jr., Gwyneth Paltrow, Don Cheadle', 130, '2013-05-03', 'Tiếng Anh', 'Mỹ', 'T13', 'https://www.youtube.com/results?search_query=Iron+Man+3+official+trailer', '/uploads/movies/iron-man-3.jpg', '/uploads/movies/iron-man-3-banner.jpg', 'ENDED', ARRAY['Hành động', 'Phiêu lưu', 'Khoa học viễn tưởng']::text[]),
    ('Minions', 'minions', 'Phim chiếu rạp Mỹ thuộc nhóm hoạt hình, gia đình, hài.', 'Pierre Coffin, Kyle Balda', 'Sandra Bullock, Jon Hamm, Michael Keaton', 91, '2015-07-10', 'Tiếng Anh', 'Mỹ', 'P', 'https://www.youtube.com/results?search_query=Minions+official+trailer', '/uploads/movies/minions.jpg', '/uploads/movies/minions-banner.jpg', 'ENDED', ARRAY['Hoạt hình', 'Gia đình', 'Hài']::text[]),
    ('Captain America: Civil War', 'captain-america-civil-war', 'Phim chiếu rạp Mỹ thuộc nhóm hành động, phiêu lưu, khoa học viễn tưởng.', 'Anthony Russo, Joe Russo', 'Chris Evans, Robert Downey Jr., Scarlett Johansson', 147, '2016-05-06', 'Tiếng Anh', 'Mỹ', 'T13', 'https://www.youtube.com/results?search_query=Captain+America+Civil+War+official+trailer', '/uploads/movies/captain-america-civil-war.jpg', '/uploads/movies/captain-america-civil-war-banner.jpg', 'ENDED', ARRAY['Hành động', 'Phiêu lưu', 'Khoa học viễn tưởng']::text[]),
    ('Aquaman', 'aquaman', 'Phim chiếu rạp Mỹ thuộc nhóm hành động, phiêu lưu, giả tưởng.', 'James Wan', 'Jason Momoa, Amber Heard, Patrick Wilson', 143, '2018-12-21', 'Tiếng Anh', 'Mỹ', 'T13', 'https://www.youtube.com/results?search_query=Aquaman+official+trailer', '/uploads/movies/aquaman.jpg', '/uploads/movies/aquaman-banner.jpg', 'ENDED', ARRAY['Hành động', 'Phiêu lưu', 'Giả tưởng']::text[]),
    ('The Dark Knight', 'the-dark-knight', 'Phim chiếu rạp Mỹ thuộc nhóm hành động, tội phạm, tâm lý.', 'Christopher Nolan', 'Christian Bale, Heath Ledger, Aaron Eckhart', 152, '2008-07-18', 'Tiếng Anh', 'Mỹ', 'T13', 'https://www.youtube.com/results?search_query=The+Dark+Knight+official+trailer', '/uploads/movies/the-dark-knight.jpg', '/uploads/movies/the-dark-knight-banner.jpg', 'ENDED', ARRAY['Hành động', 'Tội phạm', 'Tâm lý']::text[]),
    ('Joker', 'joker', 'Phim chiếu rạp Mỹ thuộc nhóm tội phạm, tâm lý, giật gân.', 'Todd Phillips', 'Joaquin Phoenix, Robert De Niro, Zazie Beetz', 122, '2019-10-04', 'Tiếng Anh', 'Mỹ', 'T18', 'https://www.youtube.com/results?search_query=Joker+official+trailer', '/uploads/movies/joker.jpg', '/uploads/movies/joker-banner.jpg', 'ENDED', ARRAY['Tội phạm', 'Tâm lý', 'Giật gân']::text[]),
    ('Oppenheimer', 'oppenheimer', 'Phim chiếu rạp Mỹ, Anh thuộc nhóm lịch sử, tâm lý.', 'Christopher Nolan', 'Cillian Murphy, Emily Blunt, Robert Downey Jr.', 180, '2023-07-21', 'Tiếng Anh', 'Mỹ, Anh', 'T16', 'https://www.youtube.com/results?search_query=Oppenheimer+official+trailer', '/uploads/movies/oppenheimer.jpg', '/uploads/movies/oppenheimer-banner.jpg', 'ENDED', ARRAY['Lịch sử', 'Tâm lý']::text[]),
    ('Dune: Part Two', 'dune-part-two', 'Phim chiếu rạp Mỹ thuộc nhóm khoa học viễn tưởng, phiêu lưu, tâm lý.', 'Denis Villeneuve', 'Timothee Chalamet, Zendaya, Rebecca Ferguson', 166, '2024-03-01', 'Tiếng Anh', 'Mỹ', 'T13', 'https://www.youtube.com/results?search_query=Dune+Part+Two+official+trailer', '/uploads/movies/dune-part-two.jpg', '/uploads/movies/dune-part-two-banner.jpg', 'ENDED', ARRAY['Khoa học viễn tưởng', 'Phiêu lưu', 'Tâm lý']::text[]),
    ('Interstellar', 'interstellar', 'Phim chiếu rạp Mỹ, Anh thuộc nhóm khoa học viễn tưởng, phiêu lưu, tâm lý.', 'Christopher Nolan', 'Matthew McConaughey, Anne Hathaway, Jessica Chastain', 169, '2014-11-07', 'Tiếng Anh', 'Mỹ, Anh', 'T13', 'https://www.youtube.com/results?search_query=Interstellar+official+trailer', '/uploads/movies/interstellar.jpg', '/uploads/movies/interstellar-banner.jpg', 'ENDED', ARRAY['Khoa học viễn tưởng', 'Phiêu lưu', 'Tâm lý']::text[]),
    ('Inception', 'inception', 'Phim chiếu rạp Mỹ, Anh thuộc nhóm khoa học viễn tưởng, hành động, giật gân.', 'Christopher Nolan', 'Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page', 148, '2010-07-16', 'Tiếng Anh', 'Mỹ, Anh', 'T13', 'https://www.youtube.com/results?search_query=Inception+official+trailer', '/uploads/movies/inception.jpg', '/uploads/movies/inception-banner.jpg', 'ENDED', ARRAY['Khoa học viễn tưởng', 'Hành động', 'Giật gân']::text[]),
    ('Ne Zha', 'ne-zha', 'Phim chiếu rạp Trung Quốc thuộc nhóm hoạt hình, giả tưởng, phiêu lưu.', 'Yu Yang', 'Lü Yanting, Joseph, Han Mo', 110, '2019-07-26', 'Tiếng Trung', 'Trung Quốc', 'P', 'https://www.youtube.com/results?search_query=Ne+Zha+official+trailer', '/uploads/movies/ne-zha.jpg', '/uploads/movies/ne-zha-banner.jpg', 'ENDED', ARRAY['Hoạt hình', 'Giả tưởng', 'Phiêu lưu']::text[]),
    ('Ne Zha 2', 'ne-zha-2', 'Phim chiếu rạp Trung Quốc thuộc nhóm hoạt hình, giả tưởng, phiêu lưu.', 'Yu Yang', 'Lü Yanting, Han Mo, Chen Hao', 144, '2025-01-29', 'Tiếng Trung', 'Trung Quốc', 'P', 'https://www.youtube.com/results?search_query=Ne+Zha+2+official+trailer', '/uploads/movies/ne-zha-2.jpg', '/uploads/movies/ne-zha-2-banner.jpg', 'ENDED', ARRAY['Hoạt hình', 'Giả tưởng', 'Phiêu lưu']::text[]),
    ('The Wandering Earth', 'the-wandering-earth', 'Phim chiếu rạp Trung Quốc thuộc nhóm khoa học viễn tưởng, hành động, phiêu lưu.', 'Frant Gwo', 'Qu Chuxiao, Li Guangjie, Wu Jing', 125, '2019-02-05', 'Tiếng Trung', 'Trung Quốc', 'T13', 'https://www.youtube.com/results?search_query=The+Wandering+Earth+official+trailer', '/uploads/movies/the-wandering-earth.jpg', '/uploads/movies/the-wandering-earth-banner.jpg', 'ENDED', ARRAY['Khoa học viễn tưởng', 'Hành động', 'Phiêu lưu']::text[]),
    ('The Wandering Earth 2', 'the-wandering-earth-2', 'Phim chiếu rạp Trung Quốc thuộc nhóm khoa học viễn tưởng, hành động, phiêu lưu.', 'Frant Gwo', 'Wu Jing, Andy Lau, Li Xuejian', 173, '2023-01-22', 'Tiếng Trung', 'Trung Quốc', 'T13', 'https://www.youtube.com/results?search_query=The+Wandering+Earth+2+official+trailer', '/uploads/movies/the-wandering-earth-2.jpg', '/uploads/movies/the-wandering-earth-2-banner.jpg', 'ENDED', ARRAY['Khoa học viễn tưởng', 'Hành động', 'Phiêu lưu']::text[]),
    ('Wolf Warrior 2', 'wolf-warrior-2', 'Phim chiếu rạp Trung Quốc thuộc nhóm hành động, chiến tranh, giật gân.', 'Wu Jing', 'Wu Jing, Frank Grillo, Celina Jade', 123, '2017-07-27', 'Tiếng Trung', 'Trung Quốc', 'T16', 'https://www.youtube.com/results?search_query=Wolf+Warrior+2+official+trailer', '/uploads/movies/wolf-warrior-2.jpg', '/uploads/movies/wolf-warrior-2-banner.jpg', 'ENDED', ARRAY['Hành động', 'Chiến tranh', 'Giật gân']::text[]),
    ('Hi, Mom', 'hi-mom', 'Phim chiếu rạp Trung Quốc thuộc nhóm hài, gia đình, tâm lý.', 'Jia Ling', 'Jia Ling, Zhang Xiaofei, Shen Teng', 128, '2021-02-12', 'Tiếng Trung', 'Trung Quốc', 'T13', 'https://www.youtube.com/results?search_query=Hi+Mom+2021+official+trailer', '/uploads/movies/hi-mom.jpg', '/uploads/movies/hi-mom-banner.jpg', 'ENDED', ARRAY['Hài', 'Gia đình', 'Tâm lý']::text[]),
    ('The Battle at Lake Changjin', 'the-battle-at-lake-changjin', 'Phim chiếu rạp Trung Quốc thuộc nhóm chiến tranh, lịch sử, hành động.', 'Chen Kaige, Tsui Hark, Dante Lam', 'Wu Jing, Jackson Yee, Duan Yihong', 176, '2021-09-30', 'Tiếng Trung', 'Trung Quốc', 'T16', 'https://www.youtube.com/results?search_query=The+Battle+at+Lake+Changjin+official+trailer', '/uploads/movies/the-battle-at-lake-changjin.jpg', '/uploads/movies/the-battle-at-lake-changjin-banner.jpg', 'ENDED', ARRAY['Chiến tranh', 'Lịch sử', 'Hành động']::text[]),
    ('Full River Red', 'full-river-red', 'Phim chiếu rạp Trung Quốc thuộc nhóm lịch sử, bí ẩn, hài.', 'Zhang Yimou', 'Shen Teng, Jackson Yee, Zhang Yi', 159, '2023-01-22', 'Tiếng Trung', 'Trung Quốc', 'T16', 'https://www.youtube.com/results?search_query=Full+River+Red+official+trailer', '/uploads/movies/full-river-red.jpg', '/uploads/movies/full-river-red-banner.jpg', 'ENDED', ARRAY['Lịch sử', 'Bí ẩn', 'Hài']::text[]),
    ('Detective Chinatown 3', 'detective-chinatown-3', 'Phim chiếu rạp Trung Quốc thuộc nhóm hài, bí ẩn, tội phạm.', 'Chen Sicheng', 'Wang Baoqiang, Liu Haoran, Satoshi Tsumabuki', 136, '2021-02-12', 'Tiếng Trung', 'Trung Quốc', 'T13', 'https://www.youtube.com/results?search_query=Detective+Chinatown+3+official+trailer', '/uploads/movies/detective-chinatown-3.jpg', '/uploads/movies/detective-chinatown-3-banner.jpg', 'ENDED', ARRAY['Hài', 'Bí ẩn', 'Tội phạm']::text[]),
    ('Crouching Tiger, Hidden Dragon', 'crouching-tiger-hidden-dragon', 'Phim chiếu rạp Đài Loan, Trung Quốc, Hồng Kông thuộc nhóm hành động, phiêu lưu, tình cảm.', 'Ang Lee', 'Chow Yun-fat, Michelle Yeoh, Zhang Ziyi', 120, '2000-12-08', 'Tiếng Trung', 'Đài Loan, Trung Quốc, Hồng Kông', 'T13', 'https://www.youtube.com/results?search_query=Crouching+Tiger+Hidden+Dragon+official+trailer', '/uploads/movies/crouching-tiger-hidden-dragon.jpg', '/uploads/movies/crouching-tiger-hidden-dragon-banner.jpg', 'ENDED', ARRAY['Hành động', 'Phiêu lưu', 'Tình cảm']::text[]),
    ('Kung Fu Hustle', 'kung-fu-hustle', 'Phim chiếu rạp Hồng Kông, Trung Quốc thuộc nhóm hành động, hài, tội phạm.', 'Stephen Chow', 'Stephen Chow, Yuen Wah, Yuen Qiu', 99, '2004-12-23', 'Tiếng Trung', 'Hồng Kông, Trung Quốc', 'T13', 'https://www.youtube.com/results?search_query=Kung+Fu+Hustle+official+trailer', '/uploads/movies/kung-fu-hustle.jpg', '/uploads/movies/kung-fu-hustle-banner.jpg', 'ENDED', ARRAY['Hành động', 'Hài', 'Tội phạm']::text[]),
    ('Dangal', 'dangal', 'Phim chiếu rạp Ấn Độ thuộc nhóm tâm lý, thể thao, gia đình.', 'Nitesh Tiwari', 'Aamir Khan, Fatima Sana Shaikh, Sanya Malhotra', 161, '2016-12-23', 'Tiếng Hindi', 'Ấn Độ', 'T13', 'https://www.youtube.com/results?search_query=Dangal+official+trailer', '/uploads/movies/dangal.jpg', '/uploads/movies/dangal-banner.jpg', 'ENDED', ARRAY['Tâm lý', 'Gia đình']::text[]),
    ('Baahubali 2: The Conclusion', 'baahubali-2-the-conclusion', 'Phim chiếu rạp Ấn Độ thuộc nhóm hành động, phiêu lưu, giả tưởng.', 'S. S. Rajamouli', 'Prabhas, Rana Daggubati, Anushka Shetty', 167, '2017-04-28', 'Tiếng Telugu', 'Ấn Độ', 'T13', 'https://www.youtube.com/results?search_query=Baahubali+2+The+Conclusion+official+trailer', '/uploads/movies/baahubali-2-the-conclusion.jpg', '/uploads/movies/baahubali-2-the-conclusion-banner.jpg', 'ENDED', ARRAY['Hành động', 'Phiêu lưu', 'Giả tưởng']::text[]),
    ('RRR', 'rrr', 'Phim chiếu rạp Ấn Độ thuộc nhóm hành động, tâm lý, lịch sử.', 'S. S. Rajamouli', 'N. T. Rama Rao Jr., Ram Charan, Alia Bhatt', 182, '2022-03-25', 'Tiếng Telugu', 'Ấn Độ', 'T16', 'https://www.youtube.com/results?search_query=RRR+official+trailer', '/uploads/movies/rrr.jpg', '/uploads/movies/rrr-banner.jpg', 'ENDED', ARRAY['Hành động', 'Tâm lý', 'Lịch sử']::text[]),
    ('K.G.F: Chapter 2', 'kgf-chapter-2', 'Phim chiếu rạp Ấn Độ thuộc nhóm hành động, tội phạm, tâm lý.', 'Prashanth Neel', 'Yash, Sanjay Dutt, Raveena Tandon', 168, '2022-04-14', 'Tiếng Kannada', 'Ấn Độ', 'T16', 'https://www.youtube.com/results?search_query=KGF+Chapter+2+official+trailer', '/uploads/movies/kgf-chapter-2.jpg', '/uploads/movies/kgf-chapter-2-banner.jpg', 'ENDED', ARRAY['Hành động', 'Tội phạm', 'Tâm lý']::text[]),
    ('Jawan', 'jawan', 'Phim chiếu rạp Ấn Độ thuộc nhóm hành động, giật gân, tâm lý.', 'Atlee', 'Shah Rukh Khan, Nayanthara, Vijay Sethupathi', 169, '2023-09-07', 'Tiếng Hindi', 'Ấn Độ', 'T16', 'https://www.youtube.com/results?search_query=Jawan+official+trailer', '/uploads/movies/jawan.jpg', '/uploads/movies/jawan-banner.jpg', 'ENDED', ARRAY['Hành động', 'Giật gân', 'Tâm lý']::text[]),
    ('Pathaan', 'pathaan', 'Phim chiếu rạp Ấn Độ thuộc nhóm hành động, giật gân, phiêu lưu.', 'Siddharth Anand', 'Shah Rukh Khan, Deepika Padukone, John Abraham', 146, '2023-01-25', 'Tiếng Hindi', 'Ấn Độ', 'T16', 'https://www.youtube.com/results?search_query=Pathaan+official+trailer', '/uploads/movies/pathaan.jpg', '/uploads/movies/pathaan-banner.jpg', 'ENDED', ARRAY['Hành động', 'Giật gân', 'Phiêu lưu']::text[]),
    ('Pushpa 2: The Rule', 'pushpa-2-the-rule', 'Phim chiếu rạp Ấn Độ thuộc nhóm hành động, tội phạm, tâm lý.', 'Sukumar', 'Allu Arjun, Rashmika Mandanna, Fahadh Faasil', 200, '2024-12-05', 'Tiếng Telugu', 'Ấn Độ', 'T16', 'https://www.youtube.com/results?search_query=Pushpa+2+The+Rule+official+trailer', '/uploads/movies/pushpa-2-the-rule.jpg', '/uploads/movies/pushpa-2-the-rule-banner.jpg', 'ENDED', ARRAY['Hành động', 'Tội phạm', 'Tâm lý']::text[]),
    ('Kalki 2898 AD', 'kalki-2898-ad', 'Phim chiếu rạp Ấn Độ thuộc nhóm khoa học viễn tưởng, hành động, phiêu lưu.', 'Nag Ashwin', 'Prabhas, Amitabh Bachchan, Deepika Padukone', 181, '2024-06-27', 'Tiếng Telugu', 'Ấn Độ', 'T13', 'https://www.youtube.com/results?search_query=Kalki+2898+AD+official+trailer', '/uploads/movies/kalki-2898-ad.jpg', '/uploads/movies/kalki-2898-ad-banner.jpg', 'ENDED', ARRAY['Khoa học viễn tưởng', 'Hành động', 'Phiêu lưu']::text[]),
    ('Bajrangi Bhaijaan', 'bajrangi-bhaijaan', 'Phim chiếu rạp Ấn Độ thuộc nhóm tâm lý, hài, phiêu lưu.', 'Kabir Khan', 'Salman Khan, Harshaali Malhotra, Kareena Kapoor Khan', 159, '2015-07-17', 'Tiếng Hindi', 'Ấn Độ', 'T13', 'https://www.youtube.com/results?search_query=Bajrangi+Bhaijaan+official+trailer', '/uploads/movies/bajrangi-bhaijaan.jpg', '/uploads/movies/bajrangi-bhaijaan-banner.jpg', 'ENDED', ARRAY['Tâm lý', 'Hài', 'Phiêu lưu']::text[]),
    ('3 Idiots', '3-idiots', 'Phim chiếu rạp Ấn Độ thuộc nhóm hài, tâm lý, gia đình.', 'Rajkumar Hirani', 'Aamir Khan, R. Madhavan, Sharman Joshi', 170, '2009-12-25', 'Tiếng Hindi', 'Ấn Độ', 'T13', 'https://www.youtube.com/results?search_query=3+Idiots+official+trailer', '/uploads/movies/3-idiots.jpg', '/uploads/movies/3-idiots-banner.jpg', 'ENDED', ARRAY['Hài', 'Tâm lý', 'Gia đình']::text[]),
    ('Lagaan', 'lagaan', 'Phim chiếu rạp Ấn Độ thuộc nhóm tâm lý, lịch sử, thể thao.', 'Ashutosh Gowariker', 'Aamir Khan, Gracy Singh, Rachel Shelley', 224, '2001-06-15', 'Tiếng Hindi', 'Ấn Độ', 'T13', 'https://www.youtube.com/results?search_query=Lagaan+official+trailer', '/uploads/movies/lagaan.jpg', '/uploads/movies/lagaan-banner.jpg', 'ENDED', ARRAY['Tâm lý', 'Lịch sử']::text[]),
    ('Kantara', 'kantara', 'Phim chiếu rạp Ấn Độ thuộc nhóm hành động, tâm lý, giật gân.', 'Rishab Shetty', 'Rishab Shetty, Sapthami Gowda, Kishore', 150, '2022-09-30', 'Tiếng Kannada', 'Ấn Độ', 'T16', 'https://www.youtube.com/results?search_query=Kantara+official+trailer', '/uploads/movies/kantara.jpg', '/uploads/movies/kantara-banner.jpg', 'ENDED', ARRAY['Hành động', 'Tâm lý', 'Giật gân']::text[]),
    ('Spirited Away', 'spirited-away', 'Phim chiếu rạp Nhật Bản thuộc nhóm anime, giả tưởng, gia đình.', 'Hayao Miyazaki', 'Rumi Hiiragi, Miyu Irino, Mari Natsuki', 125, '2001-07-20', 'Tiếng Nhật', 'Nhật Bản', 'P', 'https://www.youtube.com/results?search_query=Spirited+Away+official+trailer', '/uploads/movies/spirited-away.jpg', '/uploads/movies/spirited-away-banner.jpg', 'ENDED', ARRAY['Anime', 'Giả tưởng', 'Gia đình']::text[]),
    ('Your Name', 'your-name', 'Phim chiếu rạp Nhật Bản thuộc nhóm anime, tình cảm, giả tưởng.', 'Makoto Shinkai', 'Ryunosuke Kamiki, Mone Kamishiraishi, Ryo Narita', 107, '2016-08-26', 'Tiếng Nhật', 'Nhật Bản', 'T13', 'https://www.youtube.com/results?search_query=Your+Name+official+trailer', '/uploads/movies/your-name.jpg', '/uploads/movies/your-name-banner.jpg', 'ENDED', ARRAY['Anime', 'Tình cảm', 'Giả tưởng']::text[]),
    ('Demon Slayer: Mugen Train', 'demon-slayer-mugen-train', 'Phim chiếu rạp Nhật Bản thuộc nhóm anime, hành động, giả tưởng.', 'Haruo Sotozaki', 'Natsuki Hanae, Akari Kito, Hiro Shimono', 117, '2020-10-16', 'Tiếng Nhật', 'Nhật Bản', 'T16', 'https://www.youtube.com/results?search_query=Demon+Slayer+Mugen+Train+official+trailer', '/uploads/movies/demon-slayer-mugen-train.jpg', '/uploads/movies/demon-slayer-mugen-train-banner.jpg', 'ENDED', ARRAY['Anime', 'Hành động', 'Giả tưởng']::text[]),
    ('The First Slam Dunk', 'the-first-slam-dunk', 'Phim chiếu rạp Nhật Bản thuộc nhóm anime, tâm lý, gia đình.', 'Takehiko Inoue', 'Shugo Nakamura, Jun Kasama, Shinichiro Kamio', 124, '2022-12-03', 'Tiếng Nhật', 'Nhật Bản', 'T13', 'https://www.youtube.com/results?search_query=The+First+Slam+Dunk+official+trailer', '/uploads/movies/the-first-slam-dunk.jpg', '/uploads/movies/the-first-slam-dunk-banner.jpg', 'ENDED', ARRAY['Anime', 'Tâm lý', 'Gia đình']::text[]),
    ('Suzume', 'suzume', 'Phim chiếu rạp Nhật Bản thuộc nhóm anime, phiêu lưu, giả tưởng.', 'Makoto Shinkai', 'Nanoka Hara, Hokuto Matsumura, Eri Fukatsu', 122, '2022-11-11', 'Tiếng Nhật', 'Nhật Bản', 'T13', 'https://www.youtube.com/results?search_query=Suzume+official+trailer', '/uploads/movies/suzume.jpg', '/uploads/movies/suzume-banner.jpg', 'ENDED', ARRAY['Anime', 'Phiêu lưu', 'Giả tưởng']::text[]),
    ('Howl''s Moving Castle', 'howls-moving-castle', 'Phim chiếu rạp Nhật Bản thuộc nhóm anime, giả tưởng, phiêu lưu.', 'Hayao Miyazaki', 'Chieko Baisho, Takuya Kimura, Akihiro Miwa', 119, '2004-11-20', 'Tiếng Nhật', 'Nhật Bản', 'P', 'https://www.youtube.com/results?search_query=Howls+Moving+Castle+official+trailer', '/uploads/movies/howls-moving-castle.jpg', '/uploads/movies/howls-moving-castle-banner.jpg', 'ENDED', ARRAY['Anime', 'Giả tưởng', 'Phiêu lưu']::text[]),
    ('Princess Mononoke', 'princess-mononoke', 'Phim chiếu rạp Nhật Bản thuộc nhóm anime, phiêu lưu, giả tưởng.', 'Hayao Miyazaki', 'Yoji Matsuda, Yuriko Ishida, Yuko Tanaka', 134, '1997-07-12', 'Tiếng Nhật', 'Nhật Bản', 'T13', 'https://www.youtube.com/results?search_query=Princess+Mononoke+official+trailer', '/uploads/movies/princess-mononoke.jpg', '/uploads/movies/princess-mononoke-banner.jpg', 'ENDED', ARRAY['Anime', 'Phiêu lưu', 'Giả tưởng']::text[]),
    ('Godzilla Minus One', 'godzilla-minus-one', 'Phim chiếu rạp Nhật Bản thuộc nhóm khoa học viễn tưởng, hành động, tâm lý.', 'Takashi Yamazaki', 'Ryunosuke Kamiki, Minami Hamabe, Yuki Yamada', 125, '2023-11-03', 'Tiếng Nhật', 'Nhật Bản', 'T13', 'https://www.youtube.com/results?search_query=Godzilla+Minus+One+official+trailer', '/uploads/movies/godzilla-minus-one.jpg', '/uploads/movies/godzilla-minus-one-banner.jpg', 'ENDED', ARRAY['Khoa học viễn tưởng', 'Hành động', 'Tâm lý']::text[]),
    ('One Piece Film: Red', 'one-piece-film-red', 'Phim chiếu rạp Nhật Bản thuộc nhóm anime, hành động, phiêu lưu.', 'Goro Taniguchi', 'Mayumi Tanaka, Kaori Nazuka, Shuichi Ikeda', 115, '2022-08-06', 'Tiếng Nhật', 'Nhật Bản', 'T13', 'https://www.youtube.com/results?search_query=One+Piece+Film+Red+official+trailer', '/uploads/movies/one-piece-film-red.jpg', '/uploads/movies/one-piece-film-red-banner.jpg', 'ENDED', ARRAY['Anime', 'Hành động', 'Phiêu lưu']::text[]),
    ('Weathering with You', 'weathering-with-you', 'Phim chiếu rạp Nhật Bản thuộc nhóm anime, tình cảm, giả tưởng.', 'Makoto Shinkai', 'Kotaro Daigo, Nana Mori, Shun Oguri', 112, '2019-07-19', 'Tiếng Nhật', 'Nhật Bản', 'T13', 'https://www.youtube.com/results?search_query=Weathering+with+You+official+trailer', '/uploads/movies/weathering-with-you.jpg', '/uploads/movies/weathering-with-you-banner.jpg', 'ENDED', ARRAY['Anime', 'Tình cảm', 'Giả tưởng']::text[]),
    ('Parasite', 'parasite', 'Phim chiếu rạp Hàn Quốc thuộc nhóm tâm lý, giật gân, hài.', 'Bong Joon Ho', 'Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong', 132, '2019-05-30', 'Tiếng Hàn', 'Hàn Quốc', 'T16', 'https://www.youtube.com/results?search_query=Parasite+official+trailer', '/uploads/movies/parasite.jpg', '/uploads/movies/parasite-banner.jpg', 'ENDED', ARRAY['Tâm lý', 'Giật gân', 'Hài']::text[]),
    ('Train to Busan', 'train-to-busan', 'Phim chiếu rạp Hàn Quốc thuộc nhóm kinh dị, hành động, giật gân.', 'Yeon Sang-ho', 'Gong Yoo, Jung Yu-mi, Ma Dong-seok', 118, '2016-07-20', 'Tiếng Hàn', 'Hàn Quốc', 'T16', 'https://www.youtube.com/results?search_query=Train+to+Busan+official+trailer', '/uploads/movies/train-to-busan.jpg', '/uploads/movies/train-to-busan-banner.jpg', 'ENDED', ARRAY['Kinh dị', 'Hành động', 'Giật gân']::text[]),
    ('The Admiral: Roaring Currents', 'the-admiral-roaring-currents', 'Phim chiếu rạp Hàn Quốc thuộc nhóm chiến tranh, lịch sử, hành động.', 'Kim Han-min', 'Choi Min-sik, Ryu Seung-ryong, Cho Jin-woong', 128, '2014-07-30', 'Tiếng Hàn', 'Hàn Quốc', 'T13', 'https://www.youtube.com/results?search_query=The+Admiral+Roaring+Currents+official+trailer', '/uploads/movies/the-admiral-roaring-currents.jpg', '/uploads/movies/the-admiral-roaring-currents-banner.jpg', 'ENDED', ARRAY['Chiến tranh', 'Lịch sử', 'Hành động']::text[]),
    ('Extreme Job', 'extreme-job', 'Phim chiếu rạp Hàn Quốc thuộc nhóm hài, hành động, tội phạm.', 'Lee Byeong-heon', 'Ryu Seung-ryong, Lee Hanee, Jin Seon-kyu', 111, '2019-01-23', 'Tiếng Hàn', 'Hàn Quốc', 'T13', 'https://www.youtube.com/results?search_query=Extreme+Job+official+trailer', '/uploads/movies/extreme-job.jpg', '/uploads/movies/extreme-job-banner.jpg', 'ENDED', ARRAY['Hài', 'Hành động', 'Tội phạm']::text[]),
    ('Along with the Gods: The Two Worlds', 'along-with-the-gods-the-two-worlds', 'Phim chiếu rạp Hàn Quốc thuộc nhóm giả tưởng, hành động, tâm lý.', 'Kim Yong-hwa', 'Ha Jung-woo, Cha Tae-hyun, Ju Ji-hoon', 139, '2017-12-20', 'Tiếng Hàn', 'Hàn Quốc', 'T13', 'https://www.youtube.com/results?search_query=Along+with+the+Gods+The+Two+Worlds+official+trailer', '/uploads/movies/along-with-the-gods-the-two-worlds.jpg', '/uploads/movies/along-with-the-gods-the-two-worlds-banner.jpg', 'ENDED', ARRAY['Giả tưởng', 'Hành động', 'Tâm lý']::text[]),
    ('Ode to My Father', 'ode-to-my-father', 'Phim chiếu rạp Hàn Quốc thuộc nhóm tâm lý, gia đình, lịch sử.', 'Yoon Je-kyoon', 'Hwang Jung-min, Yunjin Kim, Oh Dal-su', 126, '2014-12-17', 'Tiếng Hàn', 'Hàn Quốc', 'T13', 'https://www.youtube.com/results?search_query=Ode+to+My+Father+official+trailer', '/uploads/movies/ode-to-my-father.jpg', '/uploads/movies/ode-to-my-father-banner.jpg', 'ENDED', ARRAY['Tâm lý', 'Gia đình', 'Lịch sử']::text[]),
    ('Veteran', 'veteran', 'Phim chiếu rạp Hàn Quốc thuộc nhóm hành động, tội phạm, hài.', 'Ryoo Seung-wan', 'Hwang Jung-min, Yoo Ah-in, Yoo Hae-jin', 123, '2015-08-05', 'Tiếng Hàn', 'Hàn Quốc', 'T16', 'https://www.youtube.com/results?search_query=Veteran+Korean+movie+official+trailer', '/uploads/movies/veteran.jpg', '/uploads/movies/veteran-banner.jpg', 'ENDED', ARRAY['Hành động', 'Tội phạm', 'Hài']::text[]),
    ('The Roundup', 'the-roundup', 'Phim chiếu rạp Hàn Quốc thuộc nhóm hành động, tội phạm, giật gân.', 'Lee Sang-yong', 'Ma Dong-seok, Son Suk-ku, Choi Gwi-hwa', 106, '2022-05-18', 'Tiếng Hàn', 'Hàn Quốc', 'T16', 'https://www.youtube.com/results?search_query=The+Roundup+official+trailer', '/uploads/movies/the-roundup.jpg', '/uploads/movies/the-roundup-banner.jpg', 'ENDED', ARRAY['Hành động', 'Tội phạm', 'Giật gân']::text[]),
    ('Exhuma', 'exhuma', 'Phim chiếu rạp Hàn Quốc thuộc nhóm kinh dị, bí ẩn, giật gân.', 'Jang Jae-hyun', 'Choi Min-sik, Kim Go-eun, Yoo Hae-jin', 134, '2024-02-22', 'Tiếng Hàn', 'Hàn Quốc', 'T16', 'https://www.youtube.com/results?search_query=Exhuma+official+trailer', '/uploads/movies/exhuma.jpg', '/uploads/movies/exhuma-banner.jpg', 'ENDED', ARRAY['Kinh dị', 'Bí ẩn', 'Giật gân']::text[]),
    ('A Taxi Driver', 'a-taxi-driver', 'Phim chiếu rạp Hàn Quốc thuộc nhóm tâm lý, lịch sử, hành động.', 'Jang Hoon', 'Song Kang-ho, Thomas Kretschmann, Yoo Hae-jin', 137, '2017-08-02', 'Tiếng Hàn', 'Hàn Quốc', 'T13', 'https://www.youtube.com/results?search_query=A+Taxi+Driver+official+trailer', '/uploads/movies/a-taxi-driver.jpg', '/uploads/movies/a-taxi-driver-banner.jpg', 'ENDED', ARRAY['Tâm lý', 'Lịch sử', 'Hành động']::text[]),
    ('Mai', 'mai', 'Phim chiếu rạp Việt Nam thuộc nhóm tâm lý, tình cảm.', 'Trấn Thành', 'Phương Anh Đào, Tuấn Trần, Trấn Thành', 131, '2024-02-10', 'Tiếng Việt', 'Việt Nam', 'T18', 'https://www.youtube.com/results?search_query=Mai+Tran+Thanh+official+trailer', '/uploads/movies/mai.jpg', '/uploads/movies/mai-banner.jpg', 'ENDED', ARRAY['Tâm lý', 'Tình cảm']::text[]),
    ('The House of No Man', 'the-house-of-no-man', 'Phim chiếu rạp Việt Nam thuộc nhóm hài, tâm lý, gia đình.', 'Trấn Thành', 'Lê Giang, Uyển Ân, Trấn Thành', 102, '2023-01-22', 'Tiếng Việt', 'Việt Nam', 'T16', 'https://www.youtube.com/results?search_query=The+House+of+No+Man+official+trailer', '/uploads/movies/the-house-of-no-man.jpg', '/uploads/movies/the-house-of-no-man-banner.jpg', 'ENDED', ARRAY['Hài', 'Tâm lý', 'Gia đình']::text[]),
    ('Dad, I''m Sorry', 'dad-im-sorry', 'Phim chiếu rạp Việt Nam thuộc nhóm hài, tâm lý, gia đình.', 'Trấn Thành, Vũ Ngọc Đãng', 'Trấn Thành, Tuấn Trần, Ngân Chi', 128, '2021-03-12', 'Tiếng Việt', 'Việt Nam', 'T13', 'https://www.youtube.com/results?search_query=Dad+Im+Sorry+official+trailer', '/uploads/movies/dad-im-sorry.jpg', '/uploads/movies/dad-im-sorry-banner.jpg', 'ENDED', ARRAY['Hài', 'Tâm lý', 'Gia đình']::text[]),
    ('Furie', 'furie', 'Phim chiếu rạp Việt Nam thuộc nhóm hành động, tội phạm, giật gân.', 'Lê Văn Kiệt', 'Ngô Thanh Vân, Phan Thanh Nhiên, Mai Cát Vi', 98, '2019-02-22', 'Tiếng Việt', 'Việt Nam', 'T16', 'https://www.youtube.com/results?search_query=Furie+Hai+Phuong+official+trailer', '/uploads/movies/furie.jpg', '/uploads/movies/furie-banner.jpg', 'ENDED', ARRAY['Hành động', 'Tội phạm', 'Giật gân']::text[]),
    ('Face Off 7: One Wish', 'face-off-7-one-wish', 'Phim chiếu rạp Việt Nam thuộc nhóm tâm lý, gia đình.', 'Lý Hải', 'Thanh Hiền, Trương Minh Cường, Đinh Y Nhung', 138, '2024-04-26', 'Tiếng Việt', 'Việt Nam', 'T13', 'https://www.youtube.com/results?search_query=Face+Off+7+One+Wish+official+trailer', '/uploads/movies/face-off-7-one-wish.jpg', '/uploads/movies/face-off-7-one-wish-banner.jpg', 'ENDED', ARRAY['Tâm lý', 'Gia đình']::text[]),
    ('Face Off 6: The Ticket of Destiny', 'face-off-6-the-ticket-of-destiny', 'Phim chiếu rạp Việt Nam thuộc nhóm hành động, hài, tâm lý.', 'Lý Hải', 'Quốc Cường, Trung Dũng, Huy Khánh', 132, '2023-04-28', 'Tiếng Việt', 'Việt Nam', 'T16', 'https://www.youtube.com/results?search_query=Face+Off+6+The+Ticket+of+Destiny+official+trailer', '/uploads/movies/face-off-6-the-ticket-of-destiny.jpg', '/uploads/movies/face-off-6-the-ticket-of-destiny-banner.jpg', 'ENDED', ARRAY['Hành động', 'Hài', 'Tâm lý']::text[]),
    ('Dreamy Eyes', 'dreamy-eyes', 'Phim chiếu rạp Việt Nam thuộc nhóm tình cảm, tâm lý.', 'Victor Vũ', 'Trần Nghĩa, Trúc Anh, Khánh Vân', 117, '2019-12-20', 'Tiếng Việt', 'Việt Nam', 'T13', 'https://www.youtube.com/results?search_query=Dreamy+Eyes+Mat+Biec+official+trailer', '/uploads/movies/dreamy-eyes.jpg', '/uploads/movies/dreamy-eyes-banner.jpg', 'ENDED', ARRAY['Tình cảm', 'Tâm lý']::text[]),
    ('Yellow Flowers on the Green Grass', 'yellow-flowers-on-the-green-grass', 'Phim chiếu rạp Việt Nam thuộc nhóm tâm lý, gia đình, tình cảm.', 'Victor Vũ', 'Thịnh Vinh, Trọng Khang, Lâm Thanh Mỹ', 103, '2015-10-02', 'Tiếng Việt', 'Việt Nam', 'P', 'https://www.youtube.com/results?search_query=Yellow+Flowers+on+the+Green+Grass+official+trailer', '/uploads/movies/yellow-flowers-on-the-green-grass.jpg', '/uploads/movies/yellow-flowers-on-the-green-grass-banner.jpg', 'ENDED', ARRAY['Tâm lý', 'Gia đình', 'Tình cảm']::text[]),
    ('Amelie', 'amelie', 'Phim chiếu rạp Pháp thuộc nhóm tình cảm, hài, tâm lý.', 'Jean-Pierre Jeunet', 'Audrey Tautou, Mathieu Kassovitz, Rufus', 122, '2001-04-25', 'Tiếng Pháp', 'Pháp', 'T13', 'https://www.youtube.com/results?search_query=Amelie+official+trailer', '/uploads/movies/amelie.jpg', '/uploads/movies/amelie-banner.jpg', 'ENDED', ARRAY['Tình cảm', 'Hài', 'Tâm lý']::text[]),
    ('The Intouchables', 'the-intouchables', 'Phim chiếu rạp Pháp thuộc nhóm hài, tâm lý.', 'Olivier Nakache, Eric Toledano', 'Francois Cluzet, Omar Sy, Anne Le Ny', 112, '2011-11-02', 'Tiếng Pháp', 'Pháp', 'T13', 'https://www.youtube.com/results?search_query=The+Intouchables+official+trailer', '/uploads/movies/the-intouchables.jpg', '/uploads/movies/the-intouchables-banner.jpg', 'ENDED', ARRAY['Hài', 'Tâm lý']::text[]),
    ('The King''s Speech', 'the-kings-speech', 'Phim chiếu rạp Anh thuộc nhóm lịch sử, tâm lý.', 'Tom Hooper', 'Colin Firth, Geoffrey Rush, Helena Bonham Carter', 118, '2010-09-06', 'Tiếng Anh', 'Anh', 'T13', 'https://www.youtube.com/results?search_query=The+Kings+Speech+official+trailer', '/uploads/movies/the-kings-speech.jpg', '/uploads/movies/the-kings-speech-banner.jpg', 'ENDED', ARRAY['Lịch sử', 'Tâm lý']::text[]),
    ('Life Is Beautiful', 'life-is-beautiful', 'Phim chiếu rạp Ý thuộc nhóm hài, tâm lý, chiến tranh.', 'Roberto Benigni', 'Roberto Benigni, Nicoletta Braschi, Giorgio Cantarini', 116, '1997-12-20', 'Tiếng Ý', 'Ý', 'T13', 'https://www.youtube.com/results?search_query=Life+Is+Beautiful+official+trailer', '/uploads/movies/life-is-beautiful.jpg', '/uploads/movies/life-is-beautiful-banner.jpg', 'ENDED', ARRAY['Hài', 'Tâm lý', 'Chiến tranh']::text[]),
    ('Cinema Paradiso', 'cinema-paradiso', 'Phim chiếu rạp Ý thuộc nhóm tâm lý, tình cảm.', 'Giuseppe Tornatore', 'Philippe Noiret, Salvatore Cascio, Marco Leonardi', 155, '1988-11-17', 'Tiếng Ý', 'Ý', 'T13', 'https://www.youtube.com/results?search_query=Cinema+Paradiso+official+trailer', '/uploads/movies/cinema-paradiso.jpg', '/uploads/movies/cinema-paradiso-banner.jpg', 'ENDED', ARRAY['Tâm lý', 'Tình cảm']::text[]),
    ('Pan''s Labyrinth', 'pans-labyrinth', 'Phim chiếu rạp Tây Ban Nha, Mexico thuộc nhóm giả tưởng, tâm lý, chiến tranh.', 'Guillermo del Toro', 'Ivana Baquero, Sergi Lopez, Maribel Verdu', 118, '2006-10-11', 'Tiếng Tây Ban Nha', 'Tây Ban Nha, Mexico', 'T16', 'https://www.youtube.com/results?search_query=Pans+Labyrinth+official+trailer', '/uploads/movies/pans-labyrinth.jpg', '/uploads/movies/pans-labyrinth-banner.jpg', 'ENDED', ARRAY['Giả tưởng', 'Tâm lý', 'Chiến tranh']::text[]),
    ('The Secret in Their Eyes', 'the-secret-in-their-eyes', 'Phim chiếu rạp Argentina thuộc nhóm bí ẩn, tội phạm, tâm lý.', 'Juan Jose Campanella', 'Ricardo Darin, Soledad Villamil, Pablo Rago', 129, '2009-08-13', 'Tiếng Tây Ban Nha', 'Argentina', 'T16', 'https://www.youtube.com/results?search_query=The+Secret+in+Their+Eyes+official+trailer', '/uploads/movies/the-secret-in-their-eyes.jpg', '/uploads/movies/the-secret-in-their-eyes-banner.jpg', 'ENDED', ARRAY['Bí ẩn', 'Tội phạm', 'Tâm lý']::text[]),
    ('City of God', 'city-of-god', 'Phim chiếu rạp Brazil thuộc nhóm tội phạm, tâm lý.', 'Fernando Meirelles, Katia Lund', 'Alexandre Rodrigues, Leandro Firmino, Matheus Nachtergaele', 130, '2002-08-30', 'Tiếng Bồ Đào Nha', 'Brazil', 'T18', 'https://www.youtube.com/results?search_query=City+of+God+official+trailer', '/uploads/movies/city-of-god.jpg', '/uploads/movies/city-of-god-banner.jpg', 'ENDED', ARRAY['Tội phạm', 'Tâm lý']::text[]),
    ('Elite Squad', 'elite-squad', 'Phim chiếu rạp Brazil thuộc nhóm hành động, tội phạm, giật gân.', 'Jose Padilha', 'Wagner Moura, Caio Junqueira, Andre Ramiro', 115, '2007-10-05', 'Tiếng Bồ Đào Nha', 'Brazil', 'T18', 'https://www.youtube.com/results?search_query=Elite+Squad+official+trailer', '/uploads/movies/elite-squad.jpg', '/uploads/movies/elite-squad-banner.jpg', 'ENDED', ARRAY['Hành động', 'Tội phạm', 'Giật gân']::text[]),
    ('The Raid', 'the-raid', 'Phim chiếu rạp Indonesia thuộc nhóm hành động, tội phạm, giật gân.', 'Gareth Evans', 'Iko Uwais, Joe Taslim, Donny Alamsyah', 101, '2011-09-08', 'Tiếng Indonesia', 'Indonesia', 'T18', 'https://www.youtube.com/results?search_query=The+Raid+official+trailer', '/uploads/movies/the-raid.jpg', '/uploads/movies/the-raid-banner.jpg', 'ENDED', ARRAY['Hành động', 'Tội phạm', 'Giật gân']::text[]),
    ('Bad Genius', 'bad-genius', 'Phim chiếu rạp Thái Lan thuộc nhóm giật gân, tội phạm, tâm lý.', 'Nattawut Poonpiriya', 'Chutimon Chuengcharoensukying, Chanon Santinatornkul, Teeradon Supapunpinyo', 130, '2017-05-03', 'Tiếng Thái', 'Thái Lan', 'T13', 'https://www.youtube.com/results?search_query=Bad+Genius+official+trailer', '/uploads/movies/bad-genius.jpg', '/uploads/movies/bad-genius-banner.jpg', 'ENDED', ARRAY['Giật gân', 'Tội phạm', 'Tâm lý']::text[]),
    ('Anatomy of a Fall', 'anatomy-of-a-fall', 'Phim chiếu rạp Pháp thuộc nhóm tâm lý, tội phạm, bí ẩn.', 'Justine Triet', 'Sandra Huller, Swann Arlaud, Milo Machado-Graner', 152, '2023-08-23', 'Tiếng Pháp', 'Pháp', 'T16', 'https://www.youtube.com/results?search_query=Anatomy+of+a+Fall+official+trailer', '/uploads/movies/anatomy-of-a-fall.jpg', '/uploads/movies/anatomy-of-a-fall-banner.jpg', 'ENDED', ARRAY['Tâm lý', 'Tội phạm', 'Bí ẩn']::text[]),
    ('Portrait of a Lady on Fire', 'portrait-of-a-lady-on-fire', 'Phim chiếu rạp Pháp thuộc nhóm tâm lý, tình cảm, lịch sử.', 'Celine Sciamma', 'Noemie Merlant, Adele Haenel, Luana Bajrami', 122, '2019-09-18', 'Tiếng Pháp', 'Pháp', 'T16', 'https://www.youtube.com/results?search_query=Portrait+of+a+Lady+on+Fire+official+trailer', '/uploads/movies/portrait-of-a-lady-on-fire.jpg', '/uploads/movies/portrait-of-a-lady-on-fire-banner.jpg', 'ENDED', ARRAY['Tâm lý', 'Tình cảm', 'Lịch sử']::text[]),
    ('Incendies', 'incendies', 'Phim chiếu rạp Canada thuộc nhóm tâm lý, bí ẩn, chiến tranh.', 'Denis Villeneuve', 'Lubna Azabal, Melissa Desormeaux-Poulin, Maxim Gaudette', 131, '2010-09-17', 'Tiếng Pháp', 'Canada', 'T16', 'https://www.youtube.com/results?search_query=Incendies+official+trailer', '/uploads/movies/incendies.jpg', '/uploads/movies/incendies-banner.jpg', 'ENDED', ARRAY['Tâm lý', 'Bí ẩn', 'Chiến tranh']::text[])
),
upserted_movies AS (
  INSERT INTO movies (
    title,
    slug,
    description,
    director,
    actors,
    duration,
    "releaseDate",
    language,
    country,
    "ageLimit",
    "trailerUrl",
    "posterUrl",
    "bannerUrl",
    status,
    "createdAt",
    "updatedAt"
  )
  SELECT
    title,
    slug,
    description,
    director,
    actors,
    duration,
    release_date::date,
    language,
    country,
    age_limit,
    trailer_url,
    poster_url,
    banner_url,
    status::"MovieStatus",
    NOW(),
    NOW()
  FROM movie_seed
  ON CONFLICT (slug) DO UPDATE
  SET title = EXCLUDED.title,
      description = EXCLUDED.description,
      director = EXCLUDED.director,
      actors = EXCLUDED.actors,
      duration = EXCLUDED.duration,
      "releaseDate" = EXCLUDED."releaseDate",
      language = EXCLUDED.language,
      country = EXCLUDED.country,
      "ageLimit" = EXCLUDED."ageLimit",
      "trailerUrl" = EXCLUDED."trailerUrl",
      "posterUrl" = EXCLUDED."posterUrl",
      "bannerUrl" = EXCLUDED."bannerUrl",
      status = EXCLUDED.status,
      "updatedAt" = NOW()
  RETURNING id, slug
)
INSERT INTO movie_genres ("movieId", "genreId")
SELECT um.id, g.id
FROM upserted_movies um
JOIN movie_seed ms ON ms.slug = um.slug
JOIN genres g ON g.name = ANY(ms.genres)
ON CONFLICT ("movieId", "genreId") DO NOTHING;

WITH ranked_movies AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY RANDOM()) AS row_number
  FROM movies
),
movie_status_updates AS (
  SELECT
    id,
    CASE
      WHEN row_number <= 40 THEN 'NOW_SHOWING'::"MovieStatus"
      WHEN row_number <= 60 THEN 'COMING_SOON'::"MovieStatus"
      ELSE 'ENDED'::"MovieStatus"
    END AS status
  FROM ranked_movies
)
UPDATE movies m
SET status = msu.status,
    "updatedAt" = NOW()
FROM movie_status_updates msu
WHERE m.id = msu.id;

UPDATE movie_images mi
SET "imageUrl" = '/movies/' ||
    CASE m.status
      WHEN 'NOW_SHOWING' THEN 'now-showing'
      WHEN 'COMING_SOON' THEN 'coming-soon'
      ELSE 'ended'
    END || '/' || m.slug || '.jpg',
    "altText" = m.title,
    "sortOrder" = 0,
    "updatedAt" = NOW()
FROM movies m
WHERE mi."movieId" = m.id
  AND mi."sortOrder" = 0;

INSERT INTO movie_images (
  "movieId",
  "imageUrl",
  "altText",
  "sortOrder",
  "createdAt",
  "updatedAt"
)
SELECT
  m.id,
  '/movies/' ||
    CASE m.status
      WHEN 'NOW_SHOWING' THEN 'now-showing'
      WHEN 'COMING_SOON' THEN 'coming-soon'
      ELSE 'ended'
    END || '/' || m.slug || '.jpg',
  m.title,
  0,
  NOW(),
  NOW()
FROM movies m
WHERE NOT EXISTS (
  SELECT 1
  FROM movie_images mi
  WHERE mi."movieId" = m.id
    AND mi."sortOrder" = 0
);

DELETE FROM movie_images
WHERE "sortOrder" <> 0;

INSERT INTO cinemas (
  name,
  slug,
  address,
  city,
  phone,
  email,
  description,
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'CineX Vinh',
    'cinex-vinh',
    '182 Lê Duẩn, TP Vinh, Nghệ An',
    'Vinh',
    '0238000001',
    'vinh@cinex.com',
    'Rạp CineX tại thành phố Vinh',
    NOW(),
    NOW()
  ),
  (
    'CineX Hà Nội',
    'cinex-ha-noi',
    'Cầu Giấy, Hà Nội',
    'Hà Nội',
    '0240000001',
    'hanoi@cinex.com',
    'Rạp CineX tại Hà Nội',
    NOW(),
    NOW()
  )
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    description = EXCLUDED.description,
    "updatedAt" = NOW();

INSERT INTO rooms (
  "cinemaId",
  name,
  "totalRows",
  "totalColumns",
  "totalSeats",
  status,
  "createdAt",
  "updatedAt"
)
SELECT c.id, room_data.name, room_data.total_rows, room_data.total_columns,
       room_data.total_rows * room_data.total_columns, 'ACTIVE', NOW(), NOW()
FROM cinemas c
JOIN (
  VALUES
    ('cinex-vinh', 'Phòng 1', 8, 10),
    ('cinex-vinh', 'Phòng 2', 10, 10)
) AS room_data(cinema_slug, name, total_rows, total_columns)
ON c.slug = room_data.cinema_slug
ON CONFLICT ("cinemaId", name) DO UPDATE
SET "totalRows" = EXCLUDED."totalRows",
    "totalColumns" = EXCLUDED."totalColumns",
    "totalSeats" = EXCLUDED."totalSeats",
    status = EXCLUDED.status,
    "updatedAt" = NOW();

INSERT INTO seat_types (name, description, "priceExtra", "createdAt", "updatedAt")
VALUES
  ('NORMAL', 'Ghế thường', 0, NOW(), NOW()),
  ('VIP', 'Ghế VIP', 20000, NOW(), NOW()),
  ('COUPLE', 'Ghế đôi', 40000, NOW(), NOW())
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description,
    "priceExtra" = EXCLUDED."priceExtra",
    "updatedAt" = NOW();

WITH target_room AS (
  SELECT r.id
  FROM rooms r
  JOIN cinemas c ON c.id = r."cinemaId"
  WHERE c.slug = 'cinex-vinh' AND r.name = 'Phòng 1'
),
seat_rows(row_name) AS (
  VALUES ('A'), ('B'), ('C'), ('D'), ('E'), ('F'), ('G'), ('H')
),
seat_numbers AS (
  SELECT row_name, generate_series(1, 10) AS seat_number
  FROM seat_rows
),
seat_source AS (
  SELECT
    tr.id AS room_id,
    CASE
      WHEN sn.row_name IN ('F', 'G', 'H') THEN vip.id
      ELSE normal.id
    END AS seat_type_id,
    sn.row_name,
    sn.seat_number,
    sn.row_name || sn.seat_number::text AS seat_code
  FROM target_room tr
  CROSS JOIN seat_numbers sn
  CROSS JOIN seat_types normal
  CROSS JOIN seat_types vip
  WHERE normal.name = 'NORMAL' AND vip.name = 'VIP'
)
INSERT INTO seats (
  "roomId",
  "seatTypeId",
  "rowName",
  "seatNumber",
  "seatCode",
  status,
  "createdAt",
  "updatedAt"
)
SELECT room_id, seat_type_id, row_name, seat_number, seat_code, 'ACTIVE', NOW(), NOW()
FROM seat_source
ON CONFLICT ("roomId", "seatCode") DO UPDATE
SET "seatTypeId" = EXCLUDED."seatTypeId",
    "rowName" = EXCLUDED."rowName",
    "seatNumber" = EXCLUDED."seatNumber",
    status = EXCLUDED.status,
    "updatedAt" = NOW();

COMMIT;
