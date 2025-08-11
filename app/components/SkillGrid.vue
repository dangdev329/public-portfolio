<template>
  <div class="grid gap-6 md:grid-cols-2">
    <section v-for="group in groups" :key="group.title" class="card p-5">
      <h3 class="text-xl font-medium">{{ group.title }}</h3>
      <div class="mt-4 flex flex-wrap gap-3">
        <AnimateOnce
          v-for="s in group.items"
          :key="s.name"
          class="inline-flex items-center gap-2 rounded-lg border dark:border-gray-800 bg-white/70 dark:bg-slate-950/40 px-3 py-1.5 text-sm hover:shadow-sm transition"
          :title="s.name"
          :hovered="{ scale: 1.04 }"
        >
          <img
            v-if="s.logo"
            :src="s.logo"
            :alt="s.name + ' logo'"
            width="20"
            height="20"
            loading="lazy"
            referrerpolicy="no-referrer"
            class="opacity-90"
            @error="(e: Event) => ((e.target as HTMLImageElement).style.display = 'none')"
          />
          <span class="whitespace-nowrap">{{ s.name }}</span>
        </AnimateOnce>
      </div>
    </section>
  </div>
  
</template>

<script setup lang="ts">
export type SkillItem = { name: string; logo?: string }
export type SkillGroup = { title: string; items: SkillItem[] }

defineProps<{ groups: SkillGroup[] }>()
</script>

<style scoped>
.card { backdrop-filter: saturate(1.1) blur(1px); }
</style>


