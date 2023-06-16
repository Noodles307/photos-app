<script lang="ts">
  import { page } from "$app/stores";
  import { Icons } from "../../assets/fonts/icons";
  import Icon from "$lib/componets/icon.svelte";
  import { createEventDispatcher } from "svelte";
  import ImageLoader from "./image-loader.svelte";
  import { trpc } from "$lib/trpc/client";

  export let isAdmin = true;
  export let restrictionID: string;
  export let path: string;

  export let selectedUri: string | null = null;
  export let items: Array<{
    name: string;
    uri: string;
    mimeType: string;
    thumbnailUri?: string | null;
    videoIframeUri?: string | null;
  }>;

  $: selectedItem = items.find((item) => item.uri === selectedUri);

  const dispatch = createEventDispatcher();

  function goNext() {
    const index = items.findIndex((item) => item.uri === selectedUri);

    if (index === -1) return;

    if (index === items.length - 1) {
      dispatch("select", items[0].uri);
    } else {
      dispatch("select", items[index + 1].uri);
    }
  }

  function goPrevious() {
    const index = items.findIndex((item) => item.uri === selectedUri);

    if (index === -1) return;

    if (index > 0) {
      dispatch("select", items[index - 1].uri);
    } else {
      dispatch("select", items[items.length - 1].uri);
    }
  }

  function close() {
    dispatch("close");
  }

  function downloadURI(uri: string, name: string) {
    const link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function isImage(mimeType: string) {
    return mimeType.startsWith("image/");
  }
  function isVideo(mimeType: string) {
    return mimeType.startsWith("video/");
  }
  function isAudio(mimeType: string) {
    return mimeType.startsWith("audio/");
  }

  let transcodingVideoPromise: Promise<void> | null = null;

  async function transcodeIt() {
    if (!selectedItem) return;

    try {
      await trpc($page).videos.transcodeVideo.mutate({
        restrictionID,
        path,
        videoName: selectedItem.name,
      });
    } catch (error) {
      console.error(error);
    }
  }
</script>

{#if selectedItem}
  <div
    class="bgg-modal fixed bg-zinc-900/90 top-0 left-0 right-0 bottom-0 flex flex-col w-full h-full"
  >
    <div
      class="bg-black shadow-lg shadow-white/10 z-10 flex flex-grow-0 flex-shrink-0 items-center justify-between px-4 w-full h-16"
    >
      <div
        class="flex w-full container mx-auto justify-between text-white items-center gap-5"
      >
        <span class="truncate">{selectedItem.name}</span>

        <div class="inline-flex">
          {#if isAdmin && isVideo(selectedItem.mimeType)}
            {#await transcodingVideoPromise}
              <span class="loading loading-spinner" />
            {:then}
              <button
                class="btn btn-ghost inline-block"
                title="download"
                on:click={() => (transcodingVideoPromise = transcodeIt())}
              >
                <Icon name={Icons.Video} class="text-white text-[25px]" />
              </button>
            {/await}
          {/if}

          <button
            class="btn btn-ghost inline-block"
            title="download"
            on:click={() =>
              selectedItem && downloadURI(selectedItem.uri, selectedItem.name)}
          >
            <Icon name={Icons.Download} class="text-white text-[25px]" />
          </button>

          <button
            class="btn btn-ghost inline-block"
            on:click={close}
            title="close"
          >
            <Icon name={Icons.Plus} class=" rotate-45 text-[30px]" />
          </button>
        </div>
      </div>
    </div>

    <div
      class="w-full flex-1 self-stretch overflow-hidden flex items-center justify-center"
    >
      {#if isImage(selectedItem.mimeType)}
        <ImageLoader
          src={selectedItem.uri}
          class="w-full object-contain h-full"
          width={1200}
          height={800}
        >
          <div slot="loading">
            <span class="loading loading-spinner text-primary loading-lg" />
          </div>
          <div slot="error">
            <span class="text-white"
              >Something went wrong while loading the image</span
            >
          </div>
        </ImageLoader>
      {:else if isVideo(selectedItem.mimeType) && selectedItem.videoIframeUri}
        <div class="w-full h-full relative">
          <iframe
            title={selectedItem.name}
            src={selectedItem.videoIframeUri}
            loading="lazy"
            style="border: none; position: absolute; top: 0; height: 100%; width: 100%;"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowfullscreen={true}
          />
        </div>
      {:else if isAudio(selectedItem.mimeType)}
        <div class="px-8">
          <audio
            class="w-full object-contain"
            controls
            src={selectedItem.uri}
          />
        </div>
      {:else}
        <div class="px-10">
          <div class="text-xl text-white text-center">
            <div>{selectedItem.name}</div>
            <div>Sorry... we can't display this item</div>

            <button
              class="btn btn-ghost inline-block"
              title="download"
              on:click={() =>
                selectedItem &&
                downloadURI(selectedItem.uri, selectedItem.name)}
            >
              Download <Icon
                name={Icons.Download}
                class="text-white text-[25px] align-middle"
              />
            </button>
          </div>
        </div>
      {/if}
    </div>

    {#if items.length > 1}
      <div class="flex items-center absolute px-5 left-0 top-16 bottom-[100px]">
        <button on:click={goPrevious} class="btn btn-primary btn-circle">
          ❮
        </button>
      </div>
      <div
        class="flex items-center absolute px-5 right-0 top-16 bottom-[100px]"
      >
        <button on:click={goNext} class="btn btn-primary btn-circle">
          ❯
        </button>
      </div>
    {/if}
  </div>
{/if}
