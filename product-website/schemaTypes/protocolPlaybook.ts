import {defineArrayMember, defineField, defineType} from 'sanity'
import {blogContentBlocks} from './blogContentBlocks'

export default defineType({
  name: 'protocolPlaybook',
  title: 'Protocol Playbook',
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
      initialValue: 'Protocols',
    }),
    defineField({name: 'readTime', title: 'Read Time', type: 'string', initialValue: '7 min read'}),
    defineField({name: 'publishedAt', title: 'Published At', type: 'string'}),
    defineField({name: 'authorName', title: 'Author Name', type: 'string'}),
    defineField({name: 'reviewedBy', title: 'Reviewed By', type: 'string'}),
    defineField({name: 'scienceNote', title: 'Science Note', type: 'text', rows: 2}),
    defineField({
      name: 'heroType',
      title: 'Hero Type',
      type: 'string',
      options: {list: ['image', 'video']},
      initialValue: 'image',
    }),
    defineField({name: 'heroAlt', title: 'Hero Alt', type: 'string'}),
    defineField({name: 'heroImage', title: 'Hero Image', type: 'image', options: {hotspot: true}}),
    defineField({
      name: 'heroVideo',
      title: 'Hero Video',
      type: 'file',
      options: {accept: 'video/*'},
    }),
    defineField({name: 'routineName', title: 'Routine Name', type: 'string'}),
    defineField({
      name: 'morningStack',
      title: 'Morning Stack',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'eveningStack',
      title: 'Evening Stack',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'mediaGallery',
      title: 'Protocol Media (Images + Videos)',
      type: 'array',
      of: [
        defineArrayMember({type: 'image', options: {hotspot: true}}),
        defineArrayMember({
          type: 'file',
          name: 'protocolVideo',
          options: {accept: 'video/*'},
        }),
      ],
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
    defineField({
      name: 'weeklyPlan',
      title: 'Weekly Plan',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'planStep',
          fields: [
            defineField({name: 'week', title: 'Week', type: 'string'}),
            defineField({name: 'focus', title: 'Focus', type: 'string'}),
            defineField({name: 'targetMetric', title: 'Target Metric', type: 'string'}),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'routineName',
      media: 'heroImage',
    },
    prepare({title, subtitle, media}) {
      return {
        title,
        subtitle: subtitle ? `Routine: ${subtitle}` : 'Protocol Playbook',
        media,
      }
    },
  },
})
