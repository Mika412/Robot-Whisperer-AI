<script lang="ts">
	import { Circle, X } from "@lucide/svelte";
	import {
		openItems,
		activeItemId,
		closeItem,
	} from "$lib/stores/workspaceStore";
	import TypeBadge from "$lib/components/TypeBadge.svelte";

	const handleClose = (e: MouseEvent, id: number | undefined) => {
		e.stopPropagation();
		if (id) {
			closeItem(id);
		}
	};
</script>

<div class="flex border-b border-border bg-bg-sidebar">
	<div class="flex items-center overflow-x-auto min-w-0">
		<div class="flex space-x-1 p-1" role="tablist">
			{#each $openItems as item (item.id)}
				{@const isActive = $activeItemId === item.id}
				<div
					class="w-48 flex-shrink-0 flex items-center justify-between gap-2 pl-3 pr-2 py-1.5 rounded-lg text-sm transition-all duration-150 group {isActive
						? 'bg-bg-main shadow-sm'
						: 'hover:bg-bg-hover'}"
				>
					<button
						type="button"
						role="tab"
						aria-selected={isActive}
						onclick={() => activeItemId.set(item.id)}
						title={item.data.name}
						class="flex items-center gap-2 flex-grow min-w-0 h-full"
					>
						<TypeBadge type={item.data.type} />
						<span
							class="truncate text-left {isActive
								? 'font-semibold text-text-main'
								: 'text-text-dimmer'}"
						>
							{item.data.name}
						</span>
					</button>

					<button
						onclick={(e) => handleClose(e, item.id)}
						class="p-0.5 rounded-full hover:bg-border flex-shrink-0"
						aria-label="Close tab"
					>
						{#if item.isDirty}
							<div class="w-4 h-4 flex items-center justify-center relative">
								<Circle
									size={8}
									class="absolute fill-current text-text-dimmer group-hover:opacity-0 transition-opacity"
								/>
								<X
									size={16}
									class="absolute text-text-disabled opacity-0 group-hover:opacity-100 transition-opacity"
								/>
							</div>
						{:else}
							<X
								size={16}
								class="text-text-disabled opacity-0 group-hover:opacity-100 transition-opacity"
							/>
						{/if}
					</button>
				</div>
			{/each}
		</div>
	</div>
</div>