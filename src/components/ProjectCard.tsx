"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, ArrowRight, Layers, Calendar } from "lucide-react";
import { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Parse tech stack comma string into array
  const techStackList = project.techStack
    ? project.techStack.split(",").map((tech) => tech.trim()).filter(Boolean)
    : [];

  return (
    <article className="group relative flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-200 ease-in-out">
      {/* Image Preview Header */}
      <div className="relative h-48 w-full overflow-hidden bg-zinc-950">
        <img
          src={project.imageUrl}
          alt={project.title}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-all duration-500 ease-in-out"
          onError={(e) => {
            // Fallback placeholder image if URL fails
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-80" />
        
        {/* Date Tag Overlay */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-zinc-950/80 px-2.5 py-1 text-[10px] font-mono font-medium text-zinc-300 backdrop-blur-sm border border-zinc-800">
          <Calendar className="h-3 w-3 text-blue-400" />
          {project.createdAt}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
        <div className="space-y-2.5">
          <h3 className="text-lg font-bold text-zinc-50 group-hover:text-blue-400 transition-all duration-200 ease-in-out tracking-tight">
            {project.title}
          </h3>

          <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Tech Stack Pills */}
        <div className="pt-2">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 mb-2">
            <Layers className="h-3.5 w-3.5 text-blue-500" />
            <span>Teknologi:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {techStackList.map((tech, idx) => (
              <span
                key={idx}
                className="rounded-md bg-zinc-800/80 border border-zinc-700/50 px-2 py-0.5 text-[11px] font-mono font-medium text-zinc-300 hover:border-blue-500/40 transition-all duration-200 ease-in-out"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-3">
          {project.projectUrl ? (
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-all duration-200 ease-in-out"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Demo Langsung
            </a>
          ) : (
            <span className="text-[11px] font-mono text-zinc-400 italic">
              Demo Internal
            </span>
          )}

          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600/10 border border-blue-500/30 px-3 py-1.5 text-xs font-medium text-blue-400 hover:bg-blue-600 hover:text-white transition-all duration-200 ease-in-out"
          >
            Detail Proyek
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
