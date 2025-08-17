import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { site: string } }) {
    const siteDir = path.join(process.cwd(), "clones", params.site);
    const indexPath = path.join(siteDir, "index.html");

    let html = "";
    if (fs.existsSync(indexPath)) {
        html = fs.readFileSync(indexPath, "utf-8");

        // ✅ Rewrite local ./assets/... → /api/static/{site}/assets/...
        html = html.replace(/\.\/assets\//g, `/api/static/${params.site}/assets/`);
    }

    return new NextResponse(html, {
        headers: { "Content-Type": "text/html" }
    });
}
