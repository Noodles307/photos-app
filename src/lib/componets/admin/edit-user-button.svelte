<script lang="ts">
  import type { User } from "@prisma/client";
  import AssignRestrictionsModal from "./assign-restrictions-modal.svelte";
  import CreateInviteLinkModal from "./create-invite-link-modal.svelte";

  export let user: User;

  let opened:
    | "options"
    | "delete"
    | "create-invite"
    | "assign-restrictions"
    | null = null;
</script>

{#if opened}
  <button
    on:click={() => (opened = null)}
    class="fixed top-0 left-0 h-full w-full bg-slate-600/50 z-10"
  />
{/if}

<div class="relative w-full left-0 bottom-0 right-0">
  <div class="relative container mx-auto flex justify-end">
    <button
      on:click={() => (opened = opened === "options" ? null : "options")}
      class="btn btn-primary"
    >
      Edit
    </button>

    {#if opened === "options"}
      <div
        class="z-30 pointer-events-auto absolute right-10 bottom-8 flex w-32 flex-col gap-4 text-secondary font-bold"
      >
        <button
          class="rounded bg-white p-2 drop-shadow-lg hover:bg-gray-300"
          on:click={() => (opened = "create-invite")}
        >
          Create invite link
        </button>

        {#if user.role !== "ADMIN"}
          <button
            class="rounded bg-white p-2 drop-shadow-lg hover:bg-gray-300"
            on:click={() => (opened = "assign-restrictions")}
          >
            Assign restrictions
          </button>
        {/if}
      </div>
    {/if}
  </div>

  {#if opened === "create-invite"}
    <CreateInviteLinkModal
      email={user.email}
      on:close={() => (opened = null)}
    />
  {/if}

  {#if opened === "assign-restrictions"}
    <AssignRestrictionsModal {user} on:close={() => (opened = null)} />
  {/if}
</div>
