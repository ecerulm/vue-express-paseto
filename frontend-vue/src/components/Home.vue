<script setup>
import {
  username,
  counter,
  updateCounterValue,
  increaseCounter,
} from "@/apiclient.js";
</script>
<template>
  <p>You are logged in as {{ username }}</p>

  <p>Current counter value: {{ counter }}</p>
  <button type="button" class="btn btn-primary" @click="updateCounterValue()">
    Update
  </button>

  <p>Press the button to increase the counter (api call):</p>
  <button type="button" class="btn btn-primary" @click="increaseCounter()">
    Increase
  </button>
</template>
