<template>
  <main class="v-office">
    <div class="v-office__inner" :class="{ 'is-visible': visible }">
      <Blocks :content="data?.result.content || []" />
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
    query: `page('office')`,
    select: {
      title: true,
      slug: true,
      content: KQL_QUERY_BLOCKS
    }
  }
})

const visible = ref(false)

watch(data, (val) => {
  if (val) nextTick(() => { visible.value = true })
}, { immediate: true })

const listener = () => windowsScrollListener('.v-app-footer')

onMounted(() => {
  window.addEventListener('scroll', listener)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', listener)
})
</script>


<style lang="scss" scoped>
// .v-office (the root <main>) has NO transition — so Vue's page-leave-active
// can correctly control the leave duration without competing specificity.
// The fade lives on the child wrapper instead.
.v-office__inner {
  opacity: 0;

  &.is-visible {
    opacity: 1;
    transition: opacity 3.0s cubic-bezier(0.16, 1, 0.3, 1);
  }
}
</style>
