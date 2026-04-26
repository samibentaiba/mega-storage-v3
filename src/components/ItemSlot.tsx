"use client"

import * as React from "react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { MapPin } from "lucide-react"

interface ItemSlotProps {
  name: string;
  wiki_url?: string;
  chamberName: string;
}

export function ItemSlot({ name, wiki_url, chamberName }: ItemSlotProps) {
  const wikiName = name
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .trim()
    .replace(/ /g, '_');
  const iconUrl = `https://minecraft.wiki/images/Invicon_${wikiName}.png`;

  const renderIcon = () => {
    if (!name) return null;
    return (
      <div className="flex items-center justify-center w-full h-full group-hover:scale-110 transition-transform">
        <img 
          src={iconUrl} 
          alt={name}
          className="w-7 h-7 object-contain pixelated"
          onError={(e) => {
            // Fallback if the Invicon doesn't exist
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-muted text-[8px] font-bold">${name.substring(0, 2).toUpperCase()}</div>`;
          }}
        />
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <a 
            href={wiki_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mc-slot cursor-help transition-all group p-[2px] block no-underline"
          >
            {renderIcon()}
          </a>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-[#1D1D1D] border-2 border-[#555] text-white p-2 flex flex-col gap-1 max-w-[200px]">
          <div className="text-[#FF55FF] font-bold text-sm tracking-wide">
            {name}
          </div>
          <div className="flex items-start gap-1.5 text-[#55FFFF] text-[10px] font-medium italic">
            <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
            <span>Stored in: {chamberName}</span>
          </div>
          {wiki_url && (
            <div className="mt-1 text-[9px] text-[#AAAAAA] italic text-center border-t border-white/10 pt-1">
              Click to view Wiki profile
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
