<template>
  <div class="space-y-20">
    <section id="home" data-section>
      <AppHero />
    </section>

    <section id="projects" data-section class="full-bleed bg-slate-50/80 dark:bg-slate-900/60 border-y border-slate-200/70 dark:border-slate-800/70 py-12">
      <div class="container mx-auto px-6">
      <h2 class="text-center text-2xl md:text-3xl font-semibold">Featured Projects</h2>
      <ul class="mt-6 grid gap-8 md:grid-cols-2" v-if="projectsToShow.length">
        <li v-for="p in projectsToShow" :key="p._path">
          <NuxtLink :to="p._path" class="group block">
            <article class="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg transition hover:shadow-xl">
              <div class="relative h-56 md:h-64 overflow-hidden">
                <NuxtImg v-if="p.cover" :src="p.cover" :alt="p.title" width="800" height="450" class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div v-else class="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm">No image available</div>
                <div class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white dark:to-slate-900"></div>
              </div>
              <div class="p-5">
                <h3 class="text-lg font-semibold">{{ p.title }}</h3>
                <p class="mt-1 text-gray-600 dark:text-gray-300">{{ p.summary }}</p>
                <div class="mt-3 flex flex-wrap gap-2">
                  <span v-for="t in p.tech" :key="t" class="chip">{{ t }}</span>
                </div>
              </div>
            </article>
          </NuxtLink>
        </li>
      </ul>
      <!-- If there are truly no projects found, render nothing here. -->
      </div>
    </section>

    <section id="about" data-section>
      <h2 class="text-2xl font-semibold">About</h2>
      <div class="card p-5 mt-4">
        <AnimateOnce :delay="80">
          <p class="text-gray-700">Full‑Stack developer (5+ years) shipping production‑grade apps with a focus on UX, performance, and reliability.</p>
        </AnimateOnce>
        <ul class="mt-3 list-disc pl-5 text-gray-700 space-y-1">
          <li><span class="font-medium">Frontend</span>: Vue/Nuxt, React/Next.js, TypeScript</li>
          <li><span class="font-medium">Backend</span>: Django/Flask, Node/Express, Laravel</li>
          <li><span class="font-medium">Data & Cloud</span>: PostgreSQL, MySQL, MongoDB, Firebase · AWS/Azure/GCP</li>
          <li><span class="font-medium">APIs</span>: REST, GraphQL, OAuth/JWT</li>
        </ul>
      </div>
    </section>

    <section id="skills" data-section>
      <h2 class="text-2xl font-semibold">Technical Skills</h2>
      <div class="mt-4 grid gap-6 md:grid-cols-2">
        <SkillBars :items="skillBars" />
        <div>
          <SkillGrid :groups="skillGroups" />
        </div>
      </div>
    </section>

    <section id="certificates" data-section>
      <h2 class="text-2xl font-semibold">Certificates</h2>
      <ul class="mt-4 grid gap-6 md:grid-cols-2">
        <li v-for="c in certs" :key="c.title">
          <article class="card p-5">
            <h3 class="text-lg font-medium">{{ c.title }}</h3>
            <p class="text-gray-600">{{ c.issuer }} — {{ c.date }}</p>
            <div class="mt-2" v-if="c.links?.url"><a class="text-emerald-600 underline" :href="c.links.url" target="_blank" rel="noopener">View</a></div>
          </article>
        </li>
      </ul>
    </section>

    <section id="contact" data-section>
      <h2 class="text-2xl font-semibold">Let's Connect</h2>
      <div class="card p-5 mt-4">
        <p class="text-gray-700">Ready to collaborate or have a project in mind? Let's make something amazing together.</p>
        <div class="mt-4 flex gap-3 flex-wrap">
          <a :href="mailtoHref" class="btn-primary">Get in Touch</a>
          <a v-if="resumeUrl" :href="resumeUrl" target="_blank" rel="noopener" class="btn-outline">View Resume</a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Dang — Portfolio' })

import type { Ref } from 'vue'

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

const { data: featured } = await useAsyncData<ProjectDoc[]>('featured-projects', () =>
  queryContent('projects').where({ featured: true }).sort({ publishedAt: -1 }).find()
)
const { data: recent } = await useAsyncData<ProjectDoc[]>('recent-projects', () =>
  queryContent('projects').sort({ publishedAt: -1 }).limit(2).find()
)

const projectsToShow = computed<ProjectDoc[]>(() => {
  if (Array.isArray(featured?.value) && featured.value.length > 0) return featured.value
  if (Array.isArray(recent?.value)) return recent.value
  return []
})

const certs = [
  { title: 'Certified Mid-Level Vue.js Developer', issuer: 'Vue School / Certificates.dev', date: '2025-08-04', links: { url: 'https://certificates.dev/vuejs/certificates/9f8dea1c-8c97-4773-ac08-6b9630c43834' } },
  { title: 'EdCHART Certificate', issuer: 'Credly', date: '2025-08-01', links: { url: 'https://www.credly.com/badges/83cc9426-704f-4857-935a-ddfe4c08ee9c/public_url' } }
]

// Load skill groups from single JSON source (client-side for reliability)
type SkillItem = { name: string; logo?: string }
type SkillGroup = { title: string; items: SkillItem[] }
type ProfileJson = { skillGroups?: SkillGroup[] }
const skillGroups = ref<SkillGroup[]>([])
type SkillBarItem = { name: string; value: number }
const skillBars = ref<SkillBarItem[]>([])
const resumeUrl = ref<string | null>(null)
const email = 'hello@example.com'
const mailtoHref = computed(() => `mailto:${email}?subject=${encodeURIComponent('Project inquiry — Portfolio')}`)
onMounted(async () => {
  try {
    const res = await fetch('/profile.json', { cache: 'no-cache' })
    const data: any = await res.json()
    if (Array.isArray(data?.skillGroups)) skillGroups.value = data.skillGroups
    if (Array.isArray(data?.skillBars)) skillBars.value = data.skillBars
    if (typeof data?.resumeUrl === 'string') resumeUrl.value = data.resumeUrl
  } catch {}
})
</script>
