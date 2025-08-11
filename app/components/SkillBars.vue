<template>
  <div class="space-y-4">
    <div v-for="s in items" :key="s.name">
      <div class="flex items-center justify-between mb-1">
        <span class="text-sm font-medium">{{ s.name }}</span>
        <span class="text-xs text-gray-500">{{ s.value }}%</span>
      </div>
      <div class="h-2 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div class="h-full bg-emerald-600 dark:bg-emerald-500" :style="{ width: `${Math.min(100, Math.max(0, s.value))}%` }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export type SkillBarItem = { name: string; value: number }
defineProps<{ items: SkillBarItem[] }>()
</script>



