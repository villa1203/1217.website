<template>
  <div class="v-block v-prestations">

    <!-- Block header -->
    <div
      v-if="block_data.content.title || block_data.content.text"
      class="v-prestations__header"
    >
      <h2
        v-if="block_data.content.title"
        class="v-prestations__header__title app-text-h3 app-text-h3--with-horizontal-correction"
      >{{ block_data.content.title }}</h2>
      <div v-if="block_data.content.text" v-html="block_data.content.text" />
    </div>

    <!-- Desktop: sticky stacking panels -->
    <div v-if="items.length" class="v-prestations__stack">
      <div
        v-for="(item, i) in items"
        :key="item.prestation_list_title"
        class="v-prestations__panel app-with-padding--left-right"
        :style="{ zIndex: i + 1 }"
      >
        <div class="v-prestations__panel__name">{{ item.prestation_list_title }}</div>

        <div class="v-prestations__panel__right">
          <div
            v-if="item.prestation_list_projects_linked?.length"
            class="v-prestations__panel__visual"
          >
            <div
              class="v-prestations__img-track"
              :style="{ transform: `translateX(-${(imageIndices[i] ?? 0) * 100}%)` }"
            >
              <img
                v-for="proj in item.prestation_list_projects_linked"
                :key="proj.slug"
                class="v-prestations__img"
                :src="proj.cover?.small?.url"
                :alt="proj.cover?.alt ?? proj.title"
              />
            </div>
          </div>

          <p v-if="item.prestation_list_description" class="v-prestations__panel__desc">
            {{ item.prestation_list_description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Mobile: accordion -->
    <div class="v-prestations__accordion">
      <div
        v-for="(item, i) in items"
        :key="`acc-${i}`"
        class="v-prestations__accordion__item"
        :class="{ 'is-open': openIndex === i }"
      >
        <button
          class="v-prestations__accordion__trigger"
          @click="openIndex = openIndex === i ? null : i"
        >
          <span class="v-prestations__accordion__label">{{ item.prestation_list_title }}</span>
          <span class="v-prestations__accordion__icon"><UIOpen /></span>
        </button>

        <Transition name="accordion">
          <div v-if="openIndex === i" class="v-prestations__accordion__body">
            <div
              v-if="item.prestation_list_projects_linked?.length"
              class="v-prestations__accordion__visual"
            >
              <div
                class="v-prestations__img-track"
                :style="{ transform: `translateX(-${(imageIndices[i] ?? 0) * 100}%)` }"
              >
                <img
                  v-for="proj in item.prestation_list_projects_linked"
                  :key="proj.slug"
                  class="v-prestations__img"
                  :src="proj.cover?.small?.url"
                  :alt="proj.cover?.alt ?? proj.title"
                />
              </div>
            </div>
            <p v-if="item.prestation_list_description" class="v-prestations__accordion__desc">
              {{ item.prestation_list_description }}
            </p>
          </div>
        </Transition>
      </div>
    </div>

  </div>
</template>


<script setup lang="ts">
import type { CMS_BlockPrestations } from '#shared/cms_api'
import UIOpen from '~/components/UIOpen.vue'

const props = defineProps<{ block_data: CMS_BlockPrestations }>()

const items = computed(() => props.block_data.content.prestation_list ?? [])

// ── Image auto-slide ──────────────────────────────────────────────────────────
const IMAGE_INTERVAL_MS = 3_000
const imageIndices = ref<number[]>([])

watch(items, (list) => {
  imageIndices.value = list.map(() => 0)
}, { immediate: true })

let slideTimer: ReturnType<typeof setInterval> | null = null

// ── Mobile accordion ──────────────────────────────────────────────────────────
const openIndex = ref<number | null>(null)

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  slideTimer = setInterval(() => {
    imageIndices.value = imageIndices.value.map((idx, i) => {
      const count = items.value[i]?.prestation_list_projects_linked?.length ?? 1
      return count > 1 ? (idx + 1) % count : 0
    })
  }, IMAGE_INTERVAL_MS)
})

onBeforeUnmount(() => {
  if (slideTimer !== null) { clearInterval(slideTimer); slideTimer = null }
})
</script>


<style lang="scss" scoped>
@use '~/assets/_params';

// ── Root: fill the flex item (Blocks.vue uses a flex row container) ───────────
.v-prestations {
  width: 100%;
}

// ── Block header ──────────────────────────────────────────────────────────────
.v-prestations__header {
  margin-bottom: var(--app-row-gap);
}

.v-prestations__header__title {
  margin: 0;
}

// ── Desktop: sticky stacking ──────────────────────────────────────────────────
// Negative margins escape the parent .app-blocks padding so the stack (and its
// sticky panels) span the full viewport width.
.v-prestations__stack {
  margin-left: calc(-1 * var(--app-grid-gap));
  margin-right: calc(-1 * var(--app-grid-gap));
  width: calc(100% + 2 * var(--app-grid-gap));

  @media (max-width: params.$break-point-reg) {
    display: none;
  }
}

.v-prestations__panel {
  position: sticky;
  top: 0;
  min-height: 100vh;
  box-sizing: border-box;
  background: var(--app-color-light);
  border-top: 1px solid var(--app-color-dark);

  display: grid;
  grid-template-columns: 1fr 35vw;
  align-items: start;
  gap: var(--app-grid-gap);
  padding-top: calc(var(--app-header-height) + var(--app-gutter));
  padding-bottom: var(--app-gutter);

  &:first-child {
    border-top: none;
  }
}

.v-prestations__panel__name {
  font-size: clamp(1.25rem, 2.5vw, 2.5rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0;
}

.v-prestations__panel__right {
  display: flex;
  flex-direction: column;
  gap: var(--app-grid-gap);
}

.v-prestations__panel__visual {
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: var(--app-media-radius);
}

.v-prestations__panel__desc {
  margin: 0;
  opacity: 0.6;
}

// ── Shared image slider (desktop + mobile) ────────────────────────────────────
.v-prestations__img-track {
  display: flex;
  height: 100%;
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.v-prestations__img {
  width: 100%;
  height: 100%;
  flex-shrink: 0;
  object-fit: cover;
}

// ── Mobile: accordion ─────────────────────────────────────────────────────────
.v-prestations__accordion {
  display: none;

  @media (max-width: params.$break-point-reg) {
    display: block;
  }
}

.v-prestations__accordion__item {
  border-top: 1px solid var(--app-color-dark);

  &:last-child {
    border-bottom: 1px solid var(--app-color-dark);
  }
}

.v-prestations__accordion__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  padding: 1rem 0;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}

.v-prestations__accordion__label {
  font-size: 1.15rem;
  font-weight: 500;
}

.v-prestations__accordion__icon {
  flex-shrink: 0;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);

  .is-open & {
    transform: rotate(45deg);
  }
}

.v-prestations__accordion__body {
  padding-bottom: 1.5rem;
}

.v-prestations__accordion__visual {
  overflow: hidden;
  border-radius: var(--app-media-radius);
  aspect-ratio: 4 / 3;
  margin-bottom: 0.75rem;
}

.v-prestations__accordion__desc {
  margin: 0;
  opacity: 0.6;
}

// ── Accordion open/close transition ──────────────────────────────────────────
.accordion-enter-active,
.accordion-leave-active {
  transition: opacity 0.3s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
