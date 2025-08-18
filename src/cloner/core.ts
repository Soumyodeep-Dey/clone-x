import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";

export async function saveResources(resources: Map<string, Buffer>, outputDir: string, baseUrl: string) {
    const saved = new Map();
    for (const [resourceUrl, buff] of resources) {
        const urlObj = new URL(resourceUrl, baseUrl);
        const filename = path.basename(urlObj.pathname) || "index.html";
        const folder = "assets";
        const target = path.join(outputDir, folder, filename);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, buff);
        saved.set(resourceUrl, `./assets/${filename}`);
    }
    return saved;
}

export function rewritePaths(html: string, mapping: Map<string, string>, baseUrl: string) {
    const $ = cheerio.load(html);

    // Remove <base> tags to ensure relative paths resolve locally after download
    $('base').remove();

    const mapUrl = (u: string | undefined) => {
        if (!u) return undefined;
        try {
            const abs = new URL(u, baseUrl).href;
            return mapping.get(abs);
        } catch {
            return undefined;
        }
    };

    // Rewrite common asset references in HTML
    $("link[rel='stylesheet'], script[src], img[src], link[rel*='icon'], link[rel='apple-touch-icon'], link[rel='mask-icon']").each((_, el) => {
        ["href", "src"].forEach((attr) => {
            const ref = $(el).attr(attr);
            const mapped = mapUrl(ref);
            if (mapped) $(el).attr(attr, mapped);
        });
    });

    // Rewrite srcset
    $("img[srcset]").each((_, el) => {
        const srcset = $(el).attr("srcset");
        if (!srcset) return;
        const parts = srcset.split(",").map(s => s.trim());
        const rewritten = parts.map(part => {
            const [url, descriptor] = part.split(/\s+/);
            const mapped = mapUrl(url);
            return [mapped || url, descriptor].filter(Boolean).join(" ");
        }).join(", ");
        $(el).attr("srcset", rewritten);
    });

    // Rewrite <use href="..."> inside SVGs
    $("use").each((_, el) => {
        const href = $(el).attr("href") || $(el).attr("xlink:href");
        const mapped = mapUrl(href);
        if (mapped) {
            $(el).attr("href", mapped);
            $(el).attr("xlink:href", mapped);
        }
    });

    return $.html();
}

// Rewrite URLs inside CSS files saved in outputDir/assets by replacing any occurrence
// of original resource URLs with their mapped local paths.
export function rewriteCssInOutput(outputDir: string, mapping: Map<string, string>, baseUrl: string) {
    const assetsDir = path.join(outputDir, "assets");
    if (!fs.existsSync(assetsDir)) return;
    const walk = (dir: string) => {
        for (const entry of fs.readdirSync(dir)) {
            const full = path.join(dir, entry);
            const stat = fs.statSync(full);
            if (stat.isDirectory()) walk(full);
            else if (full.toLowerCase().endsWith(".css")) {
                let css = fs.readFileSync(full, "utf-8");
                // Direct replace for any absolute original URLs we know about
                for (const [orig, local] of mapping.entries()) {
                    if (css.includes(orig)) {
                        css = css.split(orig).join(local);
                    }
                }

                // Rewrite url(...) references that are root-absolute or relative in CSS
                const rewriteCssUrl = (raw: string) => {
                    const trimmed = raw.trim().replace(/^['\"]|['\"]$/g, "");
                    if (!trimmed || trimmed.startsWith("data:")) return raw; // ignore data URIs
                    try {
                        const absolute = new URL(trimmed, baseUrl).href;
                        const mapped = mapping.get(absolute);
                        if (mapped) {
                            // Preserve original quoting
                            const quote = raw.trim().startsWith('"') ? '"' : raw.trim().startsWith("'") ? "'" : '';
                            return `${quote}${mapped}${quote}`;
                        }
                    } catch {}
                    return raw;
                };

                css = css.replace(/url\(([^)]+)\)/g, (_m, p1) => `url(${rewriteCssUrl(p1)})`);
                css = css.replace(/@import\s+(url\(([^)]+)\)|["\']([^"\']+)["\'])/g, (m) => {
                    const matchUrl = m.match(/url\(([^)]+)\)/);
                    if (matchUrl) return `@import url(${rewriteCssUrl(matchUrl[1])})`;
                    const matchQuoted = m.match(/@import\s+(["\'])([^"\']+)\1/);
                    if (matchQuoted) {
                        const replaced = rewriteCssUrl(matchQuoted[2]);
                        const q = matchQuoted[1];
                        return `@import ${q}${replaced}${q}`;
                    }
                    return m;
                });
                fs.writeFileSync(full, css);
            }
        }
    };
    walk(assetsDir);
}
