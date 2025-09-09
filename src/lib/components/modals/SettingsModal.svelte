<script lang="ts">
	import { Sun, Moon } from 'lucide-svelte';
	import { modalStore } from '$lib/stores/modalStore.svelte';
	import { settings } from '$lib/stores/settingsStore.svelte';
	import { onMount } from 'svelte';

	let localSettings = $state({ ...settings.settings });
	let originalTheme = settings.settings.theme;

	const themes = {
		dark: { name: 'Dark', icon: Moon },
		light: { name: 'Light', icon: Sun },
		'one-dark': { name: 'One Dark', icon: Moon },
		dracula: { name: 'Dracula', icon: Moon },
		nord: { name: 'Nord', icon: Moon },
		'solarized-light': { name: 'Solarized Light', icon: Sun },
		'rose-pine-dawn': { name: 'Rosé Pine Dawn', icon: Sun }
	};

	function onThemeChange(newTheme: string) {
		settings.setTheme(newTheme);
	}

	function handleSave() {
		settings.set(localSettings);
		modalStore.close();
	}

	function handleCancel() {
		settings.setTheme(originalTheme);
		modalStore.close();
	}

	onMount(() => {
		originalTheme = settings.settings.theme;
		return () => {
			// This cleanup function runs when the component is destroyed
			// Revert to original theme if modal is closed without saving
			if (settings.settings.theme !== originalTheme) {
				settings.setTheme(originalTheme);
			}
		};
	});

	// handle escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleCancel();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="p-6">
	<h2 class="text-xl font-bold mb-6 text-text-main">Settings</h2>
	<div class="space-y-6">
		<div>
			<label for="theme-select" class="block text-sm font-medium text-text-dimmer mb-2"
				>Theme</label
			>
			<select
				id="theme-select"
				bind:value={localSettings.theme}
				on:change={(e) => onThemeChange(e.currentTarget.value)}
				class="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-text-main focus:outline-none focus:ring-2 focus:ring-accent"
			>
				{#each Object.entries(themes) as [key, { name }]}
					<option value={key}>{name}</option>
				{/each}
			</select>
		</div>
		<div>
			<label for="ws-url" class="block text-sm font-medium text-text-dimmer mb-2"
				>WebSocket URL</label
			>
			<input
				id="ws-url"
				type="text"
				bind:value={localSettings.websocketUrl}
				class="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-text-main focus:outline-none focus:ring-2 focus:ring-accent"
			/>
		</div>
	</div>
	<div class="mt-8 flex justify-end space-x-4">
		<button
			onclick={handleCancel}
			class="text-text-main px-6 py-2 rounded-lg font-semibold transition-colors bg-bg-alt hover:bg-bg-alt-hover"
		>
			Cancel
		</button>
		<button
			onclick={handleSave}
			class="text-white px-6 py-2 rounded-lg font-semibold transition-colors bg-accent hover:bg-accent-dark"
		>
			Save
		</button>
	</div>
</div>
