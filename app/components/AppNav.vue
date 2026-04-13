<template>
    <nav class="v-nav app-with-padding--left-right app-with-padding--top-bottom"
         :class="{'infos-is-open': infosIsOpen}"
    >
      <div class="toggle-infos toggle-infos--mobile app-button"
           @click="infosIsOpen = !infosIsOpen"
      >
        <div>
          <UIOpen/>
        </div>
      </div>

      <div class="app-grid app-grid--justify-between app-grid-reg--wrap app-grid-reg--justify-end">

        <div class="app-button app-button--reverse-with-dark-view v-nav__logo"
             style="z-index: 10; transition-delay: .25s;"
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

        <transition name="animation-1" :duration="1000">
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
              <span class="app-button app-button--transparent">Instagram</span>
              <span class="app-button app-button--transparent">LinkedIn</span>
            </div>

          </div>
        </transition>

        <nav class="app-grid app-grid--justify-end v-nav__links"
             style="gap: .5rem"
        >
          <nuxt-link class="app-button app-button--reverse-with-dark-view" to="/works">works</nuxt-link>
          <nuxt-link class="app-button app-button--reverse-with-dark-view" to="/office">office</nuxt-link>
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
  backdrop-filter: blur(10px);
  border-radius: .75rem;
  color: white;
  padding: 5rem .75rem .75rem;
  z-index: 0;

  > * {
    opacity: 1;
  }

  @media (max-width: params.$break-point-reg) {
    top: 8rem;
    width: calc( 100% - var(--app-gutter) * 2);
    box-sizing: border-box;
  }
}

.infos-is-open .v-nav__logo {
  @media (min-width: params.$break-point-reg) {
    background: transparent;
    transition: none;
    backdrop-filter: none;
  }
}

.toggle-infos {

  > * {
    transition: transform 1s cubic-bezier(0, .25, 0, 1);

    .infos-is-open & {
      transform: rotate(45deg);
    }
  }

  @media (max-width: params.$break-point-reg) {
    display: none;
  }

  &.toggle-infos--mobile {
    position: fixed;
    top: var(--app-gutter);
    left: var(--app-gutter);
    display: none;

    @media (max-width: params.$break-point-reg) {
      display: block;
    }
  }
}


.v-nav__links {
  @media (max-width: params.$break-point-reg) {
    transition: opacity .25s ease-in-out;
    opacity: 0;
    pointer-events: none;

    .infos-is-open & {
      opacity: 1;
    }
  }
}
</style>
