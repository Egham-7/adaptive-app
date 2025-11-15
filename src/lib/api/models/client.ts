import type { RegistryModel, RegistryModelFilter } from "@/types/models";
import { BaseApiClient } from "../base-client";
import { buildFilterParams } from "../helpers/query-helpers";

export class ModelsClient extends BaseApiClient {
	constructor(token: string) {
		super({ basePath: "/v1/models", token });
	}

	/**
	 * List all models or filter by criteria
	 * @param filter Optional filter criteria for models
	 * @returns Array of registry models
	 */
	async list(filter?: RegistryModelFilter): Promise<RegistryModel[]> {
		try {
			return await this.get<RegistryModel[]>("", {
				params: filter ? buildFilterParams(filter) : undefined,
			});
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to list models");
			}
			throw new Error("Failed to list models");
		}
	}

	/**
	 * Get a specific model by name
	 * @param modelName The model name (e.g., "gpt-5.1-mini", "claude-sonnet-4-5")
	 * @returns Single registry model
	 */
	async getById(modelName: string): Promise<RegistryModel> {
		try {
			return await this.get<RegistryModel>(`/${modelName}`);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || `Failed to get model: ${modelName}`);
			}
			throw new Error(`Failed to get model: ${modelName}`);
		}
	}
}

export const modelsClient = new ModelsClient("");
