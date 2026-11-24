export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  modules: ["@glimmerui/nuxt"],
  devtools: { enabled: false },
  app: {
    head: {
      title: "Glimmer Nuxt playground",
      style: [
        {
          children: `
            body { margin: 0; font-family: system-ui, sans-serif; background: #0b0b10; color: white; }
            .card { height: 320px; border-radius: 20px; margin: 24px; display: grid; place-items: center; }
            h1 { font-size: 2.5rem; margin: 0; text-shadow: 0 2px 20px rgba(0,0,0,.35); }
          `,
        },
      ],
    },
  },
});
