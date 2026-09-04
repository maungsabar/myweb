"use client";

import React, { useState } from "react";
import { Sparkles, Search, Code2 } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import { Project } from "@/types";

interface ProjectGridProps {
  initialProjects: Project[];
}

export function ProjectGrid({ initialProjects }: ProjectGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState<string>("All");

  const filteredProjects = initialProjects.filter((project) => {
    const matchesQuery =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.techStack.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTech =
      selectedTech === "All" ||
      project.techStack.toLowerCase().includes(selectedTech.toLowerCase());

    return matchesQuery && matchesTech;
  });

  const allTechStacks = ["All", "Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "Python"];

  return (
    <section id="projects" className="py-16 sm:py-20 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header & Filter */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/80 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              Galeri Karya
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50 tracking-tight">
              Proyek Unggulan Portofolio
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              Kumpulan proyek nyata yang telah saya rancang dan bangun dengan standar kualitas kode tinggi.
            </p>
          </div>

          {/* Search input & Filter Pill */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari proyek atau tech..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 rounded-lg bg-zinc-900 border border-zinc-800 pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
              />
            </div>
          </div>
        </div>

        {/* Tech Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs text-zinc-400 font-medium mr-1 flex-shrink-0">Filter:</span>
          {allTechStacks.map((tech) => (
            <button
              key={tech}
              onClick={() => setSelectedTech(tech)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-200 ease-in-out ${
                selectedTech === tech
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              {tech}
            </button>
          ))}
        </div>

        {/* Project Cards Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-12 text-center space-y-3">
            <Code2 className="mx-auto h-10 w-10 text-zinc-400" />
            <h3 className="text-base font-semibold text-zinc-200">Tidak ada proyek yang sesuai</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Coba ubah kata kunci pencarian atau reset filter teknologi.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedTech("All");
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-all duration-200 ease-in-out"
            >
              Reset Filter
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
