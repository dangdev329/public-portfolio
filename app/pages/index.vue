<template>
  <div class="space-y-20">
    <section id="home" data-section>
      <AppHero />
    </section>

    <section id="projects" data-section class="full-bleed bg-slate-50/80 dark:bg-slate-900/60 border-y border-slate-200/70 dark:border-slate-800/70 py-12">
      <div class="container mx-auto px-6">
      <h2 class="text-center text-2xl md:text-3xl font-semibold">Featured Projects</h2>
      <ul class="mt-6 grid gap-8 md:grid-cols-2 items-stretch">
        <li v-for="p in projectsToShow" :key="p.title" class="h-full">
          <div class="group block h-full">
            <article class="h-full flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg transition hover:shadow-xl cursor-pointer" @click="openProject(p)">
              <div class="relative h-56 md:h-64 overflow-hidden">
                <NuxtImg v-if="p.cover" :src="p.cover" :alt="p.title" width="800" height="450" class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div v-else class="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm">No image available</div>
                <div class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white dark:to-slate-900"></div>
              </div>
              <div class="p-5 flex-1 flex flex-col">
                <h3 class="text-lg font-semibold">{{ p.title }}</h3>
                <p class="mt-1 text-gray-600 dark:text-gray-300">{{ p.summary }}</p>
                <div class="mt-3 flex flex-wrap gap-2 mt-auto">
                  <span v-for="t in p.tech" :key="t" class="chip">{{ t }}</span>
                </div>
              </div>
            </article>
          </div>
        </li>
      </ul>
      <ProjectModal :open="isModalOpen" :project="activeProject" @close="isModalOpen=false" />
      <!-- No explicit empty state needed; we fall back to hardcoded examples. -->
      </div>
    </section>

    <section id="about" data-section>
      <h2 class="text-2xl md:text-3xl font-semibold">Certificates</h2>
      <ul class="mt-6 grid gap-8 sm:grid-cols-2">
        <li v-for="c in certs" :key="c.title">
          <article class="card p-7 md:p-8">
            <div v-if="c.thumb" class="mb-4 w-full h-72 md:h-80 flex items-center justify-center overflow-hidden">
              <NuxtImg :src="c.thumb" :alt="c.title" width="960" height="960" class="max-h-full w-auto object-contain rounded-md border border-slate-200 dark:border-slate-800" loading="lazy" />
            </div>
            <h3 class="text-2xl font-semibold">{{ c.title }}</h3>
            <p class="text-gray-600 mt-2">{{ c.issuer }} — {{ c.date }}</p>
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

    <section id="testimonials" data-section>
      <h2 class="text-2xl font-semibold">Testimonials</h2>
      <div class="mt-4">
        <AppTestimonials :items="testimonials" />
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
  role?: string
  longDesc?: string
  features?: string[]
  integrations?: string[]
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
    links: { demo: 'https://www.talentorange.com/' },
    role: 'Frontend Developer',
    longDesc:
      'Customized recruitment and headhunting application that manages the entire talent acquisition process.',
    features: ['Candidate Management', 'Project Management', 'Recruitment Process', 'Client Management']
  },
  {
    title: 'Warehouse Management System',
    summary:
      'Inventory tracking, inbound/outbound workflows, and analytics for warehouse operations.',
    cover: '/cover/wareswift.png',
    tech: ['Vue2', 'Quasar', 'Django', 'SQLite'],
    links: { demo: 'https://bradbury.wareswift.com/' },
    role: 'Full‑Stack Developer',
    longDesc:
      'Built a full-stack Django/Vue.js application with multi-platform support (web, mobile, desktop), barcode scanning, real-time inventory tracking, and comprehensive warehouse operations management.',
    features: [
      'Barcode scanning',
      'Real-time inventory tracking',
      'Inbound/outbound workflows',
      'Multi-platform support (web, mobile, desktop)'
    ],
    integrations: ['UPS', 'USPS', 'Amazon', 'Shopify']
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

const isModalOpen = ref(false)
const activeProject = ref<ProjectDoc | null>(null)
const detailsMap: Record<string, Partial<ProjectDoc>> = {
  talentorange: {
    role: 'Frontend Developer',
    longDesc:
      'Customized recruitment and headhunting application that manages the entire talent acquisition process.',
    features: ['Candidate Management', 'Project Management', 'Recruitment Process', 'Client Management']
  },
  'warehouse-management': {
    role: 'Full‑Stack Developer',
    longDesc:
      'Built a full-stack Django/Vue.js application with multi-platform support (web, mobile, desktop), barcode scanning, real-time inventory tracking, and comprehensive warehouse operations management.',
    features: [
      'Barcode scanning',
      'Real-time inventory tracking',
      'Inbound/outbound workflows',
      'Multi-platform support (web, mobile, desktop)'
    ],
    integrations: ['UPS', 'USPS', 'Amazon', 'Shopify']
  }
}
function openProject(p: ProjectDoc) {
  const extra = p.slug ? detailsMap[p.slug] : undefined
  activeProject.value = { ...p, ...(extra || {}) }
  isModalOpen.value = true
}

type CertItem = { title: string; issuer: string; date: string; links?: { url?: string }; thumb?: string }
const certs: CertItem[] = [
  {
    title: 'Certified Vue.js Developer',
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
type Testimonial = { name: string; title?: string; quote: string; avatar?: string }
const testimonials = ref<Testimonial[]>([])
const resumeUrl = ref<string | null>(null)
const email = 'hello@example.com'
const mailtoHref = computed(() => `mailto:${email}?subject=${encodeURIComponent('Project inquiry — Portfolio')}`)
onMounted(async () => {
  try {
    const res = await fetch('/profile.json', { cache: 'no-cache' })
    const data: any = await res.json()
    if (Array.isArray(data?.skillGroups)) skillGroups.value = data.skillGroups
    if (Array.isArray(data?.skillBars)) skillBars.value = data.skillBars
    if (Array.isArray(data?.testimonials)) testimonials.value = data.testimonials
    if (typeof data?.resumeUrl === 'string') resumeUrl.value = data.resumeUrl
  } catch {}
})
</script>
