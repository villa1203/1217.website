<template>
  <template v-for="block of content" :key="block.id">
    <template v-if="block.type === 'article_heading'">
      <BlockArticleHeading
        :block_data="block"
      />
    </template>

    <template v-else-if="block.type === 'image'">
      <BlockImage :block_data="block"/>
    </template>

    <template v-else-if="block.type === 'text'">
      <BlockText :block_data="block"/>
    </template>

    <template v-else-if="block.type === 'video'">
      <BlockVideo :block_data="block"/>
    </template>

    <template v-else-if="block.type === 'pages_list'">
      <BlockPagesList :block_data="block"/>
    </template>
  </template>
</template>

<script setup lang="ts">
	import type {CMS_BlockData} from "#shared/cms_api";

	defineProps<{
		content: CMS_BlockData[]
	}>();

</script>
