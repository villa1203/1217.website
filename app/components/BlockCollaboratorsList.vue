<template>
  <div class="v-block block-collaborators-list">

    <div class="app-grid app-grid--wrap">

      <div class="app-grid__col-5 app-rm-child-margin app-grid-reg__col-12">
        <h2 class="app-text-h3 app-text-h3--with-horizontal-correction">{{ block_data.content.title }}</h2>
      </div>

      <div class="app-grid__col-7 app-grid-reg__col-12"></div>

      <div
        v-if="data?.result?.content"
        ref="listRef"
        class="app-grid__col-12 block-collaborators-list__collaborators"
      >
        <div
          v-for="(collaborator, i) of data?.result?.content"
          :key="i"
          class="block-collaborators-list__collaborators__item"
          :class="{ 'is-visible': visibleItems.has(i) }"
          :style="{ transitionDelay: `${i * 50}ms` }"
        >
          <div class="block-collaborators-list__name">{{ collaborator.first_name }} {{ collaborator.name }}</div>
          <div class="block-collaborators-list__competence">{{ collaborator.competences }}</div>
          <div class="block-collaborators-list__roles">{{ collaborator.roles }}</div>
          <div class="block-collaborators-list__city">{{ collaborator.ville }}</div>
          <div class="block-collaborators-list__date">{{ collaborator.date }}</div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import type { CMS_API_Response, CMS_CollaboratorsList } from '#shared/cms_api'

defineProps<{ block_data: CMS_CollaboratorsList }>()

type FetchData = CMS_API_Response & {
  result?: {
    title?: string
    slug?: string
    content?: {
      title?: string
      name?: string
      first_name?: string
      competences?: string
      roles?: string
      ville?: string
      date?: string
    }[]
  }
}

const { data } = useFetch<FetchData>('/api/CMS_KQLRequest', {
  lazy: true,
  method: 'POST',
  body: {
    query: `page('collaborators')`,
    select: {
      title: true,
      slug: true,
      content: {
        query: 'page.children',
        select: { title: true, name: true, first_name: true, competences: true, roles: true, ville: true, date: true },
      },
    },
  },
})

const listRef      = ref<HTMLElement>()
const visibleItems = ref<Set<number>>(new Set())
let observer: IntersectionObserver | null = null

function observeItems() {
  if (!listRef.value) return
  observer?.disconnect()
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const i = Number((entry.target as HTMLElement).dataset.itemIndex)
        visibleItems.value = new Set([...visibleItems.value, i])
        observer?.unobserve(entry.target)
      }
    }
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' })

  listRef.value.querySelectorAll('.block-collaborators-list__collaborators__item').forEach((el, i) => {
    (el as HTMLElement).dataset.itemIndex = String(i)
    observer?.observe(el)
  })
}

watch(data, async () => { await nextTick(); observeItems() })
onMounted(async () => { await nextTick(); observeItems() })
onUnmounted(() => { observer?.disconnect() })
</script>

<style lang="scss" scoped>
@use "../../app/assets/_params";

.block-collaborators-list {
  width: 100%;
}

.block-collaborators-list__collaborators {
  border-top: 1px solid var(--app-color-dark);
}

.block-collaborators-list__collaborators__item {
  display: grid;
  grid-template-columns: 2fr 2fr 2fr 1fr 1fr;
  column-gap: 0.4rem;
  row-gap: 0.15rem;
  align-items: baseline;
  border-bottom: 1px solid var(--app-color-dark);
  padding: 1rem 0;
  user-select: none;

  opacity: 0;
  transform: translateY(1.5rem);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);

  &.is-visible {
    opacity: 1;
    transform: translateY(0);
  }

  @media (max-width: params.$break-point-reg) {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "name date"
      "competence city";
  }
}

.block-collaborators-list__name {
  @media (max-width: params.$break-point-reg) { grid-area: name; }
}
.block-collaborators-list__competence {
  @media (max-width: params.$break-point-reg) { grid-area: competence; }
}
.block-collaborators-list__roles {
  @media (max-width: params.$break-point-reg) { display: none; }
}
.block-collaborators-list__city {
  text-align: right;
  @media (max-width: params.$break-point-reg) { grid-area: city; }
}
.block-collaborators-list__date {
  text-align: right;
  @media (max-width: params.$break-point-reg) { grid-area: date; }
}
</style>
