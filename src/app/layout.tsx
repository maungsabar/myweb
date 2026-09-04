import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { VisitorTracker } from "@/components/VisitorTracker";
import { prisma } from "@/lib/prisma";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await prisma.websiteSetting.findFirst();
    const siteName = settings?.siteName || "DevPortfolio";
    const roleTitle = settings?.roleTitle || "Website Portofolio & Dashboard Admin";
    const logoUrl = settings?.logoUrl;

    return {
      title: `${siteName} | ${roleTitle}`,
      description: settings?.heroSubtitle || "Website Portofolio profesional modern dark mode dengan dashboard admin manajemen proyek.",
      icons: logoUrl
        ? {
            icon: logoUrl,
            shortcut: logoUrl,
            apple: logoUrl,
          }
        : undefined,
    };
  } catch {
    return {
      title: "DevPortfolio | Website Portofolio & Dashboard Admin Minimalis",
      description: "Website Portofolio profesional modern dark mode dengan dashboard admin manajemen proyek.",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark scroll-smooth">
      <body
        className={`${montserrat.variable} font-sans bg-zinc-950 text-zinc-50 antialiased selection:bg-blue-500/30 selection:text-blue-200 min-h-screen pb-16 md:pb-0`}
      >
        <VisitorTracker />
        {children}
      </body>
    </html>
  );
}
