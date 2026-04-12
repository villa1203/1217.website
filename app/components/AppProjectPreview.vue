<template>
    <nuxt-link class="v-app-project-preview app-rm-child-margin"
               :to="`works/${slug}`"
    >
      <button class="v-app-project-preview__tags">
        <template v-for="(service, index) in services">
          <template v-if="index > 0" > · </template><span class="v-app-project-preview__tags__text" >{{service}}</span>
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
      <div class="v-app-project-preview__text-container">
        <h2 class="v-app-project-preview__text-container__title app-text-reg app-text-strong app-no-margin">
          <span v-for="(char, index) in title.split('')" :key="index" :style="{ transitionDelay: `${index * 20}ms` }" >
            {{ char.replace(' ', '\u00A0') }}
          </span>
        </h2>
        <p  class="v-app-project-preview__text-container__baseline app-text-reg app-no-margin">
          {{baseline}}
        </p>
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
@use '../assets/_params';

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
  margin-right: var(--app-gutter);
}

.v-app-project-preview__tags__text {
  white-space: nowrap;

  @media (max-width: 300px) {
    white-space: normal;
  }
}

.v-app-project-preview__wrapper {
  margin-bottom: .5rem;
  border-radius: 1rem;
  overflow: hidden;
  transition: border-radius 5s cubic-bezier(0, .25, 0, 1);

  .v-app-project-preview:hover & {
    border-radius: 0;
  }

  .app-body-drak-view & {
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 1);
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

.v-app-project-preview__text-container__title > span {
  display: inline-block;
  transition: transform 0.3s ease;

  .v-app-project-preview:hover & {
    transform: translateY(-.25em);

    &:hover {
      transform: translateY(-.35em);
      transition-delay: 0s !important;
    }
  }
}

.v-app-project-preview__text-container {

  .app-body-drak-view & {
    padding-left: .5rem;
    padding-right: .5rem;
    padding-bottom: .5rem;
  }
}

.v-app-project-preview__text-container__baseline {
  transition: transform 0.3s ease;

  .v-app-project-preview:hover & {
    transform: translateY(-5px);
    transition-delay: .15s;
  }
}
</style>
