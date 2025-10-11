import type { LayoutLoad } from './$types';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import api from '$lib/api/client';
import { authStore } from '$lib/stores/auth';

export const load: LayoutLoad = async ({ url }) => {
	const pathname = url.pathname;

	// Skip auth check for login and setup pages
	if (pathname === '/login' || pathname === '/setup') {
		return {};
	}

	// Only run in browser
	if (!browser) {
		return {};
	}

	// Check if user has tokens
	const accessToken = localStorage.getItem('access_token');
	const refreshToken = localStorage.getItem('refresh_token');

	if (!accessToken && !refreshToken) {
		// No tokens, redirect to login
		goto('/login');
		return {};
	}

	try {
		// Try to get user profile
		authStore.setLoading(true);
		const response = await api.get('/admin/profile');
		authStore.setUser(response.data);
		authStore.setLoading(false);
	} catch (error: any) {
		authStore.setLoading(false);
		
		// Check if it's a 503 setup not completed error
		if (error.response?.status === 503 && error.response?.data?.error === 'setup not completed') {
			goto('/setup');
			return {};
		}

		// Check if it's 401 unauthorized
		if (error.response?.status === 401) {
			// Try to refresh token
			if (refreshToken) {
				try {
					const refreshResponse = await api.post('/auth/refresh', {
						refresh_token: refreshToken
					});
					localStorage.setItem('access_token', refreshResponse.data.access_token);
					
					// Try to get profile again
					const profileResponse = await api.get('/admin/profile');
					authStore.setUser(profileResponse.data);
				} catch (refreshError) {
					// Refresh failed, clear tokens and redirect to login
					localStorage.removeItem('access_token');
					localStorage.removeItem('refresh_token');
					authStore.clearUser();
					goto('/login');
				}
			} else {
				// No refresh token, redirect to login
				localStorage.removeItem('access_token');
				authStore.clearUser();
				goto('/login');
			}
		}
	}

	return {};
};
