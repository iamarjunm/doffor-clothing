import { defineField, defineType } from 'sanity';

export const lookbookType = defineType({
  name: 'lookbook',
  title: 'Lookbook Editorial Spread',
  type: 'document',
  fields: [
    defineField({ name: 'lookNumber', title: 'Look Number (e.g. LOOK 01)', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'title', title: 'Editorial Title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'season', title: 'Drop / Season', type: 'string', initialValue: 'Drop 04 — Archive Grunge' }),
    defineField({ name: 'primaryImage', title: 'Primary Editorial Photo', type: 'image', options: { hotspot: true }, validation: (r) => r.required() }),
    defineField({ name: 'secondaryImage', title: 'Secondary Detail Photo', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'stylingNotes', title: 'Styling Notes', type: 'text', rows: 3 }),
    defineField({ name: 'modelSpecs', title: 'Model & Fit Notes', type: 'string' }),
    defineField({
      name: 'featuredProducts',
      title: 'Shoppable Pieces in This Look',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'product' }] }],
    }),
    defineField({ name: 'orderRank', title: 'Display Order', type: 'number', initialValue: 1 }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'lookNumber', media: 'primaryImage' },
  },
});
