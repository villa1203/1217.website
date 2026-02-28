<template>
    <section class="v-app-last-projects-preview"
    >
      <div class="app-grid app-grid--align-start app-grid--justify-start app-grid--wrap app-grid--wrap">
        <div v-for="(page, page_index) of pages"
             :class="{
                'app-grid__col-4': (page_index + 1) % 4 === 1 || (page_index + 1) % 4 === 0,
                'app-grid__col-8': (page_index + 1) % 4 === 2 || (page_index + 1) % 4 === 3,
             }"
        >
          <AppProjectPreview
            :image="page.cover"
            :title="page.title"
            :baseline="page.baseline"
            :slug="page.slug"
          />
        </div>
      </div>
    </section>
</template>





<script setup lang="ts">
import type {CMS_API_Page} from "#shared/cms_api";
import {defineProps} from "vue";

defineProps<{
  pages: CMS_API_Page[]
}>()
</script>





<style lang="scss" scoped >
.v-app-last-projects-preview {
}
</style>
