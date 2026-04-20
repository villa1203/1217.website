<template>
	<section class="v-block block-gallery"
  >
		<header class="block-gallery__header app-rm-child-margin">
			<h2 class="app-text-h3"
          v-if="block_data.content.title"
      >{{ block_data.content.title }}</h2>
			<p class="app-text-h2"
         v-html="block_data.content.text"
      />
		</header>

    <div class="app-grid app-grid--wrap">
      <div class="app-grid__col-6 block-gallery__img-wrapper"
           v-for="image of block_data.content.images"
      >
        <div class="block-gallery__img-wrapper__text app-button">
          {{image.title}}
        </div>
          <img class="block-gallery__img-wrapper__img"
               :src="image.large.url"
               :alt="image.alt || 'image'"
          >
      </div>

    </div>
    <div v-if="block_data.content.caption" class="app-text-strong" v-html="block_data.content.caption"></div>
    <div v-if="block_data.content.credits" v-html="block_data.content.credits"></div>
	</section>
</template>

<script setup lang="ts">
import type {CMS_BlockGalleryData} from "#shared/cms_api"

defineProps<{
  block_data: CMS_BlockGalleryData
}>()
</script>

<style scoped lang="scss">
.block-gallery {
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  container-type: inline-size;
  container-name: block-gallery;
}

.block-gallery__header {
  width: 50%;
  margin-bottom: .5rem;

  @container block-gallery (width < 1300px) {
    width: calc(100% / 12 * 9);
  }

  @container block-gallery (width < 900px) {
    width: calc(100% / 12 * 12);
  }
}

.block-gallery__img-wrapper {
  position: relative;
}

img {
  box-sizing: border-box;
  display: block;
  margin: 0;
  max-height: calc(100vh - 4rem);
  object-fit: cover;
  border-radius: 1rem;
  width: 100%;
}

.block-gallery__img-wrapper__text {
  position: absolute;
  top: 1rem;
  left: 1rem;
}

</style>
