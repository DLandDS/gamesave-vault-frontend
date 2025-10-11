export interface Game {
	id: string;
	name: string;
	token: string;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
}

export interface GameSave {
	id: string;
	game_id: string;
	file_name: string;
	path: string;
	mime_type: string;
	provider: 'local' | 's3';
	uploaded_at: string;
	created_at: string;
	updated_at: string;
}

export interface AuthResponse {
	access_token: string;
	refresh_token: string;
	token_type: string;
}

export interface RefreshResponse {
	access_token: string;
	token_type: string;
}

export interface UserProfile {
	name: string;
	email: string;
}

export interface ApiError {
	error: string;
}
