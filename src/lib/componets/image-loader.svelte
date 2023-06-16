<script lang="ts">
  export let src: string | null;
  export let width: number;
  export let height: number;
  let clazz = "";
  export { clazz as class };

  let loadImagePromise: Promise<void>;

  $: {
    if (src) {
      loadImagePromise = startLoadImage();
    }
  }

  function startLoadImage() {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.src = src || "";
      img.onload = () => {
        resolve();
      };
    });
  }
</script>

{#await loadImagePromise}
  <slot name="loading" />
{:then}
  <img
    class={clazz}
    {width}
    {height}
    {src}
    alt=""
    loading="lazy"
    decoding="async"
    on:contextmenu|preventDefault={() => { return false }}
  />
{:catch}
  <slot name="error">Something went wrong while loading the image</slot>
{/await}
