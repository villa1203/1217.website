<template>
  <section class="v-app-random-projects app-grid app-grid--justify-center app-grid--align-center">
    <div
      ref="listRef"
      class="app-grid app-grid--align-center v-app-random-projects__list"
      @mouseenter="paused = true"
      @mousemove="onListMouseMove"
      @mouseleave="onListMouseLeave"
    >
      <nuxt-link
        v-for="item of doubledList"
        :key="item.id"
        :data-id="item.id"
        :to="`/works/${item.slug}`"
        class="v-app-random-projects__item"
        :class="{
          'is-hovered': hoveredId === item.id,
          'is-sibling': hoveredId !== null && hoveredId !== item.id,
        }"
      >
        <div
          class="v-app-random-projects__item__track"
          :class="{ 'no-transition': noTransitionIds[item.id] }"
          :style="{ transform: `translateX(-${(slideIndices[item.id] ?? 0) * 100}%)` }"
        >
          <!-- append srcs[0] as a clone at the end for seamless infinite loop -->
          <AppImageOrVideo
            v-for="(src, i) of [...item.srcs, item.srcs[0]]"
            :key="i"
            :src="src"
          />
        </div>
      </nuxt-link>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CMS_API_Page_projet } from "#shared/cms_api"

const props = defineProps<{
  projects: CMS_API_Page_projet[]
}>()

const listOfImagesForProject = computed(() =>
  props.projects.map(project => ({
    slug: project.slug,
    srcs: getAllImagesOfProject(project),
  }))
)

const doubledList = computed(() => {
  const base = listOfImagesForProject.value
  return [
    ...base.map((item, i) => ({ ...item, id: i })),
    ...base.map((item, i) => ({ ...item, id: i + base.length })),
  ]
})

function getAllImagesOfProject(project: CMS_API_Page_projet): string[] {
  const seen = new Set<string>()
  const urls: string[] = []
  for (const img of project.gallery) {
    if (!seen.has(img.reg.url)) { seen.add(img.reg.url); urls.push(img.reg.url) }
  }
  if (project.cover?.reg.url && !seen.has(project.cover.reg.url)) {
    seen.add(project.cover.reg.url); urls.push(project.cover.reg.url)
  }
  if (project.covers_video?.url && !seen.has(project.covers_video.url)) {
    urls.push(project.covers_video.url)
  }
  // Random start for variety across items
  const start = Math.floor(Math.random() * urls.length)
  return [...urls.slice(start), ...urls.slice(0, start)]
}

// ── Marquee ───────────────────────────────────────────────────────────────────

const listRef = ref<HTMLElement | null>(null)
const paused  = ref(false)
let currentX  = 0
let rafId: number | null = null

function tick() {
  const el = listRef.value
  if (el && !paused.value) {
    const halfWidth = el.scrollWidth / 2
    currentX -= halfWidth / (15 * 60)
    if (currentX <= -halfWidth) currentX += halfWidth
    el.style.transform = `translateX(${currentX}px)`
  }
  rafId = requestAnimationFrame(tick)
}

// ── Hover + slideshow ─────────────────────────────────────────────────────────

const hoveredId       = ref<number | null>(null)
const slideIndices    = reactive<Record<number, number>>({})
const noTransitionIds = reactive<Record<number, boolean>>({})
let   slideTimer: ReturnType<typeof setInterval> | null = null
let   slideDelay: ReturnType<typeof setTimeout>  | null = null

watch(hoveredId, (newId) => {
  if (slideDelay) { clearTimeout(slideDelay);   slideDelay = null }
  if (slideTimer) { clearInterval(slideTimer);   slideTimer = null }
  if (newId === null) return

  const item = doubledList.value.find(i => i.id === newId)
  if (!item || item.srcs.length <= 1) return

  // Always restart from 0 on each new hover
  slideIndices[newId] = 0

  // 1 s of zoom, then start cycling images
  slideDelay = setTimeout(() => {
    slideTimer = setInterval(() => {
      const idx = slideIndices[newId] ?? 0
      if (idx >= item.srcs.length) {
        // On the clone — jump back to real 0 instantly, then advance to 1
        noTransitionIds[newId] = true
        slideIndices[newId] = 0
        setTimeout(() => {
          noTransitionIds[newId] = false
          slideIndices[newId] = 1
        }, 50)
      } else {
        slideIndices[newId] = idx + 1
      }
    }, 700)
  }, 1000)
})

// mousemove + closest: hover state is set when over an item but NOT cleared
// when crossing a gap — only mouseleave clears it. Eliminates CSS oscillation.
function onListMouseMove(event: MouseEvent) {
  const el = (event.target as Element).closest<HTMLElement>('.v-app-random-projects__item')
  if (!el) return
  const id = parseInt(el.dataset.id ?? '0')
  if (hoveredId.value !== id) hoveredId.value = id
}

function onListMouseLeave() {
  paused.value    = false
  hoveredId.value = null
}

onMounted(async () => {
  await nextTick()
  rafId = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  if (rafId !== null)      cancelAnimationFrame(rafId)
  if (slideDelay !== null) clearTimeout(slideDelay)
  if (slideTimer !== null) clearInterval(slideTimer)
})
</script>

<style lang="scss">
@use '../assets/_params';

.v-app-random-projects {
  width: 100%;
  height: calc(100vh - 10rem);
  overflow: hidden;
}

.v-app-random-projects__list {
  will-change: transform;
}

// ── Items ─────────────────────────────────────────────────────────────────────

.v-app-random-projects__item {
  display: block;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: var(--app-media-radius);

  width: 20vw;
  aspect-ratio: 16/9;

  @media (max-width: params.$break-point-reg) {
    width: 75vw;
    aspect-ratio: 16/9;
  }

  // Siblings: hide content, show only a light grey outline
  &.is-sibling .v-app-random-projects__item__track {
    opacity: 0;
    transition: opacity 0.8s ease, transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  &.is-sibling {
    box-shadow: inset 0 0 0 1px rgba(180, 180, 180, 0.35);
  }
}

// ── Slide track inside each item ──────────────────────────────────────────────

.v-app-random-projects__item__track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: opacity 0.8s ease, transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);

  .v-app-image-or-video {
    flex-shrink: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 0;
  }

  img, video {
    display: block;
    width: 100%;
    height: 100%;
    aspect-ratio: unset;
    object-fit: cover;
    transition: transform 15s cubic-bezier(0, .25, 0, 1);
  }
}

.v-app-random-projects__item__track.no-transition {
  transition: none !important;
}

// Zoom in on the hovered item's current image
.v-app-random-projects__item.is-hovered {
  img, video {
    transform: scale(1.05);
  }
}
</style>
