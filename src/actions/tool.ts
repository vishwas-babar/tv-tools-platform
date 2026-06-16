/**
 * Tool server actions are deprecated in favour of REST API routes.
 *
 * Use the following endpoints instead:
 *   GET    /api/tools              — list active tools (public)
 *   POST   /api/tools              — create tool (admin)
 *   GET    /api/tools/admin        — list all tools with counts (admin)
 *   GET    /api/tools/slug/[slug]  — get tool by slug with plans (public)
 *   GET    /api/tools/[id]         — get tool by id (public)
 *   PATCH  /api/tools/[id]         — update tool (admin)
 *   DELETE /api/tools/[id]         — delete tool (admin)
 */

export {};
