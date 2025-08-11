<template>
  <div class="pointer-events-none fixed inset-0 -z-20" aria-hidden="true">
    <div class="sun-disk"></div>
    <div class="rainbow-bg"></div>
  </div>
</template>

<script setup lang="ts">
// Pure CSS visual; no script needed
</script>

<style scoped>
.sun-disk {
  position: absolute;
  top: -10vw;
  left: -10vw;
  width: 42vw;
  height: 42vw;
  border-radius: 9999px;
  background: radial-gradient(circle at 55% 55%, rgba(255,255,210,0.6) 0%, rgba(255,245,200,0.3) 30%, rgba(255,245,200,0.12) 55%, transparent 72%);
  filter: blur(8px);
}

.rainbow-bg {
  position: absolute;
  inset: 0;
  /* Static, GPU-friendly soft rainbow gradient (no animation, no blend modes) */
  background:
    radial-gradient(60rem 40rem at 20% 10%, rgba(255,182,193,0.30), transparent 55%),
    radial-gradient(70rem 50rem at 85% 25%, rgba(173,216,230,0.30), transparent 55%),
    radial-gradient(60rem 45rem at 50% 80%, rgba(144,238,144,0.30), transparent 55%);
  opacity: 0.9;
}

@media (prefers-reduced-motion: reduce) {
  /* Nothing animated in this variant */
}
</style>


