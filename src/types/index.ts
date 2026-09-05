// ─── Database Model Types ──────────────────────────────────────────────────

export interface Project {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  techStack: string; // Comma-separated list of technologies
  projectUrl?: string | null;
  features?: string | null; // Kelebihan & Keunggulan (bullet points / newline separated)
  createdAt: string; // ISO string from API
}

export interface Admin {
  id: number;
  username: string;
}

export interface WebsiteSetting {
  id: number;
  siteName: string;
  ownerName: string;
  roleTitle: string;
  heroTitle: string;
  heroSubtitle: string;
  contactEmail: string;
  githubUrl: string;
  discordUrl: string;
  whatsappUrl: string;
  logoUrl?: string | null;
  resumePdfUrl?: string | null;
  aboutMe?: string | null;
  isCvActive?: boolean;
}

export interface Experience {
  id: number;
  company: string;
  position: string;
  period: string;
  location?: string | null;
  description: string;
  order: number;
  createdAt?: string;
}

export interface Education {
  id: number;
  institution: string;
  degree: string;
  period: string;
  description?: string | null;
  order: number;
  createdAt?: string;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  iconName?: string | null;
  order: number;
  createdAt?: string;
}

export interface SkillCategory {
  id: number;
  name: string;
  order: number;
  createdAt?: string;
}

// ─── API Response Types ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// ─── Dashboard Stats (client-side computed) ────────────────────────────────

export interface DashboardStats {
  totalProjects: number;
  techStackCount: number;
  activeDemos: number;
  systemStatus: string;
}
