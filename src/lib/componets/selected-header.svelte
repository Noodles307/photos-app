<script lang="ts">
  import { page } from "$app/stores";
  import { Icons } from "../../assets/fonts/icons";
  import Icon from "$lib/componets/icon.svelte";
  import { createEventDispatcher } from "svelte";
  import { trpc } from "$lib/trpc/client";
  import { invalidateAll } from "$app/navigation";
  import ShareModal from "./share/share-modal.svelte";
    import outside from "$lib/use/outside";

  export let restrictionID: string;
  export let path: string;

  export let allowDeleteFiles: boolean;
  export let allowShare: boolean;

  export let selectedItems: Record<string, string> = {};

  let opened: "options" | "share" | null = null;

  const dispatch = createEventDispatcher();

  function onSelectAll() {
    dispatch("select-all");
  }
  function deselectAll() {
    dispatch("deselect-all");
  }
  function downloadSelected() {
    const body = {
      files: Object.values(selectedItems),
      restrictionID,
      path,
    };

    const params = Object.keys(body)
      .map(
        (key) =>
          encodeURIComponent(key) +
          "=" +
          encodeURIComponent(
            body[key as keyof typeof body] as unknown as string
          )
      )
      .join("&");

    //  @ts-ignore
    window.location = `/download?${params}`;
    deselectAll();
  }

  async function deleteSelected() {
    try {
      await trpc($page).folders.deleteFiles.mutate({
        files: Object.values(selectedItems),
        restrictionID,
        path,
      });
      deselectAll();
      invalidateAll();
    } catch (error) {
      console.error(error);
    }
  }
</script>

{#if opened}
  <button
    class="fixed top-0 left-0 h-full w-full bg-slate-600/50"
    on:click={(e) => {
      e.stopPropagation();
      e.preventDefault();
      opened = null;
    }}
  />
{/if}

<div
  class="fixed top-0 left-0 w-full flex mb-10 justify-between bg-secondary p-4 font-bold text-white shadow"
>
  <div
    use:outside={{
      className: ".bgg-menu-options",
      onClick: () => (opened = opened === 'options' ? null : opened),
    }}
    class="container mx-auto flex items-center justify-between px-4"
  >
    <div class="inline-flex items-center gap-5">
      <button
        title="select all"
        class="btn btn-ghost btn-sm btn-circle"
        on:click={onSelectAll}
      >
        <Icon name={Icons.SelectAll} class="text-[30px]" />
      </button>

      {Object.keys(selectedItems).length} items selected
    </div>

    <div class="relative inline-flex items-center">
      <button
        title="menu"
        class="btn btn-ghost btn-sm btn-circle"
        on:click={() => (opened = "options")}
      >
        <Icon name={Icons.ContextMenu} class="text-[25px]" />
      </button>
      {#if opened === "options"}
        <div
          class="pointer-events-auto z-10 text-secondary absolute right-8 top-8 bottom-14 flex w-32 flex-col gap-4"
        >
          <button
            class="rounded bg-white p-2 drop-shadow-lg hover:bg-gray-300"
            on:click={deselectAll}
          >
            Clear selection
          </button>

          <button
            class="rounded bg-white p-2 drop-shadow-lg hover:bg-gray-300"
            on:click={downloadSelected}
          >
            Download selection as zip
          </button>

          {#if allowShare}
            <button
              on:click={() => (opened = "share")}
              class="rounded bg-white p-2 drop-shadow-lg hover:bg-gray-300"
            >
              Share
            </button>
          {/if}

          {#if allowDeleteFiles}
            <button
              class="rounded bg-white p-2 drop-shadow-lg hover:bg-gray-300"
              on:click={deleteSelected}
            >
              Delete selection
            </button>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

{#if opened === "share"}
  <ShareModal
    {restrictionID}
    {path}
    folderName={Object.values(selectedItems)[0]}
    on:close={() => {
      opened = null;
      deselectAll();
    }}
  />
{/if}
