import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: Request, context: { params: Promise<{ path: string[] }> }) {
    const { path: pathSegments } = await context.params;
    try {
        const baseDir = path.resolve(process.cwd(), "clones");
        const filePath = path.resolve(baseDir, ...pathSegments);
        if (!filePath.startsWith(baseDir + path.sep)) {
            return NextResponse.json({ error: "Invalid path" }, { status: 403 });
        }

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        const file = fs.readFileSync(filePath);
        const ext = path.extname(filePath).toLowerCase();

        let contentType = "text/plain";
        if (ext === ".html") contentType = "text/html";
        if (ext === ".css") contentType = "text/css";
        if (ext === ".js") contentType = "application/javascript";
        if (ext === ".json") contentType = "application/json";
        if (ext === ".png") contentType = "image/png";
        if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
        if (ext === ".svg") contentType = "image/svg+xml";
        if (ext === ".webp") contentType = "image/webp";
        if (ext === ".gif") contentType = "image/gif";
        if (ext === ".woff2") contentType = "font/woff2";
        if (ext === ".woff") contentType = "font/woff";
        if (ext === ".ttf") contentType = "font/ttf";

        return new Response(file, { headers: { "Content-Type": contentType } });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
