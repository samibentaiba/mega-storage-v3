import fs from 'fs';
import path from 'path';
import { Anvil } from 'prismarine-provider-anvil';

interface NbtValue {
  type: string;
  value: any;
}

interface BlockEntity {
  id?: NbtValue;
  x?: NbtValue;
  y?: NbtValue;
  z?: NbtValue;
  front_text?: NbtValue;
  Text1?: NbtValue;
  Text2?: NbtValue;
  Text3?: NbtValue;
  Text4?: NbtValue;
  [key: string]: NbtValue | undefined;
}

function extractText(t: string | undefined): string {
  if (!t) return '';
  try {
    if (t.startsWith('{')) {
      const obj = JSON.parse(t);
      return obj.text || obj.extra?.map((e: any) => e.text || '').join('') || '';
    }
    if (t === '""') return '';
    return t.replace(/^"|"$/g, '');
  } catch (e) { return t; }
}

async function run() {
  const worldPath = path.join(process.env.HOME || '', '.minecraft', 'saves', 'New World');
  const regionPath = path.join(worldPath, 'region');

  if (!fs.existsSync(regionPath)) {
    console.error(`Region folder not found at ${regionPath}`);
    return;
  }

  console.log(`Loading world from ${worldPath}`);

  const AnvilClass = (Anvil as any)('1.21');
  const anvil = new AnvilClass(regionPath);

  const minX = 120;
  const maxX = 220;
  const minZ = 41;
  const maxZ = 225;
  const minY = -17;
  const maxY = -16;

  const minChunkX = Math.floor(minX / 16);
  const maxChunkX = Math.floor(maxX / 16);
  const minChunkZ = Math.floor(minZ / 16);
  const maxChunkZ = Math.floor(maxZ / 16);

  console.log(`Scanning chunks X: ${minChunkX}-${maxChunkX}, Z: ${minChunkZ}-${maxChunkZ}`);

  const signs: any[] = [];

  for (let cx = minChunkX; cx <= maxChunkX; cx++) {
    for (let cz = minChunkZ; cz <= maxChunkZ; cz++) {
      try {
        const parsed = await anvil.loadRaw(cx, cz);
        if (!parsed) continue;

        const blockEntities = parsed.value?.block_entities;
        if (!blockEntities) continue;

        const beList = blockEntities.value?.value || blockEntities.value || [];

        for (const be of beList) {
          const id = be.id?.value;
          const x = be.x?.value;
          const y = be.y?.value;
          const z = be.z?.value;

          if (
            x >= minX && x <= maxX &&
            y >= minY && y <= maxY &&
            z >= minZ && z <= maxZ
          ) {
            if (id && (id.includes('sign'))) {
              signs.push({ x, y, z, be });
            }
          }
        }
      } catch (err) {
        // chunk might not exist, skip
      }
    }
  }

  console.log(`Found ${signs.length} signs in the area.`);

  const parsedSigns = signs.map(s => {
    let lines: string[] = [];
    const be: BlockEntity = s.be;

    if (be.front_text) {
      // 1.20+ format: front_text.messages is a list of JSON text components
      const messages = be.front_text.value?.messages?.value?.value || be.front_text.value?.messages?.value || [];
      lines = messages.map((m: any) => extractText(m?.value ?? m));
    } else {
      // pre-1.20 format
      lines = [
        extractText(be.Text1?.value),
        extractText(be.Text2?.value),
        extractText(be.Text3?.value),
        extractText(be.Text4?.value),
      ];
    }

    return {
      x: s.x,
      y: s.y,
      z: s.z,
      lines: lines.filter(l => l.length > 0),
      raw_text: lines.join(' | ')
    };
  });

  // Sort by Z then X to get physical order (chambers go along Z axis)
  parsedSigns.sort((a, b) => a.z - b.z || a.x - b.x);

  fs.writeFileSync('scratch/extracted-signs.json', JSON.stringify(parsedSigns, null, 2));
  console.log('Saved to scratch/extracted-signs.json');
  
  // Also print a summary
  console.log('\n--- Sign Summary ---');
  for (const s of parsedSigns) {
    console.log(`[${s.x}, ${s.y}, ${s.z}]: ${s.raw_text}`);
  }
}

run().catch(console.error);
