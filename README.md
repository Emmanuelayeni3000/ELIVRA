# Elivra - Elegant Event Invitations

A comprehensive event planning application built with modern web technologies to help couples and event planners manage every aspect of their special celebrations.

## 👨‍💻 Developer

**Emmanuel Ayeni** - Full-Stack Developer

## 📋 Overview

Elivra is a powerful event management platform that streamlines the entire event planning process. From event creation and guest management to invitation handling and RSVP tracking, Elivra provides all the tools needed to create unforgettable celebrations.

## 🚀 Features

### Event Management
- Create and manage multiple elegant events
- Event templates for quick setup
- Detailed event information (date, time, location, description)
- Event editing and customization

### Guest Management
- Comprehensive guest list management
- Bulk guest import via CSV
- Guest information tracking (name, email, phone, RSVP status)
- Guest categorization and filtering
- Companion guest email management

### Invitation System
- Digital invitation management
- Bulk invitation sending
- RSVP tracking and responses
- Invitation templates and customization
- QR code generation for invitations
- Companion guest invite system

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
- **Resend** - Email delivery service
- **QR Code Generator** - QR code generation for invitations

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** or **pnpm**
- **PostgreSQL** database
- **Git** for version control

## 🔧 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Emmanuelayeni3000/ELIVRA.git
   cd ELIVRA/wedvite
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
   DATABASE_URL="postgresql://username:password@localhost:5432/elivra"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   RESEND_API_KEY="your-resend-api-key"
   RESEND_FROM_EMAIL="noreply@yourdomain.com"
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
2. Create your first elegant event
3. Add guests to your event
4. Send invitations and track RSVPs
5. Monitor your event planning progress

### Key Workflows
- **Event Creation:** Use the dashboard to create new events with templates
- **Guest Management:** Import guests via CSV or add them manually
- **Invitation Handling:** Send bulk invitations and monitor responses
- **Companion Guests:** Manage additional guests with email notifications
- **Dashboard Monitoring:** Track event progress and guest statistics

## 📁 Project Structure

```
elivra/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Dashboard pages
│   │   └── api/               # API routes
│   ├── components/            # Reusable React components
│   │   ├── ui/               # shadcn/ui components
│   │   └── layout/           # Layout components
│   ├── lib/                  # Utility libraries
│   ├── emails/               # Email templates
│   ├── store/                # Zustand state management
│   └── types/                # TypeScript type definitions
├── prisma/               # Database schema and migrations
└── public/               # Static assets
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
- Email: ayeniemmanuel914@gmail.com
- LinkedIn: [Your LinkedIn Profile](https://linkedin.com/in/emmanuel-ayeni)
- GitHub: [Your GitHub Profile](https://github.com/emmanuel-ayeni)

---

Made with ❤️ by Emmanuel Ayeni for couples planning their perfect celebrations.

## 🎯 About Elivra

Elivra transforms the way you create and manage event invitations. From elegant weddings to exclusive galas, our platform helps you craft the perfect invite for life's most elegant moments.

**Key Highlights:**
- ✨ Elegant invitation templates
- 📧 Automated email management
- 📊 Real-time RSVP tracking
- 👥 Companion guest handling
- 📱 QR code integration
- 🎨 Premium design system

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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
