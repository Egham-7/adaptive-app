export function createMetadata(userId: string, projectId: string): string {
	return JSON.stringify({ userId, projectId });
}

export function parseMetadata(metadata?: string): {
	userId?: string;
	projectId?: string;
} {
	if (!metadata) return {};
	try {
		const parsed = JSON.parse(metadata) as Record<string, unknown>;
		return {
			userId: typeof parsed.userId === "string" ? parsed.userId : undefined,
			projectId:
				typeof parsed.projectId === "string" ? parsed.projectId : undefined,
		};
	} catch {
		return {};
	}
}
