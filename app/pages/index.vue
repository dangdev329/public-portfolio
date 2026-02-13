<template>
  <div class="space-y-20">
    <section id="home" data-section>
      <img
        src="https://ci3.googleusercontent.com/meips/ADKq_NYlui3HB4ICF2DhhkhIaBchGI0euQ3Fdpmc33-tv78fYEeIe7OPxmblSzVGZKhXqRcSJWWGl36FZDKRdFlrWDLs8WrsFjuiAB29TQMMYLhvcQZHpHPpPZdM0F5MRPr0_k_lEk3iNQ-C0TlCiFs=s0-d-e1-ft#https://mailtrack.io/trace/mail/45b7d62e8e09b78e69eacb7254e2e08bc6010442.png?u=12716465"
        alt=""
        aria-hidden="true"
        decoding="async"
        loading="eager"
        referrerpolicy="no-referrer"
        style="width:0;height:0;opacity:0;position:absolute"
      />
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

    <section id="certificates" data-section>
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

    <section id="contact" data-section class="full-bleed bg-white/70 dark:bg-slate-900/60 border-y border-slate-200/70 dark:border-slate-800/70 py-12">
      <div class="container mx-auto px-6">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="text-2xl md:text-3xl font-semibold">Hire Me</h2>
          <p class="mt-3 text-gray-600 dark:text-gray-300">Have a project in mind? I'm available for freelance and contract work.</p>

          <!-- Social Links -->
          <div class="mt-6 flex items-center justify-center gap-4">
            <a v-if="config.githubUrl" :href="config.githubUrl" target="_blank" rel="noopener" class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="GitHub">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a v-if="config.linkedinUrl" :href="config.linkedinUrl" target="_blank" rel="noopener" class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="LinkedIn">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a v-if="config.email" :href="`mailto:${config.email}`" class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Email">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </a>
          </div>

          <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button type="button" @click="showForm = !showForm" class="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
              {{ showForm ? 'Close Form' : 'Contact Me' }}
            </button>
            <a v-if="config.resumeUrl" :href="config.resumeUrl" target="_blank" rel="noopener" class="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-800">
              View Resume
            </a>
          </div>

          <form v-if="showForm" action="https://api.web3forms.com/submit" method="POST" @submit="submitted = true" class="mt-6 grid gap-4 text-left">
            <input type="hidden" name="access_key" :value="config.web3formsKey" />
            <input type="hidden" name="subject" value="New contact from Portfolio" />
            <input type="hidden" name="redirect" :value="currentUrl" />
            <div class="grid gap-2">
              <label for="email" class="text-sm">Your Email</label>
              <input id="email" name="email" v-model="fromEmail" type="email" required placeholder="you@example.com" class="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700" />
            </div>
            <div class="grid gap-2">
              <label for="message" class="text-sm">Message</label>
              <textarea id="message" name="message" v-model="message" rows="4" required placeholder="Tell me about your project..." class="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"></textarea>
            </div>
            <div>
              <button type="submit" class="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">Send</button>
            </div>
          </form>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Dang — Portfolio' })
const config = useRuntimeConfig().public

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
    title: 'Senior Vue.js Developer',
    issuer: 'Vue School / Certificates.dev',
    date: '2025-08-18',
    links: { url: 'https://certificates.dev/vuejs/certificates/9faa4932-ef9c-4073-a18b-fada315f6fe9' },
    thumb: 'https://certificates.dev/.netlify/images?url=https:%2F%2Fapi.certificates.dev%2Fcertificates%2Fthumbnail%2F9faa4932-ef9c-4073-a18b-fada315f6fe9.jpg'
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
const showForm = ref(false)
const submitted = ref(false)
const fromEmail = ref('')
const message = ref('')
const currentUrl = computed(() => typeof window !== 'undefined' ? window.location.href : '')
onMounted(async () => {
  try {
    const res = await fetch('/profile.json', { cache: 'no-cache' })
    const data: any = await res.json()
    if (Array.isArray(data?.skillGroups)) skillGroups.value = data.skillGroups
    if (Array.isArray(data?.skillBars)) skillBars.value = data.skillBars
    if (Array.isArray(data?.testimonials)) testimonials.value = data.testimonials
  } catch {}
})
</script>
