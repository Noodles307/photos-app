<script lang="ts">
  import { page } from "$app/stores";
  import Icon from "$lib/componets/icon.svelte";
  import { Icons } from "../../assets/fonts/icons";
</script>

<div class="w-full h-full">
  <div
    class="h-screen fixed left-0 top-0 bottom-0 flex-grow-0 flex-shrink-0 w-[80px] flex flex-col items-center justify-start bg-secondary pt-4 font-bold drop-shadow-2xl"
  >
    <a
      href="/"
      class="text-primary-content hover:underline flex-shrink-0 flex-grow-0"
      >bGG</a
    >

    <div class="flex flex-1 flex-col gap-4 items-center justify-center">
      <a href="/users" title="Users">
        <Icon
          name={Icons.Users}
          class={`text-3xl btn btn-circle ${
            $page.route.id === "/(admin)/users" ? "btn-primary" : "btn-outline"
          }`}
        />
      </a>
      <a href="/logs" title="Logs">
        <Icon
          name={Icons.Logs}
          class={`text-3xl btn btn-circle ${
            $page.route.id === "/(admin)/logs" ? "btn-primary" : "btn-outline"
          }`}
        />
      </a>
      <a href="/videos" title="Video transcoding">
        <Icon
          name={Icons.Play}
          class={`text-3xl btn btn-circle ${
            $page.route.id === "/(admin)/videos" ? "btn-primary" : "btn-outline"
          }`}
        />
      </a>
      <a href="/metrics" title="Metrics">
        <Icon
          name={Icons.Metrics}
          class={`text-3xl btn btn-circle ${
            $page.route.id === "/(admin)/metrics"
              ? "btn-primary"
              : "btn-outline"
          }`}
        />
      </a>
    </div>
    <div class="w-full h-[150px] flex-grow-0 flex-shrink-0" />
  </div>

  <div
    class="pl-[80px] overflow-x-hidden overflow-y-auto h-full container mx-auto pt-16"
  >
    <div class="px-4 min-h-screen">
      <slot />
    </div>
  </div>
</div>
