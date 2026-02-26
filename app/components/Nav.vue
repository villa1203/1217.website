<template>
    <div class="v-nav"
    >
      <div class="app-grid app-grid--justify-between">

        <nuxt-link to="/">logo</nuxt-link>

        <nav class="app-grid app-grid--justify-end">
          <div>work</div>
          <div>work</div>
          <div>work</div>
        </nav>

      </div>
    </div>
</template>





<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps<{
    message?: string
}>()
</script>





<style lang="scss" scoped >
.v-nav {
}
</style>
