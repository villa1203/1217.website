<template>
  <div class="v-app"
  >
    <AppLoader />
    <div class="v-app__header app-grid">
      <AppNav/>
    </div>
    <main>
      <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" />
    </main>
    <div>
      <AppFooter/>
    </div>
  </div>

<!--  <div class="v-app__sketch"-->
<!--        @click="showIframe = false"-->
<!--        v-if="showIframe"-->
<!--       @keydown.delete="showIframe = false"-->
<!--  >-->
<!--    <iframe-->
<!--      style="-->
<!--                border: none;-->
<!--                width: 100%;-->
<!--                height: 100%;-->
<!--                background: transparent;-->
<!--              "-->
<!--      src="/sketches/sketch_over/index.html"/>-->
<!--  </div>-->
</template>


<script setup lang="ts">

import {initMatomo, updateMatomoWithNavigation} from "#shared/matomo";

useRouter().afterEach(() => {
  document.documentElement.classList.remove('app-body-drak-view')
  document.body.classList.remove('app-body-drak-view')
})

const _currentURL = useRequestURL()
useSeoMeta({
  ogLocale: 'en_US',
  ogType: 'website',
  ogUrl: () => _currentURL.href,
  ogLogo: 'https://bureau1217.ch/logo.svg',
})

useHead({
  link: [
    // Light mode
    {rel:"icon", type:"image/png", href:"/favicon-96x96.png", sizes:"96x96", media:"(prefers-color-scheme: light)"},
    {rel:"icon", type:"image/svg+xml", href:"/favicon.svg", media:"(prefers-color-scheme: light)"},
    {rel:"shortcut icon", href:"/favicon.ico", media:"(prefers-color-scheme: light)"},
    // Dark mode
    {rel:"icon", type:"image/png", href:"/favicon-32x32_white.png", sizes:"32x32", media:"(prefers-color-scheme: dark)"},
    {rel:"icon", type:"image/png", href:"/favicon-16x16_white.png", sizes:"16x16", media:"(prefers-color-scheme: dark)"},
    {rel:"shortcut icon", href:"/favicon_white.ico", media:"(prefers-color-scheme: dark)"},
    // Shared
    {rel:"apple-touch-icon", sizes: "180x180", href:"/apple-touch-icon.png"},
    {rel:"manifest", href: "/site.webmanifest"},
  ],
  meta: [
    {name:"apple-mobile-web-app-title", content: "bureau 1217"},
  ],
})

if (import.meta.client) {
    initMatomo()
    useRouter().afterEach((to, from) => {
        updateMatomoWithNavigation(from.fullPath)
    })
}


// const showIframe = ref(true)
//
// onMounted( () => {
//   window.addEventListener('message', (event) => {
//
//     const data = event.data
//
//     if( data.from === 'P5js' && data.value === 'click') {
//       showIframe.value = false
//     }
//   })
// })

</script>


<style lang="scss">
// Default page leave — any page going away
.page-leave-active {
  transition: opacity 0.3s ease;
}
.page-leave-to {
  opacity: 0;
}

// Default page enter — quick fade so white body never flashes through
.page-enter-active {
  transition: opacity 0.4s ease;
}
.page-enter-from {
  opacity: 0;
}


</style>

<style lang="scss" scoped>
.v-app {
  width: 100%;
  overflow: clip; // 'hidden' breaks position:sticky — clip prevents horizontal bleed without creating a scroll container
}

main {
  min-height: 100svh;
}

.v-app__header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  box-sizing: border-box;
  z-index: 1000;
}

.v-app__sketch {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
}
</style>
