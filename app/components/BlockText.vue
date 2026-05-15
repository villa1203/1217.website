<template>
	<section ref="sectionRef" class="v-block block-text">
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

const sectionRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function setupDOM() {
  const content = sectionRef.value?.querySelector('.block-text__content')
  if (!content) return

  let lineIndex = 0

  content.querySelectorAll('p').forEach((p) => {
    const text = p.textContent?.trim() || ''
    if (!text) return

    const sentences = text
      .split(/(?<=[.!?…])\s+/)
      .map(s => s.trim())
      .filter(Boolean)

    const lines = sentences.length > 1 ? sentences : [text]

    const fragment = document.createDocumentFragment()
    lines.forEach((sentence) => {
      const mask = document.createElement('div')
      mask.className = 'line-mask'
      mask.style.setProperty('--line-index', String(lineIndex++))

      const line = document.createElement('p')
      line.textContent = sentence
      mask.appendChild(line)
      fragment.appendChild(mask)
    })

    p.replaceWith(fragment)
  })
}

onMounted(async () => {
  await nextTick()

  setupDOM()

  const section = sectionRef.value
  if (!section) return

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry?.isIntersecting) {
        section.classList.add('in-view')
        observer?.disconnect()
      }
    },
    { threshold: 0.05, rootMargin: '0px 0px -80px 0px' }
  )
  observer.observe(section)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>


<style scoped lang="scss">
@use "~/assets/typo";

.block-text {
  width: 100%;
  box-sizing: border-box;
  container-type: inline-size;
  container-name: container-block-text;
}

:global(.block-text__content p) {
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

<style lang="scss">
.line-mask {
  overflow: hidden;
}

// Hidden state — all lines start clipped below their mask
.line-mask p {
  transform: translateY(115%);
  opacity: 0;
  transition:
    transform 1.3s cubic-bezier(0.22, 1, 0.36, 1),
    opacity   0.9s ease;
  transition-delay: calc(var(--line-index, 0) * 0.3s);
}

// Scroll-triggered: staggered slide up per sentence
.block-text.in-view .line-mask p {
  transform: translateY(0);
  opacity: 1;
}

</style>
