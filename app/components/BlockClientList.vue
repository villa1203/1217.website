<template>
  <div class="v-block block-client-list">

    <div class="app-grid app-grid--wrap"
         :class="{
              'app-grid--justify-center': ! ( block_data.content.client_list.length < 9 ),
           }"
    >

      <div class="app-rm-child-margin app-grid-reg__col-12"
           :class="{
              'app-grid__col-5':      block_data.content.client_list.length < 9,
              'app-grid__col-12': ! ( block_data.content.client_list.length < 9 ),
           }"
      >
        <h2 class="app-text-h3 app-text-h3--with-horizontal-correction">{{block_data.content.title}}</h2>
      </div>

      <div class="app-grid-reg__col-12"
           :class="{
              'app-grid__col-7':      block_data.content.client_list.length < 9,
              'app-grid__col-8': ! ( block_data.content.client_list.length < 9 ),
           }"
      >
        <div class="app-block-client-list__clients app-grid app-grid--align-start app-grid--justify-start app-grid--wrap app-grid--no-gap">
          <div class="app-block-client-list__clients__item"
               :class="{
                'app-block-client-list__clients__item--without-logo': !client.logo,
                'app-block-client-list__clients__item--without-logo-negative': !client.logo_negative,
               }"
               v-for="client of block_data.content.client_list"
          >
            <div class="app-grid app-grid--align-center app-grid--justify-center app-aspect-ratio--1-1 app-block-client-list__clients__item__wrap">
              <img class="block-client-list__logo"
                   v-if="client.logo?.reg.url"
                   :src="client.logo?.reg.url"
              />
              <img class="block-client-list__logo block-client-list__logo--negative"
                   v-if="client.logo_negative?.reg.url"
                   :src="client.logo_negative?.reg.url"
              />
              <div v-if=" !client.logo_negative || !client.logo"
                   class="block-client-list__name"
              >{{client.title}}</div>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import type {CMS_API_ImageInstance, CMS_API_Response, CMS_BlockClientList} from "#shared/cms_api"

defineProps<{
  block_data: CMS_BlockClientList,
}>()
</script>


<style lang="scss" scoped>
@use "~/assets/_params";

.app-block-client-list__clients {
  width: 100%;
  box-sizing: border-box;
  border-top: 1px solid var(--app-color-dark);
  border-left: 1px solid var(--app-color-dark);

  &:hover {
    .app-block-client-list__clients__item__wrap {
      opacity: 0.25;
    }
  }
}

.app-block-client-list__clients__item {
  border-right: 1px solid var(--app-color-dark);
  border-bottom: 1px solid var(--app-color-dark);
  box-sizing: border-box;
  width: calc(100% / 4);
  background: var(--app-color-light);
  user-select: none;

  @media (max-width: params.$break-point-reg) {
    width: calc(100% / 2);
  }
}

.app-block-client-list__clients__item__wrap {
  position: relative;
  transition: opacity .5s cubic-bezier(0,.5,1,1);

  &:hover {
    opacity: 1 !important;
  }
}

.block-client-list__logo {
  display: block;
  width: 60%;
  height: auto;
  opacity: 1;

  .app-body-drak-view & {
    opacity: 0;
  }

  &.block-client-list__logo--negative {
    position: absolute;
    opacity: 0;

    .app-body-drak-view & {
      opacity: 1;
    }
  }
}
.block-client-list__name {
  text-align: center;
  font-size: 2vw;
  line-height: 1.05em;
  color: black;
  position: absolute;
  display: none;

  .app-body-drak-view & {
    color: white;
  }

  .app-block-client-list__clients__item--without-logo & {
    display: block;
  }

  .app-body-drak-view .app-block-client-list__clients__item--without-logo-negative & {
    display: block;
  }
}
</style>
