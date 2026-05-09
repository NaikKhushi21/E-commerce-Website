import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'productReview',
  title: 'Product Review',
  type: 'document',
  fields: [
    defineField({
      name: 'author',
      title: 'Author label',
      type: 'string',
      description: "Initials or short name shown under the quote (e.g., 'M.K.', 'Priya R.').",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'rating',
      title: 'Star rating',
      type: 'number',
      options: {
        list: [
          {title: '★★★★★ (5)', value: 5},
          {title: '★★★★ (4)', value: 4},
          {title: '★★★ (3)', value: 3},
        ],
      },
      validation: (rule) => rule.required().min(3).max(5),
    }),
    defineField({
      name: 'tag',
      title: 'Topic tag',
      type: 'string',
      description: 'e.g., Absorption, Taste, Sleep, Stress, Energy.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'quote',
      title: 'Review quote',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().max(360),
    }),
    defineField({
      name: 'productSlug',
      title: 'Linked product slug (optional)',
      type: 'string',
      description:
        'Shopify product handle this review is for. Leave empty to show as a general review across all products.',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    }),
    defineField({
      name: 'verified',
      title: 'Verified purchase',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      author: 'author',
      rating: 'rating',
      tag: 'tag',
      slug: 'productSlug',
    },
    prepare({author, rating, tag, slug}) {
      return {
        title: `${author ?? '?'} · ${'★'.repeat(rating ?? 0)}`,
        subtitle: `${tag ?? ''}${slug ? ` · ${slug}` : ''}`,
      }
    },
  },
})
