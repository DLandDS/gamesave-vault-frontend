<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/api/client';
	import { toast } from '$lib/stores/toast';
	import { authStore } from '$lib/stores/auth';

	let name = $state('');
	let email = $state('');
	let isLoadingProfile = $state(true);
	let isUpdatingProfile = $state(false);

	let oldPassword = $state('');
	let newPassword = $state('');
	let confirmNewPassword = $state('');
	let isChangingPassword = $state(false);

	onMount(async () => {
		await loadProfile();
	});

	async function loadProfile() {
		try {
			const response = await api.get('/admin/profile');
			name = response.data.name;
			email = response.data.email;
		} catch (error: any) {
			console.error('Failed to load profile:', error);
			toast.error('Failed to load profile');
		} finally {
			isLoadingProfile = false;
		}
	}

	async function handleUpdateProfile() {
		if (!name.trim() || !email.trim()) {
			toast.error('Please fill in all fields');
			return;
		}

		if (!email.includes('@')) {
			toast.error('Please enter a valid email address');
			return;
		}

		isUpdatingProfile = true;
		try {
			const response = await api.put('/admin/profile', { name, email });
			authStore.setUser({ name: response.data.name, email: response.data.email });
			toast.success('Profile updated successfully!');
		} catch (error: any) {
			console.error('Failed to update profile:', error);
			toast.error('Failed to update profile');
		} finally {
			isUpdatingProfile = false;
		}
	}

	async function handleChangePassword() {
		if (!oldPassword || !newPassword || !confirmNewPassword) {
			toast.error('Please fill in all password fields');
			return;
		}

		if (newPassword.length < 8) {
			toast.error('New password must be at least 8 characters long');
			return;
		}

		if (newPassword !== confirmNewPassword) {
			toast.error('New passwords do not match');
			return;
		}

		isChangingPassword = true;
		try {
			await api.post('/auth/change-password', {
				old_password: oldPassword,
				new_password: newPassword
			});
			toast.success('Password changed successfully!');
			oldPassword = '';
			newPassword = '';
			confirmNewPassword = '';
		} catch (error: any) {
			console.error('Failed to change password:', error);
			if (error.response?.data?.error) {
				toast.error(error.response.data.error);
			} else {
				toast.error('Failed to change password');
			}
		} finally {
			isChangingPassword = false;
		}
	}
</script>

<svelte:head>
	<title>Settings - GameSave Vault</title>
</svelte:head>

<div class="p-8">
	<div class="mb-6">
		<h1 class="text-3xl font-bold text-gray-800">Settings</h1>
		<p class="mt-1 text-gray-600">Manage your account settings</p>
	</div>

	{#if isLoadingProfile}
		<div class="flex items-center justify-center py-12">
			<svg
				class="h-8 w-8 animate-spin text-blue-600"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				/>
			</svg>
		</div>
	{:else}
		<div class="space-y-6">
			<!-- Profile Settings -->
			<div class="rounded-lg bg-white p-6 shadow">
				<h2 class="mb-4 text-xl font-semibold text-gray-800">Profile Information</h2>
				<form
					onsubmit={(e) => {
						e.preventDefault();
						handleUpdateProfile();
					}}
				>
					<div class="mb-4">
						<label for="name" class="mb-2 block text-sm font-medium text-gray-700">
							Full Name
						</label>
						<input
							type="text"
							id="name"
							bind:value={name}
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
							required
						/>
					</div>

					<button
						type="submit"
						disabled={isUpdatingProfile}
						class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
					>
						{isUpdatingProfile ? 'Updating...' : 'Update Profile'}
					</button>
				</form>
			</div>

			<!-- Change Password -->
			<div class="rounded-lg bg-white p-6 shadow">
				<h2 class="mb-4 text-xl font-semibold text-gray-800">Change Password</h2>
				<form
					onsubmit={(e) => {
						e.preventDefault();
						handleChangePassword();
					}}
				>
					<div class="mb-4">
						<label for="oldPassword" class="mb-2 block text-sm font-medium text-gray-700">
							Current Password
						</label>
						<input
							type="password"
							id="oldPassword"
							bind:value={oldPassword}
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
							required
						/>
					</div>

					<div class="mb-4">
						<label for="newPassword" class="mb-2 block text-sm font-medium text-gray-700">
							New Password
						</label>
						<input
							type="password"
							id="newPassword"
							bind:value={newPassword}
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
							required
							minlength="8"
						/>
						<p class="mt-1 text-xs text-gray-500">Must be at least 8 characters long</p>
					</div>

					<div class="mb-4">
						<label for="confirmNewPassword" class="mb-2 block text-sm font-medium text-gray-700">
							Confirm New Password
						</label>
						<input
							type="password"
							id="confirmNewPassword"
							bind:value={confirmNewPassword}
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
							required
						/>
					</div>

					<button
						type="submit"
						disabled={isChangingPassword}
						class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
					>
						{isChangingPassword ? 'Changing Password...' : 'Change Password'}
					</button>
				</form>
			</div>
		</div>
	{/if}
</div>
