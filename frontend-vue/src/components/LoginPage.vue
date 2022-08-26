<script setup>
import { ref } from "vue";
import { login } from "@/apiclient.js";
const username = ref("");
const password = ref("");
</script>
<template>
  <form class="loginform" @submit.prevent="login(username, password)">
    <div class="mb-3">
      <label for="username" class="form-label">Email address</label>
      <input
        id="username"
        type="text"
        autocomplete="username"
        placeholder="Username"
        class="form-control"
        v-model="username"
      />
      <label for="password" class="form-label">Password</label>
      <input
        id="password"
        type="text"
        placeholder="Password"
        autocomplete="current-password"
        class="form-control"
        v-model="password"
      />
    </div>
    <button
      class="btn btn-lg btn-primary btn-block"
      type="submit"
      style="width: 100%"
    >
      Sign in
    </button>
  </form>
</template>

<style scope>
.loginform {
  width: 100%;
  max-width: 350px;
  padding: 15px;
  margin: auto;
}
</style>
