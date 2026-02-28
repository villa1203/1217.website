<template>
	<section class="section-text cols">
		<div v-if="props.block.content.title" class="col col-text col-with-padding">
			<h3 class="h2">{{ props.block.content.title }}</h3>
		</div>
		<div v-else class="grid-background"></div>

		<div class="col col-text col-with-padding">
			<div class="text" v-html="props.block.content.title"></div>
		</div>
	</section>

</template>

<script setup lang="ts">
import type {CMS_BlockTextData} from "#shared/cms_api";

const props = defineProps<{
  block_data: CMS_BlockTextData
}>()
</script>
