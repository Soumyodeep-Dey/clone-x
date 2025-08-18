import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";

export async function validateClone({ originalUrl, clonePath }: { originalUrl: string; clonePath: string; }) {
    const indexPath = path.join(clonePath, "index.html");
    if (!fs.existsSync(indexPath)) {
        return "Validation failed: index.html missing";
    }
    const html = fs.readFileSync(indexPath, "utf-8");
    const $ = cheerio.load(html);

    const missing: string[] = [];
    $("link[href], script[src], img[src]").each((_, el) => {
        const ref = ($(el).attr("href") || $(el).attr("src")) as string;
        if (ref && !ref.startsWith("http")) {
            const full = path.join(clonePath, ref);
            if (!fs.existsSync(full)) missing.push(ref);
        }
    });

    if (missing.length) {
        return `Validation warning: ${missing.length} local assets unresolved.`;
    }
    return "Clone validated successfully.";
}
