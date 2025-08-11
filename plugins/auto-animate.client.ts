import autoAnimate from '@formkit/auto-animate'
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('auto-animate', (el) => {
    // @ts-expect-error: directive signature
    autoAnimate(el)
  })
})
