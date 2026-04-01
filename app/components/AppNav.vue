<template>
    <nav class="v-nav app-with-padding--left-right app-with-padding--top-bottom"
    >
      <div class="app-grid app-grid--justify-between app-grid-reg--wrap app-grid-reg--justify-end">

        <div class="app-button app-button--reverse-with-dark-view" style="z-index: 10"
             :class="{'infos-is-open': infosIsOpen}"
        >
          <div class="app-grid app-grid--align-center">
            <nuxt-link to="/">
              <img src="/logo.svg" role="button"/>
            </nuxt-link>
            <div class="toggle-infos"
                 @click="infosIsOpen = !infosIsOpen"
            >
              <UIOpen/>
            </div>
          </div>
        </div>

        <div v-if="infosIsOpen"
             class="app-rm-child-margin v-nav__infos"
        >
          <p>
            <span class="app-text-strong">informations</span>
            <br>Bureau 1217 is a design office working across identity, digital platforms, and interactive experiences.
            <br>From interactive storytelling for the Winter Olympic Games to visual identity systems for educational institutions and immersive memorial experiences developed with public institutions, we design projects that connect people to ideas, places, and histories.
          </p>
          <p>We work with 3D, 2D and generative animation to create music videos, brand identities and typography in motion.</p>

          <div style="margin-top: 10rem;" class="app-grid">
            <span class="app-button app-button--negative">Instagram</span>
            <span class="app-button app-button--negative">LinkedIn</span>
          </div>

        </div>

        <nav class="app-grid app-grid--justify-end v-nav__links"
             style="gap: .5rem"
        >
          <nuxt-link class="app-button app-button--reverse-with-dark-view" to="/works">works</nuxt-link>
<!--          <nuxt-link class="app-button" to="/office">office</nuxt-link>-->
          <nuxt-link class="app-button app-button--reverse-with-dark-view" to="/research">research</nuxt-link>
        </nav>

      </div>
    </nav>
</template>





<script setup lang="ts">
import UIOpen from "~/components/UIOpen.vue";

const infosIsOpen = ref(false)



</script>





<style lang="scss" scoped >
@use "~/assets/_params";

.v-nav {
  width: 100%;
  position: relative;
}

.v-nav__infos {
  position: absolute;
  top: var(--app-gutter);
  left: var(--app-gutter);
  width: 30rem;
  background: hsla(0, 0%, 0%, 0.25);
  border-radius: .75rem;
  color: white;
  padding: 5rem .75rem .75rem;
  z-index: 0;
}

.infos-is-open {
  background: transparent;
  transition: none;
  backdrop-filter: none;

  .toggle-infos {
    transform: rotate(45deg);
  }
}

.toggle-infos {
  @media (max-width: params.$break-point-reg) {
    display: none;
  }
}

.v-nav__links {
  @media (max-width: params.$break-point-reg) {
    opacity: 1;
    transition: opacity .25s ease-in-out;
    .app-scroll-down & {
      opacity: 0;
      pointer-events: none;
    }
  }
}
</style>
