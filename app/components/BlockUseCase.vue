<template>
  <section class="v-block-use-case app-grid app-grid--align-center app-grid--justify-center">

    <!-- Desktop (with hover card) -->
    <div
      class="v-block-use-case__inner v-block-use-case__inner--desktop"
      @mousemove="onMouseMove"
      @mouseleave="onMouseLeave"
      @click="goToProject"
    >
      <h2 class="v-block-use-case__title">
        Bureau 1217 is a design and technology office.
      </h2>
      <h2 ref="wrapperRef" class="v-block-use-case__baseline-wrapper">
        <Transition name="roll" @before-leave="freezeHeight" @after-enter="releaseHeight">
          <span :key="currentIndex" class="v-block-use-case__baseline">{{ baselines[currentIndex] }}</span>
        </Transition>
      </h2>
    </div>

    <div v-if="isVisible" :style="anchorStyle">
      <div class="v-block-use-case__card" :style="cardStyle">
        <svg
          class="v-block-use-case__card-svg"
          :width="CARD_SIZE.w"
          :height="CARD_SIZE.h"
        >
          <path
            :d="svgPath"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            vector-effect="non-scaling-stroke"
          />
        </svg>
        <div class="v-block-use-case__card-image">
          <img
            v-if="currentCover"
            :src="currentCover.reg.url"
            :alt="currentCover.alt ?? ''"
          />
        </div>
        <div class="v-block-use-case__card-label">See latest use case</div>
      </div>
    </div>

    <!-- Mobile (no hover) -->
    <div class="v-block-use-case__inner v-block-use-case__inner--mobile">
      <h2 class="v-block-use-case__mobile-static">{{ title }}</h2>
      <h2 ref="mobileWrapperRef" class="v-block-use-case__mobile-rolling">
        <Transition name="roll" @before-leave="freezeMobileHeight" @after-enter="releaseMobileHeight">
          <span :key="currentIndex" class="v-block-use-case__baseline">{{ baselinesMobile[currentIndex] }}</span>
        </Transition>
      </h2>
    </div>

  </section>
</template>




<script setup lang="ts">
import type { CMS_API_ImageInstance, CMS_API_Page_projet, CMS_API_Response, CMS_BlockData } from "#shared/cms_api"
import { KQL_PROJECTS_SELECT, KQL_QUERY_BLOCKS } from "#shared/KQLQueries"
import { getProjectBySector } from "#shared/projects_utils"

type FetchData = CMS_API_Response & {
  result: {
    title:    string
    slug:     string
    content:  CMS_BlockData[]
    projects: CMS_API_Page_projet[]
  }
}

const { data } = useFetch<FetchData>('/api/CMS_KQLRequest', {
  lazy: true,
  method: 'POST',
  body: {
    query: `page('projects')`,
    select: {
      title: true,
      slug:  true,
      projects: {
        query:  'page.children',
        select: KQL_PROJECTS_SELECT,
      },
      content: KQL_QUERY_BLOCKS,
    },
  },
})

// ── Baselines ─────────────────────────────────────────────────────────────────
const baselines = [
  'We design interactive storytelling for the Olympic Games.',
  'We craft visual systems for jazz schools and venues.',
  'We create immersive experiences for public institutions.',
  'We shape identities for cultural organizations.',
  'We direct motion design for sports teams.',
  'We co-create tools to combat disinformation.',
  'We build platforms for graphic design festivals.',
  'We define communication strategies for energy providers.',
]

const title = 'We design and code for'

const baselinesMobile = [
  'the Olympic Games.',
  'jazz schools and venues.',
  'public institutions.',
  'cultural organisations.',
  'sports teams.',
  'media literacy.',
  'design festivals.',
  'energy providers.',
]

// ── Roll state ────────────────────────────────────────────────────────────────
const currentIndex     = ref(0)
const wrapperRef       = ref<HTMLElement | null>(null)
const mobileWrapperRef = ref<HTMLElement | null>(null)

function freezeHeight() {
  const el = wrapperRef.value
  if (el) el.style.height = `${el.offsetHeight}px`
}
function releaseHeight() {
  const el = wrapperRef.value
  if (el) el.style.height = ''
}
function freezeMobileHeight() {
  const el = mobileWrapperRef.value
  if (el) el.style.height = `${el.offsetHeight}px`
}
function releaseMobileHeight() {
  const el = mobileWrapperRef.value
  if (el) el.style.height = ''
}

// ── Use-case project ──────────────────────────────────────────────────────────
const usecaseProjects = computed<CMS_API_Page_projet[]>(() =>
  getProjectBySector('use-case', data.value?.result?.projects ?? [])
)
const usecaseProject = computed(() => usecaseProjects.value[0] ?? null)
const currentCover   = computed<CMS_API_ImageInstance | null>(() =>
  usecaseProject.value?.gallery?.[0] ?? null
)

const isVisible = ref(false)

// ── Card size ─────────────────────────────────────────────────────────────────
const CARD_SIZE = { w: 360, h: 270 } as const

function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

const R = 8
const svgPath = computed(() => {
  const w = CARD_SIZE.w, h = CARD_SIZE.h
  const r = Math.min(R, w / 2, h / 2)
  return [
    `M ${r} 0`, `H ${w - r}`, `Q ${w} 0 ${w} ${r}`,
    `V ${h - r}`, `Q ${w} ${h} ${w - r} ${h}`,
    `H ${r}`, `Q 0 ${h} 0 ${h - r}`,
    `V ${r}`, `Q 0 0 ${r} 0`, `Z`,
  ].join(' ')
})

const cardActive = ref(false)
let leaveTimer:  ReturnType<typeof setTimeout> | null = null
let cardMounting = false

const GAP = 12
const cardOffsetFrac = ref(0)
let offsetRafId: number | null = null
let offsetFrom = 0, offsetTo = 0, offsetStart: number | null = null
let currentSide: 'right' | 'left' = 'right'

function animateOffset(target: number, dur = 420) {
  if (offsetRafId !== null) cancelAnimationFrame(offsetRafId)
  offsetFrom  = cardOffsetFrac.value
  offsetTo    = target
  offsetStart = null
  offsetRafId = requestAnimationFrame(function step(now) {
    if (offsetStart === null) offsetStart = now
    const t = Math.min((now - offsetStart) / dur, 1)
    cardOffsetFrac.value = offsetFrom + (offsetTo - offsetFrom) * easeOutExpo(t)
    if (t < 1) offsetRafId = requestAnimationFrame(step)
    else offsetRafId = null
  })
}

const mousePos = reactive({ x: 0, y: 0 })

function onMouseMove(e: MouseEvent) {
  mousePos.x = e.clientX
  mousePos.y = e.clientY
  const newSide = mousePos.x < window.innerWidth / 2 ? 'left' : 'right'
  if (leaveTimer !== null) { clearTimeout(leaveTimer); leaveTimer = null }
  if (!isVisible.value) {
    currentSide          = newSide
    cardOffsetFrac.value = newSide === 'left' ? 1 : 0
    isVisible.value      = true
    cardMounting         = true
    nextTick(() => requestAnimationFrame(() => {
      cardMounting     = false
      cardActive.value = true
    }))
  } else {
    if (!cardActive.value && !cardMounting) cardActive.value = true
    if (newSide !== currentSide) {
      currentSide = newSide
      animateOffset(newSide === 'left' ? 1 : 0)
    }
  }
}

function onMouseLeave() {
  cardActive.value = false
  leaveTimer = setTimeout(() => { isVisible.value = false; leaveTimer = null }, 550)
}

function goToProject() {
  const slug = usecaseProject.value?.slug
  if (slug) navigateTo(`/works/${slug}`)
}

const anchorStyle = computed(() => ({
  position:      'fixed' as const,
  left:          `${mousePos.x}px`,
  top:           `${mousePos.y}px`,
  width:         '0',
  height:        '0',
  pointerEvents: 'none' as const,
  zIndex:        '200',
}))

const cardStyle = computed(() => {
  const tx = GAP - (CARD_SIZE.w + 2 * GAP) * cardOffsetFrac.value
  return {
    position:   'absolute' as const,
    left:       '0',
    top:        '0',
    width:      `${CARD_SIZE.w}px`,
    height:     `${CARD_SIZE.h}px`,
    opacity:    cardActive.value ? '1' : '0',
    transform:  `translate(${tx.toFixed(2)}px, ${GAP}px) scale(${cardActive.value ? 1 : 0.12})`,
    transition: 'opacity 0.3s ease, transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
  }
})

// ── Cycle ─────────────────────────────────────────────────────────────────────
let baselineInterval: ReturnType<typeof setInterval> | null = null

function startBaselineInterval() {
  if (baselineInterval !== null) return
  baselineInterval = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % baselines.length
  }, 3_500)
}
function stopBaselineInterval() {
  if (baselineInterval !== null) { clearInterval(baselineInterval); baselineInterval = null }
}
function onVisibilityChange() {
  document.hidden ? stopBaselineInterval() : startBaselineInterval()
}

onMounted(() => {
  startBaselineInterval()
  document.addEventListener('visibilitychange', onVisibilityChange)
})
onBeforeUnmount(() => {
  stopBaselineInterval()
  document.removeEventListener('visibilitychange', onVisibilityChange)
  if (offsetRafId !== null) cancelAnimationFrame(offsetRafId)
  if (leaveTimer  !== null) clearTimeout(leaveTimer)
})
</script>




<style lang="scss" scoped>
@use '~/assets/__params' as params;

.v-block-use-case {
  box-sizing: border-box;
  height: calc(100vh - (var(--app-row-gap) * 2));
  position: relative;
}

.v-block-use-case__inner {
  width: 100%;
  text-align: center;
  padding: 8rem 2rem 1rem;
  mix-blend-mode: difference;
  position: relative;
  z-index: 201;
  color: white;
}

.v-block-use-case__inner--desktop {
  @media (max-width: params.$break-point-reg) {
    display: none;
  }
}

.v-block-use-case__inner--mobile {
  display: none;

  @media (max-width: params.$break-point-reg) {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: calc(var(--app-header-height) / 2) 1.5rem 0;
    box-sizing: border-box;
  }
}

.v-block-use-case__title {
  margin: 0 auto;
  max-width: 25em;
}

.v-block-use-case__baseline-wrapper {
  margin-top: 0;
  position: relative;
  overflow: hidden;
}

.v-block-use-case__baseline {
  display: block;
  width: 100%;
}

// ── Mobile text ───────────────────────────────────────────────────────────────
.v-block-use-case__mobile-static,
.v-block-use-case__mobile-rolling {
  margin: 0;
  font-size: clamp(1.2rem, 6.5vw, 2rem);
  line-height: 1.2;
  letter-spacing: -0.02em;
  width: 100%;
  text-align: center;
}

.v-block-use-case__mobile-rolling {
  position: relative;
  overflow: hidden;
  margin-top: 0.1em;
}

// ── Card ──────────────────────────────────────────────────────────────────────
.v-block-use-case__card {
  box-shadow: 0 14px 44px rgba(0, 0, 0, 0.2);
}

.v-block-use-case__card-svg {
  display: block;
  position: absolute;
  inset: 0;
  overflow: visible;
  pointer-events: none;
  color: hsla(0, 0%, 70%, 0.5);
  z-index: 2;
}

.v-block-use-case__card-image {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: var(--app-media-radius);
}

.v-block-use-case__card-image img {
  display: block;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.v-block-use-case__card-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 14%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 0.65rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.88) 0%, transparent 100%);
  border-radius: 0 0 var(--app-media-radius) var(--app-media-radius);
  color: white;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  z-index: 3;
  pointer-events: none;
}


// ── Roll transition ───────────────────────────────────────────────────────────
.roll-enter-active { transition: transform 0.65s cubic-bezier(0.65, 0, 0.35, 1); }
.roll-enter-from   { transform: translateY(100%); }
.roll-enter-to     { transform: translateY(0); }
.roll-leave-active {
  transition: transform 0.65s cubic-bezier(0.65, 0, 0.35, 1);
  position: absolute;
  top: 0; left: 0; width: 100%;
}
.roll-leave-from { transform: translateY(0); }
.roll-leave-to   { transform: translateY(-100%); }
</style>
