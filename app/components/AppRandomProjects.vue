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
        v-for="(item, index) of doubledList"
        :key="item.id"
        :data-id="item.id"
        :to="`/works/${item.slug}`"
        :style="{ '--item-index': index % props.projects.length }"
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
          <AppImageOrVideo
            v-for="(src, i) of [...item.srcs, item.srcs[0] ?? '']"
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
  const start = Math.floor(Math.random() * urls.length)
  return [...urls.slice(start), ...urls.slice(0, start)]
}

// ── Marquee — delta-time based for consistent speed across framerates ──────────

const SPEED = 82  // px / second

const listRef = ref<HTMLElement | null>(null)
const paused  = ref(false)
let currentX  = 0
let lastTime: number | null = null
let rafId: number | null = null

function tick(now: number) {
  rafId = requestAnimationFrame(tick)
  const el = listRef.value
  if (!el) return
  if (lastTime === null) { lastTime = now; return }

  const dt = Math.min(now - lastTime, 50)
  lastTime = now

  if (!paused.value) {
    const halfWidth = el.scrollWidth / 2
    currentX -= SPEED * dt / 1000
    if (currentX <= -halfWidth) currentX += halfWidth
    el.style.transform = `translateX(${currentX}px)`
  }
}

// ── Hover + slideshow ─────────────────────────────────────────────────────────

const hoveredId       = ref<number | null>(null)
const slideIndices    = reactive<Record<number, number>>({})
const noTransitionIds = reactive<Record<number, boolean>>({})
let   slideTimer: ReturnType<typeof setInterval> | null = null
let   slideDelay: ReturnType<typeof setTimeout>  | null = null

watch(hoveredId, (newId) => {
  if (slideDelay) { clearTimeout(slideDelay);  slideDelay = null }
  if (slideTimer) { clearInterval(slideTimer); slideTimer = null }
  if (newId === null) return

  const item = doubledList.value.find(i => i.id === newId)
  if (!item || item.srcs.length <= 1) return

  slideIndices[newId] = 0

  // Longer initial pause so the shape morph settles before images start cycling
  slideDelay = setTimeout(() => {
    slideTimer = setInterval(() => {
      const idx = slideIndices[newId] ?? 0
      if (idx >= item.srcs.length) {
        noTransitionIds[newId] = true
        slideIndices[newId] = 0
        setTimeout(() => {
          noTransitionIds[newId] = false
          slideIndices[newId] = 1
        }, 50)
      } else {
        slideIndices[newId] = idx + 1
      }
    }, 1200)
  }, 500)
})

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
  aspect-ratio: 16 / 9;

  // Shape morph + shadow — both transition together
  transition:
    aspect-ratio 1.1s cubic-bezier(0.65, 0, 0.35, 1),
    box-shadow   0.7s ease;

  @media (max-width: params.$break-point-reg) {
    width: 75vw;
  }

  // ── Hover: morph to portrait + drop shadow ─────────────────────────────────
  &.is-hovered {
    aspect-ratio: 3 / 4;
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.18),
      0  4px 16px rgba(0, 0, 0, 0.10);
  }

  // ── Siblings: outline only ─────────────────────────────────────────────────
  &.is-sibling {
    box-shadow: inset 0 0 0 1px rgba(180, 180, 180, 0.35);
  }

  &.is-sibling .v-app-random-projects__item__track {
    opacity: 0;
  }
}

// ── Slide track inside each item ──────────────────────────────────────────────

.v-app-random-projects__item__track {
  display: flex;
  width: 100%;
  height: 100%;
  // Slide easing: confident sweep in/out
  transition:
    opacity   0.9s ease,
    transform 0.85s cubic-bezier(0.76, 0, 0.24, 1);

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

// Slow zoom on hover — persists across image slides
.v-app-random-projects__item.is-hovered img,
.v-app-random-projects__item.is-hovered video {
  transform: scale(1.05);
}
</style>
