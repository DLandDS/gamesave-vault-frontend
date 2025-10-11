<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		goto('/games');
	});
</script>

<div class="flex min-h-screen items-center justify-center">
	<p>Redirecting...</p>
</div>
