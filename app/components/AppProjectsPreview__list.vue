<template>
    <section class="v-app-last-projects-preview"
    >
      <div class="app-grid app-grid--align-start app-grid--justify-start app-grid--wrap">
        <div v-for="project of pages"
             class="app-grid__col-3"
        >
          <AppProjectPreview__list
            :image="project.cover"
            :title="project.title"
            :baseline="project.baseline"
            :slug="project.slug"
          />
        </div>
      </div>

      <div class="app-grid app-grid--align-start app-grid--justify-start">
        <button>see more -></button>
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
