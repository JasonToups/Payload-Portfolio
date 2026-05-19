import { RequiredDataFromCollectionSlug } from 'payload'

const SUBSCRIBE_FORM_TITLE = 'Subscribe to Newsletter'

export const subscribeForm: RequiredDataFromCollectionSlug<'forms'> = {
  title: SUBSCRIBE_FORM_TITLE,

  // 🚫 Disable Form Builder emails completely.
  // Welcome emails are handled in code via `handleNewsletterSubscribe`.
  confirmationType: 'message',
  confirmationMessage: {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              text: 'Thanks! If you’re new, you’ll receive a welcome email shortly.',
              version: 1,
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
            },
          ],
          version: 1,
          direction: null,
          format: '',
          indent: 0,
        },
      ],
      version: 1,
      direction: null,
      format: '',
      indent: 0,
    },
  },

  submitButtonLabel: 'Subscribe',

  fields: [
    {
      name: 'email',
      blockName: 'email',
      blockType: 'email',
      label: 'Email',
      required: true,
      width: 100,
    },
  ],
}
