<script lang="ts">
	interface Props {
		isOpen: boolean;
		title: string;
		message: string;
		confirmText?: string;
		cancelText?: string;
		onConfirm: () => void;
		onCancel: () => void;
		dangerous?: boolean;
	}

	let {
		isOpen = $bindable(),
		title,
		message,
		confirmText = 'Confirm',
		cancelText = 'Cancel',
		onConfirm,
		onCancel,
		dangerous = false
	}: Props = $props();
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
			<h2 class="mb-2 text-xl font-semibold text-gray-800">{title}</h2>
			<p class="mb-6 text-gray-600">{message}</p>
			<div class="flex justify-end gap-3">
				<button
					onclick={onCancel}
					class="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
				>
					{cancelText}
				</button>
				<button
					onclick={onConfirm}
					class="rounded-md px-4 py-2 text-sm font-medium text-white transition-colors {dangerous
						? 'bg-red-500 hover:bg-red-600'
						: 'bg-blue-600 hover:bg-blue-700'}"
				>
					{confirmText}
				</button>
			</div>
		</div>
	</div>
{/if}
