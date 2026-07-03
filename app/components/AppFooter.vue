<template>
    <footer class="v-app-footer app-with-padding--left-right app-with-padding--top-bottom">

      <div class="v-app-footer__projects-list app-grid app-grid--justify-between app-grid--direction-column">

        <div class="v-app-footer__top-row">
          <div class="v-app-footer__inline-newsletter app-text-h1">
            Too many open tabs, some tools we're testing and a few details we overthought. Drop us your email
            <form class="v-app-footer__inline-form" @submit.prevent="handleSubmit">
              <input
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  required
                  size="15"
                  class="v-app-footer__inline-input"
                  :disabled="isSuccess"
                  placeholder="your@email.com"
              />
            </form>
            and we'll send the latest from Bureau 1217 your way.
            <span v-if="message" class="v-app-footer__inline-msg">{{ message }}</span>
          </div>

          <img class="v-app-footer__logo--anim"
               src="/logo__anime.gif"
          />
        </div>

        <div class="v-app-footer__logo-mobile">
          <img class="v-app-footer__logo" src="/logo.svg" />
        </div>

        <div class="app-grid app-grid--justify-between app-grid-reg--wrap app-grid-reg--justify-start">
          <div class="app-grid-reg__col-12 v-app-footer__logo-desktop">
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

type FooterData = CMS_API_Response & {
  result: {
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

watch(() => footerData.value?.result?.footer_email, (val) => {
  if (val) mail.value = val
})

onMounted(() => {
  window.setTimeout(() => {
    if (mail.value.includes('[at]')) {
      mail.value = mail.value.replaceAll('[at]', '@bureau1217.com')
    }
  }, 5_000)
})

// Inline newsletter
const email = ref('')
const message = ref('')
const isSubmitting = ref(false)
const isSuccess = ref(false)

const showMessage = (text: string) => {
  message.value = text
  setTimeout(() => { message.value = '' }, 3000)
}

const handleSubmit = async () => {
  if (isSubmitting.value || isSuccess.value) return
  isSubmitting.value = true
  message.value = ''
  try {
    const res = await fetch('https://1217contactapi.villa1203.deno.net/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, groups: ['Venu du site'] }),
    })
    const data = await res.json()
    if (data.status === 'ok') {
      showMessage("You're on the list.")
      isSuccess.value = true
    } else {
      const isAlready = data.message?.toLowerCase().includes('already') || data.message?.toLowerCase().includes('exist')
      showMessage(isAlready ? "You're already on our list." : 'Please enter a valid email.')
    }
  } catch {
    showMessage('An error occurred. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}
</script>




<style lang="scss" scoped>
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
    row-gap: 3rem;
  }
}

.v-app-footer__top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--app-grid-gap);
}

.v-app-footer__inline-newsletter {
  max-width: 22em;

  @media (max-width: params.$break-point-reg) {
    max-width: 100%;
    font-size: 1.35rem;
  }
}

.v-app-footer__inline-form {
  display: inline;
}

.v-app-footer__inline-input {
  display: inline;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  color: white;
  font-size: inherit;
  font-family: inherit;
  line-height: inherit;
  width: auto;
  outline: none;
  padding: 0 0.5em 0.1em;
  vertical-align: baseline;

  &::placeholder {
    color: rgba(255, 255, 255, 0.35);
  }

  &:disabled {
    opacity: 0.5;
  }
}

.v-app-footer__inline-btn {
  display: inline;
  background: transparent;
  border: none;
  color: white;
  font-size: inherit;
  font-family: inherit;
  cursor: pointer;
  padding: 0 0.1em;
  vertical-align: baseline;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.6;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}

.v-app-footer__inline-msg {
  display: block;
  font-size: 0.55em;
  margin-top: 0.75em;
  opacity: 0.7;
}

.v-app-footer__logo {
  height: 2rem;
}

.v-app-footer__logo-mobile {
  display: none;

  @media (max-width: params.$break-point-reg) {
    display: flex;
    justify-content: center;
  }
}

.v-app-footer__logo-desktop {
  @media (max-width: params.$break-point-reg) {
    display: none;
  }
}

.v-app-footer__logo--anim {
  display: block;
  width: 15rem;
  flex-shrink: 0;

  @media (max-width: params.$break-point-reg) {
    display: none;
  }
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
