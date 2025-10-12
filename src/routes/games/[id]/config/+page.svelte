<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import api from '$lib/api/client';
	import { toast } from '$lib/stores/toast';
	import type { Game } from '$lib/types';
    import { env } from '$env/dynamic/public';

	let game = $state<Game | null>(null);
	let isLoading = $state(true);
	let configTemplate = $state('');

	// Configuration fields
	let configId = $state('');
	let apiUrl = $state(env.PUBLIC_API_BASE_URL);
	let apiToken = $state('');
	let gameExecutableFile = $state('/path/to/game/executable');
	let gameExecutableDir = $state('');
	let gameSaveFiles = $state<string[]>(['/path/to/save/directory']);
	let countdown = $state(3);

	const gameId = $derived($page.params.id);

	onMount(async () => {
		await loadGame();
		await loadTemplate();
		generateUUID();
	});

	async function loadTemplate() {
		try {
			const response = await fetch('/gamesave.example.yml');
			configTemplate = await response.text();
		} catch (error) {
			console.error('Failed to load config template:', error);
			toast.error('Failed to load configuration template');
		}
	}

	async function loadGame() {
		try {
			const response = await api.get(`/admin/games/${gameId}`);
			game = response.data;
			if (game) {
				apiToken = game.token;
			}
		} catch (error: any) {
			console.error('Failed to load game:', error);
			toast.error('Failed to load game details');
			goto('/games');
		} finally {
			isLoading = false;
		}
	}

	function generateUUID() {
		// Generate a random UUID v4
		configId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			const r = (Math.random() * 16) | 0;
			const v = c === 'x' ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	}

	function addSaveFilePath() {
		gameSaveFiles = [...gameSaveFiles, ''];
	}

	function removeSaveFilePath(index: number) {
		gameSaveFiles = gameSaveFiles.filter((_, i) => i !== index);
	}

	function generateConfig(): string {
		if (!configTemplate) {
			return '# Loading template...';
		}

		let config = configTemplate;

		// Replace placeholders
		config = config.replace('{{ID}}', configId);
		config = config.replace('{{API_URL}}', apiUrl);
		config = config.replace('{{API_TOKEN}}', apiToken);
		config = config.replace('{{GAME_EXECUTABLE_FILE}}', gameExecutableFile);

		// Handle optional game executable dir
		if (gameExecutableDir.trim()) {
			config = config.replace('{{GAME_EXECUTABLE_DIR}}', `game-executable-dir: "${gameExecutableDir}"`);
		} else {
			config = config.replace('{{GAME_EXECUTABLE_DIR}}', '# game-executable-dir: "/path/to/game/directory"');
		}

		// Handle save files
		let saveFilesSection = '';
		if (gameSaveFiles.length === 1) {
			saveFilesSection = `# Can be a single path (directory or file):
game-save-file: "${gameSaveFiles[0]}"`;
		} else {
			saveFilesSection = `# Or multiple paths:
game-save-file:`;
			gameSaveFiles.forEach((path) => {
				saveFilesSection += `
  - "${path}"`;
			});
		}
		config = config.replace('{{GAME_SAVE_FILES}}', saveFilesSection);

		// Replace countdown
		config = config.replace('{{COUNTDOWN}}', countdown.toString());

		return config;
	}

	function downloadConfig() {
		const config = generateConfig();
		const blob = new Blob([config], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'gamesave.yml';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		toast.success('Configuration downloaded as gamesave.yml');
	}

	async function copyConfig() {
		const config = generateConfig();
		try {
			await navigator.clipboard.writeText(config);
			toast.success('Configuration copied to clipboard!');
		} catch (error) {
			toast.error('Failed to copy configuration');
		}
	}
</script>

<svelte:head>
	<title>Client Config Generator - {game?.name || 'Game'} - GameSave Vault</title>
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
			<a
				href="/games/{gameId}"
				class="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
			>
				<svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 19l-7-7m0 0l7-7m-7 7h18"
					/>
				</svg>
				Back to Game Details
			</a>
			<h1 class="text-3xl font-bold text-gray-800">Client Configuration Generator</h1>
			<p class="mt-1 text-gray-600">Generate configuration file for {game.name}</p>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Configuration Form -->
			<div class="rounded-lg bg-white p-6 shadow">
				<h2 class="mb-4 text-xl font-semibold text-gray-800">Configuration Fields</h2>

				<div class="space-y-4">
					<!-- Game UUID -->
					<div>
						<label for="configId" class="mb-2 block text-sm font-medium text-gray-700">
							Game UUID
						</label>
						<div class="flex gap-2">
							<input
								type="text"
								id="configId"
								bind:value={configId}
								class="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
								readonly
							/>
							<button
								onclick={generateUUID}
								class="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
								title="Generate new UUID"
							>
								<svg
									class="h-5 w-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
									/>
								</svg>
							</button>
						</div>
						<p class="mt-1 text-xs text-gray-500">Unique identifier for this game client instance</p>
					</div>

					<!-- API URL -->
					<div>
						<label for="apiUrl" class="mb-2 block text-sm font-medium text-gray-700">
							API Base URL
						</label>
						<input
							type="text"
							id="apiUrl"
							bind:value={apiUrl}
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
							placeholder="http://localhost:8080"
						/>
						<p class="mt-1 text-xs text-gray-500">Base URL of the GameSave Vault API</p>
					</div>

					<!-- API Token -->
					<div>
						<label for="apiToken" class="mb-2 block text-sm font-medium text-gray-700">
							API Token
						</label>
						<input
							type="text"
							id="apiToken"
							bind:value={apiToken}
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
							placeholder="Your API token"
						/>
						<p class="mt-1 text-xs text-gray-500">Authentication token from game details</p>
					</div>

					<!-- Game Executable File -->
					<div>
						<label for="gameExecutableFile" class="mb-2 block text-sm font-medium text-gray-700">
							Game Executable Path
						</label>
						<input
							type="text"
							id="gameExecutableFile"
							bind:value={gameExecutableFile}
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
							placeholder="/path/to/game/executable"
						/>
						<p class="mt-1 text-xs text-gray-500">
							Full path to the game executable (e.g., C:\Program Files\Game\game.exe)
						</p>
					</div>

					<!-- Game Executable Dir (Optional) -->
					<div>
						<label for="gameExecutableDir" class="mb-2 block text-sm font-medium text-gray-700">
							Working Directory (Optional)
						</label>
						<input
							type="text"
							id="gameExecutableDir"
							bind:value={gameExecutableDir}
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
							placeholder="Leave empty to use executable's directory"
						/>
						<p class="mt-1 text-xs text-gray-500">
							Optional: Working directory for game execution
						</p>
					</div>

					<!-- Game Save Files -->
					<div>
						<div class="mb-2 flex items-center justify-between">
							<span class="block text-sm font-medium text-gray-700">
								Save File Location(s)
							</span>
							<button
								onclick={addSaveFilePath}
								class="text-sm text-blue-600 hover:text-blue-700 font-medium"
							>
								+ Add Path
							</button>
						</div>
						<div class="space-y-2">
							{#each gameSaveFiles as saveFile, index (index)}
								<div class="flex gap-2">
									<input
										type="text"
										bind:value={gameSaveFiles[index]}
										class="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
										placeholder="/path/to/save/location"
									/>
									{#if gameSaveFiles.length > 1}
										<button
											onclick={() => removeSaveFilePath(index)}
											class="rounded-lg bg-red-100 px-3 py-2 text-red-600 hover:bg-red-200 transition-colors"
											title="Remove path"
										>
											<svg
												class="h-5 w-5"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
												/>
											</svg>
										</button>
									{/if}
								</div>
							{/each}
						</div>
						<p class="mt-1 text-xs text-gray-500">
							Can be file paths or directory paths where save files are located
						</p>
					</div>

					<!-- Countdown -->
					<div>
						<label for="countdown" class="mb-2 block text-sm font-medium text-gray-700">
							Launch Countdown (seconds)
						</label>
						<input
							type="number"
							id="countdown"
							bind:value={countdown}
							min="0"
							max="60"
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
						/>
						<p class="mt-1 text-xs text-gray-500">
							Duration before auto-launching the game (0-60 seconds)
						</p>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="mt-6 flex gap-3">
					<button
						onclick={downloadConfig}
						class="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 transition-colors"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
							/>
						</svg>
						Download Config
					</button>
					<button
						onclick={copyConfig}
						class="flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-4 py-3 font-medium text-gray-700 hover:bg-gray-300 transition-colors"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
							/>
						</svg>
						Copy
					</button>
				</div>
			</div>

			<!-- Preview -->
			<div class="rounded-lg bg-white p-6 shadow">
				<h2 class="mb-4 text-xl font-semibold text-gray-800">Configuration Preview</h2>
				<div class="rounded-lg bg-gray-900 p-4 overflow-auto max-h-[calc(100vh-250px)]">
					<pre class="text-sm text-green-400 font-mono whitespace-pre">{generateConfig()}</pre>
				</div>
			</div>
		</div>
	{/if}
</div>
