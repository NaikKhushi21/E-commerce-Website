import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Editorial copy that overrides or fills in Shopify product data.
 *
 * Resolution order (in code): Sanity values win when present, otherwise we
 * fall back to whatever was parsed from Shopify's descriptionHtml. The
 * `handle` field links a document to a Shopify product handle (e.g.,
 * "liposomal-vitamin-c"). One enrichment doc per Shopify product.
 */
export default defineType({
  name: 'productEnrichment',
  title: 'Product Copy',
  type: 'document',
  fields: [
    defineField({
      name: 'handle',
      title: 'Shopify handle',
      type: 'slug',
      description:
        "Must match the Shopify product handle exactly (e.g., 'liposomal-vitamin-c', 'nad').",
      options: {maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'displayTitle',
      title: 'Display title (optional override)',
      type: 'string',
      description: 'Leave blank to use the Shopify product title.',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short description / subtitle',
      type: 'text',
      rows: 2,
      description: 'One-line subtitle shown under the product title on the PDP.',
    }),
    defineField({
      name: 'benefits',
      title: 'Benefits',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      description:
        'Bullet list of benefits (one per line). Recommended: 3–6 items, each ~5–10 words.',
      validation: (rule) => rule.max(8),
    }),
    defineField({
      name: 'descriptionRich',
      title: 'About this formula',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'paragraph',
          fields: [defineField({name: 'text', title: 'Paragraph', type: 'text', rows: 4})],
          preview: {select: {title: 'text'}},
        }),
      ],
      description: 'Long-form paragraphs that describe the product.',
    }),
    defineField({
      name: 'howToUse',
      title: 'How to enjoy',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      description: 'Usage / dosage steps. One per line (e.g., "Dose: 12 pumps daily").',
    }),
    defineField({
      name: 'ingredientsActive',
      title: 'Active ingredients',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      description: 'Active ingredients list (one per line).',
    }),
    defineField({
      name: 'ingredientsOther',
      title: 'Other ingredients',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      description: 'Inactive / other ingredients (one per line).',
    }),
    defineField({
      name: 'proTip',
      title: 'Pro tip / pairing',
      type: 'text',
      rows: 2,
      description: 'Optional pairing or usage tip surfaced as a callout.',
    }),
    defineField({
      name: 'coaUrl',
      title: 'Certificate of Analysis URL',
      type: 'url',
      description: 'Link to a PDF or image showing third-party test results.',
    }),
  ],
  preview: {
    select: {title: 'displayTitle', subtitle: 'handle.current'},
    prepare({title, subtitle}) {
      return {
        title: title || subtitle || 'Untitled product copy',
        subtitle: subtitle ? `handle: ${subtitle}` : undefined,
      }
    },
  },
})
