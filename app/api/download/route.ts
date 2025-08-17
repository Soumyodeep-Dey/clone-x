import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
    const { site } = await req.json();
    const folderPath = path.join(process.cwd(), "clones", site);

    if (!fs.existsSync(folderPath)) {
        return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    const files = fs.readdirSync(folderPath);
    const zip = await import("jszip"); // use jszip instead of archiver for Next.js
    const JSZip = zip.default;
    const archive = new JSZip();

    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const content = fs.readFileSync(filePath);
        archive.file(file, content);
    }

    const blob = await archive.generateAsync({ type: "nodebuffer" });

    // Convert Buffer to Uint8Array for Response
    const uint8Array = new Uint8Array(blob);

    return new Response(uint8Array, {
        headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename=${site}.zip`,
        },
    });
}
