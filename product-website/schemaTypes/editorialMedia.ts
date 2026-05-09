import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'editorialMedia',
  title: 'Editorial Media',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          {title: 'Image', value: 'image'},
          {title: 'Video', value: 'video'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'asset',
      title: 'Uploaded asset',
      type: 'file',
      description: "Upload here, OR set 'externalUrl' below.",
    }),
    defineField({
      name: 'externalUrl',
      title: 'External URL (alternative to upload)',
      type: 'url',
      description:
        "Used when the asset lives on a CDN or third-party host. Either this OR 'asset' must be set.",
    }),
    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'string',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      description: "Searchable labels: 'lab', 'gradient', 'particle', 'bottle', 'capsule', etc.",
    }),
    defineField({
      name: 'context',
      title: 'Context',
      type: 'string',
      options: {
        list: [
          {title: 'Editorial (blog backdrop)', value: 'editorial'},
          {title: 'Home video reel', value: 'home-reel'},
          {title: 'Hero atmosphere', value: 'hero'},
          {title: 'Generic / pool', value: 'pool'},
        ],
      },
      initialValue: 'pool',
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'context', media: 'asset'},
  },
})
