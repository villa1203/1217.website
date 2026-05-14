<template>
    <section class="v-block-use-case app-grid app-grid--align-center app-grid--justify-center"
    >
      <div class="v-block-use-case__inner">
        <h2 class="v-block-use-case__title">
          Bureau 1217 is a design and technology office.
        </h2>
        <h2 ref="wrapperRef" class="v-block-use-case__baseline-wrapper">
          <Transition name="roll" @before-leave="freezeHeight" @after-enter="releaseHeight">
            <span :key="currentIndex" class="v-block-use-case__baseline">{{ baselines[currentIndex] }}</span>
          </Transition>
        </h2>
      </div>

    </section>
</template>





<script setup lang="ts">
import type {CMS_API_Page_projet, CMS_API_Response, CMS_BlockData} from "#shared/cms_api";
import {KQL_PROJECTS_SELECT, KQL_QUERY_BLOCKS} from "#shared/KQLQueries";

type FetchData = CMS_API_Response & {
  "result": {
    "title": string,
    "slug": string,
    content: CMS_BlockData[],
    projects: CMS_API_Page_projet[]
  }
}


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

const baselines = [
  'We design interactive storytelling for the Olympic Games.',
  'We craft visual systems for jazz schools and venues.',
  'We create immersive experiences for public institutions.',
  'We shape identities for cultural organizations.',
  'We direct motion design for sports teams.',
  'We co-create tools to combat disinformation.',
  'We build platforms for graphic design festivals.',
  'We define communication strategies for energy providers.',
]

const currentIndex = ref(0)
const wrapperRef   = ref<HTMLElement | null>(null)

function freezeHeight() {
  const el = wrapperRef.value
  if (el) el.style.height = `${el.offsetHeight}px`
}
function releaseHeight() {
  const el = wrapperRef.value
  if (el) el.style.height = ''
}

onMounted(() => {
  setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % baselines.length
  }, 3_500)
})
</script>





<style lang="scss" scoped >
.v-block-use-case {
  box-sizing: border-box;
  height: calc(100vh - (var(--app-row-gap) * 2));
  position: relative;
}

// width: 100% freezes the flex-item width so the title above never reflows
.v-block-use-case__inner {
  width: 100%;
  text-align: center;
}

.v-block-use-case__title {
  margin: 0 auto;
  max-width: 25em;
}

// overflow: hidden is the clipping mask — text rolls within this window
.v-block-use-case__baseline-wrapper {
  margin-top: 0;
  position: relative;
  overflow: hidden;
}

.v-block-use-case__baseline {
  display: block;
  width: 100%;
}

// ── Slot-machine roll ─────────────────────────────────────────────────────────
// Both enter and leave share the exact same duration + easing so they stay
// locked together: leaving top + entering bottom always fill one wrapper-height.

$roll-timing: 0.65s cubic-bezier(0.65, 0, 0.35, 1);

.roll-enter-active { transition: transform $roll-timing; }
.roll-enter-from   { transform: translateY(100%); }
.roll-enter-to     { transform: translateY(0); }

.roll-leave-active {
  transition: transform $roll-timing;
  position: absolute;
  top: 0; left: 0; width: 100%;
}
.roll-leave-from { transform: translateY(0); }
.roll-leave-to   { transform: translateY(-100%); }
</style>
