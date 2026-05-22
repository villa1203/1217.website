<template>
	<section v-if="block_data.content.image"
           ref="sectionRef"
           class="v-block block-image"
           :style="{ transitionDelay: `${revealDelay}ms` }"
           :class="{
              'is-full':      block_data.content.toggle_is_full === 'true',
              'has-gap-left': block_data.content.toggle_gap_left === 'true',
              'has-ratio-1-1': block_data.content.toggle_ratio_1_1 === 'true',
              'is-large':     block_data.content.toggle_is_large === 'true',
              'is-visible':   isVisible,
           }"
  >
		<header v-if="block_data.content.title">
			<h2>{{ block_data.content.title }}</h2>
		</header>
		<figure>
			<img :src="block_data.content.image.large.url" :alt="block_data.content.image.alt || 'image'">
			<figcaption v-if="block_data.content.caption || block_data.content.credits"
      >
				<div v-if="block_data.content.caption" class="block-image__caption app-button" v-html="block_data.content.caption"></div>
				<div v-if="block_data.content.credits" class="block-image__credit" v-html="block_data.content.credits"></div>
			</figcaption>
		</figure>
	</section>
</template>

<script setup lang="ts">
import type {CMS_BlockImageData} from "#shared/cms_api"

defineProps<{
  block_data: CMS_BlockImageData
}>()

const sectionRef  = ref<HTMLElement | null>(null)
const isVisible   = ref(false)
const revealDelay = ref(0)
let observer: IntersectionObserver | null = null

onMounted(() => {
  const el = sectionRef.value
  if (!el) return

  // Walk preceding .block-image/.block-video siblings to find column position (0 or 1)
  const parent = el.closest<HTMLElement>('.app-blocks')
  if (parent) {
    const allMedia = [...parent.querySelectorAll<HTMLElement>('.block-image, .block-video')]
    let col = 0
    for (const block of allMedia) {
      const isHalf = !block.classList.contains('is-full') && !block.classList.contains('is-large')
      if (block === el) { revealDelay.value = isHalf ? col * 120 : 0; break }
      col = isHalf ? (col === 0 ? 1 : 0) : 0
    }
  }

  observer = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) {
      isVisible.value = true
      observer?.disconnect()
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' })
  observer.observe(el)
})

onUnmounted(() => { observer?.disconnect() })
</script>

<style scoped lang="scss">
@use "../assets/_params";

.block-image {
  width: calc( ((100% + var(--app-grid-gap) ) / 2) - var(--app-grid-gap));
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  border-radius: var(--app-media-radius);

  opacity: 0;
  transform: scale(0.94);
  transform-origin: center;
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);

  &.is-visible {
    opacity: 1;
    transform: scale(1);
  }

  &.has-gap-left {
    margin-left: 50%;
  }

  &.is-full {
    width: calc( 100% + var(--app-gutter) * 2);
    margin-left: calc( -1 * var(--app-gutter));
    margin-right: calc( -1 * var(--app-gutter));
    border-radius: 0;

    @media (max-width: params.$break-point-reg) {
      img {
        height: 100svh;
        object-fit: cover;
      }
    }
  }

  &.is-large {
    width: 100%;
    padding-left: var(--app-grid-gap);
    padding-right: var(--app-grid-gap);
  }
}

figure {
  box-sizing: border-box;
  display: block;
  width: 100%;
  margin: 0;
}

.block-image__caption {
  position: absolute;
  top: var(--app-grid-gap-xs);
  left: var(--app-grid-gap-xs);
}

.block-image__credit {
  margin-top: var(--app-grid-gap-xs);
}

img {
  box-sizing: border-box;
  display: block;
  width: 100%;
  margin: 0;

  .has-ratio-1-1 & {
    aspect-ratio: 1/1;
    object-fit: cover;
  }
}

</style>
