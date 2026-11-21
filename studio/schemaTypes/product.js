import { defineField, defineType } from 'sanity';

export const productType = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Product Name', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'sku', title: 'SKU', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'subtitle', title: 'Subtitle', type: 'string' }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Full-Sleeves', value: 'full-sleeves' },
          { title: 'Oversized Tees', value: 'oversized-tees' },
          { title: 'Muscle Tanks', value: 'muscle-tanks' },
          { title: 'Limited Drops', value: 'limited-drops' },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'price', title: 'Price (INR ₹)', type: 'number', validation: (r) => r.required().positive() }),
    defineField({ name: 'compareAtPrice', title: 'Compare-At Price (INR ₹)', type: 'number' }),
    defineField({ name: 'gsm', title: 'Fabric Weight (GSM)', type: 'number', initialValue: 260 }),
    defineField({ name: 'fit', title: 'Fit Silhouette', type: 'string', initialValue: 'Boxy Oversized' }),
    defineField({ name: 'fabric', title: 'Fabric Composition', type: 'string' }),
    defineField({ name: 'printTech', title: 'Print Technique', type: 'string' }),
    defineField({ name: 'badges', title: 'Badges', type: 'array', of: [{ type: 'string' }] }),
    defineField({
      name: 'images',
      title: 'Product Gallery Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      validation: (r) => r.min(1),
    }),
    defineField({
      name: 'colors',
      title: 'Colorways',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', title: 'Color Name', type: 'string' },
            { name: 'hex', title: 'Hex Code', type: 'string' },
            { name: 'image', title: 'Colorway Photo', type: 'image', options: { hotspot: true } },
          ],
        },
      ],
    }),
    defineField({
      name: 'sizes',
      title: 'Size Inventory Matrix',
      type: 'object',
      fields: [
        { name: 'S', title: 'Small (S)', type: 'number', initialValue: 10 },
        { name: 'M', title: 'Medium (M)', type: 'number', initialValue: 20 },
        { name: 'L', title: 'Large (L)', type: 'number', initialValue: 20 },
        { name: 'XL', title: 'Extra Large (XL)', type: 'number', initialValue: 15 },
        { name: 'XXL', title: '2XL (XXL)', type: 'number', initialValue: 5 },
      ],
    }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 4 }),
    defineField({ name: 'highlights', title: 'Highlights', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'featured', title: 'Featured on Home', type: 'boolean', initialValue: false }),
    defineField({ name: 'isNewDrop', title: 'New Drop', type: 'boolean', initialValue: true }),
    defineField({ name: 'bestseller', title: 'Bestseller', type: 'boolean', initialValue: false }),
    defineField({ name: 'active', title: 'Active / Visible', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'sku', media: 'images.0' },
  },
});
