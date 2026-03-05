<template>
    <section class="v-app-footer app-bg-dark app-with-padding--left-right app-with-padding--top-bottom"
    >
      <div style="width: 100%; height: 1px; background: white; margin-bottom: var(--app-gutter)"/>

      <div class="app-grid app-grid--justify-between">
        <div class="v-app-footer__left-content">
          <div class="app-text-h1">
            We are always happy to meet new people. Give us a call, email or come visit us.
          </div>
        </div>

        <div>

        </div>
      </div>
    </section>
</template>





<script setup lang="ts">
import { defineProps } from 'vue'

defineProps<{
    message?: string
}>()
</script>





<style lang="scss" scoped >
.v-app-footer {
  margin-top: 10rem;
  width: 100%;
}

.v-app-footer__left-content {
  max-width: 40em;
  margin-bottom: 20rem;
}
</style>
