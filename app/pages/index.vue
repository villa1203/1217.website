<template>
  <main class="v-index"
  >
    <div>
      <Blocks :content="data?.result.home.content || []" />
    </div>

    <div>
      <AppLastProjectsPreview
        title="Explore our last projects"
      />
    </div>

    <div>
      <AppLastProjectsPreview_list
        title="Explore our last research projects"
        subtitle="Les produits d'Otio se distinguent depuis des années grâce à un principe clef: la simplicité d'abord."
      />
    </div>
  </main>
</template>


<script setup lang="ts">
import type {CMS_API_Image, CMS_API_ImageInstance, CMS_API_Response} from "#shared/cms_api";
import AppLastProjectsPreview_list from "~/components/AppLastProjectsPreview_list.vue";

// type ResolvedPage = {
//   id: string,
//   title: string,
//   slug: string,
//   url: string,
// }
//
// const resolvedPagesMap: ComputedRef<Map<string, ResolvedPage[]>> = computed(() => {
//   const map = new Map<string, ResolvedPage[]>()
//
//   for (const block of data.value?.result.home.pages_list_blocks ?? []) {
//     map.set(block.id, block.resolved_pages)
//   }
//   return map
// })


</script>


<style lang="scss" scoped>
.v-index {
}
</style>
