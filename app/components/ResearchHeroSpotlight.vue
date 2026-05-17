<template>
  <section
    ref="sectionRef"
    class="v-rh-spotlight"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    @click="onClick"
  >
    <!-- Black text — invisible on dark bg, revealed only through the white shape -->
    <div class="v-rh-spotlight__inner">
      <h2 class="v-rh-spotlight__title">
        Bureau 1217 turns research into design practice.
      </h2>
      <h2 ref="wrapperRef" class="v-rh-spotlight__baseline-wrapper">
        <Transition name="roll" @before-leave="freezeHeight" @after-enter="releaseHeight">
          <span :key="sentenceIndex" class="v-rh-spotlight__baseline">{{ baselines[sentenceIndex] }}</span>
        </Transition>
      </h2>
    </div>

    <!-- Large white shape: always centered, drifts slightly with mouse -->
    <svg
      class="v-rh-spotlight__shape"
      :style="shapeStyle"
      viewBox="-480 -480 960 960"
      aria-hidden="true"
    >
      <path :d="svgPath" />
    </svg>
  </section>
</template>




<script setup lang="ts">
// ── Shapes — 6 forms, 12 radial pts each (30° intervals, top → clockwise) ─────
// Radii in SVG units (viewBox -480→480). Each shape is geometrically computed:
//   Ellipse:   r(θ) = ab / √((b cosθ)² + (a sinθ)²)
//   Triangle:  r(θ) = R cos(π/3) / cos((θ mod 2π/3) - π/3)
//   Trefoil:   period = 4 pts (12/3), lobes at i=0,4,8
//   Cross:     period = 3 pts (12/4), arms at i=0,3,6,9
const SHAPES: number[][] = [

  // ① Circle — perfect observation, zero bias
  Array(12).fill(350),

  // ② Horizontal ellipse — scanning, breadth over depth
  // a=440 (wide), b=210 (narrow). r(θ) = ab/√((b cosθ)²+(a sinθ)²), θ starting top
  [210, 248, 368, 440, 368, 248, 210, 248, 368, 440, 368, 248],

  // ③ Equilateral triangle — thesis / structure / argument
  // circumradius R=420, straight-side polar: R cos(60°)/cos(θ mod 120° − 60°)
  [420, 242, 210, 242, 420, 242, 210, 242, 420, 242, 210, 242],

  // ④ Teardrop — distillation; knowledge condensing to a single point
  // Pointed at top (r=52), round at bottom (r=440), smooth flanks
  [52, 130, 270, 400, 438, 440, 440, 440, 438, 400, 270, 130],

  // ⑤ Trefoil — dialectic synthesis; three lobes at 12 / 4 / 8 o'clock
  // period = 4: lobe peak r=435 at i=0,4,8 — saddle r=108 between
  [435, 240, 108, 240, 435, 240, 108, 240, 435, 240, 108, 240],

  // ⑥ Rounded cross — compass rose; intersection of disciplines
  // period = 3: arm peak r=435 at i=0,3,6,9 — recess r=148 between
  [435, 148, 148, 435, 148, 148, 435, 148, 148, 435, 148, 148],
]

// ── Shape math — pure geometric tangential bezier ─────────────────────────────
// κ = (4/3)·tan(π/N): exact handle length so each arc segment matches a circular
// arc. Tangent direction = perpendicular to radius at each anchor.
function geometricClosedPath(radii: number[]): string {
  const n = radii.length
  const κ = (4 / 3) * Math.tan(Math.PI / n)
  const anchors = radii.map((r, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    return { x: r * Math.cos(a), y: r * Math.sin(a), r, a }
  })
  const first = anchors[0]!
  const d: string[] = [`M ${first.x.toFixed(2)},${first.y.toFixed(2)}`]
  for (let i = 0; i < n; i++) {
    const p1 = anchors[i]!
    const p2 = anchors[(i + 1) % n]!
    const h1 = κ * p1.r
    const cp1x = p1.x + h1 * (-Math.sin(p1.a))
    const cp1y = p1.y + h1 *   Math.cos(p1.a)
    const h2 = κ * p2.r
    const cp2x = p2.x - h2 * (-Math.sin(p2.a))
    const cp2y = p2.y - h2 *   Math.cos(p2.a)
    d.push(`C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`)
  }
  d.push('Z')
  return d.join(' ')
}

function easeOutExpo(t: number) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t) }

// ── Shape morph rAF — interpolate radii, recompute handles each frame ─────────
const currentRadii = ref<number[]>([...SHAPES[0]!])
const svgPath      = computed(() => geometricClosedPath(currentRadii.value))

let fromRadii:  number[]      = [...SHAPES[0]!]
let toRadii:    number[]      = [...SHAPES[0]!]
let morphRaf:   number | null = null
let morphStart: number | null = null
let shapeIdx = 0
const MORPH_DUR = 750   // ← morph animation duration (ms)
const CYCLE_MS  = 4_500 // ← shared interval: shape + sentence advance together

function morphTo(target: number[]) {
  if (morphRaf !== null) cancelAnimationFrame(morphRaf)
  fromRadii  = [...currentRadii.value]
  toRadii    = [...target]
  morphStart = null
  morphRaf   = requestAnimationFrame(function step(now) {
    if (morphStart === null) morphStart = now
    const t = Math.min((now - morphStart) / MORPH_DUR, 1)
    const e = easeOutExpo(t)
    currentRadii.value = fromRadii.map((from, i) => from + (toRadii[i]! - from) * e)
    if (t < 1) morphRaf = requestAnimationFrame(step)
    else morphRaf = null
  })
}

// ── Constrained position lerp ─────────────────────────────────────────────────
// Shape is pinned at section center by default (MAX_DRIFT = 0).
// Set MAX_DRIFT > 0 to let the mouse nudge the shape away from center.
const MAX_DRIFT = 80  // ← 0 = fully pinned; increase for more mouse drift range

const posX = ref(0)   // animated offset from center (px)
const posY = ref(0)
let targetX = 0
let targetY = 0
let posRaf: number | null = null

function startPosLoop() {
  if (posRaf !== null) return
  posRaf = requestAnimationFrame(posStep)
}

function posStep() {
  const dx = targetX - posX.value
  const dy = targetY - posY.value
  if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) {
    posX.value = targetX
    posY.value = targetY
    posRaf = null
    return
  }
  posX.value += dx * 0.08
  posY.value += dy * 0.08
  posRaf = requestAnimationFrame(posStep)
}

function clampOffset(val: number): number {
  return Math.max(-MAX_DRIFT, Math.min(MAX_DRIFT, val))
}

const shapeStyle = computed(() => ({
  transform: `translate(calc(-50% + ${posX.value.toFixed(2)}px), calc(-50% + ${posY.value.toFixed(2)}px))`,
}))

// ── Mouse tracking ─────────────────────────────────────────────────────────────
const sectionRef = ref<HTMLElement | null>(null)

function onMouseMove(e: MouseEvent) {
  const rect = sectionRef.value?.getBoundingClientRect()
  if (!rect) return
  const rawX = e.clientX - rect.left - rect.width  / 2
  const rawY = e.clientY - rect.top  - rect.height / 2
  targetX = clampOffset(rawX * 0.85)
  targetY = clampOffset(rawY * 0.85)
  startPosLoop()
}

function onMouseLeave() {
  targetX = 0
  targetY = 0
  startPosLoop()
}

// ── Baselines ──────────────────────────────────────────────────────────────────
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

// ── Unified cycle — shape + sentence advance on the same tick ─────────────────
let cycleInterval: ReturnType<typeof setInterval> | null = null

function startCycle() {
  if (cycleInterval !== null) return
  cycleInterval = setInterval(() => {
    sentenceIndex.value = (sentenceIndex.value + 1) % baselines.length
    shapeIdx = (shapeIdx + 1) % SHAPES.length
    morphTo(SHAPES[shapeIdx]!)
  }, CYCLE_MS)
}
function stopCycle() {
  if (cycleInterval !== null) { clearInterval(cycleInterval); cycleInterval = null }
}
function onVisibilityChange() {
  document.hidden ? stopCycle() : startCycle()
}

// ── Magnetic scroll ────────────────────────────────────────────────────────────
type SnapState = 'idle' | 'snapping' | 'done'
let snapState: SnapState = 'idle'
let snapTimer: ReturnType<typeof setTimeout> | null = null

function triggerSnap() {
  snapState = 'snapping'
  window.scrollTo({ behavior: 'smooth', top: window.innerHeight })
  if (snapTimer) clearTimeout(snapTimer)
  snapTimer = setTimeout(() => { snapState = 'done' }, 900)
}

function onClick() {
  if (snapState !== 'idle') return
  triggerSnap()
}

function handleWheel(e: WheelEvent) {
  if (snapState === 'snapping') { e.preventDefault(); return }
  if (snapState === 'done') { if (window.scrollY < 20) snapState = 'idle'; return }
  if (window.scrollY > 50 && window.scrollY < 100) {
    e.preventDefault()
    triggerSnap()
  }
}

// ── Lifecycle ──────────────────────────────────────────────────────────────────
onMounted(() => {
  startCycle()
  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('wheel', handleWheel, { passive: false })
})

onBeforeUnmount(() => {
  stopCycle()
  document.removeEventListener('visibilitychange', onVisibilityChange)
  window.removeEventListener('wheel', handleWheel)
  if (snapTimer)  clearTimeout(snapTimer)
  if (morphRaf !== null) cancelAnimationFrame(morphRaf)
  if (posRaf   !== null) cancelAnimationFrame(posRaf)
})
</script>




<style scoped>
.v-rh-spotlight {
  position: relative;
  box-sizing: border-box;
  /* Cancel the page's padding-top so the section spans exactly y=0 → y=100vh.
     overflow:hidden then clips the shape at true viewport edges, not below the nav. */
  margin-top: calc(-1 * var(--app-header-height));
  height: 100vh;
  background: black;
  overflow: hidden;
  cursor: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.v-rh-spotlight__inner {
  position: relative;
  z-index: 2;
  width: 100%;
  text-align: center;
  padding: calc(var(--app-header-height) / 2) 4rem 0;
  color: white;
  mix-blend-mode: difference;
  pointer-events: none;
}

.v-rh-spotlight__title { margin: 0; }

.v-rh-spotlight__baseline-wrapper {
  margin-top: 0;
  position: relative;
  overflow: hidden;
}

.v-rh-spotlight__baseline {
  display: block;
  width: 100%;
}

/* White shape — centered on the section, drifts with mouse via JS transform */
.v-rh-spotlight__shape {
  position: absolute;
  left: 50%;
  top: 50%;
  /* 100vmin: in landscape (vmin=vh) the shape radius touches viewport top/bottom exactly.
     In portrait (vmin=vw) it has vertical headroom. Horizontal bleed is clipped by
     the section's overflow:hidden and is intentional. */
  width: 100vmin;
  height: 100vmin;
  overflow: visible;
  pointer-events: none;
  z-index: 1;
  fill: var(--app-color-primary);
}

/* Roll transition */
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
