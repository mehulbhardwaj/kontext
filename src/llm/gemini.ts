import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    // Use gemini-pro for better reasoning on code
  }


  async restructureContent(content: string, template: string, type: 'decision' | 'architecture'): Promise<string> {
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
    } catch (error) {
      console.error("Error formatting content:", error);
      return content; // Fail safe by returning original
    }
  }

  async generateSuggestions(diff: string, currentContext: string): Promise<any> {

    // Load Template if it exists
    let adrTemplate = "";
    try {
      const templatePath = path.resolve(process.cwd(), ".kontext/templates/decision.md");
      if (fs.existsSync(templatePath)) {
        adrTemplate = fs.readFileSync(templatePath, "utf-8");
      }
    } catch (e) {
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
    } catch (error) {
      console.error("Error generating suggestions:", error);
      return { hasDecision: false, error: "Failed to generate suggestions" };
    }
  }
}
