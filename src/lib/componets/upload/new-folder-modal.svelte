<script lang="ts">
  import { page } from "$app/stores";
  import { createEventDispatcher } from "svelte";
  import Modal from "../modal.svelte";
  import isEmpty from "lodash/isEmpty";
  import { invalidateAll } from "$app/navigation";
  import { trpc } from "$lib/trpc/client";

  export let restrictionID: string;
  export let path: string;

  const dispatch = createEventDispatcher();
  const onClose = () => dispatch("close");

  let loading = false;
  let folderName = "";
  let serverError = "";

  const CHAR_LIMIT = 1;

  $: isValid = !isEmpty(folderName.trim()) && folderName.trim().length >= 3;

  async function submit() {
    loading = true;
    serverError = "";
    try {
      await trpc($page).folders.createFolder.mutate({
        name: folderName,
        restrictionID,
        path,
      });
      invalidateAll();
      onClose();
    } catch (err) {
      serverError = "Not a valid name";
    } finally {
      loading = false;
    }
  }
</script>

<Modal>
  <div slot="title">Create new folder</div>
  <div slot="content">
    <div class="flex flex-col">
      <input
        type="text"
        placeholder="Folder name"
        id="new-folder-name"
        name="new-folder-name"
        class="input input-bordered w-full max-w"
        bind:value={folderName}
        required
        disabled={loading}
      />
      {#if !isValid}
        <p class="mt-2 text-red-600">
          Should have more than {CHAR_LIMIT} characters
        </p>
      {/if}
      {#if serverError}
        <p class="mt-2 text-red-600">{serverError}</p>
      {/if}
    </div>
  </div>
  <div slot="actions" class="inline-flex gap-8">
    <button class="btn btn-primary" on:click={() => dispatch("close")}>
      cancel
    </button>
    <button
      class="btn"
      class:btn-primary={isValid}
      class:btn-disabled={!isValid}
      on:click={submit}
    >
      {#if loading}
        <span class="loading loading-spinner" />
      {/if}
      create
    </button>
  </div>
</Modal>
