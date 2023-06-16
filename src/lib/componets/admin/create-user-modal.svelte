<script lang="ts">
  import { page } from "$app/stores";
  import { createEventDispatcher } from "svelte";
  import Modal from "../modal.svelte";
  import { invalidateAll } from "$app/navigation";
  import { trpc } from "$lib/trpc/client";
  import { form, field } from "svelte-forms";
  import { required, email as emailValidator, min } from "svelte-forms/validators";

  const dispatch = createEventDispatcher();
  const onClose = () => dispatch("close");

  let loading = false;

  const email = field("email", "", [
    required(), emailValidator(),
  ]);
  const name = field("name", "", [required(), min(2)]);

  const userForm = form(email, name);

  async function submit() {

    await userForm.validate();

    if (!$userForm.valid) {
      return;
    }

    try {
      loading = true;
      const { error } = await trpc($page).users.adminCreateUser.mutate({
        email: $email.value,
        name: $name.value,
      });

      if (error) {
        $email.errors.push(error);
        return;
      }

      invalidateAll();
      onClose();
    } catch (err) {
      // serverError = "Not a valid name";
    } finally {
      loading = false;
    }
  }
</script>

<Modal>
  <div slot="title">Create user</div>
  <div slot="content">
    <div class="form-control">
      <label for="email" class="label">
        <span class="label-text">Email</span>
      </label>
      <input
        id="email"
        type="email"
        name="email"
        autocomplete="off"
        class="input input-bordered"
        class:input-error={$email.errors.length > 0}
        placeholder="user@example.com"
        required
        disabled={loading}
        bind:value={$email.value}
      />

      {#if $email.errors.length > 0}
        <p class="mt-4 text-error">{$email.errors}</p>
      {/if}
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
        class:input-error={$name.errors.length > 0}
        placeholder="Name"
        required
        bind:value={$name.value}
        disabled={loading}
      />
      {#if $name.errors.length > 0}
        <p class="mt-4 text-error">Field required</p>
      {/if}
    </div>
  </div>
  <div slot="actions" class="inline-flex gap-8">
    <button class="btn btn-primary" on:click={() => dispatch("close")}>
      cancel
    </button>

    <button
      class="btn"
      class:btn-primary={$userForm.valid}
      class:btn-disabled={!$userForm.valid}
      on:click={submit}
    >
      {#if loading}
        <span class="loading loading-spinner" />
      {/if}
      create
    </button>
  </div>
</Modal>
