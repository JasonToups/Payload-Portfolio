import type { Payload, PayloadRequest, RequiredDataFromCollectionSlug } from 'payload'
import { slugify } from 'payload/shared'

type KeywordName =
  | 'payload'
  | 'ai'
  | 'design system'
  | 'accessibility'
  | 'self hosting'
  | 'ui/ux design'
  | 'penpot'
  | 'claude'

type KeywordIdMap = Record<KeywordName, number>

type PostSeedEntry = {
  title: string
  postDescription: string
  keywordNames: [KeywordName, KeywordName]
}

type SeedPostsArgs = {
  payload: Payload
  req: PayloadRequest
}

const LOREM_IPSUM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'

const KEYWORD_NAMES: KeywordName[] = [
  'payload',
  'ai',
  'design system',
  'accessibility',
  'self hosting',
  'ui/ux design',
  'penpot',
  'claude',
]

const POST_SEED_DATA: PostSeedEntry[] = [
  {
    title: 'Payload CMS Meets AI: Building Smart Content Pipelines',
    postDescription:
      'Explore how AI integrates with Payload CMS to automate content workflows and enhance editorial efficiency.',
    keywordNames: ['payload', 'ai'],
  },
  {
    title: 'Payload CMS and Design Systems: Structured Content at Scale',
    postDescription:
      'Learn how Payload CMS can serve as the structured content backend for scalable design system documentation.',
    keywordNames: ['payload', 'design system'],
  },
  {
    title: 'Accessible Content Management with Payload CMS',
    postDescription:
      'Discover best practices for building accessible content management interfaces using Payload CMS.',
    keywordNames: ['payload', 'accessibility'],
  },
  {
    title: 'Self-Hosting Payload CMS: A Complete Guide',
    postDescription:
      'A complete walkthrough for deploying Payload CMS on your own infrastructure with full control and privacy.',
    keywordNames: ['payload', 'self hosting'],
  },
  {
    title: 'Payload CMS and UI/UX Design: Content Meets Experience',
    postDescription:
      'How thoughtful UI/UX design principles shape the experience of Payload CMS admin interfaces.',
    keywordNames: ['payload', 'ui/ux design'],
  },
  {
    title: 'Building with Payload CMS and Penpot: Design-to-Code Workflows',
    postDescription:
      'Bridge the gap between Penpot design specifications and Payload CMS block definitions in your projects.',
    keywordNames: ['payload', 'penpot'],
  },
  {
    title: 'Using Claude to Write and Manage Payload CMS Content',
    postDescription:
      'Leverage Claude AI to generate, review, and manage content directly within Payload CMS hooks and workflows.',
    keywordNames: ['payload', 'claude'],
  },
  {
    title: 'AI-Powered Design Systems: Automation and Consistency',
    postDescription:
      'How AI tools can automate token generation, component naming, and consistency checks in design systems.',
    keywordNames: ['ai', 'design system'],
  },
  {
    title: 'AI Tools for Accessibility Testing and Remediation',
    postDescription:
      'AI-powered tools are reshaping how developers identify and remediate accessibility issues in web applications.',
    keywordNames: ['ai', 'accessibility'],
  },
  {
    title: 'Self-Hosting AI Models: Privacy and Performance Trade-offs',
    postDescription:
      'A guide to running private AI inference on your own hardware without sending data to third-party providers.',
    keywordNames: ['ai', 'self hosting'],
  },
  {
    title: 'AI-Driven UI/UX Design: Faster Prototyping with Intelligence',
    postDescription:
      'AI is accelerating UI/UX design workflows through intelligent prototyping, iteration, and user research automation.',
    keywordNames: ['ai', 'ui/ux design'],
  },
  {
    title: 'AI-Enhanced Design Workflows in Penpot',
    postDescription:
      'Explore emerging workflows that combine AI-assisted design ideation with Penpot open-source design tools.',
    keywordNames: ['ai', 'penpot'],
  },
  {
    title: "Building AI Features with Claude: A Developer's Primer",
    postDescription:
      "A practical introduction to building intelligent features using Anthropic's Claude AI API.",
    keywordNames: ['ai', 'claude'],
  },
  {
    title: 'Design Systems That Prioritize Accessibility from Day One',
    postDescription:
      'Building a design system with accessibility as a first-class concern rather than a retrofit.',
    keywordNames: ['design system', 'accessibility'],
  },
  {
    title: 'Self-Hosting Your Design System: Tokens, Docs, and Assets',
    postDescription:
      'Host your design system documentation and assets on your own infrastructure with full ownership.',
    keywordNames: ['design system', 'self hosting'],
  },
  {
    title: 'Design Systems as the Backbone of Great UI/UX',
    postDescription:
      'How UI/UX design principles guide the architecture and governance of scalable design systems.',
    keywordNames: ['design system', 'ui/ux design'],
  },
  {
    title: 'Building a Design System in Penpot: Step by Step',
    postDescription:
      'Create a comprehensive, open-source design system using Penpot component library and token management.',
    keywordNames: ['design system', 'penpot'],
  },
  {
    title: 'Using Claude to Generate and Maintain Design System Tokens',
    postDescription:
      'Using Claude AI to write design system documentation, generate token suggestions, and maintain component specs.',
    keywordNames: ['design system', 'claude'],
  },
  {
    title: 'Accessibility in Self-Hosted Applications: WCAG Compliance Tips',
    postDescription:
      'Practical strategies for ensuring WCAG compliance in self-hosted web applications and admin interfaces.',
    keywordNames: ['accessibility', 'self hosting'],
  },
  {
    title: 'UI/UX Design for Accessibility: Beyond Contrast Ratios',
    postDescription:
      'Moving beyond color contrast ratios to craft genuinely inclusive UI/UX design experiences.',
    keywordNames: ['accessibility', 'ui/ux design'],
  },
  {
    title: 'Testing Accessibility in Penpot Designs Before Writing Code',
    postDescription:
      'How to evaluate and validate accessibility requirements directly within your Penpot design files.',
    keywordNames: ['accessibility', 'penpot'],
  },
  {
    title: 'Claude as Your Accessibility Audit Co-Pilot',
    postDescription:
      'Using Claude AI as an intelligent co-pilot for reviewing and improving accessibility across your codebase.',
    keywordNames: ['accessibility', 'claude'],
  },
  {
    title: 'Self-Hosting Your UI/UX Stack: Tools, Costs, and Trade-offs',
    postDescription:
      'Trade-offs and decisions involved in building a fully self-hosted UI/UX design and development stack.',
    keywordNames: ['self hosting', 'ui/ux design'],
  },
  {
    title: 'Self-Hosting Penpot: Setup, Configuration, and Production Tips',
    postDescription:
      'Step-by-step guide to deploying and maintaining Penpot on your own servers for your design team.',
    keywordNames: ['self hosting', 'penpot'],
  },
  {
    title: 'Running Claude Locally: Self-Hosted AI for Product Teams',
    postDescription:
      'How product teams can run Claude-compatible AI models locally for cost control and data privacy.',
    keywordNames: ['self hosting', 'claude'],
  },
  {
    title: 'From Penpot to Code: UI/UX Design Handoff Done Right',
    postDescription:
      "A deep dive into Penpot's capabilities for professional UI/UX design handoff workflows.",
    keywordNames: ['ui/ux design', 'penpot'],
  },
  {
    title: 'Claude as a UI/UX Design Partner: Prompting for Better Interfaces',
    postDescription:
      'How to use Claude as a design partner for UI/UX ideation, component feedback, and accessibility review.',
    keywordNames: ['ui/ux design', 'claude'],
  },
  {
    title: 'Penpot and Claude: AI-Assisted Open-Source Design',
    postDescription:
      "Combining Penpot's open-source design tooling with Claude AI to accelerate the design-to-code pipeline.",
    keywordNames: ['penpot', 'claude'],
  },
  {
    title: 'Payload CMS API Design with AI: Schema Generation Strategies',
    postDescription:
      'Advanced techniques for integrating AI schema generation and content summarization into Payload CMS APIs.',
    keywordNames: ['payload', 'ai'],
  },
  {
    title: 'Versioning Your Design System Alongside Payload CMS Collections',
    postDescription:
      'Strategies for versioning and evolving your design system in sync with Payload CMS content collections.',
    keywordNames: ['payload', 'design system'],
  },
  {
    title: 'ARIA-First: Accessibility Patterns for Payload-Powered Frontends',
    postDescription:
      'Implementing proper ARIA patterns and keyboard navigation in Payload CMS-powered frontend applications.',
    keywordNames: ['payload', 'accessibility'],
  },
  {
    title: 'Docker Compose Strategies for Self-Hosting Payload CMS',
    postDescription:
      'Docker Compose configurations and deployment patterns for running Payload CMS in production on your own infrastructure.',
    keywordNames: ['payload', 'self hosting'],
  },
  {
    title: 'Payload CMS as the Backend for a UI/UX Design Portfolio',
    postDescription:
      'Using Payload CMS as a flexible content backend for building showcase-worthy UI/UX design portfolios.',
    keywordNames: ['payload', 'ui/ux design'],
  },
  {
    title: 'Penpot Components Mapped to Payload CMS Blocks',
    postDescription:
      'How to map Penpot design components to Payload CMS block types for a seamless design-to-content workflow.',
    keywordNames: ['payload', 'penpot'],
  },
  {
    title: 'Automating Payload CMS Migrations with Claude Assistance',
    postDescription:
      'Automate Payload CMS database migrations, schema reviews, and content audits using Claude AI assistance.',
    keywordNames: ['payload', 'claude'],
  },
  {
    title: 'Generating Component Documentation with AI in a Design System',
    postDescription:
      'Applying machine learning to enforce consistency and generate documentation across large design system component libraries.',
    keywordNames: ['ai', 'design system'],
  },
  {
    title: 'Automated Accessibility Scans with AI: Tools and Techniques',
    postDescription:
      'Comparing AI-powered accessibility scanning tools and their effectiveness in real-world application audits.',
    keywordNames: ['ai', 'accessibility'],
  },
  {
    title: 'Cost-Effective Self-Hosting with AI Inference Optimization',
    postDescription:
      'Optimizing AI inference costs and latency with self-hosted model deployments and hardware configurations.',
    keywordNames: ['ai', 'self hosting'],
  },
  {
    title: 'Generative UI: How AI Is Reshaping UI/UX Design Processes',
    postDescription:
      'Generative UI is emerging as a powerful paradigm that uses AI to dynamically create interface components.',
    keywordNames: ['ai', 'ui/ux design'],
  },
  {
    title: 'Exporting Penpot Assets with AI Naming Conventions',
    postDescription:
      'Using AI-generated naming conventions and classification to organize large Penpot asset libraries efficiently.',
    keywordNames: ['ai', 'penpot'],
  },
  {
    title: 'Pair Programming with Claude: Real-World Productivity Gains',
    postDescription:
      'Real-world case studies and practical patterns for integrating Claude AI into production software projects.',
    keywordNames: ['ai', 'claude'],
  },
  {
    title: 'Semantic Color Tokens: Bridging Design Systems and Accessibility',
    postDescription:
      'Semantic color token architecture that satisfies both design system flexibility and WCAG accessibility requirements.',
    keywordNames: ['design system', 'accessibility'],
  },
  {
    title: 'Deploying a Design System Docs Site on Your Own Infrastructure',
    postDescription:
      'CI/CD pipelines and infrastructure patterns for deploying design system documentation sites on your own servers.',
    keywordNames: ['design system', 'self hosting'],
  },
  {
    title: 'Component-Driven Development: Design Systems in Practice',
    postDescription:
      'A practical guide to translating design tokens and component specs into production-ready UI implementations.',
    keywordNames: ['design system', 'ui/ux design'],
  },
  {
    title: 'Penpot as the Single Source of Truth for Your Design System',
    postDescription:
      'How enterprise teams use Penpot component libraries as the definitive source of truth for their design systems.',
    keywordNames: ['design system', 'penpot'],
  },
  {
    title: 'Focus Management and Keyboard Navigation in Custom UI Components',
    postDescription:
      'Designing focus states, tab order, and keyboard interactions that create accessible and elegant UI experiences.',
    keywordNames: ['accessibility', 'ui/ux design'],
  },
  {
    title: 'Self-Hosted Observability for Accessible Web Applications',
    postDescription:
      'Monitoring and reporting on accessibility compliance metrics for self-hosted web applications at scale.',
    keywordNames: ['accessibility', 'self hosting'],
  },
  {
    title: 'Penpot Plugins for Automating Accessibility Checks',
    postDescription:
      'Penpot plugins and workflows that help designers identify accessibility issues before handing off to developers.',
    keywordNames: ['accessibility', 'penpot'],
  },
  {
    title: 'UI/UX Design for Developer Portals: Self-Hosting Considerations',
    postDescription:
      'Considerations for UI/UX design when building interfaces for self-hosted developer tools and platforms.',
    keywordNames: ['ui/ux design', 'self hosting'],
  },
  {
    title: "Claude's Role in the Modern Design-to-Code Pipeline",
    postDescription:
      "Claude's emerging role in the design-to-code pipeline and how it changes the UI/UX design process.",
    keywordNames: ['ui/ux design', 'claude'],
  },
]

export const seedPosts = async ({ payload, req }: SeedPostsArgs): Promise<void> => {
  payload.logger.info('Seeding posts for keyword testing...')

  // Step 1: Find Technology category
  const categoryResult = await payload.find({
    collection: 'categories',
    where: { title: { equals: 'Technology' } },
    limit: 1,
    depth: 0,
  })
  if (categoryResult.docs.length === 0) {
    throw new Error('Technology category not found — run the main seed first to create it.')
  }
  const categoryId = categoryResult.docs[0].id

  // Step 2: Find hero image by filename, fall back to ID 29
  let heroImageId: number
  const mediaByFilename = await payload.find({
    collection: 'media',
    where: { filename: { equals: 'post-launch-hero.png' } },
    limit: 1,
    depth: 0,
  })
  if (mediaByFilename.docs.length > 0) {
    heroImageId = mediaByFilename.docs[0].id
  } else {
    try {
      const mediaById = await payload.findByID({ collection: 'media', id: 29, depth: 0 })
      heroImageId = mediaById.id
    } catch {
      throw new Error(
        'Hero image (post-launch-hero.png) not found — upload it to media first.',
      )
    }
  }

  // Step 3: Find author by email, fall back to first user
  const userResult = await payload.find({
    collection: 'users',
    where: { email: { equals: 'toupsi@gmail.com' } },
    limit: 1,
    depth: 0,
  })
  let authorId: number
  if (userResult.docs.length > 0) {
    authorId = userResult.docs[0].id
  } else {
    const anyUser = await payload.find({ collection: 'users', limit: 1, depth: 0 })
    if (anyUser.docs.length === 0) {
      throw new Error('No users found — at least one user must exist to seed posts.')
    }
    authorId = anyUser.docs[0].id
  }

  // Step 4: Upsert all 8 keywords
  payload.logger.info('— Upserting keywords...')
  const keywordIdMap = {} as KeywordIdMap
  for (const name of KEYWORD_NAMES) {
    const existing = await payload.find({
      collection: 'keywords',
      where: { name: { equals: name } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs.length > 0) {
      keywordIdMap[name] = existing.docs[0].id
    } else {
      const created = await payload.create({
        collection: 'keywords',
        data: { name },
        depth: 0,
      })
      keywordIdMap[name] = created.id
    }
  }

  // Step 5: Create 50 posts sequentially
  payload.logger.info(`— Creating ${POST_SEED_DATA.length} posts...`)

  const loremContent = {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: LOREM_IPSUM,
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
  } as RequiredDataFromCollectionSlug<'posts'>['content']

  for (let i = 0; i < POST_SEED_DATA.length; i++) {
    const entry = POST_SEED_DATA[i]
    const expectedSlug = slugify(entry.title)

    // Delete existing post with this slug for idempotency
    const existing = await payload.find({
      collection: 'posts',
      where: { slug: { equals: expectedSlug } },
      limit: 5,
      depth: 0,
    })
    for (const post of existing.docs) {
      await payload.delete({
        collection: 'posts',
        id: post.id,
        depth: 0,
        context: { disableRevalidate: true },
      })
    }

    const keywordIds = entry.keywordNames.map((name) => keywordIdMap[name])

    await payload.create({
      collection: 'posts',
      depth: 0,
      context: { disableRevalidate: true },
      data: {
        title: entry.title,
        postDescription: entry.postDescription,
        categories: [categoryId],
        heroImage: heroImageId,
        content: loremContent,
        keywords: keywordIds,
        authors: [authorId],
        publishedAt: '2026-05-21T00:00:00.000Z',
        _status: 'published',
      } as RequiredDataFromCollectionSlug<'posts'>,
    })

    payload.logger.info(`  (${i + 1}/${POST_SEED_DATA.length}) ${entry.title}`)
  }

  payload.logger.info('Post seeding complete!')
}
