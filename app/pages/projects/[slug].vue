<template>
  <article class="prose lg:prose-lg dark:prose-invert max-w-none">
    <header class="not-prose mb-6">
      <NuxtLink to="/projects" class="text-sm text-gray-500 hover:underline">← All projects</NuxtLink>
      <h1 class="text-3xl font-bold mt-2">{{ doc.title }}</h1>
      <p class="text-gray-600">{{ doc.summary }}</p>
      <div class="mt-4">
        <NuxtImg v-if="doc.cover" :src="doc.cover" :alt="doc.title" width="960" height="540" class="rounded" />
      </div>
    </header>
    <ContentRenderer :value="doc" />
  </article>
</template>

<script setup lang="ts">
const route = useRoute()
const { data: doc } = await useAsyncData(`project:${route.params.slug}`, () =>
  queryContent('/projects')
    .where({ slug: route.params.slug })
    .findOne()
)

if (!doc.value) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found' })
}

useHead({ title: `${doc.value.title} — Dang` })
</script>
