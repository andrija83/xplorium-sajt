# Full-Stack Next.js Project Blueprint (Grade A++ Production Ready)

**Version:** 2.0
**Based on:** Xplorium Project (2025)
**Last Updated:** 2025-12-13
**Grade:** A++ Production Ready

This is a COMPLETE blueprint for building enterprise-grade, production-ready Next.js applications. It includes everything from code architecture to DevOps, monitoring, security, and feature ideas. Use this to start any new project with professional-grade setup from day one.

---

## Table of Contents

### Part 1: Core Setup
1. [Tech Stack Overview](#1-tech-stack-overview)
2. [Project Initialization](#2-project-initialization)
3. [Project Structure](#3-project-structure)
4. [Database Setup (Neon + Prisma)](#4-database-setup-neon--prisma)
5. [Authentication (NextAuth v5)](#5-authentication-nextauth-v5)
6. [API & Server Actions](#6-api--server-actions)
7. [UI Components (shadcn/ui)](#7-ui-components-shadcnui)
8. [Styling (Tailwind CSS 4)](#8-styling-tailwind-css-4)
9. [Animations (Framer Motion)](#9-animations-framer-motion)
10. [Form Validation (Zod)](#10-form-validation-zod)

### Part 2: Quality & Security
11. [Error Handling](#11-error-handling)
12. [Logging System](#12-logging-system)
13. [Security Implementation](#13-security-implementation)
14. [SEO Configuration](#14-seo-configuration)
15. [Testing Setup](#15-testing-setup)

### Part 3: DevOps & Infrastructure
16. [DevOps & CI/CD](#16-devops--cicd)
17. [Monitoring & Observability](#17-monitoring--observability)
18. [Deployment (Vercel)](#18-deployment-vercel)
19. [Environment Variables](#19-environment-variables)

### Part 4: Advanced Features
20. [Useful Patterns & Code Snippets](#20-useful-patterns--code-snippets)
21. [Email Integration (Resend)](#21-email-integration-resend)
22. [File Uploads & Storage](#22-file-uploads--storage)
23. [Caching Strategies](#23-caching-strategies)
24. [Search Implementation](#24-search-implementation)
25. [Admin Panel Patterns](#25-admin-panel-patterns)
26. [Performance Optimization](#26-performance-optimization)
27. [Accessibility (a11y)](#27-accessibility-a11y)
28. [Internationalization (i18n)](#28-internationalization-i18n)
29. [PWA Setup](#29-pwa-setup)
30. [Real-time Features](#30-real-time-features)

### Part 5: Website Features & Ideas
31. [Feature Ideas Library](#31-feature-ideas-library)
32. [Design Patterns Library](#32-design-patterns-library)
33. [Content Ideas](#33-content-ideas)
34. [Marketing Features](#34-marketing-features)

### Part 6: Production Readiness
35. [Production Checklist](#35-production-checklist)
36. [Launch Day Checklist](#36-launch-day-checklist)
37. [Post-Launch Monitoring](#37-post-launch-monitoring)
38. [Maintenance & Updates](#38-maintenance--updates)

---

## 1. Tech Stack Overview

### Core
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16+ | React framework with App Router |
| React | 19+ | UI library |
| TypeScript | 5+ | Type safety |
| Node.js | 20+ | Runtime |

### Database
| Technology | Purpose |
|------------|---------|
| Neon | Serverless PostgreSQL |
| Prisma | ORM & migrations |

### Authentication
| Technology | Purpose |
|------------|---------|
| NextAuth v5 | Authentication |
| bcrypt | Password hashing |

### UI & Styling
| Technology | Purpose |
|------------|---------|
| Tailwind CSS 4 | Utility-first CSS |
| shadcn/ui | Component library |
| Radix UI | Accessible primitives |
| Framer Motion | Animations |

### DevOps & Quality
| Technology | Purpose |
|------------|---------|
| GitHub Actions | CI/CD |
| SonarCloud | Code quality |
| Dependabot | Dependency updates |
| Husky | Git hooks |
| ESLint 9 | Linting |
| Vitest | Unit testing |
| Playwright | E2E testing |

### Monitoring
| Technology | Purpose |
|------------|---------|
| Sentry | Error tracking |
| Better Uptime | Uptime monitoring |
| Vercel Analytics | Performance monitoring |

---

## 2. Project Initialization

### Create Next.js Project

```bash
npx create-next-app@latest my-project --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
cd my-project
```

### Install Core Dependencies

```bash
# Database
npm install @prisma/client
npm install -D prisma

# Authentication
npm install next-auth@beta @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs

# UI Components
npx shadcn@latest init

# Forms & Validation
npm install zod react-hook-form @hookform/resolvers

# Animations
npm install framer-motion

# Utilities
npm install clsx tailwind-merge date-fns

# Rate Limiting (optional)
npm install @upstash/ratelimit @upstash/redis
```

### Install DevOps Dependencies

```bash
# Testing
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test

# Git Hooks
npm install -D husky lint-staged

# Monitoring
npm install @sentry/nextjs @vercel/analytics
```

### Initialize Tools

```bash
# Prisma
npx prisma init

# Husky
npx husky init

# Sentry
npx @sentry/wizard@latest -i nextjs

# shadcn/ui components (add as needed)
npx shadcn@latest add button input form card dialog table toast
```

---

## 3. Project Structure

```
my-project/
├── .github/
│   ├── workflows/
│   │   └── ci.yml              # CI/CD pipeline
│   └── dependabot.yml          # Dependency updates
├── .husky/
│   └── pre-commit              # Pre-commit hooks
├── app/
│   ├── (auth)/                 # Auth route group
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (main)/                 # Main site route group
│   │   └── page.tsx
│   ├── admin/                  # Admin panel
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── [feature]/
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   └── health/
│   ├── actions/                # Server actions
│   │   ├── auth.ts
│   │   └── [feature].ts
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles
│   ├── error.tsx               # Error boundary
│   ├── not-found.tsx           # 404 page
│   └── loading.tsx             # Loading state
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── common/                 # Shared components
│   ├── auth/                   # Auth components
│   ├── admin/                  # Admin components
│   └── animations/             # Animation components
├── features/                   # Feature-based modules
│   └── [feature]/
│       ├── components/
│       ├── hooks/
│       └── utils/
├── hooks/                      # Custom hooks
│   ├── index.ts
│   ├── use-mobile.ts
│   └── use-toast.ts
├── lib/
│   ├── prisma.ts              # Prisma client
│   ├── auth.ts                # NextAuth config
│   ├── auth-utils.ts          # Auth utilities
│   ├── utils.ts               # General utilities
│   ├── logger.ts              # Logging system
│   ├── validation.ts          # Zod schemas
│   ├── rate-limit.ts          # Rate limiting
│   └── audit.ts               # Audit logging
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Migration files
│   └── seed.ts                # Seed script
├── public/
│   ├── fonts/
│   └── images/
├── tests/                      # E2E tests
├── types/
│   ├── index.ts
│   └── database.ts
├── constants/
│   └── index.ts
├── docs/                       # Documentation
├── scripts/                    # Utility scripts
├── .env.local                  # Local env vars
├── .env.example                # Example env vars
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── eslint.config.mjs
├── sonar-project.properties
└── package.json
```

---

## 4. Database Setup (Neon + Prisma)

### 4.1 Create Neon Database

1. Go to https://neon.tech
2. Create new project
3. Copy connection string

### 4.2 Prisma Configuration

**File: `prisma/schema.prisma`**

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]  // Required for Vercel
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User model with soft delete
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  password      String
  role          Role      @default(USER)
  image         String?
  blocked       Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Soft delete fields
  deleted       Boolean   @default(false)
  deletedAt     DateTime?
  deletedBy     String?

  // Relations
  sessions      Session[]
  bookings      Booking[]
  auditLogs     AuditLog[]

  @@index([email])
  @@index([role])
  @@index([deleted])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  action    String
  entity    String
  entityId  String
  changes   Json?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([entity, entityId])
  @@index([createdAt])
}

enum Role {
  USER
  ADMIN
  SUPER_ADMIN
}
```

### 4.3 Prisma Client Singleton

**File: `lib/prisma.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 4.4 Database Commands

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset
```

---

## 5. Authentication (NextAuth v5)

### 5.1 Auth Configuration

**File: `lib/auth.ts`**

```typescript
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
            deleted: false,
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        if (user.blocked) {
          throw new Error('Account is blocked')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
})
```

### 5.2 Auth Route Handler

**File: `app/api/auth/[...nextauth]/route.ts`**

```typescript
import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
```

### 5.3 Auth Utilities

**File: `lib/auth-utils.ts`**

```typescript
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function getSession() {
  return await auth()
}

export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    redirect('/sign-in')
  }
  return session.user
}

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user) {
    redirect('/sign-in')
  }
  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
    redirect('/')
  }
  return session.user
}
```

### 5.4 Middleware

**File: `middleware.ts`**

```typescript
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAdmin = req.auth?.user?.role === 'ADMIN' || req.auth?.user?.role === 'SUPER_ADMIN'
  const { pathname } = req.nextUrl

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
}
```

### 5.5 TypeScript Types

**File: `types/next-auth.d.ts`**

```typescript
import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    role: string
  }
}
```

---

## 6. API & Server Actions

### 6.1 Server Action Pattern

**File: `app/actions/users.ts`**

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-utils'
import { logger } from '@/lib/logger'
import { createAuditLog } from '@/lib/audit'
import { userSchema } from '@/lib/validation'
import { z } from 'zod'

export async function createUser(data: z.infer<typeof userSchema>) {
  try {
    const admin = await requireAdmin()

    // Validate input
    const validated = userSchema.parse(data)

    // Check for existing user
    const existing = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existing) {
      return { success: false, error: 'Email already exists' }
    }

    // Create user
    const user = await prisma.user.create({
      data: validated,
    })

    // Audit log
    await createAuditLog({
      userId: admin.id,
      action: 'CREATE',
      entity: 'User',
      entityId: user.id,
      changes: { created: validated },
    })

    revalidatePath('/admin/users')

    return { success: true, data: user }
  } catch (error) {
    logger.serverActionError('createUser', error)

    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed', details: error.errors }
    }

    return { success: false, error: 'Failed to create user' }
  }
}

export async function updateUser(id: string, data: Partial<z.infer<typeof userSchema>>) {
  try {
    const admin = await requireAdmin()

    const user = await prisma.user.update({
      where: { id },
      data,
    })

    await createAuditLog({
      userId: admin.id,
      action: 'UPDATE',
      entity: 'User',
      entityId: id,
      changes: data,
    })

    revalidatePath('/admin/users')

    return { success: true, data: user }
  } catch (error) {
    logger.serverActionError('updateUser', error)
    return { success: false, error: 'Failed to update user' }
  }
}

// Soft delete pattern
export async function deleteUser(id: string) {
  try {
    const admin = await requireAdmin()

    await prisma.user.update({
      where: { id },
      data: {
        deleted: true,
        deletedAt: new Date(),
        deletedBy: admin.id,
      },
    })

    await createAuditLog({
      userId: admin.id,
      action: 'DELETE',
      entity: 'User',
      entityId: id,
    })

    revalidatePath('/admin/users')

    return { success: true }
  } catch (error) {
    logger.serverActionError('deleteUser', error)
    return { success: false, error: 'Failed to delete user' }
  }
}
```

### 6.2 API Route Pattern

**File: `app/api/health/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const startTime = Date.now()

  try {
    // Database health check
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const dbLatency = Date.now() - dbStart

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      checks: {
        database: {
          status: 'up',
          latency: dbLatency,
        },
      },
    })
  } catch (error) {
    logger.error('Health check failed', { error })

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: 'down',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      },
    }, { status: 503 })
  }
}
```

---

## 7. UI Components (shadcn/ui)

### 7.1 Initialize shadcn/ui

```bash
npx shadcn@latest init
```

Choose:
- Style: New York
- Base color: Neutral
- CSS variables: Yes

### 7.2 Essential Components

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add form
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add table
npx shadcn@latest add toast
npx shadcn@latest add tabs
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add calendar
npx shadcn@latest add badge
npx shadcn@latest add alert
npx shadcn@latest add skeleton
npx shadcn@latest add sheet
npx shadcn@latest add separator
npx shadcn@latest add avatar
```

### 7.3 Utilities

**File: `lib/utils.ts`**

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}
```

---

## 8. Styling (Tailwind CSS 4)

### 8.1 Tailwind Configuration

**File: `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

### 8.2 Global Styles

**File: `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## 9. Animations (Framer Motion)

### 9.1 Animation Constants

**File: `constants/animations.ts`**

```typescript
export const ANIMATION_TIMING = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  verySlow: 0.8,
}

export const ANIMATION_EASING = {
  smooth: [0.22, 1, 0.36, 1],
  bouncy: [0.34, 1.56, 0.64, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
}

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
}

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}
```

### 9.2 Animation Component Example

**File: `components/animations/FadeIn.tsx`**

```typescript
'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { fadeInUp, ANIMATION_TIMING, ANIMATION_EASING } from '@/constants/animations'

interface FadeInProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  return (
    <motion.div
      {...fadeInUp}
      transition={{
        duration: ANIMATION_TIMING.normal,
        delay,
        ease: ANIMATION_EASING.smooth,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

---

## 10. Form Validation (Zod)

### 10.1 Validation Schemas

**File: `lib/validation.ts`**

```typescript
import { z } from 'zod'

export const emailSchema = z.string().email('Invalid email address')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const userSchema = z.object({
  email: emailSchema,
  name: z.string().min(2).optional(),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).default('USER'),
})

export const bookingSchema = z.object({
  date: z.coerce.date(),
  time: z.string().min(1, 'Time is required'),
  guestCount: z.number().min(1).max(50),
  phone: z.string().min(10, 'Valid phone number required'),
  email: emailSchema,
  specialRequests: z.string().optional(),
})

// Type exports
export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type UserInput = z.infer<typeof userSchema>
export type BookingInput = z.infer<typeof bookingSchema>
```

---

## 11. Error Handling

### 11.1 Error Boundary

**File: `components/ErrorBoundary.tsx`**

```typescript
'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button onClick={() => this.setState({ hasError: false })}>
            Try again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
```

### 11.2 App Error Page

**File: `app/error.tsx`**

```typescript
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  )
}
```

---

## 12. Logging System

### 12.1 Logger Implementation

**File: `lib/logger.ts`**

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development'
  private isTest = process.env.NODE_ENV === 'test'

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    if (this.isTest) return

    const formattedMessage = this.formatMessage(level, message, context)

    switch (level) {
      case 'debug':
        if (this.isDev) console.debug(formattedMessage)
        break
      case 'info':
        console.info(formattedMessage)
        break
      case 'warn':
        console.warn(formattedMessage)
        break
      case 'error':
        console.error(formattedMessage)
        break
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context)
  }

  // Specialized methods
  auth(message: string, context?: LogContext) {
    this.log('info', `[AUTH] ${message}`, context)
  }

  db(message: string, context?: LogContext) {
    this.log('debug', `[DB] ${message}`, context)
  }

  apiError(endpoint: string, error: unknown) {
    this.log('error', `[API] ${endpoint} failed`, {
      error: error instanceof Error ? error.message : String(error),
    })
  }

  serverActionError(action: string, error: unknown) {
    this.log('error', `[ACTION] ${action} failed`, {
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

export const logger = new Logger()
```

---

## 13. Security Implementation

### 13.1 Rate Limiting

**File: `lib/rate-limit.ts`**

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Rate limiters for different use cases
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
  analytics: true,
  prefix: 'ratelimit:auth',
})

export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  analytics: true,
  prefix: 'ratelimit:api',
})

export const bookingRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 bookings per hour
  analytics: true,
  prefix: 'ratelimit:booking',
})

// Helper function
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; remaining: number }> {
  const { success, remaining } = await limiter.limit(identifier)
  return { success, remaining }
}
```

### 13.2 CSRF Protection

**File: `lib/csrf.ts`**

```typescript
import { headers } from 'next/headers'

export function validateOrigin(): boolean {
  const headersList = headers()
  const origin = headersList.get('origin')
  const host = headersList.get('host')

  if (!origin || !host) {
    return false
  }

  const originUrl = new URL(origin)
  return originUrl.host === host
}

export function requireValidOrigin() {
  if (!validateOrigin()) {
    throw new Error('Invalid request origin')
  }
}
```

### 13.3 Security Headers (Next.js Config)

**File: `next.config.mjs`**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
}

export default nextConfig
```

---

## 14. SEO Configuration

### 14.1 Metadata

**File: `app/layout.tsx`**

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
  title: {
    default: 'My App',
    template: '%s | My App',
  },
  description: 'My awesome application description',
  keywords: ['keyword1', 'keyword2', 'keyword3'],
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://example.com',
    title: 'My App',
    description: 'My awesome application description',
    siteName: 'My App',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'My App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My App',
    description: 'My awesome application description',
    images: ['/og-image.png'],
    creator: '@yourusername',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}
```

### 14.2 Sitemap

**File: `app/sitemap.ts`**

```typescript
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://example.com'

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]
}
```

### 14.3 Robots.txt

**File: `app/robots.ts`**

```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/private/'],
    },
    sitemap: 'https://example.com/sitemap.xml',
  }
}
```

---

## 15. Testing Setup

### 15.1 Vitest Configuration

**File: `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        '.next/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

**File: `vitest.setup.ts`**

```typescript
import '@testing-library/jest-dom'
```

### 15.2 Example Test

**File: `lib/utils.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
import { cn, formatDate, formatCurrency } from './utils'

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('handles conflicting classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })
})
```

### 15.3 Playwright Configuration

**File: `playwright.config.ts`**

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 15.4 Package.json Scripts

```json
{
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "test:report": "playwright show-report",
    "test:unit": "vitest",
    "test:unit:ui": "vitest --ui",
    "test:unit:run": "vitest run",
    "test:unit:coverage": "vitest run --coverage"
  }
}
```

---

## 16. DevOps & CI/CD

### 16.1 GitHub Actions Workflow

**File: `.github/workflows/ci.yml`**

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '20'

jobs:
  quality:
    name: Quality Checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type Check
        run: npx tsc --noEmit

      - name: Unit Tests
        run: npm run test:unit:run

      - name: Upload Coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: false

  sonarcloud:
    name: SonarCloud Analysis
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  deploy:
    name: Deploy to Vercel
    needs: [quality]
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 16.2 Dependabot

**File: `.github/dependabot.yml`**

```yaml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
      day: 'monday'
    open-pull-requests-limit: 10
    groups:
      minor-and-patch:
        patterns:
          - '*'
        update-types:
          - 'minor'
          - 'patch'

  - package-ecosystem: 'github-actions'
    directory: '/'
    schedule:
      interval: 'weekly'
```

### 16.3 Husky Pre-commit

**File: `.husky/pre-commit`**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

**File: `package.json` (lint-staged config)**

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

### 16.4 SonarCloud Configuration

**File: `sonar-project.properties`**

```properties
sonar.projectKey=your-project-key
sonar.organization=your-org

sonar.sources=.
sonar.exclusions=**/node_modules/**,**/*.test.ts,**/*.test.tsx,.next/**,coverage/**,docs/**

sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.javascript.lcov.reportPaths=coverage/lcov.info

sonar.coverage.exclusions=**/*.test.ts,**/*.test.tsx,**/tests/**
```

---

## 17. Monitoring & Observability

### 17.1 Sentry Configuration

**File: `sentry.client.config.ts`**

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production',

  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  beforeSend(event) {
    if (event.level === 'warning') {
      return null
    }
    return event
  },
})
```

**File: `sentry.server.config.ts`**

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0.1,

  beforeSend(event) {
    if (event.level === 'warning') {
      return null
    }
    return event
  },
})
```

### 17.2 Vercel Analytics

**File: `app/layout.tsx`**

```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

---

## 18. Deployment (Vercel)

### 18.1 Vercel Configuration

**File: `vercel.json`**

```json
{
  "framework": "nextjs",
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm ci",
  "regions": ["iad1"],
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### 18.2 Required Environment Variables (Vercel Dashboard)

```
# Database
DATABASE_URL=postgresql://...

# Auth
AUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=sntrys_...

# Rate Limiting (optional)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## 19. Environment Variables

### 19.1 Example .env File

**File: `.env.example`**

```bash
# Database (Neon)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Authentication
AUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=""
SENTRY_DSN=""
SENTRY_ORG=""
SENTRY_PROJECT=""
SENTRY_AUTH_TOKEN=""

# Rate Limiting (Upstash Redis - optional)
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# Email (optional - for future)
RESEND_API_KEY=""
EMAIL_FROM="noreply@example.com"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 19.2 Generate Secrets

```bash
# Generate AUTH_SECRET
openssl rand -base64 32
```

---

## 20. Useful Patterns & Code Snippets

### 20.1 Soft Delete Query Pattern

```typescript
// Always exclude soft-deleted records
const users = await prisma.user.findMany({
  where: { deleted: false },
})

// Include deleted with flag
const allUsers = await prisma.user.findMany({
  where: {
    OR: [
      { deleted: false },
      { deleted: true }, // Include deleted if needed
    ],
  },
})
```

### 20.2 Audit Log Helper

**File: `lib/audit.ts`**

```typescript
import { prisma } from '@/lib/prisma'

interface AuditLogInput {
  userId: string
  action: string
  entity: string
  entityId: string
  changes?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(input: AuditLogInput) {
  return prisma.auditLog.create({
    data: input,
  })
}
```

### 20.3 Server Action Response Type

```typescript
type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown }

// Usage
export async function myAction(): Promise<ActionResponse<User>> {
  try {
    const user = await prisma.user.create({ ... })
    return { success: true, data: user }
  } catch (error) {
    return { success: false, error: 'Failed to create user' }
  }
}
```

### 20.4 useReducedMotion Hook

**File: `hooks/useReducedMotion.ts`**

```typescript
import { useEffect, useState } from 'react'

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}
```

### 20.5 Loading Skeleton Pattern

```typescript
// Use shadcn/ui Skeleton
import { Skeleton } from '@/components/ui/skeleton'

export function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-[200px] w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}
```

---

## 21. Email Integration (Resend)

### 21.1 Install & Configure

```bash
npm install resend
```

**File: `lib/email.ts`**

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: from || process.env.EMAIL_FROM || 'noreply@example.com',
      to,
      subject,
      html,
    })

    if (error) {
      throw new Error(error.message)
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email send failed:', error)
    return { success: false, error }
  }
}
```

### 21.2 Email Templates

**File: `lib/email-templates.ts`**

```typescript
export function welcomeEmail(name: string) {
  return {
    subject: 'Welcome to Our Platform!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome!</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Thank you for joining us! We're excited to have you on board.</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button">Get Started</a></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }
}

export function bookingConfirmationEmail(booking: {
  name: string
  date: string
  time: string
  type: string
}) {
  return {
    subject: `Booking Confirmed - ${booking.date}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #007bff;">Booking Confirmed!</h1>
        <p>Hi ${booking.name},</p>
        <p>Your booking has been confirmed:</p>
        <ul>
          <li><strong>Date:</strong> ${booking.date}</li>
          <li><strong>Time:</strong> ${booking.time}</li>
          <li><strong>Type:</strong> ${booking.type}</li>
        </ul>
        <p>We look forward to seeing you!</p>
      </div>
    `,
  }
}

export function passwordResetEmail(resetUrl: string) {
  return {
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Reset Your Password</h1>
        <p>Click the button below to reset your password:</p>
        <p><a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  }
}
```

### 21.3 Environment Variables

```bash
RESEND_API_KEY="re_..."
EMAIL_FROM="Your App <noreply@yourdomain.com>"
```

---

## 22. File Uploads & Storage

### 22.1 Vercel Blob Storage

```bash
npm install @vercel/blob
```

**File: `lib/upload.ts`**

```typescript
import { put, del } from '@vercel/blob'

export async function uploadFile(file: File, folder = 'uploads') {
  const filename = `${folder}/${Date.now()}-${file.name}`

  const blob = await put(filename, file, {
    access: 'public',
  })

  return {
    url: blob.url,
    filename: blob.pathname,
  }
}

export async function deleteFile(url: string) {
  await del(url)
}
```

### 22.2 Upload API Route

**File: `app/api/upload/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { requireAuth } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    const blob = await put(`uploads/${Date.now()}-${file.name}`, file, {
      access: 'public',
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
```

### 22.3 Upload Component

**File: `components/FileUpload.tsx`**

```typescript
'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, Loader2 } from 'lucide-react'

interface FileUploadProps {
  onUpload: (url: string) => void
  accept?: string
  maxSize?: number
}

export function FileUpload({ onUpload, accept = 'image/*', maxSize = 5 }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > maxSize * 1024 * 1024) {
      alert(`File too large. Max ${maxSize}MB`)
      return
    }

    setUploading(true)
    setPreview(URL.createObjectURL(file))

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')

      const { url } = await res.json()
      onUpload(url)
    } catch (error) {
      alert('Upload failed')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleUpload}
        className="hidden"
      />

      {preview ? (
        <div className="relative">
          <img src={preview} alt="Preview" className="w-full max-w-xs rounded-lg" />
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2"
            onClick={() => setPreview(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          Upload File
        </Button>
      )}
    </div>
  )
}
```

---

## 23. Caching Strategies

### 23.1 Next.js Caching

```typescript
// Static caching (revalidate every hour)
export const revalidate = 3600

// On-demand revalidation
import { revalidatePath, revalidateTag } from 'next/cache'

// Revalidate specific path
revalidatePath('/blog')

// Revalidate by tag
revalidateTag('posts')

// Fetch with cache tags
const posts = await fetch('https://api.example.com/posts', {
  next: { tags: ['posts'] }
})
```

### 23.2 Redis Caching (Upstash)

```bash
npm install @upstash/redis
```

**File: `lib/cache.ts`**

```typescript
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 3600 // 1 hour default
): Promise<T> {
  // Try to get from cache
  const cached = await redis.get<T>(key)
  if (cached) {
    return cached
  }

  // Fetch fresh data
  const data = await fetcher()

  // Store in cache
  await redis.setex(key, ttl, data)

  return data
}

export async function invalidateCache(pattern: string) {
  const keys = await redis.keys(pattern)
  if (keys.length > 0) {
    await redis.del(...keys)
  }
}

// Usage example
export async function getUser(id: string) {
  return getCached(
    `user:${id}`,
    () => prisma.user.findUnique({ where: { id } }),
    3600 // Cache for 1 hour
  )
}
```

### 23.3 React Query (Client-Side)

```bash
npm install @tanstack/react-query
```

**File: `providers/QueryProvider.tsx`**

```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        cacheTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

---

## 24. Search Implementation

### 24.1 PostgreSQL Full-Text Search

**Prisma Schema Addition:**

```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String   @db.Text
  createdAt DateTime @default(now())

  @@index([title, content])  // For text search
}
```

**Search Function:**

```typescript
export async function searchPosts(query: string) {
  const searchTerms = query.split(' ').filter(Boolean).join(' & ')

  const results = await prisma.$queryRaw`
    SELECT id, title, content,
           ts_rank(to_tsvector('english', title || ' ' || content),
                   plainto_tsquery('english', ${query})) as rank
    FROM "Post"
    WHERE to_tsvector('english', title || ' ' || content)
          @@ plainto_tsquery('english', ${query})
    ORDER BY rank DESC
    LIMIT 20
  `

  return results
}
```

### 24.2 Search API Route

**File: `app/api/search/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const type = searchParams.get('type') || 'all'

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const results: Record<string, unknown[]> = {}

  if (type === 'all' || type === 'users') {
    results.users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
        deleted: false,
      },
      select: { id: true, name: true, email: true },
      take: 10,
    })
  }

  if (type === 'all' || type === 'bookings') {
    results.bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
    })
  }

  return NextResponse.json({ results })
}
```

### 24.3 Search Component

**File: `components/SearchCommand.tsx`**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Search, User, Calendar } from 'lucide-react'

export function SearchCommand() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>({})
  const router = useRouter()

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Search API
  useEffect(() => {
    if (query.length < 2) {
      setResults({})
      return
    }

    const timer = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.results)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border rounded-md hover:bg-accent"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {results.users?.length > 0 && (
            <CommandGroup heading="Users">
              {results.users.map((user: any) => (
                <CommandItem
                  key={user.id}
                  onSelect={() => {
                    router.push(`/admin/users/${user.id}`)
                    setOpen(false)
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  {user.name || user.email}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.bookings?.length > 0 && (
            <CommandGroup heading="Bookings">
              {results.bookings.map((booking: any) => (
                <CommandItem
                  key={booking.id}
                  onSelect={() => {
                    router.push(`/admin/bookings/${booking.id}`)
                    setOpen(false)
                  }}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {booking.title}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
```

---

## 25. Admin Panel Patterns

### 25.1 Admin Layout

**File: `app/admin/layout.tsx`**

```typescript
import { requireAdmin } from '@/lib/auth-utils'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAdmin()

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={user} />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### 25.2 Data Table Component

**File: `components/admin/DataTable.tsx`**

```typescript
'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table'
import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
  })

  return (
    <div className="space-y-4">
      {searchKey && (
        <Input
          placeholder={`Search...`}
          value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
          onChange={(e) => table.getColumn(searchKey)?.setFilterValue(e.target.value)}
          className="max-w-sm"
        />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
```

### 25.3 Dashboard Stats Card

**File: `components/admin/StatsCard.tsx`**

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatsCard({ title, value, description, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <p className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  )
}
```

---

## 26. Performance Optimization

### 26.1 Image Optimization

```typescript
// next.config.mjs
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}
```

**Usage:**

```typescript
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // For above-the-fold images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### 26.2 Code Splitting

```typescript
// Dynamic imports
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <Skeleton className="h-[400px]" />,
  ssr: false, // Disable SSR if not needed
})

// Route-based code splitting (automatic with App Router)
```

### 26.3 Bundle Analysis

```bash
npm install @next/bundle-analyzer
```

**File: `next.config.mjs`**

```javascript
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer(nextConfig)
```

```bash
# Run analysis
ANALYZE=true npm run build
```

### 26.4 Performance Monitoring

```typescript
// Measure component render time
import { useEffect } from 'react'

export function usePerformanceMark(name: string) {
  useEffect(() => {
    performance.mark(`${name}-start`)

    return () => {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)

      const measure = performance.getEntriesByName(name)[0]
      console.log(`${name} took ${measure.duration}ms`)
    }
  }, [name])
}
```

### 26.5 Lighthouse CI

**File: `lighthouserc.js`**

```javascript
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/', 'http://localhost:3000/booking'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
      },
    },
  },
}
```

---

## 27. Accessibility (a11y)

### 27.1 Keyboard Navigation

```typescript
// Focus trap for modals
import { useEffect, useRef } from 'react'

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive) return

    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    firstElement?.focus()

    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [isActive])

  return containerRef
}
```

### 27.2 Screen Reader Announcements

```typescript
'use client'

import { useEffect, useState } from 'react'

export function ScreenReaderAnnouncement({ message }: { message: string }) {
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    setAnnouncement(message)
    const timer = setTimeout(() => setAnnouncement(''), 1000)
    return () => clearTimeout(timer)
  }, [message])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  )
}
```

### 27.3 Skip Links

```typescript
export function SkipLinks() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
    >
      Skip to main content
    </a>
  )
}
```

### 27.4 Accessible Form Pattern

```typescript
interface FormFieldProps {
  label: string
  error?: string
  children: React.ReactNode
  required?: boolean
  hint?: string
}

export function FormField({ label, error, children, required, hint }: FormFieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        {required && <span className="sr-only">(required)</span>}
      </label>

      {hint && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}

      {React.cloneElement(children as React.ReactElement, {
        id,
        'aria-invalid': error ? 'true' : undefined,
        'aria-describedby': [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined,
      })}

      {error && (
        <p id={errorId} className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
```

---

## 28. Internationalization (i18n)

### 28.1 Setup with next-intl

```bash
npm install next-intl
```

**File: `i18n.ts`**

```typescript
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
}))
```

**File: `messages/en.json`**

```json
{
  "common": {
    "welcome": "Welcome",
    "signIn": "Sign In",
    "signOut": "Sign Out",
    "loading": "Loading..."
  },
  "home": {
    "title": "Welcome to Our Platform",
    "subtitle": "The best place for family entertainment"
  },
  "booking": {
    "title": "Book Your Visit",
    "date": "Date",
    "time": "Time",
    "guests": "Number of Guests",
    "submit": "Book Now"
  }
}
```

**File: `messages/sr.json`**

```json
{
  "common": {
    "welcome": "Dobrodošli",
    "signIn": "Prijava",
    "signOut": "Odjava",
    "loading": "Učitavanje..."
  },
  "home": {
    "title": "Dobrodošli na našu platformu",
    "subtitle": "Najbolje mesto za porodičnu zabavu"
  },
  "booking": {
    "title": "Rezervišite posetu",
    "date": "Datum",
    "time": "Vreme",
    "guests": "Broj gostiju",
    "submit": "Rezerviši"
  }
}
```

### 28.2 Usage in Components

```typescript
import { useTranslations } from 'next-intl'

export function BookingForm() {
  const t = useTranslations('booking')

  return (
    <form>
      <h1>{t('title')}</h1>
      <label>{t('date')}</label>
      <label>{t('time')}</label>
      <label>{t('guests')}</label>
      <button type="submit">{t('submit')}</button>
    </form>
  )
}
```

### 28.3 Middleware for Locale Detection

**File: `middleware.ts`**

```typescript
import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['en', 'sr'],
  defaultLocale: 'sr',
})

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
```

---

## 29. PWA Setup

### 29.1 Install next-pwa

```bash
npm install next-pwa
```

**File: `next.config.mjs`**

```javascript
import withPWA from 'next-pwa'

const nextConfig = {
  // ... your config
}

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})(nextConfig)
```

### 29.2 Web App Manifest

**File: `public/manifest.json`**

```json
{
  "name": "Your App Name",
  "short_name": "App",
  "description": "Your app description",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#007bff",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### 29.3 Add to Layout

```typescript
export const metadata: Metadata = {
  manifest: '/manifest.json',
  themeColor: '#007bff',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Your App',
  },
}
```

---

## 30. Real-time Features

### 30.1 Server-Sent Events (SSE)

**File: `app/api/sse/route.ts`**

```typescript
export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      // Send initial data
      send({ type: 'connected', timestamp: Date.now() })

      // Send updates periodically
      const interval = setInterval(() => {
        send({ type: 'heartbeat', timestamp: Date.now() })
      }, 30000)

      // Cleanup on close
      return () => clearInterval(interval)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

### 30.2 Client Hook

```typescript
'use client'

import { useEffect, useState } from 'react'

export function useSSE<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const eventSource = new EventSource(url)

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        setData(parsed)
      } catch (e) {
        setError(e as Error)
      }
    }

    eventSource.onerror = () => {
      setError(new Error('SSE connection failed'))
      eventSource.close()
    }

    return () => eventSource.close()
  }, [url])

  return { data, error }
}
```

---

## 31. Feature Ideas Library

### 31.1 Core Features (20 Ideas)

1. **User Dashboard** - Personal overview with bookings, history, loyalty points
2. **Booking System** - Date/time picker, availability check, confirmation flow
3. **Event Calendar** - Public events, workshops, special occasions
4. **Gallery/Portfolio** - Image galleries with lightbox, categories
5. **Review System** - Star ratings, written reviews, photo reviews
6. **FAQ Section** - Accordion-style, searchable, categorized
7. **Contact Form** - Multi-step, file uploads, spam protection
8. **Newsletter** - Email capture, preferences, double opt-in
9. **Gift Cards** - Purchase, redeem, balance check
10. **Membership/Subscription** - Tiers, benefits, recurring payments
11. **Loyalty Program** - Points, rewards, tier progression
12. **Referral System** - Unique links, tracking, rewards
13. **Live Chat** - Real-time support, chatbot fallback
14. **Notifications** - Email, SMS, push, in-app
15. **Search** - Full-text, filters, autocomplete
16. **Virtual Tour** - 360° images, hotspots, mobile-friendly
17. **Price Calculator** - Dynamic pricing, packages, add-ons
18. **Waitlist/Queue** - Real-time position, SMS notifications
19. **Multi-location** - Location selector, per-location content
20. **Blog/News** - Articles, categories, comments

### 31.2 Admin Features (15 Ideas)

21. **Dashboard Analytics** - Charts, KPIs, trends
22. **User Management** - CRUD, roles, block/unblock
23. **Booking Management** - Calendar view, approve/reject, reschedule
24. **Content Management** - Pages, sections, media library
25. **Email Campaigns** - Templates, scheduling, analytics
26. **Inventory Tracking** - Stock levels, reorder alerts
27. **Financial Reports** - Revenue, expenses, forecasting
28. **Audit Logs** - Action history, user tracking
29. **Settings Panel** - Site config, business hours, pricing
30. **Staff Management** - Schedules, permissions, performance
31. **Customer Insights** - Segments, behavior, lifetime value
32. **Automated Tasks** - Reminders, follow-ups, cleanup
33. **Export/Import** - CSV, PDF reports, data migration
34. **Feedback Analysis** - Sentiment, trends, action items
35. **A/B Testing** - Variants, metrics, winner selection

### 31.3 Engagement Features (15 Ideas)

36. **Gamification** - Achievements, badges, leaderboards
37. **Social Sharing** - Share buttons, custom cards, tracking
38. **User-Generated Content** - Photo uploads, stories
39. **Contests/Giveaways** - Entry forms, random selection
40. **Seasonal Themes** - Holiday designs, special offers
41. **Countdown Timers** - Events, promotions, deadlines
42. **Progress Trackers** - Goals, milestones, celebrations
43. **Interactive Maps** - Venue layout, points of interest
44. **AR Features** - Preview experiences, virtual try-on
45. **Personalization** - Recommendations, custom content
46. **Social Proof** - Recent activity, visitor count
47. **Exit Intent** - Last-chance offers, email capture
48. **Push Notifications** - Re-engagement, updates
49. **SMS Marketing** - Campaigns, automation, opt-in
50. **Community Forum** - Discussions, Q&A, moderation

---

## 32. Design Patterns Library

### 32.1 Visual Effects

1. **Parallax Scrolling** - Depth, immersion, storytelling
2. **Glassmorphism** - Frosted glass, blur, transparency
3. **Neumorphism** - Soft UI, subtle shadows
4. **Gradient Animations** - Moving gradients, color shifts
5. **Particle Effects** - Confetti, snow, stars
6. **Cursor Effects** - Custom cursor, trail, interactions
7. **Scroll Animations** - Reveal on scroll, progress
8. **Loading Animations** - Skeleton, spinner, progress
9. **Micro-interactions** - Button states, form feedback
10. **3D Elements** - Cards, transforms, perspective

### 32.2 Layout Patterns

11. **Hero Sections** - Full-screen, video, split-screen
12. **Feature Grids** - Bento, masonry, responsive
13. **Testimonial Sliders** - Carousel, cards, quotes
14. **Pricing Tables** - Comparison, toggle, highlighted
15. **Team Sections** - Cards, hover effects, social links
16. **Timeline** - Vertical, horizontal, milestones
17. **Statistics** - Counters, charts, infographics
18. **FAQ Accordions** - Expandable, searchable, grouped
19. **Footer Mega** - Columns, newsletter, social
20. **Sticky Navigation** - Transform on scroll, progress

---

## 33. Content Ideas

### 33.1 Page Content

1. **About Us** - Story, mission, team, values
2. **How It Works** - Steps, visuals, video
3. **Safety Info** - Policies, protocols, trust
4. **Pricing** - Packages, comparison, FAQ
5. **Gallery** - Photos, videos, virtual tour
6. **Events** - Calendar, descriptions, booking
7. **Blog** - Tips, news, behind-the-scenes
8. **Press/Media** - Kit, coverage, contact
9. **Careers** - Open positions, culture, benefits
10. **Partners** - Logos, testimonials, become one

### 33.2 Trust Builders

11. **Testimonials** - Video, written, photos
12. **Case Studies** - Before/after, results
13. **Awards/Certifications** - Badges, certificates
14. **Social Proof** - Counters, logos, reviews
15. **Guarantees** - Money-back, satisfaction

---

## 34. Marketing Features

### 34.1 Conversion Optimization

1. **Landing Pages** - Campaign-specific, A/B tested
2. **Lead Magnets** - Free guides, discounts, trials
3. **Pop-ups** - Exit intent, timed, scroll-triggered
4. **Social Proof** - Live activity, reviews, counters
5. **Urgency/Scarcity** - Countdown, limited spots
6. **Trust Signals** - Badges, testimonials, guarantees
7. **Clear CTAs** - Action-oriented, contrasting
8. **Simplified Forms** - Progressive, autofill, validation
9. **Live Chat** - Instant support, proactive
10. **Retargeting** - Abandoned cart, browse history

### 34.2 SEO & Discovery

11. **Schema Markup** - Rich snippets, events, reviews
12. **Local SEO** - Google Business, maps, reviews
13. **Content Strategy** - Blog, long-tail keywords
14. **Social Media** - Integration, sharing, embeds
15. **Email Marketing** - Sequences, automation, personalization

---

## 35. Production Checklist

### 35.1 Pre-Launch

**Security:**
- [ ] All secrets in environment variables
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Input validation on all forms
- [ ] SQL injection protection (Prisma)
- [ ] XSS protection (React)
- [ ] CSRF protection
- [ ] Authentication working
- [ ] Authorization (roles) working

**Performance:**
- [ ] Images optimized (WebP/AVIF)
- [ ] Lazy loading enabled
- [ ] Bundle size acceptable
- [ ] Core Web Vitals passing
- [ ] Caching configured
- [ ] Database indexes created
- [ ] No N+1 queries

**Quality:**
- [ ] No console errors
- [ ] All pages load correctly
- [ ] Forms submit properly
- [ ] Error handling works
- [ ] Loading states shown
- [ ] Empty states handled
- [ ] 404 page exists
- [ ] Error page exists

**SEO:**
- [ ] Meta tags on all pages
- [ ] Open Graph tags
- [ ] Twitter cards
- [ ] Sitemap generated
- [ ] robots.txt configured
- [ ] Canonical URLs set
- [ ] Structured data added

**Accessibility:**
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast passing
- [ ] Focus indicators visible
- [ ] Alt text on images
- [ ] Form labels present
- [ ] Skip links added

### 35.2 DevOps

**CI/CD:**
- [ ] GitHub Actions configured
- [ ] Tests running in CI
- [ ] Linting in CI
- [ ] Type checking in CI
- [ ] Auto-deploy working

**Monitoring:**
- [ ] Sentry configured
- [ ] Health endpoint working
- [ ] Uptime monitoring active
- [ ] Analytics enabled
- [ ] Logging working

**Database:**
- [ ] Migrations applied
- [ ] Seed data ready
- [ ] Backups configured
- [ ] Connection pooling

---

## 36. Launch Day Checklist

### 36.1 Final Checks

- [ ] DNS configured correctly
- [ ] SSL certificate valid
- [ ] All environment variables set
- [ ] Database migrated
- [ ] Cache cleared
- [ ] Test purchase/booking flow
- [ ] Email notifications working
- [ ] Contact form working
- [ ] Analytics tracking
- [ ] Error tracking active

### 36.2 After Launch

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify all integrations
- [ ] Test on multiple devices
- [ ] Submit to search engines
- [ ] Announce on social media
- [ ] Send launch email
- [ ] Monitor support channels

---

## 37. Post-Launch Monitoring

### 37.1 Daily Checks

- [ ] Check Sentry for new errors
- [ ] Review uptime status
- [ ] Check analytics dashboard
- [ ] Review user feedback
- [ ] Monitor server resources

### 37.2 Weekly Tasks

- [ ] Review performance metrics
- [ ] Analyze user behavior
- [ ] Check security alerts
- [ ] Review dependency updates
- [ ] Backup verification

### 37.3 Monthly Tasks

- [ ] Full security audit
- [ ] Performance optimization review
- [ ] Content freshness check
- [ ] SEO ranking review
- [ ] User feedback analysis
- [ ] Cost optimization review

---

## 38. Maintenance & Updates

### 38.1 Regular Updates

```bash
# Check for updates
npm outdated

# Update dependencies (minor/patch)
npm update

# Update major versions (careful!)
npx npm-check-updates -u

# Regenerate Prisma client after updates
npx prisma generate
```

### 38.2 Database Maintenance

```bash
# Check for pending migrations
npx prisma migrate status

# Create new migration
npx prisma migrate dev --name description

# Apply migrations to production
npx prisma migrate deploy
```

### 38.3 Performance Reviews

- Run Lighthouse audits monthly
- Review Core Web Vitals in Search Console
- Analyze slow queries in database
- Check bundle size trends
- Review error rates and patterns

---

## Quick Start Checklist

### Day 1: Setup
- [ ] Create Next.js project
- [ ] Set up Neon database
- [ ] Configure Prisma
- [ ] Initialize shadcn/ui
- [ ] Set up authentication

### Day 2: Core Features
- [ ] Create user model and auth
- [ ] Set up admin routes
- [ ] Create basic CRUD operations
- [ ] Implement logging

### Day 3: DevOps
- [ ] Set up GitHub Actions
- [ ] Configure Dependabot
- [ ] Set up Husky
- [ ] Configure SonarCloud

### Day 4: Monitoring
- [ ] Set up Sentry
- [ ] Create health endpoint
- [ ] Set up Better Uptime
- [ ] Add Vercel Analytics

### Day 5: Polish
- [ ] SEO configuration
- [ ] Security headers
- [ ] Final testing
- [ ] Deploy to production

---

## Resources

**Documentation:**
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://authjs.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Framer Motion Docs](https://www.framer.com/motion)
- [Zod Docs](https://zod.dev)
- [React Query Docs](https://tanstack.com/query)

**Services:**
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Vercel](https://vercel.com) - Deployment
- [Sentry](https://sentry.io) - Error Tracking
- [Better Uptime](https://betteruptime.com) - Uptime Monitoring
- [Upstash](https://upstash.com) - Serverless Redis
- [Resend](https://resend.com) - Email API
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) - File Storage

**Learning:**
- [Total TypeScript](https://totaltypescript.com)
- [Josh Comeau Blog](https://joshwcomeau.com)
- [Kent C. Dodds Blog](https://kentcdodds.com)
- [Lee Robinson Blog](https://leerob.io)

---

**Version:** 2.0
**Grade:** A++ Production Ready
**Last Updated:** 2025-12-13
**Total Sections:** 38
**Total Ideas:** 100+
