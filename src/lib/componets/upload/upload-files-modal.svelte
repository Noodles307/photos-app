<script lang="ts">
  import { createEventDispatcher, onDestroy } from "svelte";
  import { invalidateAll } from "$app/navigation";
  import omit from "lodash/omit";
  import debounce from "lodash/debounce";
  import { uploadFile } from "$lib/utils/upload";
  import Modal from "../modal.svelte";
  import UploadingFile from "./uploading-file.svelte";

  const dispatch = createEventDispatcher();

  export let restrictionID = "";
  export let path = "";

  let fileIds = 0;
  let uploadingFilesMap: Record<
    number,
    {
      id: number;
      file: File;
      status: "error" | "progress" | "uploaded";
      progress: number;
      abort: () => void;
    }
  > = {};

  $: uploadingFiles = Object.values(uploadingFilesMap).sort((a, b) => {
    if (a.status === "error") {
      return 1;
    } else if (b.status === "error") {
      return -1;
    }

    return 0;
  });

  $: uploadedSuccessfully = uploadingFiles.filter(
    (f) => f.status === "uploaded"
  );

  onDestroy(() => {
    uploadingFiles.forEach((f) => {
      if (f.status === "progress") {
        f.abort();
      }
    });
  });

  const throttledInvalidate = debounce(invalidateAll, 500);

  const startUpload = (file: File) => {
    const fileId = ++fileIds;
    uploadingFilesMap[fileId] = {
      file,
      id: fileId,
      progress: 0,
      status: "progress",
      abort: uploadFile(file, restrictionID, path, {
        done: () => {
          uploadingFilesMap[fileId].progress = 1;
          uploadingFilesMap[fileId].status = "uploaded";
          throttledInvalidate();
        },
        error: () => {
          uploadingFilesMap[fileId].progress = 0;
          uploadingFilesMap[fileId].status = "error";
        },
        progress: (p) => {
          uploadingFilesMap[fileId].progress = p;
        },
      }),
    };
  };

  function handleFileInputChange(e: Event) {
    const files = [];
    const target = e.currentTarget as HTMLInputElement;
    for (let i = 0; i < (target.files?.length || 0); ++i) {
      if (target.files && target.files[i]) {
        files.push(target.files[i]);
      }
    }
    if (files.length > 0) {
      target.value = "";
    }

    files.forEach(startUpload);
  }

  function retryUploading(id: number) {
    if (uploadingFilesMap[id].status === "error") {
      const { file } = uploadingFilesMap[id];
      startUpload(file);
      uploadingFilesMap = omit(uploadingFilesMap, id);
    }
  }

  function removeUploadingFile(id: number) {
    if (uploadingFilesMap[id] && uploadingFilesMap[id].status === "uploaded") {
      return;
    }

    if (uploadingFilesMap[id].status === "progress") {
      uploadingFilesMap[id].abort();
    }

    uploadingFilesMap = omit(uploadingFilesMap, id);
  }
</script>

<Modal>
  <div slot="title">
    Upload files
    {#if uploadingFiles.length > 0}
      {uploadedSuccessfully.length} / {uploadingFiles.length}
    {/if}
  </div>
  <div slot="content">
    <input
      type="file"
      hidden
      multiple
      id="upload-input"
      accept="audio/*,video/*,image/*"
      on:change={handleFileInputChange}
    />
    {#if uploadingFiles.length === 0}
      <label
        for="upload-input"
        class="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
      >
        <div
          class="btn btn-primary mb-4"
        >
          Upload files
        </div>
        <p class="text-xs text-gray-500">
          Images, Audios and Videos (10gb max)
        </p>
      </label>
    {:else}
      <div class="grid grid-cols-1 divide-y divide-slate-400">
        {#each uploadingFiles as status (status.id)}
          <UploadingFile
            fileName={status.file.name}
            progress={status.progress}
            status={status.status}
            on:close={() => removeUploadingFile(status.id)}
            on:retry={() => retryUploading(status.id)}
          />
        {/each}
      </div>
    {/if}
  </div>
  <div slot="actions" class="inline-flex gap-8">
    <button class="btn btn-primary" on:click={() => dispatch("close")}>
      cancel
    </button>
    {#if uploadingFiles.length > 0}
      <label for="upload-input" class="btn btn-primary"> Upload more </label>
    {/if}
  </div>
</Modal>
