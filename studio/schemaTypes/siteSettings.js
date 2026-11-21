import { defineField, defineType } from 'sanity';

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site Settings & Theme',
  type: 'document',
  fields: [
    defineField({ name: 'brandWordmark', title: 'Brand Wordmark', type: 'string', initialValue: 'DOFFOR' }),
    defineField({ name: 'announcementEnabled', title: 'Show Announcement Bar', type: 'boolean', initialValue: true }),
    defineField({ name: 'announcementText', title: 'Announcement Text', type: 'string' }),
    defineField({
      name: 'hero',
      title: 'Hero Campaign',
      type: 'object',
      fields: [
        { name: 'eyebrow', title: 'Eyebrow', type: 'string' },
        { name: 'headlineLine1', title: 'Headline Line 1', type: 'string' },
        { name: 'headlineLine2', title: 'Headline Line 2', type: 'string' },
        { name: 'description', title: 'Description', type: 'text', rows: 3 },
        { name: 'image', title: 'Hero Campaign Image', type: 'image', options: { hotspot: true } },
      ],
    }),
    defineField({
      name: 'editorialSplit',
      title: '50/50 Editorial Split Banners',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'eyebrow', title: 'Eyebrow', type: 'string' },
            { name: 'title', title: 'Title', type: 'string' },
            { name: 'href', title: 'Target Link', type: 'string' },
            { name: 'image', title: 'Banner Image', type: 'image', options: { hotspot: true } },
          ],
        },
      ],
    }),
    defineField({
      name: 'lookbookStrip',
      title: 'Homepage Lookbook Strip',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'caption', title: 'Caption', type: 'string' },
            { name: 'image', title: 'Photo', type: 'image', options: { hotspot: true } },
          ],
        },
      ],
    }),
  ],
});
