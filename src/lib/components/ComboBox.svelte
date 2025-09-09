<script lang="ts">
	import { ChevronDown } from '@lucide/svelte';
	import { fly } from 'svelte/transition';

	let {
		items = [] as string[],
		value = $bindable(),
		placeholder = '',
		onValueChange = (newValue: string) => {},
	} = $props();

	let filteredItems = $state(items);
	let showDropdown = $state(false);
	let activeIndex = $state(-1);
	let inputEl: HTMLDivElement;
	let listEl: HTMLUListElement;

	const filterItems = () => {
		if (!value) {
			filteredItems = items;
		} else {
			filteredItems = items.filter((item) =>
				item.toLowerCase().includes(value.toLowerCase()),
			);
		}
		activeIndex = -1; // Reset active index on filter
	};

	const handleInput = (e: Event) => {
		const newValue = (e.target as HTMLInputElement).value;
		value = newValue;
		filterItems();
		showDropdown = true;
		onValueChange(newValue);
	};

	const handleSelect = (item: string) => {
		value = item;
		showDropdown = false;
		onValueChange(item);
	};

	const handleFocus = () => {
		filterItems();
		showDropdown = true;
	};

	const handleClickOutside = (event: MouseEvent) => {
		if (inputEl && !event.composedPath().includes(inputEl)) {
			showDropdown = false;
		}
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (showDropdown) {
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				if (filteredItems.length > 0) {
					activeIndex = (activeIndex + 1) % filteredItems.length;
					scrollToItem();
				}
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				if (filteredItems.length > 0) {
					activeIndex =
						(activeIndex - 1 + filteredItems.length) % filteredItems.length;
					scrollToItem();
				}
			} else if (e.key === 'Enter' && activeIndex !== -1) {
				e.preventDefault();
				handleSelect(filteredItems[activeIndex]);
			} else if (e.key === 'Escape') {
				showDropdown = false;
			}
		}
	};

	const scrollToItem = () => {
		if (activeIndex >= 0 && listEl) {
			const itemEl = listEl.children[activeIndex] as HTMLLIElement;
			if (itemEl) {
				itemEl.scrollIntoView({ block: 'nearest' });
			}
		}
	};
</script>

<svelte:window on:click={handleClickOutside} />

<div class="relative w-full h-full flex items-center" bind:this={inputEl}>
	<input
		type="text"
		{placeholder}
		bind:value
		oninput={handleInput}
		onfocus={handleFocus}
		onkeydown={handleKeydown}
		class="text-sm w-full h-full bg-transparent pl-3 pr-8 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
	/>
	<div
		class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"
	>
		<ChevronDown
			class="h-4 w-4 text-text-dimmer transition-transform duration-200 ease-in-out {showDropdown
				? 'rotate-180'
				: ''}"
		/>
	</div>
	{#if showDropdown}
		<ul
			bind:this={listEl}
			transition:fly={{ y: -5, duration: 150 }}
			class="absolute top-full z-10 w-full mt-2 p-1 bg-bg-main border border-border rounded-md shadow-lg max-h-60 overflow-auto"
		>
			{#if filteredItems.length > 0}
				{#each filteredItems as item, i (item)}
					<li
						class="px-2 py-1.5 rounded-md cursor-pointer transition-colors text-sm {i ===
						activeIndex
							? 'bg-bg-hover text-text-main'
							: 'text-text-dimmer'}"
						onmouseenter={() => (activeIndex = i)}
						onclick={() => handleSelect(item)}
					>
						{item}
					</li>
				{/each}
			{:else}
				<li class="px-2 py-1.5 text-text-disabled cursor-not-allowed text-sm">
					No results found
				</li>
			{/if}
		</ul>
	{/if}
</div>