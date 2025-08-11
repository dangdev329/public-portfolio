<template>
  <NuxtLoadingIndicator color="#111827" />
  <NuxtLayout>
    <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" />
  </NuxtLayout>
  <NuxtRouteAnnouncer />
</template>

<style>
.page-enter-active,
.page-leave-active { transition: opacity .25s ease, transform .25s ease; }
.page-enter-from,
.page-leave-to { opacity: 0; transform: translateY(8px) }
</style>
