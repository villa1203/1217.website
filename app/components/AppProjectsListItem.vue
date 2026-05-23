<template>
  <a :href="`/works/${project.slug}`"
     class="v-app-projects-list__item"
     :class="{ 'is-sibling': isSibling }"
     @click="handleClick"
  >

    <!-- Desktop: meta (left) + description (top right) -->
    <div class="v-app-projects-list__top">
      <div class="v-app-projects-list__meta">
        <div class="v-app-projects-list__row v-app-projects-list__labels">
          <div class="app-text-strong">Client</div>
          <div class="app-text-strong">Services</div>
          <div class="app-text-strong">Year</div>
        </div>
        <div class="v-app-projects-list__row v-app-projects-list__data">
          <div>{{ project.title }}</div>
          <div class="v-app-projects-list__services">
            <span
              v-for="(service, i) of project.services"
              :key="service.slug"
              class="v-app-projects-list__tag"
            >{{ service.title }}<template v-if="i < project.services.length - 1">,</template></span>
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
    <div ref="galleryRef" class="v-app-projects-list__gallery" :class="{ 'hide-gradient': hideGradient }">
      <div ref="containerRef" class="v-app-projects-list__gallery__container" @scroll="onScrollInGallery">
        <div
          v-for="(item, index) of galleryVisuals"
          :key="index"
          class="v-app-projects-list__visual-wrap"
        >
          <img
            class="v-app-projects-list__visual"
            :src="item.url"
            :alt="item.alt"
          />
        </div>
      </div>
    </div>

    <!-- Description below gallery on mobile -->
    <p class="v-app-projects-list__description--mobile">{{ project.baseline }}</p>

  </a>
</template>

<script setup lang="ts">
import type { CMS_API_Page_projet, CMS_BlockImageData, CMS_BlockGalleryData } from "#shared/cms_api"

const props = defineProps<{
  project: CMS_API_Page_projet
  isSibling?: boolean
}>()

const allVisuals = computed(() => {
  const seen = new Set<string>()
  const list: { url: string; alt?: string }[] = []

  const add = (url: string, alt?: string) => {
    if (url && !seen.has(url)) { seen.add(url); list.push({ url, alt }) }
  }

  // Cover first — matches the project page hero so the expand feels connected
  if (props.project.cover?.reg?.url) add(props.project.cover.reg.url, props.project.cover.alt ?? undefined)

  for (const img of (props.project.gallery ?? [])) {
    if (img.reg?.url && !img.reg.url.endsWith('.mp4')) add(img.reg.url, img.alt ?? undefined)
  }

  for (const block of (props.project.content ?? [])) {
    if (block.isHidden) continue
    if (block.type === 'image') {
      const img = (block as CMS_BlockImageData).content?.image
      if (img?.reg?.url) add(img.reg.url, img.alt ?? undefined)
    } else if (block.type === 'gallery') {
      for (const img of ((block as CMS_BlockGalleryData).content?.images ?? [])) {
        if (img?.reg?.url) add(img.reg.url, img.alt ?? undefined)
      }
    }
  }

  return list
})

const galleryRef   = ref<HTMLElement>()
const containerRef = ref<HTMLElement>()
const hideGradient = ref(false)

// Tripled list for seamless infinite scroll in both directions.
// Middle segment is the default view; loop resets keep scrollLeft there.
const galleryVisuals = computed(() => {
  const list = allVisuals.value
  return list.length > 1 ? [...list, ...list, ...list] : list
})

let loopResetting = false

onMounted(async () => {
  await nextTick()
  const el = containerRef.value
  if (el) el.scrollLeft = el.scrollWidth / 3   // start in the middle segment
})

// ── Per-instance animation state ───────────────────────────────────────────────
let animationToken  = 0
let activeOverlay: HTMLElement | null = null

function onScrollInGallery(e: Event) {
  if (loopResetting) return
  if (!(e.target instanceof HTMLElement)) return
  const el    = e.target
  const third = el.scrollWidth / 3

  // Seamless loop: when user reaches either boundary, teleport one segment over.
  // Suppressed while animationToken > 0 so the click animation isn't interrupted.
  if (animationToken === 0 && third > 0) {
    if (el.scrollLeft >= third * 2) {
      loopResetting = true; el.scrollLeft -= third; loopResetting = false
    } else if (el.scrollLeft < 50) {
      loopResetting = true; el.scrollLeft += third; loopResetting = false
    }
  }

  hideGradient.value = el.scrollLeft > 250
}

async function handleClick(e: MouseEvent) {
  e.preventDefault()
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
    window.open(`/works/${props.project.slug}`, '_blank')
    return
  }

  // ── Second click while animating: abort & navigate immediately
  if (animationToken > 0) {
    animationToken++
    activeOverlay?.remove(); activeOverlay = null
    return navigateTo(`/works/${props.project.slug}`)
  }

  const gallery   = galleryRef.value
  const container = containerRef.value

  if (!gallery || !container || !allVisuals.value.length) {
    return navigateTo(`/works/${props.project.slug}`)
  }

  // Cover is allVisuals[0]. In the tripled gallery it lives at index n (middle segment).
  // Single-visual galleries are not tripled, so index 0 is used instead.
  const n         = allVisuals.value.length > 1 ? allVisuals.value.length : 0
  const coverWrap = container.children[n] as HTMLElement | undefined
  if (!coverWrap) return navigateTo(`/works/${props.project.slug}`)

  animationToken++
  const myToken = animationToken

  // Preload the xxl cover in parallel with Act 1 so it's in cache before the overlay appears.
  const heroUrl  = props.project.cover?.xxl?.url
  const xxlReady = heroUrl
    ? new Promise<HTMLImageElement>(resolve => {
        const img = new Image()
        img.onload  = () => resolve(img)
        img.onerror = () => resolve(img)
        img.src = heroUrl
      })
    : Promise.resolve(null as unknown as HTMLImageElement)

  // ── Act 1: animate scrollLeft to center the cover in the strip.
  //    The gallery element never moves — other visuals stay visible on both sides.
  const containerRect    = container.getBoundingClientRect()
  const coverBcr         = coverWrap.getBoundingClientRect()
  const coverScrollLeft  = coverBcr.left - containerRect.left + container.scrollLeft
  const targetScrollLeft = coverScrollLeft - (container.clientWidth - coverWrap.offsetWidth) / 2

  const startScrollLeft  = container.scrollLeft
  const scrollDist       = targetScrollLeft - startScrollLeft
  const SLIDE_MS         = 1100

  await Promise.all([
    new Promise<void>(resolve => {
      const t0 = performance.now()
      ;(function tick() {
        const t     = Math.min((performance.now() - t0) / SLIDE_MS, 1)
        const eased = 1 - Math.pow(1 - t, 4) // easeOutQuart — confident, smooth deceleration
        container.scrollLeft = startScrollLeft + scrollDist * eased
        if (t < 1) requestAnimationFrame(tick)
        else resolve()
      })()
    }),
    xxlReady,
  ])

  await new Promise(r => setTimeout(r, 500)) // brief settle
  if (myToken !== animationToken) return

  // ── Act 2: body-level overlay positioned at the cover's current viewport rect.
  //    xxl is already cached → paints immediately, no black flash.
  const rect         = coverWrap.getBoundingClientRect()
  const videoEl      = coverWrap.querySelector('video')
  const preloadedImg = await xxlReady

  const overlay = document.createElement('div')
  Object.assign(overlay.style, {
    position:      'fixed',
    top:           `${rect.top}px`,
    left:          `${rect.left}px`,
    width:         `${rect.width}px`,
    height:        `${rect.height}px`,
    borderRadius:  getComputedStyle(coverWrap).borderRadius,
    overflow:      'hidden',
    zIndex:        '999',
    pointerEvents: 'none',
  })

  if (preloadedImg?.src) {
    Object.assign(preloadedImg.style, { display: 'block', width: '100%', height: '100%', objectFit: 'cover' })
    overlay.appendChild(preloadedImg)
  } else if (videoEl) {
    const clone = videoEl.cloneNode(true) as HTMLVideoElement
    Object.assign(clone.style, { display: 'block', width: '100%', height: '100%', objectFit: 'cover' })
    clone.muted = true; clone.autoplay = true; clone.loop = true; clone.playsInline = true
    overlay.appendChild(clone)
    clone.play().catch(() => {})
  }

  // Suppress the app.vue page transition (leave 0.3s + enter 0.4s in out-in mode)
  // while our overlay is the visual — otherwise the new page fades in at partial
  // opacity and conflicts with the overlay removal.
  const noTransitionStyle = document.createElement('style')
  noTransitionStyle.textContent = '.page-leave-active,.page-enter-active{transition:none!important}.page-enter-from{opacity:1!important}'
  document.head.appendChild(noTransitionStyle)

  // Gallery stays translated — overlay covers it; navigation unmounts it anyway
  activeOverlay = overlay
  document.body.appendChild(overlay)
  overlay.offsetHeight // force paint before transition

  // ── Act 3: expand from cover's gallery position to full viewport
  const easeExpand = 'cubic-bezier(0.76, 0, 0.24, 1)'
  const d = '1.4s'
  overlay.style.transition   = `top ${d} ${easeExpand}, left ${d} ${easeExpand}, width ${d} ${easeExpand}, height ${d} ${easeExpand}, border-radius ${d} ${easeExpand}`
  overlay.style.top          = '0'
  overlay.style.left         = '0'
  overlay.style.width        = '100vw'
  overlay.style.height       = '100vh'
  overlay.style.borderRadius = '0'

  await new Promise(r => setTimeout(r, 1500))
  if (myToken !== animationToken) { overlay.remove(); activeOverlay = null; noTransitionStyle.remove(); return }

  activeOverlay = null

  // ── Act 4: navigate (page transitions suppressed → instant, invisible under overlay),
  //    then poll until the project hero image is in the DOM, decoded, and painted.
  await navigateTo(`/works/${props.project.slug}`)

  await new Promise<void>(resolve => {
    const giveUp = setTimeout(resolve, 8000)

    function check() {
      const hero = document.querySelector('.v-projet-slug__img') as HTMLImageElement | null
      if (!hero) { requestAnimationFrame(check); return }

      const done = () => { clearTimeout(giveUp); requestAnimationFrame(() => requestAnimationFrame(resolve)) }
      if (hero.complete && hero.naturalHeight !== 0) { done(); return }
      hero.addEventListener('load',  done, { once: true })
      hero.addEventListener('error', () => { clearTimeout(giveUp); resolve() }, { once: true })
      if (hero.complete && hero.naturalHeight !== 0) done() // race-condition guard
    }

    check()
  })

  // ── Act 5: hero and overlay show identical xxl at full viewport size/crop
  //    — instant swap, zero flicker. Restore page transitions.
  overlay.remove()
  noTransitionStyle.remove()
  animationToken = 0
}
</script>

<style lang="scss" scoped>
@use "../assets/_params";

.v-app-projects-list__item {
  border-top: 1px solid var(--app-color-dark);
  border-bottom: 1px solid transparent;
  padding-top: var(--app-gutter);
  padding-bottom: var(--app-gutter);
  color: inherit;
  text-decoration: inherit;
  display: flex;
  flex-direction: column;
  gap: var(--app-grid-gap);
  transition: opacity 0.7s ease, border-bottom-color 0.2s ease;

  &.is-sibling {
    opacity: 0;
  }

  &:not(.is-sibling):hover {
    border-bottom-color: var(--app-color-dark);
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
  grid-template-columns: repeat(3, 1fr);
  column-gap: var(--app-grid-gap);
  align-items: start;
}

.v-app-projects-list__services {
  display: flex;
  flex-wrap: wrap;
  gap: var(--app-grid-gap-xs);
}

.v-app-projects-list__tag {
  white-space: nowrap;
}

.v-app-projects-list__description {
  margin: 0;
  opacity: 1;
  color: inherit;
}

.v-app-projects-list__description--mobile {
  display: none;

  @media (max-width: params.$break-point-reg) {
    display: block;
    margin: 0;
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
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .25);

  @media (max-width: params.$break-point-reg) {
    height: clamp(120px, 25vh, 280px);
  }
}

.v-app-projects-list__visual {
  display: block;
  height: 100%;
  width: auto;
  object-fit: cover;
  border-radius: var(--app-media-radius);
}
</style>
