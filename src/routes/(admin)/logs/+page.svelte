<script lang="ts">
  import type { PageData } from "./$types";
  import dayjs from "dayjs";

  export let data: PageData;

  let searchValue = data.search || "";
</script>

<h1 class="text-xl mb-10">Logs list:</h1>

<div class="mb-10 flex items-center gap-5">
  <div class="dropdown">
    <label tabindex="0" class="btn m-1"> {data.level || "Log Level"} </label>
    <ul
      tabindex="0"
      class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10"
    >
      <li><a data-sveltekit-reload href="/logs">ALL</a></li>
      <li><a data-sveltekit-reload href="/logs?level=INFO">INFO</a></li>
      <li><a data-sveltekit-reload href="/logs?level=WARN">WARN</a></li>
      <li><a data-sveltekit-reload href="/logs?level=ERROR">ERROR</a></li>
      <li><a data-sveltekit-reload href="/logs?level=CRITICAL">CRITICAL</a></li>
    </ul>
  </div>

  <div class="input-group">
    <input
      type="text"
      bind:value={searchValue}
      placeholder="Search by message"
      class="input input-bordered input-primary w-full max-w-xs"
    />
    <a
      href={`/logs?search=${searchValue}&level=${data.level}`}
      class="btn bt-circle btn-primary">Search</a
    >
  </div>
</div>

{#if data.count === 0}
  <div>No logs found</div>
{:else}
  <div class="overflow-x-auto">
    <table class="table">
      <!-- head -->
      <thead>
        <tr>
          <th />
          <th>CreatedAt</th>
          <th>Level</th>
          <th>Message</th>
          <th>UserId</th>
        </tr>
      </thead>
      <tbody>
        {#each data.items as log (log.id)}
          <tr>
            <td>{log.id}</td>
            <td>{dayjs(log.createdAt).format("DD-MM-YYYY HH:mm")}</td>
            <td>{log.level}</td>
            <td>{log.message}</td>
            <td>{log.userId}</td>
          </tr>
        {/each}
      </tbody>
    </table>
    <div class="flex w-full justify-center mb-10">
      <div class="join">
        <a
          href={`/logs?skip=${Math.max(data.skip - data.take, 0)}&take=${
            data.take
          }&level=`}
          class="join-item btn"
          class:btn-disabled={data.skip === 0}>Prev</a
        >
        <a
          href={`/logs?skip=${Math.min(
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
