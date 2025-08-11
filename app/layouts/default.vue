<template>
  <div class="min-h-screen flex flex-col app-backdrop">
    <!-- Weather effects: rain in dark mode, sun/rainbow in light mode -->
    <ClientOnly>
      <AppRain v-if="isDark" />
      <AppSunny v-else />
    </ClientOnly>
    <AppCursorSpotlight />
    <AppBackground />
    <AppNav />
    <main class="flex-1 container mx-auto p-6">
      <slot />
    </main>
    <footer class="border-t py-6 text-center text-sm text-gray-500 dark:border-gray-800">
      © {{ year }} Dang — Built with Nuxt
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const year = new Date().getFullYear()
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
</script>

<style scoped>
.container { max-width: 1100px; }
</style>
