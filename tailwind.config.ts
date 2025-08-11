import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
  content: [
    './app/**/*.{vue,js,ts}',
    './content/**/*.{md,mdc,yml,yaml,json}',
  ],
  theme: {
    extend: {
      container: { center: true, padding: '1rem' }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate')
  ]
}
