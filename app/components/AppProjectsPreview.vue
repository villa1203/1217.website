<template>
    <section class="v-app-last-projects-preview"
             ref="sectionRef"
    >
      <div class="app-grid app-grid--align-start app-grid--justify-start app-grid--wrap app-grid--wrap v-app-last-projects-preview__projects">
        <div v-for="(page, page_index) of pages"
             :class="{
                'app-grid__col-5': (page_index + 1) % 5 === 1 || (page_index + 1) % 5 === 4,
                'app-grid__col-7': (page_index + 1) % 5 === 2 || (page_index + 1) % 5 === 3,
                'is-full': (page_index + 1) % 5 === 0,
                'is-visible': visibleItems.has(page_index),
             }"
             :style="{ transitionDelay: rowStagger(page_index) }"
             class="v-app-last-projects-preview__projects__item app-grid-reg__col-12"
        >
          <AppProjectPreview
            :image="page.cover"
            :covers_video="page.covers_video?.url"
            :title="page.title"
            :baseline="page.baseline"
            :slug="page.slug"
            :services="page.services?.map(service => service.title)"
            :tag_dark_bg="page.tag_dark_bg"
          />
        </div>
      </div>
    </section>
</template>




<script setup lang="ts">
import type {CMS_API_Page_projet} from "#shared/cms_api";

const props = defineProps<{
  pages: CMS_API_Page_projet[]
}>()

// Second item in each row gets a stagger delay; full-width and first-in-row get none
function rowStagger(index: number): string {
  const pos = (index + 1) % 5
  return (pos === 2 || pos === 4) ? '150ms' : '0ms'
}

const sectionRef = ref<HTMLElement>()
const visibleItems = ref<Set<number>>(new Set())
let observer: IntersectionObserver | null = null

function observeItems() {
  if (!sectionRef.value) return
  observer?.disconnect()
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const index = Number((entry.target as HTMLElement).dataset.itemIndex)
        visibleItems.value = new Set([...visibleItems.value, index])
        observer?.unobserve(entry.target)
      }
    }
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' })

  sectionRef.value.querySelectorAll('.v-app-last-projects-preview__projects__item').forEach((el, i) => {
    (el as HTMLElement).dataset.itemIndex = String(i)
    observer?.observe(el)
  })
}

watch(() => props.pages, async () => {
  await nextTick()
  observeItems()
})

onMounted(async () => {
  await nextTick()
  observeItems()
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>




<style lang="scss" scoped >
@use '../assets/_params';

// ── Reveal timing ── adjust here ────────────────────────────────────────────
$reveal-duration: 0.6s;
$reveal-easing: cubic-bezier(0.16, 1, 0.3, 1);
// ────────────────────────────────────────────────────────────────────────────

.v-app-last-projects-preview__projects {
  row-gap: var(--app-row-gap);

  @media (max-width: params.$break-point-reg) {
    --app-row-gap: 5rem;
  }
}

.v-app-last-projects-preview__projects__item {
  border-radius: var(--app-media-radius);
  opacity: 0;
  transform: scale(0.88);
  transform-origin: center;
  transition: opacity $reveal-duration $reveal-easing,
              transform $reveal-duration $reveal-easing;

  &.is-visible {
    opacity: 1;
    transform: scale(1);
  }

  &.is-full {
    width: 100%;
  }

  @media (max-width: params.$break-point-reg) {
    width: 100%;
  }
}
</style>
