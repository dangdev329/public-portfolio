<template>
  <section>
    <h1 class="text-2xl font-semibold">Certificates</h1>
    <ul class="mt-6 grid gap-6 md:grid-cols-2">
      <li v-for="c in certs" :key="c._path">
        <article class="card p-5">
          <h2 class="text-lg font-medium">
            <a :href="c.url" target="_blank" class="hover:underline">{{ c.title }}</a>
          </h2>
          <p class="text-gray-600">{{ c.issuer }} — {{ c.date }}</p>
          <p class="text-sm text-gray-500">ID: {{ c.credentialId }}</p>
        </article>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
useHead({ title: 'Certificates — Dang' })

const { data: certs } = await useAsyncData('certs', () =>
  queryContent('/certificates').sort({ date: -1 }).find()
)
</script>
