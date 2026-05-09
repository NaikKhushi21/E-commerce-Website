import {defineArrayMember, defineField} from 'sanity'

/**
 * Shared content-blocks array used by researchFeature, influencerExperience,
 * and protocolPlaybook. Single source of truth — add a new block type here
 * and it appears in all three doc types.
 */
export function blogContentBlocks() {
  return [
    defineArrayMember({
      type: 'object',
      name: 'richTextBlock',
      title: 'Rich Text',
      fields: [
        defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
        defineField({name: 'heading', title: 'Heading', type: 'string', validation: (rule) => rule.required()}),
        defineField({
          name: 'body',
          title: 'Body',
          type: 'array',
          validation: (rule) => rule.required().min(1),
          of: [
            defineArrayMember({
              type: 'block',
              styles: [
                {title: 'Paragraph', value: 'normal'},
                {title: 'Sub-heading', value: 'h3'},
                {title: 'Small heading', value: 'h4'},
                {title: 'Pull-quote', value: 'blockquote'},
              ],
              lists: [
                {title: 'Bullet', value: 'bullet'},
                {title: 'Numbered', value: 'number'},
              ],
              marks: {
                decorators: [
                  {title: 'Bold', value: 'strong'},
                  {title: 'Italic', value: 'em'},
                  {title: 'Highlight', value: 'highlight'},
                ],
                annotations: [
                  {
                    name: 'link',
                    type: 'object',
                    title: 'Link',
                    fields: [
                      defineField({
                        name: 'href',
                        type: 'url',
                        title: 'URL',
                        validation: (rule) => rule.required(),
                      }),
                      defineField({
                        name: 'newTab',
                        type: 'boolean',
                        title: 'Open in new tab',
                        initialValue: false,
                      }),
                    ],
                  },
                  {
                    name: 'ingredient',
                    type: 'object',
                    title: 'Ingredient',
                    fields: [
                      defineField({
                        name: 'slug',
                        type: 'string',
                        title: 'Ingredient slug (matches atlas key)',
                        validation: (rule) => rule.required(),
                      }),
                    ],
                  },
                ],
              },
            }),
          ],
        }),
      ],
    }),
    defineArrayMember({
      type: 'object',
      name: 'quoteBlock',
      title: 'Quote',
      fields: [
        defineField({name: 'quote', title: 'Quote', type: 'text', rows: 4, validation: (rule) => rule.required()}),
        defineField({name: 'author', title: 'Author', type: 'string'}),
      ],
    }),
    defineArrayMember({
      type: 'object',
      name: 'statGridBlock',
      title: 'Stat Grid',
      fields: [
        defineField({
          name: 'stats',
          title: 'Stats',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'statItem',
              fields: [
                defineField({name: 'value', title: 'Value', type: 'string', validation: (rule) => rule.required()}),
                defineField({name: 'label', title: 'Label', type: 'string', validation: (rule) => rule.required()}),
                defineField({name: 'detail', title: 'Detail', type: 'string'}),
              ],
            }),
          ],
        }),
      ],
    }),
    defineArrayMember({
      type: 'object',
      name: 'productCalloutBlock',
      title: 'Product Callout',
      fields: [
        defineField({name: 'productSlug', title: 'Product Slug', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'description', title: 'Description', type: 'text', rows: 4, validation: (rule) => rule.required()}),
      ],
    }),
    defineArrayMember({
      type: 'object',
      name: 'comparisonBlock',
      title: 'Comparison',
      fields: [
        defineField({name: 'leftTitle', title: 'Left Title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'rightTitle', title: 'Right Title', type: 'string', validation: (rule) => rule.required()}),
        defineField({
          name: 'rows',
          title: 'Rows',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'comparisonRow',
              fields: [
                defineField({name: 'label', title: 'Label', type: 'string', validation: (rule) => rule.required()}),
                defineField({name: 'left', title: 'Left', type: 'string', validation: (rule) => rule.required()}),
                defineField({name: 'right', title: 'Right', type: 'string', validation: (rule) => rule.required()}),
              ],
            }),
          ],
        }),
      ],
    }),
    defineArrayMember({
      type: 'object',
      name: 'timelineBlock',
      title: 'Timeline',
      fields: [
        defineField({
          name: 'steps',
          title: 'Steps',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'timelineStep',
              fields: [
                defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required()}),
                defineField({name: 'body', title: 'Body', type: 'text', rows: 4, validation: (rule) => rule.required()}),
              ],
            }),
          ],
        }),
      ],
    }),
    defineArrayMember({
      type: 'object',
      name: 'faqBlock',
      title: 'FAQ',
      fields: [
        defineField({
          name: 'items',
          title: 'FAQ Items',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'faqItem',
              fields: [
                defineField({name: 'question', title: 'Question', type: 'string', validation: (rule) => rule.required()}),
                defineField({name: 'answer', title: 'Answer', type: 'text', rows: 3, validation: (rule) => rule.required()}),
              ],
            }),
          ],
        }),
      ],
    }),
    defineArrayMember({
      type: 'object',
      name: 'calloutBlock',
      title: 'Callout',
      fields: [
        defineField({
          name: 'variant',
          title: 'Variant',
          type: 'string',
          options: {list: ['info', 'clinical', 'warning', 'tip']},
          initialValue: 'info',
          validation: (rule) => rule.required(),
        }),
        defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
        defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'body', title: 'Body', type: 'text', rows: 4, validation: (rule) => rule.required()}),
      ],
    }),
    defineArrayMember({
      type: 'object',
      name: 'inlineImageBlock',
      title: 'Inline Image',
      fields: [
        defineField({
          name: 'image',
          title: 'Image',
          type: 'image',
          options: {hotspot: true},
          validation: (rule) => rule.required(),
        }),
        defineField({name: 'alt', title: 'Alt Text', type: 'string'}),
        defineField({name: 'caption', title: 'Caption', type: 'string'}),
        defineField({name: 'credit', title: 'Credit', type: 'string'}),
        defineField({
          name: 'accent',
          title: 'Accent',
          type: 'string',
          options: {list: ['none', 'teal', 'gold', 'cream']},
          initialValue: 'none',
        }),
      ],
    }),
    defineArrayMember({
      type: 'object',
      name: 'citationsBlock',
      title: 'Citations',
      fields: [
        defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string', initialValue: 'References'}),
        defineField({
          name: 'items',
          title: 'Citations',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'citationItem',
              fields: [
                defineField({name: 'title', title: 'Study Title', type: 'string', validation: (rule) => rule.required()}),
                defineField({name: 'authors', title: 'Authors', type: 'string'}),
                defineField({name: 'journal', title: 'Journal', type: 'string'}),
                defineField({name: 'year', title: 'Year', type: 'string'}),
                defineField({name: 'url', title: 'URL', type: 'url'}),
              ],
            }),
          ],
        }),
      ],
    }),
  ]
}
