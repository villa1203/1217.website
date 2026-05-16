<template>
  <nuxt-link :to="`/works/${project.slug}`"
             class="v-app-projects-list__item app-grid app-grid-reg--wrap"
             :class="{ 'is-sibling': isSibling }"
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

      <div class="v-app-projects-list__meta--mobile">
        <div>{{ project.title }}</div>
        <div>
          <template v-if="project.services[0]">{{ project.services[0].title }} · </template>{{ project.date?.slice(0, 4) }}
        </div>
      </div>

      <div class="v-app-projects-list__description-wrap">
        <p class="v-app-projects-list__description">{{ project.baseline }}</p>
      </div>

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
        <div
          v-for="(item, index) of project.gallery"
          :key="index"
          class="v-app-projects-list__visual-wrap app-grid__shrink-0 app-grid__col-7"
        >
          <video
            v-if="item.small.url.endsWith('.mp4')"
            class="v-app-projects-list__visual"
            muted autoplay loop playsinline
            :src="item.small.url"
          />
          <img
            v-else
            class="v-app-projects-list__visual"
            :src="item.small.url"
          />
        </div>
      </div>
    </div>

  </nuxt-link>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CMS_API_Page_projet } from "#shared/cms_api"

defineProps<{
  project: CMS_API_Page_projet
  isSibling?: boolean
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

  &.is-sibling .v-app-projects-list__visual {
    opacity: 0;
    transition: opacity 0.55s ease;
  }

  &.is-sibling .v-app-projects-list__visual-wrap::after {
    border-color: transparent;
    transition: border-color 0.55s ease;
  }
}

// Left side: flex column so description sits at the bottom
.v-app-projects-list__left {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--app-row-gap-xs);

  // Dissolve the left column into its children on mobile so we can
  // reorder meta / gallery / description as independent flex items.
  @media (max-width: params.$break-point-reg) {
    display: contents;
  }
}

// 4-column grid shared by labels and data rows
.v-app-projects-list__row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  column-gap: var(--app-grid-gap);
  align-items: start;

}

.v-app-projects-list__meta {
  @media (max-width: params.$break-point-reg) {
    display: none;
  }
}

.v-app-projects-list__meta--mobile {
  display: none;

  @media (max-width: params.$break-point-reg) {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    order: 1;
    width: 100%;
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
  border-radius: 0.30rem;
  padding: 0.1rem 0.5rem;
  font-size: 0.8rem;
  white-space: nowrap;
}

.v-app-projects-list__description-wrap {
  overflow: hidden;

  @media (max-width: params.$break-point-reg) {
    overflow: visible;
    order: 3;
    width: 100%;
    padding-top: 0.4rem;
  }
}

.v-app-projects-list__description {
  margin: 0;
  opacity: 0.6;
  width: calc(75% - var(--app-grid-gap) * 0.25);
  transform: translateY(110%);
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);

  .v-app-projects-list__item:hover & {
    transform: translateY(0);
  }

  @media (max-width: params.$break-point-reg) {
    transform: translateY(0);
    width: 100%;
  }
}

.v-app-projects-list__visual-wrap {
  position: relative;
  border-radius: var(--app-media-radius);

  @media (max-width: params.$break-point-reg) {
    width: 85% !important;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    border: 0.5px solid hsla(0, 0%, 100%, 0.18);
    pointer-events: none;
    transition: border-color 0.55s ease;
  }
}

.v-app-projects-list__visual {
  display: block;
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  border-radius: var(--app-media-radius);
  transition: opacity 0.9s ease;
}

.v-app-projects-list__gallery {
  position: relative;

  @media (max-width: params.$break-point-reg) {
    order: 2;
  }

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
