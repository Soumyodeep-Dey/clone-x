import { NextResponse } from "next/server";
import { CoTDriver } from "../../../src/agent/driver";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
    const { url } = await req.json();
    const hostname = new URL(url).hostname.replace("www.", "");
    const outDir = path.join(process.cwd(), "clones", hostname);
    fs.mkdirSync(outDir, { recursive: true });

    // Make sure your OpenAI key is in .env as OPENAI_API_KEY
    const driver = new CoTDriver(`
    You are a website cloning assistant who follows Chain-of-Thought reasoning.
    Always reason step by step, check for legal compliance, and validate assets.
  `);

    const output = await driver.run(
        `Clone ${url} into ${outDir} and summarize the results.`
    );

    // Let the frontend persist/update the project entry to avoid duplicates
    return NextResponse.json({ success: true, message: output });
}
