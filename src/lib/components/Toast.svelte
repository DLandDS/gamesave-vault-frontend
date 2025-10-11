<script lang="ts">
	import { toast } from '$lib/stores/toast';

	function getToastStyle(type: string) {
		switch (type) {
			case 'success':
				return 'bg-green-500 text-white';
			case 'error':
				return 'bg-red-500 text-white';
			case 'warning':
				return 'bg-yellow-500 text-white';
			default:
				return 'bg-blue-500 text-white';
		}
	}
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
	{#each $toast as t (t.id)}
		<div
			class="min-w-64 rounded-lg px-4 py-3 shadow-lg transition-all {getToastStyle(t.type)}"
			role="alert"
		>
			<div class="flex items-center justify-between">
				<p class="text-sm font-medium">{t.message}</p>
				<button
					onclick={() => toast.remove(t.id)}
					class="ml-4 text-white hover:text-gray-200 transition-colors"
					aria-label="Close"
				>
					<svg
						class="h-4 w-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		</div>
	{/each}
</div>
