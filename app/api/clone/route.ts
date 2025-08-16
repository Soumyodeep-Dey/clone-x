import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs-extra";
import path from "path";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
    const { url } = await req.json();
    const domain = new URL(url).hostname.replace("www.", "");

    try {
        // Step 1: Ask AI for Next.js + Tailwind clone
        const response = await client.chat.completions.create({
            model: "gpt-4.1", // swap with gpt-4o-mini if needed
            messages: [
                { role: "system", content: "You are an AI that clones websites into React + Tailwind Next.js code." },
                { role: "user", content: `Recreate the website at ${url} as a Next.js page using Tailwind CSS.` },
            ],
        });

        const code = response.choices[0].message.content || "";

        // Step 2: Save output in /clones/{domain}/page.tsx
        const outDir = path.join(process.cwd(), "clones", domain);
        fs.ensureDirSync(outDir);
        fs.writeFileSync(path.join(outDir, "page.tsx"), code);

        return NextResponse.json({ success: true, project: { name: domain, url, status: "completed" } });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
