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
          v-for="(item, index) of allVisuals"
          :key="index"
          class="v-app-projects-list__visual-wrap"
          :style="{ '--delay': `${index * 0.06}s` }"
        >
          <video
            v-if="item.isVideo"
            class="v-app-projects-list__visual"
            muted autoplay loop playsinline
            :src="item.url"
          />
          <img
            v-else
            class="v-app-projects-list__visual"
            :src="item.url"
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
import type { CMS_API_Page_projet } from "#shared/cms_api"

const props = defineProps<{
  project: CMS_API_Page_projet
  isSibling?: boolean
}>()

// covers_video first, then all gallery files — deduped
const allVisuals = computed(() => {
  const seen = new Set<string>()
  const list: { url: string; isVideo: boolean; alt?: string }[] = []

  const add = (url: string, isVideo: boolean, alt?: string) => {
    if (url && !seen.has(url)) { seen.add(url); list.push({ url, isVideo, alt }) }
  }

  if (props.project.covers_video?.url) {
    add(props.project.covers_video.url, true)
  }
  for (const img of (props.project.gallery ?? [])) {
    if (img.reg?.url) add(img.reg.url, img.reg.url.endsWith('.mp4'), img.alt ?? undefined)
  }

  return list
})

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

// 1. No outline on service tags
.v-app-projects-list__tag {
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

// 2. Morph animation — visuals scale from near-zero when appearing (sibling → active)
.v-app-projects-list__visual {
  display: block;
  height: 100%;
  width: auto;
  object-fit: cover;
  border-radius: var(--app-media-radius);
  transition-property: opacity, transform;
  transition-duration: 0.9s;
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: var(--delay, 0s);
}

// Sibling: compress quickly, no stagger on exit
.v-app-projects-list__item.is-sibling .v-app-projects-list__visual {
  opacity: 0;
  transform: scale(0.05);
  transition-duration: 0.3s;
  transition-timing-function: ease;
  transition-delay: 0s !important;
}

.v-app-projects-list__item.is-sibling .v-app-projects-list__visual-wrap::after {
  border-color: transparent;
  transition: border-color 0.3s ease;
}
</style>
