<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { page } from "$app/stores";
  import outside from "$lib/use/outside";
  import debounce from "lodash/debounce";
  import { trpc } from "$lib/trpc/client";
  import { portal } from "svelte-portal";
  import type { UserOption } from "$lib/types";

  export let value: UserOption[] = [];

  let opened = false;
  let options: UserOption[] = [];
  let search = "";
  let loading = false;

  $: {
    if (!opened) {
      search = "";
      loading = false;
    }
  }

  onMount(async () => {
    loading = true;
    try {
      const users = await trpc($page).users.searchUsers.query("", {
        signal: abortController.signal,
      });

      options = [...users];
    } finally {
      loading = false;
    }
  });

  let abortController = new AbortController();
  const debounceLoadUsers = debounce(async () => {
    loading = true;

    abortController.abort();

    abortController = new AbortController();

    try {
      const users = await trpc($page).users.searchUsers.query(search, {
        signal: abortController.signal,
      });

      options = [...users];
    } finally {
      loading = false;
    }
  }, 500);

  const dispatch = createEventDispatcher();

  function onChange(value: UserOption[]) {
    opened = false;
    dispatch("change", value);
  }

  let inputRef: HTMLButtonElement;
</script>

<div class="relative w-full">
  <button
    class="input input-bordered input-primary w-full items-center flex flex-wrap gap-4 py-1 pl-4 pr-10 min-h-12"
    on:click={() => (opened = true)}
    bind:this={inputRef}
    use:outside={{
      className: ".bgg-menu-options",
      onClick: () => (opened = false),
    }}
  >
    {#if value.length === 0}
      <div class="text-gray-400">Select users</div>
    {/if}

    {#each value || [] as user (user.value)}
      <button
        class="badge badge-primary"
        on:click={(e) => {
          e.stopPropagation();
          onChange(value.filter((u) => u.value !== user.value));
        }}
      >
        <b>{user.name}</b>
        <span class="pl-2 text-sm">x</span>
      </button>
    {/each}
  </button>
</div>

{#if opened}
  <button
    use:portal={"body"}
    on:click={(e) => {
      e.stopPropagation();
      opened = false;
    }}
    class="fixed z-50 top-0 left-0 h-full w-full bg-slate-600/50"
  />
  <div
    class="fixed z-50 bgg-menu-options drop-shadow-xl rounded-3xl overflow-y-auto p-5 border border-primary w-full h-[250px] bg-white"
    style:width={inputRef?.clientWidth + "px"}
    style:top={inputRef?.getBoundingClientRect().top +
      inputRef?.getBoundingClientRect().height +
      "px"}
    style:left={inputRef?.getBoundingClientRect().left + "px"}
    use:portal={"body"}
  >
    <input
      type="text"
      value={search}
      on:input={(e) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        search = e.target?.value;
        debounceLoadUsers();
      }}
      placeholder="Search by name"
      class="input input-bordered h-12 w-full"
    />

    {#if loading}
      <div class="mt-5">Loading...</div>
    {/if}

    {#if !loading && options.length === 0}
      <div class="mt-5 text-gray-700">No users found</div>
    {/if}

    <div class="mt-5">
      {#each options as option (option.value)}
        <button
          class="cursor-pointer flex w-full hover:bg-gray-100 p-2 rounded-md"
          on:click={() => {
            onChange([
              ...(value?.filter((u) => u.value !== option.value) || []),
              option,
            ]);
          }}
        >
          {option.name}
        </button>
      {/each}
    </div>
  </div>
{/if}
