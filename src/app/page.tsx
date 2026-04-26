import * as React from "react";
import { DashboardContainer } from "@/components/DashboardContainer";
import inventorySort from "@/data/inventory-sort.json";
import storageSystem from "@/data/storage-system.json";
import { CreativeCategory, Chamber } from "@/lib/types";
import { Database } from "lucide-react";

export default function Home() {
  const categories = inventorySort.categories as CreativeCategory[];
  const chambers = storageSystem as Chamber[];

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <header className="relative py-12 px-6 overflow-hidden border-b border-muted/20">
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

      <main className="pt-8">
        <DashboardContainer categories={categories} chambers={chambers} />
      </main>

      <footer className="py-8 border-t border-muted/20 mt-12 text-center text-sm text-muted-foreground bg-muted/5 relative z-10">
        <p>
          Companion dashboard for the Minecraft Mega Storage machine created by{" "}
          <a href="https://www.youtube.com/@Burlimonster" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">
            Burlimonster
          </a>
          .
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap mt-2">
          <a href="https://burlimonster.com/gaming/best-minecraft-mega-storage-world-download/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground hover:underline transition-colors">
            Download original storage world
          </a>
          <span className="opacity-50">•</span>
          <a href="https://github.com/samibentaiba/mega-storage-v3" target="_blank" rel="noopener noreferrer" className="hover:text-foreground hover:underline transition-colors font-medium text-foreground">
            Contribute on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
