"use client"

import * as React from "react"
import { CreativeCategory } from "@/lib/types"
import { ItemSlot } from "@/components/ItemSlot"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/useDebounce"
import { Skeleton } from "@/components/ui/skeleton"

export function SearchDashboard() {
  const [activeTab, setActiveTab] = React.useState<string>("search");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [committedSearch, setCommittedSearch] = React.useState("");
  const [scrollRow, setScrollRow] = React.useState(0);
  const [mounted, setMounted] = React.useState(false);
  const [filteredItems, setFilteredItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  React.useEffect(() => {
    setScrollRow(0);
  }, [activeTab, committedSearch]);

  React.useEffect(() => {
    if (!mounted) return;
    
    let isMounted = true;
    setLoading(true);
    
    const params = new URLSearchParams();
    params.set("tab", activeTab);
    if (activeTab === "search" && committedSearch) {
      params.set("search", committedSearch);
    }
    
    fetch(`/api/inventory?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setFilteredItems(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Failed to fetch inventory", err);
        if (isMounted) setLoading(false);
      });
      
    return () => { isMounted = false; };
  }, [activeTab, committedSearch, mounted]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setCommittedSearch(searchQuery);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val === "") {
      setCommittedSearch("");
    }
  };

  const maxRows = Math.ceil(filteredItems.length / 9);
  const maxScrollableRows = Math.max(0, maxRows - 5);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0) setScrollRow(prev => Math.min(maxScrollableRows, prev + 1));
    else setScrollRow(prev => Math.max(0, prev - 1));
  };

  const trackRef = React.useRef<HTMLDivElement>(null);
  const handleScrollDrag = (e: React.MouseEvent) => {
    if (!trackRef.current || maxScrollableRows === 0) return;
    e.preventDefault();
    const updateScroll = (clientY: number) => {
      const rect = trackRef.current!.getBoundingClientRect();
      const y = Math.max(0, Math.min(rect.height - 30, clientY - rect.top - 15));
      const percentage = y / (rect.height - 30);
      setScrollRow(Math.round(percentage * maxScrollableRows));
    };
    updateScroll(e.clientY);
    const onMouseMove = (moveEvent: MouseEvent) => updateScroll(moveEvent.clientY);
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const getIconForTab = (id: string) => {
    let iconName = "Chest";
    switch(id) {
      case "Building Blocks": iconName = "Bricks"; break;
      case "Colored Blocks": iconName = "Cyan_Wool"; break;
      case "Natural Blocks": iconName = "Grass_Block"; break;
      case "Functional Blocks": iconName = "Oak_Sign"; break;
      case "Redstone Blocks": iconName = "Redstone_Dust"; break;
      case "Tools & Utilities": iconName = "Iron_Pickaxe"; break;
      case "Combat": iconName = "Golden_Sword"; break;
      case "Food & Drinks": iconName = "Golden_Apple"; break;
      case "Ingredients": iconName = "Iron_Ingot"; break;
      case "Spawn Eggs": iconName = "Pig_Spawn_Egg"; break;
      case "search": iconName = "Compass"; break;
      case "survival": iconName = "Chest"; break;
    }

    const extension = (iconName === "Compass" || iconName === "Clock") ? "gif" : "png";
    const iconUrl = `https://minecraft.wiki/images/Invicon_${iconName}.${extension}`;

    return (
      <div className="flex items-center justify-center w-full h-full pb-1">
        <img 
          src={iconUrl} 
          alt={iconName}
          className="w-8 h-8 object-contain pixelated"
          onError={(e) => {
            // Hotfix for redstone dust which is sometimes named differently
            if (iconName === "Redstone_Dust") {
               e.currentTarget.src = "https://minecraft.wiki/images/Invicon_Redstone.png";
            }
          }}
        />
      </div>
    );
  }

  // Exact Minecraft 1.21 tabs layout
  const topTabs = ["Building Blocks", "Colored Blocks", "Natural Blocks", "Functional Blocks", "Redstone Blocks"]; 
  const bottomTabs = ["Tools & Utilities", "Combat", "Food & Drinks", "Ingredients", "Spawn Eggs"];

  const currentChamberName = activeTab === "search" ? "Search Items" 
    : activeTab === "survival" ? "Survival Inventory"
    : activeTab === "all" ? "All Items"
    : activeTab;

  const renderSlots = () => {
    const slots = [];
    const startIndex = scrollRow * 9;
    for (let i = 0; i < 45; i++) {
      const item = filteredItems[startIndex + i];
      if (item) {
        slots.push(
          <ItemSlot 
            key={`${item.name}-${startIndex + i}`}
            name={item.name}
            wiki_url={item.wiki_url}
            chamberName={item.chamberName}
            chamberId={item.chamberId}
            chamberItemCount={item.chamberItemCount}
            chamberSide={item.chamberSide}
            chamberPosition={item.chamberPosition}
          />
        );
      } else {
        slots.push(<div key={`empty-${i}`} className="mc-slot" />);
      }
    }
    return slots;
  };

  const scrollThumbTop = maxScrollableRows > 0 
    ? (scrollRow / maxScrollableRows) * (180 - 30 - 4)
    : 0;

  if (!mounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center p-4 overflow-x-hidden w-full">
        <div className="relative flex flex-col items-center w-[392px] transform scale-[0.85] sm:scale-[1.25] md:scale-[1.5] lg:scale-[1.75] xl:scale-[2] origin-top mb-[-40px] sm:mb-[100px] md:mb-[200px] lg:mb-[300px] xl:mb-[400px]">
          
          {/* Skeleton Top Tabs */}
          <div className="flex w-[392px] items-end z-10 relative">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="mc-tab-top" />
            ))}
            <div className="flex-1" />
            <div className="mc-tab-top active" />
          </div>

          {/* Skeleton Main Window */}
          <div className="mc-window w-[392px] h-[272px] flex flex-col items-center pt-[16px] pb-[16px] z-20">
            <div className="flex justify-between items-end w-[356px] h-[24px] mb-[12px]">
              <h2 className="text-[#373737] font-bold text-[16px] leading-none select-none tracking-tight animate-pulse" style={{ fontFamily: "monospace" }}>
                Loading...
              </h2>
              <div className="mc-search-input w-[180px] h-[24px] opacity-50" />
            </div>
            
            <div className="relative w-[356px] h-[180px] flex gap-[4px] animate-pulse">
              <div className="grid grid-cols-9 gap-[2px] w-[324px] h-[180px] grid-rows-5">
                {Array.from({ length: 45 }).map((_, i) => (
                  <div key={`empty-${i}`} className="mc-slot" />
                ))}
              </div>
              <div className="mc-scrollbar flex flex-col items-center">
                <div className="mc-scrollbar-thumb" style={{ top: "0px" }} />
              </div>
            </div>
          </div>

          {/* Skeleton Bottom Tabs */}
          <div className="flex w-[392px] items-start z-10 relative mt-[-2px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="mc-tab-bottom" />
            ))}
            <div className="mc-tab-bottom invisible" />
            <div className="mc-tab-bottom" />
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 overflow-x-hidden w-full">
      <div className="relative flex flex-col items-center w-[392px] transform scale-[0.85] sm:scale-[1.25] md:scale-[1.5] lg:scale-[1.75] xl:scale-[2] origin-top mb-[-40px] sm:mb-[100px] md:mb-[200px] lg:mb-[300px] xl:mb-[400px]">
        
        {/* Top Tabs */}
        <div className="flex w-[392px] items-end z-10 relative">
          {topTabs.map(tabId => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={cn("mc-tab-top flex items-center justify-center cursor-pointer", activeTab === tabId && "active")}
              title={tabId}
            >
              {getIconForTab(tabId)}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={() => setActiveTab("search")}
            className={cn("mc-tab-top flex items-center justify-center cursor-pointer", activeTab === "search" && "active")}
            title="Search Items"
          >
            {getIconForTab("search")}
          </button>
        </div>

        {/* Main Window */}
        <div className="mc-window w-[392px] h-[272px] flex flex-col items-center pt-[16px] pb-[16px] z-20">
          <div className="flex justify-between items-end w-[356px] h-[24px] mb-[12px]">
            <h2 className="text-[#373737] font-bold text-[16px] leading-none select-none tracking-tight" style={{ fontFamily: "monospace" }}>
              {currentChamberName}
            </h2>
            {activeTab === "search" && (
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="mc-search-input w-[180px] h-[24px] px-[6px] py-[2px] selection:bg-primary/30"
              />
            )}
          </div>

          <div className="flex justify-between w-[356px]">
            <div className="grid grid-cols-9 gap-0 w-[324px] h-[180px]" onWheel={handleWheel}>
              {renderSlots()}
            </div>
            <div 
              ref={trackRef}
              className="mc-scrollbar-track h-[180px] relative cursor-pointer"
              onMouseDown={handleScrollDrag}
            >
              <div 
                className="mc-scrollbar-thumb" 
                style={{ top: `${scrollThumbTop + 2}px` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Tabs */}
        <div className="flex w-[392px] items-start z-10 relative">
          {bottomTabs.map(tabId => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={cn("mc-tab-bottom flex items-center justify-center cursor-pointer", activeTab === tabId && "active")}
              title={tabId}
            >
              <div className="mt-2">{getIconForTab(tabId)}</div>
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={() => setActiveTab("survival")}
            className={cn("mc-tab-bottom flex items-center justify-center cursor-pointer", activeTab === "survival" && "active")}
            title="Survival Inventory"
          >
            <div className="mt-2">{getIconForTab("survival")}</div>
          </button>
        </div>
      </div>
    </div>
  )
}
