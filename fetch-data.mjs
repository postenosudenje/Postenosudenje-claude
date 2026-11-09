// Dohvaća utakmice iz Google Apps Scripta i sprema ih kao statične JSON datoteke.
// Pokretanje: node scripts/fetch-data.mjs   (Node 18+)
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const src = await readFile('script.js', 'utf8');
const url = n => src.match(new RegExp(`const ${n} = "([^"]+)"`))?.[1];
const IZVORI = { 'aktivna': url('API_URL_AKTIVNA'), '2025-26': url('API_URL_PROŠLA') };

async function dohvati(u) {
  for (let i = 1; i <= 3; i++) {
    try {
      const r = await fetch(u, { redirect: 'follow', signal: AbortSignal.timeout(90_000) });
      const d = await r.json();
      if (Array.isArray(d) && d.length) return d;
      throw new Error(d?.error || 'prazan odgovor');
    } catch (e) {
      console.warn(`pokušaj ${i}/3: ${e.message}`);
      await new Promise(r => setTimeout(r, i * 3000));
    }
  }
  return null;
}

await mkdir('data', { recursive: true });
let promjena = false;
const brojevi = {};
for (const [ime, u] of Object.entries(IZVORI)) {
  const datoteka = `data/${ime}.json`;
  const stari = await readFile(datoteka, 'utf8').catch(() => null);
  const podaci = u && await dohvati(u);
  if (!podaci) { console.warn(`${ime}: zadržavam staru verziju`); if (stari) brojevi[ime] = JSON.parse(stari).length; continue; }
  const novi = JSON.stringify(podaci);
  brojevi[ime] = podaci.length;
  if (novi !== stari) { await writeFile(datoteka, novi); promjena = true; console.log(`${ime}: ${podaci.length} redaka (ažurirano)`); }
}

if (promjena) {
  const danas = new Date().toISOString().slice(0, 10);
  await writeFile('data/meta.json', JSON.stringify({ updated: new Date().toISOString(), counts: brojevi }));
  const sm = await readFile('sitemap.xml', 'utf8').catch(() => null);
  if (sm) await writeFile('sitemap.xml', sm.replace(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${danas}</lastmod>`));
}
if (!Object.keys(brojevi).length) process.exit(1);
