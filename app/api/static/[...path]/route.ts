import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
    req: Request,
    { params }: { params: { path: string[] } }
) {
    const filePath = path.join(process.cwd(), "clones", ...params.path);

    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const ext = path.extname(filePath);
    const contentType =
        ext === ".css"
            ? "text/css"
            : ext === ".js"
                ? "application/javascript"
                : ext.match(/\.(png|jpg|jpeg|gif|svg)$/)
                    ? `image/${ext.replace(".", "")}`
                    : "application/octet-stream";

    const buffer = fs.readFileSync(filePath);
    return new Response(buffer, { headers: { "Content-Type": contentType } });
}
