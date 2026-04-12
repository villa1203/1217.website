<template>
	<section v-if="block_data.content.image"
           class="v-block block-image"
           :class="{
              'is-full':      block_data.content.toggle_is_full === 'true',
              'has-gap-left': block_data.content.toggle_gap_left === 'true',
              'has-ratio-1-1': block_data.content.toggle_ratio_1_1 === 'true',
              'is-large':     block_data.content.toggle_is_large === 'true',
           }"
  >
		<header v-if="block_data.content.title">
			<h2>{{ block_data.content.title }}</h2>
		</header>
		<figure>
			<img :src="block_data.content.image.large.url" :alt="block_data.content.image.alt || 'image'">
			<figcaption v-if="block_data.content.caption || block_data.content.credits"
      >
				<div v-if="block_data.content.caption" class="block-image__caption app-button" v-html="block_data.content.caption"></div>
				<div v-if="block_data.content.credits" class="block-image__credit" v-html="block_data.content.credits"></div>
			</figcaption>
		</figure>
	</section>
</template>

<script setup lang="ts">
import type {CMS_BlockImageData} from "#shared/cms_api"

defineProps<{
  block_data: CMS_BlockImageData
}>()
</script>

<style scoped lang="scss">
.block-image {
  width: calc( ((100% + var(--app-grid-gap) ) / 2) - var(--app-grid-gap));
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  border-radius: 1rem;

  &.has-gap-left {
    margin-left: 50%;
  }

  &.is-full {
    width: calc( 100% + var(--app-gutter) * 2);
    margin-left: calc( -1 * var(--app-gutter));
    margin-right: calc( -1 * var(--app-gutter));
    border-radius: 0;
  }

  &.is-large {
    width: 100%;
    padding-left: var(--app-grid-gap);
    padding-right: var(--app-grid-gap);
  }
}

figure {
  box-sizing: border-box;
  display: block;
  width: 100%;
  margin: 0;
}

.block-image__caption {
  position: absolute;
  top: var(--app-grid-gap-xs);
  left: var(--app-grid-gap-xs);
}

.block-image__credit {
  margin-top: var(--app-grid-gap-xs);
}

img {
  box-sizing: border-box;
  display: block;
  width: 100%;
  margin: 0;

  .has-ratio-1-1 & {
    aspect-ratio: 1/1;
    object-fit: cover;
  }
}

</style>
