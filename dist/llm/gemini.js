"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiClient = void 0;
const generative_ai_1 = require("@google/generative-ai");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class GeminiClient {
    constructor(apiKey) {
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        // Use gemini-pro for better reasoning on code
    }
    async distillContext(fileContents) {
        const prompt = `
    You are the Chief Historian of a software project.
    Your goal is to REDUCE "Context Entropy" by merging duplicate or highly overlapping Architectural Decision Records (ADRs).
    
    Safety Rules:
    1. NEVER lose a constraint (e.g. "Use Redis").
    2. NEVER lose a decided timestamp or status.
    3. If two ADRs conflict, do NOT merge them. Flag them as CONFLICT.
    4. If ADRs are distinct and valid, Suggest NO CHANGE.

    Input Files:
    ${JSON.stringify(fileContents, null, 2)}

    Action:
    Identify a set of files that can be MERGED into a single Canonical ADR.
    If no obvious merges exist, return { "hasMerge": false }.

    Format:
    {
        "hasMerge": boolean,
        "rationale": "Why these files should be merged.",
        "filesToDelete": ["path/to/duplicate1.md", "path/to/duplicate2.md"],
        "mergedFile": {
            "path": "path/to/canonical_adr.md",
            "content": "The full markdown content of the merged ADR..."
        }
    }
    
    Respond ONLY with the JSON.
    `;
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(text);
        }
        catch (error) {
            console.error("Error distilling content:", error);
            return { hasMerge: false, error: "Failed to distill." };
        }
    }
    async restructureContent(content, template, type) {
        const prompt = `
      You are a Strict Documentation Librarian.
      Your goal is to REWRITE the provided content so that it EXACTLY matches the provided Markdown Template.
      
      Input Content:
      ${content}

      Target Template:
      ${template}

      Instructions:
      1. Preserve ALL informational warnings, ID, Status, and core technical details from the Input.
      2. Move information into the correct sections of the Template.
      3. If the Input is missing a section required by the Template, put "N/A" or leave empty if appropriate, but do NOT remove the section header.
      4. Do NOT hallucinate new technical facts.
      5. Output ONLY the valid Markdown.
      `;
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text().replace(/```markdown/g, "").replace(/```/g, "").trim();
        }
        catch (error) {
            console.error("Error formatting content:", error);
            return content; // Fail safe by returning original
        }
    }
    async generateSuggestions(diff, currentContext) {
        // Load Template if it exists
        let adrTemplate = "";
        try {
            const templatePath = path_1.default.resolve(process.cwd(), ".kontext/templates/decision.md");
            if (fs_1.default.existsSync(templatePath)) {
                adrTemplate = fs_1.default.readFileSync(templatePath, "utf-8");
            }
        }
        catch (e) {
            // ignore
        }
        const templateInstruction = adrTemplate
            ? `\nIMPORTANT: You MUST follow this exact markdown template for the ADR:\n${adrTemplate}\nReplace {id} with the next available ID (e.g. adr-001) and other placeholders with content.`
            : `\nDraft a new ADR (markdown with frontmatter).`;
        const prompt = `
    You are a Senior Technical Architect reviewing a code change.
    Your goal is to maintain the "Architectural Decision Records" (ADRs) and "Architecture Map" for this project.

    I will provide you with:
    1. The git diff of the changes.
    2. The current context (list of existing decisions/architecture).
    
    You must:
    1. Identify if this change represents a SIGNIFICANT architectural decision (e.g., adding a library, changing a pattern, new data model).
    2. If NO significant decision: return { "hasDecision": false }.
    3. If YES:
       - ${templateInstruction}
       - OR suggest an update to architecture.md.
       - Return valid JSON.

    Format:
    {
      "hasDecision": boolean,
      "reasoning": "string (brief explanation)",
      "proposedFiles": [
        {
          "filePath": ".kontext/decisions/adr-XXX-slug.md",
          "content": "string (full file content)"
        }
      ]
    }

    Current Context Summary:
    ${currentContext}

    Git Diff:
    ${diff}
    
    Respond ONLY with the JSON.
    `;
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            // Clean up markdown code blocks if Gemini wraps it
            const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(jsonStr);
        }
        catch (error) {
            console.error("Error generating suggestions:", error);
            return { hasDecision: false, error: "Failed to generate suggestions" };
        }
    }
}
exports.GeminiClient = GeminiClient;
