import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
// No need to import fetch; Next.js provides native fetch in API routes.
/*
 * No need to import 'node-fetch' or 'fetch' in Next.js API routes.
 * The global fetch API is available by default.
 */
export async function POST(req: Request) {
    try {
        const { url } = await req.json();
        const res = await fetch(url);
        const html = await res.text();

        const hostname = new URL(url).hostname.replace("www.", "");
        const siteDir = path.join(process.cwd(), "clones", hostname);

        if (!fs.existsSync(siteDir)) {
            fs.mkdirSync(siteDir, { recursive: true });
        }

        // ✅ Save as index.html
        fs.writeFileSync(path.join(siteDir, "index.html"), html);

        return NextResponse.json({ success: true, site: hostname });
    } catch (err) {
        return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
    }
}
