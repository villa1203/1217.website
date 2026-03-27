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

<!--  <iframe-->
<!--    v-if="showIframe"-->
<!--    @click="showIframe = false"-->
<!--    class="v-app__sketch"-->
<!--    style="-->
<!--              border: none;-->
<!--              width: 100%;-->
<!--              height: 100vh;-->
<!--              background: transparent;-->
<!--            "-->
<!--    src="/sketches/sketch_over/index.html"/>-->
</template>


<script setup lang="ts">

useRouter().afterEach(() => {
  document.body.classList.remove('v-block--is-visible')
})

const showIframe = ref(true)

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
  height: 100vh;
}
</style>
