<template>
  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
    <article
      v-for="t in items"
      :key="t.name + t.title"
      class="card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 shadow-lg h-full flex flex-col"
    >
      <p class="text-base leading-7 text-gray-800 dark:text-gray-200 flex-1">“{{ t.quote }}”</p>
      <div class="mt-4 flex items-center gap-3">
        <div class="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 grid place-items-center text-emerald-700 dark:text-emerald-300 text-sm font-semibold overflow-hidden">
          <NuxtImg v-if="t.avatar" :src="t.avatar" :alt="t.name" width="80" height="80" class="h-full w-full object-cover" />
          <span v-else>{{ initials(t.name) }}</span>
        </div>
        <div>
          <div class="font-medium">{{ t.name }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">{{ t.title }}</div>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
export type Testimonial = {
  name: string
  title?: string
  quote: string
  avatar?: string
}

defineProps<{ items: Testimonial[] }>()

function initials(name: string): string {
  const parts = (name || '').trim().split(/\s+/)
  return parts.slice(0, 2).map(p => p[0]?.toUpperCase()).join('') || 'U'
}
</script>


