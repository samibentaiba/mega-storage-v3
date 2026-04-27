import fs from 'fs/promises';
import path from 'path';
import mcData from 'minecraft-data';

async function run() {
  const data = mcData('1.21'); // minecraft-data supports up to latest versions
  const items = data.itemsArray;

  const storagePath = path.join(process.cwd(), 'src/data/storage-system.json');
  const storageData = JSON.parse(await fs.readFile(storagePath, 'utf-8'));

  const wikiPath = path.join(process.cwd(), 'scratch/original-wiki-items.json');
  const wikiData = JSON.parse(await fs.readFile(wikiPath, 'utf-8'));

  // Build map of categorized items
  const categorizedItemNames = new Set();
  for (const cat of wikiData.categories) {
    for (const item of cat.items) {
      categorizedItemNames.add(item.name.toLowerCase());
    }
  }

  // Create an "Uncategorized" category for anything not in the original wiki scrape
  const uncategorizedItems = [];
  
  // also, we need to correct stackability from minecraft-data
  const allGameItemsMap = new Map();
  for (const item of items) {
    allGameItemsMap.set(item.displayName.toLowerCase(), {
      name: item.displayName,
      stackable: item.stackSize > 1
    });
  }

  // Now, merge with storage data to get positions
  const itemToChamberMap = new Map();
  for (const chamber of storageData) {
    let stackableIndex = 0;
    for (const item of chamber.items) {
      const chamberSide = stackableIndex < 31 ? 'left' : 'right';
      const chamberPosition = (stackableIndex % 31) + 1;
      
      itemToChamberMap.set(item.name.toLowerCase(), {
        chamberName: chamber.name,
        chamberId: chamber.id,
        chamberItemCount: chamber.items.length,
        chamberSide,
        chamberPosition
      });
      stackableIndex++;
    }
  }

  // Prepare final categories
  const finalCategories = [];

  for (const cat of wikiData.categories) {
    const finalItems = [];
    for (const item of cat.items) {
      const name = item.name;
      const lowerName = name.toLowerCase();
      
      let stackable = item.stackable;
      if (allGameItemsMap.has(lowerName)) {
        stackable = allGameItemsMap.get(lowerName).stackable;
      }
      
      const chamberInfo = itemToChamberMap.get(lowerName);
      
      let chamberName = chamberInfo?.chamberName || (stackable ? 'Unassigned' : 'Copper Golem Non-stockable Bottom chamber (CGNSB)');
      let chamberId = chamberInfo?.chamberId || null;
      let chamberItemCount = chamberInfo?.chamberItemCount || null;
      let chamberSide = chamberInfo?.chamberSide || null;
      let chamberPosition = chamberInfo?.chamberPosition || null;

      finalItems.push({
        name,
        wiki_url: item.wiki_url,
        stackable,
        chamber: chamberName,
        chamberId,
        chamberItemCount,
        chamberSide,
        chamberPosition
      });
    }
    finalCategories.push({ name: cat.name, items: finalItems });
  }

  // Add missing items
  for (const item of items) {
    const lowerName = item.displayName.toLowerCase();
    if (!categorizedItemNames.has(lowerName)) {
      const stackable = item.stackSize > 1;
      const chamberInfo = itemToChamberMap.get(lowerName);
      let chamberName = chamberInfo?.chamberName || (stackable ? 'Unassigned' : 'Copper Golem Non-stockable Bottom chamber (CGNSB)');
      
      uncategorizedItems.push({
        name: item.displayName,
        wiki_url: `https://minecraft.wiki/images/Invicon_${item.displayName.replace(/ /g, '_')}.png`,
        stackable,
        chamber: chamberName,
        chamberId: chamberInfo?.chamberId || null,
        chamberItemCount: chamberInfo?.chamberItemCount || null,
        chamberSide: chamberInfo?.chamberSide || null,
        chamberPosition: chamberInfo?.chamberPosition || null
      });
    }
  }

  if (uncategorizedItems.length > 0) {
    finalCategories.push({ name: 'Other Items', items: uncategorizedItems });
  }

  const destPath = path.join(process.cwd(), 'src/data/inventory-sort.json');
  await fs.writeFile(destPath, JSON.stringify({ categories: finalCategories }, null, 2));

  let totalItems = 0;
  finalCategories.forEach(c => totalItems += c.items.length);
  console.log(`Saved ${totalItems} items to ${destPath}`);
}

run().catch(console.error);
