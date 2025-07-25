# Loopin

A modern Q&A platform with community-driven loops, built with Next.js and TypeScript. Think of it as Stack Overflow meets Discord - where developers can ask questions, share knowledge, and build communities around specific programming topics.

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://typescript.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square&logo=postgresql)](https://neon.tech)

## ✨ Features

### 🔐 Authentication & User Management
- **Secure Authentication** via Clerk with social logins
- **User Profiles** with customizable bio, location, and LeetCode integration
- **Reputation System** with points earned through community engagement
- **Badge System** with Bronze, Silver, and Gold achievements
- **Profile Editing** with rich profile customization

### 💬 Q&A System
- **Ask Questions** with rich text editor (TinyMCE)
- **Answer Questions** with detailed responses and code snippets
- **Voting System** - upvote/downvote questions and answers
- **Question Tagging** with tag following capabilities
- **Search & Filter** questions by newest, frequent, or unanswered
- **Question Collections** - save interesting questions for later
- **Question Views** tracking and display

### 🔄 Loops (Communities)
- **Create Loops** - build topic-specific communities
- **Join/Leave Loops** with member management
- **Loop-specific Questions** - ask questions within a loop context
- **Loop Members** directory with role management
- **Loop Stats** showing member count and activity

### 🌐 Community Features
- **Community Directory** - discover and connect with developers
- **User Interactions** tracking and analytics
- **Tag Following** - follow topics you're interested in
- **Activity Feed** showing community engagement

### 🎨 User Experience
- **Responsive Design** - works seamlessly on desktop and mobile
- **Dark/Light Theme** with system preference detection
- **Modern UI** built with Radix UI components
- **Fast Navigation** with optimized loading states
- **Real-time Updates** using React Query for data synchronization

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4,ShadCN
- **Icons**: React Icons
- **Rich Text**: TinyMCE React
- **Form Handling**: React Hook Form + Zod validation
- **Animations**: Framer Motion

### Backend & Database
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM with Drizzle Kit
- **Authentication**: Clerk
- **API Routes**: Next.js API routes
- **Data Fetching**: TanStack React Query (React Query)

### Development Tools
- **Package Manager**: pnpm
- **Linting**: ESLint with Next.js config
- **Code Formatting**: Prettier (implied)
- **Database Migrations**: Drizzle Kit

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL database (we recommend [Neon](https://neon.tech))
- Clerk account for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/loopin.git
   cd loopin
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

   # Database
   DATABASE_URL=your_neon_database_connection_string

   # TinyMCE (for rich text editor)
   NEXT_PUBLIC_TINYMCE_API_KEY=your_tinymce_api_key
   ```

4. **Set up the database**
   ```bash
   # Generate migrations
   pnpm drizzle-kit generate

   # Run migrations
   pnpm drizzle-kit migrate
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
loopin/
├── app/                          # Next.js 15 App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── sign-in/              # Sign in page
│   │   └── sign-up/              # Sign up page
│   ├── (root)/                   # Main application routes
│   │   ├── (home)/               # Home page with questions list
│   │   ├── ask-question/         # Ask question form
│   │   ├── collection/           # Saved questions
│   │   ├── community/            # Community directory
│   │   ├── loops/                # Loops (communities) section
│   │   ├── profile/              # User profiles
│   │   ├── question/             # Question details and editing
│   │   └── tag/                  # Tag-specific questions
│   ├── api/                      # API routes
│   └── globals.css               # Global styles
├── components/                   # Reusable React components
│   ├── answers/                  # Answer-related components
│   ├── cards/                    # Card components (question, user)
│   ├── common/                   # Shared components
│   ├── forms/                    # Form components
│   ├── layouts/                  # Layout components (sidebar, navbar)
│   ├── loops/                    # Loop-related components
│   ├── profile/                  # Profile components
│   ├── questions/                # Question components
│   └── ui/                       # Base UI components (Radix UI)
├── constants/                    # App constants and configuration
├── db/                          # Database configuration
│   ├── migrations/               # Database migration files
│   └── schema.ts                 # Database schema definitions
├── lib/                         # Utility libraries
│   ├── actions/                  # Server actions
│   ├── axios/                    # API client functions
│   └── utils.ts                  # Utility functions
├── public/                      # Static assets
│   └── assets/                   # Icons and images
├── styles/                      # Additional stylesheets
└── types/                       # TypeScript type definitions
```

## 🗄️ Database Schema

The application uses a PostgreSQL database with the following main entities:

- **Users** - User profiles with authentication data
- **Questions** - Questions posted by users
- **Answers** - Answers to questions
- **Tags** - Topic tags for categorization
- **Loops** - Community groups
- **Votes** - Upvote/downvote system
- **Interactions** - User activity tracking
- **Saved Questions** - User's saved question collections


