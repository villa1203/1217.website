<template>
  <div class="v-block block-prestations">

    <div v-if="block_data.content.title || block_data.content.text"
         class="block-prestations__header app-grid app-grid--wrap"
    >
      <div v-if="block_data.content.title"
           class="app-grid__col-5 app-grid-reg__col-12 app-rm-child-margin"
      >
        <h2 class="app-text-h3 app-text-h3--with-horizontal-correction">{{ block_data.content.title }}</h2>
      </div>
      <div v-if="block_data.content.text"
           class="app-grid__col-7 app-grid-reg__col-12"
           v-html="block_data.content.text"
      />
    </div>

    <div class="block-prestations__list">
      <div class="block-prestations__item app-grid app-grid-reg--wrap"
           v-for="(item, index) of block_data.content.prestation_list"
           :key="item.prestation_list_title"
      >

        <div class="block-prestations__item__left app-grid__col-6 app-grid-reg__col-12">
          <div class="block-prestations__item__index">{{ String(index + 1).padStart(2, '0') }}</div>
          <div class="block-prestations__item__title app-text-strong">{{ item.prestation_list_title }}</div>
          <p v-if="item.prestation_list_description" class="block-prestations__item__description">
            {{ item.prestation_list_description }}
          </p>
        </div>

        <div class="app-grid__col-6 block-prestations__item__gallery app-grid-reg__col-12"
             :class="{
               'has-scroll': item.prestation_list_projects_linked?.length > 1,
               'reg-has-scroll': item.prestation_list_projects_linked?.length > 1,
               'hide-gradient': hideGradients[index],
             }"
        >
          <div class="app-grid app-grid--justify-end block-prestations__item__gallery__container app-grid-reg--justify-start"
               @scroll="(e) => onScroll(e, index)"
          >
            <template v-for="project of item.prestation_list_projects_linked" :key="project.slug">
              <img
                v-if="project.cover?.small?.url"
                class="block-prestations__item__visual app-grid__shrink-0 app-grid__col-7"
                :src="project.cover.small.url"
                :alt="project.cover?.alt ?? project.title"
              />
            </template>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { CMS_BlockPrestations } from "#shared/cms_api"

const props = defineProps<{
  block_data: CMS_BlockPrestations
}>()

const hideGradients = ref<Record<number, boolean>>({})

function onScroll(e: Event, index: number) {
  if (!(e.target instanceof HTMLElement)) return
  hideGradients.value[index] = e.target.scrollLeft > 250
}
</script>

<style lang="scss" scoped>
@use "~/assets/_params";

.block-prestations__header {
  margin-bottom: var(--app-row-gap-xs);
}

.block-prestations__list {
  width: 100%;
}

.block-prestations__item {
  border-top: 1px solid var(--app-color-dark);
  padding-top: var(--app-grid-gap);
  padding-bottom: var(--app-grid-gap);
}

.block-prestations__item__left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.block-prestations__item__index {
  font-size: 0.75rem;
  opacity: 0.4;
}

.block-prestations__item__title {
  font-size: 1rem;
}

.block-prestations__item__description {
  margin: 0;
  opacity: 0.6;
  max-width: 36em;
}

// ── Gallery — mirrors AppProjectsListItem ───────────────────────────────────

.block-prestations__item__gallery {
  position: relative;

  &.has-scroll::after {
    z-index: 5;
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: calc(100% / 5);
    height: 100%;
    transition: all .25s ease-in-out;
    background: linear-gradient(to left, var(--app-color-light) 0%, hsla(0, 0%, 100%, 0) 100%);
    pointer-events: none;
  }

  &.hide-gradient::after {
    transform: translateX(100%);
  }
}

.block-prestations__item__gallery__container {
  width: 100%;
  overflow: hidden;
  border-radius: var(--app-media-radius);

  .has-scroll & {
    overflow: scroll;
    justify-content: flex-start;
  }

  @media (max-width: params.$break-point-reg) {
    .reg-has-scroll & {
      overflow: scroll;
    }
  }
}

.block-prestations__item__visual {
  aspect-ratio: 16/9;
  object-fit: cover;
  border-radius: var(--app-media-radius);
}
</style>
