import puppeteer from "puppeteer";

export async function checkLegal({ url }: { url: string }) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url);
    const info = await page.evaluate(() => {
        const robots = document.querySelector('meta[name="robots"]');
        const copyright = document.querySelector('*[class*=copyright]');
        const terms = document.querySelector('a[href*="terms"], a[href*="legal"]');
        return {
            robots: robots ? robots.getAttribute("content") : null,
            hasCopyright: !!copyright,
            hasTermsLink: !!terms,
        };
    });
    await browser.close();
    return JSON.stringify(info, null, 2);
}
