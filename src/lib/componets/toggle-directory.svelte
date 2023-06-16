<script lang="ts">
  import Portal from "svelte-portal/src/Portal.svelte";
  import { createEventDispatcher } from "svelte";
  import type { Directory } from "$lib/types";
  import { Icons } from "../../assets/fonts/icons";
  import Icon from "$lib/componets/icon.svelte";
    import PreviewDirectory from "./preview-directory.svelte";

  export let name: string;
  export let fullPath: string;
  export let children: Array<Directory>;
  export let selected: boolean;

  const dispatch = createEventDispatcher();

  function toggle(dir: { name: string; fullPath: string }) {
    dispatch("change", dir);
  }

  let opened = false;

  let buttonRef: HTMLButtonElement;
</script>

<div class="my-6 select-none">
  <label class="cursor-pointer flex items-center gap-4 group">
    <input
      type="checkbox"
      checked={selected}
      on:change={() => toggle({ name, fullPath })}
      class="checkbox checkbox-primary checkbox-sm"
    />
    <Icon
      name={Icons.Directory}
      class="text-[22px] text-primary group-hover:text-primary-focus"
    />
    <span class="label-text group-hover:font-bold">{name}</span>

    <button
      class="btn btn-ghost btn-primary btn-circle btn-sm"
      title="preview"
      bind:this={buttonRef}
      on:click={() => (opened = true)}
    >
      <Icon name={Icons.Eye} class="text-[22px]" />
    </button>
  </label>
  <div class="pl-8">
    {#each children as child}
      <svelte:self
        name={child.name}
        fullPath={child.fullPath}
        children={child.children}
        selected={child.selected}
        on:change={(evt) => toggle(evt.detail)}
      />
    {/each}
  </div>
</div>

{#if opened}
  <Portal>
    <button
      class="fixed z-20 flex top-0 left-0 h-full w-full bg-slate-600/50"
      on:click={(e) => {
        e.stopPropagation();
        e.preventDefault();
        opened = false;
      }}
    />
    <div
      style:top={`${buttonRef.getBoundingClientRect().bottom}px`}
      style:left={`${buttonRef.getBoundingClientRect().x}px`}
      class="optionsContainer fixed z-20 overflow-hidden rounded-md w-[200px] h-[200px] bg-gray-50 text-black p-4"
    >
      <PreviewDirectory folderPath={fullPath} />
    </div>
  </Portal>
{/if}
