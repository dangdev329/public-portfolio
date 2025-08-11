<template>
  <button
    class="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-slate-900"
    :class="enabled ? 'text-emerald-600 border-emerald-500/40' : 'text-gray-600 dark:text-gray-300 border-gray-300/40 dark:border-gray-700'"
    @click="toggleAudio"
    :aria-pressed="enabled"
    :title="enabled ? 'Disable rain sounds' : 'Enable rain sounds'"
  >
    <span v-if="enabled">Sound On</span>
    <span v-else>Sound Off</span>
  </button>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue'

let audioCtx: AudioContext | null = null
let rainSource: AudioBufferSourceNode | null = null
let rainGain: GainNode | null = null
let flashListener: ((e: Event) => void) | null = null
const enabled = ref(false)
// Optional thunder samples (place files into /public/audio)
let thunderBuffers: AudioBuffer[] = []
// Optional bird samples for light mode ambience (place files into /public/audio)
let birdBuffers: AudioBuffer[] = []
let birdMasterGain: GainNode | null = null
let activeBirds = new Set<AudioBufferSourceNode>()
let birdTimer: number | null = null
// Sunny ambience nodes
let sunnySource: AudioBufferSourceNode | null = null
let sunnyGain: GainNode | null = null
let sunnyHP: BiquadFilterNode | null = null
let sunnyLP: BiquadFilterNode | null = null
let lfo1: OscillatorNode | null = null
let lfo1Gain: GainNode | null = null
let lfo2: OscillatorNode | null = null
let lfo2Gain: GainNode | null = null

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
// Avoid 404s for optional sample files unless explicitly enabled
const ENABLE_SAMPLE_AUDIO = false

function createNoiseBuffer(ctx: AudioContext, seconds: number, type: 'white' | 'pink' = 'white') {
  const sampleRate = ctx.sampleRate
  const buffer = ctx.createBuffer(1, seconds * sampleRate, sampleRate)
  const data = buffer.getChannelData(0)

  if (type === 'white') {
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  } else {
    // Pink noise via Paul Kellet filter approximation
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.96900 * b2 + white * 0.1538520
      b3 = 0.86650 * b3 + white * 0.3104856
      b4 = 0.55000 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.0168980
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
      b6 = white * 0.115926
    }
  }
  return buffer
}

function startRain() {
  if (!audioCtx) return
  stopRain()
  const source = audioCtx.createBufferSource()
  const gain = audioCtx.createGain()
  const hp = audioCtx.createBiquadFilter()
  const lp = audioCtx.createBiquadFilter()
  source.buffer = createNoiseBuffer(audioCtx, 2.0, 'pink')
  source.loop = true
  hp.type = 'highpass'
  hp.frequency.value = 400
  lp.type = 'lowpass'
  lp.frequency.value = 6000
  gain.gain.value = 0.0
  source.connect(hp)
  hp.connect(lp)
  lp.connect(gain)
  gain.connect(audioCtx.destination)
  source.start()
  rainSource = source
  rainGain = gain
}

function stopRain() {
  try { rainSource?.stop() } catch {}
  rainSource?.disconnect()
  rainGain?.disconnect()
  rainSource = null
  rainGain = null
}

function startSunny() {
  if (!audioCtx) return
  stopSunny()
  const src = audioCtx.createBufferSource()
  const gain = audioCtx.createGain()
  const hp = audioCtx.createBiquadFilter()
  const lp = audioCtx.createBiquadFilter()
  src.buffer = createNoiseBuffer(audioCtx, 2.5, 'pink')
  src.loop = true
  // Gentle breeze band-limited noise
  hp.type = 'highpass'
  hp.frequency.value = 250
  lp.type = 'lowpass'
  lp.frequency.value = 3000
  gain.gain.value = 0.0

  // LFO 1: slow amplitude sway
  const l1 = audioCtx.createOscillator()
  const l1g = audioCtx.createGain()
  l1.type = 'sine'
  l1.frequency.value = 0.07
  l1g.gain.value = 0.03 // +/- amplitude
  l1.connect(l1g)
  l1g.connect(gain.gain)
  l1.start()

  // LFO 2: gentle color shift via LP sweep
  const l2 = audioCtx.createOscillator()
  const l2g = audioCtx.createGain()
  l2.type = 'sine'
  l2.frequency.value = 0.02
  l2g.gain.value = 300 // Hz swing
  l2.connect(l2g)
  l2g.connect(lp.frequency)
  l2.start()

  src.connect(hp)
  hp.connect(lp)
  lp.connect(gain)
  gain.connect(audioCtx.destination)
  src.start()

  sunnySource = src
  sunnyGain = gain
  sunnyHP = hp
  sunnyLP = lp
  lfo1 = l1
  lfo1Gain = l1g
  lfo2 = l2
  lfo2Gain = l2g
}

function stopSunny() {
  try { sunnySource?.stop() } catch {}
  sunnySource?.disconnect()
  sunnyGain?.disconnect()
  sunnyHP?.disconnect()
  sunnyLP?.disconnect()
  lfo1Gain?.disconnect()
  lfo2Gain?.disconnect()
  try { lfo1?.stop() } catch {}
  try { lfo2?.stop() } catch {}
  sunnySource = null
  sunnyGain = null
  sunnyHP = null
  sunnyLP = null
  lfo1 = null
  lfo1Gain = null
  lfo2 = null
  lfo2Gain = null
}

function playThunder(intensity = 1) {
  if (!audioCtx) return
  const now = audioCtx.currentTime

  // Prefer sampled thunder if available
  if (thunderBuffers.length) {
    const buffer = thunderBuffers[Math.floor(Math.random() * thunderBuffers.length)]!
    const src = audioCtx.createBufferSource()
    src.buffer = buffer
    const lp = audioCtx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 1800
    const hp = audioCtx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 60
    const gain = audioCtx.createGain()
    const peak = Math.min(0.9, 0.3 + 0.5 * intensity)
    const duration = Math.min(4.5, Math.max(2.2, (buffer!.duration) * (0.9 + Math.random() * 0.4)))

    // Envelope: quick attack then long tail
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.06)
    gain.gain.exponentialRampToValueAtTime(0.02, now + duration)

    // Slightly sweep LP to simulate rumble fading
    lp.frequency.setValueAtTime(2200, now)
    lp.frequency.exponentialRampToValueAtTime(700, now + duration)

    src.connect(hp)
    hp.connect(lp)
    lp.connect(gain)
    gain.connect(audioCtx.destination)
    src.start(now)
    src.stop(now + duration + 0.1)
    return
  }

  // Fallback synthesized thunder (longer)
  const src = audioCtx.createBufferSource()
  src.buffer = createNoiseBuffer(audioCtx, 3.0, 'white')
  const lp = audioCtx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 1800
  const hp = audioCtx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 60
  const gain = audioCtx.createGain()
  const peak = Math.min(0.7, 0.28 + 0.35 * intensity)
  const duration = 2.4 + Math.random() * 1.3
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(peak, now + 0.05)
  gain.gain.exponentialRampToValueAtTime(0.02, now + duration)
  lp.frequency.setValueAtTime(2200, now)
  lp.frequency.exponentialRampToValueAtTime(700, now + duration)
  src.connect(hp)
  hp.connect(lp)
  lp.connect(gain)
  gain.connect(audioCtx.destination)
  src.start(now)
  src.stop(now + duration + 0.1)
}

async function toggleAudio() {
  if (!enabled.value) {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    await audioCtx.resume()
    // Start ambient based on current mode
    if (isDark.value) {
      startRain()
      if (ENABLE_SAMPLE_AUDIO) loadThunderSamples()
    } else {
      // Light mode: no sounds per request
    }
    enabled.value = true
    // Fade in current ambience gently
    crossfadeAmbience(isDark.value, 0)
  } else {
    enabled.value = false
    stopRain()
    stopSunny()
    stopBirds()
    audioCtx?.suspend()
  }
}

onMounted(() => {
  flashListener = (e: Event) => {
    if (!enabled.value || !isDark.value) return
    const detail = (e as CustomEvent).detail as { intensity?: number }
    const intensity = detail?.intensity ?? 0.8
    // Add slight delay based on distance (lower intensity = farther, longer delay)
    const delayMs = 150 + Math.floor((1 - Math.min(1, Math.max(0, intensity))) * 700) + Math.floor(Math.random() * 150)
    setTimeout(() => playThunder(intensity), delayMs)
  }
  window.addEventListener('rain:flash', flashListener as EventListener)
})

onBeforeUnmount(() => {
  if (flashListener) window.removeEventListener('rain:flash', flashListener as EventListener)
  stopRain()
  stopSunny()
  audioCtx?.close()
  audioCtx = null
})

async function loadThunderSamples() {
  if (!audioCtx || !ENABLE_SAMPLE_AUDIO) return
  // Define possible file names; user can drop any subset into /public/audio
  const files = ['thunder-1.mp3', 'thunder-2.mp3', 'thunder-3.mp3', 'thunder-4.mp3']
  const urls = files.map(f => `/audio/${f}`)
  const loaded: AudioBuffer[] = []
  await Promise.all(urls.map(async (url) => {
    try {
      const res = await fetch(url)
      if (!res.ok) return
      const arr = await res.arrayBuffer()
      const buf = await audioCtx!.decodeAudioData(arr.slice(0))
      loaded.push(buf)
    } catch {}
  }))
  if (loaded.length) thunderBuffers = loaded
}

function crossfadeAmbience(toDark: boolean, fadeMs = 600) {
  if (!audioCtx || !enabled.value) return
  const now = audioCtx.currentTime
  const dur = Math.max(0.12, fadeMs / 1000)
  if (toDark) {
    // Ensure rain is running
    if (!rainSource) startRain()
    if (!thunderBuffers.length) loadThunderSamples()
    // Fade out sunny, fade in rain
    if (sunnyGain) {
      const g = sunnyGain.gain
      g.setValueAtTime(g.value, now)
      g.linearRampToValueAtTime(0.0, now + dur)
    }
    if (birdMasterGain) {
      const g = birdMasterGain.gain
      g.setValueAtTime(g.value, now)
      g.linearRampToValueAtTime(0.0, now + dur)
      // Stop birds after fade completes
      setTimeout(() => stopBirds(), fadeMs + 50)
    }
    if (rainGain) {
      const g = rainGain.gain
      g.setValueAtTime(g.value, now)
      g.linearRampToValueAtTime(0.12, now + dur)
    }
  } else {
    // Light mode: fade out any active dark/legacy light layers; do not start new ones
    if (rainGain) {
      const g = rainGain.gain
      g.setValueAtTime(g.value, now)
      g.linearRampToValueAtTime(0.0, now + dur)
    }
    if (sunnyGain) {
      const g = sunnyGain.gain
      g.setValueAtTime(g.value, now)
      g.linearRampToValueAtTime(0.0, now + dur)
      setTimeout(() => stopSunny(), Math.ceil(dur * 1000) + 50)
    }
    if (birdMasterGain) {
      const g = birdMasterGain.gain
      g.setValueAtTime(g.value, now)
      g.linearRampToValueAtTime(0.0, now + dur)
      setTimeout(() => stopBirds(), Math.ceil(dur * 1000) + 50)
    }
  }
}

watch(isDark, (dark) => {
  if (!audioCtx || !enabled.value) return
  crossfadeAmbience(dark, 700)
  // Reschedule birds or stop them accordingly
  if (dark) {
    // going to dark
    if (birdMasterGain) {
      const now = audioCtx.currentTime
      birdMasterGain.gain.setValueAtTime(birdMasterGain.gain.value, now)
      birdMasterGain.gain.linearRampToValueAtTime(0.0, now + 0.6)
      setTimeout(() => stopBirds(), 700)
    }
  } else {
    // going to light
    stopBirds()
  }
})

function startBirds() {
  if (!audioCtx) return
  if (!birdMasterGain) {
    birdMasterGain = audioCtx.createGain()
    birdMasterGain.gain.value = 0.0
    birdMasterGain.connect(audioCtx.destination)
  }
  if (!birdBuffers.length) loadBirdSamples()
  scheduleNextBird()
}

function stopBirds() {
  if (birdTimer) {
    clearTimeout(birdTimer)
    birdTimer = null
  }
  for (const src of activeBirds) {
    try { src.stop() } catch {}
    try { src.disconnect() } catch {}
  }
  activeBirds.clear()
}

function scheduleNextBird() {
  if (!enabled.value || !audioCtx || !birdMasterGain || !isDark || isDark.value) return
  const delay = 2000 + Math.random() * 5000 // 2–7s
  birdTimer = window.setTimeout(() => {
    playBirdChirp()
    // Occasionally insert a longer pause
    if (Math.random() < 0.15) {
      birdTimer = window.setTimeout(scheduleNextBird, 2500 + Math.random() * 3500)
    } else {
      scheduleNextBird()
    }
  }, delay)
}

function playBirdChirp() {
  if (!audioCtx || !birdMasterGain) return
  // Prefer sample if available
  if (birdBuffers.length) {
    const buffer = birdBuffers[Math.floor(Math.random() * birdBuffers.length)]!
    const src = audioCtx.createBufferSource()
    src.buffer = buffer
    src.playbackRate.value = 0.9 + Math.random() * 0.3
    // gentle filtering
    const hp = audioCtx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1200
    const lp = audioCtx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 6000
    // optional stereo panning
    const panner = (audioCtx as any).createStereoPanner ? (audioCtx as any).createStereoPanner() as StereoPannerNode : null
    if (panner) panner.pan.value = -0.8 + Math.random() * 1.6
    const gain = audioCtx.createGain()
    const now = audioCtx.currentTime
    const peak = 0.18 + Math.random() * 0.1
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0005, now + Math.min(1.8, buffer.duration + 0.2))
    src.connect(hp); hp.connect(lp)
    if (panner) { lp.connect(panner); panner.connect(gain) } else { lp.connect(gain) }
    gain.connect(birdMasterGain)
    src.start(now)
    const stopAt = now + Math.min(2.2, buffer.duration + 0.3)
    src.stop(stopAt)
    activeBirds.add(src)
    src.onended = () => { activeBirds.delete(src); try { src.disconnect() } catch {} }
    return
  }
  // Fallback synthesized chirp
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = 'sine'
  const now = audioCtx.currentTime
  osc.frequency.setValueAtTime(1800, now)
  osc.frequency.exponentialRampToValueAtTime(2400, now + 0.04)
  osc.frequency.exponentialRampToValueAtTime(1200, now + 0.28)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.35)
  osc.connect(gain)
  gain.connect(birdMasterGain)
  osc.start(now)
  osc.stop(now + 0.4)
}

async function loadBirdSamples() {
  if (!audioCtx || !ENABLE_SAMPLE_AUDIO) return
  const files = ['bird-1.mp3', 'bird-2.mp3', 'bird-3.mp3', 'bird-4.mp3']
  const urls = files.map(f => `/audio/${f}`)
  const loaded: AudioBuffer[] = []
  await Promise.all(urls.map(async (url) => {
    try {
      const res = await fetch(url)
      if (!res.ok) return
      const arr = await res.arrayBuffer()
      const buf = await audioCtx!.decodeAudioData(arr.slice(0))
      loaded.push(buf)
    } catch {}
  }))
  if (loaded.length) birdBuffers = loaded
}
</script>

<style scoped>
</style>


