<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="open" class="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60" @click="emit('close')" />
        <div class="relative z-10 w-full max-w-5xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
          <header class="flex items-start justify-between gap-4 p-6 md:p-7 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 class="text-xl font-semibold">{{ project?.title }}</h3>
              <p v-if="project?.role" class="text-xs mt-1 text-emerald-600 dark:text-emerald-400">{{ project.role }}</p>
              <p v-if="project?.summary" class="text-sm text-gray-600 dark:text-gray-300 mt-1">{{ project.summary }}</p>
            </div>
            <button class="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800" @click="emit('close')" aria-label="Close">✕</button>
          </header>
          <div class="p-6 md:p-7 grid gap-6 md:grid-cols-2">
            <div class="relative h-72 md:h-96 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
              <NuxtImg v-if="project?.cover" :src="project.cover" :alt="project?.title || 'Project image'" width="960" height="540" class="absolute inset-0 h-full w-full object-cover" />
              <div v-else class="absolute inset-0 grid place-items-center text-slate-500">No image</div>
            </div>
            <div>
              <p v-if="project?.longDesc" class="text-sm leading-6 text-gray-700 dark:text-gray-300">{{ project.longDesc }}</p>
              <ul v-if="project?.features?.length" class="mt-3 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li v-for="f in project.features" :key="f">{{ f }}</li>
              </ul>
              <div v-if="project?.integrations?.length" class="mt-3 text-xs text-gray-600 dark:text-gray-400">
                <span class="font-medium">Integrations:</span>
                {{ project.integrations.join(', ') }}
              </div>
              <div v-if="project?.tech?.length" class="flex flex-wrap gap-2 mt-4">
                <span v-for="t in project.tech" :key="t" class="chip">{{ t }}</span>
              </div>
              <div v-if="project?.links" class="mt-4 flex gap-4 text-sm">
                <a v-if="project.links.demo" :href="project.links.demo" target="_blank" rel="noopener" class="underline">Live</a>
                <a v-if="project.links.repo" :href="project.links.repo" target="_blank" rel="noopener" class="underline">Code</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
type Project = {
  title?: string
  summary?: string
  cover?: string
  tech?: string[]
  links?: { repo?: string; demo?: string }
  role?: string
  longDesc?: string
  features?: string[]
  integrations?: string[]
}

defineProps<{ open: boolean; project?: Project | null }>()
const emit = defineEmits<{ (e: 'close'): void }>()

onMounted(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') emit('close')
  }
  window.addEventListener('keydown', onKey)
  onUnmounted(() => window.removeEventListener('keydown', onKey))
})
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>


