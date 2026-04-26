import * as React from "react";
import { SearchDashboard } from "@/components/SearchDashboard";
import inventorySort from "@/data/inventory-sort.json";
import { CreativeCategory } from "@/lib/types";
import { Database } from "lucide-react";

export default function Home() {
  const categories = inventorySort.categories as CreativeCategory[];

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <header className="relative py-12 px-6 overflow-hidden border-b border-muted/20">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center gap-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground uppercase italic flex items-center gap-4">
            <Database className="w-8 h-8 md:w-12 md:h-12 text-primary" />
            Mega Storage <span className="text-primary">v3</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg md:text-xl">
            Central Command for the 22-chamber underground facility. 
            Real-time inventory tracking and rapid item retrieval system.
          </p>
        </div>
      </header>

      <main className="pb-20">
        <SearchDashboard data={categories} />
      </main>

    </div>
  );
}

