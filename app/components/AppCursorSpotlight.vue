<template>
  <ClientOnly>
    <div class="pointer-events-none fixed inset-0 z-[40]" aria-hidden="true">
      <div :style="spotlightStyle" class="h-full w-full mix-blend-screen dark:mix-blend-soft-light"></div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMouse, useWindowScroll } from '@vueuse/core'

const { x, y } = useMouse()
const { x: scrollX, y: scrollY } = useWindowScroll()

const spotlightStyle = computed(() => {
  // Convert page coords to viewport coords so the fixed overlay tracks the cursor while scrolling
  const px = Math.max(0, (x.value || 0) - (scrollX.value || 0))
  const py = Math.max(0, (y.value || 0) - (scrollY.value || 0))
  return {
    background: `radial-gradient(600px at ${px}px ${py}px, rgba(16,185,129,0.18), transparent 60%)`
  }
})
</script>

<style scoped>
/* No extra styles; using Tailwind utilities and inline style for the gradient. */
</style>


