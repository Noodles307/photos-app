<script lang="ts">
  import dayjs from "dayjs";
  import AddUserButton from "$lib/componets/admin/add-user-button.svelte";
  import EditUserButton from "$lib/componets/admin/edit-user-button.svelte";
  import type { PageData } from "./$types";
  export let data: PageData;
</script>

{#if data.error}
  <div>{data.error}</div>
{:else}
  <h1 class="text-xl">Users list:</h1>

  <div class="mt-5 bgg-user-list">
    {#each data.users as user (user.id)}
      <div class="card bg-base-100 shadow-2xl">
        <div class="card-body">
          <h2 class="card-title">{user.name}</h2>
          <p>{user.email} - <b>{user.role}</b></p>
          <p>
            Created:
            {" "}
            <span class="text-gray-500"
              >{dayjs(user.createdAt).format("DD-MMM-YYYY HH:mm")}</span
            >
          </p>
          <p>
            {#if user.inviteHash}
              <span class="text-sm">Doesn't have a password yet</span>
            {/if}
          </p>
          <div class="card-actions justify-end">
            <EditUserButton {user} />
          </div>
        </div>
      </div>
    {/each}
  </div>

  <AddUserButton />
{/if}

<style>
  .bgg-user-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    padding-bottom: 10rem;
  }
</style>
