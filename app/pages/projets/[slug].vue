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
          <div class="app-grid app-grid--direction-column">
            <div v-if="data.result.clients">
              <h4 style="margin: 0">Client</h4>
              <div v-for="client of data.result.clients">
                {{ client.title }}
              </div>
            </div>

            <div v-if="data.result.date">
              <h4 style="margin: 0">Période</h4>
              {{ formaterDate(data.result.date)  }}
            </div>

            <div v-if="data.result.sectors">
              <h4 style="margin: 0">Contrat</h4>
              <div v-for="sector of data.result.sectors">
                {{ sector.title }}
              </div>
            </div>

            <div v-if="data.result.services">
              <h4 style="margin: 0">Expertise</h4>
              <div v-for="service of data.result.services">
                {{ service.title }}
              </div>
            </div>

            <div v-if="data.result.localisation">
              {{ data.result.localisation }}
            </div>

            <div v-if="data.result.photo_credits">
              {{ data.result.photo_credits }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </main>
</template>


<script setup lang="ts">

import type {CMS_API_ImageInstance, CMS_API_Response} from "#shared/cms_api";
import {formaterDate} from "#shared/date_formatter";

type FetchData = CMS_API_Response & {
  "result": {
    "title": string,
    "slug": string,
    "baseline": string,
    "cover": CMS_API_ImageInstance,
    content: string,
    sectors: {title: string}[]
    clients: {title: string}[]
    services: {title: string}[]
    date: string
    localisation: string
    photo_credits: string
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
      sectors: {
        query: 'page.sectors.toPages',
        select: {
          title: true,
        }
      },
      clients: {
        query: 'page.clients.toPages',
        select: {
          title: true,
        }
      },
      date: true,
      services: {
        query: 'page.services.toPages',
        select: {
          title: true,
        }
      },
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
