import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import * as cheerio from "cheerio"; // npm install cheerio

export async function POST(req: Request) {
    try {
        const { url } = await req.json();
        const res = await fetch(url);
        let html = await res.text();

        const hostname = new URL(url).hostname.replace("www.", "");
        const siteDir = path.join(process.cwd(), "clones", hostname);
        const assetsDir = path.join(siteDir, "assets");

        fs.mkdirSync(assetsDir, { recursive: true });

        const $ = cheerio.load(html);

        // Helper: download asset
        const downloadAsset = async (assetUrl: string, folder: string) => {
            try {
                const absUrl = new URL(assetUrl, url).href;
                const res = await fetch(absUrl);
                if (!res.ok) return null;

                const buffer = await res.arrayBuffer();
                const fileName = path.basename(new URL(absUrl).pathname) || `file-${Date.now()}`;
                const filePath = path.join(folder, fileName);

                fs.writeFileSync(filePath, Buffer.from(buffer));
                return `./assets/${fileName}`;
            } catch (err) {
                console.error("Failed to fetch asset:", assetUrl, err);
                return null;
            }
        };

        // Helper: process CSS (download + rewrite url(...) )
        const processCss = async (cssUrl: string, folder: string) => {
            try {
                const absUrl = new URL(cssUrl, url).href;
                const res = await fetch(absUrl);
                if (!res.ok) return null;

                let css = await res.text();

                // Find all url(...) in CSS
                const urlRegex = /url\(([^)]+)\)/g;
                const matches = [...css.matchAll(urlRegex)];

                for (const match of matches) {
                    const assetRef = match[1].replace(/['"]/g, ""); // remove quotes
                    if (assetRef.startsWith("data:")) continue; // skip base64 inline

                    const localPath = await downloadAsset(assetRef, folder);
                    if (localPath) {
                        css = css.replace(match[1], localPath);
                    }
                }

                // Save CSS
                const fileName = path.basename(new URL(absUrl).pathname) || `style-${Date.now()}.css`;
                const filePath = path.join(folder, fileName);
                fs.writeFileSync(filePath, css);

                return `./assets/${fileName}`;
            } catch (err) {
                console.error("Failed to process CSS:", cssUrl, err);
                return null;
            }
        };

        // CSS <link>
        await Promise.all(
            $("link[rel='stylesheet']").map(async (_, el) => {
                const href = $(el).attr("href");
                if (href) {
                    let localPath;
                    if (href.includes("fonts.googleapis.com")) {
                        // ✅ Special: Google Fonts
                        localPath = await processCss(href, assetsDir);
                    } else {
                        localPath = await downloadAsset(href, assetsDir);
                    }
                    if (localPath) $(el).attr("href", localPath);
                }
            }).get()
        );

        // JS <script>
        await Promise.all(
            $("script[src]").map(async (_, el) => {
                const src = $(el).attr("src");
                if (src) {
                    const localPath = await downloadAsset(src, assetsDir);
                    if (localPath) $(el).attr("src", localPath);
                }
            }).get()
        );

        // Images <img>
        await Promise.all(
            $("img").map(async (_, el) => {
                const src = $(el).attr("src");
                if (src) {
                    const localPath = await downloadAsset(src, assetsDir);
                    if (localPath) $(el).attr("src", localPath);
                }
            }).get()
        );

        // ✅ Save final HTML
        html = $.html();
        fs.writeFileSync(path.join(siteDir, "index.html"), html);

        return NextResponse.json({ success: true, site: hostname });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
    }
}
