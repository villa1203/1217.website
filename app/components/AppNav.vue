<template>
    <nav class="v-nav app-with-padding--left-right app-with-padding--top-bottom"
    >
      <div class="app-grid app-grid--justify-between">

        <nuxt-link to="/" class="app-button">
          <div class="app-grid app-grid--align-center">
            <img src="/logo.svg" /><UIOpen/>
          </div>
        </nuxt-link>

        <nav class="app-grid app-grid--justify-end"
             style="gap: .5rem"
        >
          <nuxt-link class="app-button" to="/works">works</nuxt-link>
<!--          <nuxt-link class="app-button" to="/office">office</nuxt-link>-->
          <nuxt-link class="app-button" to="/research">research</nuxt-link>
        </nav>

      </div>
    </nav>
</template>





<script setup lang="ts">
import { defineProps } from 'vue'
import UIOpen from "~/components/UIOpen.vue";

const props = defineProps<{
    message?: string
}>()
</script>





<style lang="scss" scoped >
.v-nav {
  width: 100%;
}
</style>
