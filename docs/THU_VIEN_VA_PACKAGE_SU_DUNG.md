# Thu vien va package su dung trong project CineX

Ngay ra soat: 2026-06-19

## Pham vi ra soat

- Project co 2 ung dung Node.js rieng: `backend` va `frontend`.
- Nguon kiem tra chinh: `backend/package.json`, `backend/package-lock.json`, `frontend/package.json`, `frontend/package-lock.json`.
- Da doi chieu them cac lenh `import`/`require` trong ma nguon TypeScript/JavaScript.
- Bang duoi liet ke cac package truc tiep duoc khai bao trong `package.json`. Cac package phu thuoc gian tiep duoc quan ly day du trong `package-lock.json`.

## Tong quan cong nghe

| Thanh phan | Cong nghe / thu vien chinh |
| --- | --- |
| Backend | Node.js, TypeScript chay bang `tsx`, Prisma ORM, PostgreSQL, bcrypt |
| Frontend | Next.js, React, TypeScript, Tailwind CSS, ESLint, lucide-react, react-icons |
| Database | PostgreSQL, schema va migration quan ly bang Prisma |

## Backend

Thu muc: `backend`

### Dependencies

| Package | Version khai bao | Version lockfile | Vai tro |
| --- | --- | --- | --- |
| `@prisma/adapter-pg` | `^7.8.0` | `7.8.0` | Adapter ket noi Prisma voi PostgreSQL thong qua driver `pg`. |
| `@prisma/client` | `^7.8.0` | `7.8.0` | Prisma Client de truy van database va su dung cac enum/type sinh tu schema. |
| `bcrypt` | `^6.0.0` | `6.0.0` | Bam va kiem tra mat khau nguoi dung. |
| `pg` | `^8.20.0` | `8.20.0` | PostgreSQL driver cho Node.js, duoc Prisma adapter su dung. |

### DevDependencies

| Package | Version khai bao | Version lockfile | Vai tro |
| --- | --- | --- | --- |
| `@types/bcrypt` | `^6.0.0` | `6.0.0` | TypeScript type definitions cho `bcrypt`. |
| `@types/pg` | `^8.20.0` | `8.20.0` | TypeScript type definitions cho `pg`. |
| `prisma` | `^7.8.0` | `7.8.0` | Prisma CLI/config, migration va seed database. |
| `tsx` | `^4.21.0` | `4.21.0` | Chay file TypeScript truc tiep trong moi truong Node.js. |

### Package duoc import truc tiep nhung chua khai bao truc tiep

| Package | Dang duoc dung o dau | Ghi chu |
| --- | --- | --- |
| `dotenv` | `backend/src/server.ts`, `backend/prisma.config.ts`, `backend/prisma/seed/client.ts` | Dang co trong `package-lock.json` duoi dang phu thuoc gian tiep cua Prisma, nhung chua co trong `backend/package.json`. Neu project import truc tiep `dotenv/config`, nen khai bao `dotenv` trong `dependencies` hoac `devDependencies` de tranh phu thuoc ngam vao package khac. |

### Module Node.js built-in duoc dung

| Module | Vai tro |
| --- | --- |
| `node:crypto` | Tao byte ngau nhien/token. |
| `node:fs` va `node:fs/promises` | Kiem tra thu muc, tao thu muc, ghi file upload/asset. |
| `node:http` | Tao HTTP server backend. |
| `node:path` | Xu ly duong dan file. |
| `node:url` | Xu ly URL/request path. |

### Scripts lien quan

| Script | Lenh | Muc dich |
| --- | --- | --- |
| `dev` | `tsx watch src/server.ts` | Chay backend o che do development va tu dong reload khi file thay doi. |
| `start` | `tsx src/server.ts` | Chay backend. |
| `seed` | `tsx prisma/seed/seed.ts` | Nap du lieu mau vao database. |
| `test` | `echo "Error: no test specified" && exit 1` | Chua co test script thuc te. |

## Frontend

Thu muc: `frontend`

### Dependencies

| Package | Version khai bao | Version lockfile | Vai tro |
| --- | --- | --- | --- |
| `lucide-react` | `^1.14.0` | `1.14.0` | Thu vien icon SVG cho React, duoc dung nhieu trong UI admin/site. |
| `next` | `16.2.4` | `16.2.4` | Framework React dung App Router, routing, build va server rendering. |
| `react` | `19.2.4` | `19.2.4` | Thu vien UI chinh. |
| `react-dom` | `19.2.4` | `19.2.4` | Renderer DOM cho React/Next.js. |
| `react-icons` | `^5.6.0` | `5.6.0` | Thu vien icon bo sung, dang duoc dung trong footer. |

### DevDependencies

| Package | Version khai bao | Version lockfile | Vai tro |
| --- | --- | --- | --- |
| `@tailwindcss/postcss` | `^4` | `4.2.4` | Plugin PostCSS cho Tailwind CSS 4. |
| `@types/node` | `^20` | `20.19.39` | TypeScript type definitions cho Node.js. |
| `@types/react` | `^19` | `19.2.14` | TypeScript type definitions cho React. |
| `@types/react-dom` | `^19` | `19.2.3` | TypeScript type definitions cho React DOM. |
| `eslint` | `^9` | `9.39.4` | Cong cu lint code. |
| `eslint-config-next` | `16.2.4` | `16.2.4` | Cau hinh ESLint chuan cua Next.js, gom Core Web Vitals va TypeScript. |
| `tailwindcss` | `^4` | `4.2.4` | Framework CSS utility-first cho giao dien. |
| `typescript` | `^5` | `5.9.3` | Ngon ngu va type-checking cho project. |

### Scripts lien quan

| Script | Lenh | Muc dich |
| --- | --- | --- |
| `dev` | `node scripts/set-dev-session.mjs && next dev` | Thiet lap session dev roi chay Next.js development server. |
| `build` | `next build` | Build frontend production. |
| `start` | `next start` | Chay frontend sau khi build. |
| `lint` | `eslint` | Kiem tra lint. |

## Package import thuc te qua ma nguon

Ket qua quet cac file `.ts`, `.tsx`, `.js`, `.mjs` cho thay cac package/module sau duoc import truc tiep:

| Package / module | Khu vuc su dung |
| --- | --- |
| `@prisma/adapter-pg` | Backend server va seed client. |
| `@prisma/client` | Backend server va seed client. |
| `bcrypt` | Backend server va seed users. |
| `dotenv` | Backend server, Prisma config va seed client. |
| `eslint` | Frontend ESLint config. |
| `eslint-config-next` | Frontend ESLint config. |
| `lucide-react` | Nhieu component va page frontend. |
| `next` | Next config, app pages, image/navigation types va runtime helpers. |
| `node:crypto` | Backend server. |
| `node:fs` | Backend server, seed metadata, frontend dev-session script. |
| `node:http` | Backend server. |
| `node:path` | Backend server, seed metadata, frontend dev-session script. |
| `node:url` | Backend server. |
| `prisma` | Backend Prisma config. |
| `react` | Nhieu component va page frontend. |
| `react-icons` | Frontend footer. |

## Phu thuoc gian tiep trong lockfile

| Thanh phan | So package gian tiep/trong lockfile |
| --- | ---: |
| `backend/package-lock.json` | 152 package trong `node_modules` |
| `frontend/package-lock.json` | 430 package trong `node_modules` |

Ghi chu: Khong nen sua tay cac package gian tiep trong `package-lock.json`; chung se duoc cap nhat thong qua `npm install`, `npm update` hoac khi thay doi dependency truc tiep trong `package.json`.

