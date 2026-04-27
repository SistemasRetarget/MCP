#!/usr/bin/env node
// capture-section.mjs <url> <out.png> <viewport_w> <viewport_h> <scroll_y|null> <full_page:0|1>
import { chromium } from 'playwright';

const [, , url, out, vw, vh, scrollY, fullPage] = process.argv;
const viewport = { width: parseInt(vw, 10), height: parseInt(vh, 10) };
const sy = scrollY === 'null' ? null : parseInt(scrollY, 10);
const fp = fullPage === '1';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
await page.waitForTimeout(2000);
if (sy !== null) {
  await page.evaluate((y) => window.scrollTo(0, y), sy);
  await page.waitForTimeout(800);
}
await page.screenshot({ path: out, fullPage: fp });
await browser.close();
console.log(`OK ${out}`);
