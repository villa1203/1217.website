<template>
  <div class="v-block block-client-list">

    <div class="app-grid app-grid--wrap"
         :class="{
              'app-grid--justify-center': ! ( block_data.content.client_list.length < 9 ),
           }"
    >

      <div class="app-rm-child-margin app-grid-reg__col-12"
           :class="{
              'app-grid__col-5':      block_data.content.client_list.length < 9,
              'app-grid__col-12': ! ( block_data.content.client_list.length < 9 ),
           }"
      >
        <h2 class="app-text-h3 app-text-h3--with-horizontal-correction">{{block_data.content.title}}</h2>
      </div>

      <div class="app-grid-reg__col-12"
           :class="{
              'app-grid__col-7':      block_data.content.client_list.length < 9,
              'app-grid__col-8': ! ( block_data.content.client_list.length < 9 ),
           }"
      >
        <div class="app-block-client-list__clients app-grid app-grid--align-start app-grid--justify-start app-grid--wrap app-grid--without-gap">
          <div class="app-block-client-list__clients__item"
               :class="{
                'app-block-client-list__clients__item--without-logo': !client.logo,
                'app-block-client-list__clients__item--without-logo-negative': !client.logo_negative,
               }"
               v-for="client of block_data.content.client_list"
          >
            <div
              class="app-grid app-grid--align-center app-grid--justify-center app-aspect-ratio--1-1 app-block-client-list__clients__item__wrap"
              @mousemove="(e) => onMouseMove(e, client.slug)"
              @mouseleave="onMouseLeave"
            >
              <img class="block-client-list__logo"
                   v-if="client.logo?.reg.url"
                   :src="client.logo?.reg.url"
              />
              <img class="block-client-list__logo block-client-list__logo--negative"
                   v-if="client.logo_negative?.reg.url"
                   :src="client.logo_negative?.reg.url"
              />
              <div v-if="!client.logo_negative || !client.logo"
                   class="block-client-list__name"
              >{{client.title}}</div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!--
      Anchor: position:fixed at cursor + offset.
      The shell inside is translate(-50%,-50%) so the card is centered on this
      anchor point. As animW/animH morph, all four edges move symmetrically —
      the center stays pinned to the anchor while the sides extend or shrink.
    -->
    <div :style="anchorStyle">
      <div v-if="isVisible" class="block-client-list__hover-card" :style="shellStyle">

        <!--
          SVG border: path recalculated every rAF frame from animW/animH.
          overflow:visible so the stroke isn't clipped at the rect edges.
          vector-effect="non-scaling-stroke" keeps stroke 1 px at all times.
          fill="none" — purely geometric outline, no fill.
        -->
        <svg
          class="block-client-list__card-svg"
          :width="animW"
          :height="animH"
        >
          <path
            :d="svgPath"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            vector-effect="non-scaling-stroke"
          />
        </svg>

        <!--
          Image layer: overflow:hidden + border-radius clip the image to the
          same rounded rectangle. Images slide horizontally via Vue Transition
          (translateX only — no opacity animation).
          Vue freezes each departing vnode so the old img src is preserved
          through the full leave animation even though currentCover has moved on.
        -->
        <div class="block-client-list__card-image">
          <Transition name="img-slide">
            <img
              v-if="currentCover"
              :key="activeSlug ?? undefined"
              :src="currentCover.reg.url"
              :alt="currentCover.alt ?? ''"
            />
          </Transition>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { CMS_API_ImageInstance, CMS_API_Response, CMS_BlockClientList } from "#shared/cms_api"

const props = defineProps<{
  block_data: CMS_BlockClientList,
}>()

// ── CMS fetch (unchanged) ─────────────────────────────────────────────────────

type ProjectCoverData = CMS_API_Response & {
  result: {
    projects: {
      clients: { slug: string }[],
      cover: CMS_API_ImageInstance | null,
    }[]
  }
}

const { data: projectsData } = useFetch<ProjectCoverData>('/api/CMS_KQLRequest', {
  lazy: true,
  method: 'POST',
  body: {
    query: "page('projects')",
    select: {
      projects: {
        query: 'page.children',
        select: {
          clients: {
            query: 'page.clients.toPages',
            select: { slug: true },
          },
          cover: {
            query: "page.covers.toFiles.first",
            select: {
              alt:   "file.alt.value",
              tiny:  'file.resize(50, null, 10)',
              small: 'file.resize(500)',
              reg:   'file.resize(1280)',
              large: 'file.resize(1920)',
              xxl:   'file.resize(2500)',
            },
          },
        },
      },
    },
  },
})

const clientCoverMap = computed<Record<string, CMS_API_ImageInstance>>(() => {
  const map: Record<string, CMS_API_ImageInstance> = {}
  for (const project of projectsData.value?.result?.projects ?? []) {
    if (!project.cover) continue
    for (const client of project.clients ?? []) {
      if (client.slug && !map[client.slug]) map[client.slug] = project.cover
    }
  }
  return map
})

// ── Card sizes ────────────────────────────────────────────────────────────────

// Four clearly distinct proportions. The morph between them is always visible.
const CARD_SIZES: { w: number; h: number }[] = [
  { w: 235, h: 360 },   // portrait        2:3
  { w: 360, h: 320 },   // wide            ~9:8
  { w: 290, h: 340 },   // slight portrait ~6:7
  { w: 220, h: 420 },   // tall            ~1:1.9
]

function getSizeForSlug(slug: string): { w: number; h: number } {
  const idx = props.block_data.content.client_list.findIndex(c => c.slug === slug)
  return CARD_SIZES[(idx >= 0 ? idx : 0) % CARD_SIZES.length] ?? CARD_SIZES[0]!
}

// ── rAF morph animation ───────────────────────────────────────────────────────
//
// animW / animH are Vue refs so the template (SVG path + shellStyle) reacts to
// them on every frame. The animation loop is plain JS — no Vue scheduler.
//
// Parameters held in module-level variables so animateTo/morphStep share them
// without needing closures that capture stale values.

const animW = ref(2)
const animH = ref(2)

let rafId:     number | null = null
let fromW = 2, fromH = 2
let toW   = 2, toH   = 2
let morphDur   = 460
let morphStart: number | null = null
let onDone:  (() => void) | null = null

function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

function animateTo(
  targetW: number,
  targetH: number,
  duration = 460,
  onComplete?: () => void,
) {
  if (rafId !== null) cancelAnimationFrame(rafId)
  fromW      = animW.value
  fromH      = animH.value
  toW        = targetW
  toH        = targetH
  morphDur   = duration
  morphStart = null
  onDone     = onComplete ?? null
  rafId      = requestAnimationFrame(morphStep)
}

function morphStep(now: number) {
  if (morphStart === null) morphStart = now
  const t     = Math.min((now - morphStart) / morphDur, 1)
  const e     = easeOutExpo(t)
  animW.value = fromW + (toW - fromW) * e
  animH.value = fromH + (toH - fromH) * e
  if (t < 1) {
    rafId = requestAnimationFrame(morphStep)
  } else {
    rafId = null
    onDone?.()
    onDone = null
  }
}

onBeforeUnmount(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
})

// ── SVG path ─────────────────────────────────────────────────────────────────
//
// Single rounded-rect path recalculated each frame from animW/animH.
// Corners match var(--app-media-radius) = 0.5rem = 8px.
// Path structure is always identical so there is nothing to "morph" between
// different shapes — the path is simply redrawn from the current values.

const R = 8  // px — must match --app-media-radius

const svgPath = computed(() => {
  const w = animW.value
  const h = animH.value
  const r = Math.min(R, w / 2, h / 2)
  return [
    `M ${r} 0`,
    `H ${w - r}`,
    `Q ${w} 0 ${w} ${r}`,
    `V ${h - r}`,
    `Q ${w} ${h} ${w - r} ${h}`,
    `H ${r}`,
    `Q 0 ${h} 0 ${h - r}`,
    `V ${r}`,
    `Q 0 0 ${r} 0`,
    `Z`,
  ].join(' ')
})

// ── Mouse state ───────────────────────────────────────────────────────────────

const isVisible  = ref(false)
// activeSlug drives the displayed image. It is NOT reset on mouseleave so the
// last image stays visible (and correctly sized) during the shrink-to-exit anim.
const activeSlug = ref<string | null>(null)
const mousePos   = reactive({ x: 0, y: 0 })

const currentCover = computed<CMS_API_ImageInstance | null>(() => {
  const slug = activeSlug.value
  return slug !== null ? (clientCoverMap.value[slug] ?? null) : null
})

function onMouseMove(e: MouseEvent, slug?: string) {
  mousePos.x = e.clientX
  mousePos.y = e.clientY
  if (!slug) return

  if (!isVisible.value) {
    // First hover: appear by growing from a 2 px seed
    isVisible.value = true
    animW.value = 2
    animH.value = 2
  }

  if (slug !== activeSlug.value) {
    activeSlug.value = slug
    const { w, h } = getSizeForSlug(slug)
    animateTo(w, h)
  }
}

function onMouseLeave() {
  // Shrink back to a seed, then remove from DOM.
  // activeSlug is intentionally left intact so the image stays during exit.
  animateTo(2, 2, 220, () => {
    isVisible.value = false
  })
}

// ── Styles ────────────────────────────────────────────────────────────────────

// Zero-size anchor follows the cursor. Card shell is centered on this point via
// translate(-50%, -50%) so all four sides extend symmetrically during morph.
// Anchor sits at cursor with a tiny downward gap.
// The shell uses right:0 top:0 so its TOP-RIGHT corner aligns with the anchor,
// meaning the card appears to the lower-left of the cursor.
const anchorStyle = computed(() => ({
  position:      'fixed' as const,
  left:          `${mousePos.x}px`,
  top:           `${mousePos.y + 8}px`,
  pointerEvents: 'none' as const,
  zIndex:        '200',
}))

const shellStyle = computed(() => ({
  position: 'absolute' as const,
  right:    '0',
  top:      '0',
  width:    `${animW.value}px`,
  height:   `${animH.value}px`,
}))
</script>


<style lang="scss" scoped>
@use "~/assets/_params";

// ── Client grid ───────────────────────────────────────────────────────────────

.app-block-client-list__clients {
  width: 100%;
  box-sizing: border-box;
  border-top:  1px solid var(--app-color-dark);
  border-left: 1px solid var(--app-color-dark);

  &:hover .app-block-client-list__clients__item__wrap {
    opacity: 0.25;
  }
}

.app-block-client-list__clients__item {
  border-right:  1px solid var(--app-color-dark);
  border-bottom: 1px solid var(--app-color-dark);
  box-sizing: border-box;
  width: calc(100% / 4);
  background: var(--app-color-light);
  user-select: none;

  @media (max-width: params.$break-point-reg) {
    width: calc(100% / 2);
  }
}

.app-block-client-list__clients__item__wrap {
  position: relative;
  transition: opacity .5s cubic-bezier(0, .5, 1, 1);

  &:hover {
    opacity: 1 !important;
    background: hsla(0, 0%, 100%, 0.05);
  }
}

.block-client-list__logo {
  display: block;
  width: 60%;
  height: auto;
  opacity: 1;

  .app-body-drak-view & { opacity: 0; }

  &.block-client-list__logo--negative {
    position: absolute;
    opacity: 0;
    .app-body-drak-view & { opacity: 1; }
  }
}

.block-client-list__name {
  text-align: center;
  font-size: 2vw;
  line-height: 1.05em;
  color: black;
  position: absolute;
  display: none;

  .app-body-drak-view & { color: white; }

  .app-block-client-list__clients__item--without-logo & { display: block; }

  .app-body-drak-view .app-block-client-list__clients__item--without-logo-negative & {
    display: block;
  }
}

// ── Hover card ────────────────────────────────────────────────────────────────

// The shell itself has no overflow — it's purely a positioned container.
// Box-shadow is set here so it surrounds the image layer below.
.block-client-list__hover-card {
  // position + dimensions via shellStyle (inline)
  box-shadow: 0 14px 44px rgba(0, 0, 0, 0.2);
}

// SVG border drawn on top of the image.
// overflow:visible so the 1px stroke isn't clipped by the svg viewport edge.
// color inherits from the page text color (--app-color-dark via currentColor).
.block-client-list__card-svg {
  display: block;
  position: absolute;
  inset: 0;
  overflow: visible;
  pointer-events: none;
  color: var(--app-color-dark);
  z-index: 2;
}

// Image layer: clips to the same rounded rect as the SVG border.
// overflow:hidden + border-radius is the actual clip boundary for the images.
.block-client-list__card-image {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: var(--app-media-radius);

  img {
    display: block;
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

// ── Image slide ───────────────────────────────────────────────────────────────
// Previous image exits left, new image enters from right — simultaneously.
// Pure transform, no opacity. Vue freezes departing vnodes so old src is kept.

.img-slide-enter-active,
.img-slide-leave-active {
  transition: transform 0.46s cubic-bezier(0.16, 1, 0.3, 1);
}
.img-slide-enter-from { transform: translateX(100%);  }
.img-slide-leave-to   { transform: translateX(-100%); }
</style>
