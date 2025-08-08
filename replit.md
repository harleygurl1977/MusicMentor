# GardenAI - Smart Gardening Companion

## Overview

GardenAI is a comprehensive web application that serves as an AI-powered gardening companion. The platform helps users track their plants, receive personalized care recommendations, and get AI-generated gardening tips based on weather conditions and user preferences. It combines plant management, calendar scheduling, and intelligent recommendations to create a complete gardening experience.

The application is built as a full-stack solution with a React frontend and Express backend, featuring user authentication, database-driven plant tracking, AI-powered advice generation, and weather integration for contextual recommendations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built using React 18 with TypeScript, organized in a feature-based structure. The frontend uses Vite as the build tool and development server, with Wouter for client-side routing instead of React Router. State management is handled through TanStack Query (React Query) for server state and local React state for UI interactions.

The UI component system is based on shadcn/ui components built on top of Radix UI primitives, providing a consistent design system. Tailwind CSS handles styling with custom CSS variables for theming, including garden-specific color schemes. The application uses a responsive design approach with mobile-first considerations.

### Backend Architecture
The server is built with Express.js and TypeScript, following a RESTful API design pattern. The architecture separates concerns into distinct layers:
- Route handlers in `/server/routes.ts` manage API endpoints
- Business logic is encapsulated in service modules (`/server/services/`)
- Data access is abstracted through a storage interface in `/server/storage.ts`
- Database operations use Drizzle ORM for type-safe queries

The server implements middleware for request logging, error handling, and authentication. In development, it integrates with Vite's middleware for hot module replacement and serves the built static files in production.

### Authentication System
Authentication is implemented using Replit's OpenID Connect (OIDC) system with Passport.js strategy. The system includes:
- Session management using PostgreSQL-backed session storage
- User profile synchronization with external identity provider
- Protected route middleware for API endpoints
- Automatic session refresh and user data updates

This approach provides seamless integration with Replit's ecosystem while maintaining security through industry-standard OIDC protocols.

### Database Design
The application uses PostgreSQL as the primary database with Drizzle ORM for schema definition and migrations. The schema includes:
- User profiles with gardening preferences and experience levels
- Plant records with care schedules and tracking information
- Care events for logging maintenance activities
- AI tips with user interactions (bookmarks, helpfulness ratings)
- Weather data caching for location-based recommendations
- Session storage for authentication state

The database design emphasizes relational integrity with foreign key constraints and cascade deletes to maintain data consistency.

### AI Integration
The application integrates with OpenAI's API for generating personalized gardening tips. The AI service considers:
- User's plant collection and care history
- Current weather conditions and forecasts
- User's experience level and garden type
- Seasonal factors and location-specific advice

Tips are generated dynamically based on context and cached in the database with user interaction tracking for continuous improvement.

## External Dependencies

### Core Framework Dependencies
- **React 18** with TypeScript for frontend user interface
- **Express.js** for backend API server and middleware
- **Vite** for frontend build tooling and development server
- **Node.js** runtime environment for server execution

### Database and ORM
- **PostgreSQL** as the primary database system
- **Drizzle ORM** for type-safe database operations and schema management
- **@neondatabase/serverless** for PostgreSQL connection in serverless environments

### Authentication Services
- **Replit Auth** using OpenID Connect for user authentication
- **Passport.js** with OpenID Connect strategy for authentication middleware
- **express-session** with PostgreSQL session store for session management

### UI Component Libraries
- **Radix UI** component primitives for accessible and customizable UI elements
- **shadcn/ui** component system built on Radix UI
- **Tailwind CSS** for utility-first styling and responsive design
- **Lucide React** for consistent iconography throughout the application

### Data Fetching and State Management
- **TanStack React Query** for server state management and caching
- **React Hook Form** with Zod resolvers for form validation and handling

### External API Integrations
- **OpenAI API** for generating AI-powered gardening tips and plant care advice
- **OpenWeatherMap API** for location-based weather data and gardening recommendations

### Development and Build Tools
- **TypeScript** for static type checking and enhanced developer experience
- **ESBuild** for server-side bundling and production builds
- **PostCSS** with Autoprefixer for CSS processing and vendor prefixes

### Utility Libraries
- **date-fns** for date manipulation and formatting
- **clsx** and **class-variance-authority** for conditional CSS class management
- **zod** for schema validation and type inference
- **nanoid** for generating unique identifiers