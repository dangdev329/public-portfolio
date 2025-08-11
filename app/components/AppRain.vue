<template>
  <ClientOnly>
    <canvas v-show="shouldRender" ref="canvasRef" class="fixed inset-0 pointer-events-none z-[30] mix-blend-screen" aria-hidden="true" />
  </ClientOnly>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue'

type Raindrop = {
  x: number
  y: number
  len: number
  speedY: number
  driftX: number
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const shouldRender = ref(true)
let ctx: CanvasRenderingContext2D | null = null
let width = 0
let height = 0
let dpr = 1
let animationId = 0
let isRunning = false
let lastFrameTime = 0
const targetFps = 30
const frameIntervalMs = 1000 / targetFps
let drops: Raindrop[] = []
// Tweak this to change overall rain speed (higher = faster)
const speedMultiplier = 2.0

// Keep lightning effect enabled with performance safeguards
const enableLightning = true
let flashAlpha = 0
let nextFlashAt = performance.now() + getRandom(6000, 14000)
const flashDecayPerMs = 0.003

type LightningBolt = {
  points: Array<{ x: number; y: number }>
  alpha: number
  lineWidth: number
  lifeMs: number
  ageMs: number
}
let bolts: LightningBolt[] = []

// Adaptive performance controls
let frameTimeAvg = 16
let densityScale = 1.0 // 1.0 = full density; drops when device is busy
let lastDensityAdjustAt = 0

function getRandom(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateBolt(): LightningBolt {
  // Start near top with slight horizontal randomness
  const startX = getRandom(Math.floor(width * 0.2), Math.floor(width * 0.8))
  const startY = -getRandom(0, Math.floor(height * 0.15))
  const segments = getRandom(6, 10)
  const horizontalJitter = Math.max(10, Math.floor(width * 0.03))
  const verticalStep = Math.max(24, Math.floor(height / (segments + 2)))
  const points: Array<{ x: number; y: number }> = []
  let x = startX
  let y = startY
  points.push({ x, y })
  for (let i = 0; i < segments; i++) {
    // Zig-zag horizontally with randomness, progress down vertically
    x += getRandom(-horizontalJitter, horizontalJitter)
    y += verticalStep + getRandom(-8, 12)
    points.push({ x, y })
    // Occasionally create a sharper turn to resemble an N/Z kink
    if (Math.random() < 0.25) {
      x += getRandom(-horizontalJitter * 1.5, horizontalJitter * 1.5)
      y += getRandom(6, 18)
      points.push({ x, y })
    }
  }
  return {
    points,
    alpha: 1,
    lineWidth: Math.max(2, Math.floor(width * 0.004)),
    lifeMs: getRandom(220, 520),
    ageMs: 0
  }
}

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

function initDrops(count: number) {
  drops = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    len: 8 + Math.random() * 16,
    speedY: (6 + Math.random() * 8) * speedMultiplier,
    driftX: -0.6 + Math.random() * 1.2
  }))
}

function computeTargetDrops(): number {
  // Density scaled for performance
  const prefersReducedMotion = matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches
  const isMobile = width < 768 || 'ontouchstart' in window
  const area = width * height
  let target = Math.round((area / 20000) * densityScale)
  if (dpr > 1.15) target = Math.round(target * 0.7)
  if (isMobile) target = Math.round(target * 0.55)
  if (prefersReducedMotion) target = Math.round(target * 0.3)
  return Math.max(18, Math.min(110, target))
}

function ensureDropCount(target: number) {
  if (target === drops.length) return
  if (target < drops.length) {
    drops.length = target
  } else {
    const toAdd = target - drops.length
    for (let i = 0; i < toAdd; i++) {
      drops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        len: 8 + Math.random() * 16,
        speedY: (6 + Math.random() * 8) * speedMultiplier,
        driftX: -0.6 + Math.random() * 1.2
      })
    }
  }
}

function resize() {
  if (!canvasRef.value) return
  dpr = Math.min(window.devicePixelRatio || 1, 1.25)
  width = window.innerWidth
  height = window.innerHeight
  canvasRef.value.width = Math.floor(width * dpr)
  canvasRef.value.height = Math.floor(height * dpr)
  canvasRef.value.style.width = width + 'px'
  canvasRef.value.style.height = height + 'px'
  ctx = canvasRef.value.getContext('2d')
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const target = computeTargetDrops()
  if (drops.length === 0) initDrops(target)
  else ensureDropCount(target)

  // Re-evaluate gating on resize (desktop should keep rain unless reduced-motion)
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  shouldRender.value = !reducedMotion
  if (!shouldRender.value) stop()
}

function step(now = performance.now()) {
  if (!ctx) return
  if (now - lastFrameTime < frameIntervalMs) {
    animationId = requestAnimationFrame(step)
    return
  }
  const dt = now - lastFrameTime
  lastFrameTime = now

  // Update moving average frame time and adapt density every ~1s
  frameTimeAvg = frameTimeAvg * 0.9 + dt * 0.1
  if (now - lastDensityAdjustAt > 1000) {
    const busy = frameTimeAvg > frameIntervalMs * 1.4
    densityScale = busy ? 0.8 : 1.0
    ensureDropCount(computeTargetDrops())
    lastDensityAdjustAt = now
  }

  ctx.clearRect(0, 0, width, height)
  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineWidth = 1.0
  ctx.strokeStyle = isDark.value ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.25)'

  ctx.beginPath()
  for (const d of drops) {
    d.y += d.speedY
    d.x += d.driftX * 1.2

    if (d.y - d.len > height) {
      d.y = -Math.random() * 40
      d.x = Math.random() * width
    }
    if (d.x < -20) d.x = width + 20
    if (d.x > width + 20) d.x = -20

    // Draw a short slanted line representing the raindrop
    const x2 = d.x - d.driftX * 2.2
    const y2 = d.y - d.len * 1.2
    ctx.moveTo(d.x, d.y)
    ctx.lineTo(x2, y2)
  }
  ctx.stroke()
  
  if (enableLightning) {
    // Lightning flash overlay (brighten background briefly)
    const busy = frameTimeAvg > frameIntervalMs * 1.5
    if (!busy && now >= nextFlashAt && flashAlpha <= 0.001 && bolts.length < 2) {
      flashAlpha = isDark.value ? 0.9 : 0.75
      nextFlashAt = now + getRandom(7000, 15000)
      const boltsToCreate = Math.random() < 0.55 ? 1 : 2
      for (let i = 0; i < boltsToCreate; i++) {
        bolts.push(generateBolt())
      }
    }
    if (flashAlpha > 0.001) {
      flashAlpha = Math.max(0, flashAlpha - dt * flashDecayPerMs)
      ctx.fillStyle = `rgba(255,255,255,${flashAlpha.toFixed(3)})`
      ctx.fillRect(0, 0, width, height)
    }

    // Draw lightning bolts (reduced glow)
    if (bolts.length && ctx) {
      const ctx2 = ctx
      const prevShadowBlur = ctx2.shadowBlur
      ctx2.lineCap = 'round'
      ctx2.shadowBlur = 6
      const remaining: LightningBolt[] = []
      for (const b of bolts) {
        b.ageMs += dt
        const t = Math.min(1, b.ageMs / b.lifeMs)
        const alpha = b.alpha * (1 - t)
        if (alpha <= 0.03) continue
        if (b.points.length === 0) continue
        ctx2.beginPath()
        ctx2.moveTo(b.points[0]!.x, b.points[0]!.y)
        for (let i = 1; i < b.points.length; i++) {
          ctx2.lineTo(b.points[i]!.x, b.points[i]!.y)
        }
        ctx2.lineWidth = Math.max(1, b.lineWidth * (1 - t))
        ctx2.strokeStyle = `rgba(255,255,255,${Math.min(1, 0.85 * alpha)})`
        ctx2.stroke()
        if (b.ageMs < b.lifeMs) remaining.push(b)
      }
      ctx2.shadowBlur = prevShadowBlur
      bolts = remaining
    }
  }
  ctx.restore()

  animationId = requestAnimationFrame(step)
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

onMounted(() => {
  // In case the canvas is already in DOM
  resize()
  // Respect reduced motion only; keep rain for desktop/mobile otherwise
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  shouldRender.value = !reducedMotion
  window.addEventListener('resize', resize, { passive: true })
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop()
    else start()
  }, { passive: true })
  if (shouldRender.value) start()
})

watch(shouldRender, (on) => {
  if (on) start()
  else stop()
})

// Ensure we initialize once the <canvas> actually exists (ClientOnly timing)
watch(canvasRef, (el) => {
  if (!el) return
  resize()
  start()
}, { immediate: true })

onBeforeUnmount(() => {
  stop()
  window.removeEventListener('resize', resize)
})
</script>

<style scoped>
/* Canvas overlay is positioned via utility classes */
</style>


