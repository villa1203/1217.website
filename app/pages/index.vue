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

// 'idle'    → watching for the snap zone
// 'snapping'→ smooth scroll in flight — swallow ALL wheel events so native
//             scroll can't compete and cause vibration
// 'done'    → snapped, free scrolling; re-arms when user returns to top
type SnapState = 'idle' | 'snapping' | 'done'
let snapState: SnapState = 'idle'
let snapTimer: ReturnType<typeof setTimeout> | null = null

const handleWheelAtTop = (event: WheelEvent) => {
  if (snapState === 'snapping') {
    event.preventDefault()   // block every wheel tick during the animation
    return
  }

  if (snapState === 'done') {
    if (window.scrollY < 20) snapState = 'idle'   // re-arm at top
    return
  }

  // idle — trigger when the user drifts into the snap zone
  if (window.scrollY > 50 && window.scrollY < 100) {
    const firstBlock = document.querySelector('.v-block')
    if (!firstBlock) return

    event.preventDefault()
    snapState = 'snapping'
    window.scrollTo({ behavior: 'smooth', top: window.innerHeight })

    if (snapTimer) clearTimeout(snapTimer)
    snapTimer = setTimeout(() => { snapState = 'done' }, 900)
  }
}

onMounted(() => {
  window.addEventListener('scroll', listener)
  window.addEventListener('wheel', handleWheelAtTop, { passive: false })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', listener)
  window.removeEventListener('wheel', handleWheelAtTop)
  if (snapTimer) clearTimeout(snapTimer)
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
