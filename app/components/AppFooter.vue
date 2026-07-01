<template>
    <footer class="v-app-footer app-with-padding--left-right app-with-padding--top-bottom">

      <div class="v-app-footer__projects-list app-grid app-grid--justify-between app-grid--direction-column">

        <div class="v-app-footer__top-row">
          <div class="v-app-footer__top-left">
            <div class="app-text-h1"
                 v-html="footerData?.result?.footer_heading"
            />
            <div class="v-app-footer__newsletter">
              <AppNewsletterForm
                  baseURL="https://1217contactapi.villa1203.deno.net"
                  title="Keep up with Bureau 1217’s latest projects."
                  placeholder="enter your email"
                  successMessage="You're on the list."
                  alreadySubscribedMessage="You're already on our list."
                  errorMessage="Please enter a valid email."
              />
            </div>
          </div>

          <img class="v-app-footer__logo--anim"
               src="/logo__anime.gif"
          />
        </div>

        <div class="app-grid app-grid--justify-between app-grid-reg--wrap app-grid-reg--justify-start">
          <div class="app-grid-reg__col-12">
            <img class="v-app-footer__logo"
                 src="/logo.svg" />
          </div>

          <div>
            <div>Contact</div>
            <a class="v-app-footer__mail" :href="`mailto:${mail}`">{{mail}}</a>
          </div>

          <div v-for="col in footerData?.result?.footer_columns" :key="col.label">
            <div>{{ col.label }}</div>
            <div v-html="col.content" />
          </div>

          <div class="v-app-footer__social-wrapper">
            <div class="v-app-footer__social">
              <a href="https://fr.linkedin.com/company/bureau-1217"
                 target="_blank"
                 class="app-button v-app-footer__social__link"
              >Linkedin</a>
              <a href="https://www.instagram.com/bureau_1217/"
                 target="_blank"
                 class="app-button v-app-footer__social__link">Instagram</a>
            </div>
          </div>
        </div>

      </div>

    </footer>
</template>




<script setup lang="ts">
import type { CMS_API_Response } from "#shared/cms_api";
import AppNewsletterForm from "~/components/AppNewsletterForm.vue";

type FooterData = CMS_API_Response & {
  result: {
    footer_heading?: string,
    footer_email?: string,
    footer_columns?: { label: string, content: string }[],
  }
}

const { data: footerData } = useFetch<FooterData>('/api/CMS_KQLRequest', {
  lazy: true,
  method: 'POST',
  body: {
    query: `page('informations-site')`,
    select: {
      footer_heading: 'page.footer_heading.value',
      footer_email: 'page.footer_email.value',
      footer_columns: {
        query: 'page.footer_columns.toStructure',
        select: {
          label: 'structureItem.content.label',
          content: 'structureItem.content.content',
        }
      }
    }
  }
})

const mail = ref('hello[at]')

watch(() => footerData.value?.result?.footer_email, (email) => {
  if (email) mail.value = email
})

onMounted(() => {
  window.setTimeout(() => {
    if (mail.value.includes('[at]')) {
      mail.value = mail.value.replaceAll('[at]', '@bureau1217.com')
    }
  }, 5_000)
})

</script>




<style lang="scss" scoped >
@use "../assets/_params";

.v-app-footer {
  margin-top: 10rem;
  width: 100%;
  color: white;
  background: black;
  padding-top: 0;
}

.v-app-footer__projects-list {
  height: calc(100vh - 7rem);
  min-height: 500px;
  border-top: 1px solid white;
  padding-top: 2rem;

  @media (max-width: params.$break-point-reg) {
    height: auto;
    row-gap: var(--app-row-gap-small);
  }
}

.v-app-footer__top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.v-app-footer__top-left {
  display: flex;
  flex-direction: column;
  gap: var(--app-grid-gap);
  max-width: 40em;

  .app-text-h1 {
    margin-bottom: 1%;
  }

  @media (max-width: params.$break-point-reg) {
    max-width: 100%;
  }
}

.v-app-footer__newsletter {
  width: fit-content;

  :deep(.app-newsletter-form__title) {
    white-space: nowrap;
  }

  @media (max-width: params.$break-point-reg) {
    width: 100%;

    :deep(.app-newsletter-form__title) {
      white-space: normal;
    }
  }
}

.v-app-footer__logo {
  height: 2rem;
}

.v-app-footer__logo--anim {
  display: block;
  width: 15rem;
  margin-right: 0;
  flex-shrink: 0;
}

.v-app-footer__mail {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: var(--app-color-primary);
  }
}

.v-app-footer__social-wrapper {
  display: flex;
  align-items: flex-end;
}

.v-app-footer__social {
  display: flex;
  gap: 0.5rem;
}

.v-app-footer__social__link {
  color: black;
  background: var(--app-color-primary);
  border: 1px solid var(--app-color-primary);
  padding: 0.65rem 0.5rem;
  transition: background var(--app-btn-hover-transition), color var(--app-btn-hover-transition);

  @media (hover: hover) {
    &:hover {
      background: transparent;
      color: var(--app-color-primary);
    }
  }
}
</style>
