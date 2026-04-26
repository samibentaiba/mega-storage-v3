"use client"

import * as React from "react"
import { Chamber } from "@/lib/types"
import { Search, Box } from "lucide-react"

export function ChamberDashboard({ data }: { data: Chamber[] }) {
  const [search, setSearch] = React.useState("")

  const filteredChambers = React.useMemo(() => {
    if (!search) return data;
    const lowerSearch = search.toLowerCase();
    
    return data.map(chamber => {
      // If chamber name or ID matches perfectly, keep all its items
      if (
        chamber.name.toLowerCase().includes(lowerSearch) || 
        chamber.id.toString() === lowerSearch
      ) {
        return chamber;
      }
      
      // Otherwise, filter the items inside the chamber
      const matchingItems = chamber.items.filter(item => 
        item.name.toLowerCase().includes(lowerSearch)
      );
      
      if (matchingItems.length > 0) {
        return { ...chamber, items: matchingItems };
      }
      
      return null;
    }).filter(Boolean) as Chamber[];
  }, [data, search]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative max-w-2xl mx-auto w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input 
          type="text"
          placeholder="Search by Chamber name, ID, or specific Item..."
          className="w-full h-14 pl-12 pr-4 rounded-xl border border-muted/20 bg-muted/10 focus:bg-muted/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-lg text-foreground placeholder:text-muted-foreground"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {filteredChambers.map(chamber => (
          <div key={chamber.id} className="bg-[#1a1a1a] border border-muted/20 rounded-xl overflow-hidden flex flex-col shadow-sm">
            <div className="p-4 border-b border-muted/20 bg-[#222] flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xl shadow-inner border border-primary/20">
                  {chamber.id}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground tracking-tight">{chamber.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <Box className="w-3.5 h-3.5" />
                    <span>{chamber.items.length} items mapped</span>
                    <span className="mx-1 opacity-50">•</span>
                    <span className={chamber.status === "active" ? "text-emerald-400 font-semibold" : "text-destructive font-semibold"}>
                      {chamber.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-[#111]">
              <div className="flex flex-wrap gap-2">
                {chamber.items.map(item => {
                  const wikiName = item.name.replace(/\s*\(.*?\)\s*/g, ' ').trim().replace(/ /g, '_');
                  const iconUrl = `https://minecraft.wiki/images/Invicon_${wikiName}.png`;
                  
                  return (
                    <a 
                      key={item.name}
                      href={item.wiki_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#252525] border border-white/5 rounded-lg p-1.5 pr-3 transition-colors no-underline"
                    >
                      <img 
                        src={iconUrl} 
                        alt={item.name} 
                        className="w-6 h-6 object-contain pixelated group-hover:scale-110 transition-transform"
                        onError={(e) => {
                          if (wikiName === "Redstone_Dust") {
                            e.currentTarget.src = "https://minecraft.wiki/images/Invicon_Redstone.png";
                          } else {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = `<div class="flex items-center gap-2"><span class="w-6 h-6 flex items-center justify-center bg-white/5 text-[8px] font-bold rounded">${item.name.substring(0,2).toUpperCase()}</span><span class="text-xs text-muted-foreground group-hover:text-primary transition-colors whitespace-nowrap">${item.name}</span></div>`;
                          }
                        }}
                      />
                      <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors whitespace-nowrap">
                        {item.name}
                      </span>
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
        {filteredChambers.length === 0 && (
          <div className="col-span-full py-20 text-center flex flex-col items-center gap-4 text-muted-foreground">
            <Search className="w-12 h-12 opacity-20" />
            <p className="text-lg">No chambers or items found matching "{search}"</p>
          </div>
        )}
      </div>
    </div>
  )
}
