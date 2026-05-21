<template>
  <section ref="sectionRef" class="v-research-hero">

    <div ref="innerRef" class="v-research-hero__inner">
      <h2 class="v-research-hero__title">
        Bureau 1217 turns research into design practice.
      </h2>
      <h2 ref="wrapperRef" class="v-research-hero__baseline-wrapper">
        <Transition name="roll" @before-leave="freezeHeight" @after-enter="releaseHeight">
          <span :key="sentenceIndex" class="v-research-hero__baseline">{{ baselines[sentenceIndex] }}</span>
        </Transition>
      </h2>
    </div>

    <div v-if="cardVisible" :style="anchorStyle">
      <div class="v-research-hero__card" :style="shellStyle">
        <svg
          class="v-research-hero__card-svg"
          :width="animW"
          :height="animH"
          :style="{ opacity: strokeVisible ? 1 : 0, transition: 'opacity 0.1s ease' }"
        >
          <path
            :d="svgPath"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            vector-effect="non-scaling-stroke"
          />
        </svg>
        <div class="v-research-hero__card-image">
          <div class="v-research-hero__card-image__inner" :style="innerWrapperStyle">
            <Transition name="img"
              @before-enter="onImgBeforeEnter"
              @enter="onImgEnter"
              @after-enter="onImgAfterEnter"
            >
              <img
                v-if="currentCover && !imgHidden"
                :key="projectIndex"
                :src="currentCover"
              />
            </Transition>
          </div>
        </div>
      </div>
    </div>

  </section>
</template>




<script setup lang="ts">
import type { CMS_API_Page_projet } from "#shared/cms_api"

const props = defineProps<{
  projects: CMS_API_Page_projet[]
  radius?:  number
}>()

// ── Baselines ─────────────────────────────────────────────────────────────────
const baselines = [
  'Workshops that test ideas collectively.',
  'Publications that structure knowledge.',
  'Prototypes that make research tangible.',
  'Ventures that move concepts into use.',
  'Systems that clarify complex decisions.',
  'Interfaces for ecological regeneration.',
  'Objects that question everyday rituals.',
  'Studies that shape future projects.',
]

// ── Roll transition (same as BlockUseCase) ────────────────────────────────────
const sentenceIndex = ref(0)
const wrapperRef    = ref<HTMLElement | null>(null)

function freezeHeight() {
  const el = wrapperRef.value
  if (el) el.style.height = `${el.offsetHeight}px`
}
function releaseHeight() {
  const el = wrapperRef.value
  if (el) el.style.height = ''
}

// ── Card sizes — morph between them like BlockClientList ──────────────────────
const CARD_SIZES = [
  { w: 270, h: 355 },
  { w: 370, h: 310 },
  { w: 305, h: 335 },
  { w: 265, h: 360 },
] as const

// ── Card morph (rAF) ──────────────────────────────────────────────────────────
const animW = ref(2)
const animH = ref(2)

let rafId: number | null = null
let fromW = 2, fromH = 2, toW = 2, toH = 2
let morphDur = 460, morphStart: number | null = null
let onDone: (() => void) | null = null

function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

function animateTo(targetW: number, targetH: number, dur = 460, onComplete?: () => void) {
  if (rafId !== null) cancelAnimationFrame(rafId)
  fromW = animW.value; fromH = animH.value
  toW = targetW; toH = targetH
  morphDur = dur; morphStart = null; onDone = onComplete ?? null
  rafId = requestAnimationFrame(morphStep)
}

function morphStep(now: number) {
  if (morphStart === null) morphStart = now
  const t = Math.min((now - morphStart) / morphDur, 1)
  const e = easeOutExpo(t)
  animW.value = fromW + (toW - fromW) * e
  animH.value = fromH + (toH - fromH) * e
  if (t < 1) rafId = requestAnimationFrame(morphStep)
  else { rafId = null; onDone?.(); onDone = null }
}

// ── SVG rounded-rect path ─────────────────────────────────────────────────────
const R = 8

const svgPath = computed(() => {
  const w = animW.value, h = animH.value
  const r = Math.min(R, w / 2, h / 2)
  return [
    `M ${r} 0`, `H ${w - r}`, `Q ${w} 0 ${w} ${r}`,
    `V ${h - r}`, `Q ${w} ${h} ${w - r} ${h}`,
    `H ${r}`, `Q 0 ${h} 0 ${h - r}`,
    `V ${r}`, `Q 0 0 ${r} 0`, `Z`,
  ].join(' ')
})

// ── Circle positioning ────────────────────────────────────────────────────────
const sectionRef = ref<HTMLElement | null>(null)
const innerRef   = ref<HTMLElement | null>(null)
const cardVisible = ref(false)
const anchorOffsetX = ref(0)
const anchorOffsetY = ref(0)

let currentAngle   = 0
let mounted        = false
let currentCardIdx = 0  // tracks which CARD_SIZE is active (non-reactive, only used during transitions)

// Returns { rx, ry } — the ellipse semi-axes sized to the viewport.
// Bottom 10% of viewport is forbidden; top gets a fixed pixel margin.
function getEllipse(cardW: number, cardH: number): { rx: number; ry: number } {
  const sw = sectionRef.value?.clientWidth  ?? 800
  const sh = sectionRef.value?.clientHeight ?? 600

  const edgeX       = 72               // horizontal clearance from edge
  const edgeTop     = 72               // top clearance (px)
  const edgeBottom  = sh * 0.10        // bottom 10% of viewport is forbidden

  let rx = sw / 2 - cardW / 2 - edgeX
  // Use the more restrictive of top or bottom constraint
  let ry = Math.min(
    sh / 2 - cardH / 2 - edgeTop,
    sh / 2 - cardH / 2 - edgeBottom   // = sh * 0.40 - cardH/2
  )

  if (props.radius !== undefined) {
    const aspect = rx / Math.max(ry, 1)
    ry = props.radius / Math.sqrt(1 + aspect * aspect)
    rx = aspect * ry
  }

  return { rx: Math.max(rx, 0), ry: Math.max(ry, 0) }
}

function pickNextAngle(): number {
  const min   = (Math.PI * 2) / 3
  const delta = min + Math.random() * min
  const sign  = Math.random() < 0.5 ? 1 : -1
  return currentAngle + sign * delta
}

// Ellipse position — no separate clamping needed; axes are already viewport-bounded
function ellipsePos(angle: number, cardW: number, cardH: number): { x: number; y: number } {
  const { rx, ry } = getEllipse(cardW, cardH)
  return { x: rx * Math.cos(angle), y: ry * Math.sin(angle) }
}

// ── Images ────────────────────────────────────────────────────────────────────
const projectIndex      = ref(0)
const isExiting         = ref(false)
const imgHidden         = ref(false)
const strokeVisible     = ref(true)
const exitTranslate     = ref('100%, 0')
const enterFromTranslate = ref('-100%, 0')

// One function derives both: exit = direction A→B normalised to ±100% at dominant axis.
// Enter-from = its exact negative (image arrives FROM the direction A was in).
function computeSlideVectors(ox: number, oy: number, nx: number, ny: number) {
  const dx = nx - ox, dy = ny - oy
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 1) return { exit: '100%, 0', enterFrom: '-100%, 0' }
  const ux = dx / len, uy = dy / len
  const s  = 1 / Math.max(Math.abs(ux), Math.abs(uy))
  const ex = ux * s * 100, ey = uy * s * 100
  return {
    exit:      `${ex.toFixed(2)}%, ${ey.toFixed(2)}%`,
    enterFrom: `${(-ex).toFixed(2)}%, ${(-ey).toFixed(2)}%`,
  }
}

// Inner wrapper drives exit slide only
const innerWrapperStyle = computed(() => {
  if (!isExiting.value) return {}
  return {
    transition: 'transform 0.28s cubic-bezier(0.4, 0, 1, 1)',
    transform:  `translate(${exitTranslate.value})`,
  }
})

// ── Image enter JS hooks — avoids CSS variable race ───────────────────────────
function onImgBeforeEnter(el: Element) {
  const img = el as HTMLElement
  img.style.opacity   = '0'
  img.style.transform = `translate(${enterFromTranslate.value})`
}
function onImgEnter(el: Element, done: () => void) {
  const img = el as HTMLElement
  // Force a reflow so the browser registers the initial state before transitioning
  void img.offsetWidth
  img.style.opacity   = ''
  img.style.transform = ''
  setTimeout(done, 220)
}
function onImgAfterEnter(el: Element) {
  const img = el as HTMLElement
  img.style.opacity   = ''
  img.style.transform = ''
}

const covers = computed(() =>
  props.projects.filter(p => p.cover?.reg?.url).map(p => p.cover!.reg.url)
)

const currentCover = computed<string | null>(() =>
  covers.value.length > 0
    ? (covers.value[projectIndex.value % covers.value.length] ?? null)
    : null
)

// ── Show initial card ─────────────────────────────────────────────────────────
function showCard() {
  const size          = CARD_SIZES[0]!
  const pos           = ellipsePos(currentAngle, size.w, size.h)
  anchorOffsetX.value = pos.x
  anchorOffsetY.value = pos.y
  currentCardIdx      = 0
  enterFromTranslate.value = '0%, 0%'  // first appearance: fade in from center
  animW.value = 2; animH.value = 2
  cardVisible.value   = true
  animateTo(size.w, size.h)
}

// ── Advance ───────────────────────────────────────────────────────────────────
// T=0   : image slides out of card canvas toward new position (0.42s)
//         card stays at current position, stroke hides
// T=420 : imgHidden=true prevents snap-back flash; nextTick: card teleports,
//         new image fades in, stroke reappears, card morphs to new size
let exitTimeout: ReturnType<typeof setTimeout> | null = null

function advance() {
  sentenceIndex.value = (sentenceIndex.value + 1) % baselines.length
  if (!cardVisible.value || covers.value.length === 0) return

  const nextProjIdx = (projectIndex.value + 1) % covers.value.length
  const nextCardIdx = (currentCardIdx + 1) % CARD_SIZES.length
  const nextSize    = CARD_SIZES[nextCardIdx]!
  const angle       = pickNextAngle()
  const pos         = ellipsePos(angle, nextSize.w, nextSize.h)

  const { exit, enterFrom } = computeSlideVectors(anchorOffsetX.value, anchorOffsetY.value, pos.x, pos.y)
  exitTranslate.value      = exit
  enterFromTranslate.value = enterFrom
  strokeVisible.value      = false
  isExiting.value          = true   // image begins sliding out of canvas

  if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null }

  if (exitTimeout !== null) clearTimeout(exitTimeout)
  exitTimeout = setTimeout(() => {
    // Hide old img before wrapper resets — prevents one-frame flash
    imgHidden.value = true

    nextTick(() => {
      // All in one flush: wrapper snaps back (invisible), card teleports,
      // new image mounts into enter-from (opacity:0), stroke reappears
      isExiting.value     = false
      anchorOffsetX.value = pos.x
      anchorOffsetY.value = pos.y
      currentAngle        = angle
      currentCardIdx      = nextCardIdx
      projectIndex.value  = nextProjIdx
      imgHidden.value     = false
      strokeVisible.value = true
      animateTo(nextSize.w, nextSize.h, 500)
    })
  }, 360)  // 80ms buffer after exit transition (0.28s) — prevents mid-slide cut on busy frames
}

// ── Styles ────────────────────────────────────────────────────────────────────
const anchorStyle = computed(() => ({
  position:      'absolute' as const,
  left:          '50%',
  top:           '50%',
  width:         '0',
  height:        '0',
  transform:     `translate(${anchorOffsetX.value}px, ${anchorOffsetY.value}px)`,
  pointerEvents: 'none' as const,
  zIndex:        '2',
}))

const shellStyle = computed(() => ({
  position:  'absolute' as const,
  left:      '0',
  top:       '0',
  transform: 'translate(-50%, -50%)',
  width:     `${animW.value}px`,
  height:    `${animH.value}px`,
}))

// ── Lifecycle ─────────────────────────────────────────────────────────────────
let interval: ReturnType<typeof setInterval> | null = null

function startInterval() {
  if (interval !== null) return
  interval = setInterval(advance, 4_500)
}

function stopInterval() {
  if (interval !== null) { clearInterval(interval); interval = null }
}

function onVisibilityChange() {
  if (document.hidden) {
    stopInterval()
  } else {
    startInterval()
  }
}

watch(covers, (list) => {
  if (list.length > 0 && !cardVisible.value && mounted) showCard()
})

onMounted(() => {
  mounted      = true
  currentAngle = Math.random() * Math.PI * 2
  if (covers.value.length > 0) showCard()
  startInterval()
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onBeforeUnmount(() => {
  stopInterval()
  document.removeEventListener('visibilitychange', onVisibilityChange)
  if (exitTimeout !== null) clearTimeout(exitTimeout)
  if (rafId !== null) cancelAnimationFrame(rafId)
})
</script>




<style scoped>
.v-research-hero {
  position: relative;
  box-sizing: border-box;
  height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow: hidden;
}

/* --hero-text-position: unitless number = vh from top (50 = centered, lower = higher up) */
.v-research-hero__inner {
  width: 100%;
  text-align: center;
  position: relative;
  z-index: 3;
  mix-blend-mode: difference;
  pointer-events: none;
  margin-top: calc(var(--hero-text-position, 50) * 1vh);
  transform: translateY(-50%);
}

.v-research-hero__title {
  margin: 0;
}

.v-research-hero__baseline-wrapper {
  margin-top: 0;
  position: relative;
  overflow: hidden;
}

.v-research-hero__baseline {
  display: block;
  width: 100%;
}

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

.v-research-hero__card {
  box-shadow: 0 14px 44px rgba(0, 0, 0, 0.5);
}

.v-research-hero__card-svg {
  display: block;
  position: absolute;
  inset: 0;
  overflow: visible;
  pointer-events: none;
  color: hsla(0, 0%, 70%, 0.5);
  z-index: 2;
}

.v-research-hero__card-image {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: var(--app-media-radius);
}

.v-research-hero__card-image__inner {
  position: absolute;
  inset: 0;
}

.v-research-hero__card-image__inner img {
  display: block;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-enter-active {
  transition: opacity 0.18s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.img-enter-from { opacity: 0; }
.img-enter-to   { opacity: 1; transform: translate(0%, 0%); }
.img-leave-active { transition: none; }
.img-leave-to     { opacity: 0; }
</style>
