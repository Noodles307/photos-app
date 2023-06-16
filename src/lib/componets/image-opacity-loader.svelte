<script lang="ts">
  import { onMount } from "svelte";

  let clazz = "";
  export { clazz as class };
  export let src: string;
  export let width: number;
  export let height: number;

  let ref: HTMLImageElement;

  onMount(() => {
    if (!ref) {
      return;
    }

    if (ref.complete) {
      ref.style.opacity = "1";
    } else {
      ref.addEventListener("load", () => {
        ref.style.opacity = "1";
      });
    }
  });
</script>

<img
  bind:this={ref}
  class={clazz}
  {width}
  {height}
  {src}
  alt=""
  loading="lazy"
  decoding="async"
  style:opacity={0}
  on:contextmenu|preventDefault={() => {
    return false;
  }}
/>
