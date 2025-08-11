<template>
  <div
    v-reveal="{ classes: 'animate-in fade-in-0 slide-in-from-bottom-2 duration-700' }"
    :style="delayStyle"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  initial?: Record<string, unknown>
  enter?: Record<string, unknown>
  delay?: number
  hovered?: Record<string, unknown>
}>(), {
  initial: () => ({ y: 12, opacity: 0 }),
  enter: () => ({ y: 0, opacity: 1 }),
  delay: 0,
  hovered: () => ({})
})

const delayStyle = computed(() =>
  props.delay ? ({ transitionDelay: `${props.delay}ms` } as Record<string, string>) : undefined
)
</script>


