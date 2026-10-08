import type { Block } from 'payload'

import {
  BlocksFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const YouTubeBlock: Block = {
  slug: 'youtube',
  labels: { singular: 'Video YouTube', plural: 'Video YouTube' },
  fields: [
    {
      name: 'url',
      type: 'text',
      label: 'Link YouTube',
      required: true,
      admin: { description: 'Dán link video, ví dụ https://www.youtube.com/watch?v=...' },
    },
    { name: 'caption', type: 'text', label: 'Chú thích' },
  ],
}

/** Trình soạn thảo đầy đủ cho bài viết và trang tĩnh. */
export const fullRichText = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    EXPERIMENTAL_TableFeature(),
    BlocksFeature({ blocks: [YouTubeBlock] }),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
})

/** Trình soạn thảo gọn cho mô tả sản phẩm. */
export const simpleRichText = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    HeadingFeature({ enabledHeadingSizes: ['h3', 'h4'] }),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
})
