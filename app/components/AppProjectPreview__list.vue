<template>
    <nuxt-link class="v-app-project-preview app-rm-child-margin"
               :to="`projets/${slug}`"
    >
      <img class="v-app-project-preview__cover"
           :src="image.reg.url"
      />
    </nuxt-link>
</template>



<script setup lang="ts">
import { defineProps } from 'vue'
import type {CMS_API_ImageInstance} from "#shared/cms_api";

defineProps<{
  image: CMS_API_ImageInstance,
  // title: string,
  // baseline: string,
  slug: string,
}>()
</script>





<style lang="scss" scoped >
.v-app-project-preview {
  color: inherit;
  text-decoration: inherit;
}

.v-app-project-preview__cover {
  display: block;
  width: 100%;
  object-fit: cover;
  aspect-ratio: 4/5;
}
</style>
