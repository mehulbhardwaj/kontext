export interface Decision {
    id: string; // e.g. "adr-001"
    title: string;
    status: 'proposed' | 'accepted' | 'rejected' | 'deprecated' | 'superseded';
    date: string;
    tags: string[]; // e.g. ["frontend", "auth"]
    path: string; // Absolute path to file
    content: string; // Full markdown content (including frontmatter)
    body: string; // Content without frontmatter
}

export interface ContextSummary {
    decisions: Decision[];
    architecture?: string;
    constraints?: string;
}
