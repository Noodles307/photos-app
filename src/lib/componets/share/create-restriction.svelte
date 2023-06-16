<script lang="ts">
  import { page } from "$app/stores";
  import { trpc } from "$lib/trpc/client";
  import { createEventDispatcher } from "svelte";
  import Modal from "../modal.svelte";
  import type { UserOption } from "$lib/types";
  import UsersPicker from "../users-picker.svelte";

  export let restrictionID = "";
  export let path = "";
  export let folderName = "";

  const dispatch = createEventDispatcher();

  let loading = false;
  let sharingURL = "";
  let state = {
    restrictionID,
    path,
    folderName,
    shareWith: [] as UserOption[],
    canRead: true,
    canWrite: true,
    canEdit: false,
    canDelete: false,

    afterDate: "", //  date
    modifierCanRead: false,
    modifierCanWrite: false,
    modifierCanEdit: false,
    modifierCanDelete: false,
  };

  async function submit() {
    try {
      loading = true;

      const response = await trpc($page).folders.createFolderRestriction.mutate(
        {
          restrictionID: state.restrictionID,
          path: state.path,
          folderName: state.folderName,
          shareWith: state.shareWith,
          canRead: state.canRead,
          canWrite: state.canWrite,
          canEdit: state.canEdit,
          canDelete: state.canDelete,

          afterDate: state.afterDate,
          modifierCanRead: state.modifierCanRead,
          modifierCanWrite: state.modifierCanWrite,
          modifierCanEdit: state.modifierCanEdit,
          modifierCanDelete: state.modifierCanDelete,
        }
      );

      if (!response || !response.shareURL) {
        return;
      }

      sharingURL = response.shareURL;
    } catch (error) {
      console.error(error);
    } finally {
      loading = false;
    }
  }

  function handleCopy() {
    try {
      navigator.clipboard.writeText(location.origin + sharingURL);
    } catch {
      console.error("Failed to copy");
    }
  }
</script>

<Modal>
  <div slot="title">
    Share folder: {folderName}
  </div>
  <div slot="content">
    {#if !sharingURL}
      <div class="flex w-full">
        <div
          class="grid h-20 flex-grow card rounded-box place-items-start px-8 pl-0"
        >
          <div class="form-control w-full">
            <label class="label cursor-pointer">
              <span class="label-text">Can Read</span>
              <input
                type="checkbox"
                bind:checked={state.canRead}
                class="checkbox"
              />
            </label>
          </div>
          <div class="form-control w-full">
            <label class="label cursor-pointer">
              <span class="label-text">Can Write</span>
              <input
                type="checkbox"
                bind:checked={state.canWrite}
                class="checkbox"
              />
            </label>
          </div>
        </div>
        <div class="divider divider-horizontal" />
        <div
          class="grid h-20 flex-grow card rounded-box place-items-start px-8"
        >
          <div class="form-control w-full">
            <label class="label cursor-pointer">
              <span class="label-text">Can Edit</span>
              <input
                type="checkbox"
                bind:checked={state.canEdit}
                class="checkbox"
              />
            </label>
          </div>
          <div class="form-control w-full">
            <label class="label cursor-pointer">
              <span class="label-text">Can Delete</span>
              <input
                type="checkbox"
                bind:checked={state.canDelete}
                class="checkbox"
              />
            </label>
          </div>
        </div>
      </div>

      <div class="form-control w-full mt-4">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label">
          <span class="label-text">
            <b>With</b>
            <span class="text-gray-600 text-sm"
              >(not selecting anybody means a public share)</span
            >
          </span>
        </label>
        <UsersPicker
          value={state.shareWith}
          on:change={(e) => (state.shareWith = e.detail)}
        />
      </div>

      <div class="form-control w-full mt-4">
        <label class="label">
          <span class="label-text">After: </span>
          <input
            type="date"
            bind:value={state.afterDate}
            class="ml-4 input input-bordered input-primary w-full"
          />
        </label>
      </div>

      <div class="flex w-full">
        <div
          class="grid h-20 flex-grow card rounded-box place-items-start px-8 pl-0"
        >
          <div class="form-control w-full">
            <label class="label cursor-pointer">
              <span class="label-text">Can Read</span>
              <input
                type="checkbox"
                bind:checked={state.modifierCanRead}
                class="checkbox"
              />
            </label>
          </div>
          <div class="form-control w-full">
            <label class="label cursor-pointer">
              <span class="label-text">Can Write</span>
              <input
                type="checkbox"
                bind:checked={state.modifierCanWrite}
                class="checkbox"
              />
            </label>
          </div>
        </div>
        <div class="divider divider-horizontal" />
        <div
          class="grid h-20 flex-grow card rounded-box place-items-start px-8"
        >
          <div class="form-control w-full">
            <label class="label cursor-pointer">
              <span class="label-text">Can Edit</span>
              <input
                type="checkbox"
                bind:checked={state.modifierCanEdit}
                class="checkbox"
              />
            </label>
          </div>
          <div class="form-control w-full">
            <label class="label cursor-pointer">
              <span class="label-text">Can Delete</span>
              <input
                type="checkbox"
                bind:checked={state.modifierCanDelete}
                class="checkbox"
              />
            </label>
          </div>
        </div>
      </div>
    {:else}
      <p>Link to share with your friends:</p>
      <a href={location.origin + sharingURL} class="link mb-4"
        >{location.origin + sharingURL}</a
      >

      <button class="btn btn-primary mt-4" on:click={handleCopy}>
        Copy to clipboard
      </button>
    {/if}
  </div>
  <div slot="actions" class="inline-flex gap-8">
    <button class="btn btn-primary" on:click={() => dispatch("close")}>
      cancel
    </button>

    {#if !sharingURL}
      <button class="btn btn-primary" on:click={submit}>
        {#if loading}
          <span class="loading loading-spinner" />
        {/if}
        share
      </button>
    {/if}
  </div>
</Modal>
