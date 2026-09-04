"use client";

import React, { useState } from "react";
import { 
  Terminal, 
  Code, 
  Network, 
  Shield, 
  Database, 
  Server, 
  Cpu, 
  Globe, 
  Wrench,
  Sparkles,
  Layers
} from "lucide-react";
import { Skill } from "@/types";

interface SkillsSectionProps {
  initialSkills: Skill[];
}

export function SkillsSection({ initialSkills }: SkillsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Extract unique categories
  const categories = ["All", ...Array.from(new Set(initialSkills.map((s) => s.category)))];

  // Filter skills by selected category
  const filteredSkills = initialSkills.filter(
    (skill) => selectedCategory === "All" || skill.category === selectedCategory
  );

  const renderSkillIcon = (iconName?: string | null) => {
    switch (iconName) {
      case "Network":
        return <Network className="h-3.5 w-3.5 text-cyan-400" />;
      case "Shield":
        return <Shield className="h-3.5 w-3.5 text-green-400" />;
      case "Database":
        return <Database className="h-3.5 w-3.5 text-yellow-400" />;
      case "Server":
        return <Server className="h-3.5 w-3.5 text-purple-400" />;
      case "Cpu":
        return <Cpu className="h-3.5 w-3.5 text-orange-400" />;
      case "Globe":
        return <Globe className="h-3.5 w-3.5 text-teal-400" />;
      case "Wrench":
        return <Wrench className="h-3.5 w-3.5 text-rose-400" />;
      default:
        return <Code className="h-3.5 w-3.5 text-blue-400" />;
    }
  };

  return (
    <section id="skills" className="py-12 sm:py-16 border-b border-zinc-800/60 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Section Header Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-500 flex-shrink-0 shadow-inner">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-zinc-100 flex items-center gap-2">
                Keahlian Teknis
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Web Development, jaringan komputer dan tools pendukung.
              </p>
            </div>
          </div>

          {/* Category Selector Tabs */}
          {categories.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto p-1.5 max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white border border-blue-400/50 shadow-md shadow-blue-600/30 font-bold"
                      : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80"
                  }`}
                >
                  {cat === "All" ? "Semua Keahlian" : cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Skills Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="group relative flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 hover:border-blue-500/50 hover:bg-zinc-900 transition-all duration-200 ease-out shadow-sm hover:shadow-blue-950/30"
            >
              <div className="h-8 w-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                {renderSkillIcon(skill.iconName)}
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-zinc-200 group-hover:text-white truncate transition-colors">
                  {skill.name}
                </span>
                <span className="text-[10px] text-zinc-400 truncate mt-0.5">
                  {skill.category}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
