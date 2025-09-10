# WedVite - Wedding Planning Console

A comprehensive wedding planning application built with modern web technologies to help couples and wedding planners manage every aspect of their special day.

## 👨‍💻 Developer

**Emmanuel Ayeni** - Full-Stack Developer

## 📋 Overview

WedVite is a powerful wedding management platform that streamlines the entire wedding planning process. From event creation and guest management to invitation handling and RSVP tracking, WedVite provides all the tools needed to create unforgettable weddings.

## 🚀 Features

### Event Management
- Create and manage multiple wedding events
- Event templates for quick setup
- Detailed event information (date, time, location, description)
- Event editing and customization

### Guest Management
- Comprehensive guest list management
- Bulk guest import via CSV
- Guest information tracking (name, email, phone, RSVP status)
- Guest categorization and filtering

### Invitation System
- Digital invitation management
- Bulk invitation sending
- RSVP tracking and responses
- Invitation templates and customization

### Dashboard & Analytics
- Interactive dashboard with event overview
- Real-time guest statistics
- RSVP status tracking
- Event progress monitoring

### User Experience
- Responsive design for all devices
- Mobile-optimized interface
- Intuitive navigation with sidebar and mobile hamburger menu
- Professional UI with royal navy and gold color scheme

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components
- **Lucide React** - Beautiful icons

### Backend & Database
- **Next.js API Routes** - Server-side API endpoints
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **NextAuth.js** - Authentication system

### Additional Libraries
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **React Day Picker** - Date selection
- **React Hot Toast** - Notifications

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** or **pnpm**
- **PostgreSQL** database
- **Git** for version control

## 🔧 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/wedvite.git
   cd wedvite
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/wedvite"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   ```

4. **Set up the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Getting Started
1. Sign up for an account or sign in
2. Create your first wedding event
3. Add guests to your event
4. Send invitations and track RSVPs
5. Monitor your wedding planning progress

### Key Workflows
- **Event Creation:** Use the dashboard to create new events with templates
- **Guest Management:** Import guests via CSV or add them manually
- **Invitation Handling:** Send bulk invitations and monitor responses
- **Dashboard Monitoring:** Track event progress and guest statistics

## 📁 Project Structure

```
wedvite/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   └── api/               # API routes
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
├── prisma/               # Database schema and migrations
├── store/                # Zustand state management
└── types/                # TypeScript type definitions
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**Emmanuel Ayeni**
- Email: emmanuel.ayeni@example.com
- LinkedIn: [Your LinkedIn Profile](https://linkedin.com/in/emmanuel-ayeni)
- GitHub: [Your GitHub Profile](https://github.com/emmanuel-ayeni)

---

Made with ❤️ by Emmanuel Ayeni for couples planning their perfect wedding day.This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
