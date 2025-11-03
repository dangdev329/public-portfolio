<template>
  <div class="relative" ref="carouselRef">
    <!-- Carousel Container -->
    <div class="overflow-hidden rounded-2xl">
      <div 
        class="flex transition-transform duration-500 ease-in-out"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div
          v-for="(testimonial, index) in items"
          :key="testimonial.name + testimonial.title"
          class="w-full flex-shrink-0 px-4"
        >
          <article class="card p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 shadow-lg mx-auto max-w-2xl">
            <div class="text-center">
              <!-- Quote Icon -->
              <div class="mb-6">
                <svg class="w-12 h-12 mx-auto text-emerald-500 dark:text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                </svg>
              </div>
              
              <!-- Quote Text -->
              <blockquote class="text-lg md:text-xl leading-relaxed text-gray-800 dark:text-gray-200 mb-8 italic">
                "{{ testimonial.quote }}"
              </blockquote>
              
              <!-- Author Info -->
              <div class="flex items-center justify-center gap-4">
                <div class="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 grid place-items-center text-emerald-700 dark:text-emerald-300 text-lg font-semibold overflow-hidden">
                  <NuxtImg 
                    v-if="testimonial.avatar" 
                    :src="testimonial.avatar" 
                    :alt="testimonial.name" 
                    width="80" 
                    height="80" 
                    class="h-full w-full object-cover" 
                  />
                  <span v-else>{{ initials(testimonial.name) }}</span>
                </div>
                <div class="text-left">
                  <div class="font-semibold text-gray-900 dark:text-gray-100">{{ testimonial.name }}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">{{ testimonial.title }}</div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>

    <!-- Navigation Dots -->
    <div class="flex justify-center mt-8 gap-2">
      <button
        v-for="(_, index) in items"
        :key="index"
        @click="goToSlide(index)"
        class="w-3 h-3 rounded-full transition-all duration-300"
        :class="currentIndex === index 
          ? 'bg-emerald-500 dark:bg-emerald-400' 
          : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'"
      />
    </div>

    <!-- Navigation Arrows -->
    <button
      @click="previousSlide"
      class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors duration-200"
      :disabled="items.length <= 1"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
      </svg>
    </button>
    
    <button
      @click="nextSlide"
      class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors duration-200"
      :disabled="items.length <= 1"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
export type Testimonial = {
  name: string
  title?: string
  quote: string
  avatar?: string
}

const props = defineProps<{ items: Testimonial[] }>()

const currentIndex = ref(0)
let autoPlayInterval: NodeJS.Timeout | null = null
let touchStartX = 0
let touchEndX = 0

function initials(name: string): string {
  const parts = (name || '').trim().split(/\s+/)
  return parts.slice(0, 2).map(p => p[0]?.toUpperCase()).join('') || 'U'
}

function nextSlide() {
  currentIndex.value = (currentIndex.value + 1) % props.items.length
}

function previousSlide() {
  currentIndex.value = currentIndex.value === 0 ? props.items.length - 1 : currentIndex.value - 1
}

function goToSlide(index: number) {
  currentIndex.value = index
}

function handleTouchStart(e: TouchEvent) {
  touchStartX = e.changedTouches[0]?.screenX || 0
}

function handleTouchEnd(e: TouchEvent) {
  touchEndX = e.changedTouches[0]?.screenX || 0
  handleSwipe()
}

function handleSwipe() {
  const swipeThreshold = 50
  const diff = touchStartX - touchEndX
  
  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // Swipe left - next slide
      nextSlide()
    } else {
      // Swipe right - previous slide
      previousSlide()
    }
  }
}

function startAutoPlay() {
  if (props.items.length > 1) {
    autoPlayInterval = setInterval(nextSlide, 5000) // Auto-advance every 5 seconds
  }
}

function stopAutoPlay() {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval)
    autoPlayInterval = null
  }
}

// Start auto-play on mount
onMounted(() => {
  startAutoPlay()
})

// Clean up on unmount
onUnmounted(() => {
  stopAutoPlay()
})

// Pause auto-play on hover
const carouselRef = ref<HTMLElement>()

onMounted(() => {
  if (carouselRef.value) {
    carouselRef.value.addEventListener('mouseenter', stopAutoPlay)
    carouselRef.value.addEventListener('mouseleave', startAutoPlay)
    carouselRef.value.addEventListener('touchstart', handleTouchStart, { passive: true })
    carouselRef.value.addEventListener('touchend', handleTouchEnd, { passive: true })
  }
})

onUnmounted(() => {
  if (carouselRef.value) {
    carouselRef.value.removeEventListener('mouseenter', stopAutoPlay)
    carouselRef.value.removeEventListener('mouseleave', startAutoPlay)
    carouselRef.value.removeEventListener('touchstart', handleTouchStart)
    carouselRef.value.removeEventListener('touchend', handleTouchEnd)
  }
})
</script>


