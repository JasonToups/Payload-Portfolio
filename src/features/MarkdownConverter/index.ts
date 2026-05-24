import { createServerFeature } from '@payloadcms/richtext-lexical'

export const MarkdownConverterFeature = createServerFeature({
  feature: () => ({
    ClientFeature: '@/features/MarkdownConverter/client#MarkdownConverterClientFeature',
  }),
  key: 'markdownConverter',
})
