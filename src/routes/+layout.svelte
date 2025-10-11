<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { authStore } from '$lib/stores/auth';
	import Toast from '$lib/components/Toast.svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let { children } = $props();

	function logout() {
		if (browser) {
			localStorage.removeItem('access_token');
			localStorage.removeItem('refresh_token');
		}
		authStore.clearUser();
		goto('/login');
	}

	const isAuthPage = $derived($page.url.pathname === '/login' || $page.url.pathname === '/setup');
</script>

<Toast />

{#if !isAuthPage && $authStore.isAuthenticated}
	<div class="flex h-screen bg-gray-50">
		<!-- Sidebar Navigation -->
		<aside class="w-64 bg-white shadow-md">
			<div class="flex h-full flex-col">
				<div class="p-6">
					<h1 class="text-2xl font-bold text-blue-600">GameSave Vault</h1>
					<p class="text-sm text-gray-500">Admin Dashboard</p>
				</div>

				<nav class="flex-1 space-y-1 px-3">
					<a
						href="/games"
						class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors {$page
							.url.pathname.startsWith('/games')
							? 'bg-blue-50 text-blue-600'
							: 'text-gray-700 hover:bg-gray-100'}"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						Games
					</a>

					<a
						href="/settings"
						class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors {$page
							.url.pathname === '/settings'
							? 'bg-blue-50 text-blue-600'
							: 'text-gray-700 hover:bg-gray-100'}"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
						Settings
					</a>
				</nav>

				<div class="border-t p-4">
					<div class="mb-3 px-4">
						<p class="text-sm font-medium text-gray-700">{$authStore.user?.name}</p>
						<p class="text-xs text-gray-500">{$authStore.user?.email}</p>
					</div>
					<button
						onclick={logout}
						class="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
							/>
						</svg>
						Logout
					</button>
				</div>
			</div>
		</aside>

		<!-- Main Content -->
		<main class="flex-1 overflow-y-auto">
			{@render children()}
		</main>
	</div>
{:else}
	{@render children()}
{/if}
