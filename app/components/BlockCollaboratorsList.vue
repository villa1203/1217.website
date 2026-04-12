<template>
  <div class="v-block block-collaborators-list">

    <div class="app-grid app-grid--wrap">

      <div class="app-grid__col-5 app-rm-child-margin app-grid-reg__col-12">
        <h2>{{block_data.content.title}}</h2>
      </div>

      <div class="app-grid__col-7 app-grid-reg__col-12"
      >
      </div>


      <div class="app-grid__col-12 block-collaborators-list__collaborators"
           v-if="data?.result?.content"
      >
        <div class="app-grid app-grid--align-start app-grid--justify-start app-grid--no-gap block-collaborators-list__collaborators__item"
             v-for="collaborator of data?.result?.content"
        >
          <div class="block-collaborators-list__collaborators__first_name">{{collaborator.first_name}} - {{collaborator.name}}</div>
          <div class="block-collaborators-list__collaborators__competences">{{collaborator.competences}}</div>
          <div class="block-collaborators-list__collaborators__roles">{{collaborator.roles}}</div>
          <div class="block-collaborators-list__collaborators__city">{{collaborator.ville}}</div>
          <div class="block-collaborators-list__collaborators__date">{{collaborator.date}}</div>
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
      name?: string
      first_name?: string
      competences?: string
      roles?: string
      ville?: string
      date?: string
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
          name: true,
          first_name: true,
          competences: true,
          roles: true,
          ville: true,
          date: true,
        }
      },
    },
  },
})

</script>


<style lang="scss" scoped>

.block-collaborators-list {
  width: 100%;
}

.block-collaborators-list__collaborators {
  border-top: 1px solid var(--app-color-dark);
}

.block-collaborators-list__collaborators__item {
  border-bottom: 1px solid var(--app-color-dark);
  padding: 2rem 0;
  user-select: none;
}

.block-collaborators-list__collaborators__first_name {
  width: calc(100%/4*1);
  flex-shrink: 1;
}

.block-collaborators-list__collaborators__competences {
  width: calc(100%/4*1);
  flex-shrink: 1;
}

.block-collaborators-list__collaborators__roles {
  width: calc(100%/4*1);
  flex-shrink: 1;
}

.block-collaborators-list__collaborators__city {
  width: calc(100%/4*1);
  flex-shrink: 1;
}

.block-collaborators-list__collaborators__date {
  text-align: right;
  width: 4rem;
  flex-shrink: 1;
}


</style>
