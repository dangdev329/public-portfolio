<template>
  <header class="fixed inset-x-0 top-0 z-[60] h-16 backdrop-blur-md bg-white/70 dark:bg-slate-900/85 border-b border-slate-200/60 dark:border-white/10 shadow-sm text-slate-900 dark:text-slate-100">
    <nav class="container mx-auto flex items-center justify-between gap-4 p-4">
      <NuxtLink to="/" class="font-semibold tracking-tight">
        <span class="bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 bg-clip-text text-transparent">Thanh Dang</span>
      </NuxtLink>
      <div class="flex items-center gap-5 text-sm">
        <NuxtLink :class="{ 'text-emerald-600': active==='projects' }" to="#projects">Projects</NuxtLink>
        <NuxtLink :class="{ 'text-emerald-600': active==='certificates' }" to="#certificates">Certificates</NuxtLink>
        <NuxtLink :class="{ 'text-emerald-600': active==='testimonials' }" to="#testimonials">Testimonials</NuxtLink>
        <NuxtLink :class="{ 'text-emerald-600': active==='skills' }" to="#skills">Skills</NuxtLink>
        <NuxtLink :class="{ 'text-emerald-600': active==='contact' }" to="#contact">Contact</NuxtLink>
        <ClientOnly>
          <AppSoundToggle />
        </ClientOnly>
        <AppThemeToggle />
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { useActiveSection } from "../../composables/useActiveSection"
const active = useActiveSection()
</script>

<style scoped>
.container { max-width: 1100px; }
</style>
