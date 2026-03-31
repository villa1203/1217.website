<template>
  <main class="v-works"
  >
    <AppRandomProjects
      v-if="data?.result?.projects"
      :projects="data.result.projects"
    />

    <div v-if="data?.result?.projects"
         class="app-with-padding--left-right v-works__container"
    >
      <AppProjectsList
        :filters="[
          {title: 'Art Direction', slug: 'art-direction'},
          {title: 'Visual Identity', slug: 'visual-identity'},
          {title: 'Motion Design', slug: 'motion-design'},
          {title: 'Brand Strategy', slug: 'brand-strategy'},
          {title: 'Web Development', slug: 'web-development'},
          {title: 'Web Design', slug: 'web-design'},
        ]"
        :projects="getProjectBySector('commercial' ,data.result.projects)"
      />
    </div>


  </main>
</template>


<script setup lang="ts">
import type {CMS_API_Page_projet, CMS_API_Response, CMS_BlockData} from "#shared/cms_api";
import {KQL_PROJECTS_SELECT, KQL_QUERY_BLOCKS} from "#shared/KQLQueries";
import {getProjectBySector} from "#shared/projects_utils";

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

const windowsScrollListener = () => {
  const blocksInPage = document.querySelectorAll('.v-works__container')

  const blockForToggleColor = blocksInPage[0]

  const landmarkValue = blockForToggleColor?.getBoundingClientRect().top ?  blockForToggleColor?.getBoundingClientRect().top - (window.innerHeight / 2) : null

  if( !landmarkValue ) return

  if(landmarkValue < 0) document.body?.classList.add('app-body-drak-view')
  else document.body?.classList.remove('app-body-drak-view')
}

onMounted(() => {
  window.addEventListener('scroll', windowsScrollListener)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', windowsScrollListener)
})

</script>


<style lang="scss" scoped>
.v-works {
}
</style>
