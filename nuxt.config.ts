// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/_main.scss'],

  imports: {
    scan: false,
  },

  runtimeConfig: {
    betterAuthSecret: process.env.BETTER_AUTH_SECRET || 'your-secret-key-change-this-in-production',
    betterAuthUrl: process.env.BETTER_AUTH_URL,
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
    },
  },

})
