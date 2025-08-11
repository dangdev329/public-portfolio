export default defineNuxtPlugin((nuxtApp) => {
  const noopSsrDirective = {
    // Ensures Vue SSR renderer can safely read directive props without errors
    getSSRProps() {
      return {}
    }
  }

  // Register SSR-safe no-op directives for client-only behaviors
  nuxtApp.vueApp.directive('auto-animate', noopSsrDirective)
  nuxtApp.vueApp.directive('reveal', noopSsrDirective)
  nuxtApp.vueApp.directive('motion', noopSsrDirective)
})


