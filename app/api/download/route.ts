import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import archiver from "archiver";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const { site } = await req.json();
        if (typeof site !== "string" || !site.trim()) {
            return NextResponse.json({ success: false, error: "Missing 'site'" }, { status: 400 });
        }
        // Basic sanitization: allow hostname-like values only
        if (!/^[a-z0-9._-]+$/i.test(site)) {
            return NextResponse.json({ success: false, error: "Invalid site name" }, { status: 400 });
        }

        const siteDir = path.join(process.cwd(), "clones", site);

        if (!fs.existsSync(siteDir)) {
            return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
        }

        const archive = archiver("zip", { zlib: { level: 9 } });

        const stream = new ReadableStream({
            start(controller) {
                archive.on("data", (chunk: Buffer) => {
                    controller.enqueue(new Uint8Array(chunk));
                });
                archive.on("end", () => controller.close());
                archive.on("warning", (err) => {
                    // ENOENT warnings can be ignored
                    if ((err as any).code !== "ENOENT") {
                        controller.error(err);
                    }
                });
                archive.on("error", (err) => controller.error(err));

                // ✅ Include everything inside /clones/{site}
                archive.directory(siteDir, false);
                archive.finalize();
            },
            cancel() {
                try { archive.destroy(); } catch {}
            }
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename=${site}.zip`,
                "Cache-Control": "no-store",
            },
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
    }
}
