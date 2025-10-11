<script lang="ts">
	import { goto } from '$app/navigation';
	import api from '$lib/api/client';
	import { toast } from '$lib/stores/toast';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let isLoading = $state(false);

	async function handleSetup() {
		if (!name || !email || !password || !confirmPassword) {
			toast.error('Please fill in all fields');
			return;
		}

		if (!email.includes('@')) {
			toast.error('Please enter a valid email address');
			return;
		}

		if (password.length < 8) {
			toast.error('Password must be at least 8 characters long');
			return;
		}

		if (password !== confirmPassword) {
			toast.error('Passwords do not match');
			return;
		}

		isLoading = true;

		try {
			await api.post('/auth/setup', {
				name,
				email,
				password
			});

			toast.success('Setup completed successfully! Please login.');
			goto('/login');
		} catch (error: any) {
			console.error('Setup error:', error);
			if (error.response?.data?.error) {
				toast.error(error.response.data.error);
			} else {
				toast.error('Setup failed. Please try again.');
			}
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Setup - GameSave Vault</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
	<div class="w-full max-w-md">
		<div class="rounded-lg bg-white p-8 shadow-lg">
			<div class="mb-8 text-center">
				<h1 class="mb-2 text-3xl font-bold text-gray-800">Welcome to GameSave Vault</h1>
				<p class="text-gray-600">Setup your admin account</p>
			</div>

			<form onsubmit={(e) => { e.preventDefault(); handleSetup(); }}>
				<div class="mb-4">
					<label for="name" class="mb-2 block text-sm font-medium text-gray-700">
						Full Name
					</label>
					<input
						type="text"
						id="name"
						bind:value={name}
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
						placeholder="John Doe"
						required
					/>
				</div>

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

				<div class="mb-4">
					<label for="password" class="mb-2 block text-sm font-medium text-gray-700">
						Password
					</label>
					<input
						type="password"
						id="password"
						bind:value={password}
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
						placeholder="At least 8 characters"
						required
						minlength="8"
					/>
				</div>

				<div class="mb-6">
					<label for="confirmPassword" class="mb-2 block text-sm font-medium text-gray-700">
						Confirm Password
					</label>
					<input
						type="password"
						id="confirmPassword"
						bind:value={confirmPassword}
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
						placeholder="Confirm your password"
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
						Setting up...
					{:else}
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
						Complete Setup
					{/if}
				</button>
			</form>
		</div>
	</div>
</div>
