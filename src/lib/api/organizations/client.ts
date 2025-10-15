import { BaseApiClient } from "../base-client";
import type {
	OrganizationCreateRequest,
	OrganizationResponse,
	OrganizationUpdateRequest,
} from "./types";

export class OrganizationsClient extends BaseApiClient {
	constructor(token: string) {
		super({ basePath: "/admin/organizations", token });
	}

	async create(req: OrganizationCreateRequest): Promise<OrganizationResponse> {
		try {
			return await this.post<OrganizationResponse, OrganizationCreateRequest>(
				"",
				{
					body: req,
				},
			);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to create organization");
			}
			throw new Error("Failed to create organization");
		}
	}

	async getById(id: string): Promise<OrganizationResponse> {
		try {
			return await this.get<OrganizationResponse>(`/${id}`);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to get organization");
			}
			throw new Error("Failed to get organization");
		}
	}

	async list(): Promise<OrganizationResponse[]> {
		try {
			return await this.get<OrganizationResponse[]>("");
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to list organizations");
			}
			throw new Error("Failed to list organizations");
		}
	}

	async update(
		id: string,
		req: OrganizationUpdateRequest,
	): Promise<OrganizationResponse> {
		try {
			return await this.patch<OrganizationResponse, OrganizationUpdateRequest>(
				`/${id}`,
				{
					body: req,
				},
			);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to update organization");
			}
			throw new Error("Failed to update organization");
		}
	}

	async deleteOrganization(id: string): Promise<void> {
		try {
			await this.delete(`/${id}`);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to delete organization");
			}
			throw new Error("Failed to delete organization");
		}
	}
}

export const organizationsClient = new OrganizationsClient("");
