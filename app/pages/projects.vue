<template>
  <div>
    <h1 class="text-center text-3xl font-semibold">Projects</h1>
    <p class="mt-2 text-center text-gray-600 dark:text-gray-300">Selected work including TalentOrange and a Warehouse Management System.</p>
    <ul class="mt-8 grid gap-8 md:grid-cols-2">
      <li v-for="p in projects" :key="p._path">
        <NuxtLink :to="p._path" class="group block">
          <article class="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg transition hover:shadow-xl">
            <div class="relative h-56 md:h-64 overflow-hidden">
              <NuxtImg v-if="p.cover" :src="p.cover" :alt="p.title" width="800" height="450" class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white dark:to-slate-900"></div>
            </div>
            <div class="p-5">
              <h2 class="text-lg font-semibold">{{ p.title }}</h2>
              <p class="mt-1 text-gray-600 dark:text-gray-300">{{ p.summary }}</p>
              <div v-if="p.tech" class="mt-3 flex flex-wrap gap-2">
                <span v-for="t in p.tech" :key="t" class="chip">{{ t }}</span>
              </div>
              <div class="mt-4 text-sm flex gap-4">
                <a v-if="p.links?.demo" :href="p.links.demo" target="_blank" rel="noopener" class="underline">Live</a>
                <a v-if="p.links?.repo" :href="p.links.repo" target="_blank" rel="noopener" class="underline">Code</a>
              </div>
            </div>
          </article>
        </NuxtLink>
      </li>
    </ul>
  </div>
 </template>

<script setup lang="ts">
useHead({ title: 'Projects — Dang' })

type ProjectDoc = {
  _path: string
  title: string
  summary?: string
  cover?: string
  tech?: string[]
  links?: { repo?: string; demo?: string }
}

// Provide a lightweight type shim so linter is happy without generated #content types
declare function queryContent<T = any>(path?: string): any

const { data: projects } = await useAsyncData<ProjectDoc[]>('projects', () =>
  queryContent('/projects').sort({ publishedAt: -1 }).find()
)
</script>
