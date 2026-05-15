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
// ── 1. AppRandomProjects — strip sweeps in from right, items morph individually
//    ↓ tune these two values to control strip arrival feel
//    duration: how long the slide takes         → currently 3.0s
//    easing:   cubic-bezier(0.25, 1, 0.5, 1)   → easeOutQuart (gentler than Expo)
.works-gallery-enter-active {
  transition: transform 3.0s cubic-bezier(0.25, 1, 0.5, 1);
}
.works-gallery-enter-from {
  transform: translateX(100vw);
}

// Each item grows from a tiny pill to its card shape, staggered left→right
.works-gallery-enter-active .v-app-random-projects__item {
  animation: works-item-morph 1.2s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--item-index, 0) * 0.1s);
}

@keyframes works-item-morph {
  from {
    transform: scale(0.15);
    border-radius: 50%;
    opacity: 0;
  }
  to {
    transform: scale(1);
    border-radius: var(--app-media-radius);
    opacity: 1;
  }
}

// ── 2. AppProjectsList — rises up while gallery is still decelerating (delay 1.8s)
.works-list-enter-active {
  transition: transform 1.3s cubic-bezier(0.215, 0.61, 0.355, 1) 1.8s,
              opacity   1.1s ease 1.8s;
}
.works-list-enter-from {
  transform: translateY(50px);
  opacity: 0;
}
</style>
