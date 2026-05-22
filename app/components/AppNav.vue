<template>
    <nav class="v-nav app-with-padding--left-right app-with-padding--top-bottom"
         :class="{'infos-is-open': navClassOpen, 'mobile-menu-open': mobileMenuOpen}"
    >
      <div class="toggle-infos toggle-infos--mobile app-button app-button--reverse-with-dark-view"
           @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <div>
          <UIOpen/>
        </div>
      </div>

      <div class="app-grid app-grid--justify-between app-grid-reg--wrap app-grid-reg--justify-end">

        <div class="app-button app-button--reverse-with-dark-view v-nav__logo"
             style="z-index: 10;"
             @click="navigateTo('/')"
        >
          <div class="app-grid app-grid--align-center">
            <img src="/logo.svg"/>
            <div class="toggle-infos"
                 :class="{ 'is-open': infosIsOpen }"
                 @click.stop="infosIsOpen = !infosIsOpen"
            >
              <UIOpen/>
            </div>
          </div>
        </div>

        <transition name="nav-info" @after-leave="navClassOpen = false">
          <div v-if="infosIsOpen"
               class="app-rm-child-margin v-nav__infos"
          >
            <div v-if="navInfo?.result?.menu_description"
                 class="v-nav__infos__description"
                 v-html="navInfo.result.menu_description"
            />

            <div class="v-nav__infos__social">
              <a href="https://www.instagram.com/bureau_1217/" target="_blank" class="v-nav__infos__social__link">Instagram</a>
              <a href="https://fr.linkedin.com/company/bureau-1217" target="_blank" class="v-nav__infos__social__link">Linkedin</a>
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
import type { CMS_API_Response } from "#shared/cms_api";

type NavInfoData = CMS_API_Response & {
  result: { menu_description: string }
}

const { data: navInfo } = useFetch<NavInfoData>('/api/CMS_KQLRequest', {
  lazy: true,
  method: 'POST',
  body: {
    query: `page('informations-site')`,
    select: { menu_description: 'page.menu_description.value' }
  }
})

const infosIsOpen  = ref(false)
const navClassOpen = ref(false)   // stays true until leave transition ends
const mobileMenuOpen = ref(false)

watch(infosIsOpen, (val) => {
  if (val) navClassOpen.value = true
  // navClassOpen cleared by @after-leave on the transition
})

useRouter().beforeEach(() => {
  infosIsOpen.value = false
  mobileMenuOpen.value = false
})

onMounted(() => {
  const mq = window.matchMedia('(max-width: 900px)')
  const onBreakpoint = (e: MediaQueryListEvent) => {
    if (e.matches) infosIsOpen.value = false
  }
  mq.addEventListener('change', onBreakpoint)
  onBeforeUnmount(() => mq.removeEventListener('change', onBreakpoint))
})




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
  background: var(--app-glass-bg);
  backdrop-filter: blur(10px);
  border-radius: .75rem;
  color: white;
  padding: 5rem .75rem .75rem;
  z-index: 0;

  // Unified outline + shadow for the whole block
  border: 0.5px solid hsla(0, 0%, 100%, 0.18);
  box-shadow: 0 4px 24px hsla(0, 0%, 0%, 0.3),
              inset 0 1px 0 hsla(0, 0%, 100%, 0.08);

  > * {
    opacity: 1;
  }

  // v-html content is not scoped — target p tags explicitly
  :deep(p) {
    opacity: 1;
    color: white;
  }

  @media (max-width: params.$break-point-reg) {
    top: 8rem;
    width: calc( 100% - var(--app-gutter) * 2);
    box-sizing: border-box;
  }
}

.infos-is-open .v-nav__logo {
  @media (min-width: params.$break-point-reg) {
    background: transparent !important;
    backdrop-filter: none !important;
    border-color: transparent !important;
    box-shadow: none !important;
    transition: background      0.3s ease,
                backdrop-filter 0.3s ease,
                border-color    0.3s ease,
                box-shadow      0.3s ease !important;
  }
}

.toggle-infos {

  > * {
    transition: transform 1s cubic-bezier(0, .25, 0, 1);

    .mobile-menu-open & {
      transform: rotate(45deg);
    }
  }

  &.is-open > * {
    transform: rotate(45deg);
  }

  @media (max-width: params.$break-point-reg) {
    display: none;
  }

  &.toggle-infos--mobile {
    position: fixed;
    top: var(--app-gutter);
    right: var(--app-gutter);
    z-index: 1001;
    display: none;
    touch-action: manipulation;
    transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);

    > * {
      @media (max-width: params.$break-point-reg) {
        transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
      }
    }

    @media (max-width: params.$break-point-reg) {
      display: block;
    }

    .mobile-menu-open & {
      transform: translateX(calc(2 * var(--app-gutter) + 100% - 100vw));
      z-index: 1002;
    }
  }
}


.v-nav__infos__social {
  display: flex;
  gap: 0.75rem;
  margin-top: 10rem;
  margin-bottom: 0.2rem;
}

.v-nav__infos__social__link {
  color: white;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: hsla(0, 0%, 60%, 1);
  }
}

// Panel ~20rem tall, button clip ~3rem tall.
// R_start = 0.75rem × (3/20) = 0.11rem keeps R/height constant throughout
// → corner proportion stays identical at every frame, regardless of easing.
.nav-info-enter-active {
  transition: clip-path 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  > * { transition: opacity 0.3s ease 0.25s; }
}
.nav-info-enter-from {
  clip-path: inset(0 calc(100% - 8rem) calc(100% - 3rem) 0 round 0.11rem);
  > * { opacity: 0; }
}
.nav-info-enter-to {
  clip-path: inset(0 round 0.75rem);
}

.nav-info-leave-active {
  transition: clip-path 0.22s cubic-bezier(0.4, 0, 1, 1);
  > * { transition: opacity 0.12s ease; }
}
.nav-info-leave-from {
  clip-path: inset(0 round 0.75rem);
}
.nav-info-leave-to {
  clip-path: inset(0 calc(100% - 8rem) calc(100% - 3rem) 0 round 0.11rem);
  > * { opacity: 0; }
}

.v-nav__logo {
  @media (max-width: params.$break-point-reg) {
    margin-right: auto;
    transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);

    .mobile-menu-open & {
      transform: translateX(calc(-100% - var(--app-gutter) * 2));
      pointer-events: none;
    }
  }
}

// Restore the desktop info-panel open delay (was previously inline on the element)
.infos-is-open .v-nav__logo {
  @media (min-width: params.$break-point-reg) {
    transition-delay: 0.25s;
  }
}

.v-nav__links {
  @media (max-width: params.$break-point-reg) {
    position: fixed;
    top: var(--app-gutter);
    right: var(--app-gutter);
    z-index: 1001;
    transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1),
                opacity   0.2s ease;
    opacity: 0;
    pointer-events: none;
    transform: translateX(calc(100% + var(--app-gutter)));

    .infos-is-open &,
    .mobile-menu-open & {
      pointer-events: auto;
      opacity: 1;
      transform: translateX(0);
    }
  }
}
</style>
