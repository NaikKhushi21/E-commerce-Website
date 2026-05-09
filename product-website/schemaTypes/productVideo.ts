import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'productVideo',
  title: 'Product Video Clip',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'asset',
      title: 'Video file',
      type: 'file',
      description: "Upload here, OR set 'externalUrl' below.",
    }),
    defineField({
      name: 'externalUrl',
      title: 'External URL (alternative to upload)',
      type: 'url',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Bottles', value: 'bottles'},
          {title: 'Capsules', value: 'capsules'},
          {title: 'Lab', value: 'lab'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'productSlug',
      title: 'Linked product slug (optional)',
      type: 'string',
      description:
        'Shopify product handle. Leave empty for category-pool clips assigned by hash.',
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
      title: 'title',
      subtitle: 'category',
      slug: 'productSlug',
    },
    prepare({title, subtitle, slug}) {
      return {
        title: title ?? '(untitled)',
        subtitle: `${subtitle ?? ''}${slug ? ` · ${slug}` : ''}`,
      }
    },
  },
})
