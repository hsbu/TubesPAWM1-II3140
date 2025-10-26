   # Webculus - Your Web-Based Calculus Friend!

A modern, interactive full-stack web application for learning calculus concepts including linear equations, linear inequalities, and non-linear systems with 2 variables. Built with Next.js, React, and Express.js with Supabase database.

## Group 12 II3140 K2
```
In the loving memory of Muhammad Aidan Fathullah - 18223002, this project is developed and maintained by Muhamad Hasbullah Faris - 18223014
```

## Features

### Interactive Learning
- **4 Comprehensive Lessons**: Linear Equations, Linear Inequalities, Non-Linear Systems, and Calculus Applications
- **Interactive Simulations**: Real-time graph visualizations using HTML5 Canvas and SVG
- **Drag & Drop Quizzes**: HTML5 native drag-and-drop API for interactive learning
- **Mathematical Content**: LaTeX-style equations and step-by-step examples

### Practice & Assessment
- **Practice Problems**: Database-driven practice questions for each lesson
- **Instant Feedback**: Real-time validation of answers
- **Progress Tracking**: Track completion percentage and correct answers
- **Previous Attempts**: View your answer history

### Dashboard & Analytics
- **Stats Overview**: Lessons completed, problems solved, accuracy rate, and current streak
- **Progress Charts**: Visual representation using Recharts (Bar & Line charts)
- **Weekly Accuracy Trends**: Track your performance over time
- **Recent Activity**: View your latest practice sessions

### Authentication
- **Google OAuth**: Sign in with Google using NextAuth.js
- **Email/Password**: Traditional authentication with Supabase
- **Session Management**: Secure JWT-based authentication
- **Profile Management**: Update name, email, and password

## Tech Stack

### Frontend
- **Framework**: [Next.js 15.0.4](https://nextjs.org/) (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: Tailwind CSS 3.4
- **Authentication**: NextAuth.js 5

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.21
- **Language**: JavaScript
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth + JWT
- **Security**: 
  - CORS configured
  - Rate limiting (express-rate-limit)
  - JWT token verification
  - Input validation & sanitization

### HTML5 Features
- **Canvas API**: Real-time graph rendering
- **Drag & Drop API**: Interactive quiz components
- **Semantic Elements**: header, nav, main, section, article, aside, footer

### Database Schema
- **users**: User profiles and authentication
- **lessons**: Lesson metadata
- **practice_problems**: Questions and answers
- **practice_attempts**: User attempt records
- **user_lesson_progress**: Progress tracking

## Project Structure

```
TubesPAWM1-II3140/
├── backend/                      # Express.js API
│   ├── server.js                 # Main server file
│   ├── config/
│   │   └── database.js           # Database configuration
│   ├── scripts/
│   │   └── supabase-schema.sql   # Database schema
│   ├── .env                      # Environment variables
│   └── package.json
│
├── frontend/                     # Next.js Application
│   ├── src/
│   │   ├── app/                  # App router pages
│   │   │   ├── page.tsx          # Homepage
│   │   │   ├── layout.tsx        # Root layout
│   │   │   ├── dashboard/        # Dashboard page
│   │   │   ├── lessons/          # Lesson pages
│   │   │   │   ├── linear-equations/
│   │   │   │   ├── linear-inequalities/
│   │   │   │   ├── nonlinear-systems/
│   │   │   │   └── calculus-applications/
│   │   │   ├── practice/         # Practice page
│   │   │   ├── settings/         # Settings page
│   │   │   └── api/
│   │   │       └── auth/         # NextAuth API routes
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui components
│   │   │   ├── auth-modal.tsx    # Authentication modal
│   │   │   ├── canvas-graph.tsx  # Canvas component
│   │   │   ├── drag-drop-quiz.tsx # Drag & Drop component
│   │   │   ├── lesson-layout.tsx # Lesson wrapper
│   │   │   ├── math-content.tsx  # Math content renderer
│   │   │   ├── progress-chart.tsx # Chart component
│   │   │   ├── quiz-card.tsx     # Quiz component
│   │   │   ├── sidebar.tsx       # Navigation sidebar
│   │   │   └── stats-overview.tsx # Stats cards
│   │   ├── hooks/
│   │   │   ├── use-auth.tsx      # Authentication hook
│   │   │   ├── use-data.tsx      # Data fetching hooks
│   │   │   └── use-mobile.ts     # Mobile detection
│   │   ├── lib/
│   │   │   ├── api.ts            # API client functions
│   │   │   └── utils.ts          # Utility functions
│   │   └── types/
│   │       └── next-auth.d.ts    # NextAuth types
│   ├── public/                   # Static assets
│   ├── .env.local                # Environment variables
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** 18+ 
- **pnpm** (recommended) or npm
- **Supabase Account** (for database)
- **Google Cloud Console** (for OAuth - optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TubesPAWM1-II3140
   ```

2. **Set up Backend**

   ```bash
   cd backend
   npm install
   ```

   Create `.env` file in `backend/` directory:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_jwt_secret_key
   FRONTEND_URL=http://localhost:3000
   PORT=5000
   NODE_ENV=development
   ```

3. **Set up Database**

   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `backend/scripts/supabase-schema.sql` in Supabase SQL Editor
   - The schema will create all necessary tables and relationships

4. **Set up Frontend**

   ```bash
   cd frontend
   pnpm install
   ```

   Create `.env.local` file in `frontend/` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   ```

   Generate `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

5. **Configure Google OAuth (Optional)**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Copy Client ID and Client Secret to `.env.local`

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

2. **Start Frontend (in a new terminal)**
   ```bash
   cd frontend
   pnpm dev
   ```
   Frontend will run on `http://localhost:3000`

3. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

#### Backend
```bash
npm run dev     # Start development server with nodemon
npm start       # Start production server
```

#### Frontend
```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

## Usage Guide

1. **Sign Up / Sign In**
   - Click "Sign In / Sign Up" button
   - Use Google OAuth or email/password

2. **Explore Lessons**
   - Navigate to lessons from sidebar
   - Read interactive content
   - Use interactive simulations (Linear Equations, Linear Inequalities)
   - Try drag-and-drop quiz (Calculus Applications)

3. **Practice Problems**
   - Go to Practice page
   - Select a lesson
   - Answer questions and get instant feedback
   - Track your progress

4. **View Dashboard**
   - Monitor your stats (completion, accuracy, streak)
   - View progress charts
   - Check recent activity

5. **Manage Settings**
   - Update profile information
   - Change password
   - Delete account (if needed)

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `POST /api/auth/google` - Google OAuth
- `GET /api/me` - Get current user

### Lessons
- `GET /api/lessons` - Get all lessons
- `GET /api/lessons/:slug` - Get specific lesson (disabled)

### Practice
- `GET /api/practice/:lessonId` - Get practice problems
- `POST /api/practice/attempt` - Submit answer
- `GET /api/practice/attempts/:lessonId` - Get previous attempts

### Progress
- `GET /api/user/progress` - Get user progress
- `POST /api/user/progress` - Update progress
- `GET /api/user/dashboard-stats` - Get dashboard statistics

### Settings
- `PUT /api/user/profile` - Update profile
- `POST /api/user/change-password` - Change password
- `DELETE /api/user/account` - Delete account

## How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

The code in this project is licensed under MIT license.

## Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)