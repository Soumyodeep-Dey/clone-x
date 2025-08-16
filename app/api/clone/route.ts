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
        // Step 1: Ask AI for modular React + Tailwind code
        const response = await client.chat.completions.create({
            model: "gpt-4.1",
            messages: [
                {
                    role: "system",
                    content: "You are an AI that rebuilds websites into modular React + Tailwind code for Next.js.",
                },
                {
                    role: "user",
                    content: `Recreate the website at ${url} as a Next.js page using Tailwind CSS. Split sections into components if possible.`,
                },
            ],
        });

        const code = response.choices[0].message.content || "";

        // Step 2: Save generated code into /clones/{domain}/page.tsx
        const outDir = path.join(process.cwd(), "clones", domain);
        fs.ensureDirSync(outDir);
        fs.writeFileSync(path.join(outDir, "page.tsx"), code);

        return NextResponse.json({ success: true, project: { name: domain, url, status: "completed" } });
    } catch (err: unknown) {
        console.error(err);
        return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
    }
}
