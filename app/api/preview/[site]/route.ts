import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
    req: Request,
    context: { params: { site: string } }
) {
    const { site } = await context.params;
    const siteDir = path.join(process.cwd(), "clones", site, "index.html");

    if (!fs.existsSync(siteDir)) {
        return NextResponse.json({ error: "Preview not found" }, { status: 404 });
    }

    const html = fs.readFileSync(siteDir, "utf-8");

    return new Response(html, {
        headers: {
            "Content-Type": "text/html",
        },
    });
}
