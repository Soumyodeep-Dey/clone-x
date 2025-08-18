import { ChatCompletionTool } from "openai/resources/chat/completions";

export const toolSchemas: ChatCompletionTool[] = [
    {
        type: "function",
        function: {
            name: "analyzeWebsite",
            description: "Analyze website structure, complexity, and requirements",
            parameters: {
                type: "object",
                properties: {
                    url: { type: "string", description: "Website URL to analyze" },
                },
                required: ["url"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "cloneWebsite",
            description: "Clone website with intelligent asset management",
            parameters: {
                type: "object",
                properties: {
                    url: { type: "string", description: "Website URL to clone" },
                    outputDir: { type: "string", description: "Output directory path" },
                },
                required: ["url", "outputDir"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "validateClone",
            description: "Validate cloned website quality and completeness",
            parameters: {
                type: "object",
                properties: {
                    originalUrl: { type: "string", description: "Original website URL" },
                    clonePath: { type: "string", description: "Path to cloned website" },
                },
                required: ["originalUrl", "clonePath"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "checkLegal",
            description: "Check legal and ethical considerations for website cloning",
            parameters: {
                type: "object",
                properties: {
                    url: { type: "string", description: "Website URL to check" },
                },
                required: ["url"],
            },
        },
    },
];
