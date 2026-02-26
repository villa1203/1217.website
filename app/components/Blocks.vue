<template>
  <template v-for="block of props.content" :key="block.id">
    <template v-if="block.type === 'article_heading'">
      <BlockArticleHeading :block="block"/>
    </template>

    <template v-else-if="block.type === 'image'">
      <BlockImage :block="block"/>
    </template>

    <template v-else-if="block.type === 'text'">
      <BlockText :block="block"/>
    </template>

    <template v-else-if="block.type === 'video'">
      <BlockVideo :block="block"/>
    </template>
  </template>
</template>

<script setup lang="ts">
	import type {BlockData} from "#shared/cms_api";

	const props = defineProps<{
		content: BlockData[]
	}>();

</script>
