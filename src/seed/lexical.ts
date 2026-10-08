import type { Page } from '@/payload-types'

export type RichText = Page['content']

/**
 * Tạo nội dung richText (Lexical) từ các khối văn bản đơn giản.
 */
type Block =
  | { type: 'p'; text: string }
  | { type: 'h2' | 'h3'; text: string }
  | { type: 'ul'; items: string[] }

const textNode = (text: string) => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text,
  version: 1,
})

const paragraph = (text: string): RichText['root']['children'][number] => ({
  type: 'paragraph',
  children: [textNode(text)],
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  version: 1,
})

const heading = (tag: 'h2' | 'h3', text: string): RichText['root']['children'][number] => ({
  type: 'heading',
  tag,
  children: [textNode(text)],
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
})

const list = (items: string[]): RichText['root']['children'][number] => ({
  type: 'list',
  listType: 'bullet',
  tag: 'ul',
  start: 1,
  children: items.map((item, i) => ({
    type: 'listitem',
    value: i + 1,
    children: [textNode(item)],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  })),
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
})

export const richText = (blocks: Array<Block | string>): RichText => ({
  root: {
    type: 'root',
    children: blocks.map((b) => {
      if (typeof b === 'string') return paragraph(b)
      if (b.type === 'p') return paragraph(b.text)
      if (b.type === 'ul') return list(b.items)
      return heading(b.type, b.text)
    }),
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})
