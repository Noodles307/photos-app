<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let fileName: string;
  export let progress = 0;
  export let status: "error" | "progress" | "uploaded";

  $: formattedProgress = `${Math.ceil(progress * 100)}%`;

  const dispatch = createEventDispatcher();
  const close = () => dispatch("close");
  const retry = () => dispatch("retry");

  $: error = status === "error";
</script>

<div class="py-4">
  <div
    class="w-full overflow-hidden rounded-full border bg-gray-200"
    class:border-red-600={error}
    class:border-sky-600={!error}
  >
    <div
      class="p-0.5 text-center text font-medium leading-none text-primary-content"
      class:bg-error={error}
      class:bg-primary={!error}
      style:width={error ? "100%" : formattedProgress}
    >
      {#if error}
        <b>An error has occured.</b>
      {:else}
        <b>{formattedProgress}</b>
      {/if}
    </div>
  </div>
  <div class="mt-2 flex w-full items-center truncate px-2 text-primary-content">
    <span class="flex-1 truncate">{fileName}</span>
    <div class="inline-flex flex-shrink-0 flex-grow-0 gap-4 text-slate-500">
      {#if status === "error"}
        <button
          on:click={retry}
          class="btn btn-error btn-circle btn-sm"
          title="Retry"
        >
          retry
        </button>
      {/if}

      {#if status !== "uploaded"}
        <button
          on:click={close}
          class="btn btn-primary btn-circle btn-sm"
          title="Remove"
        >
          x
        </button>
      {/if}
    </div>
  </div>
</div>
