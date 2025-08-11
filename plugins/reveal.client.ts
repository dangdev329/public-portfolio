export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('reveal', {
    mounted(el: HTMLElement, binding: { value?: { classes?: string } }) {
      const classes = binding?.value?.classes || 'animate-in fade-in-0 slide-in-from-bottom-2 duration-700';
      const observer = new IntersectionObserver((entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add(...classes.split(' '));
            obs.unobserve(el);
          }
        }
      }, { threshold: 0.2 });
      observer.observe(el);
    }
  });
});
