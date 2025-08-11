<template>
  <div class="space-y-20">
    <section id="home" data-section>
      <AppHero />
    </section>

    <section id="projects" data-section class="full-bleed bg-slate-50/80 dark:bg-slate-900/60 border-y border-slate-200/70 dark:border-slate-800/70 py-12">
      <div class="container mx-auto px-6">
      <h2 class="text-center text-2xl md:text-3xl font-semibold">Featured Projects</h2>
      <ul class="mt-6 grid gap-8 md:grid-cols-2">
        <li v-for="p in projectsToShow" :key="p.title">
          <div class="group block">
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
                <div class="mt-4 text-sm flex gap-4">
                  <a v-if="p.links?.demo" :href="p.links.demo" target="_blank" rel="noopener" class="underline">Live</a>
                  <a v-if="p.links?.repo" :href="p.links.repo" target="_blank" rel="noopener" class="underline">Code</a>
                </div>
              </div>
            </article>
          </div>
        </li>
      </ul>
      <!-- No explicit empty state needed; we fall back to hardcoded examples. -->
      </div>
    </section>

    <section id="about" data-section>
      <h2 class="text-2xl font-semibold">Certificates</h2>
      <ul class="mt-4 grid gap-6 md:grid-cols-2">
        <li v-for="c in certs" :key="c.title">
          <article class="card p-5">
            <div v-if="c.thumb" class="mb-3 w-full h-48 md:h-56 flex items-center justify-center overflow-hidden">
              <img :src="c.thumb" :alt="c.title" class="max-h-full w-auto object-contain rounded-md border border-slate-200 dark:border-slate-800" loading="lazy" decoding="async" />
            </div>
            <h3 class="text-lg font-medium">{{ c.title }}</h3>
            <p class="text-gray-600">{{ c.issuer }} — {{ c.date }}</p>
            <div class="mt-2" v-if="c.links?.url"><a class="text-emerald-600 underline" :href="c.links.url" target="_blank" rel="noopener">View</a></div>
          </article>
        </li>
      </ul>
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

    

    
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Dang — Portfolio' })

import type { Ref } from 'vue'

type ProjectDoc = {
  _path?: string
  title: string
  summary?: string
  cover?: string
  tech?: string[]
  links?: { repo?: string; demo?: string }
  featured?: boolean
  slug?: string
}

// Provide a lightweight type shim so linter is happy without generated #content types
declare function queryContent<T = any>(path?: string): any

const { data: allProjects } = await useAsyncData<ProjectDoc[]>('home-projects', () =>
  queryContent('/projects').sort({ publishedAt: -1 }).find()
)

// We only want to show these two projects on the homepage
const preferredSlugs = ['talentorange', 'warehouse-management']

const hardcodedFallback: ProjectDoc[] = [
  {
    title: 'TalentOrange',
    summary:
      'Customized recruitment and headhunting application that manages the entire talent acquisition process.',
    cover: '/cover/talentorange.png',
    tech: ['Vue 3', 'GraphQL', 'PHP', 'MySQL', 'Docker'],
    links: { demo: 'https://www.talentorange.com/' }
  },
  {
    title: 'Warehouse Management System',
    summary:
      'Inventory tracking, inbound/outbound workflows, and analytics for warehouse operations.',
    cover: '/cover/wareswift.png',
    tech: ['Vue2', 'Quasar', 'Django', 'SQLite'],
    links: { demo: 'https://bradbury.wareswift.com/' }
  }
]

const projectsToShow = computed<ProjectDoc[]>(() => {
  const list = Array.isArray(allProjects?.value) ? allProjects.value : []
  if (list.length) {
    const bySlug = new Map<string | undefined, ProjectDoc>(list.map(p => [p.slug, p]))
    const chosen = preferredSlugs
      .map(slug => bySlug.get(slug))
      .filter(Boolean) as ProjectDoc[]
    if (chosen.length) return chosen
  }
  return hardcodedFallback
})

type CertItem = { title: string; issuer: string; date: string; links?: { url?: string }; thumb?: string }
const certs: CertItem[] = [
  {
    title: 'Certified Mid-Level Vue.js Developer',
    issuer: 'Vue School / Certificates.dev',
    date: '2025-08-04',
    links: { url: 'https://certificates.dev/vuejs/certificates/9f8dea1c-8c97-4773-ac08-6b9630c43834' },
    thumb: 'https://certificates.dev/.netlify/images?url=https:%2F%2Fapi.certificates.dev%2Fcertificates%2Fthumbnail%2F9f8dea1c-8c97-4773-ac08-6b9630c43834.jpg'
  },
  {
    title: 'EdCHART Certificate',
    issuer: 'Credly',
    date: 'July 28, 2025',
    links: { url: 'https://www.credly.com/badges/83cc9426-704f-4857-935a-ddfe4c08ee9c/public_url' },
    thumb: 'https://images.credly.com/size/680x680/images/ced4e767-f9ae-4003-a871-781a6fce80db/image.png'
  }
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
