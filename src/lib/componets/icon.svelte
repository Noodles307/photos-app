<script lang="ts">
  export let name = "";
  let clazz = "";
  export { clazz as class };
</script>

<i class={`custom-icon icon-${name} ${clazz}`} />

<style>
  .custom-icon {
    line-height: 1;
    display: inline-flex;
  }
</style>
