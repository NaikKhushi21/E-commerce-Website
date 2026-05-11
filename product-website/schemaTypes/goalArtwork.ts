import {defineField, defineType} from 'sanity'

const GOALS = [
  'energy',
  'immunity',
  'gut-health',
  'brain-health',
  'sleep',
  'stress',
  'skin',
  'detox',
  'longevity',
] as const

export default defineType({
  name: 'goalArtwork',
  title: 'Goal Artwork',
  type: 'document',
  description:
    'Botanical/editorial photography paired with each wellness goal. Used by ProductFormulaBlock on the product detail page.',
  fields: [
    defineField({
      name: 'goal',
      title: 'Wellness goal',
      type: 'string',
      options: {list: [...GOALS]},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subject',
      title: 'Subject',
      type: 'string',
      description: "Short caption shown over the image (e.g., 'Citrus', 'Lavender').",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'credit',
      title: 'Photo credit',
      type: 'string',
      description: "Attribution line (e.g., 'Annie Spratt / Unsplash').",
    }),
  ],
  preview: {
    select: {title: 'goal', subtitle: 'subject', media: 'image'},
  },
})
