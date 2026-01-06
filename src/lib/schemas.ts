import { z } from 'zod';

export const StatusSchema = z.enum(['proposed', 'accepted', 'deprecated', 'rejected']);

export const DateSchema = z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    z.date().transform(d => d.toISOString().split('T')[0])
]);

export const IndexSchema = z.object({
    type: z.literal('index'),
    last_updated: DateSchema,
    priority_files: z.array(z.string()),
});

export const DecisionSchema = z.object({
    type: z.literal('decision'),
    id: z.string().regex(/^adr-\d{3}$/, 'ID must be adr-XXX'),
    status: StatusSchema.default('proposed'),
    date: DateSchema,
    tags: z.array(z.string()).optional(),
}).passthrough();

export type KontextIndex = z.infer<typeof IndexSchema>;
export type KontextDecision = z.infer<typeof DecisionSchema>;
