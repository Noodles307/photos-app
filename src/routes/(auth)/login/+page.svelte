<script lang="ts">
  import type { ActionData } from "./$types";

  export let form: ActionData;

  let loading = false;
</script>

<form class="flex flex-col gap-4" method="POST" action="/login">
  <div class="hero min-h-screen bg-base-200">
    <div class="hero-content flex-col lg:flex-row-reverse">
      <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
        <div class="card-body">
          <div class="form-control">
            <label for="email" class="label">
              <span class="label-text">Email</span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              class="input input-bordered"
              required
              disabled={loading}
              value={form?.email ?? ""}
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
              class="input input-bordered"
              required
              disabled={loading}
            />
          </div>

          {#if form?.incorrect}
            <p class="text-red-600">Invalid credentials</p>
          {/if}

          <div class="form-control mt-6">
            <button type="submit" class="btn btn-primary">Login</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</form>
