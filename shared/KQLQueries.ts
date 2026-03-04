export const KQL_QUERY_BLOCKS = {
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
            photo: {
              query: 'structureItem.content.photo.toFiles.first',
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
            first_name: 'structureItem.content.first_name',
            last_name: 'structureItem.content.last_name',
            function: 'structureItem.content.function',
            roles: 'structureItem.content.roles',
            id: 'structureItem.content.id',
          }
        },

        pages_liste: {
          query: 'content.pages_liste.toPages',
          select: {
            id: true,
            title: true,
            slug: true,
            baseline: true,
            preview_full_size: true,
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
