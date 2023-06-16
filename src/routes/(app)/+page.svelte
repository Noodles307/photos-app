<script lang="ts">
  import Icon from "$lib/componets/icon.svelte";
  import { Icons } from "../../assets/fonts/icons";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<h1>
  {#if data?.folders?.length > 0}
    List of folders you have access to:
  {:else}
    Not found
  {/if}
</h1>

<div class="mt-4 flex flex-col gap-5 mb-7">
  {#each (data?.folders || []) as folder (folder.id)}
    <a
      href={`/folder/${folder.id}`}
      class="flex gap-2 hover:cursor-pointer text-primary-content hover:text-primary-focus fill-primary-content hover:fill-primary-focus"
    >
      <span class="w-10 flex-shrink-0">
        <Icon name={Icons.Directory} class="text-[40px]" />
      </span>

      <span class="flex flex-col">
        <span>
          {folder.rootPath}
          {#if folder.public}
            <span class="text-xs text-gray-400 align-middle"> (public)</span>
          {/if}
        </span>
        <span class="flex gap-1 flex-wrap text-xs text-gray-400">
          Permissions:
          <b>Read</b>
          {#if folder.canEdit}
            <b>Edit</b>
          {/if}
          {#if folder.canDelete}
            <b>Delete</b>
          {/if}
          {#if folder.canWrite}
            <b>Write</b>
          {/if}
        </span>
      </span>
    </a>
  {/each}
</div>
