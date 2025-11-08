import type {
	RegistryProvider,
	RegistryProviderFilter,
} from "@/types/providers";
import { BaseApiClient } from "../base-client";
import { buildFilterParams } from "../helpers/query-helpers";

export class ProvidersClient extends BaseApiClient {
	constructor(token: string) {
		super({ basePath: "/v1/providers", token });
	}

	/**
	 * List all providers or filter by criteria
	 * @param filter Optional filter criteria for providers
	 * @returns Array of registry providers
	 */
	async list(filter?: RegistryProviderFilter): Promise<RegistryProvider[]> {
		try {
			return await this.get<RegistryProvider[]>("", {
				params: filter ? buildFilterParams(filter) : undefined,
			});
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to list providers");
			}
			throw new Error("Failed to list providers");
		}
	}
}

export const providersClient = new ProvidersClient("");
