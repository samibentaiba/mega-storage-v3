# 🗃️ Mega Storage v3 — Dashboard

A web dashboard that replicates the Minecraft Creative Inventory and maps every item to its exact physical chest location inside the Mega Storage facility.

---

## 🎯 Goal & Vision

The primary goal of this project is to bridge the gap between in-game storage organization and out-of-game management. Instead of relying on spreadsheets or generic web tables to know where items are stored, this dashboard provides a 1:1 replica of the Minecraft Creative Inventory.

Users can navigate through official category tabs (Building Blocks, Redstone Blocks, Combat, etc.) and hover over items to instantly see which storage chamber they belong to and their exact slot position.

---

## 🏆 What We Reached

- **Authentic UI/UX:** Recreated the Minecraft Creative Inventory using Next.js and Radix UI with pixel-perfect borders, custom scrollbars, and authentic colors.
- **Full Item Catalog:** All 1,463 Minecraft 1.21 items pulled from the official `minecraft-data` package, including correct stackability metadata.
- **Exact Physical Positions:** Every item is mapped to a specific chamber, corridor side (left/right), and slot number (1–36) — extracted directly from the in-game signs using a command block scanner.
- **Intelligent Tooltips:** Hover over any item to see its chamber name, side, and slot position. Non-stackable items show their CGNSB location.

---

## 🏗️ Storage Facility Layout

The facility is a 101 × 185 block structure underground:

| Point | Coordinates |
|---|---|
| **p1** (start) | `X=120, Y=-17, Z=41` |
| **p2** (end) | `X=220, Y=-16, Z=225` |

```
 Main corridor runs along the Z axis (Z=41 → Z=225)

  X=120           X=158  X=159–181  X=182         X=220
    │                │      │          │              │
    ├─[LEFT CHAMBERS]─┤   [AISLE]   ├─[RIGHT CHAMBERS]─┤
    │   36 slots/side │             │   36 slots/side   │
```

- **22 total chambers** — 11 on each side of the corridor
- **72 item slots** per chamber (36 left + 36 right)
- **3 empty chambers** reserved as "Future Use"
- Items at **Y=−17** have signs above their chests

### Chamber Map

| Z Range | Left Chamber | Right Chamber |
|---|---|---|
| 47–53 | 1 — Food & Crops | 2 — Drops & Mob Loot |
| 63–69 | 3 — Lighting & Crafting | 4 — Redstone |
| 79–85 | 5 — Copper | 6 — Ores & More |
| 95–101 | 7 — Candles & Textiles | 8 — Dyes & Flowers |
| 111–117 | 9 — Dirt & Terracotta | 10 — Glass & Concrete |
| 127–133 | 11 — Stone & Deepslate | 12 — Stones & Sandstone |
| 143–149 | 13 — Softwood | 14 — Hardwood |
| 159–165 | 15 — Nether Blocks | 16 — Swamp & Nether Wood |
| 175–181 | 17 — Armor Trims | 18 — End & Ocean |
| 191–197 | 19 — Modded Copper & Lightning | 20 — Future Use 1 |
| 207–213 | 21 — Future Use 2 | 22 — Future Use 3 |

---

## 🔄 How Item Positions Are Extracted (Full Pipeline)

This section documents the complete process used to extract the exact position of every item from the Minecraft world into this dashboard — including every problem encountered along the way.

### The Challenge

Each chest in the storage has a **sign** placed above it with the item name written on it. To map items to positions, we needed to read all ~1,100 signs between `p1` and `p2` and extract their coordinates and text.

**Problem 1 — No direct file export from Minecraft.**  
Minecraft doesn't offer a native way to export sign data to a file. The only ways to get it out are:
- Parse the raw world save files (`.mca` region files)
- Use command blocks to print sign data to the game chat, then read the log

We tried the world save route first using `prismarine-provider-anvil`, but discovered the world signs were in a different save than expected (TLauncher stores version-specific saves). We switched to the command block approach.

---

### Phase 1 — Command Block Scanner

A **chain of 9 command blocks** was built inside the game to scan every block position in the facility and print any sign text to chat.

#### One-Time Setup (run in chat)
```
/gamerule commandBlockOutput false
/gamerule sendCommandFeedback true
/scoreboard objectives add scanX dummy
/scoreboard objectives add scanZ dummy
/scoreboard players set #scan scanX 120
/scoreboard players set #scan scanZ 41
/summon marker 120 -17 41 {Tags:["scanner"]}
```

#### The 9-Block Chain

Block 1 must be **Repeating + Always Active**. Blocks 2–9 are **Chain + Unconditional**. Each block gets exactly **one command**.

| # | Type | Command |
|---|---|---|
| 1 | Repeating | `execute store result entity @e[type=marker,tag=scanner,limit=1] Pos[0] double 1 run scoreboard players get #scan scanX` |
| 2 | Chain | `execute store result entity @e[type=marker,tag=scanner,limit=1] Pos[2] double 1 run scoreboard players get #scan scanZ` |
| 3 | Chain | `execute as @e[type=marker,tag=scanner,limit=1] at @s if block ~ -17 ~ #minecraft:signs run tellraw @a ["SIGN\|X=",{"nbt":"Pos[0]","entity":"@s"},"\|Z=",{"nbt":"Pos[2]","entity":"@s"},"\|Y=-17\|",{"nbt":"front_text.messages[0]","block":"~ -17 ~"},"\|",{"nbt":"front_text.messages[1]","block":"~ -17 ~"},"\|",{"nbt":"front_text.messages[2]","block":"~ -17 ~"},"\|",{"nbt":"front_text.messages[3]","block":"~ -17 ~"}]` |
| 4 | Chain | *(same as block 3 but checks `~ -16 ~` for the Y=-16 layer)* |
| 5 | Chain | `scoreboard players add #scan scanX 1` |
| 6 | Chain | `execute if score #scan scanX matches 221.. run scoreboard players set #scan scanX 120` |
| 7 | Chain | `execute if score #scan scanX matches 120 run scoreboard players add #scan scanZ 1` |
| 8 | Chain | `execute if score #scan scanZ matches 226.. run tellraw @a "=== SCAN COMPLETE ==="` |
| 9 | Chain | `execute if score #scan scanZ matches 226.. run kill @e[type=marker,tag=scanner]` |

#### How It Works

Every tick (50ms), the Repeating CB fires the chain. The invisible `marker` entity is teleported to `(scanX, -17, scanZ)`, then blocks 3–4 check for signs and print them to chat. Block 5 advances X. Block 6 wraps X at 220. Block 7 advances Z when X wraps. Blocks 8–9 stop the scan when Z passes 225.

**Output format per sign found:**
```
SIGN|X=143.0d|Z=87.0d|Y=-17||||Birch Door
```

The scan covers ~18,685 positions and takes ~15 minutes at 20 ticks/second.

#### Problems Encountered

**Problem 2 — Each command block only holds ONE command.**  
Initially I tried putting multiple commands in one block (e.g., CB6 had two `execute if score` lines). This caused a syntax error. Solution: split every command into its own block. CB6 became two blocks (6a and 6b), and CB7 became two blocks (7a and 7b).

**Problem 3 — `sendCommandFeedback false` silenced `/data get block`.**  
During debugging, we set `/gamerule sendCommandFeedback false` to stop command block spam. This also silenced manual commands like `/data get block X Y Z`, making it look like it returned nothing. Solution: run `/gamerule sendCommandFeedback true` to restore output.

**Problem 4 — Chain blocks not firing (scanX stuck at 120).**  
The scoreboard showed `#scan has 120 [scanX]` every check, meaning Block 5 (`scoreboard players add #scan scanX 1`) never ran. The cause: the chain blocks were placed facing the wrong direction. In Minecraft, a chain block only fires if the block *behind* it (the one pointing toward it) fires first. All blocks must face the same direction in sequence.

**Problem 5 — Signs at wrong Y level.**  
The scanner initially checked `Y=-17` and `Y=-16`. When testing `/data get block 143 -18 87 front_text.messages`, it returned "found no elements". This was because we had `/gamerule sendCommandFeedback false` active (Problem 3). Once fixed, the signs confirmed they ARE at `Y=-17` with `front_text.messages`.

**Problem 6 — Two markers were accidentally summoned.**  
Running the summon command twice without killing the first one created two markers. The `limit=1` selector in the chain commands only used one, but the duplicate could interfere. Solution: always run `/kill @e[type=marker,tag=scanner]` before summoning a new one.

**Problem 7 — Log file was in the wrong location.**  
The Minecraft chat log was expected at `~/.minecraft/logs/latest.log`, but searching found it at `~/.minecraft/versions/Litematica/logs/latest.log` because TLauncher uses version-specific directories for modded game profiles (Litematica/Fabric).

---

### Phase 2 — Log Extraction

After `=== SCAN COMPLETE ===` appeared, the sign data was extracted from the game log:

```bash
grep "\[CHAT\] SIGN|X=" ~/.minecraft/versions/Litematica/logs/latest.log \
  > src/data/latest.log
```

This produced **1,571 lines** (with duplicates from the scanner running multiple times during testing).

---

### Phase 3 — Parse Signs → `storage-system.json`

The parser script `scratch/parse-signs.js` processes the log into structured JSON.

```bash
node scratch/parse-signs.js
```

**Logic:**
1. Read all `SIGN|X=...` lines from the log
2. Parse `X`, `Z`, and the 4 message fields from each line
3. Combine multi-line item names (e.g., `"Enchanted"` + `"Golden Apple"` → `"Enchanted Golden Apple"`)
4. Deduplicate by `(X, Z)` coordinate key — 1,571 lines → **1,106 unique signs**
5. Filter garbage entries: empty names, `"d"`, `"Future Use 0 Items"`, etc.
6. Assign each sign to a chamber using the `Z_CLUSTER_MAP` table and X position:
   - `X ≤ 158` → left corridor side
   - `X ≥ 182` → right corridor side
7. Sort each chamber's items by `Z` then `X` (physical left-to-right, front-to-back order)
8. Assign `chamberSide` and `chamberPosition`:
   - Items 1–36 → `chamberSide: "left"`, `chamberPosition: 1–36`
   - Items 37–72 → `chamberSide: "right"`, `chamberPosition: 1–36`

**Output:** `src/data/storage-system.json` — 22 chambers, 1,106 items.

---

### Phase 4 — Generate `inventory-sort.json`

Cross-references the storage data with the full Minecraft 1.21 item registry:

```bash
npx tsx scripts/generate-inventory-sort.ts
```

This uses the `minecraft-data` npm package to get all 1,463 registered items with correct `stackSize` data. Each item is matched by name to its chamber entry in `storage-system.json`.

**Output:** `src/data/inventory-sort.json` — 1,463 items organized by Creative Inventory category with full position metadata.

**Final results:**

| Metric | Count |
|---|---|
| Items assigned to a chamber | 1,085 |
| Non-stackable items (CGNSB) | 188 |
| Unassigned (not in storage yet) | 190 |
| Total items in catalog | 1,463 |

---

## 🚀 How the Project Runs

### Prerequisites
- Node.js (v18+) or Bun
- npm, yarn, pnpm, or bun

### Start the Application

```bash
npm install
npm run dev
# or
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

### Update Storage Data

When you physically move items in the Minecraft world, re-run the full pipeline:

```bash
# 1. Run the in-game command block scanner (see pipeline above)
# 2. Copy the new log to:
#    src/data/latest.log

# 3. Rebuild storage-system.json from the sign log
node scratch/parse-signs.js

# 4. Rebuild inventory-sort.json
npx tsx scripts/generate-inventory-sort.ts
```

---

## 🛠️ How to Manage Items Manually

### Add a new item to a chamber

1. Open `src/data/storage-system.json`
2. Find the correct chamber by ID
3. Add to the `items` array:
```json
{ "name": "New Item", "wiki_url": "https://minecraft.wiki/w/New_Item" }
```
4. Run `npx tsx scripts/generate-inventory-sort.ts`

### Override an item icon

Open `src/components/ItemSlot.tsx` and add to the `iconUrl` logic:
```tsx
if (name === "My Custom Item") iconUrl = "/public/my-icon.png";
```

### Change an item's Creative Inventory tab

Open `scripts/generate-inventory-sort.ts` — items are categorized by the `minecraft-data` package. The tab comes from the item's Creative Inventory group as defined in the game data.

---

## 📈 Future Improvements

- **Live sync:** Connect to a Minecraft server plugin to show real-time item quantities
- **Search:** Implement the "Search Items" compass tab
- **Mobile view:** Responsive layout for phone browsing
- **Validation script:** Detect items in `storage-system.json` that don't exist in `minecraft-data`

---

## ⚠️ Known Issues

- **Scraper fragility:** The Minecraft Wiki HTML structure can change at any time. The wiki-based scraping scripts in `scratch/` are for reference only; the main pipeline now uses `minecraft-data`.
- **Custom/modded items:** Items like "Waxed Oxidized Copper Golem Statue" are custom-named items in the physical storage. They appear in `storage-system.json` but won't match any `minecraft-data` entry and will show up as "Unassigned" in `inventory-sort.json`.
- **Scanner loop time:** The command block scanner takes ~15 minutes to scan all 18,685 positions at 20 ticks/second. The user must remain in the chunk during the scan.

---

## 🙏 Credits & Acknowledgments

This dashboard is an external companion tool for the **Minecraft Mega Storage** machine designed and built by **Burlimonster**.

- **Storage World Download:** [Best Minecraft Mega Storage World](https://burlimonster.com/gaming/best-minecraft-mega-storage-world-download/)
- **YouTube Channel:** [Burlimonster on YouTube](https://www.youtube.com/@Burlimonster)
