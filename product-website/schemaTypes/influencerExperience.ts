import {defineArrayMember, defineField, defineType} from 'sanity'
import {blogContentBlocks} from './blogContentBlocks'

export default defineType({
  name: 'influencerExperience',
  title: 'Influencer Experience',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'excerpt', title: 'Excerpt', type: 'text', rows: 3}),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {list: ['Research', 'Protocols', 'Ingredients', 'Lifestyle']},
      initialValue: 'Lifestyle',
    }),
    defineField({name: 'readTime', title: 'Read Time', type: 'string', initialValue: '4 min read'}),
    defineField({name: 'publishedAt', title: 'Published At', type: 'string'}),
    defineField({name: 'authorName', title: 'Author Name', type: 'string'}),
    defineField({name: 'reviewedBy', title: 'Reviewed By', type: 'string'}),
    defineField({name: 'scienceNote', title: 'Science Note', type: 'text', rows: 2}),
    defineField({
      name: 'heroType',
      title: 'Hero Type',
      type: 'string',
      options: {list: ['image', 'video']},
      initialValue: 'video',
    }),
    defineField({name: 'heroAlt', title: 'Hero Alt', type: 'string'}),
    defineField({name: 'heroImage', title: 'Hero Image', type: 'image', options: {hotspot: true}}),
    defineField({
      name: 'heroVideo',
      title: 'Hero Video',
      type: 'file',
      options: {accept: 'video/*'},
    }),
    defineField({name: 'influencerName', title: 'Influencer Name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'influencerHandle', title: 'Influencer Handle', type: 'string'}),
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: {list: ['Instagram', 'TikTok', 'YouTube', 'Podcast']},
    }),
    defineField({name: 'experienceSummary', title: 'Experience Summary', type: 'text', rows: 4}),
    defineField({
      name: 'featuredProducts',
      title: 'Featured Products',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'mediaGallery',
      title: 'Creator Media (Images + Videos)',
      type: 'array',
      of: [
        defineArrayMember({type: 'image', options: {hotspot: true}}),
        defineArrayMember({
          type: 'file',
          name: 'creatorVideo',
          options: {accept: 'video/*'},
        }),
      ],
      validation: (rule) => rule.min(2),
    }),
    defineField({
      name: 'bullets',
      title: 'Key Takeaways',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'storySections',
      title: 'Story Sections',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'storySection',
          fields: [
            defineField({name: 'heading', title: 'Heading', type: 'string'}),
            defineField({name: 'body', title: 'Body', type: 'text', rows: 5}),
          ],
        }),
      ],
    }),
    defineField({
      name: 'contentBlocks',
      title: 'Content Blocks',
      type: 'array',
      of: blogContentBlocks(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'influencerName',
      media: 'heroImage',
    },
    prepare({title, subtitle, media}) {
      return {
        title,
        subtitle: subtitle ? `Influencer: ${subtitle}` : 'Influencer Story',
        media,
      }
    },
  },
})
