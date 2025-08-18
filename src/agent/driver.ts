import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import * as tools from "./tools/index";
import { logger } from "../../shared/log";

const TOOL_MAP: Record<string, Function> = {
    analyzeWebsite: tools.analyzeWebsite,
    cloneWebsite: tools.cloneWebsite,
    validateClone: tools.validateClone,
    checkLegal: tools.checkLegal,
};

export class CoTDriver {
    private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    private history: ChatCompletionMessageParam[] = [];
    public logger = logger; // Make logger accessible
    // Track tool progress to avoid stalls or refusals
    private didLegal = false;
    private didAnalyze = false;
    private didClone = false;
    private didValidate = false;

    constructor(private systemPrompt: string) {
        const enhancedSystemPrompt = `
            You are an AI assistant who works on START, THINK, TOOL, OBSERVE and OUTPUT format.
            For a given user query first think and breakdown the problem into sub problems.
            You should always keep thinking and thinking before giving the actual output.
            
            CRITICAL: You MUST call the appropriate tools to actually perform the requested actions.
            Do not skip tool calls - they are essential for completing the task.
            If you skip tool calls, the task will NOT be completed.
            
            For every tool call that you make, wait for the OBSERVATION from the tool which is the
            response from the tool that you called.

            Available Tools:
            - analyzeWebsite(url: string): Analyzes website structure, complexity, and requirements
            - cloneWebsite(url: string, outputDir: string): Clones website with intelligent asset management
            - validateClone(originalUrl: string, clonePath: string): Validates cloned website quality and completeness
            - checkLegal(url: string): Checks legal and ethical considerations for website cloning

            Rules:
            - Strictly follow the output JSON format
            - Always follow the output in sequence that is START, THINK, TOOL, OBSERVE and OUTPUT.
            - Always perform only one step at a time and wait for other step.
            - Always make sure to do multiple steps of thinking before giving out output.
            - For every tool call always wait for the OBSERVE which contains the output from tool
            - NEVER skip TOOL calls - they are required to complete the task
            - For website cloning, you MUST call: checkLegal, analyzeWebsite, cloneWebsite, validateClone
            - DO NOT provide OUTPUT until you have called ALL required tools and received their OBSERVATIONS
            - When including file system paths, prefer forward slashes (e.g., D:/path/to) or ensure backslashes are escaped in JSON (e.g., "D\\\\path\\\\to")
            - Legal/ethical check is ADVISORY only; regardless of the result, you MUST proceed to clone as this is a local learning project
            - If you omit the tool_name in TOOL step, default to the next tool in sequence: checkLegal → analyzeWebsite → cloneWebsite → validateClone

            Output JSON Format:
            { "step": "START | THINK | TOOL | OBSERVE | OUTPUT" , "content": "string", "tool_name": "string", "input": "object" }

            ${systemPrompt}
        `;
        this.history.push({ role: "system" as const, content: enhancedSystemPrompt });
    }

    async run(userGoal: string) {
        this.history.push({ role: "user" as const, content: userGoal });
        this.logger.log("🤖 AI Driver", `Starting with goal: ${userGoal}`);
        
        let iterationCount = 0;
        const maxIterations = 50; // Safety limit raised for faster convergence
        
        while (iterationCount < maxIterations) {
            iterationCount++;
            this.logger.log("🔄 Iteration", `${iterationCount}/${maxIterations}`);
            
            const response = await this.openai.chat.completions.create({
                model: "gpt-4.1-mini",
                messages: this.history,
                temperature: 0.2,
                max_tokens: 200,
                response_format: { type: "json_object" },
                stream: false
            });

            const msgContent = response.choices[0].message.content as any;
            const contentTextRaw = typeof msgContent === 'string'
                ? msgContent
                : Array.isArray(msgContent)
                    ? msgContent.map((p: any) => p?.text ?? '').join('')
                    : '';
            // Strip markdown fences if model wrapped JSON in ```json ... ```
            const contentText = contentTextRaw
                .replace(/^```json\s*/i, '')
                .replace(/```\s*$/i, '')
                .trim();
            if (!contentText) continue;

            try {
                let parsedContent: any;
                try {
                    parsedContent = JSON.parse(contentText);
                } catch (_err) {
                    // Fallback: escape backslashes to handle Windows paths that break JSON
                    const fixed = contentText.replace(/\\/g, "\\\\");
                    parsedContent = JSON.parse(fixed);
                }
                this.history.push({
                    role: "assistant" as const,
                    content: JSON.stringify(parsedContent)
                });

                if (parsedContent.step === 'START') {
                    this.logger.log("🔥 START", parsedContent.content);
                    continue;
                }

                if (parsedContent.step === 'THINK') {
                    this.logger.log("🧠 THINK", parsedContent.content);
                    // If the model keeps thinking without acting, nudge it to use tools
                    if (iterationCount >= 3) {
                        this.history.push({
                            role: "user" as const,
                            content: "Proceed to TOOL step. Call the appropriate tool with proper JSON input."
                        });
                    }
                    continue;
                }

                if (parsedContent.step === 'TOOL') {
                    let toolToCall: string | undefined = parsedContent.tool_name;
                    if (!toolToCall) {
                        // Default to next required tool in sequence
                        if (!this.didLegal) toolToCall = 'checkLegal';
                        else if (!this.didAnalyze) toolToCall = 'analyzeWebsite';
                        else if (!this.didClone) toolToCall = 'cloneWebsite';
                        else if (!this.didValidate) toolToCall = 'validateClone';
                    }
                    if (!toolToCall || !(toolToCall in TOOL_MAP)) {
                        this.logger.log("❌ Tool Error", `No such tool: ${toolToCall ?? 'undefined'}`);
                        this.history.push({
                            role: "developer" as const,
                            content: JSON.stringify({ 
                                step: 'OBSERVE', 
                                content: `There is no such tool as ${toolToCall ?? 'undefined'}` 
                            })
                        });
                        continue;
                    }

                    this.logger.log("🛠️ TOOL", `${toolToCall}(${JSON.stringify(parsedContent.input)})`);
                    const responseFromTool = await TOOL_MAP[toolToCall](parsedContent.input);
                    // Mark progress
                    if (toolToCall === 'checkLegal') this.didLegal = true;
                    if (toolToCall === 'analyzeWebsite') this.didAnalyze = true;
                    if (toolToCall === 'cloneWebsite') this.didClone = true;
                    if (toolToCall === 'validateClone') this.didValidate = true;
                    this.logger.log("📤 OBSERVE", responseFromTool);
                    
                    this.history.push({
                        role: "developer" as const,
                        content: JSON.stringify({ 
                            step: 'OBSERVE', 
                            content: responseFromTool 
                        })
                    });
                    continue;
                }

                if (parsedContent.step === 'OUTPUT') {
                    // Check if any tools were called in this session
                    const hasToolCalls = this.history.some(msg => 
                        msg.role === "developer" && 
                        typeof msg.content === 'string' && 
                        JSON.parse(msg.content).step === 'OBSERVE'
                    );
                    
                    if (!hasToolCalls) {
                        this.logger.log("❌ No tools called", "Rejecting OUTPUT without tool execution");
                        this.history.push({
                            role: "user" as const,
                            content: "You must call the required tools before providing OUTPUT. Please call checkLegal, analyzeWebsite, cloneWebsite, and validateClone tools first."
                        });
                        continue;
                    }
                    
                    this.logger.log("✅ OUTPUT", parsedContent.content);
                    return parsedContent.content;
                }

            } catch (error) {
                this.logger.log("❌ JSON Parse Error", `Failed to parse: ${contentText}`);
                // If JSON parsing fails, treat as regular message
                this.history.push({
                    role: "assistant" as const,
                    content: contentText
                });
            }
        }
        
        this.logger.log("❌ Max iterations reached", "Process terminated for safety");
        return "Process terminated: Maximum iterations reached";
    }
}
