import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

// Create axios instance
export const api: AxiosInstance = axios.create({
	baseURL: env.PUBLIC_API_BASE_URL,
	headers: {
		'Content-Type': 'application/json'
	}
});

// Request interceptor to add auth token
api.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		if (browser) {
			const accessToken = localStorage.getItem('access_token');
			if (accessToken && config.headers) {
				config.headers.Authorization = `Bearer ${accessToken}`;
			}
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// If error is 401 and we haven't tried to refresh yet
		if (error.response?.status === 401 && !originalRequest._retry && browser) {
			originalRequest._retry = true;

			try {
				const refreshToken = localStorage.getItem('refresh_token');
				if (!refreshToken) {
					throw new Error('No refresh token');
				}

				// Try to refresh the token
				const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
					refresh_token: refreshToken
				});

				const { access_token } = response.data;
				localStorage.setItem('access_token', access_token);

				// Retry the original request
				originalRequest.headers.Authorization = `Bearer ${access_token}`;
				return api(originalRequest);
			} catch (refreshError) {
				// Refresh failed, clear tokens and redirect to login
				localStorage.removeItem('access_token');
				localStorage.removeItem('refresh_token');
				if (browser && window.location.pathname !== '/login') {
					window.location.href = '/login';
				}
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	}
);

export default api;
