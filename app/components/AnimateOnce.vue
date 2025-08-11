<template>
  <ClientOnly>
    <div ref="rootEl" :class="revealed ? revealClasses : ''" :style="delayStyle" v-bind="$attrs">
      <slot />
    </div>
    <template #fallback>
      <div v-bind="$attrs">
        <slot />
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  delay?: number
  classes?: string
}>(), {
  delay: 0,
  classes: 'animate-in fade-in-0 slide-in-from-bottom-2 duration-700'
})

const rootEl = ref<HTMLElement | null>(null)
const revealed = ref(false)
const revealClasses = computed(() => props.classes)
const delayStyle = computed(() => (props.delay ? ({ transitionDelay: `${props.delay}ms` } as Record<string, string>) : undefined))

onMounted(() => {
  const el = rootEl.value
  if (!el) return
  const observer = new IntersectionObserver((entries, obs) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        revealed.value = true
        obs.unobserve(entry.target)
      }
    }
  }, { threshold: 0.2 })
  observer.observe(el)
})
</script>


