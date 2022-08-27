<script setup>
import NavBar from "@/components/NavBar.vue";
import { updateLoggedInStatus } from "@/apiclient.js";

updateLoggedInStatus();
</script>

<template>
  <NavBar></NavBar>
  <router-view></router-view>
</template>

<style scoped></style>
