<template>
  <main class="v-works"
  >
    <Transition name="works-gallery" appear>
      <AppRandomProjects
        v-if="data?.result?.projects"
        :projects="data.result.projects"
      />
    </Transition>

    <Transition name="works-list" appear>
      <div v-if="data?.result?.projects"
           class="app-with-padding--left-right v-works__container"
      >
        <AppProjectsList
          :hide-filters="true"
          :filters="[
            {title: 'Art Direction', slug: 'art-direction'},
            {title: 'Visual Identity', slug: 'visual-identity'},
            {title: 'Brand Strategy', slug: 'brand-strategy'},
            {title: 'Web Development', slug: 'web-development'},
            {title: 'Web Design', slug: 'web-design'},
          ]"
          :projects="getProjectBySector('commercial' ,data.result.projects)"
        />
      </div>
    </Transition>


  </main>
</template>


<script setup lang="ts">
import type {CMS_API_Page_projet, CMS_API_Response, CMS_BlockData} from "#shared/cms_api";
import {KQL_PROJECTS_SELECT, KQL_QUERY_BLOCKS} from "#shared/KQLQueries";
import {getProjectBySector} from "#shared/projects_utils";
import {windowsScrollListener} from "~/utils/windowsScrollListener";

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

const listener = () => windowsScrollListener('.v-app-projects-list__item', 2)

onMounted(() => {
  window.addEventListener('scroll', listener)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', listener)
})

</script>


<style lang="scss" scoped>
.v-works {}
</style>

<style lang="scss">
// ── 1. AppRandomProjects — cinematic sweep from right
//    easeOutExpo: fast entry, dramatic deceleration to a precise stop
.works-gallery-enter-active {
  transition: transform 2.0s cubic-bezier(0.19, 1, 0.22, 1),
              opacity   0.8s ease;
}
.works-gallery-enter-from {
  transform: translateX(100vw);
  opacity: 0;
}

// ── 2. AppProjectsList — elegant rise after gallery settles (delay 1.9s)
//    easeOutCubic: smooth, refined, not overdone
.works-list-enter-active {
  transition: transform 1.3s cubic-bezier(0.215, 0.61, 0.355, 1) 1.9s,
              opacity   1.1s ease 1.9s;
}
.works-list-enter-from {
  transform: translateY(50px);
  opacity: 0;
}
</style>
