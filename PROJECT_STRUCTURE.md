# Real Growth Labs - Project Structure

## 🎯 Project Overview
A complete Next.js 14 application for Real Growth Labs - a platform that helps creators turn their knowledge into books, lead magnets, and audiobooks using AI.

## 📁 File Structure

```
/app
  /api                    # API route handlers
    /auth                 # Authentication endpoints
    /books                # Book management endpoints
    /builder              # AI builder endpoints
    /storage              # File upload endpoints
    /audiobook           # Audiobook generation endpoints
  /dashboard             # Dashboard page
  /books                 # Books library page
  /builder               # Book builder page
  /features              # Features page
  /pricing               # Pricing page
  /about                 # About page
  /contact               # Contact page
  /login                 # Login page
  /signup                # Signup page
  layout.tsx             # Root layout with providers
  page.tsx               # Home page
  globals.css            # Global styles with theme
  sitemap.ts             # SEO sitemap
  robots.ts              # SEO robots.txt
  providers.tsx          # React Query provider

/components
  NavBar.tsx             # Main navigation component
  Footer.tsx              # Footer component
  Hero.tsx               # Reusable hero component
  FeatureCards.tsx      # Feature cards display
  PricingTable.tsx       # Pricing plans table
  TestimonialSection.tsx # Testimonials display
  FAQ.tsx                # FAQ accordion component
  /ui                   # Shadcn UI components
    button.tsx
    card.tsx
    input.tsx
    label.tsx
    textarea.tsx

/sections
  /hero                  # Hero sections
  /features              # Feature sections
  /pricing               # Pricing sections
  /testimonials          # Testimonial sections
  /faq                   # FAQ sections
  /cta                   # Call-to-action sections

/lib
  utils.ts               # Utility functions (cn, etc.)
  constants.ts           # App constants and config
  validations.ts         # Zod validation schemas
  analytics.ts           # Analytics tracking functions
  prisma.ts              # Prisma client instance

/prisma
  schema.prisma          # Database schema (placeholder)

/public                  # Static assets (add logos, images here)
```

## 🎨 Theme
- **Primary Color**: #D40000 (Red)
- **Background**: White (#FFFFFF)
- **Text**: Neutral grays
- **Style**: Clean, modern, Typeset.com-inspired

## 🚀 Tech Stack
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Shadcn UI
- Framer Motion
- React Query
- Prisma (placeholder)
- Zod (validation)
- Lucide Icons

## 📝 Next Steps
1. Install dependencies: `npm install`
2. Set up database connection in `.env`
3. Run Prisma migrations: `npm run db:push`
4. Add Figma screenshots to match design
5. Connect API routes to actual services
6. Add authentication logic
7. Implement AI integrations

## 🔧 Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio

