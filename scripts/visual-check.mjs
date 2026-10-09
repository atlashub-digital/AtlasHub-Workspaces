// Visual + isolation check of the demo build (CORE_MODE=demo). Not part of `npm test`: needs Playwright.
// Usage: PLAYWRIGHT=/path/to/playwright node scripts/visual-check.mjs http://localhost:3103 docs/evidence
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT ?? "playwright");
const [base = "http://localhost:3103", out = "docs/evidence"] = process.argv.slice(2);

const browser = await chromium.launch();
const results = [];
async function login(page, user) {
  await page.goto(`${base}/login`);
  await page.getByRole("button", { name: new RegExp(user) }).click();
  await page.waitForURL(`${base}/`);
}
const check = (name, ok) => { results.push({ name, ok }); console.log(`${ok ? "PASS" : "FAIL"} ${name}`); };

for (const w of [390, 768, 1440]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  const errs = []; page.on("pageerror", (e) => errs.push(e.message)); page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await login(page, "Ana");
  await page.screenshot({ path: `${out}/orgs-${w}.png`, fullPage: true });
  for (const [slug, path] of [["overview", ""], ["workforce", "/workforce"], ["expert", "/expert"], ["ami", "/ami"], ["approvals", "/approvals"]]) {
    await page.goto(`${base}/o/pilot-a-sandbox${path}`); await page.waitForTimeout(700);
    await page.screenshot({ path: `${out}/a-${slug}-${w}.png`, fullPage: true });
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    check(`no horizontal scroll ${slug} @${w}`, sw <= w);
  }
  check(`no console errors @${w}`, errs.length === 0); if (errs.length) console.log("  errors: " + JSON.stringify(errs.slice(0, 3)));
  await page.close();
}

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await login(page, "Ana");
let r = await page.goto(`${base}/o/pilot-b-sandbox`);
check("admin A cannot open tenant B (404)", r.status() === 404);
r = await page.goto(`${base}/o/pilot-c-sandbox/approvals`);
check("admin A cannot open tenant C approvals (404)", r.status() === 404);
await login(page, "Carla");
await page.goto(`${base}/o/pilot-c-sandbox/ami`);
check("tenant C sees AMI locked (expired trial does not unlock)", await page.getByText("Módulo AMI não ativo").isVisible());
await page.waitForTimeout(1200); await page.screenshot({ path: `${out}/c-ami-locked-1440.png`, fullPage: true });
await page.goto(`${base}/o/pilot-c-sandbox`);
check("community module visible for C", await page.getByRole("link", { name: /Comunidade/ }).first().isVisible());
await page.waitForTimeout(1200); await page.screenshot({ path: `${out}/c-overview-1440.png`, fullPage: true });
await login(page, "Supervisor AtlasHub 1");
const cards = await page.locator("a[href^='/o/']").count();
check("supervisor 1 sees exactly tenants A and B", cards === 2);
await page.goto(`${base}/o/pilot-b-sandbox`);
check("media module chip visible for B", await page.getByText("module.media").isVisible());
await page.waitForTimeout(1200); await page.screenshot({ path: `${out}/b-overview-1440.png`, fullPage: true });
r = await page.goto(`${base}/o/pilot-c-sandbox`);
check("supervisor 1 cannot open tenant C (404)", r.status() === 404);
r = await page.goto(`${base}/o/atlas-synthetic-qa`);
check("supervisor 1 cannot open the QA tenant (404)", r.status() === 404);
await login(page, "QA");
await page.goto(`${base}/`);
await page.waitForTimeout(1200); await page.screenshot({ path: `${out}/qa-orgs-1440.png`, fullPage: true });
for (const t of ["pilot-a-sandbox", "pilot-b-sandbox", "pilot-c-sandbox"]) { r = await page.goto(`${base}/o/${t}/workforce`); check(`QA cannot open ${t} (404)`, r.status() === 404); }
await browser.close();
const failed = results.filter((x) => !x.ok).length;
console.log(`${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
