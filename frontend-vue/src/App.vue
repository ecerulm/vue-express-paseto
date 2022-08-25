<script setup>
import NavBar from "@/components/NavBar.vue";
</script>

<template>
  <NavBar></NavBar>
  <router-link to="/">page1</router-link>
  <router-link to="/page2">page2</router-link>
  <router-view></router-view>
</template>

<style scoped></style>
