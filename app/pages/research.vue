<template>
  <main class="v-research">

    <ResearchHeroSpotlight />

    <div v-if="data?.result?.projects"
         ref="gridRef"
         class="v-research__grid app-with-padding--left-right"
    >
      <h2 class="v-research__title app-text-h3 app-text-h3--with-horizontal-correction">Ongoing Research</h2>
      <nuxt-link
        v-for="(project, i) of getProjectBySector('research', data.result.projects)"
        :key="project.slug"
        :to="`/works/${project.slug}`"
        class="v-research__card"
        :class="{ 'is-visible': visibleCards.has(i) }"
        :style="{ transitionDelay: `${(i % 3) * CARD_STAGGER_MS}ms` }"
      >
        <button v-if="project.services?.[0]" class="v-research__card__tag">
          {{ project.services[0].title }}
        </button>
        <div class="v-research__card__media">
          <video
            v-if="project.covers_video?.url"
            class="v-research__card__cover"
            muted autoplay loop playsinline
            :src="project.covers_video.url"
          />
          <img
            v-else-if="project.cover"
            class="v-research__card__cover"
            :src="project.cover.reg.url"
            :alt="project.title"
          />
        </div>
        <div class="v-research__card__text">
          <h2 class="v-research__card__title app-text-reg app-text-strong app-no-margin">{{ project.title }}</h2>
          <p class="v-research__card__description">{{ project.baseline }}</p>
        </div>
      </nuxt-link>
    </div>

  </main>
</template>


<script setup lang="ts">
import type {CMS_API_Page_projet, CMS_API_Response, CMS_BlockData} from "#shared/cms_api";
import {KQL_PROJECTS_SELECT, KQL_QUERY_BLOCKS} from "#shared/KQLQueries";
import {getProjectBySector} from "#shared/projects_utils";
import ResearchHeroSpotlight from "~/components/ResearchHeroSpotlight.vue";

type FetchData = CMS_API_Response & {
  "result": {
    "title": string,
    "slug": string,
    content: CMS_BlockData[],
    projects: CMS_API_Page_projet[]
  }
}

useHead({ bodyAttrs: { class: 'v-research-active' } })

const {data} = useFetch<FetchData>('/api/CMS_KQLRequest', {
  lazy: true,
  method: 'POST',
  body: {
    query: `page('projects')`,
    select: {
      title: true,
      slug: true,
      projects: {
        query: 'page.children',
        select: KQL_PROJECTS_SELECT,
      },
      content: KQL_QUERY_BLOCKS
    }
  }
})

// ── Reveal animation timing ──────────────────────────────────────────────────
// Duration is controlled by --card-reveal-duration in the scoped CSS below.
const CARD_STAGGER_MS = 150  // delay between columns (ms)
// ─────────────────────────────────────────────────────────────────────────────

const visibleCards = ref<Set<number>>(new Set())
const gridRef = ref<HTMLElement>()
let observer: IntersectionObserver | null = null

function observeCards() {
  if (!gridRef.value) return
  observer?.disconnect()
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const index = Number((entry.target as HTMLElement).dataset.cardIndex)
        visibleCards.value = new Set([...visibleCards.value, index])
        observer?.unobserve(entry.target)
      }
    }
  }, { threshold: 0.1 })

  gridRef.value.querySelectorAll('.v-research__card').forEach((card, i) => {
    (card as HTMLElement).dataset.cardIndex = String(i)
    observer?.observe(card)
  })
}

watch(data, async () => {
  await nextTick()
  observeCards()
})

onMounted(async () => {
  await nextTick()
  observeCards()
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>


<style lang="scss" scoped>
@use '../assets/_params';

.v-research {
  // Override color tokens so all child components adapt without body class
  --app-color-light: #000;
  --app-color-dark: #fff;
  background: black;
  color: white;
  padding-top: var(--app-header-height);
  min-height: 100svh;
}

.v-research__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--app-grid-gap);
  padding-top: var(--app-header-height);
  padding-bottom: 10rem;

  @media (max-width: params.$break-point-reg) {
    grid-template-columns: 1fr;
    row-gap: 3rem;
  }
}

.v-research__title {
  grid-column: 1 / -1;
  margin: 0 0 var(--app-grid-gap);
}

.v-research__card {
  color: inherit;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
  opacity: 0;
  transform: translateY(2rem);
  transition: opacity 0.7s cubic-bezier(0.25, 0, 0, 1), transform 0.7s cubic-bezier(0.25, 0, 0, 1);

  &.is-visible {
    opacity: 1;
    transform: translateY(0);
  }
}

.v-research__card__tag {
  position: absolute;
  top: var(--app-gutter);
  left: var(--app-gutter);
  z-index: 1;
  --tag-glass-bg: hsla(0, 0%, 45%, 0.409);
  background: var(--tag-glass-bg);

  @media (max-width: params.$break-point-reg) {
    top: 0.5rem;
    left: 0.5rem;
    padding: 0.35rem 0.6rem;
  }
}

.v-research__card__text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.v-research__card__title {
  margin: 0;
}

.v-research__card__media {
  border-radius: var(--app-media-radius);
  overflow: hidden;
  transition: border-radius 5s cubic-bezier(0, .25, 0, 1);

  .v-research__card:hover & {
    border-radius: 0;
  }
}

.v-research__card__cover {
  display: block;
  width: 100%;
  aspect-ratio: 4/5;
  object-fit: cover;
  transition: transform 15s cubic-bezier(0, .25, 0, 1);

  .v-research__card:hover & {
    transform: scale(1.05);
  }
}

.v-research__card__description {
  margin: 0;
  opacity: 0.6;
  font-size: 0.9rem;
}
</style>

<style lang="scss">
body.v-research-active {
  background: black;
}
</style>
