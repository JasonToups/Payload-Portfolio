import type { RequiredDataFromCollectionSlug } from 'payload'

// Used for pre-seeded content so that the homepage is not empty
export const homeStatic: RequiredDataFromCollectionSlug<'pages'> = {
  slug: 'home',
  _status: 'published',
  hero: {
    type: 'landingImpact',
    richText: {
      root: {
        type: 'root',
        children: [
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Developer Landing Page',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            tag: 'h1',
            version: 1,
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Developer portfolios don’t communicate your value as an engineer. Present yourself as a business, and show what problems you can solve for any engineering team or client.',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
    links: [
      {
        link: {
          type: 'custom',
          url: '/contact',
          label: 'Work with me',
          newTab: false,
        },
      },
      {
        link: {
          type: 'custom',
          url: '/admin',
          label: 'Visit the admin',
          newTab: false,
        },
      },
    ],
  },
  meta: {
    description: 'A Payload CMS portfolio template for engineers who show up like a product.',
    title: 'Developer Landing Page',
  },
  title: 'Home',
  layout: [
    {
      blockType: 'subscribe',
      heading: 'Stay in the loop.',
      description: 'I write about what I build. Practical, opinionated, no filler. Unsubscribe any time.',
      placeholder: 'Enter your email',
      buttonText: 'Subscribe',
      source: 'homepage',
    },
    {
      blockType: 'services',
      heading: 'What I do',
      description: 'Problems I solve and the teams I work best with.',
      services: [
        {
          title: 'Full-Stack Engineering',
          description: 'End-to-end product development from database schema to deployed UI. I build things that work reliably at scale.',
        },
        {
          title: 'Technical Architecture',
          description: 'System design, API design, and infrastructure decisions that teams can build on for years — not just months.',
        },
        {
          title: 'Team Enablement',
          description: 'Mentorship, code review culture, and engineering process improvements that multiply the output of the whole team.',
        },
      ],
    },
    {
      blockType: 'skills',
      heading: 'My stack',
      categories: [
        {
          name: 'Frontend',
          items: [
            { name: 'React' },
            { name: 'Next.js' },
            { name: 'TypeScript' },
            { name: 'TailwindCSS' },
          ],
        },
        {
          name: 'Backend',
          items: [
            { name: 'Node.js' },
            { name: 'Payload CMS' },
            { name: 'PostgreSQL' },
            { name: 'REST & GraphQL' },
          ],
        },
        {
          name: 'Infrastructure',
          items: [
            { name: 'Vercel' },
            { name: 'Docker' },
            { name: 'GitHub Actions' },
            { name: 'AWS' },
          ],
        },
        {
          name: 'Tools',
          items: [
            { name: 'pnpm' },
            { name: 'Vitest' },
            { name: 'Playwright' },
            { name: 'Linear' },
          ],
        },
      ],
    },
    {
      blockType: 'testimonials',
      heading: 'What people say',
      testimonials: [
        {
          quote: 'One of the most thoughtful engineers I’ve worked with. They don’t just ship features — they ask the right questions before writing a line.',
          author: 'Alex Rivera',
          role: 'Engineering Manager',
          company: 'Acme Corp',
        },
        {
          quote: 'Brought structure to a chaotic codebase and left the team in a much better place. The kind of person you want on every project.',
          author: 'Jordan Lee',
          role: 'CTO',
          company: 'Startup Co',
        },
        {
          quote: 'Great communicator, reliable delivery, and genuinely invested in the product. Rare combination.',
          author: 'Sam Chen',
          role: 'Product Manager',
          company: 'Studio LLC',
        },
      ],
    },
  ],
}
