// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
export default defineNuxtPlugin((nuxtApp) => {
  const noop: any = {
    getSSRProps() {
      return {}
    }
  }

  // Ensure these directives always exist during SSR to avoid undefined lookups
  // Register both kebab-case and camelCase keys just in case the compiler resolves either
  nuxtApp.vueApp.directive('auto-animate', noop)
  nuxtApp.vueApp.directive('autoAnimate', noop)
  nuxtApp.vueApp.directive('reveal', noop)
  nuxtApp.vueApp.directive('motion', noop)
  nuxtApp.vueApp.directive('Motion', noop)
})


