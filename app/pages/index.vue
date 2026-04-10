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

const listener = () => windowsScrollListener('.v-block', 2)

let hasScrollingToBottom = false

const handleWheelAtTop = (event: WheelEvent) => {

  if(hasScrollingToBottom) {
    if (window.scrollY === 0) {
      hasScrollingToBottom = false
    }
  } else {
    if (window.scrollY > 50 && window.scrollY < 100) {
      const firstBlock = document.querySelector('.v-block')

      const topPosition = window.innerHeight

      if (firstBlock) {
        event.preventDefault()
        window.scrollTo({
          behavior: 'smooth',
          top: topPosition,
        })
        hasScrollingToBottom = true
      }
    }
  }

}

onMounted(() => {
  window.addEventListener('scroll', listener)
  window.addEventListener('wheel', handleWheelAtTop, { passive: false })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', listener)
  window.removeEventListener('wheel', handleWheelAtTop)
})


</script>


<style lang="scss" scoped>
.v-index {
}
</style>
