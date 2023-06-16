<script lang="ts">
  import omit from "lodash/omit";
  import FileItem from "$lib/componets/file-item.svelte";
  import Icon from "$lib/componets/icon.svelte";
  import type { PageData } from "./$types";
  import { goto } from "$app/navigation";
  import { Icons } from "../../../../assets/fonts/icons";
  import SelectedHeader from "$lib/componets/selected-header.svelte";
  import UploadButton from "$lib/componets/upload/upload-button.svelte";
  import CarouselModal from "$lib/componets/carousel-modal.svelte";

  export let data: PageData;

  $: selectedItems = {} as Record<string, string>;

  let clickedItem: string | null = null;

  // Cleanup when folderPath changes
  $: {
    // Hack to trigger cleanup on dataPath change
    if (data.path) {
      console.log("data-path changed");
    }
    clickedItem = null;
    selectedItems = {};
  }

  function toggleItem(uri: string) {
    if (selectedItems[uri]) {
      selectedItems = omit(selectedItems, [uri]);
    } else {
      const file = data.folderData?.files.find((f) => f.uri === uri);
      if (!file) return;
      selectedItems[uri] = file?.name;
    }
  }

  function selectAll() {
    data.folderData?.files.forEach((file) => {
      selectedItems[file.uri] = file.name;
    });
  }

  function deselectAll() {
    console.log("deselect all");
    selectedItems = {};
  }

  function openItem(uri: string) {
    const hasItems = Object.keys(selectedItems).length > 0;
    if (!hasItems) {
      const file = data.folderData?.files.find((f) => f.uri === uri);
      if (file?.isDirectory) {
        goto(uri);
      } else {
        clickedItem = uri;
      }
      return;
    }

    toggleItem(uri);
  }

  $: paths = data.path?.split("/").filter(Boolean) || [];
  $: segments = paths.map((segment, index) => ({
    segment: segment,
    parentSegments: paths.slice(0, index + 1).join("/"),
  }));

  $: hasSelectedDirectory =
    (Object.keys(selectedItems).length === 1 &&
      data.folderData?.files.find(
        (file) => file.uri === Object.keys(selectedItems)[0]
      )?.isDirectory) ||
    false;
</script>

{#if data.error}
  <div>
    <h1>{data.error}</h1>
  </div>
{:else if data.folderData}
  <div class="text-sm breadcrumbs text-primary-content mb-7">
    <ul class="mx-3">
      <li>
        <Icon name={Icons.Folder} class="text-[25px] mr-2" />
        <a href={`/folder/${data.restrictionID}`}>
          {data.folderData?.name || "Home"}
        </a>
      </li>
      {#each segments as { segment, parentSegments } (segment)}
        <li>
          <Icon name={Icons.Folder} class="text-[25px] mr-2" />
          <a href={`/folder/${data.restrictionID}?path=${parentSegments}`}>
            {segment}
          </a>
        </li>
      {/each}
    </ul>
  </div>

  {#if data.folderData?.files.length === 0}
    <div
      class="w-full h-80 flex flex-col justify-center items-center text-gray-400"
    >
      <Icon name={Icons.Empty} class="text-[100px]" />
      <p class="text-2xl">This folder is empty</p>
    </div>
  {/if}

  <div class="bgg-grid">
    {#each data.folderData?.files || [] as item (item.uri)}
      <FileItem
        name={item.name}
        isDirectory={item.isDirectory}
        mimeType={item.mimeType || ""}
        thumbnailUri={item.thumbnailUri || null}
        uri={item.uri}
        isSelected={!!selectedItems[item.uri]}
        on:open={(e) => openItem(e.detail)}
        on:select={(e) => toggleItem(e.detail)}
      />
    {/each}
  </div>

  {#if Object.keys(selectedItems).length > 0}
    <SelectedHeader
      {selectedItems}
      path={data.path}
      restrictionID={data.restrictionID}
      allowDeleteFiles={data.folderData.canDelete}
      allowShare={data.user?.role === "ADMIN" && hasSelectedDirectory}
      on:select-all={selectAll}
      on:deselect-all={deselectAll}
    />
  {/if}

  {#if data.folderData.canWrite}
    <UploadButton path={data.path} restrictionID={data.restrictionID} />
  {/if}

  {#if clickedItem}
    <CarouselModal
      isAdmin={data.user?.role === "ADMIN"}
      path={data.path}
      restrictionID={data.restrictionID}
      selectedUri={clickedItem}
      items={data.folderData.files.filter((f) => !f.isDirectory) || []}
      on:close={() => (clickedItem = null)}
      on:select={(e) => (clickedItem = e.detail)}
    />
  {/if}
{:else}
  <div>
    <h1>Not found</h1>
  </div>
{/if}

<style>
  .bgg-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    grid-gap: 1rem;
    padding: 1rem;
    padding-bottom: 10rem;
  }
</style>
