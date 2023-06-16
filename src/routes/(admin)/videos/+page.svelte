<script lang="ts">
  import { page } from "$app/stores";
  import { trpc } from "$lib/trpc/client";
  import type { PageData } from "./$types";
  import dayjs from "dayjs";

  export let data: PageData;

  async function transcodeAll() {
    try {
      await trpc($page).videos.transcodeAllVideos.mutate();
    } catch (error) {
      console.error(error);
    }
  }
</script>

<h1 class="text-xl mb-10">Bunny videos:</h1>

<div class="mb-10 flex items-center justify-between gap-5">
  <div class="dropdown">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <label tabindex="0" class="btn m-1">
      {data.status || "Video Status"}
    </label>
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <ul
      tabindex="0"
      class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10"
    >
      <li><a data-sveltekit-reload href="/videos">ALL</a></li>
      <li>
        <a data-sveltekit-reload href="/videos?status=UPLOADING">UPLOADING</a>
      </li>
      <li>
        <a data-sveltekit-reload href="/videos?status=UPLOADED">UPLOADED</a>
      </li>
      <li><a data-sveltekit-reload href="/videos?status=ERROR">ERROR</a></li>
    </ul>
  </div>

  <button class="btn btn-primary" on:click={transcodeAll}
    >transcode all videos</button
  >
</div>

{#if data.count === 0}
  <div>No videos uploaded to bunny</div>
{:else}
  <div class="overflow-x-auto">
    <table class="table">
      <!-- head -->
      <thead>
        <tr>
          <th />
          <th>Status</th>
          <th>CreatedAt</th>
          <th>FullPath</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {#each data.items as video (video.id)}
          <tr>
            <td>{video.id}</td>
            <td>{video.status}</td>
            <td>{dayjs(video.createdAt).format("DD-MM-YYYY HH:mm")}</td>
            <td>{video.fullPath}</td>
            <td>
              {#if video.status !== "UPLOADED"}
                <a
                  href={`/videos/${video.id}/retry`}
                  class="btn btn-primary btn-circle btn-sm">Retry</a
                >
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    <div class="flex w-full justify-center mb-10">
      <div class="join">
        <a
          href={`/videos?skip=${Math.max(data.skip - data.take, 0)}&take=${
            data.take
          }&level=`}
          class="join-item btn"
          class:btn-disabled={data.skip === 0}>Prev</a
        >
        <a
          href={`/videos?skip=${Math.min(
            data.skip + data.take,
            data.count - data.take
          )}&take=${data.take}&level=`}
          class="join-item btn"
          class:btn-disabled={data.skip + data.take >= data.count}>Next</a
        >
      </div>
    </div>
  </div>
{/if}
