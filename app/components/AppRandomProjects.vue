<template>
  <section class="v-app-random-projects app-grid app-grid--justify-center app-grid--align-center">
    <div class="app-grid app-grid--align-center v-app-random-projects__list">
      <nuxt-link
        v-for="item of doubledList"
        :key="item.id"
        :to="`/works/${item.slug}`"
        class="v-app-random-projects__item"
      >
        <AppImageOrVideo :src="item.src" />
      </nuxt-link>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CMS_API_Page_projet } from "#shared/cms_api"

const props = defineProps<{
  projects: CMS_API_Page_projet[]
}>()

const listOfRandomImagesForProject = computed(() =>
  props.projects.map(project => ({
    slug: project.slug,
    src: getRandomImageOrVideoImageOfProject(project),
  }))
)

const doubledList = computed(() => {
  const base = listOfRandomImagesForProject.value
  return [
    ...base.map((item, i) => ({ ...item, id: i })),
    ...base.map((item, i) => ({ ...item, id: i + base.length })),
  ]
})

function getRandomImageOrVideoImageOfProject(project: CMS_API_Page_projet): string {
  const urls: string[] = project.gallery.map(img => img.reg.url)
  if (project.cover?.reg.url)    urls.push(project.cover.reg.url)
  if (project.covers_video?.url) urls.push(project.covers_video.url)
  const idx = Math.floor(Math.random() * urls.length)
  return urls[idx] || urls[0]!
}
</script>

<style lang="scss">
@use '../assets/_params';

.v-app-random-projects {
  width: 100%;
  height: calc(100vh - 10rem);
  overflow: hidden;
}

.v-app-random-projects__list {
  animation: rp-slide 15s linear infinite;

  &:hover {
    animation-play-state: paused;
  }
}

@keyframes rp-slide {
  from { transform: translateX(0%); }
  to   { transform: translateX(-50%); }
}

// ── Items ─────────────────────────────────────────────────────────────────────

.v-app-random-projects__item {
  display: block;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: var(--app-media-radius);

  // Default shape
  width: 20vw;
  aspect-ratio: 16/9;

  transition: width  0.46s cubic-bezier(0.16, 1, 0.3, 1),
              aspect-ratio 0.46s cubic-bezier(0.16, 1, 0.3, 1);

  // Hovered item — single preset (au-boa-fumant: wMul 1.10, hMul 1.40)
  // width: 22vw, height: ~15.75vw → aspect-ratio ≈ 7/5
  &:hover {
    width: 22vw;
    aspect-ratio: 7/5;
  }

  // Siblings shrink when any item is hovered — go directly 20→14, never bounce through 20
  .v-app-random-projects__list:has(&:hover) &:not(:hover) {
    width: 14vw;
  }

  @media (max-width: params.$break-point-reg) {
    width: 75vw;
    aspect-ratio: 16/9;

    &:hover { width: 75vw; }
    .v-app-random-projects__list:has(&:hover) &:not(:hover) { width: 75vw; }
  }

  // Image fills the morphing container
  .v-app-image-or-video {
    width: 100%;
    height: 100%;
    border-radius: 0;
  }

  img, video {
    display: block;
    width: 100%;
    height: 100%;
    aspect-ratio: unset;
    object-fit: cover;
  }
}
</style>
