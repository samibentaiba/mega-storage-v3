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
  chamberSide?: 'left' | 'right' | null;
  chamberPosition?: number | null;
}

// Auto-detected via scratch/check-broken-images.js — items where the wiki icon
// filename differs from the standard Invicon_{Name}.png pattern.
// Value options:
//   "BaseName"          → https://minecraft.wiki/images/Invicon_{BaseName}.png
//   "BaseName.gif"      → https://minecraft.wiki/images/Invicon_{BaseName}.gif
//   "https://..."       → full URL used as-is
const ICON_OVERRIDES: Record<string, string> = {
  // ── Renamed / old names ──────────────────────────────────────────────────
  'Steak':                                 'Cooked_Beef',
  'Chain':                                 'Iron_Chain',
  'Redstone Dust':                         'Redstone',
  'Smooth Quartz Block':                   'Smooth_Quartz',
  'Copper Torch':                          'Copper_Torch_JE2_BE2',
  'Netherite Upgrade Smithing Template':   'Netherite_Upgrade',
  // ── Animated .gif icons ──────────────────────────────────────────────────
  'Nether Star':                           'Nether_Star.gif',
  'Magma Block':                           'Magma_Block.gif',
  'Sculk Vein':                            'Sculk_Vein.gif',
  'Warped Stem':                           'Warped_Stem.gif',
  'Crimson Stem':                          'Crimson_Stem.gif',
  'Crimson Hyphae':                        'Crimson_Hyphae.gif',
  'Warped Hyphae':                         'Warped_Hyphae.gif',
  'Prismarine':                            'Prismarine.gif',
  'Prismarine Slab':                       'Prismarine_Slab.gif',
  'Prismarine Stairs':                     'Prismarine_Stairs.gif',
  'Prismarine Wall':                       'Prismarine_Wall.gif',
  'Stonecutter':                           'Stonecutter.gif',
  'Sea Lantern':                           'Sea_Lantern.gif',
  'Sculk Sensor':                          'Sculk_Sensor.gif',
  'Calibrated Sculk Sensor':               'Calibrated_Sculk_Sensor.gif',
  'Compass':                               'Compass.gif',
  'Clock':                                 'Clock.gif',
  'Recovery Compass':                      'Recovery_Compass.gif',
  'Enchanted Golden Apple':                'Enchanted_Golden_Apple.gif',
  'End Crystal':                           'End_Crystal.gif',
  "Bottle o' Enchanting":                  "Bottle_o%27_Enchanting.gif",
  // ── Waxed copper items (wiki uses the non-waxed icon) ────────────────────
  'Waxed Block of Copper':                 'Block_of_Copper',
  'Waxed Cut Copper':                      'Cut_Copper',
  'Waxed Cut Copper Slab':                 'Cut_Copper_Slab',
  'Waxed Cut Copper Stairs':               'Cut_Copper_Stairs',
  'Waxed Exposed Cut Copper':              'Exposed_Cut_Copper',
  'Waxed Exposed Cut Copper Slab':         'Exposed_Cut_Copper_Slab',
  'Waxed Exposed Cut Copper Stairs':       'Exposed_Cut_Copper_Stairs',
  'Waxed Oxidized Cut Copper':             'Oxidized_Cut_Copper',
  'Waxed Oxidized Cut Copper Slab':        'Oxidized_Cut_Copper_Slab',
  'Waxed Oxidized Cut Copper Stairs':      'Oxidized_Cut_Copper_Stairs',
  'Waxed Weathered Cut Copper':            'Weathered_Cut_Copper',
  'Waxed Weathered Cut Copper Slab':       'Weathered_Cut_Copper_Slab',
  'Waxed Weathered Cut Copper Stairs':     'Weathered_Cut_Copper_Stairs',
  'Waxed Copper Bulb':                     'Copper_Bulb',
  'Waxed Exposed Copper Bulb':             'Exposed_Copper_Bulb',
  'Waxed Oxidized Copper Bulb':            'Oxidized_Copper_Bulb',
  'Waxed Weathered Copper Bulb':           'Weathered_Copper_Bulb',
  'Waxed Copper Door':                     'Copper_Door',
  'Waxed Exposed Copper Door':             'Exposed_Copper_Door',
  'Waxed Oxidized Copper Door':            'Oxidized_Copper_Door',
  'Waxed Weathered Copper Door':           'Weathered_Copper_Door',
  'Waxed Copper Trapdoor':                 'Copper_Trapdoor',
  'Waxed Exposed Copper Trapdoor':         'Exposed_Copper_Trapdoor',
  'Waxed Oxidized Copper Trapdoor':        'Oxidized_Copper_Trapdoor',
  'Waxed Weathered Copper Trapdoor':       'Weathered_Copper_Trapdoor',
  'Waxed Chiseled Copper':                 'Chiseled_Copper',
  'Waxed Exposed Chiseled Copper':         'Exposed_Chiseled_Copper',
  'Waxed Oxidized Chiseled Copper':        'Oxidized_Chiseled_Copper',
  'Waxed Weathered Chiseled Copper':       'Weathered_Chiseled_Copper',
  'Waxed Copper Grate':                    'Copper_Grate',
  'Waxed Exposed Copper Grate':            'Exposed_Copper_Grate',
  'Waxed Oxidized Copper Grate':           'Oxidized_Copper_Grate',
  'Waxed Weathered Copper Grate':          'Weathered_Copper_Grate',
  'Waxed Copper Chain':                    'Copper_Chain',
  'Waxed Exposed Copper Chain':            'Exposed_Copper_Chain',
  'Waxed Oxidized Copper Chain':           'Oxidized_Copper_Chain',
  'Waxed Weathered Copper Chain':          'Weathered_Copper_Chain',
  'Waxed Copper Chest':                    'Copper_Chest',
  'Waxed Exposed Copper Chest':            'Exposed_Copper_Chest',
  'Waxed Oxidized Copper Chest':           'Oxidized_Copper_Chest',
  'Waxed Weathered Copper Chest':          'Weathered_Copper_Chest',
  'Waxed Lightning Rod':                   'Lightning_Rod',
  'Waxed Exposed Lightning Rod':           'Exposed_Lightning_Rod',
  'Waxed Oxidized Lightning Rod':          'Oxidized_Lightning_Rod',
  'Waxed Weathered Lightning Rod':         'Weathered_Lightning_Rod',
  'Waxed Copper Lantern':                  'Copper_Lantern',
  'Waxed Exposed Copper Lantern':          'Exposed_Copper_Lantern',
  'Waxed Oxidized Copper Lantern':         'Oxidized_Copper_Lantern',
  'Waxed Weathered Copper Lantern':        'Weathered_Copper_Lantern',
  'Waxed Copper Golem Statue':             'Copper_Golem_Statue',
  'Waxed Exposed Copper Golem Statue':     'Exposed_Copper_Golem_Statue',
  'Waxed Oxidized Copper Golem Statue':    'Oxidized_Copper_Golem_Statue',
  'Waxed Weathered Copper Golem Statue':   'Weathered_Copper_Golem_Statue',
  // ── Non-standard sprite URLs (full URL) ──────────────────────────────────
  'Trial Key':      'https://minecraft.wiki/images/ItemSprite_trial-key.png',
  'Sculk':          'https://minecraft.wiki/images/Sculk_JE1_BE1.gif',
  'Sculk Shrieker': 'https://minecraft.wiki/images/Sculk_Shrieker_JE1_BE2.gif',
  'Cactus Flower':  'https://minecraft.wiki/images/BlockSprite_cactus-flower.png',
  'Short Dry Grass':'https://minecraft.wiki/images/BlockSprite_short-dry-grass.png',
  'Tall Dry Grass': 'https://minecraft.wiki/images/BlockSprite_tall-dry-grass.png',
};

export function ItemSlot({ name, wiki_url, chamberName, chamberId, chamberItemCount, chamberSide, chamberPosition }: ItemSlotProps) {
  const override = ICON_OVERRIDES[name];
  let iconUrl: string;
  if (override?.startsWith('http')) {
    // Full URL override (non-standard sprite paths)
    iconUrl = override;
  } else if (override) {
    // Extension-aware: some overrides include .gif
    const ext = override.endsWith('.gif') ? '' : '.png';
    iconUrl = `https://minecraft.wiki/images/Invicon_${override}${ext}`;
  } else {
    const wikiName = name.replace(/\s*\(.*?\)\s*/g, ' ').trim().replace(/ /g, '_');
    iconUrl = `https://minecraft.wiki/images/Invicon_${wikiName}.png`;
  }

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
              {chamberSide && chamberPosition !== null && chamberPosition !== undefined && (
                <span className="text-[#AAAAAA] mt-1">
                  Side: <span className="text-white">{chamberSide === 'left' ? 'Left' : 'Right'}</span> • Position: <span className="text-white">{chamberPosition}</span>
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
