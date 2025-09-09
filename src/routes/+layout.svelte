<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { loadDatabase } from '$lib/stores/requestStore';
	import Modal from '$lib/components/modals/Modal.svelte';
	import { settings } from '$lib/stores/settingsStore.svelte';
	import { connect as connectWebSocket } from '$lib/stores/rosStore';

	onMount(async () => {
		await loadDatabase();
		settings.setTheme(settings.settings.theme);

		try {
			console.log(`Auto-connecting`);
			await connectWebSocket();
		} catch (e) {
			console.error(`Failed to auto-connect:`, e);
		}
	});

	let { children } = $props();
</script>

<Modal />

{@render children()}
