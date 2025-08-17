import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";  

export async function POST(req: Request) {
    try {
        const { url } = await req.json();
        const res = await fetch(url);
        let html = await res.text();

        const hostname = new URL(url).hostname.replace("www.", "");
        const siteDir = path.join(process.cwd(), "clones", hostname);
        const assetsDir = path.join(siteDir, "assets");

        fs.mkdirSync(assetsDir, { recursive: true });

        // Load HTML into Cheerio
        const $ = cheerio.load(html);

        // Function to download a file and save it locally
        const downloadAsset = async (assetUrl: string, folder: string) => {
            try {
                const absUrl = new URL(assetUrl, url).href;
                const res = await fetch(absUrl);
                if (!res.ok) return null;
                const buffer = await res.arrayBuffer();
                const fileName = path.basename(new URL(absUrl).pathname) || "file";
                const filePath = path.join(folder, fileName);
                fs.writeFileSync(filePath, Buffer.from(buffer));
                return `/clones/${hostname}/assets/${fileName}`;
            } catch (err) {
                console.error("Failed to fetch asset:", assetUrl, err);
                return null;
            }
        };

        // Process CSS
        await Promise.all(
            $("link[rel='stylesheet']").map(async (_, el) => {
                const href = $(el).attr("href");
                if (href) {
                    const localPath = await downloadAsset(href, assetsDir);
                    if (localPath) $(el).attr("href", localPath);
                }
            }).get()
        );

        // Process JS
        await Promise.all(
            $("script[src]").map(async (_, el) => {
                const src = $(el).attr("src");
                if (src) {
                    const localPath = await downloadAsset(src, assetsDir);
                    if (localPath) $(el).attr("src", localPath);
                }
            }).get()
        );

        // Process Images
        await Promise.all(
            $("img").map(async (_, el) => {
                const src = $(el).attr("src");
                if (src) {
                    const localPath = await downloadAsset(src, assetsDir);
                    if (localPath) $(el).attr("src", localPath);
                }
            }).get()
        );

        // Save modified HTML
        html = $.html();
        fs.writeFileSync(path.join(siteDir, "index.html"), html);

        return NextResponse.json({ success: true, site: hostname });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
    }
}
