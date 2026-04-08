<template>
  <div class="v-block block-profiles app-with-padding--left-right">
    <h2>{{ block_data.content.title }}</h2>
    <div class="app-grid">

        <div v-for="profile of block_data.content.profiles_list"
             class="block-profiles__profile-card app-grid__col-4"
        >
            <div class="block-profiles__profile-card__profiles">
                <div class="app-grid">
                    <div class="app-button">{{ profile.first_name }} {{ profile.last_name }}</div>
                </div>
            </div>

            <img class="block-profiles__profile-card__img"
                 v-if="profile.photo"
                 :src="profile.photo.reg.url"
                 :alt="profile.photo.alt ?? ''"
            />

            <div class="block-profiles__profile-card__function"
            >{{ profile.function }}</div>

            <div class="block-profiles__profile-card__roles"
                 v-if="profile.roles"
                 v-html="profile.roles"
            />
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {CMS_BlockProfiles} from "#shared/cms_api"

defineProps<{
  block_data: CMS_BlockProfiles,
}>()
</script>

<style scoped lang="scss">
.block-profiles {
  width: 100%;
  box-sizing: border-box;
}

.block-profiles__profile-card {
    position: relative;
}

.block-profiles__profile-card__profiles {
    position: absolute;
    top:    var(--app-grid-gap-xs);
    left:   var(--app-grid-gap-xs);
}

.block-profiles__profile-card__img {
    width: 100%;
    border-radius: 1rem;
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
