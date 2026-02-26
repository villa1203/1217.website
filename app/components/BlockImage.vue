<template>
	<section v-if="props.block.content.image" class="section-image">
		<header v-if="props.block.content.titre" class="section-header">
			<h2 class="h2 purple">{{ props.block.content.titre }}</h2>
		</header>
		<figure>
			<img :src="props.block.image.url" :alt="props.block.image.alt" :width="props.block.image.width" :height="props.block.image.height">
			<figcaption v-if="props.block.content.caption || props.block.content.credits" class="section-caption">
				<div v-if="props.block.content.caption" class="text small" v-html="props.block.content.caption"></div>
				<div v-if="props.block.content.credits" class="text x-small mono" v-html="props.block.content.credits"></div>
			</figcaption>
		</figure>
	</section>
</template>

<script setup lang="ts">
import type {BlockImageData} from "#shared/cms_api"

const props = defineProps<{
  block_data: BlockImageData
}>()
</script>
