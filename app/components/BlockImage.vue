<template>
	<section v-if="block_data.content.image" class="section-image">
		<header v-if="block_data.content.title" class="section-header">
			<h2 class="h2 purple">{{ block_data.content.title }}</h2>
		</header>
		<figure>
			<img :src="block_data.image.url" :alt="block_data.image.alt" :width="block_data.image.width" :height="block_data.image.height">
			<figcaption v-if="block_data.content.caption || block_data.content.credits" class="section-caption">
				<div v-if="block_data.content.caption" class="text small" v-html="block_data.content.caption"></div>
				<div v-if="block_data.content.credits" class="text x-small mono" v-html="block_data.content.credits"></div>
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
