<script lang="ts">
  import { Icons } from "../../../assets/fonts/icons";
  import Icon from "$lib/componets/icon.svelte";
  import NewFolderModal from "./new-folder-modal.svelte";
  import UploadFilesModal from "./upload-files-modal.svelte";

  export let restrictionID: string;
  export let path: string;

  let opened: "options" | "new-folder" | "upload" | null = null;
</script>

{#if opened}
  <button
    on:click={() => (opened = null)}
    class="fixed top-0 left-0 h-full w-full bg-slate-600/50"
  />
{/if}

<div class="fixed w-full left-0 bottom-0 right-0">
  <div class="relative container mx-auto flex justify-end">
    <button
      on:click={() => (opened = opened === "options" ? null : "options")}
      class="relative bottom-12 right-12 btn btn-circle btn-primary drop-shadow-lg"
    >
      <Icon name={Icons.Plus} class="text-[30px]" />
    </button>

    {#if opened === "options"}
      <div
        class="pointer-events-auto absolute right-10 bottom-28 flex w-32 flex-col gap-4 text-secondary font-bold"
      >
        <button
          class="rounded bg-white p-2 drop-shadow-lg hover:bg-gray-300"
          on:click={() => (opened = "new-folder")}
        >
          New folder
        </button>
        <button
          class="rounded bg-white p-2 drop-shadow-lg hover:bg-gray-300"
          on:click={() => (opened = "upload")}
        >
          Upload files
        </button>
      </div>
    {/if}
  </div>

  {#if opened === "new-folder"}
    <NewFolderModal {path} {restrictionID} on:close={() => (opened = null)} />
  {/if}
  {#if opened === "upload"}
    <UploadFilesModal {path} {restrictionID} on:close={() => (opened = null)} />
  {/if}
</div>
