<template>
  <main class="v-index"
  >
    <div>
      <Blocks :content="data?.result.content || []" />
    </div>
  </main>
</template>


<script setup lang="ts">
import type {CMS_API_ImageInstance, CMS_API_Response, CMS_BlockData} from "#shared/cms_api";
import {KQL_QUERY_BLOCKS} from "#shared/KQLQueries";
import {windowsScrollListener} from "~/utils/windowsScrollListener";

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
    query: `page('home')`,
    select: {
      title: true,
      slug: true,
      baseline: true,
      content: KQL_QUERY_BLOCKS
    }
  }
})

const listener = () => windowsScrollListener('.v-block')

onMounted(() => {
  window.addEventListener('scroll', listener)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', listener)
})


</script>


<style lang="scss" scoped>
.v-index {
}
</style>
