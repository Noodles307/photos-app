<script lang="ts">
  import { trpc } from "$lib/trpc/client";
  import { page } from "$app/stores";
  import omit from "lodash/omit";
  import { createEventDispatcher, onMount } from "svelte";
  import Modal from "../modal.svelte";
  import ToggleDirectory from "../toggle-directory.svelte";
  import type { Directory } from "$lib/types";
  import type { User } from "@prisma/client";

  export let user: User;

  const dispatch = createEventDispatcher();

  async function loadDirectory() {
    try {
      return (await trpc($page).restrictions.listDirectoryTree.query({
        userId: user.id,
      })) as Directory | null;
    } catch (error) {
      return null;
    }
  }

  let loadDirectoryPromise: Promise<Directory | null> | null = null;
  let selectedPaths: Record<string, boolean> = {};

  function markSelected(dir: Directory) {
    if (dir.selected) {
      selectedPaths[dir.fullPath] = true;
    }

    dir.children.forEach(markSelected);
  }

  onMount(() => {
    loadDirectoryPromise = loadDirectory().then((data) => {
      if (data) {
        markSelected(data);
      }
      return data;
    });
  });

  function togglePath({ fullPath }: Directory) {
    if (selectedPaths[fullPath]) {
      selectedPaths = omit(selectedPaths, fullPath);
      return;
    }

    selectedPaths[fullPath] = true;
  }

  let loadingAssign = false;
  async function assignRestrictions() {
    loadingAssign = true;
    try {
      await trpc($page).restrictions.applyRestrictions.mutate({
        userId: user.id,
        restrictions: Object.keys(selectedPaths),
      });
      dispatch("close");
    } catch (error) {
      console.error(error);
    } finally {
      loadingAssign = false;
    }
  }
</script>

<Modal>
  <div slot="title">Assign restrictions to: <b>{user.name}</b></div>
  <div slot="content">
    {#await loadDirectoryPromise}
      <div>Loading...</div>
    {:then dirInfo}
      <p>
        This controls which directories the user can access (only <b>Read</b> permission
        is toggled).
      </p>
      <p>
        Also removing all users from a restriction, will remove the restriction
        from the system to prevent becoming public:
      </p>

      {#each dirInfo?.children || [] as child}
        <ToggleDirectory
          name={child.name}
          fullPath={child.fullPath}
          children={child.children}
          selected={child.selected}
          on:change={(evt) => togglePath(evt.detail)}
        />
      {/each}
        <div class="mb-32"/>
    {:catch error}
      <div>
        Error:
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    {/await}
  </div>
  <div slot="actions" class="inline-flex gap-8">
    <button class="btn btn-primary" on:click={() => dispatch("close")}>
      cancel
    </button>
    <button class="btn btn-primary" on:click={assignRestrictions}>
      {#if loadingAssign}
        <span class="loading loading-spinner" />
      {/if}
      Assign
    </button>
  </div>
</Modal>
