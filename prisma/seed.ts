import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default templates
  const templates = await Promise.all([
    prisma.template.upsert({
      where: { slug: 'classic' },
      update: {},
      create: {
        name: 'Classic Elegance',
        slug: 'classic',
        description: 'Timeless design with serif fonts and traditional layout',
        isPremium: false,
        styleConfig: {
          colors: {
            primary: '#1D3557',
            secondary: '#C9A368',
            background: '#FFFFFF',
            text: '#444444'
          },
          fonts: {
            heading: 'Playfair Display',
            body: 'Inter'
          },
          layout: 'centered'
        }
      }
    }),
    prisma.template.upsert({
      where: { slug: 'modern' },
      update: {},
      create: {
        name: 'Modern Minimalist',
        slug: 'modern',
        description: 'Clean lines and contemporary typography',
        isPremium: false,
        styleConfig: {
          colors: {
            primary: '#2C2C2C',
            secondary: '#9CAF88',
            background: '#FFFFFF',
            text: '#444444'
          },
          fonts: {
            heading: 'Inter',
            body: 'Inter'
          },
          layout: 'minimal'
        }
      }
    }),
    prisma.template.upsert({
      where: { slug: 'floral' },
      update: {},
      create: {
        name: 'Garden Romance',
        slug: 'floral',
        description: 'Botanical elements with soft, romantic colors',
        isPremium: false,
        styleConfig: {
          colors: {
            primary: '#9CAF88',
            secondary: '#F5D5D0',
            background: '#F5F0E6',
            text: '#444444'
          },
          fonts: {
            heading: 'Playfair Display',
            body: 'Inter'
          },
          layout: 'floral'
        }
      }
    }),
    prisma.template.upsert({
      where: { slug: 'luxury' },
      update: {},
      create: {
        name: 'Luxury Vows',
        slug: 'luxury',
        description: 'Premium gold accents with sophisticated styling',
        isPremium: true,
        styleConfig: {
          colors: {
            primary: '#1D3557',
            secondary: '#C9A368',
            background: '#F5F0E6',
            text: '#444444'
          },
          fonts: {
            heading: 'Playfair Display',
            body: 'Inter',
            accent: 'Great Vibes'
          },
          layout: 'luxury'
        }
      }
    })
  ])

  console.log('Created templates:', templates.map(t => t.name))
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
