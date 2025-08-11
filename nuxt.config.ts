// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['@@/assets/css/main.css'],
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/content',
    '@nuxt/image',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    '@vite-pwa/nuxt',
    '@nuxtjs/google-fonts'
  ],
  app: {
    head: {
      titleTemplate: '%s · Dang',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'theme-color', content: '#059669' },
        { property: 'og:site_name', content: 'Dang — Nuxt Portfolio' },
        { name: 'twitter:card', content: 'summary_large_image' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }
      ]
    }
  },
  googleFonts: {
    families: {
      Sora: [400, 500, 600, 700]
    },
    display: 'swap',
    preload: true
  },
  tailwindcss: { viewer: false },
  colorMode: { classSuffix: '', preference: 'dark', fallback: 'dark' },
  content: {
    highlight: {
      theme: { default: 'github-light', dark: 'github-dark' }
    }
  },
  image: {
    domains: [
      'certificates.dev',
      'api.certificates.dev',
      'images.credly.com'
    ]
  },
  site: {
    url: 'https://example.com',
    name: 'Dang — Nuxt Portfolio',
    description: 'Portfolio showcasing Nuxt and Vue skills'
  },
  sitemap: { autoLastmod: true },
  robots: { rules: [{ userAgent: '*', allow: '/' }] },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Dang — Nuxt Portfolio',
      short_name: 'Dang',
      theme_color: '#059669',
      background_color: '#0a1014',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    }
  }
})
