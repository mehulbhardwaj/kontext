"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionSchema = exports.IndexSchema = exports.DateSchema = exports.StatusSchema = void 0;
const zod_1 = require("zod");
exports.StatusSchema = zod_1.z.enum(['proposed', 'accepted', 'deprecated', 'rejected']);
exports.DateSchema = zod_1.z.union([
    zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    zod_1.z.date().transform(d => d.toISOString().split('T')[0])
]);
exports.IndexSchema = zod_1.z.object({
    type: zod_1.z.literal('index'),
    last_updated: exports.DateSchema,
    priority_files: zod_1.z.array(zod_1.z.string()),
});
exports.DecisionSchema = zod_1.z.object({
    type: zod_1.z.literal('decision'),
    id: zod_1.z.string().regex(/^adr-\d{3}$/, 'ID must be adr-XXX'),
    status: exports.StatusSchema.default('proposed'),
    date: exports.DateSchema,
    tags: zod_1.z.array(zod_1.z.string()).optional(),
}).passthrough();
