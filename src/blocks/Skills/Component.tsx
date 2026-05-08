import React from 'react'
import { RevealOnScroll } from '@/components/RevealOnScroll'

interface SkillItem {
  name: string
}

interface SkillCategory {
  name: string
  items?: SkillItem[]
}

interface SkillsBlockProps {
  heading?: string
  description?: string
  categories?: SkillCategory[]
}

export const SkillsBlock: React.FC<SkillsBlockProps> = ({ heading, description, categories }) => {
  if (!categories?.length) return null

  return (
    <section className="section-dark py-24">
      <div className="container">
        <RevealOnScroll>
          <div className="mb-16 max-w-2xl">
            {heading && (
              <h2 className="text-headline mb-4">
                {heading}
              </h2>
            )}
            {description && (
              <p
                className="text-body"
                style={{ color: 'var(--neutral-400)' }}
              >
                {description}
              </p>
            )}
          </div>
        </RevealOnScroll>

        <RevealOnScroll stagger>
          <div className="grid grid-cols-2 gap-x-16 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((category, index) => (
              <div key={index}>
                <p
                  className="text-label mb-4"
                  style={{ color: 'var(--primary-base)' }}
                >
                  {category.name}
                </p>
                <ul className="space-y-2">
                  {category.items?.map((item, i) => (
                    <li
                      key={i}
                      className="text-body"
                      style={{ color: 'var(--neutral-350)', fontSize: '1rem' }}
                    >
                      {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
