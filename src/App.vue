<template>
  <div id="app">
    <TodoList />
  </div>
</template>

<script setup lang="ts">
import TodoList from './components/TodoList.vue'
</script>

<style>
#app {
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>