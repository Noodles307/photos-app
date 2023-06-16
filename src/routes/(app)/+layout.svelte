<script lang="ts">
  import type { LayoutData } from "./$types";
  import UserBurgerMenuButton from "$lib/componets/user-burger-menu-button.svelte";

  export let data: LayoutData;
</script>

<div class="w-full flex mb-10 justify-between bg-primary p-4 font-bold shadow">
  <div class="container mx-auto flex items-center justify-between px-7">
    <a href="/" class="text-primary-content hover:underline">bGG</a>

    {#if data.user}
      <UserBurgerMenuButton isAdmin={data.user.role === 'ADMIN'} />
    {/if}
  </div>
</div>

<div class="container mx-auto px-4">
  <slot />
</div>
