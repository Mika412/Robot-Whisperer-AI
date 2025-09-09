<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { loadDatabase } from '$lib/stores/requestStore';
	import Modal from '$lib/components/modals/Modal.svelte';
	import { settings } from '$lib/stores/settingsStore.svelte';
	import { connect as connectWebSocket } from '$lib/stores/rosStore';


	onMount(async () => {
		await loadDatabase();

		const defaultUrl = "ws://localhost:8765";
		try {
			console.log(`Auto-connecting to ${defaultUrl}`);
			await connectWebSocket(defaultUrl);
		} catch (e) {
			console.error(`Failed to auto-connect:`, e);
		}
	});

	$effect(() => {
		if (browser) {
			if (document.documentElement.className !== settings.theme) {
				document.documentElement.className = settings.theme;
			}
			localStorage.setItem('settings', JSON.stringify(settings));
		}
	});

	let { children } = $props();
</script>

<Modal />

{@render children()}
