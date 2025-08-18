import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(request: Request, ctx: { params: Promise<{ site: string }> }) {
    const { site } = await ctx.params;
    const siteDir = path.join(process.cwd(), "clones", site);
    const indexPath = path.join(siteDir, "index.html");

    let html = "";
    if (fs.existsSync(indexPath)) {
        html = fs.readFileSync(indexPath, "utf-8");

        // Remove <base> tags to avoid resolution against original domain
        html = html.replace(/<base[^>]*>/gi, "");

        // ✅ Rewrite local ./assets/... → /api/static/{site}/assets/...
        html = html.replace(/\.\/assets\//g, `/api/static/${site}/assets/`);
    }

    return new NextResponse(html, {
        headers: { "Content-Type": "text/html" }
    });
}
