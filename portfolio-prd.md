# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Website Portofolio & Dashboard Admin Minimalis

---

### 🔎 1. Ringkasan & Tujuan Proyek
*   **Nama Proyek:** Website Portofolio Ringan & Dashboard Admin Minimalis
*   **Tujuan:** Membangun website portofolio pribadi yang memiliki performa tinggi, ringan, dan profesional, dilengkapi dengan halaman dashboard admin internal yang aman dan intuitif untuk mengelola konten.
*   **Target Utama:** Memastikan kecepatan *loading* website berada di level maksimal, menggunakan struktur kode semantik yang bersih, serta menerapkan standar UI/UX modern tanpa membebani ukuran performa website.

---

### 📊 2. Batasan Teknologi & Arsitektur
AI Agent wajib mematuhi arsitektur teknologi berikut tanpa menambahkan library UI pihak ketiga yang berat:
*   **Framework:** Next.js (App Router, arsitektur server-first React)
*   **Styling:** Tailwind CSS (Wajib menggunakan utility classes bawaan, dilarang memakai library CSS eksternal)
*   **Database ORM:** Prisma ORM yang terhubung ke database **MySQL**
*   **Komponen UI:** Primitif Radix UI via arsitektur Shadcn UI (seluruh file komponen dasar wajib diletakkan langsung di dalam folder `src/components/ui`)

---

### ✨ 3. Identitas Visual & Sistem Desain (UI/UX)
Desain wajib mengikuti estetika tema gelap (*dark mode*) yang **minimalis, modern, dan profesional** menggunakan palet warna Hitam & Biru:
*   **Latar Belakang Utama:** Hitam Pekat (Halaman Utama: `zinc-950` / `#09090b`, Kartu/Konten: `zinc-900` / `#18181b`)
*   **Tipografi:** Font sans-serif yang bersih dengan kontras tinggi (`zinc-50` untuk judul, `zinc-400` untuk teks deskripsi)
*   **Warna Aksen & Brand:** Biru Elektrik (`blue-500` / `#3b82f6` atau `blue-600` / `#2563eb`) yang digunakan secara eksklusif untuk tombol CTA (*Call-to-Action*), border, efek *hover* interaktif, dan navigasi aktif.
*   **Transisi:** Animasi CSS yang cepat, halus, dan ringan (`duration-200 ease-in-out`).

---

### 📌 4. Struktur Folder Absolut Repositori
AI Agent harus membuat file-file proyek yang patuh sepenuhnya pada pohon struktur di bawah ini:
```text
my-portfolio/
├── prisma/
│   ├── schema.prisma             # Definisi skema MySQL (Model Project & Admin)
│   └── migrations/               # Catatan riwayat perubahan/migrasi database
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Layout global, setup font, metadata, dan Tailwind
│   │   ├── page.tsx              # Halaman Utama Portofolio Publik (Server Component)
│   │   ├── projects/[id]/page.tsx# Halaman Detail Proyek Publik (Dynamic Route)
│   │   ├── login/page.tsx        # Halaman Form Login Admin yang Aman
│   │   ├── admin/
│   │   │   ├── layout.tsx        # Layout Admin (Menampilkan Sidebar Admin persisten)
│   │   │   ├── page.tsx          # Dashboard Utama / Ringkasan Statistik Data
│   │   │   ├── add/page.tsx      # Form Tambah Proyek Baru
│   │   │   └── edit/[id]/page.tsx# Form Edit Data Proyek yang Sudah Ada
│   │   └── api/
│   │       ├── auth/route.ts     # API Handler untuk Sesi Login/Logout Admin
│   │       └── projects/
│   │           ├── route.ts      # Action GET (Ambil Semua) & POST (Tambah Baru) ke MySQL
│   │           └── [id]/route.ts # Action PUT (Update) & DELETE (Hapus) di MySQL
│   ├── components/
│   │   ├── ui/                   # Komponen Atom UI (Button, Input, Card) via Shadcn
│   │   ├── Navbar.tsx            # Navigasi Header Publik (Hybrid Client/Server)
│   │   ├── SidebarAdmin.tsx      # Menu Navigasi Samping Khusus Panel Admin
│   │   └── ProjectCard.tsx       # Komponen Kartu Tampilan Proyek Portofolio
│   ├── lib/
│   │   └── prisma.ts             # Inisialisasi Singleton Prisma Client untuk MySQL
│   └── types/
│       └── index.ts              # Interface Core TypeScript
├── .env                          # File Rahasia / Environment Variables (DATABASE_URL)
└── tailwind.config.ts            # Kustomisasi tema warna hitam-biru proyek
```

---

### ➡️ 5. Persyaratan Fungsional & Fitur

#### A. Modul Portofolio Publik
*   **Komponen Hero:** Kalimat pembuka (*headline*), sub-teks profesional, tautan media sosial, dan tombol CTA utama beraksen warna biru.
*   **Grid Galeri Proyek:** Komponen dinamis yang mengambil konten langsung dari database MySQL. Menampilkan gambar proyek, deskripsi singkat, tag teknologi (*tech stack*), serta tombol interaktif menuju tautan/URL demo proyek.
*   **Halaman Detail Proyek:** Halaman dinamis khusus untuk membaca dokumentasi atau ulasan lengkap mengenai satu proyek yang dipilih.

#### B. Modul Dashboard Admin & CMS (Protected)
*   **Portal Autentikasi:** Validasi *username* dan *password* yang dikirimkan secara aman melalui Next.js API Routes ke database, kemudian menyimpan sesi login admin yang ringan.
*   **Dashboard Manajemen:** Halaman ringkasan data, tampilan tabel daftar seluruh proyek yang ada di database, serta tombol aksi cepat untuk menghapus data.
*   **Formulir CRUD:** Form interaktif yang bersih untuk memproses penambahan (Create) dan perubahan (Update) kolom data proyek (`title`, `description`, `imageUrl`, `techStack`, `projectUrl`).

---

### 📈 6. Desain Skema Database (Prisma ORM)
Pastikan struktur database terpetakan secara langsung ke MySQL menggunakan format skema berikut:
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Project {
  id          Int      @id @default(autoincrement())
  title       String
  description String   @db.Text
  imageUrl    String
  techStack   String   
  projectUrl  String?  
  createdAt   DateTime @default(now())
}

model Admin {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String   
}
```

---

### ⚠️ 7. Tolak Ukur Kualitas & Performa Kode
*   **React Server Components (RSC):** Gunakan RSC sebagai standar utama saat mengambil (*fetch*) data dari database guna meminimalkan ukuran file JavaScript yang dikirim ke browser pengguna.
*   **Optimasi Gambar:** Semua gambar portofolio wajib dirender menggunakan komponen bawaan `<Image />` dari Next.js agar dikompresi otomatis ke format WebP dan menerapkan fitur *lazy-loading*.
*   **Manajemen Koneksi Database:** Terapkan pola *Singleton* pada inisialisasi Prisma Client di file `src/lib/prisma.ts` demi mencegah terjadinya penumpukan koneksi (*connection pool exhaustion*) ke MySQL saat melakukan perubahan kode di tahap *development*.