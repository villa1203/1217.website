<template>
	<section class="section-text cols">
		<div v-if="props.block.content.titre" class="col col-text col-with-padding">
			<h3 class="h2">{{ props.block.content.titre }}</h3>
		</div>
		<div v-else class="grid-background"></div>

		<div class="col col-text col-with-padding">
			<div class="text" v-html="props.block.content.text"></div>
		</div>
	</section>

</template>

<script setup lang="ts">
import type {BlockTextData} from "#shared/cms_api";

const props = defineProps<{
  block_data: BlockTextData
}>()
</script>
