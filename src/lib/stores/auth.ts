import { writable } from 'svelte/store';
import type { UserProfile } from '$lib/types';

interface AuthState {
	isAuthenticated: boolean;
	user: UserProfile | null;
	isLoading: boolean;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		isAuthenticated: false,
		user: null,
		isLoading: true
	});

	return {
		subscribe,
		setUser: (user: UserProfile) => {
			update((state) => ({
				...state,
				isAuthenticated: true,
				user,
				isLoading: false
			}));
		},
		clearUser: () => {
			set({
				isAuthenticated: false,
				user: null,
				isLoading: false
			});
		},
		setLoading: (isLoading: boolean) => {
			update((state) => ({
				...state,
				isLoading
			}));
		}
	};
}

export const authStore = createAuthStore();
