<template>
    <section class="v-app-last-projects-preview"
    >
      <div class="app-grid app-grid--align-start app-grid--justify-start app-grid--wrap app-grid--wrap v-app-last-projects-preview__projects">
        <div v-for="(page, page_index) of pages"
             :class="{
                'app-grid__col-5': (page_index + 1) % 5 === 1 || (page_index + 1) % 5 === 4,
                'app-grid__col-7': (page_index + 1) % 5 === 2 || (page_index + 1) % 5 === 3,
                'is-full': (page_index + 1) % 5 === 0
             }"
             class="v-app-last-projects-preview__projects__item app-grid-reg__col-12"
        >
          <AppProjectPreview
            :image="page.cover"
            :covers_video="page.covers_video?.url"
            :title="page.title"
            :baseline="page.baseline"
            :slug="page.slug"
            :services="page.services?.map(service => service.title)"
          />
        </div>
      </div>
    </section>
</template>





<script setup lang="ts">
import type {CMS_API_Page_projet} from "#shared/cms_api";
import {defineProps} from "vue";

defineProps<{
  pages: CMS_API_Page_projet[]
}>()
</script>





<style lang="scss" scoped >
@use '../assets/_params';

.v-app-last-projects-preview__projects {
  row-gap: var(--app-row-gap);

  @media (max-width: params.$break-point-reg) {
    --app-row-gap: 5rem;
  }
}

.v-app-last-projects-preview__projects__item {
  border-radius: 1rem;

  .app-body-drak-view & {
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 1);
  }

  &.is-full {
    width: 100%;
  }
}
</style>
