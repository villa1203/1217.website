<template>
    <section class="v-app-projects-list">
      <div class="v-app-projects-list__filters">
        <AppButton :is_active="true">All</AppButton>
        <AppButton :is_active="false" v-for="filter of filters" :key="filter.slug">
          {{filter.title}}
        </AppButton>
      </div>
      <div class="v-app-projects-list__projects app-grid app-grid--direction-column">
        <AppProjectsListItem
          v-for="project of projects"
          :key="project.slug"
          :project="project"
        />
      </div>
    </section>
</template>

<script setup lang="ts">
import type { CMS_API_Page_projet } from "#shared/cms_api";

defineProps<{
  filters: {title: string, slug: string}[]
  projects: CMS_API_Page_projet[]
}>()
</script>

<style lang="scss" scoped>
.v-app-projects-list__filters {
  padding-bottom: var(--app-gutter);
  border-bottom: solid 1px var(--app-color-dark);
}
</style>
