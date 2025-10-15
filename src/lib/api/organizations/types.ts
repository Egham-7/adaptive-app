export interface OrganizationCreateRequest {
	id: string;
	name: string;
}

export interface OrganizationUpdateRequest {
	name?: string;
}

export interface OrganizationResponse {
	id: string;
	name: string;
	owner_id: string;
	created_at: string;
	updated_at: string;
}
