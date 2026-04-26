"use client"

import * as React from "react"
import { SearchDashboard } from "./SearchDashboard"
import { ChamberDashboard } from "./ChamberDashboard"
import { CreativeCategory, Chamber } from "@/lib/types"

export function DashboardContainer({ 
  categories, 
  chambers 
}: { 
  categories: CreativeCategory[], 
  chambers: Chamber[] 
}) {
  const [view, setView] = React.useState<"minecraft" | "modern">("modern")

  return (
    <div className="flex flex-col items-center gap-8 w-full pb-20">
      <div className="flex p-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-50">
        <button 
          onClick={() => setView("minecraft")}
          className={`px-6 py-2.5 text-sm font-bold rounded-md transition-all ${view === "minecraft" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
        >
          Minecraft View
        </button>
        <button 
          onClick={() => setView("modern")}
          className={`px-6 py-2.5 text-sm font-bold rounded-md transition-all ${view === "modern" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
        >
          Database View
        </button>
      </div>

      <div className="w-full">
        {view === "minecraft" ? (
          <SearchDashboard data={categories} />
        ) : (
          <ChamberDashboard data={chambers} />
        )}
      </div>
    </div>
  )
}
