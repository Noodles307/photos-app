<script lang="ts">
  import type { ActionData, PageData } from "./$types";

  export let form: ActionData;
  export let data: PageData;

  let loading = false;
</script>

<form
  autocomplete="off"
  class="flex flex-col gap-4"
  method="POST"
>
  <input type="hidden" name="inviteHash" value={data.invitedUser.inviteHash} />
  <input type="hidden" name="email" value={data.invitedUser.email} />

  <div class="hero min-h-screen bg-base-200">
    <div class="hero-content flex-col lg:flex-row-reverse">
      <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
        <div class="card-body">
          <div class="form-control">
            <label for="email" class="label">
              <span class="label-text">Email</span>
            </label>
            <input
              autocomplete="off"
              class="input input-bordered"
              disabled
              value={data.invitedUser.email ?? ""}
            />
          </div>

          <div class="form-control">
            <label for="name" class="label">
              <span class="label-text">Name</span>
            </label>
            <input
              id="name"
              type="text"
              name="name"
              autocomplete="off"
              class="input input-bordered"
              required
              disabled={loading}
              value={data.invitedUser.name ?? ""}
            />
          </div>

          <div class="form-control">
            <label for="password" class="label">
              <span class="label-text">Password</span>
            </label>

            <input
              id="password"
              type="password"
              name="password"
              autocomplete="off"
              class="input input-bordered"
              required
              disabled={loading}
            />
          </div>

          {#if form?.incorrect}
            <p class="text-red-600">{form.incorrect}</p>
          {/if}

          <div class="form-control mt-6">
            <button type="submit" class="btn btn-primary">Set password</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</form>
