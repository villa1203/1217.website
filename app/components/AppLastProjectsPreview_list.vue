<template>
    <section class="v-app-last-projects-preview"
    >
      <h2>{{title}}</h2>

      <div class="app-grid app-grid--align-start app-grid--justify-start app-grid--wrap">
        <div v-for="(project) in data?.result.projects"
             class="app-grid__col-3"
        >
          <AppProjectPreview__list
            :image="project.cover"
            :title="project.title"
            :baseline="project.baseline"
            :slug="project.slug"
          />
        </div>
      </div>

      <div class="app-grid app-grid--align-start app-grid--justify-start">
        <button>see more -></button>
      </div>
    </section>
</template>





<script setup lang="ts">
import type {CMS_API_ImageInstance, CMS_API_Response} from "#shared/cms_api";
import AppProjectPreview__list from "~/components/AppProjectPreview__list.vue";
import {defineProps} from "vue";

defineProps<{
  title: string,
  subtitle?: string,
}>()

type FetchData = CMS_API_Response & {
  "result": {
    "projects": {
      "title": string,
      "slug": string,
      baseline: string,
      cover: CMS_API_ImageInstance,
    }[]
  }
}

const {data, status} = await useFetch<FetchData>('/api/CMS_KQLRequest', {
  lazy: true,
  method: 'POST',
  body: {
    query: 'site',
    select: {
      projects: {
        query: "site.find('projets').children",
        select: {
          title: true,
          slug: true,
          baseline: true,
          cover: {
            query: 'page.covers.toFiles.first',
            select: {
              alt: "file.alt.value",
              tiny: 'file.resize(50, null, 10)',
              small: 'file.resize(500)',
              reg: 'file.resize(1280)',
              large: 'file.resize(1920)',
              xxl: 'file.resize(2500)',
              focus: 'file.focus'
            }
          },
          // content: {
          //   query: 'page.content.content.toBlocks',
          // },
          // pages_list_blocks: {
          //   query: "page.content.content.toBlocks.filterBy('type', 'pages_list')",
          //   select: {
          //     id: true,
          //     resolved_pages: {
          //       query: 'block.content.pages_liste.toPages',
          //       select: {
          //         id: true,
          //         title: true,
          //         slug: true,
          //         url: true,
          //       }
          //     }
          //   }
          // },
        }
      },
    }
  }
})


</script>





<style lang="scss" scoped >
.v-app-last-projects-preview {
}
</style>
