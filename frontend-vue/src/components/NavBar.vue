<script setup>
import { flashes, removeFlash } from "@/flashes.js";
</script>
<template>
  <div
    v-for="flash in flashes"
    :key="flash"
    class="alert alert-danger m-3"
    role="alert"
  >
    {{ flash }}
    <button
      type="button"
      class="btn-close float-end"
      @click="removeFlash(flash)"
      aria-label="Close"
    ></button>
  </div>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">Navbar</a>
      <button
        type="button"
        class="btn btn-outline-primary"
        @click="$router.push('/login')"
      >
        Login
      </button>
    </div>
  </nav>
</template>
