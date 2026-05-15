import type { SelectField } from 'payload'

export const BUTTON_ICONS = [
  { label: 'None', value: 'none' },
  { label: 'Arrow Right', value: 'arrow-right' },
  { label: 'Arrow Up Right', value: 'arrow-up-right' },
  { label: 'Chevron Right', value: 'chevron-right' },
  { label: 'External Link', value: 'external-link' },
  { label: 'Send', value: 'send' },
  { label: 'Mail', value: 'mail' },
  { label: 'Download', value: 'download' },
  { label: 'Plus', value: 'plus' },
  { label: 'Check', value: 'check' },
] as const

export type ButtonIconName = (typeof BUTTON_ICONS)[number]['value']

export const buttonIconField = (overrides: Partial<SelectField> = {}): SelectField => ({
  name: 'buttonIcon',
  type: 'select',
  defaultValue: 'none',
  admin: { description: 'Icon displayed inside the button' },
  options: BUTTON_ICONS.map(({ label, value }) => ({ label, value })),
  ...overrides,
})
