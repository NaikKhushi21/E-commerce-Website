import {defineField, defineType} from 'sanity'

const CATEGORIES = [
  'Antioxidant Vitamin',
  'Liposomal Antioxidant',
  'Essential Mineral',
  'Adaptogen',
  'Bioactive Cofactor',
  'Cellular Cofactor',
  'Phytocompound',
  'Phospholipid',
  'Amino Acid',
  'Active Compound',
] as const

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
  name: 'ingredient',
  title: 'Ingredient',
  type: 'document',
  fields: [
    defineField({
      name: 'key',
      title: 'Key (slug)',
      type: 'slug',
      description:
        "Stable identifier used in code (e.g., 'vitamin-c', 'glutathione'). Lowercase, hyphenated.",
      options: {source: 'name', maxLength: 60},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Display name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {list: [...CATEGORIES]},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'function',
      title: 'Function (1–3 sentence description)',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'dose',
      title: 'Dose per serving (optional)',
      type: 'string',
      description: "e.g., '1000 mg', '5000 IU'",
    }),
    defineField({
      name: 'synergies',
      title: 'Synergies (other ingredient keys)',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Keys of ingredients this one pairs well with.',
    }),
    defineField({
      name: 'goals',
      title: 'Wellness goals served',
      type: 'array',
      of: [{type: 'string', options: {list: [...GOALS]}}],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'category'},
  },
})
