<template>
    <div class="v-app-image-or-video"
    >
      <video v-if="src.endsWith('.mp4')" :src="src" autoplay loop muted playsinline />
      <img v-else
           :src="src"
           :alt="src"
      />
    </div>
</template>





<script setup lang="ts">
import { defineProps } from 'vue'

defineProps<{
    src: string
}>()
</script>





<style lang="scss" scoped >
.v-app-image-or-video {
  width: 100%;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, .25);
}

img, video {
  display: block;
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
}
</style>
