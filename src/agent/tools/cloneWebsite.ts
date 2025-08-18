import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";
import { saveResources, rewritePaths, rewriteCssInOutput } from "../../cloner/core";

export async function cloneWebsite({ url, outputDir }: { url: string; outputDir: string; }) {
    const browser = await puppeteer.launch({ headless: true, args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--ignore-certificate-errors"
    ] });
    const page = await browser.newPage();
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
    const resources = new Map<string, Buffer>();

    page.on("response", async (response) => {
        try {
            const rUrl = response.url();
            const type = response.request().resourceType();
            if (["document", "stylesheet", "script", "image", "font", "media"].includes(type)) {
                const buff = await response.buffer();
                resources.set(rUrl, buff);
            }
        } catch { }
    });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 90000 });
    // Give some extra time for lazy resources to settle
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const html = await page.content();
    await browser.close();

    // Ensure output directory exists
    fs.mkdirSync(outputDir, { recursive: true });

    try {
        const mapping = await saveResources(resources, outputDir, url);
        const rewritten = rewritePaths(html, mapping, url);
        fs.writeFileSync(path.join(outputDir, "index.html"), rewritten);
        // Also adjust URLs inside saved CSS so icon/font/image references resolve locally
        rewriteCssInOutput(outputDir, mapping);
        return `Clone complete: ${mapping.size} resources saved.`;
    } catch (err) {
        // Fallback: write raw HTML so preview is never blank
        fs.writeFileSync(path.join(outputDir, "index.html"), html);
        return "Clone completed with fallback HTML (assets may be missing).";
    }
}
