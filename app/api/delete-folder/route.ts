import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
    try {
        const { folderName } = await req.json();
        if (!folderName) {
            return NextResponse.json({ success: false, error: "No folder name provided" }, { status: 400 });
        }
        // Only allow safe folder names
        if (!/^[a-zA-Z0-9._-]+$/.test(folderName)) {
            return NextResponse.json({ success: false, error: "Invalid folder name" }, { status: 400 });
        }
        const clonesDir = path.join(process.cwd(), "clones", folderName);
        await fs.rm(clonesDir, { recursive: true, force: true });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message });
    }
}
