<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/api/client';
	import { toast } from '$lib/stores/toast';
	import type { Game } from '$lib/types';
	import Modal from '$lib/components/Modal.svelte';

	let games = $state<Game[]>([]);
	let filteredGames = $state<Game[]>([]);
	let searchQuery = $state('');
	let isLoading = $state(true);
	let showCreateModal = $state(false);
	let newGameName = $state('');
	let isCreating = $state(false);
	let deleteGameId = $state<string | null>(null);
	let showDeleteModal = $state(false);

	onMount(async () => {
		await loadGames();
	});

	async function loadGames() {
		isLoading = true;
		try {
			const response = await api.get('/admin/games');
			games = response.data;
			filteredGames = games;
		} catch (error: any) {
			console.error('Failed to load games:', error);
			toast.error('Failed to load games');
		} finally {
			isLoading = false;
		}
	}

	$effect(() => {
		if (searchQuery.trim() === '') {
			filteredGames = games;
		} else {
			filteredGames = games.filter((game) =>
				game.name.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}
	});

	async function handleCreateGame() {
		if (!newGameName.trim()) {
			toast.error('Please enter a game name');
			return;
		}

		isCreating = true;
		try {
			await api.post('/admin/games', { name: newGameName });
			toast.success('Game created successfully!');
			showCreateModal = false;
			newGameName = '';
			await loadGames();
		} catch (error: any) {
			console.error('Failed to create game:', error);
			toast.error('Failed to create game');
		} finally {
			isCreating = false;
		}
	}

	async function handleDeleteGame() {
		if (!deleteGameId) return;

		try {
			await api.delete(`/admin/games/${deleteGameId}`);
			toast.success('Game deleted successfully!');
			deleteGameId = null;
			await loadGames();
		} catch (error: any) {
			console.error('Failed to delete game:', error);
			toast.error('Failed to delete game');
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
	<title>Games - GameSave Vault</title>
</svelte:head>

<div class="p-8">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-800">Games</h1>
			<p class="mt-1 text-gray-600">Manage your game collection</p>
		</div>
		<button
			onclick={() => (showCreateModal = true)}
			class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition-colors"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 4v16m8-8H4"
				/>
			</svg>
			Create New Game
		</button>
	</div>

	<div class="mb-6">
		<input
			type="text"
			bind:value={searchQuery}
			placeholder="Search games..."
			class="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
		/>
	</div>

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
	{:else if filteredGames.length === 0}
		<div class="rounded-lg bg-white p-8 text-center shadow">
			<p class="text-gray-600">
				{searchQuery ? 'No games found matching your search.' : 'No games yet. Create your first game!'}
			</p>
		</div>
	{:else}
		<div class="overflow-hidden rounded-lg bg-white shadow">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
							Name
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
							Token
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
							Created At
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
							Updated At
						</th>
						<th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
							Actions
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					{#each filteredGames as game (game.id)}
						<tr class="hover:bg-gray-50">
							<td class="whitespace-nowrap px-6 py-4">
								<div class="font-medium text-gray-900">{game.name}</div>
								{#if game.deleted_at}
									<span class="text-xs text-red-500">(Deleted)</span>
								{/if}
							</td>
							<td class="whitespace-nowrap px-6 py-4">
								<code class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
									>{game.token.substring(0, 8)}...</code
								>
							</td>
							<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
								{formatDate(game.created_at)}
							</td>
							<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
								{formatDate(game.updated_at)}
							</td>
							<td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
								<a
									href="/games/{game.id}"
									class="text-blue-600 hover:text-blue-900 mr-3"
								>
									View
								</a>
								<button
									onclick={() => {
										deleteGameId = game.id;
										showDeleteModal = true;
									}}
									class="text-red-600 hover:text-red-900"
								>
									Delete
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- Create Game Modal -->
{#if showCreateModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
			<h2 class="mb-4 text-xl font-semibold text-gray-800">Create New Game</h2>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleCreateGame();
				}}
			>
				<div class="mb-4">
					<label for="gameName" class="mb-2 block text-sm font-medium text-gray-700">
						Game Name
					</label>
					<input
						type="text"
						id="gameName"
						bind:value={newGameName}
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
						placeholder="Enter game name"
						required
					/>
				</div>
				<div class="flex justify-end gap-3">
					<button
						type="button"
						onclick={() => {
							showCreateModal = false;
							newGameName = '';
						}}
						class="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={isCreating}
						class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
					>
						{isCreating ? 'Creating...' : 'Create'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if deleteGameId}
	<Modal
		bind:isOpen={showDeleteModal}
		title="Delete Game"
		message="Are you sure you want to delete this game? This action cannot be undone."
		confirmText="Delete"
		onConfirm={handleDeleteGame}
		onCancel={() => {
			deleteGameId = null;
			showDeleteModal = false;
		}}
		dangerous={true}
	/>
{/if}
