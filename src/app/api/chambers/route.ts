import { NextResponse } from "next/server"
import storageSystem from "@/data/storage-system.json"
import { Chamber } from "@/lib/types"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")
  const chambers = storageSystem as Chamber[]

  if (!search) {
    // If no search, return all chambers, but omit items to save payload size?
    // The UI needs items to render the grid.
    return NextResponse.json(chambers)
  }

  const lower = search.toLowerCase()
  const filteredChambers = chambers.map(chamber => {
    // If chamber name or ID matches perfectly, keep all its items
    if (chamber.name.toLowerCase().includes(lower) || chamber.id.toString() === lower) {
      return chamber
    }
    
    // Otherwise, filter the items inside the chamber
    const matchingItems = chamber.items.filter(item => 
      item.name.toLowerCase().includes(lower)
    )
    
    if (matchingItems.length > 0) {
      return { ...chamber, items: matchingItems }
    }
    
    return null
  }).filter(Boolean)

  return NextResponse.json(filteredChambers)
}
