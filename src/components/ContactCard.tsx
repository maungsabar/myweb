"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2, Copy, MessageSquare, PhoneCall, ExternalLink } from "lucide-react";

interface ContactCardProps {
  contactEmail: string;
  discordUrl?: string | null;
  whatsappUrl?: string | null;
}

export function ContactCard({ contactEmail, discordUrl, whatsappUrl }: ContactCardProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    if (contactEmail) {
      navigator.clipboard.writeText(contactEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4 bg-zinc-950/80 p-4 sm:p-6 rounded-xl border border-zinc-800">
      {/* Email Row */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800/80">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] sm:text-xs text-zinc-400 font-medium">Email Utama</span>
            <span className="text-xs sm:text-sm font-semibold text-zinc-200 truncate">
              {contactEmail}
            </span>
          </div>
        </div>

        <button
          onClick={handleCopyEmail}
          className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md bg-blue-600/10 border border-blue-500/30 text-[11px] sm:text-xs font-semibold text-blue-400 hover:bg-blue-600 hover:text-white transition-all duration-200 ease-in-out flex items-center gap-1 flex-shrink-0"
        >
          {copiedEmail ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copiedEmail ? "Tersalin!" : "Salin Email"}</span>
        </button>
      </div>

      {/* Discord Row */}
      {discordUrl && (
        <a
          href={discordUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800/80 hover:border-indigo-500/40 transition-all duration-200 ease-in-out group"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400 flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] sm:text-xs text-zinc-400 font-medium">Komunitas Discord</span>
              <span className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-indigo-400 transition-colors truncate">
                {discordUrl.replace("https://", "")}
              </span>
            </div>
          </div>
          <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-400 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
        </a>
      )}

      {/* WhatsApp Row */}
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800/80 hover:border-green-500/40 transition-all duration-200 ease-in-out group"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <PhoneCall className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] sm:text-xs text-zinc-400 font-medium">Chat WhatsApp Direct</span>
              <span className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-green-400 transition-colors truncate">
                {whatsappUrl.replace("https://", "")}
              </span>
            </div>
          </div>
          <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-400 group-hover:text-green-400 transition-colors flex-shrink-0" />
        </a>
      )}
    </div>
  );
}
