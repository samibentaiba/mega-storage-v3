import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

async function run() {
  console.log('Starting Puppeteer...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  
  console.log('Navigating to Minecraft Wiki...');
  await page.goto('https://minecraft.wiki/w/Creative_inventory', { waitUntil: 'networkidle2' });
  
  try {
    await page.waitForSelector('#Java_Edition', { timeout: 10000 });
  } catch(e) {}
  
  console.log('Extracting inventory data...');
  const data = await page.evaluate(() => {
    const categories: { name: string; items: string[] }[] = [];
    const targetCategories = [
      'Building Blocks', 'Colored Blocks', 'Natural Blocks', 'Functional Blocks', 
      'Redstone Blocks', 'Tools & Utilities', 'Combat', 'Food & Drinks', 
      'Ingredients', 'Spawn Eggs', 'Operator Utilities'
    ];
    
    const headlines = Array.from(document.querySelectorAll('.mw-headline'));
    
    for (const headline of headlines) {
      const name = headline.textContent?.trim() || '';
      
      // Special check since 'Tools & Utilities' might have different whitespace
      const match = targetCategories.find(tc => name.replace(/\s+/g, ' ') === tc || name.includes(tc));
      
      if (match) {
        const catObj = { name: match, items: [] as string[] };
        
        // The headline is inside an h3 or h4
        const headerEl = headline.parentElement;
        if (!headerEl) continue;
        
        // Find the next element that contains the items. It could be next sibling, or it could be wrapped.
        // Usually it's the next sibling of the h3/h4. If the h3/h4 is inside a .collapsible, it might be the next sibling of that h3/h4.
        let curr = headerEl.nextElementSibling;
        
        // Keep looking forward until we hit another H2/H3/H4
        while (curr && !['H2', 'H3', 'H4'].includes(curr.tagName)) {
          // Look for .invslot-item
          const slots = curr.querySelectorAll ? curr.querySelectorAll('.invslot-item') : [];
          if (slots.length > 0) {
            slots.forEach(slot => {
              const title = slot.getAttribute('data-minetip-title') || slot.getAttribute('title') || slot.querySelector('a')?.getAttribute('title');
              if (title) {
                catObj.items.push(title.trim().replace(/ \(.+\)$/, ''));
              }
            });
          } else {
            // Look for lists
            const lis = curr.querySelectorAll ? curr.querySelectorAll('li') : [];
            lis.forEach(li => {
              const a = li.querySelector('a');
              if (a) {
                catObj.items.push(a.textContent?.trim() || '');
              } else {
                catObj.items.push(li.textContent?.trim() || '');
              }
            });
          }
          curr = curr.nextElementSibling;
        }
        
        // Remove duplicates and empty
        catObj.items = Array.from(new Set(catObj.items.filter(i => i.length > 0)));
        if (catObj.items.length > 0) {
          categories.push(catObj);
        }
      }
    }
    
    return categories;
  });
  
  console.log(`Found ${data.length} categories.`);
  for (const cat of data) {
    console.log(`- ${cat.name}: ${cat.items.length} items`);
  }
  
  const nonStackables = [
    'Sword', 'Pickaxe', 'Axe', 'Shovel', 'Hoe', 'Helmet', 'Chestplate', 'Leggings', 'Boots',
    'Shield', 'Bow', 'Crossbow', 'Trident', 'Mace', 'Fishing Rod', 'Flint and Steel', 'Shears', 'Brush',
    'Potion', 'Splash Potion', 'Lingering Potion', 'Ominous Bottle', 'Mushroom Stew', 'Beetroot Soup', 'Rabbit Stew', 'Suspicious Stew',
    'Enchanted Book', 'Book and Quill', 'Written Book', 'Saddle', 'Horse Armor', 'Boat', 'Minecart', 'Elytra',
    'Totem of Undying', 'Spyglass', 'Recovery Compass', 'Compass', 'Clock', 'Goat Horn', 'Music Disc', 'Banner Pattern',
    'Armor Trim', 'Pottery Sherd', 'Bucket of'
  ];
  
  const finalData = data.map(category => {
    return {
      name: category.name,
      items: category.items.map(itemName => {
        const cleanName = itemName.replace(/\s*\(.*?\)\s*/g, '').trim();
        const wikiUrl = `https://minecraft.wiki/images/Invicon_${cleanName.replace(/ /g, '_')}.png`;
        
        let stackable = true;
        for (const ns of nonStackables) {
          if (cleanName.includes(ns) && !cleanName.includes('Arrow')) {
            stackable = false;
            break;
          }
        }
        
        return {
          name: cleanName,
          wiki_url: wikiUrl,
          stackable
        };
      })
    };
  });
  
  const destPath = path.join(process.cwd(), 'src/data/scraped-items.json');
  await fs.writeFile(destPath, JSON.stringify({ categories: finalData }, null, 2));
  console.log(`Saved to ${destPath}`);
  
  await browser.close();
}

run().catch(console.error);
