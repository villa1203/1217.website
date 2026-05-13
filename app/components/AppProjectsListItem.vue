<template>
  <nuxt-link :to="`/works/${project.slug}`"
             class="v-app-projects-list__item app-grid app-grid-reg--wrap"
  >

    <div class="app-grid__col-6 app-grid-reg__col-12 v-app-projects-list__left">

      <div class="v-app-projects-list__meta">
        <div class="v-app-projects-list__row v-app-projects-list__labels">
          <div class="app-text-strong">Client</div>
          <div class="app-text-strong">Services</div>
          <div class="app-text-strong">Sector</div>
          <div class="app-text-strong">Year</div>
        </div>

        <div class="v-app-projects-list__row v-app-projects-list__data">
          <div>{{ project.title }}</div>

          <div class="v-app-projects-list__services">
            <span
              v-for="service of project.services"
              :key="service.slug"
              class="v-app-projects-list__tag"
            >{{ service.title }}</span>
          </div>

          <div>
            <span v-for="(sector, i) of project.sectors" :key="sector.slug">
              {{ sector.title }}<template v-if="i < project.sectors.length - 1">, </template>
            </span>
          </div>

          <div>{{ project.date?.slice(0, 4) }}</div>
        </div>
      </div>

      <p class="v-app-projects-list__description">{{ project.baseline }}</p>

    </div>

    <div class="app-grid__col-6 v-app-projects-list__gallery app-grid-reg__col-12"
         :class="{
           'has-scroll': project.gallery.length > 1,
           'reg-has-scroll': project.gallery.length > 1,
           'hide-gradient': hideGradient,
         }"
    >
      <div class="app-grid app-grid--justify-end v-app-projects-list__gallery__container app-grid-reg--justify-start"
           @scroll="onScrollInGallery"
      >
        <template v-for="(item, index) of project.gallery" :key="index">
          <video
            v-if="item.small.url.endsWith('.mp4')"
            class="v-app-projects-list__visual app-grid__shrink-0 app-grid__col-7"
            muted autoplay loop playsinline
            :src="item.small.url"
          />
          <img
            v-else
            class="v-app-projects-list__visual app-grid__shrink-0 app-grid__col-7"
            :src="item.small.url"
          />
        </template>
      </div>
    </div>

  </nuxt-link>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CMS_API_Page_projet } from "#shared/cms_api"

defineProps<{
  project: CMS_API_Page_projet
}>()

const hideGradient = ref(false)

function onScrollInGallery(e: Event) {
  if (!(e.target instanceof HTMLElement)) return
  hideGradient.value = e.target.scrollLeft > 250
}
</script>

<style lang="scss" scoped>
@use "../assets/_params";

.v-app-projects-list__item {
  border-top: 1px solid var(--app-color-dark);
  padding-top: var(--app-gutter);
  color: inherit;
  text-decoration: inherit;
}

// Left side: flex column so description sits at the bottom
.v-app-projects-list__left {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--app-row-gap-xs);
}

// 4-column grid shared by labels and data rows
.v-app-projects-list__row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  column-gap: var(--app-grid-gap);
  align-items: start;

  @media (max-width: params.$break-point-reg) {
    grid-template-columns: 1fr 1fr;
    row-gap: var(--app-grid-gap);
  }
}

.v-app-projects-list__labels {
  margin-bottom: 0.15rem;
}

.v-app-projects-list__services {
  display: flex;
  flex-wrap: wrap;
  gap: var(--app-grid-gap-xs);
}

.v-app-projects-list__tag {
  border: 1px solid var(--app-color-dark);
  border-radius: var(--app-media-radius);
  padding: 0.1rem 0.5rem;
  font-size: 0.8rem;
  white-space: nowrap;
}

// Description right edge aligns with Sector column (3 of 4 cols)
// width = 3 cols + 2 gaps = 75% - gap/4
.v-app-projects-list__description {
  margin: 0;
  opacity: 0.6;
  width: calc(75% - var(--app-grid-gap) * 0.25);

  @media (max-width: params.$break-point-reg) {
    width: 100%;
  }
}

// Gallery (unchanged)
.v-app-projects-list__visual {
  aspect-ratio: 16/9;
  object-fit: cover;
  border-radius: var(--app-media-radius);
}

.v-app-projects-list__gallery {
  position: relative;

  &.has-scroll::after {
    z-index: 5;
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: calc(100% / 5);
    height: 100%;
    transition: all .25s ease-in-out;
    background: linear-gradient(to left, var(--app-color-light) 0%, hsla(0, 0%, 100%, 0) 100%);
    pointer-events: none;
  }

  &.hide-gradient::after {
    transform: translateX(100%);
  }
}

.v-app-projects-list__gallery__container {
  width: 100%;
  overflow: hidden;
  border-radius: var(--app-media-radius);

  .has-scroll & {
    overflow: scroll;
    justify-content: flex-start;
  }

  @media (max-width: params.$break-point-reg) {
    .reg-has-scroll & {
      overflow: scroll;
    }
  }
}
</style>
