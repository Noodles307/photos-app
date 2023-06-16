<script lang="ts">
	import { portal } from 'svelte-portal';
</script>

<div use:portal={'body'}>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		class="bgg-modal fixed top-0 bottom-0 left-0 right-0 z-20 flex h-full w-full items-center justify-center bg-slate-600/50"
	>
		<div class="bgg-modal flex max-h-full w-full max-w-[900px] flex-col bg-white">
			<div class="bg-secondary p-4 font-bold text-primary-content drop-shadow-xl">
				<slot name="title" />
			</div>

			<div class="min-h-[10rem] w-full overflow-y-auto p-5">
				<slot name="content" />
			</div>

			<div class="flex justify-end bg-secondary gap-4 px-4 py-2 font-bold text-primary-content drop-shadow-xl min-h-[56px]">
				<slot name="actions" />
			</div>
		</div>
	</div>
</div>
