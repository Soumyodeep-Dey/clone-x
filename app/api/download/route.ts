import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import archiver from "archiver";

export async function POST(req: Request) {
    try {
        const { site } = await req.json();
        const siteDir = path.join(process.cwd(), "clones", site);

        if (!fs.existsSync(siteDir)) {
            return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
        }

        const zipPath = path.join(process.cwd(), "clones", `${site}.zip`);
        const output = fs.createWriteStream(zipPath);
        const archive = archiver("zip", { zlib: { level: 9 } });

        return new Promise((resolve, reject) => {
            output.on("close", () => {
                const fileBuffer = fs.readFileSync(zipPath);
                resolve(
                    new Response(fileBuffer, {
                        headers: {
                            "Content-Type": "application/zip",
                            "Content-Disposition": `attachment; filename=${site}.zip`,
                        },
                    })
                );
            });

            archive.on("error", (err) => reject(err));
            archive.pipe(output);

            // ✅ Include everything inside /clones/{site}
            archive.directory(siteDir, false);

            archive.finalize();
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
    }
}
