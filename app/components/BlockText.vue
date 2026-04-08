<template>
	<section class="v-block block-text app-with-padding--left-right">
		<div class="app-child-no-margin"
         v-if="block_data.content.title"
    >
			<h3>{{ block_data.content.title }}</h3>
		</div>

    <div class="app-grid">
			<div class="block-text__content app-grid__col-6"
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


<style scoped lang="scss">
@use "~/assets/typo";

.block-text {
  width: 100%;
  box-sizing: border-box;
  container-type: inline-size;
  container-name: container-block-text;

}
:global(.block-text__content > p) {
  @extend .app-text-h1;
}

.block-text__content {
  @container container-block-text (width < 1300px) {
    width: calc(100% / 12 * 9);
  }

  @container container-block-text (width < 900px) {
    width: calc(100% / 12 * 12);
  }
}
</style>
