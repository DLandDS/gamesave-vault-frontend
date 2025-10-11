<script lang="ts">
	import { goto } from '$app/navigation';
	import api from '$lib/api/client';
	import { authStore } from '$lib/stores/auth';
	import { toast } from '$lib/stores/toast';
	import { browser } from '$app/environment';

	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);

	async function handleLogin() {
		if (!email || !password) {
			toast.error('Please fill in all fields');
			return;
		}

		// Basic email validation
		if (!email.includes('@')) {
			toast.error('Please enter a valid email address');
			return;
		}

		isLoading = true;

		try {
			const response = await api.post('/auth/login', {
				email,
				password
			});

			if (browser) {
				localStorage.setItem('access_token', response.data.access_token);
				localStorage.setItem('refresh_token', response.data.refresh_token);
			}

			// Get user profile
			const profileResponse = await api.get('/auth/me');
			authStore.setUser(profileResponse.data);

			toast.success('Login successful!');
			goto('/games');
		} catch (error: any) {
			console.error('Login error:', error);
			if (error.response?.data?.error) {
				toast.error(error.response.data.error);
			} else {
				toast.error('Login failed. Please check your credentials.');
			}
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Login - GameSave Vault</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
	<div class="w-full max-w-md">
		<div class="rounded-lg bg-white p-8 shadow-lg">
			<div class="mb-8 text-center">
				<h1 class="mb-2 text-3xl font-bold text-gray-800">GameSave Vault</h1>
				<p class="text-gray-600">Admin Dashboard</p>
			</div>

			<form onsubmit={(e) => { e.preventDefault(); handleLogin(); }}>
				<div class="mb-4">
					<label for="email" class="mb-2 block text-sm font-medium text-gray-700">
						Email Address
					</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
						placeholder="admin@example.com"
						required
					/>
				</div>

				<div class="mb-6">
					<label for="password" class="mb-2 block text-sm font-medium text-gray-700">
						Password
					</label>
					<input
						type="password"
						id="password"
						bind:value={password}
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
						placeholder="Enter your password"
						required
					/>
				</div>

				<button
					type="submit"
					disabled={isLoading}
					class="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
				>
					{#if isLoading}
						<svg
							class="h-5 w-5 animate-spin"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							/>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
						Logging in...
					{:else}
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
							/>
						</svg>
						Login
					{/if}
				</button>
			</form>
		</div>
	</div>
</div>
