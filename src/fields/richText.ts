import type { Block } from 'payload'

import {
  BlocksFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
  RelationshipFeature,
  UploadFeature,
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
    // Mối quan hệ chỉ tới nội dung công khai, ảnh chỉ từ Thư viện (không lộ tệp bản vẽ, tài khoản, yêu cầu báo giá)
    ...defaultFeatures.filter((f) => f.key !== 'relationship' && f.key !== 'upload'),
    RelationshipFeature({ enabledCollections: ['products', 'posts', 'pages', 'product-categories', 'post-categories'] }),
    UploadFeature({ enabledCollections: ['media'] }),
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
