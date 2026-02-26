<template>
  <main class="v-projet-slug"
  >
    <template v-if="data">
      <header class="v-projet-slug__header"
      >
        <img class="v-projet-slug__img"
             :src="data.result.cover.reg.url">
        <h1>{{ data.result.title }}</h1>
        <h2>{{data.result.baseline}}</h2>
      </header>

      <div class="app-grid app-grid--align-start app-grid--justify-start">
        <div class="app-grid__col-8">
          <div v-html="data.result.content" />
        </div>
        <div class="app-grid__col-4">
          <div>{{ data.result.sectors }}</div>
          <div>{{ data.result.clients }}</div>
          <div>{{ data.result.date }}</div>
          <div>{{ data.result.services }}</div>
          <div>{{ data.result.localisation }}</div>
          <div>{{ data.result.photo_credits }}</div>
        </div>
      </div>
    </template>
  </main>
</template>


<script setup lang="ts">

import type {CMS_API_ImageInstance, CMS_API_Response} from "#shared/cms_api";

type FetchData = CMS_API_Response & {
  "result": {
    "title": string,
    "slug": string,
    "baseline": string,
    "cover": CMS_API_ImageInstance,
    content: string,
  }
}

const route = useRoute()

const {data, status} = await useFetch<FetchData>('/api/CMS_KQLRequest', {
  lazy: true,
  method: 'POST',
  body: {
    query: `page('projets/${route.params.slug}')`,
    select: {
      title: true,
      slug: true,
      baseline: true,
      sectors: true,
      clients: true,
      date: true,
      services: true,
      localisation: true,
      photo_credits: true,
      cover: {
        query: 'page.covers.toFiles.first',
        select: {
          alt: "file.alt.value",
          tiny: 'file.resize(50, null, 10)',
          small: 'file.resize(500)',
          reg: 'file.resize(1280)',
          large: 'file.resize(1920)',
          xxl: 'file.resize(2500)',
          focus: 'file.focus',
        },
      },
      content: {
        query: 'page.content.content',
      },
    }
  }
})

</script>


<style lang="scss" scoped>
.v-projet-slug__img {
  display: block;
  width: 100%;
  height: 100vh;
  object-fit: cover;
}
</style>
