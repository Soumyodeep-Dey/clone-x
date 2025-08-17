import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const projectsFile = path.join(process.cwd(), "clones", "projects.json");

export async function GET() {
    try {
        if (!fs.existsSync(projectsFile)) {
            fs.writeFileSync(projectsFile, "[]");
        }
        const content = fs.readFileSync(projectsFile, "utf-8");
        const projects = content.trim() ? JSON.parse(content) : [];
        return NextResponse.json(projects);
    } catch (err) {
        return NextResponse.json({ error: "Failed to load projects" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (!fs.existsSync(projectsFile)) {
            fs.writeFileSync(projectsFile, "[]");
        }
        const content = fs.readFileSync(projectsFile, "utf-8");
        const projects = content.trim() ? JSON.parse(content) : [];

        projects.unshift(body);
        fs.writeFileSync(projectsFile, JSON.stringify(projects, null, 2));

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: "Failed to save project" }, { status: 500 });
    }
}
