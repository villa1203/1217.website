<template>
  <div class="v-block block-profiles">
    <h2>{{ block_data.content.title }}</h2>
    <div ref="gridRef" class="app-grid app-grid--wrap">
      <div
        v-for="(profile, i) of block_data.content.profiles_list"
        :key="i"
        class="block-profiles__profile-card app-grid__col-3 app-grid-reg__col-6 app-grid-small__col-12"
        :class="{ 'is-visible': visibleCards.has(i) }"
        :style="{ transitionDelay: `${(i % 4) * 80}ms` }"
      >
        <div class="block-profiles__profile-card__profiles">
          <div class="app-grid">
            <div class="app-button">{{ profile.first_name }} {{ profile.last_name }}</div>
          </div>
        </div>

        <img
          class="block-profiles__profile-card__img"
          v-if="profile.photo"
          :src="profile.photo.reg.url"
          :alt="profile.photo.alt ?? ''"
        />

        <div class="block-profiles__profile-card__function">{{ profile.function }}</div>

        <div
          class="block-profiles__profile-card__roles"
          v-if="profile.roles"
          v-html="profile.roles"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CMS_BlockProfiles } from '#shared/cms_api'

defineProps<{ block_data: CMS_BlockProfiles }>()

const gridRef      = ref<HTMLElement>()
const visibleCards = ref<Set<number>>(new Set())
let observer: IntersectionObserver | null = null

onMounted(async () => {
  await nextTick()
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const i = Number((entry.target as HTMLElement).dataset.cardIndex)
        visibleCards.value = new Set([...visibleCards.value, i])
        observer?.unobserve(entry.target)
      }
    }
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' })

  gridRef.value?.querySelectorAll('.block-profiles__profile-card').forEach((el, i) => {
    (el as HTMLElement).dataset.cardIndex = String(i)
    observer?.observe(el)
  })
})

onUnmounted(() => { observer?.disconnect() })
</script>

<style scoped lang="scss">
.block-profiles {
  width: 100%;
  box-sizing: border-box;
}

.block-profiles__profile-card {
  position: relative;
  opacity: 0;
  transform: scale(0.88);
  transform-origin: center;
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);

  &.is-visible {
    opacity: 1;
    transform: scale(1);
  }
}

.block-profiles__profile-card__profiles {
  position: absolute;
  top:  var(--app-grid-gap-xs);
  left: var(--app-grid-gap-xs);
}

.block-profiles__profile-card__img {
  width: 100%;
  border-radius: var(--app-media-radius);
}

.block-profiles__profile-card__function {
  margin-top: .5rem;
}

:global(.block-profiles__profile-card__roles ul) {
  padding: 0;
  margin-top: var(--app-grid-gap-xs);
}
:global(.block-profiles__profile-card__roles li) {
  display: block;
}
</style>
