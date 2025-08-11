<template>
  <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div class="absolute -top-20 -left-20 h-[32rem] w-[32rem] rounded-full bg-emerald-400/10 bg-blob blob-1"></div>
    <div class="absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-teal-400/10 bg-blob blob-2"></div>
    <div class="absolute top-1/3 -right-40 h-[26rem] w-[26rem] rounded-full bg-emerald-300/10 bg-blob blob-3"></div>
    <div class="absolute inset-0 opacity-40 dark:opacity-20 bg-grid [mask-image:radial-gradient(closest-side,black,transparent)]"></div>
  </div>
</template>

<script setup lang="ts">
</script>
