<script lang="ts">
  import { Icons } from "../../assets/fonts/icons";
  import Icon from "$lib/componets/icon.svelte";

  export let isAdmin = false;

  let opened: "options" | null = null;

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

<div class="relative inline-flex items-center">
  <button
    class="btn btn-ghost btn-sm btn-circle"
    on:click={() => (opened = "options")}
  >
    <Icon name={Icons.ContextMenu} class="text-[25px] font-bold" />
  </button>

  {#if opened === "options"}
    <div
      class="pointer-events-auto z-10 text-secondary absolute right-8 top-8 bottom-14 flex w-32 flex-col gap-4"
    >
      <a
        href="/logout"
        class="rounded bg-white p-2 drop-shadow-lg hover:bg-gray-300 text-center"
      >
        Logout
      </a>

      {#if isAdmin}
        <a
          href="/users"
          class="rounded bg-white p-2 drop-shadow-lg hover:bg-gray-300 text-center"
        >
          Admin panel
        </a>
      {/if}
    </div>
  {/if}
</div>
