import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    // Use gemini-pro for better reasoning on code
  }

  async generateSuggestions(diff: string, currentContext: string): Promise<any> {
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
       - Draft a new ADR (markdown with frontmatter).
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
