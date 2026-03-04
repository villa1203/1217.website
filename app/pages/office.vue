<template>
  <main class="v-office"
  >
    <div>
      <Blocks :content="data?.result.content || []" />
    </div>
  </main>
</template>


<script setup lang="ts">
import type {CMS_API_ImageInstance, CMS_API_Response, CMS_BlockData} from "#shared/cms_api";
import {KQL_QUERY_BLOCKS} from "#shared/KQLQueries";

type FetchData = CMS_API_Response & {
  "result": {
    "title": string,
    "slug": string,
    content: CMS_BlockData[],
  }
}


const {data} = useFetch<FetchData>('/api/CMS_KQLRequest', {
  lazy: true,
  method: 'POST',
  body: {
    query: `page('office')`,
    select: {
      title: true,
      slug: true,
      content: KQL_QUERY_BLOCKS
    }
  }
})
</script>


<style lang="scss" scoped>
.v-office {
}
</style>
