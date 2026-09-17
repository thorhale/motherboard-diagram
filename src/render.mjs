import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';

const OUT = 'build';
const url = 'file://' + process.cwd() + '/build/submission.html';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1632, height: 1056 }, deviceScaleFactor: 2 });

page.on('console', m => console.log('  [page]', m.type(), m.text()));
page.on('pageerror', e => console.log('  [pageerror]', e.message));

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForFunction(() => document.documentElement.dataset.leaders === 'ready', { timeout: 20000 });
await page.waitForTimeout(400);

// vector PDF, CSS page size honoured
await page.pdf({ path: `${OUT}/Motherboard-Diagram.pdf`, printBackground: true, preferCSSPageSize: true });

// per-page proofs for visual review
for (const id of ['p1', 'p2', 'p3']) {
  await page.locator('#' + id).screenshot({ path: `${OUT}/proof-${id}.png` });
}

await browser.close();
for (const f of fs.readdirSync(OUT)) {
  console.log(' ', f, (fs.statSync(`${OUT}/${f}`).size / 1024).toFixed(0) + ' KB');
}
