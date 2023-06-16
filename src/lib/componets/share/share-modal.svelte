<script lang="ts">
  import { page } from "$app/stores";
  import { trpc } from "$lib/trpc/client";
  import { createEventDispatcher } from "svelte";
  import Modal from "../modal.svelte";
  import CreateRestriction from "./create-restriction.svelte";
  import EditRestriction from "./edit-restriction.svelte";

  export let restrictionID = "";
  export let path = "";
  export let folderName = "";

  const dispatch = createEventDispatcher();

  let loadingSharePromise = loadShareInfo();

  async function loadShareInfo() {
    return await trpc($page).folders.getFolderRestrictionByPath.query({
      folderName,
      path,
      restrictionID,
    });
  }
</script>

{#await loadingSharePromise}
  <Modal>
    <div slot="title">
      Share folder: {folderName}
    </div>
    <div slot="content">
      <div class="flex w-full h-full justify-center">
        <span class="loading loading-dots loading-lg text-primary-content" />
      </div>
    </div>
    <div slot="actions" class="inline-flex gap-8">
      <button class="btn btn-primary" on:click={() => dispatch("close")}>
        cancel
      </button>
    </div>
  </Modal>
{:then shareInfo}
  {#if shareInfo}
    <EditRestriction {...shareInfo} on:close={() => dispatch("close")} />
  {:else}
    <CreateRestriction
      {restrictionID}
      {path}
      {folderName}
      on:close={() => dispatch("close")}
    />
  {/if}
{:catch}
  <Modal>
    <div slot="title">
      Share folder: {folderName}
    </div>
    <div slot="content">
      <p>Something went wrong</p>
    </div>
    <div slot="actions" class="inline-flex gap-8">
      <button class="btn btn-primary" on:click={() => dispatch("close")}>
        cancel
      </button>
    </div>
  </Modal>
{/await}
