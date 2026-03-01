<template>
	<section>
		<div v-if="block_data.content.title">
			<h2>{{ block_data.content.title }}</h2>
		</div>
		<div>
			<div
        v-html="block_data.content.text"
      />
		</div>
	</section>

</template>

<script setup lang="ts">
import type {CMS_BlockTextData} from "#shared/cms_api";

defineProps<{
  block_data: CMS_BlockTextData
}>()
</script>
