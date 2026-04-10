<template>
    <section class="v-block-use-case app-grid app-grid--align-center app-grid--justify-center"
    >
      <h2>
        Bureau 1217 is design studio based on Geneva and Lyon
        <br><span>Baseline</span>
      </h2>

      <div v-if="data" class="v-block-use-case__projects">
        <template v-for="useCaseProject of getProjectBySector('use-case' ,data.result.projects)">
          <div class="v-block-use-case__projects__title app-button app-button--variant-primary">{{useCaseProject.title}}</div>
          <img :src="useCaseProject.miniature.reg.url" alt="">
        </template>
      </div>


    </section>
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

.v-block-use-case__projects__title {
  position: absolute;
  top: calc(100% / 3);
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
