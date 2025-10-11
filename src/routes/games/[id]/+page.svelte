<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import api from '$lib/api/client';
	import { toast } from '$lib/stores/toast';
	import type { Game, GameSave } from '$lib/types';
	import Modal from '$lib/components/Modal.svelte';

	let game = $state<Game | null>(null);
	let gameSaves = $state<GameSave[]>([]);
	let isLoading = $state(true);
	let showEditModal = $state(false);
	let showResetTokenModal = $state(false);
	let editedName = $state('');
	let isUpdating = $state(false);

	const gameId = $derived($page.params.id);

	onMount(async () => {
		await loadGame();
		await loadGameSaves();
	});

	async function loadGame() {
		try {
			const response = await api.get(`/admin/games/${gameId}`);
			game = response.data;
			if (game) {
				editedName = game.name;
			}
		} catch (error: any) {
			console.error('Failed to load game:', error);
			toast.error('Failed to load game details');
			goto('/games');
		} finally {
			isLoading = false;
		}
	}

	async function loadGameSaves() {
		try {
			const response = await api.get(`/admin/games/${gameId}/saves`);
			gameSaves = response.data;
		} catch (error: any) {
			console.error('Failed to load game saves:', error);
		}
	}

	async function copyToken() {
		if (!game) return;
		try {
			await navigator.clipboard.writeText(game.token);
			toast.success('Token copied to clipboard!');
		} catch (error) {
			toast.error('Failed to copy token');
		}
	}

	async function handleUpdateGame() {
		if (!editedName.trim()) {
			toast.error('Please enter a game name');
			return;
		}

		isUpdating = true;
		try {
			const response = await api.put(`/admin/games/${gameId}`, { name: editedName });
			game = response.data;
			toast.success('Game updated successfully!');
			showEditModal = false;
		} catch (error: any) {
			console.error('Failed to update game:', error);
			toast.error('Failed to update game');
		} finally {
			isUpdating = false;
		}
	}

	async function handleResetToken() {
		try {
			const response = await api.post(`/admin/games/${gameId}/reset-token`);
			game = response.data.game;
			toast.success('Token reset successfully!');
			showResetTokenModal = false;
		} catch (error: any) {
			console.error('Failed to reset token:', error);
			toast.error('Failed to reset token');
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>{game?.name || 'Game Details'} - GameSave Vault</title>
</svelte:head>

<div class="p-8">
	{#if isLoading}
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
	{:else if game}
		<div class="mb-6">
			<a href="/games" class="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
				<svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 19l-7-7m0 0l7-7m-7 7h18"
					/>
				</svg>
				Back to Games
			</a>
			<h1 class="text-3xl font-bold text-gray-800">{game.name}</h1>
			<p class="mt-1 text-gray-600">Game ID: {game.id}</p>
		</div>

		<!-- Game Information -->
		<div class="mb-6 rounded-lg bg-white p-6 shadow">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold text-gray-800">Game Information</h2>
				<button
					onclick={() => (showEditModal = true)}
					class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
				>
					Edit
				</button>
			</div>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<p class="text-sm text-gray-600">Name</p>
					<p class="font-medium text-gray-900">{game.name}</p>
				</div>
				<div>
					<p class="text-sm text-gray-600">Created At</p>
					<p class="font-medium text-gray-900">{formatDate(game.created_at)}</p>
				</div>
				<div>
					<p class="text-sm text-gray-600">Updated At</p>
					<p class="font-medium text-gray-900">{formatDate(game.updated_at)}</p>
				</div>
				{#if game.deleted_at}
					<div>
						<p class="text-sm text-gray-600">Deleted At</p>
						<p class="font-medium text-red-600">{formatDate(game.deleted_at)}</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Game Token -->
		<div class="mb-6 rounded-lg bg-white p-6 shadow">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold text-gray-800">API Token</h2>
				<button
					onclick={() => (showResetTokenModal = true)}
					class="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
				>
					Reset Token
				</button>
			</div>

			<div class="flex items-center gap-3">
				<code class="flex-1 rounded bg-gray-100 px-4 py-2 text-sm text-gray-700">
					{game.token}
				</code>
				<button
					onclick={copyToken}
					class="rounded-lg bg-gray-200 p-2 hover:bg-gray-300 transition-colors"
					title="Copy to clipboard"
				>
					<svg class="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
						/>
					</svg>
				</button>
			</div>
		</div>

		<!-- Game Saves -->
		<div class="rounded-lg bg-white p-6 shadow">
			<h2 class="mb-4 text-xl font-semibold text-gray-800">Save Files History</h2>

			{#if gameSaves.length === 0}
				<p class="text-gray-600">No save files yet.</p>
			{:else}
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>
									File Name
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>
									Mime Type
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>
									Provider
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>
									Uploaded At
								</th>
								<th
									class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							{#each gameSaves as save (save.id)}
								<tr class="hover:bg-gray-50">
									<td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
										{save.file_name}
									</td>
									<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
										{save.mime_type}
									</td>
									<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
										<span
											class="inline-flex rounded-full px-2 py-1 text-xs font-semibold {save.provider ===
											'local'
												? 'bg-blue-100 text-blue-800'
												: 'bg-green-100 text-green-800'}"
										>
											{save.provider}
										</span>
									</td>
									<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
										{formatDate(save.uploaded_at)}
									</td>
									<td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
										<span class="text-gray-400" title="Download endpoint not available">
											Download
										</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}
</div>

<!-- Edit Game Modal -->
{#if showEditModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
			<h2 class="mb-4 text-xl font-semibold text-gray-800">Edit Game</h2>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleUpdateGame();
				}}
			>
				<div class="mb-4">
					<label for="editGameName" class="mb-2 block text-sm font-medium text-gray-700">
						Game Name
					</label>
					<input
						type="text"
						id="editGameName"
						bind:value={editedName}
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
						required
					/>
				</div>
				<div class="flex justify-end gap-3">
					<button
						type="button"
						onclick={() => {
							showEditModal = false;
							editedName = game?.name || '';
						}}
						class="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={isUpdating}
						class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
					>
						{isUpdating ? 'Updating...' : 'Update'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Reset Token Confirmation Modal -->
<Modal
	bind:isOpen={showResetTokenModal}
	title="Reset API Token"
	message="Are you sure you want to reset the API token? The old token will no longer work."
	confirmText="Reset Token"
	onConfirm={handleResetToken}
	onCancel={() => (showResetTokenModal = false)}
	dangerous={true}
/>
