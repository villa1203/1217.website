<template>
	<section class="v-block-video">
		<header v-if="block_data.content.title">
			<h2>{{ block_data.content.title }}</h2>
		</header>


		<figure>
			<div v-if="embedUrl">
				<iframe width="1280"
                height="720"
                :src="embedUrl"
                :title="block_data?.content?.title || 'video player'"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
        />
			</div>

      <div v-if="block_data.content.video_file && block_data.content.video_file[0]">
        <video controls
               muted
               autoplay
               :src="block_data.content.video_file[0].url"
        ></video>
      </div>

			<figcaption v-if="block_data.content.caption || block_data.content.credits" class="section-caption">
				<div v-if="block_data.content.caption" class="text small" v-html="block_data.content.caption"></div>
				<div v-if="block_data.content.credits" class="text x-small mono" v-html="block_data.content.credits"></div>
			</figcaption>
		</figure>
	</section>
</template>

<script setup lang="ts">
import type {CMS_BlockVideoData} from "#shared/cms_api"

const props = defineProps<{
  block_data: CMS_BlockVideoData
}>()

	const getEmbedUrl = (url: string) => {
		const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)

		if (videoId && videoId[1]) {
			return `https://www.youtube.com/embed/${videoId[1]}`
		}
		return null
	};

	const embedUrl = computed(() => getEmbedUrl(props.block_data.content.url))
</script>
