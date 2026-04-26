# Mega Storage V3 - Minecraft Inventory Dashboard

This project is a Next.js-based web application designed to act as a high-fidelity, pixel-perfect management dashboard for a massive in-game Minecraft storage facility. It replicates the authentic Java Edition Creative Mode inventory interface to provide an intuitive and familiar user experience.

## 🎯 Goal & Vision

The primary goal of this project is to bridge the gap between in-game storage organization and out-of-game management. Instead of relying on spreadsheets or generic web tables to know where items are stored, this dashboard provides a 1:1 replica of the Minecraft Creative Inventory. 

Users can navigate through official category tabs (Building Blocks, Redstone Blocks, Combat, etc.) and hover over items to instantly see which storage chamber they belong to (e.g., Chamber 1 for stackables, or the "Copper Golem Non-stockable Bottom chamber (CGNSB)" for non-stackables).

## 🏆 What We Reached

- **Authentic UI/UX:** Successfully recreated the Minecraft Creative Inventory using Next.js, Tailwind CSS, and Radix UI. It features pixel-perfect borders, custom scrollbars, authentic colors, and the snappy feel of the game's menu.
- **Dynamic Data Scraping:** Built robust Node.js scripts (using Puppeteer and Cheerio) to scrape the official Minecraft Wiki. This ensures we have the correct categorization, item names, and stackability metadata.
- **Intelligent Tooltips:** Integrated custom hover tooltips that dynamically report the exact storage location of any item in the facility.
- **Icon Integration:** Transitioned from abstract placeholders to a repository of actual Minecraft item icons.

## 🚀 How the Project Runs

This is a [Next.js](https://nextjs.org) project bootstrapped with `create-next-app`.

### Prerequisites
- Node.js (v18+)
- npm, yarn, pnpm, or bun

### Start the Application
First, install the dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Data Scripts
To update the inventory sorting data, we use custom scripts located in the `scripts/` directory:

```bash
# Scrape the latest data from the Minecraft Wiki
npx tsx scripts/scrape-inventory-sort.ts

# Generate the categorized inventory JSON from storage-system.json
npx tsx scripts/generate-inventory-sort.ts
```

## 📈 How We Can Improve It

- **Search Functionality:** Implement the "Search Items" compass tab functionality to allow quick filtering of the massive item database.
- **Live In-Game Sync:** Connect the dashboard to a live Minecraft server via a plugin or mod API (like Webhooks or a REST API) to show real-time item quantities.
- **Responsive Mobile Design:** The current UI is heavily optimized for desktop to maintain the original aspect ratio. A mobile-friendly adaptive view could be added.
- **Virtualization:** Implement windowing/virtualization for rendering item grids to ensure smooth performance even with thousands of items.

## ⚠️ Known Issues & Potential Pitfalls

### Data Sorting Limitations
The current `generate-inventory-sort.ts` script relies heavily on substring matching (e.g., `if (lower.includes('pickaxe'))`) to categorize items. This can lead to:
- **Miscategorization:** Items with overlapping keywords might be placed in the wrong tab depending on the order of the `if` statements.
- **Manual Non-Stackable List:** The script uses a hardcoded list of non-stackable keywords (e.g., 'Sword', 'Bed', 'Boat'). When Minecraft updates with new non-stackable items, this list must be manually updated, otherwise, items will be assigned to stackable chambers incorrectly.
- **Dependency on `storage-system.json`:** The sorting script assumes the base storage map is accurate. If an item is missing from the base map, it won't appear in the creative tabs.

### Feature Limitations
- **Scraper Fragility:** The `scrape-inventory-sort.ts` script relies on the specific DOM structure of the Minecraft Wiki. If the Wiki changes its layout, class names, or adds stricter bot protection, the scraper will break and need adjustments.
- **Performance with Images:** Loading hundreds of high-resolution item icons simultaneously might cause network bottlenecks if Next.js Image optimization isn't heavily cached.
- **Hardcoded Chambers:** The fallback for non-stackables is hardcoded to `'Copper Golem Non-stockable Bottom chamber (CGNSB)'`. A more dynamic mapping system would be beneficial for future-proofing.
