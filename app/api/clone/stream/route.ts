import { NextRequest } from "next/server";
import { CoTDriver } from "../../../../src/agent/driver";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    const body = await req.json();
    let url = typeof body?.url === 'string' ? body.url.trim() : '';
    if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
    let hostname = '';
    try {
        hostname = new URL(url).hostname.replace("www.", "");
    } catch {
        return new Response(JSON.stringify({ error: 'Invalid or missing URL' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const outDir = path.join(process.cwd(), "clones", hostname);
    fs.mkdirSync(outDir, { recursive: true });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const sendEvent = (data: any) => {
                const withTs = {
                    timestamp: new Date().toISOString(),
                    ...data,
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(withTs)}\n\n`));
            };

            try {
                // Create a custom logger that sends events
                const streamLogger = {
                    log: (step: string, content: string) => {
                        const event = {
                            type: 'thinking',
                            step,
                            content,
                            timestamp: new Date().toISOString()
                        };
                        sendEvent(event);
                    }
                };

                sendEvent({ type: 'start', message: 'Starting AI cloning process...' });

                // Create a custom driver with the stream logger
                const driver = new CoTDriver(`
                    You are a website cloning assistant who follows Chain-of-Thought reasoning.
                    Always reason step by step, check for legal compliance, and validate assets.
                `);

                // Override the logger in the driver instance
                (driver as any).logger = streamLogger;

                const output = await driver.run(`Clone ${url} into ${outDir} and summarize the results.`);

                // Update project status
                const projectsFile = path.join(process.cwd(), "clones", "projects.json");
                if (fs.existsSync(projectsFile)) {
                    const content = fs.readFileSync(projectsFile, "utf-8");
                    const projects = content.trim() ? JSON.parse(content) : [];
                    
                    let found = false;
                    const updatedProjects = projects.map((project: any) => {
                        if (project.name === hostname || project.url === url) {
                            found = true;
                            return { ...project, status: "completed" };
                        }
                        return project;
                    });
                    
                    if (!found) {
                        updatedProjects.unshift({
                            id: Date.now().toString(),
                            name: hostname,
                            url: url,
                            status: "completed",
                            createdAt: "Just now"
                        });
                    }
                    
                    fs.writeFileSync(projectsFile, JSON.stringify(updatedProjects, null, 2));
                }

                sendEvent({ type: 'complete', message: output, success: true });

            } catch (error) {
                sendEvent({ type: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
            } finally {
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
