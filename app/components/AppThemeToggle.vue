<template>
  <button
    class="inline-flex items-center gap-2 border rounded px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-900"
    @click="toggle"
    aria-label="Toggle color mode"
  >
    <span v-if="colorMode.value === 'dark'">🌙</span>
    <span v-else>☀️</span>
    <span class="hidden sm:inline">{{ colorMode.value === 'dark' ? 'Dark' : 'Light' }}</span>
  </button>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const toggle = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>
