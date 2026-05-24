'use client'

import { MarkdownLogo } from '@phosphor-icons/react'
import { $createBlockNode, BlockNode, createClientFeature } from '@payloadcms/richtext-lexical/client'
import {
  $convertFromMarkdownString,
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  HEADING,
  INLINE_CODE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  STRIKETHROUGH,
} from '@payloadcms/richtext-lexical/lexical/markdown'
import type {
  ElementTransformer,
  MultilineElementTransformer,
} from '@payloadcms/richtext-lexical/lexical/markdown'
import { $getRoot } from '@payloadcms/richtext-lexical/lexical'
import type { LexicalEditor, LexicalNode } from '@payloadcms/richtext-lexical/lexical'
import type { ToolbarGroupItem } from '@payloadcms/richtext-lexical'

const SUPPORTED_CODE_LANGUAGES = ['typescript', 'javascript', 'css'] as const
type CodeLanguage = (typeof SUPPORTED_CODE_LANGUAGES)[number]

const makeLexicalParagraph = (text: string) => ({
  root: {
    children: [
      {
        children: [
          { detail: 0, format: 0, mode: 'normal', style: '', text, type: 'text', version: 1 },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
})

const BLOCKQUOTE_TRANSFORMER: ElementTransformer = {
  type: 'element',
  dependencies: [BlockNode],
  export: () => null,
  regExp: /^> ?(.+)/,
  replace: (parentNode, children) => {
    const text = children.map((c: LexicalNode) => c.getTextContent()).join('')
    const blockNode = $createBlockNode({
      blockName: '',
      blockType: 'blockQuote',
      content: makeLexicalParagraph(text),
    })
    parentNode.replace(blockNode)
  },
}

const CODE_BLOCK_TRANSFORMER: MultilineElementTransformer = {
  type: 'multiline-element',
  dependencies: [BlockNode],
  export: () => null,
  regExpStart: /^```(\w*)$/,
  regExpEnd: {
    regExp: /^```\s*$/,
  },
  replace: (rootNode, _children, startMatch, _endMatch, linesInBetween) => {
    const languageHint = (startMatch[1] ?? '').toLowerCase()
    const language: CodeLanguage = (SUPPORTED_CODE_LANGUAGES as readonly string[]).includes(
      languageHint,
    )
      ? (languageHint as CodeLanguage)
      : 'typescript'
    const code = (linesInBetween ?? []).join('\n')
    const blockNode = $createBlockNode({
      blockName: '',
      blockType: 'code',
      code,
      language,
    })
    rootNode.replace(blockNode)
  },
}

const MARKDOWN_TRANSFORMERS = [
  HEADING,
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  INLINE_CODE,
  STRIKETHROUGH,
  BLOCKQUOTE_TRANSFORMER,
  CODE_BLOCK_TRANSFORMER,
]

interface MarkdownConverterButtonProps {
  active?: boolean
  anchorElem: HTMLElement
  editor: LexicalEditor
  enabled?: boolean
  item: ToolbarGroupItem
}

const MarkdownConverterButton: React.FC<MarkdownConverterButtonProps> = ({ editor }) => {
  const handleConvert = () => {
    editor.update(() => {
      const text = $getRoot().getTextContent()
      $convertFromMarkdownString(text, MARKDOWN_TRANSFORMERS)
    })
  }

  return (
    <button
      className="toolbar-popup__button toolbar-popup__button-markdownConverter"
      onClick={handleConvert}
      onMouseDown={(e) => e.preventDefault()}
      title="Convert Markdown"
      type="button"
    >
      <MarkdownLogo size={16} />
    </button>
  )
}

export const MarkdownConverterClientFeature = createClientFeature({
  toolbarFixed: {
    groups: [
      {
        items: [
          {
            Component: MarkdownConverterButton,
            key: 'markdownConverterButton',
          },
        ],
        key: 'markdownConverterGroup',
        type: 'buttons',
      },
    ],
  },
})
