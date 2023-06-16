<script lang="ts">
  import { Icons } from "../../assets/fonts/icons";
  import Icon from "$lib/componets/icon.svelte";

  export let mimeType = "";
  let clazz = "";
  export { clazz as class };
</script>

{#if mimeType.startsWith("image/")}
  <Icon name={Icons.Image} class={clazz} />
{:else if mimeType.startsWith("video/")}
  <Icon name={Icons.Video} class={clazz} />
{:else if mimeType.startsWith("audio/")}
  <Icon name={Icons.Audio} class={clazz} />
{:else}
  <Icon name={Icons.File} class={clazz} />
{/if}
