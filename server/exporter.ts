import express from "express";
import { chromium } from "playwright";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "1mb" }));

const PORT = Number(process.env.EXPORT_PORT || 4001);
const EXPORT_BASE_URL = process.env.EXPORT_BASE_URL || "http://localhost:5173";

function buildProfitExportUrl(payload: any, req: express.Request): string {
  const params = new URLSearchParams();
  const allow = [
    "userType",
    "usdPayout",
    "netRobux",
    "effectiveTakeRate",
    "grossRobux",
    "marketplaceFee",
    "adSpend",
    "groupSplits",
    "affiliatePayouts",
    "refunds",
    "otherCosts",
  ];
  for (const k of allow) {
    if (payload[k] !== undefined && payload[k] !== null) {
      params.set(k, String(payload[k]));
    }
  }
  const originHeader = req.get("origin");
  const baseFromBody =
    typeof payload.base === "string" && payload.base.length > 0
      ? payload.base
      : undefined;
  const base = baseFromBody || originHeader || EXPORT_BASE_URL;
  return `${base}/export/profit?${params.toString()}`;
}

async function openAndPrepare(url: string) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  // Wait for fonts
  await page.evaluate(async () => {
    const f = (document as any).fonts;
    if (f?.ready) await f.ready;
  });
  await page.waitForTimeout(100);
  return { browser, context, page };
}

app.post("/export/profit.png", async (req, res) => {
  const url = buildProfitExportUrl(req.body || {}, req);
  let browser;
  try {
    const opened = await openAndPrepare(url);
    browser = opened.browser;
    const el = opened.page.locator("#buxtax-card-profit-calculator");
    await el.waitFor({ state: "visible", timeout: 5000 });
    const buffer = await el.screenshot({
      type: "png",
      scale: "css",
      animations: "disabled",
    });
    res.type("image/png").send(buffer);
  } catch (e: any) {
    console.error("PNG export failed", e);
    res
      .status(500)
      .json({ error: "PNG export failed", message: e?.message, url });
  } finally {
    try {
      await browser?.close();
    } catch {}
  }
});

// Public GET endpoint for social sharing to reference an image by URL
// Example: GET /image/profit.png?userType=gameDev&usdPayout=24.5&netRobux=7000&effectiveTakeRate=0.3
app.get("/image/profit.png", async (req, res) => {
  const url = buildProfitExportUrl(req.query || {}, req as any);
  let browser;
  try {
    const opened = await openAndPrepare(url);
    browser = opened.browser;
    const el = opened.page.locator("#buxtax-card-profit-calculator");
    await el.waitFor({ state: "visible", timeout: 5000 });
    const buffer = await el.screenshot({
      type: "png",
      scale: "css",
      animations: "disabled",
    });
    res.type("image/png").send(buffer);
  } catch (e: any) {
    console.error("GET PNG export failed", e);
    res
      .status(500)
      .json({ error: "PNG export failed", message: e?.message, url });
  } finally {
    try {
      await browser?.close();
    } catch {}
  }
});

app.post("/export/profit.pdf", async (req, res) => {
  const url = buildProfitExportUrl(req.body || {}, req);
  let browser;
  try {
    const opened = await openAndPrepare(url);
    browser = opened.browser;
    // Either element screenshot to PDF or native page.pdf; choose element screenshot for fidelity
    const el = opened.page.locator("#buxtax-card-profit-calculator");
    await el.waitFor({ state: "visible", timeout: 5000 });
    const png = await el.screenshot({
      type: "png",
      scale: "css",
      animations: "disabled",
    });

    // Simple PDF container using pdf-lib avoided to keep deps tiny; use Playwright page.pdf by loading the image into page
    // Instead, use native page.pdf of the whole page at a fixed width to keep simple
    const pdfBuffer = await opened.page.pdf({
      printBackground: true,
      width: "1200px",
    });
    res.type("application/pdf").send(pdfBuffer);
  } catch (e: any) {
    console.error("PDF export failed", e);
    res
      .status(500)
      .json({ error: "PDF export failed", message: e?.message, url });
  } finally {
    try {
      await browser?.close();
    } catch {}
  }
});

app.listen(PORT, () => {
  console.log(`[exporter] listening on http://localhost:${PORT}`);
});
