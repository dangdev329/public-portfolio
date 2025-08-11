<template>
  <ClientOnly>
    <canvas ref="canvasRef" class="fixed inset-0 pointer-events-none z-[50]" aria-hidden="true" />
  </ClientOnly>
  
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let animationId = 0
let width = 0
let height = 0
let dpr = 1
let isRunning = false
let lastFrameTime = 0
const targetFps = 45
const frameIntervalMs = 1000 / targetFps

type Flake = { x: number; y: number; r: number; speed: number; drift: number; phase: number }
let flakes: Flake[] = []

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

function initFlakes(count: number) {
  flakes = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: 1.2 + Math.random() * 2.8,
    speed: 0.6 + Math.random() * 1.1,
    drift: (Math.random() - 0.5) * 0.6,
    phase: Math.random() * Math.PI * 2
  }))
}

function resize() {
  if (!canvasRef.value) return
  // Cap DPR to reduce fill cost on HiDPI screens
  dpr = Math.min(window.devicePixelRatio || 1, 1.75)
  width = window.innerWidth
  height = window.innerHeight
  canvasRef.value.width = Math.floor(width * dpr)
  canvasRef.value.height = Math.floor(height * dpr)
  canvasRef.value.style.width = width + 'px'
  canvasRef.value.style.height = height + 'px'
  ctx = canvasRef.value.getContext('2d')
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  // Density, scaled down on mobile/HiDPI and when user prefers reduced motion
  const prefersReducedMotion = matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches
  const isMobile = width < 768 || 'ontouchstart' in window
  const area = width * height
  let target = Math.round(area / 7000)
  if (dpr > 1.25) target = Math.round(target * 0.7)
  if (isMobile) target = Math.round(target * 0.65)
  if (prefersReducedMotion) target = Math.round(target * 0.4)
  target = Math.max(40, Math.min(220, target))
  if (flakes.length === 0) initFlakes(target)
  else if (flakes.length !== target) initFlakes(target)
}

function step(now = performance.now()) {
  if (!ctx) return
  // Simple FPS limiter to reduce CPU/GPU load
  if (now - lastFrameTime < frameIntervalMs) {
    animationId = requestAnimationFrame(step)
    return
  }
  lastFrameTime = now

  ctx.clearRect(0, 0, width, height)
  ctx.save()
  ctx.fillStyle = isDark.value ? 'rgba(255,255,255,0.95)' : 'rgba(6,28,33,0.5)'
  // Avoid expensive shadows for performance; color already contrasts
  // Batch draw all arcs into a single path to minimize fill() calls
  ctx.beginPath()
  for (const f of flakes) {
    f.phase += 0.01 + f.speed * 0.02
    f.x += Math.sin(f.phase) * 0.3 + f.drift
    f.y += f.speed

    if (f.y - f.r > height) {
      f.y = -f.r
      f.x = Math.random() * width
      f.phase = Math.random() * Math.PI * 2
    }
    if (f.x < -5) f.x = width + 5
    if (f.x > width + 5) f.x = -5

    ctx.moveTo(f.x + f.r, f.y)
    ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
  }
  ctx.fill()
  ctx.restore()
  animationId = requestAnimationFrame(step)
}

let initialized = false
function init() {
  if (initialized || !canvasRef.value) return
  initialized = true
  resize()
  window.addEventListener('resize', resize, { passive: true })
  start()
}

function start() {
  if (isRunning) return
  isRunning = true
  lastFrameTime = 0
  animationId = requestAnimationFrame(step)
}

function stop() {
  if (!isRunning) return
  cancelAnimationFrame(animationId)
  isRunning = false
}

// ClientOnly renders slot after mount; wait until canvas exists
watch(canvasRef, (el) => {
  if (el) init()
}, { immediate: true })

onMounted(() => {
  init()
  // Pause when tab is hidden to save cycles
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop()
    else start()
  }, { passive: true })
})

onBeforeUnmount(() => {
  stop()
  window.removeEventListener('resize', resize)
})
</script>

<style scoped>
/* No styles needed; canvas is positioned with utility classes. */
</style>


