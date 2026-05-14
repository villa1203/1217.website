<template>
    <section class="v-app-projects-list">
      <div v-if="!hideFilters" class="v-app-projects-list__filters">
        <AppButton @click="setActiveTag('all')"
                   :is_active="activeTag === 'all'"
                   style="padding-bottom: .5rem; padding-top: .5rem;"
        >All</AppButton>
        <AppButton
          :is_active="activeTag === filter.slug"
          v-for="filter of filters"
          :key="filter.slug"
          @click="setActiveTag(filter.slug)"
          style="padding-bottom: .5rem; padding-top: .5rem;"
        >
          {{filter.title}}
        </AppButton>
      </div>
      <div class="v-app-projects-list__projects app-grid app-grid--direction-column">
        <template
          v-if="variante"
        >
          <AppProjectsListItemVariante
            v-for="project of filteredProjects"
            :key="project.slug"
            :project="project"
          />
        </template>
        <template
            v-else
        >
          <AppProjectsListItem
            v-for="project of filteredProjects"
            :key="project.slug"
            :project="project"
            :is-sibling="hoveredSlug !== null && hoveredSlug !== project.slug"
            @mouseenter="hoveredSlug = project.slug"
            @mouseleave="hoveredSlug = null"
          />
        </template>
      </div>
    </section>
</template>

<script setup lang="ts">
import type { CMS_API_Page_projet } from "#shared/cms_api";

const props = defineProps<{
  filters: {title: string, slug: string}[]
  projects: CMS_API_Page_projet[]
  variante?: boolean
  hideFilters?: boolean
}>()

const hoveredSlug = ref<string | null>(null)
const activeTag = ref<string>('all')

const setActiveTag = (tag: string) => {activeTag.value = tag}

const filteredProjects = computed(() => props.projects.filter(project => {
  if (activeTag.value === 'all') {
    return true
  }

  const projectServices = project.services.map(tag => tag.slug)

  return projectServices.includes(activeTag.value)
}))

</script>

<style lang="scss" scoped>

.v-app-projects-list {
  padding-bottom: 10%;
}

.v-app-projects-list__filters {
  padding-bottom: var(--app-gutter);
  border-bottom: solid 1px var(--app-color-dark);
}


</style>
