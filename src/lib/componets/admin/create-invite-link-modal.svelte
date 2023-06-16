<script lang="ts">
  import { trpc } from "$lib/trpc/client";
  import { page } from "$app/stores";
  import { createEventDispatcher, onMount } from "svelte";
  import Modal from "../modal.svelte";

  export let email = "";

  const dispatch = createEventDispatcher();
  const onClose = () => dispatch("close");

  let loadHashPromise: Promise<string>;

  async function loadHash() {
    try {
      const { error, hash } = await trpc($page).users.adminGetResetPasswordToken.query({ email })

      if (error) {
        throw error;
      }

      return hash;
    } catch (err) {
      return err;
    }
  }

  onMount(() => {
    loadHashPromise = loadHash();
  });

  function buildLink(hash: string) {
    return location.origin + `/register?invite=${hash}`;
  }

  function handleCopy(hash: string) {
    const link = buildLink(hash);
    try {
      navigator.clipboard.writeText(link);
    } catch {
      console.error("Failed to copy");
    }
  }
</script>

<Modal>
  <div slot="title">Invite link for <b>{email}</b></div>
  <div slot="content" class="overflow-hidden">
    {#await loadHashPromise}
      <p class="mb-4">Generating invite link...</p>
    {:then hash}
      <p class="mb-4">Send this link to the user:</p>
      <a href={buildLink(hash)} class="link mb-4 truncate">{buildLink(hash)}</a>

      <button class="btn btn-primary mt-4" on:click={() => handleCopy(hash)}>
        Copy to clipboard
      </button>
    {:catch error}
      <p class="mb-4">Failed to generate invite link</p>
      <pre>{JSON.stringify(error)}</pre>
    {/await}
  </div>
  <div slot="actions" class="inline-flex gap-8">
    <button class="btn btn-primary" on:click={onClose}> cancel </button>
  </div>
</Modal>
