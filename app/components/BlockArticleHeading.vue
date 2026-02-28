<template>
	<section class="block-article-heading" >
		<header v-if="block_data.content.title">
			<h2>{{ block_data.content.title }}</h2>
		</header>
		<div v-if="block_data.content.text">
			<div v-html="block_data.content.text"/>
		</div>
	</section>
</template>

<script setup lang="ts">
	import type {CMS_BlockArticleHeadingData} from "#shared/cms_api"

	defineProps<{
		block_data: CMS_BlockArticleHeadingData
	}>()
</script>

<style scoped lang="scss">
.block-article-heading {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
