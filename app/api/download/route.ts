// app/api/download/route.ts
import { NextResponse } from "next/server";
import archiver from "archiver";
import fs from "fs";
import path from "path";
import { PassThrough } from "stream";

export async function POST(req: Request) {
    const { site } = await req.json();
    const folderPath = path.join(process.cwd(), "clones", site);

    if (!fs.existsSync(folderPath)) {
        return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    const archive = archiver("zip");
    const passThrough = new PassThrough();

    archive.directory(folderPath, false);
    archive.finalize();

    archive.pipe(passThrough);

    const webStream = new ReadableStream({
        start(controller) {
            passThrough.on("data", (chunk) => controller.enqueue(chunk));
            passThrough.on("end", () => controller.close());
            passThrough.on("error", (err) => controller.error(err));
        }
    });

    return new Response(webStream, {
        headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename=${site}.zip`,
        },
    });
}
