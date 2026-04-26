import fs from 'fs/promises';
import path from 'path';

async function run() {
  console.log('Generating inventory sorting data...');
  
  const storagePath = path.join(process.cwd(), 'src/data/storage-system.json');
  const storageData = JSON.parse(await fs.readFile(storagePath, 'utf-8'));
  
  const categories = [
    { name: 'Building Blocks', items: [] as any[] },
    { name: 'Colored Blocks', items: [] as any[] },
    { name: 'Natural Blocks', items: [] as any[] },
    { name: 'Functional Blocks', items: [] as any[] },
    { name: 'Redstone Blocks', items: [] as any[] },
    { name: 'Tools & Utilities', items: [] as any[] },
    { name: 'Combat', items: [] as any[] },
    { name: 'Food & Drinks', items: [] as any[] },
    { name: 'Ingredients', items: [] as any[] },
    { name: 'Spawn Eggs', items: [] as any[] },
    { name: 'Operator Utilities', items: [] as any[] }
  ];
  
  const nonStackables = [
    'Sword', 'Pickaxe', 'Axe', 'Shovel', 'Hoe', 'Helmet', 'Chestplate', 'Leggings', 'Boots',
    'Shield', 'Bow', 'Crossbow', 'Trident', 'Mace', 'Fishing Rod', 'Flint and Steel', 'Shears', 'Brush',
    'Potion', 'Splash Potion', 'Lingering Potion', 'Ominous Bottle', 'Mushroom Stew', 'Beetroot Soup', 'Rabbit Stew', 'Suspicious Stew',
    'Enchanted Book', 'Book and Quill', 'Written Book', 'Saddle', 'Horse Armor', 'Boat', 'Minecart', 'Elytra',
    'Totem of Undying', 'Spyglass', 'Recovery Compass', 'Compass', 'Clock', 'Goat Horn', 'Music Disc', 'Banner Pattern',
    'Armor Trim', 'Pottery Sherd', 'Bucket of', 'Water Bucket', 'Lava Bucket', 'Milk Bucket', 'Powder Snow Bucket', 'Bed'
  ];

  const getCategory = (itemName: string) => {
    const lower = itemName.toLowerCase();
    
    // Spawn Eggs
    if (lower.includes('spawn egg')) return 'Spawn Eggs';
    
    // Colored Blocks
    if (lower.includes('wool') || lower.includes('carpet') || lower.includes('terracotta') || 
        lower.includes('concrete') || lower.includes('stained glass') || lower.includes('banner') || lower.includes('bed')) {
      return 'Colored Blocks';
    }
    
    // Redstone
    if (lower.includes('redstone') || lower.includes('piston') || lower.includes('observer') || 
        lower.includes('hopper') || lower.includes('dispenser') || lower.includes('dropper') || 
        lower.includes('repeater') || lower.includes('comparator') || lower.includes('rail') || 
        lower.includes('minecart') || lower.includes('sensor') || lower.includes('button') || lower.includes('pressure plate')) {
      return 'Redstone Blocks';
    }
    
    // Tools & Utilities
    if (lower.includes('pickaxe') || lower.includes('axe') || lower.includes('shovel') || lower.includes('hoe') ||
        lower.includes('bucket') || lower.includes('compass') || lower.includes('clock') || lower.includes('fishing rod') ||
        lower.includes('shears') || lower.includes('flint and steel') || lower.includes('lead') || lower.includes('name tag') ||
        lower.includes('music disc') || lower.includes('spyglass') || lower.includes('brush') || lower.includes('saddle')) {
      return 'Tools & Utilities';
    }
    
    // Combat
    if (lower.includes('sword') || lower.includes('helmet') || lower.includes('chestplate') || lower.includes('leggings') || lower.includes('boots') ||
        lower.includes('shield') || lower.includes('bow') || lower.includes('arrow') || lower.includes('trident') || lower.includes('mace') || lower.includes('horse armor')) {
      return 'Combat';
    }
    
    // Food & Drinks
    if (lower.includes('apple') || lower.includes('carrot') || lower.includes('potato') || lower.includes('beef') || lower.includes('porkchop') ||
        lower.includes('mutton') || lower.includes('chicken') || lower.includes('rabbit') || lower.includes('fish') || lower.includes('salmon') ||
        lower.includes('cod') || lower.includes('stew') || lower.includes('soup') || lower.includes('melon') || lower.includes('berry') ||
        lower.includes('bread') || lower.includes('cookie') || lower.includes('pie') || lower.includes('potion')) {
      return 'Food & Drinks';
    }
    
    // Ingredients
    if (lower.includes('ingot') || lower.includes('nugget') || lower.includes('diamond') || lower.includes('emerald') || lower.includes('lapis') ||
        lower.includes('coal') || lower.includes('stick') || lower.includes('string') || lower.includes('feather') || lower.includes('leather') ||
        lower.includes('hide') || lower.includes('scute') || lower.includes('shard') || lower.includes('dust') || lower.includes('crystal') ||
        lower.includes('clay') || lower.includes('brick') || lower.includes('paper') || lower.includes('book') || lower.includes('dye') || lower.includes('powder') || lower.includes('bone')) {
      return 'Ingredients';
    }
    
    // Natural Blocks
    if (lower.includes('dirt') || lower.includes('grass') || lower.includes('sand') || lower.includes('gravel') || lower.includes('stone') || lower.includes('granite') ||
        lower.includes('diorite') || lower.includes('andesite') || lower.includes('tuff') || lower.includes('deepslate') || lower.includes('ore') ||
        lower.includes('log') || lower.includes('leaves') || lower.includes('sapling') || lower.includes('mushroom') || lower.includes('flower') || lower.includes('coral') ||
        lower.includes('ice') || lower.includes('snow') || lower.includes('sponge') || lower.includes('moss')) {
      return 'Natural Blocks';
    }
    
    // Functional Blocks
    if (lower.includes('crafting table') || lower.includes('furnace') || lower.includes('smoker') || lower.includes('blast furnace') ||
        lower.includes('chest') || lower.includes('barrel') || lower.includes('shulker') || lower.includes('ender') || lower.includes('beacon') ||
        lower.includes('enchanting') || lower.includes('anvil') || lower.includes('cauldron') || lower.includes('grindstone') || lower.includes('loom') ||
        lower.includes('cartography') || lower.includes('fletching') || lower.includes('smithing') || lower.includes('stonecutter') || lower.includes('bell') ||
        lower.includes('campfire') || lower.includes('lantern') || lower.includes('torch') || lower.includes('glowstone') || lower.includes('sea lantern')) {
      return 'Functional Blocks';
    }
    
    // Building Blocks (default for remaining blocks)
    return 'Building Blocks';
  };

  const processedItems = new Set();

  for (const chamber of storageData) {
    let stackableIndex = 0;
    for (const item of chamber.items) {
      if (processedItems.has(item.name)) continue;
      processedItems.add(item.name);
      
      const catName = getCategory(item.name);
      const cat = categories.find(c => c.name === catName);
      
      let stackable = true;
      for (const ns of nonStackables) {
        if (item.name.includes(ns) && !item.name.includes('Arrow')) {
          stackable = false;
          break;
        }
      }
      
      let chamberSide = null;
      let chamberPosition = null;
      
      if (stackable) {
        chamberSide = stackableIndex < 31 ? 'left' : 'right';
        chamberPosition = (stackableIndex % 31) + 1;
        stackableIndex++;
      }
      
      cat!.items.push({
        name: item.name,
        wiki_url: item.wiki_url,
        stackable,
        chamber: stackable ? chamber.name : 'Copper Golem Non-stockable Bottom chamber (CGNSB)',
        chamberId: stackable ? chamber.id : null,
        chamberItemCount: stackable ? chamber.items.length : null,
        chamberSide,
        chamberPosition
      });
    }
  }

  // Filter empty
  const finalCategories = categories.filter(c => c.items.length > 0);
  
  const destPath = path.join(process.cwd(), 'src/data/inventory-sort.json');
  await fs.writeFile(destPath, JSON.stringify({ categories: finalCategories }, null, 2));
  console.log(`Saved ${processedItems.size} items to ${destPath}`);
}

run().catch(console.error);
