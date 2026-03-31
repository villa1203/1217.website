<template>
    <footer class="v-app-footer app-with-padding--left-right app-with-padding--top-bottom"
    >
      <div style="width: 100%; height: 1px; background: white; margin-bottom: var(--app-gutter)"/>

      <div class="v-app-footer__container app-grid app-grid--justify-between app-grid--direction-column">

        <div class="app-grid app-grid--justify-between app-grid-reg--wrap">
          <div class="v-app-footer__left-content">
            <div class="app-text-h1">
              We are always happy to meet new people. Give us a call, email or come visit us.
            </div>
          </div>

          <div class="app-grid-reg__col-12 app-reg-display-none">
            <img class="v-app-footer__logo--anim"
                 src="/logo__anime.gif"
            />
          </div>
        </div>

        <div class="app-grid app-grid--justify-between app-grid-reg--wrap">
          <div class="app-grid-reg__col-12">
            <img class="v-app-footer__logo"
                 src="/logo.svg" />
          </div>

          <div>
            <div>Rue de Lyon 22</div>
            <div>Genève 1203</div>
            <div>Switzerland</div>
          </div>

          <div>
            <div>24 Rue Royale</div>
            <div>Lyon 69001</div>
            <div>France</div>
          </div>

          <div>
            <div>Contact</div>
            <div>hello@mail.mail</div>
            <div>+41 000 00 00 00</div>
          </div>

          <div>
            <div class="app-grid app-grid--justify-end app-grid--align-center">
              <button class="app-button app-button--variant-primary">Linkedin</button>
              <button class="app-button app-button--variant-primary">Instagram</button>
            </div>
          </div>
        </div>

      </div>

    </footer>
</template>





<script setup lang="ts">
import { defineProps } from 'vue'

defineProps<{
    message?: string
}>()
</script>





<style lang="scss" scoped >
@use "../assets/_params";

.v-app-footer {
  margin-top: 10rem;
  width: 100%;
  color: white;
  background: black;
}

.v-app-footer__container {
  height: calc(100vh - 7rem);

  @media (max-width: params.$break-point-reg) {
    height: auto;
    row-gap: var(--app-row-gap-small);
  }
}

.v-app-footer__left-content {
  max-width: 40em;

  @media (max-width: params.$break-point-reg) {
    max-width: 100%;
  }
}

.v-app-footer__logo {
  height: 2rem;
}

.v-app-footer__logo--anim {
  display: block;
  width: 15rem;
}
</style>
