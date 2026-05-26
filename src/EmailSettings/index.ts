import type { GlobalConfig } from 'payload'

interface WelcomeEmailSiblingData {
  welcomeEmailEnabled?: boolean
}

export const EmailSettings: GlobalConfig = {
  slug: 'email-settings',
  label: 'Email Settings',
  admin: {
    group: 'Email',
    description:
      'Controls email identity and behavior (welcome email, broadcasts). Verified sender address stays in .env (RESEND_FROM_ADDRESS).',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'fromName',
      label: 'From Name',
      type: 'text',
      defaultValue: 'Jason Toups',
      admin: {
        description:
          'Display name shown in the inbox. The actual sending address is configured via RESEND_FROM_ADDRESS in .env.',
      },
    },
    {
      name: 'replyTo',
      label: 'Reply-To Email',
      type: 'email',
      required: false,
      admin: {
        description:
          'Optional. If set, replies will go to this address (recommended if your "from" address is a no-inbox sender).',
      },
    },
    {
      name: 'senderLabel',
      label: 'Sender Label',
      type: 'text',
      defaultValue: 'Newsletter',
      required: false,
      admin: {
        description: 'Optional label you can use in templates ("Newsletter", "Updates", etc.).',
      },
    },
    {
      name: 'resendAudienceId',
      label: 'Resend Audience ID',
      type: 'text',
      required: false,
      admin: {
        description:
          'Used for Broadcasts. Find this in Resend Dashboard → Audiences → (select your audience) → Audience ID.',
      },
    },
    {
      name: 'welcomeEmailEnabled',
      label: 'Send Welcome Email on Subscribe',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'welcomeSubject',
      label: 'Welcome Email Subject',
      type: 'text',
      defaultValue: 'Welcome to the newsletter!',
      admin: {
        condition: (_, siblingData) =>
          Boolean((siblingData as WelcomeEmailSiblingData)?.welcomeEmailEnabled),
      },
    },
    {
      name: 'welcomeBody',
      label: 'Welcome Email Body',
      type: 'richText',
      admin: {
        condition: (_, siblingData) =>
          Boolean((siblingData as WelcomeEmailSiblingData)?.welcomeEmailEnabled),
        description:
          'WYSIWYG editor. Content is stored as Lexical JSON and converted to HTML when sending.',
      },
    },
    {
      name: 'broadcastAutomations',
      label: 'Broadcast Automations',
      type: 'group',
      admin: {
        description:
          'Choose which Email Template powers each automated broadcast flow.',
      },
      fields: [
        {
          name: 'singlePostTemplate',
          label: 'Single Post Template',
          type: 'relationship',
          relationTo: 'email-templates',
          hasMany: false,
          required: false,
          admin: {
            description:
              '"Draft Broadcast" on a Post uses this template. Should be a Single Post type template.',
          },
        },
        {
          name: 'welcomeEmailTemplate',
          label: 'Welcome Email Template',
          type: 'relationship',
          relationTo: 'email-templates',
          hasMany: false,
          required: false,
          admin: {
            description:
              'New subscriber welcome emails use this template. Should be a Welcome Email type template.',
          },
        },
      ],
    },
  ],
}
