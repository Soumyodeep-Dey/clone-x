import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const projectsFile = path.join(process.cwd(), "clones", "projects.json");

interface Project {
    id?: string;
    name?: string;
    [key: string]: unknown;
}

export async function DELETE(req: Request) {
    try {
        const body = await req.json();
        const { id, name } = body;
        if (!id && !name) {
            return NextResponse.json({ error: "Project id or name required" }, { status: 400 });
        }
        if (!fs.existsSync(projectsFile)) {
            return NextResponse.json({ error: "Projects file does not exist" }, { status: 404 });
        }
        const content = fs.readFileSync(projectsFile, "utf-8");
        let projects: Project[] = content.trim() ? JSON.parse(content) : [];
        const initialLength = projects.length;
        projects = projects.filter((project: Project) => {
            if (id && project.id) return project.id !== id;
            if (name && project.name) return project.name !== name;
            return true;
        });
        if (projects.length === initialLength) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }
        fs.writeFileSync(projectsFile, JSON.stringify(projects, null, 2));
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
    }
}

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
