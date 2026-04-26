"use client"

import * as React from "react"
import { CreativeCategory } from "@/lib/types"
import { ItemSlot } from "@/components/ItemSlot"
import { cn } from "@/lib/utils"

interface SearchDashboardProps {
  data: CreativeCategory[];
}

export function SearchDashboard({ data }: SearchDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<string>("search");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [scrollRow, setScrollRow] = React.useState(0);

  React.useEffect(() => {
    setScrollRow(0);
  }, [activeTab, searchQuery]);

  const allItems = React.useMemo(() => {
    return data.flatMap(category => 
      category.items.map(item => ({
        name: item.name,
        wiki_url: item.wiki_url,
        stackable: item.stackable,
        chamberName: item.chamber,
        categoryName: category.name,
      }))
    );
  }, [data]);

  const filteredItems = React.useMemo(() => {
    let itemsToFilter = allItems;
    if (activeTab !== "search" && activeTab !== "all" && activeTab !== "hotbars" && activeTab !== "survival") {
      itemsToFilter = allItems.filter(item => item.categoryName === activeTab);
    }
    if (activeTab === "search" && searchQuery) {
      return itemsToFilter.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return itemsToFilter;
  }, [allItems, activeTab, searchQuery]);

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
      case "Operator Utilities": iconName = "Command_Block"; break;
      case "search": iconName = "Compass"; break;
      case "hotbars": iconName = "Bookshelf"; break;
      case "survival": iconName = "Chest"; break;
      case "all": iconName = "Chest"; break;
    }

    const extension = (iconName === "Compass" || iconName === "Clock") ? "gif" : "png";
    const iconUrl = `https://minecraft.wiki/images/Invicon_${iconName}.${extension}`;

    return (
      <div className="flex items-center justify-center w-full h-full">
        <img 
          src={iconUrl} 
          alt={iconName}
          className="w-5 h-5 object-contain pixelated"
          onError={(e) => {
            if (iconName === "Chest") {
               e.currentTarget.src = "https://minecraft.wiki/images/Invicon_Chest_JE4_BE2.png";
            }
          }}
        />
      </div>
    );
  }

  // Exact 14 tabs
  const topTabs = ["Building Blocks", "Colored Blocks", "Natural Blocks", "Functional Blocks", "Redstone Blocks", "Tools & Utilities"]; 
  const bottomTabs = ["Combat", "Food & Drinks", "Ingredients", "Spawn Eggs", "Operator Utilities", "hotbars", "survival"];

  const currentChamberName = activeTab === "search" ? "Search Items" 
    : activeTab === "hotbars" ? "Saved Hotbars"
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 selection:bg-transparent">
      <div className="relative flex flex-col items-center w-[392px]">
        
        {/* Top Tabs */}
        <div className="flex justify-between w-[392px] px-[8px] h-[56px] items-end z-10">
          <div className="flex">
            {topTabs.map(tabId => (
              <button
                key={tabId}
                onClick={() => setActiveTab(tabId as any)}
                className={cn("mc-tab-top flex items-center justify-center cursor-pointer", activeTab === tabId && "active")}
                title={data.find(c => c.id === tabId)?.name}
              >
                {getIconForTab(tabId)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setActiveTab("search")}
            className={cn("mc-tab-top flex items-center justify-center cursor-pointer", activeTab === "search" && "active")}
            title="Search Items"
          >
            {getIconForTab("search")}
          </button>
        </div>

        {/* Main Window */}
        <div className="mc-window w-[392px] h-[400px] flex flex-col items-center pt-[16px] pb-[16px] z-20">
          <div className="flex justify-between items-end w-[360px] h-[24px] mb-[8px]">
            <h2 className="text-[#373737] font-bold text-[16px] leading-none select-none" style={{ fontFamily: "monospace" }}>
              {currentChamberName}
            </h2>
            {activeTab === "search" && (
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mc-search-input w-[140px] h-[24px] px-[4px]"
              />
            )}
          </div>

          <div className="flex justify-between w-[360px]">
            <div className="grid grid-cols-9 gap-0 w-[324px] h-[180px]" onWheel={handleWheel}>
              {renderSlots()}
            </div>
            <div 
              ref={trackRef}
              className="mc-scrollbar-track h-[180px] relative cursor-pointer"
              onMouseDown={handleScrollDrag}
            >
              <div 
                className="mc-scrollbar-thumb absolute left-0 right-0 mx-auto" 
                style={{ top: `${scrollThumbTop + 2}px` }}
              />
            </div>
          </div>

          {/* Hotbar (Empty for now) */}
          <div className="absolute bottom-[16px] w-[360px] flex justify-start">
            <div className="flex gap-0 w-[324px]">
               {Array.from({ length: 9 }).map((_, i) => (
                  <div key={`hotbar-${i}`} className="mc-slot" />
               ))}
            </div>
          </div>
        </div>

        {/* Bottom Tabs */}
        <div className="flex justify-between w-[392px] px-[8px] h-[56px] items-start z-10">
          <div className="flex">
            {bottomTabs.map(tabId => (
              <button
                key={tabId}
                onClick={() => setActiveTab(tabId as any)}
                className={cn("mc-tab-bottom flex items-center justify-center cursor-pointer", activeTab === tabId && "active")}
                title={data.find(c => c.id === tabId)?.name}
              >
                {getIconForTab(tabId)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setActiveTab("all")}
            className={cn("mc-tab-bottom flex items-center justify-center cursor-pointer", activeTab === "all" && "active")}
            title="All Items"
          >
            {getIconForTab("all")}
          </button>
        </div>
      </div>
    </div>
  )
}
