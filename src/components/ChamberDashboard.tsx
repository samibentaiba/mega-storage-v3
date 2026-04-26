"use client"

import * as React from "react"
import { Chamber } from "@/lib/types"
import { Search, Box } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebounce } from "@/hooks/useDebounce"

// ─── Lazy chamber card ─────────────────────────────────────────────────────────
// Uses IntersectionObserver so the chamber's full item list only renders
// once the card scrolls into the viewport — prevents the page from trying
// to mount hundreds of image tags all at once on load.
function LazyChamberCard({ chamber }: { chamber: Chamber }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect() // fire once, then stop watching
        }
      },
      { rootMargin: "0px", threshold: 0.1 } // trigger only when 10% of card is actually in view
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="bg-[#1a1a1a] border border-muted/20 rounded-xl overflow-hidden flex flex-col shadow-sm">
      {/* Header is always rendered (cheap) */}
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

      {/* Item grid — deferred until visible */}
      <div className="p-4 bg-[#111] min-h-[60px]">
        {visible ? (
          <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {chamber.items.map(item => {
              const wikiName = item.name.replace(/\s*\(.*?\)\s*/g, ' ').trim().replace(/ /g, '_')
              const iconUrl = `https://minecraft.wiki/images/Invicon_${wikiName}.png`

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
                    loading="lazy"
                    decoding="async"
                    className="w-6 h-6 object-contain pixelated group-hover:scale-110 transition-transform"
                    onError={(e) => {
                      if (wikiName === "Redstone_Dust") {
                        e.currentTarget.src = "https://minecraft.wiki/images/Invicon_Redstone.png"
                      } else {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.parentElement!.innerHTML = `<div class="flex items-center gap-2"><span class="w-6 h-6 flex items-center justify-center bg-white/5 text-[8px] font-bold rounded">${item.name.substring(0, 2).toUpperCase()}</span><span class="text-xs text-muted-foreground whitespace-nowrap">${item.name}</span></div>`
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
        ) : (
          // Skeleton pills — mathematically identical dimensions to prevent ANY layout shift on scroll
          <div className="flex flex-wrap gap-2">
            {chamber.items.map(item => (
              <div
                key={item.name}
                className="flex items-center gap-2 border border-transparent rounded-lg p-1.5 pr-3 bg-muted/10 animate-pulse pointer-events-none"
              >
                <div className="w-6 h-6 rounded bg-muted/20" />
                <span className="text-xs whitespace-nowrap text-transparent bg-muted/20 rounded select-none">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Chamber Dashboard ─────────────────────────────────────────────────────────
export function ChamberDashboard() {
  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebounce(search, 250)
  const [filteredChambers, setFilteredChambers] = React.useState<Chamber[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let isMounted = true
    setLoading(true)

    const params = new URLSearchParams()
    if (debouncedSearch) {
      params.set("search", debouncedSearch)
    }

    fetch(`/api/chambers?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setFilteredChambers(data)
          setLoading(false)
        }
      })
      .catch(err => {
        console.error("Failed to fetch chambers", err)
        if (isMounted) setLoading(false)
      })

    return () => { isMounted = false }
  }, [debouncedSearch])

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
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-muted/20 rounded-xl h-[134px] animate-pulse" />
          ))
        ) : (
          filteredChambers.map(chamber => (
            <LazyChamberCard key={chamber.id} chamber={chamber} />
          ))
        )}
        {!loading && filteredChambers.length === 0 && (
          <div className="col-span-full py-20 text-center flex flex-col items-center gap-4 text-muted-foreground">
            <Search className="w-12 h-12 opacity-20" />
            <p className="text-lg">No chambers or items found matching &ldquo;{debouncedSearch}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  )
}
