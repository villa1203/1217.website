<template>
    <nuxt-link class="v-app-project-preview app-rm-child-margin"
               :to="`works/${slug}`"
    >
      <button class="v-app-project-preview__tags">
        <template v-for="(service, index) in services">
          <template v-if="index > 0" > · </template>{{service}}
        </template>
      </button>
      <div class="v-app-project-preview__wrapper">
        <template v-if="covers_video">
          <video class="v-app-project-preview__wrapper__cover"
                 muted loop autoplay
                 :src="covers_video"
          />
        </template>
        <template v-else>
          <img class="v-app-project-preview__wrapper__cover"
               :src="image?.reg.url"
          />
        </template>
      </div>
      <div>
        <h2 class="app-text-reg app-text-strong app-no-margin">{{title}}</h2>
        <p class="app-text-reg app-no-margin">{{baseline}}</p>
      </div>
    </nuxt-link>
</template>



<script setup lang="ts">
import { defineProps } from 'vue'
import type {CMS_API_ImageInstance} from "#shared/cms_api";

defineProps<{
  image?: CMS_API_ImageInstance,
  covers_video?: string,
  title: string,
  baseline: string,
  slug: string,
  services?: string[],
}>()
</script>





<style lang="scss" scoped >
.v-app-project-preview {
  color: inherit;
  text-decoration: inherit;
  position: relative;
}

.v-app-project-preview__tags {
  position: absolute;
  top: var(--app-gutter);
  left: var(--app-gutter);
  z-index: 1;
}

.v-app-project-preview__wrapper {
  margin-bottom: .5rem;
  border-radius: 1rem;
  overflow: hidden;
  transition: border-radius 15s cubic-bezier(0, .25, 0, 1);

  .v-app-project-preview:hover & {
    border-radius: 0;
  }
}

.v-app-project-preview__wrapper__cover {
  display: block;
  width: 100%;
  object-fit: cover;
  aspect-ratio: 3/2;
  max-height: calc( 100vh - 2rem);
  transition: transform 15s cubic-bezier(0, .25, 0, 1);
  border-radius: 1rem;

  .v-app-project-preview:hover & {
    transform: scale(1.05);
  }
}
</style>
