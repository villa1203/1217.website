<template>
  <main class="v-index"
  >
    <div>
      <Blocks :content="data?.result.content || []" />
    </div>

    <div class="v-index__hero-overlay">
      <div class="v-index__latest-use">
        <div class="v-index__latest-use__label">Latest Case Study</div>
        <nuxt-link class="v-index__latest-use__link" to="/works/jazz-action-valence">
          Jazz action Valence →
        </nuxt-link>
      </div>
    </div>
  </main>
</template>


<script setup lang="ts">
import type {CMS_API_Response, CMS_BlockData} from "#shared/cms_api";
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
  position: relative;
}

.v-index__hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  pointer-events: none;
}

.v-index__latest-use {
  position: absolute;
  bottom: var(--app-grid-gap);
  left: var(--app-gutter);
  mix-blend-mode: difference;
  color: white;
  font-size: 1rem;
  line-height: 1.4em;
  pointer-events: none;
}

.v-index__latest-use__label {
  opacity: 1;
}

.v-index__latest-use__link {
  display: block;
  color: inherit;
  text-decoration: none;
  pointer-events: auto;
}
</style>
