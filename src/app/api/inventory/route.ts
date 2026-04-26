import { NextResponse } from "next/server"
import inventoryData from "@/data/inventory-sort.json"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tab = searchParams.get("tab")
  const search = searchParams.get("search")

  // Flatten the item data with category information
  const allItems = inventoryData.categories.flatMap(category => 
    category.items.map(item => ({
      name: item.name,
      wiki_url: item.wiki_url,
      stackable: item.stackable,
      chamberName: item.chamber,
      chamberId: item.chamberId,
      chamberItemCount: item.chamberItemCount,
      categoryName: category.name,
    }))
  )

  // Filter by category tab
  if (tab && tab !== "search" && tab !== "all" && tab !== "hotbars" && tab !== "survival") {
    const items = allItems.filter(item => item.categoryName === tab)
    return NextResponse.json(items)
  }

  // Filter by search query
  if (tab === "search") {
    if (!search) {
      // In Minecraft, the search tab displays all items when the search box is empty.
      return NextResponse.json(allItems)
    }
    const items = allItems.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    return NextResponse.json(items)
  }

  // Fallback
  return NextResponse.json([])
}
