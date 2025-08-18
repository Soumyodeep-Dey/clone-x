import puppeteer from "puppeteer";

export async function analyzeWebsite({ url }: { url: string }) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const analysis = await page.evaluate(() => ({
        title: document.title,
        elementCount: document.querySelectorAll("*").length,
        scriptBlocks: document.querySelectorAll("script[src]").length,
        externalCSS: document.querySelectorAll("link[rel='stylesheet']").length,
        images: document.querySelectorAll("img").length,
        forms: document.querySelectorAll("form").length
    }));

    await browser.close();
    return JSON.stringify(analysis, null, 2);
}
