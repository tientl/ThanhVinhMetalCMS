import { RichText as LexicalRichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import type { SerializedBlockNode } from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import React from 'react'

import { youtubeId } from '@/lib/format'

type YouTubeFields = { blockType: 'youtube'; url: string; caption?: string | null }

const converters: JSXConvertersFunction<SerializedBlockNode<YouTubeFields>> = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    youtube: ({ node }) => {
      const fields = node.fields
      const id = youtubeId(fields.url)
      if (!id) return null
      return (
        <figure className="my-8">
          <div className="relative aspect-video w-full overflow-hidden bg-deep">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${id}`}
              title={fields.caption || 'Video YouTube'}
              className="absolute inset-0 h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
          {fields.caption && <figcaption className="mt-2 text-sm text-muted-2">{fields.caption}</figcaption>}
        </figure>
      )
    },
  },
})

export const RichText = ({ data, className }: { data: SerializedEditorState | null | undefined; className?: string }) => {
  if (!data) return null
  return <LexicalRichText data={data} converters={converters} className={`prose-lux ${className ?? ''}`} />
}
