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

        <div ref="logoRef"
             class="app-button app-button--reverse-with-dark-view v-nav__logo"
             style="z-index: 10; transition-delay: .25s;"
             @click="navigateTo('/')"
        >
          <div class="app-grid app-grid--align-center">
            <img src="/logo.svg"/>
            <div class="toggle-infos"
                 @click.stop="infosIsOpen = !infosIsOpen"
            >
              <UIOpen/>
            </div>
          </div>
        </div>

        <transition name="nav-info">
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

const infosIsOpen = ref(false)
const logoRef = ref<HTMLElement | null>(null)

useRouter().beforeEach(() => {
  infosIsOpen.value = false
})

watch(infosIsOpen, async (newVal) => {
  if (!newVal && logoRef.value) {
    logoRef.value.style.transition = 'none'
    await nextTick()
    logoRef.value.style.transition = ''
  }
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

// When open, strip visual styling from the logo button so the panel reads as one block.
// All changes are delayed 150ms so the panel has faded in enough to cover the logo area
// before the logo becomes transparent — prevents the white page showing through.
.infos-is-open .v-nav__logo {
  @media (min-width: params.$break-point-reg) {
    background: transparent !important;
    backdrop-filter: none !important;
    border-color: transparent !important;
    box-shadow: none !important;
    text-shadow: none !important;
    transition: background     0s 0.15s,
                backdrop-filter 0s 0.15s,
                border-color   0s 0.12s,
                box-shadow     0s 0.12s,
                text-shadow    0s 0.12s !important;
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

// ── Info panel morph transition ───────────────────────────────────────────────
// transform-origin: top left = panel grows out of / collapses into the button corner

.nav-info-enter-active {
  transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1),
              opacity    0.2s  ease;
  transform-origin: top left;
}
.nav-info-enter-from {
  transform: scaleX(0.5) scaleY(0.06);
  opacity: 0;
}

.nav-info-leave-active {
  transition: transform 0.38s cubic-bezier(0.4, 0, 1, 1),
              opacity    0.22s ease;
  transform-origin: top left;
}
.nav-info-leave-to {
  transform: scaleX(0.5) scaleY(0.06);
  opacity: 0;
}

.v-nav__links {
  @media (max-width: params.$break-point-reg) {
    transition: opacity .25s ease-in-out;
    opacity: 0;
    pointer-events: none;

    .infos-is-open & {
      pointer-events: auto;
      opacity: 1;
    }
  }
}
</style>
