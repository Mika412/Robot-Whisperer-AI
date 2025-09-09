<script lang="ts">
	import TabBar from './TabBar.svelte';
	import RequestEditor from './RequestEditor.svelte';
</script>

<main class="flex flex-1 flex-col overflow-hidden bg-gray-900">
	<div class="flex-shrink-0">
		<TabBar />
	</div>
	<div class="flex-grow overflow-hidden">
		<RequestEditor />
	</div>
</main>
