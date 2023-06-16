<script lang="ts">
  import Icon from "$lib/componets/icon.svelte";
  import { trpc } from "$lib/trpc/client";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import MimeTypeIcon from "$lib/componets/mimetype-icon.svelte";
  import { Icons } from "../../assets/fonts/icons";

  export let folderPath: string;

  async function getFolder() {
    try {
      return await trpc($page).restrictions.peekInsideFolder.query({
        rootPath: folderPath,
      });
    } catch (error) {
      console.log(error);
    }
    return null;
  }

  let getFolderPromise: ReturnType<typeof getFolder>;

  onMount(() => {
    getFolderPromise = getFolder();
  });
</script>

{#await getFolderPromise}
  <p>loading...</p>
{:then folder}
  {#if folder?.files.length === 0}
    <div
      class="w-full h-full flex flex-col justify-center items-center text-gray-400"
    >
      <Icon name={Icons.Empty} class="text-[50px]" />
      <p class="text-sm">This folder is empty</p>
    </div>
  {/if}

  <div class="bgg-grid h-full overflow-y-auto">
    {#each folder?.files || [] as item (item.uri)}
      <div title={item.name}>
        {#if item.isDirectory}
          <Icon name={Icons.Directory} class="text-[60px]" />
        {:else if !item.mimeType.startsWith("image/")}
          <MimeTypeIcon mimeType={item.mimeType} class="text-[60px]" />
        {:else}
          <!-- svelte-ignore a11y-missing-attribute -->
          <img
            class="rounded-md bg-primary-content/50 overflow-hidden drop-shadow-md"
            width={60}
            height={60}
            src={item.thumbnailUri || ""}
            loading="lazy"
            decoding="async"
            on:contextmenu|preventDefault={() => {
              return false;
            }}
          />
        {/if}
        <div class="text-start text-sm truncate">{item.name}</div>
      </div>
    {/each}
  </div>
{:catch error}
  <div>
    error: <pre>{JSON.stringify(error, null, 2)}</pre>
  </div>
{/await}

<style>
  .bgg-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
    grid-gap: 1rem;
  }
</style>
