import path from 'path';
import fs from 'fs-extra';
import matter from 'gray-matter';
import { Decision, ContextSummary } from '../types';

export async function getContext(kontextDir: string): Promise<ContextSummary> {
    const decisionsDir = path.join(kontextDir, 'decisions');
    const decisions: Decision[] = [];

    if (fs.existsSync(decisionsDir)) {
        const files = await fs.readdir(decisionsDir);
        for (const file of files) {
            if (!file.endsWith('.md')) continue;

            const filePath = path.join(decisionsDir, file);
            const rawContent = await fs.readFile(filePath, 'utf-8');
            const parsed = matter(rawContent);

            // Basic validation: must have ID and Status
            if (parsed.data.id && parsed.data.status) {
                decisions.push({
                    id: parsed.data.id,
                    title: parsed.data.title || "Untitled",
                    status: parsed.data.status,
                    date: parsed.data.date || "",
                    tags: parsed.data.tags || [],
                    path: filePath,
                    content: rawContent,
                    body: parsed.content
                });
            }
        }
    }

    // Sort by ID is usually good for chronological order
    decisions.sort((a, b) => a.id.localeCompare(b.id));

    return { decisions };
}

export function filterDecisions(decisions: Decision[], focus?: string): Decision[] {
    // 1. Filter out rejected/deprecated/superseded unless explicitly asked?
    // For now, let's keep 'accepted' and 'proposed'.
    let active = decisions.filter(d => ['accepted', 'proposed'].includes(d.status));

    // 2. Focus Filter
    if (focus) {
        const focusTerm = focus.toLowerCase();
        active = active.filter(d => {
            // Check if ANY tag matches the focus term
            // Or if the tag is 'global' / 'core' (always include)
            const tags = d.tags.map(t => t.toLowerCase());
            return tags.includes(focusTerm) || tags.includes('global') || tags.includes('core');
        });
    }

    return active;
}

export function formatContextBlock(decisions: Decision[]): string {
    if (decisions.length === 0) return "";

    let output = "## Active Architectural Decisions\n\n";

    // Condensed Format for Token Efficiency
    output += "| ID | Status | Title | Tags |\n";
    output += "| :--- | :--- | :--- | :--- |\n";

    for (const d of decisions) {
        output += `| ${d.id} | ${d.status} | ${d.title} | ${d.tags.join(', ')} |\n`;
    }

    output += "\n### Decision Summaries\n";
    for (const d of decisions) {
        // Extract the "Decision" section if possible, otherwise first paragraph
        // This is a naive heuristic, we can improve later.
        output += `\n**${d.id}**: ${extractDecisionSummary(d.body)}\n`;
    }

    return output;
}

function extractDecisionSummary(body: string): string {
    // Look for "## Decision" header
    const decisionMatch = body.match(/## Decision\n([\s\S]*?)(?=\n##|$)/);
    if (decisionMatch) {
        return decisionMatch[1].trim();
    }
    // Fallback: first 100 chars
    return body.slice(0, 200).replace(/\n/g, ' ') + "...";
}
