import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: ['Research', 'Protocols', 'Ingredients', 'Lifestyle'],
      },
    }),
    defineField({
      name: 'readTime',
      title: 'Read Time',
      type: 'string',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'string',
    }),
    defineField({
      name: 'heroType',
      title: 'Hero Type',
      type: 'string',
      options: {
        list: ['image', 'video'],
      },
      initialValue: 'image',
    }),
    defineField({
      name: 'heroAlt',
      title: 'Hero Alt',
      type: 'string',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'heroVideo',
      title: 'Hero Video',
      type: 'file',
      options: {
        accept: 'video/*',
      },
    }),
    defineField({
      name: 'bullets',
      title: 'Bullets',
      type: 'array',
      of: [{type: 'string'}],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
      media: 'heroImage',
    },
    prepare({title, category, media}) {
      return {
        title,
        subtitle: category,
        media,
      }
    },
  },
})
