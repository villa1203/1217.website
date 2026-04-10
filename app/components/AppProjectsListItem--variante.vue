<template>
  <nuxt-link :to="`/works/${project.slug}`"
             class="v-app-projects-list-item--variante app-grid app-grid-reg--wrap"
  >
    <div class="app-grid__col-4 app-grid-reg__col-12 app-rm-child-margin">
          <h3>{{project.title}}</h3>
    </div>

    <div class="app-grid__col-8 app-grid-reg__col-12">

      <div class="app-grid app-grid--direction-column">
        <div class="v-app-projects-list-item--variante__cover">
          <img :src="project.gallery[0]?.large.url" alt="" />
        </div>


        <div class="v-app-projects-list-item--variante__gallery">
          <div class="v-app-projects-list-item--variante__gallery"
               :class="{
            'has-scroll': project.gallery.length > 3,
            'reg-has-scroll': project.gallery.length > 1,
            'hide-gradient': hideGradient
           }"
          >
            <div class="app-grid app-grid--justify-end v-app-projects-list-item--variante__gallery__container app-grid-reg--justify-start"
                 @scroll="onScrollInGallery"
            >
              <template v-for="(item, index) of project.gallery.slice(1, project.gallery.length)" :key="index">
                <video class="v-app-projects-list-item--variante__visual app-grid__shrink-0"
                       v-if="item.small.url.endsWith('.mp4')"
                       muted
                       autoplay
                       loop
                       :src="item.small.url"
                />
                <img class="v-app-projects-list-item--variante__visual app-grid__shrink-0"
                     v-else
                     :src="item.small.url"
                />
              </template>
            </div>

          </div>
        </div>

        <div class="v-app-projects-list-item--variante__cover app-grid">
          <div class="app-grid__col-8 app-rm-child-margin">
            <p class="app-color-grey">{{ project.baseline }}</p>
          </div>

          <div class="app-grid__col-4">
            <div class="app-text-strong">Workshops helds</div>
            <div v-for="client of project.clients" :key="client.title">{{ client.title }}</div>
          </div>
        </div>
      </div>





    </div>

  </nuxt-link>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type {CMS_API_Page_projet} from "#shared/cms_api";

defineProps<{
  project: CMS_API_Page_projet
}>()

const hideGradient = ref(false)

function onScrollInGallery(e: Event) {
  if (!(e.target instanceof HTMLElement)) return
  hideGradient.value = e.target.scrollLeft > 250;
}
</script>

<style lang="scss" scoped>
@use "../assets/_params";

.v-app-projects-list-item--variante {
  border-top: solid 1px var(--app-color-dark);
  padding-top: var(--app-gutter);
  color: inherit;
  text-decoration: inherit;
}

.v-app-projects-list-item--variante__visual {
  aspect-ratio: 10/13;
  object-fit: cover;
  width: calc(100% / 5);
  border-radius: 1rem;
}

.v-app-projects-list-item--variante__cover {
  img {
    width: 100%;
    aspect-ratio: 16/7;
    object-fit: cover;
    border-radius: 1rem;
  }
}

.v-app-projects-list-item--variante__gallery {
  position: relative;

  &.has-scroll {
    &::after {
      z-index: 5;
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      width: calc(100% / 5);
      height: 100%;
      transition: all .25s ease-in-out;
      background: linear-gradient(to left, var(--app-color-light) 0%, hsla(0, 0%, 100%, 0) 100%);
      pointer-events: none;
    }
  }
  &.hide-gradient::after {
    transform: translateX(100%);
  }
}

.v-app-projects-list-item--variante__gallery__container {
  width: 100%;
  overflow: hidden;

  .has-scroll & {
    overflow: scroll;
    justify-content: flex-start;
  }

  @media (max-width: params.$break-point-reg) {
    .reg-has-scroll & {
      overflow: scroll;
    }
  }
}
</style>
