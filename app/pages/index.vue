<template>
  <main class="v-index"
  >
    <div>
      <Blocks :content="data?.result.content || []" />
    </div>
  </main>
</template>


<script setup lang="ts">
import type {CMS_API_ImageInstance, CMS_API_Response, CMS_BlockData} from "#shared/cms_api";

type FetchData = CMS_API_Response & {
  "result": {
    "title": string,
    "slug": string,
    content: CMS_BlockData[],
  }
}


const {data} = useFetch<FetchData>('/api/CMS_KQLRequest', {
  lazy: true,
  method: 'POST',
  body: {
    query: `page('home')`,
    select: {
      title: true,
      slug: true,
      content: {
        query: 'page.content.content.toBlocks',
        select: {
          id: true,
          type: true,
          isHidden: true,
          content: {
            query: 'block.content',
            select: {
              title: true,
              text: true,
              url: true,
              caption: true,
              credits: true,
              is_style_list: {
                query: 'content.is_style_list.toBool',
              },

              profiles_list: {
                query: 'content.profiles_list.toStructure',
                select: {
                  // photo: {
                  //   query: 'photo.toFiles.first',
                  //   select: {
                  //     alt: "file.alt.value",
                  //     tiny: 'file.resize(50, null, 10)',
                  //     small: 'file.resize(500)',
                  //     reg: 'file.resize(1280)',
                  //     large: 'file.resize(1920)',
                  //     xxl: 'file.resize(2500)',
                  //     focus: 'file.focus',
                  //   },
                  // },
                  first_name: true,
                  last_name: true,
                  function: true,
                  roles: true,
                  id: true,
                }
              },

              pages_liste: {
                query: 'content.pages_liste.toPages',
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  baseline: true,
                  cover: {
                    query: 'page.covers.toFiles.first',
                    select: {
                      alt: "file.alt.value",
                      tiny: 'file.resize(50, null, 10)',
                      small: 'file.resize(500)',
                      reg: 'file.resize(1280)',
                      large: 'file.resize(1920)',
                      xxl: 'file.resize(2500)',
                      focus: 'file.focus',
                    },
                  },
                }
              },
              video_file: {
                query: 'content.video_file.toFiles',
                select: {
                  url: true,
                  id: true,
                  filename: true,
                  mime: true,
                }
              }
            }
          }
        }
      }
    }
  }
})

// type ResolvedPage = {
//   id: string,
//   title: string,
//   slug: string,
//   url: string,
// }
//
// const resolvedPagesMap: ComputedRef<Map<string, ResolvedPage[]>> = computed(() => {
//   const map = new Map<string, ResolvedPage[]>()
//
//   for (const block of data.value?.result.home.pages_list_blocks ?? []) {
//     map.set(block.id, block.resolved_pages)
//   }
//   return map
// })


</script>


<style lang="scss" scoped>
.v-index {
}
</style>
