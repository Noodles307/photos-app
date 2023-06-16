<script lang="ts">
  import { Icons } from "../../assets/fonts/icons";
  import Icon from "$lib/componets/icon.svelte";
  import MimeTypeIcon from "$lib/componets/mimetype-icon.svelte";
  import interact from "$lib/use/interact";
  import { createEventDispatcher } from "svelte";

  export let name: string;
  export let isDirectory: boolean;
  export let mimeType: string;
  export let thumbnailUri: string | null;
  export let uri: string;
  export let isSelected: boolean;

  const dispatch = createEventDispatcher();

  const handlers = {
    open() {
      dispatch("open", uri);
    },
    select() {
      dispatch("select", uri);
    },
  };
</script>

<div
  title={name}
  class="p-1 hover:cursor-pointer w-28 relative"
  use:interact={handlers}
>
  {#if isSelected}
    <div
      class="absolute top-0 bottom-0 left-0 w-full h-full bg-primary border-2 border-primary-content opacity-40"
    />
  {/if}
  {#if isDirectory}
    <span class="text-primary-content hover:text-primary-focus">
      <Icon name={Icons.Directory} class="text-[100px]" />
    </span>
  {:else}
    <span class="inline-block text-primary-content hover:text-primary-focus">
      {#if !mimeType.startsWith("image/")}
        <MimeTypeIcon {mimeType} class="text-[100px]" />
      {:else}
        <!-- svelte-ignore a11y-missing-attribute -->
        <img
          class="rounded-md bg-primary-content/50 hover:bg-primary-focus overflow-hidden drop-shadow-md hover:drop-shadow-2xl"
          width={100}
          height={100}
          src={thumbnailUri || ""}
          loading="lazy"
          decoding="async"
          on:contextmenu|preventDefault={() => {
            return false;
          }}
        />
      {/if}
    </span>
  {/if}
  <div class="text-xs break-all mt-2">{name}</div>
</div>
