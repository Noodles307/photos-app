<script lang="ts">
  import { page } from "$app/stores";
  import { trpc } from "$lib/trpc/client";
  import { createEventDispatcher } from "svelte";
  import Modal from "../modal.svelte";
  import type { UserOption } from "$lib/types";
  import UsersPicker from "../users-picker.svelte";

  export let id: string;
  export let rootPath: string;
  export let name: string | undefined | null;
  export let sharedWith: Array<UserOption>;
  export let canRead: boolean;
  export let canWrite: boolean;
  export let canEdit: boolean;
  export let canDelete: boolean;

  export let afterDate: string;
  export let modifierCanRead: boolean;
  export let modifierCanWrite: boolean;
  export let modifierCanEdit: boolean;
  export let modifierCanDelete: boolean;

  const dispatch = createEventDispatcher();

  let loading = false;
  let state = {
    restrictionID: id,
    path: rootPath,
    folderName: name,

    shareWith: sharedWith,
    canRead: canRead,
    canWrite: canWrite,
    canEdit: canEdit,
    canDelete: canDelete,

    afterDate: afterDate && new Date(afterDate).toISOString().split("T")[0],
    modifierCanRead: modifierCanRead,
    modifierCanWrite: modifierCanWrite,
    modifierCanEdit: modifierCanEdit,
    modifierCanDelete: modifierCanDelete,
  };

  async function save() {
    loading = true;
    try {
      await trpc($page).folders.editFolderRestriction.mutate({
        restrictionID: state.restrictionID,

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
      });
      dispatch("close");
    } finally {
      loading = false;
    }
  }

  function handleCopy() {
    try {
      navigator.clipboard.writeText(location.origin + `/folder/${id}`);
    } catch {
      console.error("Failed to copy");
    }
  }
</script>

<Modal>
  <div slot="title">
    Share folder: {name}
  </div>
  <div slot="content">
    <div>
      <p>Link to share with your friends:</p>
      <a href={location.origin + `/folder/${id}`} class="link mb-4"
        >{location.origin + `/folder/${id}`}</a
      >

      <button class="btn btn-primary mt-4" on:click={handleCopy}>
        Copy to clipboard
      </button>
    </div>

    <div class="flex w-full mt-10">
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
      <div class="grid h-20 flex-grow card rounded-box place-items-start px-8">
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
      <div class="grid h-20 flex-grow card rounded-box place-items-start px-8">
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
  </div>
  <div slot="actions" class="inline-flex gap-8">
    <button class="btn btn-primary" on:click={() => dispatch("close")}>
      cancel
    </button>

    <button class="btn btn-primary" on:click={save}>
      {#if loading}
        <span class="loading loading-spinner" />
      {/if}
      save
    </button>
  </div>
</Modal>
