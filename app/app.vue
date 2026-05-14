<template>
  <div class="v-app"
  >
    <div class="v-app__header app-grid">
      <AppNav/>
    </div>
    <main>
      <NuxtPage />
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

useRouter().afterEach(() => {
  document.documentElement.classList.remove('app-body-drak-view')
  document.body.classList.remove('app-body-drak-view')
})

useHead({
  link: [
    {rel:"icon", type:"image/png", href:"/favicon-96x96.png", sizes:"96x96"},
    {rel:"icon", type:"image/svg+xml", href:"/favicon.svg"},
    {rel:"shortcut icon", href:"/favicon.ico"},
    {rel:"apple-touch-icon", sizes: "180x180", href:"/apple-touch-icon.png"},
    {rel:"manifest", href: "/site.webmanifest", },
  ],
  meta: [
    {name:"apple-mobile-web-app-title", content: "bureau 1217"},
  ],
})


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


<style lang="scss" scoped>
.v-app {
  width: 100%;
  overflow: hidden;
}

.v-app__header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  box-sizing: border-box;
  z-index: 100;
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
