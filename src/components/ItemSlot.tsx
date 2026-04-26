"use client"

import * as React from "react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { MapPin } from "lucide-react"

interface ItemSlotProps {
  name: string;
  wiki_url?: string;
  chamberName: string;
  chamberId?: number | null;
  chamberItemCount?: number | null;
}

export function ItemSlot({ name, wiki_url, chamberName, chamberId, chamberItemCount }: ItemSlotProps) {
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
        <TooltipContent side="top" className="bg-[#1D1D1D] border-2 border-[#555] text-white p-3 flex flex-col gap-1.5 max-w-[300px] shadow-xl z-50">
          <div className="text-[#FF55FF] font-bold text-lg tracking-wide">
            {name}
          </div>
          <div className="flex items-start gap-2 text-[#55FFFF] text-sm font-medium italic">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="flex flex-col">
              <span>Stored in: {chamberName}</span>
              {chamberId !== null && chamberId !== undefined && (
                <span className="text-[#AAAAAA] mt-1">
                  Chamber {chamberId}/22 • {chamberItemCount} items total
                </span>
              )}
            </div>
          </div>
          {wiki_url && (
             <div className="mt-2 text-xs text-[#AAAAAA] italic text-center border-t border-white/10 pt-2">
              Click to view Wiki profile
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

ItemSlot.displayName = "ItemSlot";
