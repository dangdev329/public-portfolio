<template>
  <ClientOnly>
    <canvas ref="canvasRef" class="fixed inset-0 pointer-events-none z-[50] mix-blend-screen" aria-hidden="true" />
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
let ctx: CanvasRenderingContext2D | null = null
let width = 0
let height = 0
let dpr = 1
let animationId = 0
let isRunning = false
let lastFrameTime = 0
const targetFps = 42
const frameIntervalMs = 1000 / targetFps
let drops: Raindrop[] = []
// Tweak this to change overall rain speed (higher = faster)
const speedMultiplier = 2.0

// Lightning flash state
let flashAlpha = 0
let nextFlashAt = performance.now() + getRandom(4000, 11000)
  const flashDecayPerMs = 0.003 // higher = shorter flash duration

  // Lightning bolt visuals
  type LightningBolt = {
    points: Array<{ x: number; y: number }>
    alpha: number
    lineWidth: number
    lifeMs: number
    ageMs: number
  }
  let bolts: LightningBolt[] = []

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

function resize() {
  if (!canvasRef.value) return
  dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  width = window.innerWidth
  height = window.innerHeight
  canvasRef.value.width = Math.floor(width * dpr)
  canvasRef.value.height = Math.floor(height * dpr)
  canvasRef.value.style.width = width + 'px'
  canvasRef.value.style.height = height + 'px'
  ctx = canvasRef.value.getContext('2d')
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  // Density scaled for performance
  const prefersReducedMotion = matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches
  const isMobile = width < 768 || 'ontouchstart' in window
  const area = width * height
  let target = Math.round(area / 14000) // lower base density for performance
  if (dpr > 1.25) target = Math.round(target * 0.7)
  if (isMobile) target = Math.round(target * 0.6)
  if (prefersReducedMotion) target = Math.round(target * 0.4)
  target = Math.max(30, Math.min(160, target))

  if (drops.length === 0 || drops.length !== target) initDrops(target)
}

function step(now = performance.now()) {
  if (!ctx) return
  if (now - lastFrameTime < frameIntervalMs) {
    animationId = requestAnimationFrame(step)
    return
  }
  const dt = now - lastFrameTime
  lastFrameTime = now

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
  
  // Lightning flash overlay (brighten background briefly)
  if (now >= nextFlashAt && flashAlpha <= 0.001) {
    // Start a flash
    flashAlpha = isDark.value ? 0.92 : 0.78
    nextFlashAt = now + getRandom(5000, 14000)
    // Spawn 1-2 bolts
    const boltsToCreate = Math.random() < 0.6 ? 1 : 2
    for (let i = 0; i < boltsToCreate; i++) {
      bolts.push(generateBolt())
    }
    // Emit event so sound component can play thunder
    window.dispatchEvent(new CustomEvent('rain:flash', { detail: { intensity: Math.min(1, 0.6 + Math.random() * 0.5) } }))
  }
  if (flashAlpha > 0.001) {
    flashAlpha = Math.max(0, flashAlpha - dt * flashDecayPerMs)
    ctx.fillStyle = `rgba(255,255,255,${flashAlpha.toFixed(3)})`
    ctx.fillRect(0, 0, width, height)
  }

  // Draw lightning bolts
  if (bolts.length) {
    // Use additive blending for vivid glow, then restore
    const prevOp = ctx.globalCompositeOperation
    const prevShadowBlur = ctx.shadowBlur
    const prevShadowColor = (ctx as any).shadowColor
    ctx.globalCompositeOperation = 'lighter'
    ctx.lineCap = 'round'
    ctx.shadowBlur = 14
    ;(ctx as any).shadowColor = 'rgba(255,255,255,0.9)'

    const remaining: LightningBolt[] = []
    for (const b of bolts) {
      b.ageMs += dt
      const t = Math.min(1, b.ageMs / b.lifeMs)
      const alpha = b.alpha * (1 - t)
      if (alpha <= 0.02) continue

      // Core bright stroke
      ctx.beginPath()
      ctx.moveTo(b.points[0].x, b.points[0].y)
      for (let i = 1; i < b.points.length; i++) {
        ctx.lineTo(b.points[i].x, b.points[i].y)
      }
      ctx.lineWidth = Math.max(1, b.lineWidth * (1 - t))
      ctx.strokeStyle = `rgba(255,255,255,${Math.min(1, 0.9 * alpha)})`
      ctx.stroke()

      // Outer faint stroke for extra glow
      ctx.lineWidth = Math.max(1, (b.lineWidth + 2) * (1 - t))
      ctx.strokeStyle = `rgba(200,230,255,${0.25 * alpha})`
      ctx.stroke()

      if (b.ageMs < b.lifeMs) remaining.push(b)
    }

    ctx.globalCompositeOperation = prevOp
    ctx.shadowBlur = prevShadowBlur
    ;(ctx as any).shadowColor = prevShadowColor
    bolts = remaining
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
  window.addEventListener('resize', resize, { passive: true })
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop()
    else start()
  }, { passive: true })
  start()
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


