<template>
  <div class="v-block block-collaborators-list app-with-padding--left-right">

    <div class="app-grid app-grid--wrap">

      <div class="app-grid__col-5 app-rm-child-margin app-grid-reg__col-12">
        <h2>{{block_data.content.title}}</h2>
      </div>

      <div class="app-grid__col-7 app-grid-reg__col-12">
        <div class="app-grid app-grid--align-start app-grid--justify-start app-grid--wrap app-grid--no-gap">
          {{data?.result}}
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import type {CMS_API_ImageInstance, CMS_API_Response, CMS_CollaboratorsList} from "#shared/cms_api"

defineProps<{
  block_data: CMS_CollaboratorsList,
}>()

type FetchData = CMS_API_Response & {
  "result"?: {
    "title"?: string,
    "slug"?: string,
    content?: {
      title?: string,
      logo?: CMS_API_ImageInstance
      logo_negative?: CMS_API_ImageInstance
    }[],
  }
}

const {data} = useFetch<FetchData>('/api/CMS_KQLRequest', {
  lazy: true,
  method: 'POST',
  body: {
    query: `page('collaborators')`,
    select: {
      title: true,
      slug: true,
      content: {
        query: 'page.children',
        select: {
          title: true,
          logo: {
            query: `page.logo.toFiles.first`,
            select: {
              alt: "file.alt.value",
              tiny: 'file.resize(50, null, 10)',
              small: 'file.resize(500)',
              reg: 'file.resize(1280)',
              large: 'file.resize(1920)',
              xxl: 'file.resize(2500)',
              focus: 'file.focus',
            }
          },
          logo_negative: {
            query: `page.logo_negative.toFiles.first`,
            select: {
              alt: "file.alt.value",
              tiny: 'file.resize(50, null, 10)',
              small: 'file.resize(500)',
              reg: 'file.resize(1280)',
              large: 'file.resize(1920)',
              xxl: 'file.resize(2500)',
              focus: 'file.focus',
            }
          },
        }
      },
    },
  },
})

</script>


<style lang="scss" scoped>
</style>
