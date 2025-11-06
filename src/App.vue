<template>
  <v-app>
    <v-main>
      <Habits />
    </v-main>
  </v-app>
</template>

<script setup>
import Habits from './views/Habits.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', sans-serif;
}
</style>

