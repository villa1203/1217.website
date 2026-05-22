<template>
  <main class="v-works"
  >
    <Transition name="works-gallery" appear :duration="3000">
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
// ── 1. AppRandomProjects — items grow from a dot in place (no strip fly-in)
// :duration="3000" on <Transition> keeps enter-active long enough for the stagger.
.works-gallery-enter-active .v-app-random-projects__item {
  animation: works-item-morph 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--item-index, 0) * 0.1s);
}

@keyframes works-item-morph {
  from {
    transform: scale(0.02);
    border-radius: 50%;
    opacity: 0;
  }
  to {
    transform: scale(1);
    border-radius: var(--app-media-radius);
    opacity: 1;
  }
}

// ── 2. AppProjectsList — rises up once items are appearing (delay 0.6s)
.works-list-enter-active {
  transition: transform 1.3s cubic-bezier(0.215, 0.61, 0.355, 1) 0.6s,
              opacity   1.1s ease 0.6s;
}
.works-list-enter-from {
  transform: translateY(50px);
  opacity: 0;
}
</style>
