<template>
  <nuxt-link :to="`/works/${project.slug}`"
             class="v-app-projects-list__item"
             :class="{ 'is-sibling': isSibling }"
  >

    <!-- Desktop: meta (left) + description (top right) -->
    <div class="v-app-projects-list__top">
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

    <!-- Mobile: simplified meta -->
    <div class="v-app-projects-list__meta--mobile">
      <div>{{ project.title }}</div>
      <div>
        <template v-if="project.services[0]">{{ project.services[0].title }} · </template>{{ project.date?.slice(0, 4) }}
      </div>
    </div>

    <!-- Full-viewport gallery strip -->
    <div class="v-app-projects-list__gallery" :class="{ 'hide-gradient': hideGradient }">
      <div class="v-app-projects-list__gallery__container" @scroll="onScrollInGallery">
        <div
          v-for="(item, index) of project.gallery"
          :key="index"
          class="v-app-projects-list__visual-wrap"
        >
          <video
            v-if="item.reg?.url?.endsWith('.mp4')"
            class="v-app-projects-list__visual"
            muted autoplay loop playsinline
            :src="item.reg.url"
          />
          <img
            v-else
            class="v-app-projects-list__visual"
            :src="item.reg?.url"
            :alt="item.alt"
          />
        </div>
      </div>
    </div>

    <!-- Description below gallery on mobile -->
    <p class="v-app-projects-list__description--mobile">{{ project.baseline }}</p>

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
  padding-bottom: var(--app-gutter);
  color: inherit;
  text-decoration: inherit;
  display: flex;
  flex-direction: column;
  gap: var(--app-grid-gap);

  &.is-sibling .v-app-projects-list__visual {
    opacity: 0;
    transition: opacity 0.55s ease;
  }

  &.is-sibling .v-app-projects-list__visual-wrap::after {
    border-color: transparent;
    transition: border-color 0.55s ease;
  }
}

// ── Top row: meta (left 3fr) + description (right 1fr) ────────────────────────
.v-app-projects-list__top {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: var(--app-grid-gap);
  align-items: start;

  @media (max-width: params.$break-point-reg) {
    display: none;
  }
}

.v-app-projects-list__meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.v-app-projects-list__row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  column-gap: var(--app-grid-gap);
  align-items: start;
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

.v-app-projects-list__description {
  margin: 0;
  opacity: 0.6;
}

.v-app-projects-list__description--mobile {
  display: none;

  @media (max-width: params.$break-point-reg) {
    display: block;
    margin: 0;
    opacity: 0.6;
  }
}

// ── Mobile simplified meta ─────────────────────────────────────────────────────
.v-app-projects-list__meta--mobile {
  display: none;

  @media (max-width: params.$break-point-reg) {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    width: 100%;
  }
}

// ── Full-viewport gallery strip ────────────────────────────────────────────────
// Escapes the parent's app-with-padding--left-right to reach viewport edges
.v-app-projects-list__gallery {
  position: relative;
  margin-left: calc(-1 * var(--app-grid-gap));
  width: 100vw;

  &::after {
    z-index: 5;
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 8rem;
    height: 100%;
    transition: opacity 0.25s ease;
    background: linear-gradient(to left, var(--app-color-light) 0%, transparent 100%);
    pointer-events: none;
  }

  &.hide-gradient::after {
    opacity: 0;
  }
}

.v-app-projects-list__gallery__container {
  display: flex;
  gap: var(--app-grid-gap);
  padding-left: var(--app-grid-gap);
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar { display: none; }
}

.v-app-projects-list__visual-wrap {
  flex-shrink: 0;
  position: relative;
  height: clamp(180px, 32vh, 480px);
  border-radius: var(--app-media-radius);
  overflow: hidden;

  @media (max-width: params.$break-point-reg) {
    height: clamp(120px, 25vh, 280px);
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
  height: 100%;
  width: auto;
  object-fit: cover;
  border-radius: var(--app-media-radius);
  transition: opacity 0.9s ease;
}
</style>
