import crypto from "node:crypto";
import { auth as getClerkAuth } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { apiKeyClient, parseMetadata } from "@/lib/api-keys";
import type { Context } from "@/server/api/trpc";
import type { AuthResult } from "@/types/auth";

export const normalizeAndValidateApiKey = (apiKey: string) => {
	const normalizedKey = apiKey.trim();

	const API_KEY_REGEX = /^sk-[A-Za-z0-9_-]+$/;
	if (!API_KEY_REGEX.test(normalizedKey)) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Invalid API key format",
		});
	}

	return normalizedKey;
};

export const validateAndAuthenticateApiKey = async (apiKey: string) => {
	const normalizedKey = normalizeAndValidateApiKey(apiKey);

	const result = await apiKeyClient.apiKeys.verify({ key: normalizedKey });

	if (!result.valid || !result.api_key_id) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: result.reason ?? "Invalid or expired API key",
		});
	}

	const meta = parseMetadata(result.metadata);

	return {
		id: result.api_key_id,
		userId: meta.userId,
		projectId: meta.projectId,
		metadata: result.metadata,
		is_active: result.is_active,
		expires_at: result.expires_at,
		last_used_at: result.last_used_at,
	};
};

export const authenticateAndGetProject = async (
	ctx: Context,
	input: { projectId: string; apiKey?: string },
): Promise<AuthResult> => {
	if (input.apiKey) {
		const normalizedKey = normalizeAndValidateApiKey(input.apiKey);

		const result = await apiKeyClient.apiKeys.verify({ key: normalizedKey });

		if (!result.valid || !result.api_key_id) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: result.reason ?? "Invalid or expired API key",
			});
		}

		const meta = parseMetadata(result.metadata);

		if (!meta.projectId) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "API key is not associated with any project",
			});
		}

		if (meta.projectId !== input.projectId) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "API key does not have access to this project",
			});
		}

		const project = await ctx.db.project.findUnique({
			where: { id: meta.projectId },
		});

		if (!project) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Project not found for API key",
			});
		}

		return {
			authType: "api_key" as const,
			apiKey: {
				id: result.api_key_id.toString(),
				projectId: meta.projectId,
				keyPrefix: "",
				project: { id: project.id, name: project.name },
			},
			project: { id: project.id, name: project.name },
		};
	}

	const clerkAuthResult = await getClerkAuth();
	if (!clerkAuthResult.userId) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message:
				"Authentication required - provide either API key or user authentication",
		});
	}

	const userId = clerkAuthResult.userId;
	const whereClause = {
		id: input.projectId,
		organization: {
			OR: [{ ownerId: userId }, { members: { some: { userId } } }],
		},
	};

	const project = await ctx.db.project.findFirst({ where: whereClause });

	if (!project) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "You don't have access to this project",
		});
	}

	return { authType: "user" as const, userId, project };
};

export const authenticateApiKey = async (
	apiKey: string,
	db: Context["db"],
): Promise<{
	apiKey: { id: string; projectId: string };
	project: { id: string; name: string };
}> => {
	const normalizedKey = (() => {
		try {
			return normalizeAndValidateApiKey(apiKey);
		} catch (error) {
			if (error instanceof TRPCError) {
				throw new Error(error.message);
			}
			throw new Error("Invalid API key format");
		}
	})();

	const result = await apiKeyClient.apiKeys.verify({ key: normalizedKey });

	if (!result.valid || !result.api_key_id) {
		throw new Error(result.reason ?? "Invalid or expired API key");
	}

	const meta = parseMetadata(result.metadata);

	if (!meta.projectId) {
		throw new Error("API key is not associated with any project");
	}

	const project = await db.project.findUnique({
		where: { id: meta.projectId },
	});

	if (!project) {
		throw new Error("Project not found for API key");
	}

	return {
		apiKey: { id: result.api_key_id.toString(), projectId: meta.projectId },
		project: { id: project.id, name: project.name },
	};
};

export const getCacheKey = (auth: AuthResult, suffix: string): string => {
	const prefix = auth.authType === "api_key" ? auth.apiKey.id : auth.userId;
	return `llm-clusters:${auth.authType}:${prefix}:${suffix}`;
};

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
	const encryptionSecret = process.env.ENCRYPTION_SECRET;
	if (!encryptionSecret) {
		throw new Error(
			"ENCRYPTION_SECRET environment variable is required for provider API key encryption",
		);
	}

	const salt = crypto
		.createHash("sha256")
		.update(`${encryptionSecret}:provider-api-keys`)
		.digest()
		.subarray(0, 16);

	return crypto.pbkdf2Sync(
		encryptionSecret,
		salt,
		100000,
		KEY_LENGTH,
		"sha512",
	);
}

export function encryptProviderApiKey(apiKey: string): string {
	if (!apiKey || apiKey.trim().length === 0) {
		throw new Error("Provider API key cannot be empty");
	}

	try {
		const key = getEncryptionKey();
		const iv = crypto.randomBytes(IV_LENGTH);
		const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
		cipher.setAAD(Buffer.from("provider-api-key", "utf8"));

		let encrypted = cipher.update(apiKey.trim(), "utf8");
		encrypted = Buffer.concat([encrypted, cipher.final()]);
		const tag = cipher.getAuthTag();

		const combined = Buffer.concat([iv, tag, encrypted]);
		return combined.toString("base64");
	} catch (error) {
		throw new Error(
			`Failed to encrypt provider API key: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

export function decryptProviderApiKey(encryptedData: string): string {
	if (!encryptedData || encryptedData.trim().length === 0) {
		throw new Error("Encrypted provider API key data cannot be empty");
	}

	try {
		const key = getEncryptionKey();
		const combined = Buffer.from(encryptedData.trim(), "base64");

		const iv = combined.subarray(0, IV_LENGTH);
		const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
		const encrypted = combined.subarray(IV_LENGTH + TAG_LENGTH);

		const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
		decipher.setAuthTag(tag);
		decipher.setAAD(Buffer.from("provider-api-key", "utf8"));

		let decrypted = decipher.update(encrypted, undefined, "utf8");
		decrypted += decipher.final("utf8");

		return decrypted;
	} catch (error) {
		throw new Error(
			`Failed to decrypt provider API key: ${error instanceof Error ? error.message : "Invalid or corrupted encrypted data"}`,
		);
	}
}

export function validateEncryptedProviderApiKey(
	encryptedData: string,
): boolean {
	try {
		const decrypted = decryptProviderApiKey(encryptedData);
		return decrypted.length > 0;
	} catch {
		return false;
	}
}

export function secureCompareProviderApiKeys(
	plainKey: string,
	encryptedKey: string,
): boolean {
	try {
		const decryptedKey = decryptProviderApiKey(encryptedKey);
		return crypto.timingSafeEqual(
			Buffer.from(plainKey.trim(), "utf8"),
			Buffer.from(decryptedKey, "utf8"),
		);
	} catch {
		return false;
	}
}
