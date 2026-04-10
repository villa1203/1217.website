<template>
  <div class="v-app"
  >
    <div class="v-app__header app-grid">
      <AppNav/>
    </div>
    <main>
      <NuxtPage/>
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
  document.body.classList.remove('app-body-drak-view')
})

const showIframe = ref(true)

onMounted( () => {
  window.addEventListener('message', (event) => {

    console.log(event.data)

    const data = event.data

    if( data.from === 'P5js' && data.value === 'click') {
      console.log('clicked')
      showIframe.value = false
    }
  })
})

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
