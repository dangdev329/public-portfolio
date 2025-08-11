import { onMounted } from 'vue'
import { useActiveSection } from '#imports'

export default defineNuxtPlugin(() => {
  onMounted(() => {
    const active = useActiveSection()
    const sections = Array.from(document.querySelectorAll('[data-section]')) as HTMLElement[]
    if (!sections.length) return

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id')
          if (id) active.value = id
        }
      }
    }, { rootMargin: '0px 0px -60% 0px', threshold: 0.2 })

    sections.forEach((el) => observer.observe(el))
  })
})
