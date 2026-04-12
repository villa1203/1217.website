<template>
    <section class="v-block-use-case app-grid app-grid--align-center app-grid--justify-center"
    >
      <div>
        <h2 class="v-block-use-case__title">
          Bureau 1217 is design studio based on Geneva and Lyon
          <br>
        </h2>
        <h2 class="v-block-use-case__baseline-wrapper">
          <Transition name="roll">
            <div :key="currentIndex" class="v-block-use-case__baseline">{{ baselines[currentIndex] }}</div>
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
    'baseline 1',
    'baseline 2',
    'baseline 3',
]

const currentIndex = ref(0)

onMounted(() => {
  setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % baselines.length
  }, 2_000)
})
</script>





<style lang="scss" scoped >
.v-block-use-case {
  box-sizing: border-box;
  height: calc(100vh - (var(--app-row-gap) * 2) );
  text-align: center;
  position: relative;
}

.v-block-use-case__projects {
  position: absolute;
  bottom: var(--app-gutter);
  left: 50%;
  transform: translateX(-50%);

  img {
    height: 15vh;
  }
}

.v-block-use-case__title {
  margin-bottom: 0;
}

.v-block-use-case__baseline-wrapper {
  margin-top: 0;
  overflow: hidden;
  vertical-align: bottom;
  position: relative;
}

.v-block-use-case__baseline {
  display: inline-block;
}

.roll-enter-active {
  transition: transform 0.4s ease;
}
.roll-enter-from {
  transform: translateY(100%);
}
.roll-enter-to {
  transform: translateY(0);
}

.roll-leave-active {
  transition: transform 0.4s ease;
  position: absolute;
  left: 0;
  right: 0;
}
.roll-leave-from {
  transform: translateY(0);
}
.roll-leave-to {
  transform: translateY(-100%);
}

.v-block-use-case__projects__title {
  position: absolute;
  top: calc(100% / 3);
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
