<template>
  <div v-if="visible" class="v-loader" :class="{ 'is-leaving': leaving }">

    <!-- ── Logo animation area ──────────────────────────────────────────────── -->
    <div class="v-loader__logo-area" :class="{ 'is-behind-sentences': sentencesVisible }">

      <!-- Phase 1: rapid character cycle, single centered mark -->
      <div class="v-loader__cycle-wrap" :class="{ 'is-visible': cycleVisible }">
        <!-- Scale lives on this wrapper; img swaps hard with no CSS transition -->
        <div class="v-loader__cycle-scaler" :style="{ transform: `scale(${cycleScale})` }">
          <img
            :src="`/loader/${cycleChar}.svg`"
            class="v-loader__cycle-mark"
            alt=""
          />
        </div>
      </div>

      <!-- Phase 2: full logo reveal -->
      <div class="v-loader__reveal-wrap" :class="{ 'is-visible': revealVisible }">
        <div class="v-loader__logo-clip">
        <div class="v-loader__logo-row" :class="{ 'is-expand': logoExpand, 'is-out': logoOut }">
          <div class="v-loader__bureau-clip">
            <img src="/loader/BUREAU.svg" class="v-loader__bureau" alt="" />
          </div>
          <div class="v-loader__digits">
            <img src="/loader/1.svg" class="v-loader__digit" alt="" />
            <img src="/loader/2.svg" class="v-loader__digit" alt="" />
            <img src="/loader/1.svg" class="v-loader__digit" alt="" />
            <img src="/loader/7.svg" class="v-loader__digit" alt="" />
          </div>
        </div>
        </div>
      </div>

    </div>

    <!-- ── Sentences area ───────────────────────────────────────────────────── -->
    <div class="v-loader__sentences-area" :class="{ 'is-visible': sentencesVisible }">
      <div class="v-loader__side v-loader__side--left">
        <div class="v-loader__clip">
          <span class="v-loader__word" :class="{ 'is-in': leftIn, 'is-out': leftOut }">creative office</span>
        </div>
      </div>
      <div class="v-loader__side v-loader__side--right">
        <div class="v-loader__clip">
          <span class="v-loader__word" :class="{ 'is-in': rightIn, 'is-out': rightOut }">identity, design &amp; development</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const loaderPending = useState('loader-pending', () => import.meta.server && route.path === '/')
const visible       = useState('loader-visible',  () => import.meta.server && route.path === '/')

let _played = false
const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

// ── Logo phase ─────────────────────────────────────────────────────────────────
// useState so SSR renders B visible immediately — no black flash on first paint
const cycleVisible   = useState('loader-cycle-visible', () => import.meta.server && route.path === '/')
const cycleChar      = ref('B')
const cycleScale     = ref(27 / 400) // ~baseScale at median viewport; corrected in onMounted
const revealVisible  = ref(false)
const logoExpand     = ref(false)
const logoOut        = ref(false)

// ── Sentences phase ────────────────────────────────────────────────────────────
const sentencesVisible = ref(false)
const leaving  = ref(false)
const leftIn   = ref(false)
const rightIn  = ref(false)
const leftOut  = ref(false)
const rightOut = ref(false)

onMounted(async () => {
  if (route.path !== '/' || _played) {
    visible.value       = false
    loaderPending.value = false
    return
  }
  _played = true

  // --logo-h: clamp(14px, 2vw, 27px) — digit size at current viewport
  const logoH     = Math.min(27, Math.max(14, window.innerWidth * 0.02))
  const baseScale = logoH / 400   // digit size — resting size for cycle and Phase 2 anchor

  // ── Phase 1: B at digit size, inhales to 3× peak, exhales back to digit size ──
  cycleScale.value = baseScale  // correct to exact digit size (SSR used approximation)
  await wait(300)               // B visible at digit size before inhale

  // rest → peak → rest: rest = baseScale (digit size), peak = 1.5× digit size
  const breathSteps = [
    { char: 'U', scale: baseScale * 1.08, ms: 80  },
    { char: 'R', scale: baseScale * 1.20, ms: 95  },
    { char: 'E', scale: baseScale * 1.33, ms: 110 },
    { char: 'A', scale: baseScale * 1.43, ms: 130 },
    { char: 'U', scale: baseScale * 1.50, ms: 155 }, // peak = 1.5× digit size
    { char: '1', scale: baseScale * 1.40, ms: 110 }, // exhale begins
    { char: '2', scale: baseScale * 1.28, ms: 95  },
    { char: '1', scale: baseScale * 1.15, ms: 75  },
    { char: '7', scale: baseScale * 1.04, ms: 100 },
    { char: '1', scale: baseScale,        ms: 0   }, // back to digit size — seamless Phase 2 handoff
  ]
  for (const step of breathSteps) {
    cycleChar.value  = step.char
    cycleScale.value = step.scale
    await wait(step.ms)
  }

  // ── Phase 2: reveal full logo ────────────────────────────────────────────────
  cycleVisible.value  = false
  revealVisible.value = true     // digit[0] '1' visible immediately as anchor

  logoExpand.value    = true     // trigger immediately — BUREAU slides left, 2·1·7 unfold right

  await wait(180)                // sentences start 350ms earlier — overlap with logo still sliding

  // ── Transition to sentences (logo still finishing / just settled) ─────────────
  sentencesVisible.value = true
  await wait(120)                // sentences appear quickly

  leftIn.value  = true           // both sides simultaneously
  rightIn.value = true

  await wait(2500)               // slide-in settle + hold

  leftOut.value  = true; leftIn.value  = false
  rightOut.value = true; rightIn.value = false
  logoOut.value  = true          // logo slides down with the sentences

  await wait(750)                // slide-out (0.65s) + buffer

  // Logo is still visible — fades with the whole loader
  leaving.value = true
  await wait(500)

  visible.value       = false
  loaderPending.value = false
})
</script>

<style lang="scss" scoped>
@use "~/assets/__params" as params;

.v-loader {
  // ── Tune these ────────────────────────────────────────────────────────────────
  --loader-font-size: 1.1rem;
  --logo-h: clamp(14px, 2vw, 27px);     // circle diameter; everything scales from this
  // ─────────────────────────────────────────────────────────────────────────────

  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #000;
  overflow: hidden;
  pointer-events: none;
  opacity: 1;
  transition: opacity 0.5s ease;

  &.is-leaving { opacity: 0; }
}

// ── Shared area base ───────────────────────────────────────────────────────────
.v-loader__logo-area,
.v-loader__sentences-area {
  position: absolute;
  inset: 0;
}

// ── Logo area ──────────────────────────────────────────────────────────────────
.v-loader__logo-area {
  opacity: 1;
  transition: opacity 0.25s ease;

  // On mobile: fade out logo when sentences are active (they'd overlap)
  @media (max-width: params.$break-point-reg) {
    &.is-behind-sentences { opacity: 0; }
  }
}

// ── Phase 1 cycle wrap — centered on screen, matches Phase 2 digit[3] anchor ──
.v-loader__cycle-wrap {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.13s ease;

  &.is-visible { opacity: 1; }
}

// ── Phase 2 reveal wrap — digit[0] (first '1') anchored at screen center ──────
// digit[0] center from row-left = BUREAU_w + gap + logo-h/2
//   = (0.58 × 60/11 + 0.5) × logo-h + 4px  ≈  3.664 × logo-h + 4px
.v-loader__reveal-wrap {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(calc(-3.664 * var(--logo-h) - 4px), -50%);
  opacity: 0;
  transition: opacity 0.13s ease;

  &.is-visible { opacity: 1; }
}

// ── Cycle scaler: continuous scale transition on container; img is a hard swap ─
.v-loader__cycle-scaler {
  transform-origin: center center;
  // cubic-bezier(0.4, 0, 0.2, 1) per reference spec; duration chases each step
  transition: transform 0.09s cubic-bezier(0.4, 0, 0.2, 1);
}

// 400×400px SVG base — NO transition; src changes are instant hard swaps
.v-loader__cycle-mark {
  display: block;
  width: 400px;
  height: 400px;
}

// ── Logo clip — hides logo-row as it slides down on exit (mirrors sentence clip) ─
.v-loader__logo-clip {
  overflow: hidden;
  padding-bottom: 2px;
  margin-bottom: -2px;
}

// ── Logo row: BUREAU + digit cluster — gap between them sits at screen center ──
.v-loader__logo-row {
  display: flex;
  align-items: center;
  gap: 4px;

  &.is-out {
    transform: translateY(130%);
    transition: transform 0.65s cubic-bezier(0.4, 0, 1, 1);
  }
}

// BUREAU clip container — overflow:hidden hides BUREAU while it's shifted right.
// The right edge of this container sits adjacent to digit[0], so BUREAU appears
// to slide out from behind digit[0] going left.
.v-loader__bureau-clip {
  overflow: hidden;
  display: block;
  flex-shrink: 0;
  width: calc(var(--logo-h) * 0.58 * 60 / 11);
  height: calc(var(--logo-h) * 0.58);
}

// BUREAU wordmark — starts shifted right by its own width (fully outside clip → invisible),
// slides left to natural position (fully inside clip → visible).
.v-loader__bureau {
  display: block;
  height: calc(var(--logo-h) * 0.58);
  width: calc(var(--logo-h) * 0.58 * 60 / 11); // BUREAU.svg viewBox 60×11
  transform: translateX(calc(var(--logo-h) * 0.58 * 60 / 11));
  transition: transform 0.65s cubic-bezier(0.19, 1, 0.22, 1) 0s;
}

.v-loader__logo-row.is-expand .v-loader__bureau {
  transform: translateX(0);
}

// Digit cluster — expands rightward from screen center
.v-loader__digits {
  display: flex;
  align-items: center;
}

// ── Per-digit unfold animation ─────────────────────────────────────────────────
// digit[0] (1) is the anchor — visible immediately when reveal-wrap fades in.
// digit[1,2,3] unfold rightward from digit[0] with staggered START but simultaneous END.
// Z-index: digit[0] on top (4) so later digits emerge from behind it.
.v-loader__digit {
  display: block;
  width: var(--logo-h);
  height: var(--logo-h);
  position: relative;
  opacity: 0;

  &:not(:first-child) {
    margin-left: calc(var(--logo-h) * -0.22); // ~22% overlap
  }
}

// digit[0] (1) — anchor, always visible (no transition, no translateX)
.v-loader__digit:nth-child(1) {
  z-index: 4;
  opacity: 1;
}

// digit[1] (2) — fires with BUREAU, full 0.65s for maximum tail visibility
.v-loader__digit:nth-child(2) {
  z-index: 3;
  transform: translateX(calc(var(--logo-h) * -0.78));
  transition:
    transform 0.65s cubic-bezier(0.19, 1, 0.22, 1) 0s,
    opacity   0.1s  ease                            0s;
}

// digit[2] (1) — 40ms later, same full duration
.v-loader__digit:nth-child(3) {
  z-index: 2;
  transform: translateX(calc(var(--logo-h) * -1.56));
  transition:
    transform 0.65s cubic-bezier(0.19, 1, 0.22, 1) 0.04s,
    opacity   0.1s  ease                            0.04s;
}

// digit[3] (7) — 80ms later, same full duration
.v-loader__digit:nth-child(4) {
  z-index: 1;
  transform: translateX(calc(var(--logo-h) * -2.34));
  transition:
    transform 0.65s cubic-bezier(0.19, 1, 0.22, 1) 0.08s,
    opacity   0.1s  ease                            0.08s;
}

// is-expand: digit[1,2,3] unfold right — burst open together, 80ms total spread
.v-loader__logo-row.is-expand .v-loader__digit:nth-child(2),
.v-loader__logo-row.is-expand .v-loader__digit:nth-child(3),
.v-loader__logo-row.is-expand .v-loader__digit:nth-child(4) {
  opacity: 1;
  transform: translateX(0);
}

// ── Sentences area ─────────────────────────────────────────────────────────────
.v-loader__sentences-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--app-gutter);
  box-sizing: border-box;
  opacity: 0;
  transition: opacity 0.2s ease;

  &.is-visible { opacity: 1; }
}

.v-loader__side {
  color: #fff;
  font-size: var(--loader-font-size);
}

.v-loader__side--right { text-align: right; }

.v-loader__clip {
  overflow: hidden;
  padding-bottom: 0.12em;
  margin-bottom: -0.12em;
}

.v-loader__word {
  display: block;
  transform: translateY(115%);
  transition:
    transform 1.1s cubic-bezier(0.16, 1, 0.3, 1),
    opacity   0.6s ease;

  &.is-in  { transform: translateY(0); }
  &.is-out { transform: translateY(115%); transition: transform 0.65s cubic-bezier(0.4, 0, 1, 1); }
}

// ── Mobile ─────────────────────────────────────────────────────────────────────
@media (max-width: params.$break-point-reg) {
  .v-loader__sentences-area {
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 0.4rem;
  }

  .v-loader__side--right { text-align: left; }
}
</style>
