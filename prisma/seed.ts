/**
 * Prisma Seed Script
 * Jalankan: npx prisma db seed
 * atau:     npm run db:seed
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai proses seeding database...");

  // ─── 1. Buat Admin Default ─────────────────────────────────────────────────
  const existingAdmin = await prisma.admin.findUnique({
    where: { username: "admin" },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 12);
    await prisma.admin.create({
      data: {
        username: "admin",
        password: hashedPassword,
      },
    });
    console.log("✅ Admin default berhasil dibuat (username: admin | password: admin123)");
  } else {
    console.log("ℹ️  Admin sudah ada, skip.");
  }

  // ─── 2. Buat Website Settings Default ─────────────────────────────────────
  const existingSettings = await prisma.websiteSetting.findFirst();

  if (!existingSettings) {
    await prisma.websiteSetting.create({
      data: {
        siteName: "DevPortfolio",
        ownerName: "John Doe",
        roleTitle: "Senior Full Stack Developer",
        heroTitle: "Membangun Solusi Digital Modern, Cepat & Presisi.",
        heroSubtitle:
          "Saya seorang Senior Full Stack Developer yang berfokus pada pengembangan aplikasi web performa tinggi, desain UI/UX minimalis dark mode, serta arsitektur kode modular yang mudah dikembangkan.",
        contactEmail: "developer@example.com",
        githubUrl: "https://github.com",
        discordUrl: "https://discord.com",
        whatsappUrl: "https://wa.me/6281234567890",
        aboutMe:
          "Seorang Full Stack Developer berpengalaman lebih dari 5 tahun dalam merancang dan mengembangkan aplikasi web berskala enterprise. Memiliki keahlian mendalam pada ekosistem React, Next.js, Node.js, TypeScript, serta manajemen database relasional (MySQL/PostgreSQL) dan arsitektur RESTful/GraphQL API.",
      },
    });
    console.log("✅ Website settings default berhasil dibuat.");
  } else {
    console.log("ℹ️  Website settings sudah ada, skip.");
  }

  // ─── 3. Buat Sample Projects ───────────────────────────────────────────────
  const projectCount = await prisma.project.count();

  if (projectCount === 0) {
    const projects = [
      {
        title: "E-Commerce Platform",
        description:
          "Multi-vendor platform dengan manajemen inventaris real-time, checkout Stripe yang seamless, dan arsitektur scalable menggunakan Next.js 14 App Router.",
        imageUrl:
          "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop",
        techStack: "Next.js, TypeScript, Prisma, MySQL, Stripe, Tailwind CSS",
        projectUrl: null,
      },
      {
        title: "AI Dashboard Analytics",
        description:
          "Dashboard analitik berbasis AI dengan visualisasi data real-time, prediksi tren menggunakan ML models, dan antarmuka yang intuitif untuk tim bisnis.",
        imageUrl:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
        techStack: "React, Python, FastAPI, TensorFlow, Chart.js, PostgreSQL",
        projectUrl: null,
      },
      {
        title: "Task Management App",
        description:
          "Aplikasi manajemen tugas kolaboratif dengan fitur real-time updates menggunakan WebSocket, drag & drop kanban board, dan notifikasi push.",
        imageUrl:
          "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=800&auto=format&fit=crop",
        techStack: "React, Node.js, Socket.io, Redis, MongoDB, Docker",
        projectUrl: null,
      },
    ];

    for (const project of projects) {
      await prisma.project.create({ data: project });
    }

    console.log(`✅ ${projects.length} sample proyek berhasil dibuat.`);
  } else {
    console.log(`ℹ️  Sudah ada ${projectCount} proyek, skip sample data.`);
  }

  // ─── 4. Buat Sample Experiences ────────────────────────────────────────────
  const expCount = await prisma.experience.count();

  if (expCount === 0) {
    const sampleExps = [
      {
        company: "PT Digital Solusi Utama",
        position: "Senior Full Stack Developer",
        period: "Jan 2022 - Sekarang",
        location: "Jakarta, Indonesia (Hybrid)",
        description:
          "Memimpin pengembangan arsitektur frontend & backend untuk platform e-commerce enterprise. Mengoptimalkan performa halaman hingga 40% dan mengelola integrasi payment gateway serta microservices berbasis Node.js.",
        order: 1,
      },
      {
        company: "Tekno Creative Studio",
        position: "Frontend Web Developer",
        period: "Jul 2019 - Des 2021",
        location: "Bandung, Indonesia",
        description:
          "Merancang antarmuka web interaktif dark mode menggunakan React, Redux, dan Tailwind CSS untuk 15+ klien startup internasional. Bertanggung jawab atas kualitas UI/UX dan standar aksesibilitas web.",
        order: 2,
      },
    ];

    for (const exp of sampleExps) {
      await prisma.experience.create({ data: exp });
    }
    console.log(`✅ ${sampleExps.length} sample pengalaman kerja berhasil dibuat.`);
  } else {
    console.log(`ℹ️  Sudah ada ${expCount} pengalaman kerja, skip sample data.`);
  }

  // ─── 5. Buat Sample Educations ─────────────────────────────────────────────
  const eduCount = await prisma.education.count();

  if (eduCount === 0) {
    const sampleEdus = [
      {
        institution: "Universitas Indonesia",
        degree: "S1 Teknik Informatika / Ilmu Komputer",
        period: "2015 - 2019",
        description:
          "Lulus dengan predikat Cum Laude (IPK 3.82). Aktif sebagai Ketua Himpunan Mahasiswa Komputer dan kontributor proyek open source kampus.",
        order: 1,
      },
    ];

    for (const edu of sampleEdus) {
      await prisma.education.create({ data: edu });
    }
    console.log(`✅ ${sampleEdus.length} sample pendidikan berhasil dibuat.`);
  } else {
    console.log(`ℹ️  Sudah ada ${eduCount} riwayat pendidikan, skip sample data.`);
  }

  // ─── 6. Buat Sample Skills & Categories ────────────────────────────────────
  const categoryCount = await prisma.skillCategory.count();

  if (categoryCount === 0) {
    const sampleCategories = [
      { name: "Programming & Web Development", order: 1 },
      { name: "Networking & Security", order: 2 },
      { name: "Database & Cloud Infrastructure", order: 3 },
      { name: "Tools & DevOps", order: 4 },
      { name: "Soft Skills & Leadership", order: 5 },
    ];

    for (const cat of sampleCategories) {
      await prisma.skillCategory.create({ data: cat });
    }
    console.log(`✅ ${sampleCategories.length} sample kategori keahlian berhasil dibuat.`);
  }

  const skillCount = await prisma.skill.count();

  if (skillCount === 0) {
    const sampleSkills = [
      // Programming & Web
      { name: "Next.js", category: "Programming & Web Development", iconName: "Code", order: 1 },
      { name: "React.js", category: "Programming & Web Development", iconName: "Code", order: 2 },
      { name: "TypeScript", category: "Programming & Web Development", iconName: "Code", order: 3 },
      { name: "Tailwind CSS", category: "Programming & Web Development", iconName: "Code", order: 4 },
      { name: "Node.js / Express", category: "Programming & Web Development", iconName: "Code", order: 5 },
      { name: "Python", category: "Programming & Web Development", iconName: "Code", order: 6 },
      
      // Networking & Infrastructure
      { name: "Cisco Networking", category: "Networking & Security", iconName: "Network", order: 7 },
      { name: "MikroTik RouterOS", category: "Networking & Security", iconName: "Network", order: 8 },
      { name: "TCP/IP & Subnetting", category: "Networking & Security", iconName: "Network", order: 9 },
      { name: "Firewall & VPN Security", category: "Networking & Security", iconName: "Shield", order: 10 },
      
      // Database & DevOps
      { name: "MySQL / MariaDB", category: "Database & Cloud Infrastructure", iconName: "Database", order: 11 },
      { name: "PostgreSQL", category: "Database & Cloud Infrastructure", iconName: "Database", order: 12 },
      { name: "Docker & Container", category: "Database & Cloud Infrastructure", iconName: "Server", order: 13 },
      { name: "Linux Server Administration", category: "Database & Cloud Infrastructure", iconName: "Server", order: 14 },
    ];

    for (const skill of sampleSkills) {
      await prisma.skill.create({ data: skill });
    }
    console.log(`✅ ${sampleSkills.length} sample keahlian (skills) berhasil dibuat.`);
  } else {
    console.log(`ℹ️  Sudah ada ${skillCount} keahlian terdaftar, skip sample data.`);
  }

  // ─── 7. Buat Sample Visitor Logs ────────────────────────────────────────────
  const logCount = await prisma.visitorLog.count();

  if (logCount === 0) {
    const locations = [
      { country: "Indonesia", city: "Jakarta" },
      { country: "Indonesia", city: "Bandung" },
      { country: "Indonesia", city: "Surabaya" },
      { country: "Indonesia", city: "Medan" },
      { country: "Singapore", city: "Singapore" },
      { country: "Japan", city: "Tokyo" },
      { country: "United States", city: "San Francisco" },
      { country: "United Kingdom", city: "London" },
      { country: "Australia", city: "Sydney" },
    ];

    const paths = ["/", "/#projects", "/cv", "/#skills", "/#contact"];
    const devices = ["Desktop", "Mobile", "Tablet"];

    const now = new Date();
    const logsToCreate = [];

    // Create 150+ realistic log entries spread across past 12 months & today
    for (let i = 0; i < 180; i++) {
      const daysAgo = Math.floor(Math.random() * 365);
      const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 3600 * 1000);
      
      const loc = locations[Math.floor(Math.random() * locations.length)];
      const path = paths[Math.floor(Math.random() * paths.length)];
      const device = devices[Math.floor(Math.random() * devices.length)];
      const ip = `180.252.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

      logsToCreate.push({
        ip,
        country: loc.country,
        city: loc.city,
        device,
        path,
        createdAt,
      });
    }

    // Add some logs for today specifically
    for (let i = 0; i < 15; i++) {
      const minutesAgo = Math.floor(Math.random() * 720);
      const createdAt = new Date(now.getTime() - minutesAgo * 60 * 1000);
      const loc = locations[Math.floor(Math.random() * 4)]; // Mostly Indonesia today
      const path = paths[Math.floor(Math.random() * paths.length)];

      logsToCreate.push({
        ip: `180.252.12.${i + 10}`,
        country: loc.country,
        city: loc.city,
        device: i % 2 === 0 ? "Desktop" : "Mobile",
        path,
        createdAt,
      });
    }

    for (const log of logsToCreate) {
      await prisma.visitorLog.create({ data: log });
    }

    console.log(`✅ ${logsToCreate.length} sample visitor log kunjungan berhasil dibuat.`);
  } else {
    console.log(`ℹ️  Sudah ada ${logCount} log kunjungan terdaftar, skip sample data.`);
  }

  console.log("\n🎉 Seeding selesai!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📌 Kredensial Login Admin:");
  console.log("   Username : admin");
  console.log("   Password : admin123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((error) => {
    console.error("❌ Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
