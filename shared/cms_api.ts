export type CMS_API_Response = {
  code: number,
  status: 'ok' | string,
}

export type CMS_API_ImageInstance = {
  "alt":    null | string,
  "tiny":   CMS_API_Image,
  "small":  CMS_API_Image,
  "reg":    CMS_API_Image,
  "large":  CMS_API_Image,
  "xxl":    CMS_API_Image,
}

export type CMS_API_Image = {
  "extension": string,
  "filename": string,
  "height": number,
  "id": string,
  "mime": string,
  "niceSize": string,
  "template": string
  "type": "image",
  "url": string,
  "width": number
}

export type CMS_API_Page = {
  id: string,
  title: string,
  slug: string,
  url: string,
}

export type BlockData =
  BlockArticleHeadingData |
  BlockImageData |
  BlockTextData |
  BlockVideoData

export interface BlockDataBase {
  "id": string,
  "isHidden": boolean,
  "type": "article_heading" | "image" | "text" | "video"
}

export interface BlockArticleHeadingData extends BlockDataBase {
  "content": {
    "titre": string,
    "text": string
  },
  type: "article_heading"
}

export interface BlockImageData extends BlockDataBase {
  "content": {
    "titre": string,
    "text": string
  },
  "id": string,
  "isHidden": boolean,
  "type": "image"
}

export interface BlockTextData extends BlockDataBase {
  "content": {
    "titre": string,
    "text": string
  },
  "id": string,
  "isHidden": boolean,
  "type": "text"
}

export interface BlockVideoData extends BlockDataBase {
  "content": {
    "titre": string,
    "text": string
  },
  "type": "video"
}
