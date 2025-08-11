<template>
  <section class="space-y-8">
    <div>
      <h1 class="text-2xl font-semibold">Skills</h1>
      <p class="text-gray-600 mt-2">Selected tools and platforms I use most. Logos load from public CDNs.</p>
    </div>

    <SkillGrid :groups="skillGroups" />
  </section>
</template>

<script setup lang="ts">
useHead({ title: 'Skills — Dang' })

type SkillItem = { name: string; logo?: string }
type SkillGroup = { title: string; items: SkillItem[] }
type ProfileJson = { skillGroups?: SkillGroup[] }
const { data: profile } = await useFetch<ProfileJson>('/profile.json')
const skillGroups = computed<SkillGroup[]>(() => profile.value?.skillGroups ?? [])
</script>
