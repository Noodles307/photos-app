<script lang="ts">
  import { Icons } from "../../../assets/fonts/icons";
  import Icon from "$lib/componets/icon.svelte";
  import CreateUserModal from "./create-user-modal.svelte";

  let opened: "new-user" | null = null;
</script>

{#if opened === "new-user"}
  <CreateUserModal on:close={() => (opened = null)} />
{/if}

{#if !opened}
  <div class="fixed w-full left-0 bottom-0 right-0">
    <div class="relative container mx-auto flex justify-end">
      <button
        on:click={() => (opened = "new-user")}
        class="relative bottom-12 right-12 btn btn-circle btn-primary drop-shadow-lg"
      >
        <Icon name={Icons.Plus} class="text-[30px]" />
      </button>
    </div>
  </div>
{/if}
