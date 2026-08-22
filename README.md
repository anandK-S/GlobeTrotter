<div align="center">

# GlobeTrotter - Personalized Multi-City Travel Planning Platform

### Built for the Odoo Hackathon 2026

*An intelligent, full-stack multi-city travel planning platform featuring interactive Leaflet route mapping, real-time Chart.js budget forecasting, day-by-day scheduling, Supabase Cloud / Relational database architecture, Brevo transactional email OTP, and public collaborative itinerary sharing.*

---

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black&style=for-the-badge)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white&style=for-the-badge)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white&style=for-the-badge)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white&style=for-the-badge)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900?logo=leaflet&logoColor=white&style=for-the-badge)](https://leafletjs.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-Analytics-FF6384?logo=chartdotjs&logoColor=white&style=for-the-badge)](https://www.chartjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Cloud_Ready-3ECF8E?logo=supabase&logoColor=white&style=for-the-badge)](https://supabase.com/)
[![Brevo](https://img.shields.io/badge/Brevo-Transactional_Email-0B99FF?logo=sendinblue&logoColor=white&style=for-the-badge)](https://www.brevo.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Relational_DB-003B57?logo=sqlite&logoColor=white&style=for-the-badge)](https://www.sqlite.org/)

</div>

---

## Table of Contents
1. [Core Features and Capabilities](#core-features-and-capabilities)
2. [Complete End-to-End System and User Flowcharts](#complete-end-to-end-system-and-user-flowcharts)
3. [13 Screens Feature Matrix](#13-screens-feature-matrix)
4. [Hybrid Authentication and Brevo Email Flow](#hybrid-authentication-and-brevo-email-flow)
5. [Relational Database and Entity Relationship Model](#relational-database-and-entity-relationship-model)
6. [Demo Accounts](#demo-accounts)
7. [Supabase Setup](#supabase-setup)
8. [Installation and Startup Guide](#installation-and-startup-guide)
9. [REST API Endpoints Specification](#rest-api-endpoints-specification)

---

## Core Features and Capabilities

- **Modern Glassmorphic UI**: Designed with Tailwind CSS, Lucide travel icons, dark/light theme switching, responsive grid layouts, and micro-interactions powered by Framer Motion and Canvas Confetti.
- **Interactive Leaflet Route Maps**: Connected multi-city polyline routes with flight arcs, custom numbered map markers, stop-order pins, and popup activity summaries.
- **Real-Time Financial Analytics**: Interactive Chart.js Doughnut (Expense Categories) and Stacked Bar (City-by-City Cost Distribution) charts with live over-budget alert banners.
- **Smart Country and Phone Code Auto-Binding**: Real-time country selector (India, United States, United Kingdom, France, Japan, United Arab Emirates, etc.) that automatically sets the matching international dial code (+91, +1, +44, etc.) and default home currency.
- **Profile Photo Customizer**: Curated avatar presets with selection states plus custom photo URL input.
- **Dual-Backend Architecture**: Works out-of-the-box with a zero-dependency Relational SQLite Backend and provides instant cloud sync with Supabase PostgreSQL (`supabase/schema.sql`).
- **Brevo Transactional Emails**: Dispatches 6-digit OTP verification codes and HTML welcome onboarding emails, featuring a development simulation fallback for judging.
- **Public Share and 1-Click Fork**: Shareable public URLs that allow fellow travelers to view, copy, or fork any itinerary into their personal account.
- **Admin and Analytics Governance**: Dedicated administrator control panel with platform KPIs, top destination visit metrics, category spending distributions, and user management.

---

## Complete End-to-End System and User Flowcharts

### 1. Platform Navigation and User Journey Flow
```mermaid
flowchart TD
    Start([Visitor Lands on GlobeTrotter]) --> CheckAuth{Logged In?}

    %% Authentication Branch
    CheckAuth -- No --> AuthPage[Screen 1: Login / Signup / OTP]
    AuthPage -->|Sign Up + Country & Phone| BrevoWelcome[Brevo Welcome Email Sent]
    AuthPage -->|Forgot Password| BrevoOTP[Brevo 6-Digit OTP Sent]
    BrevoOTP --> VerifyOTP[Verify OTP & Set New Password]
    VerifyOTP --> AuthPage
    AuthPage -->|JWT Token Issued| Dashboard

    %% Authenticated Core Experience
    CheckAuth -- Yes --> Dashboard[Screen 2: Dashboard / Home Hub]

    Dashboard --> PlanNew[Screen 3: Create Trip Blueprint]
    Dashboard --> ExploreCities[Screen 7: City Search & Catalog]
    Dashboard --> ExploreActivities[Screen 8: Activity Catalog]
    Dashboard --> MyTripsList[Screen 4: My Trips Management]
    Dashboard --> ProfileSettings[Screen 12: User Profile & Wishlist]
    Dashboard -->|Role = Admin| AdminPanel[Screen 13: Admin Analytics & Governance]

    %% Itinerary Creation Flow
    PlanNew -->|Enter Dates, Budget & Cover| ItinBuilder[Screen 5: Multi-City Itinerary Builder]
    ItinBuilder -->|Add Cities, Order, Transit| StopActivities[Assign Activities & Daily Costs]
    StopActivities --> ItinView[Screen 6: Itinerary View & Interactive Leaflet Map]

    %% Deep Itinerary Views
    ItinView --> BudgetScreen[Screen 9: Budget & Cost Analytics Charts]
    ItinView --> CalendarScreen[Screen 10: Trip Calendar & Timeline]
    ItinView --> GenerateShare[Generate Public Share Slug]

    %% Public Sharing Flow
    GenerateShare --> PublicItin[Screen 11: Public Itinerary Page]
    PublicItin -->|Share on WhatsApp / X / Link| SocialViral[Community Discovery]
    PublicItin -->|Fork / Copy to My Trips| ForkAction[Clone Itinerary to User Account]
    ForkAction --> MyTripsList
```

---

### 2. Multi-City Trip Builder and Route Execution Pipeline
```mermaid
flowchart LR
    subgraph Step1["1. Blueprint Setup"]
        A[Title & Description] --> B[Start & End Dates]
        B --> C[Set Total Budget & Currency]
        C --> D[Choose Cover Image]
    end

    subgraph Step2["2. Itinerary Builder"]
        E[Search Global Destination] --> F[Select Transit Mode: Flight/Train/Bus/Car]
        F --> G[Reorder Stops: Move Up / Down]
        G --> H[Assign Master or Custom Activities]
    end

    subgraph Step3["3. Real-Time Telemetry"]
        I[Leaflet Route Polyline]
        J[Chart.js Category Doughnut]
        K[Over-Budget Threshold Detection]
    end

    Step1 --> Step2
    Step2 --> Step3
```

---

## 13 Screens Feature Matrix

| # | Screen Name | Route Path | Core Capabilities and Layout Polish |
|---|---|---|---|
| **1** | **Login / Signup / OTP** | `/login` | Split-screen travel artwork, profile photo picker (presets + URL), country selector with auto-dial code (+91, +1, +44), password strength meter, JWT + Supabase + Brevo OTP email flow, and 1-click demo login buttons. |
| **2** | **Dashboard / Home** | `/dashboard` | Personalized traveler greeting with user avatar, quick KPI cards (Trips, Destinations, Budget), prominent "Plan New Trip" hero CTA, recent trips stream, and trending global destinations carousel. |
| **3** | **Create Trip** | `/create-trip` | Step-by-step trip blueprint form: Title, start & end date picker with auto-calculated duration, budget input, currency selector, curated high-res cover photos, and live preview card. |
| **4** | **My Trips (List View)** | `/my-trips` | Filter tabs (All, Upcoming, Ongoing, Completed), search bar, Grid/List view toggle, summary cards with budget progress meters, actions (View, Edit, Duplicate, Share, Delete). |
| **5** | **Itinerary Builder** | `/itinerary/:id/builder` | Interactive multi-city builder: "Add Stop" modal with city search autocomplete, date allocation per stop, drag/move up-down city reordering, transport mode selector (flight, train, bus, car), and activity assigner. |
| **6** | **Itinerary View** | `/itinerary/:id` | Comprehensive itinerary visualizer: Day-wise breakdown, city headers, activity blocks with time/cost/category badges, and dual view toggle (Interactive Timeline vs Route Map), plus Print/PDF export. |
| **7** | **City Search & Explore** | `/explore-cities` | Global destination discovery directory: Filter by continent/region (Europe, Asia, Americas, Africa, Oceania), cost index ($, $$, $$$, $$$$), popularity rating, and direct "Add to Trip" action modal. |
| **8** | **Activity Search & Catalog** | `/activities` | Browse experiences by category (Sightseeing, Food & Dining, Adventure, Culture, Nightlife, Relaxation), max price filter, and modal preview with instant "Add to Stop" scheduling. |
| **9** | **Trip Budget & Cost Breakdown** | `/itinerary/:id/budget` | Financial dashboard: Budget vs Total Cost, interactive Doughnut Chart (Transport, Accommodation, Activities, Food, Misc) and daily spending Bar Chart, currency switcher, and over-budget alert banners. |
| **10** | **Trip Calendar & Timeline** | `/itinerary/:id/calendar` | Interactive calendar view with day ribbons, expandable day views, and sequential activity timeline showing scheduled start times and durations. |
| **11** | **Shared / Public Itinerary** | `/share/:slug` | Clean read-only presentation page accessible via public URL/slug, interactive route map, summary stats, "Copy Trip to My Account" feature, and one-click social share buttons (WhatsApp, Twitter/X, Copy Link). |
| **12** | **User Profile & Settings** | `/profile` | Editable user details (name, avatar, bio, home country, phone number, currency), travel style tags (Solo, Luxury, Backpacking, Foodie, Nature), saved wishlist destinations, and danger-zone account deletion. |
| **13** | **Admin / Analytics Dashboard** | `/admin` | Admin-only control center: Platform KPIs (Total Users, Trips Created, Total Budget), top destination visit rankings, category expenditure stats, and user governance table with role toggles. |

---

## Hybrid Authentication and Brevo Email Flow

```mermaid
sequenceDiagram
    autonumber
    actor Traveler as Traveler
    participant Frontend as React 19 Frontend
    participant Backend as Express Backend
    participant DB as Relational SQLite / Postgres
    participant Brevo as Brevo Email API

    Traveler->>Frontend: Register (Name, Email, Password, Country, Phone, Photo)
    Frontend->>Backend: POST /api/auth/register
    Backend->>DB: Hash Password (bcrypt) & Save User Record
    Backend->>DB: Generate 6-Digit Verification OTP (10 min expiry)
    Backend-->>Brevo: Dispatch Welcome Email & OTP Verification
    Brevo-->>Traveler: Deliver HTML Welcome Email & Code
    Backend-->>Frontend: Return JWT Session Token (7-day validity)
    Frontend->>Frontend: Store token in localStorage & update AuthContext
    Frontend-->>Traveler: Navigate to Dashboard
```

---

## Relational Database and Entity Relationship Model

```mermaid
erDiagram
    USERS ||--o{ TRIPS : creates
    USERS ||--o{ SAVED_WISHLIST : saves
    TRIPS ||--o{ TRIP_STOPS : contains
    TRIP_STOPS ||--o{ STOP_ACTIVITIES : schedules
    DESTINATIONS_MASTER ||--o{ DESTINATION_ACTIVITIES_MASTER : has
    DESTINATIONS_MASTER ||--o{ SAVED_WISHLIST : bookmarked_in

    USERS {
        string id PK
        string name
        string email
        string password
        string avatar_url
        string country
        string phone_code
        string phone_number
        string role
        string home_currency
        string preferences
        int is_verified
    }

    TRIPS {
        string id PK
        string user_id FK
        string title
        string description
        string cover_image
        string start_date
        string end_date
        float total_budget
        string currency
        int is_public
        string share_slug
    }

    TRIP_STOPS {
        string id PK
        string trip_id FK
        string city_name
        string country
        float lat
        float lng
        int order_index
        string arrival_date
        string departure_date
        string transport_mode
        float transport_cost
        float stay_cost
        string notes
    }

    STOP_ACTIVITIES {
        string id PK
        string stop_id FK
        string title
        string category
        float cost
        float duration_hours
        string scheduled_time
        int day_number
    }

    DESTINATIONS_MASTER {
        string id PK
        string name
        string country
        string continent
        string cost_index
        float popularity_score
        string hero_image
        string description
        float lat
        float lng
    }
```

---

## Demo Accounts

| Role | Email | Password | Access / Scope |
|---|---|---|---|
| **Traveler (Default)** | `traveler.user@example.com` | `Traveler@123` | Multi-city itineraries, budget analytics, calendar scheduling, wishlist bookmarks |
| **Administrator** | `admin@globetrotter.com` | `Admin@123` | Platform KPI telemetry, category expenditure charts, user governance directory |

> **Tip**: On the Login screen (`/login`), click the **"Traveler User"** or **"Admin"** 1-click buttons to instantly populate credentials.

---

## Supabase Setup

GlobeTrotter provides complete PostgreSQL integration for Supabase Cloud:
1. Create a free project at [supabase.com](https://supabase.com/).
2. Open the **SQL Editor** and paste the contents of **`supabase/schema.sql`** (creates all tables, Row-Level Security policies, and sync triggers).
3. In `frontend/.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. The client will automatically activate Supabase Auth and Cloud database synchronization.

---

## Installation and Startup Guide

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/Nirjala7-11/GlobeTrotter.git
cd GlobeTrotter
```

### 2. Launch Backend API Server
```bash
cd backend
npm install
node src/seed/seed.js   # Seeds 15 global cities, 50+ master activities, & demo trips
npm start               # Runs Express backend on http://localhost:5000
```

### 3. Launch Frontend Application
In a second terminal:
```bash
cd frontend
npm install
npm run dev             # Runs Vite dev server on http://localhost:5173
```

Open your browser at: **`http://localhost:5173`**

---

## REST API Endpoints Specification

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user with country, phone, avatar and trigger Brevo emails | No |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT token | No |
| `POST` | `/api/auth/forgot-password`| Request 6-digit Brevo OTP verification code | No |
| `POST` | `/api/auth/reset-password` | Reset password using verified OTP | No |
| `GET` | `/api/auth/profile` | Get current authenticated user profile and stats | Yes (Bearer) |
| `PUT` | `/api/auth/profile` | Update profile, bio, country, phone, preferences | Yes (Bearer) |
| `GET` | `/api/trips` | Get all user trips with computed stops and costs | Yes (Bearer) |
| `POST` | `/api/trips` | Create new multi-city trip blueprint | Yes (Bearer) |
| `GET` | `/api/trips/:id` | Get full trip detail with ordered stops and activities | Yes (Bearer) |
| `POST` | `/api/trips/:id/stops` | Add a destination stop to trip | Yes (Bearer) |
| `PUT` | `/api/trips/:id/stops/reorder` | Reorder stops sequence | Yes (Bearer) |
| `POST` | `/api/stops/:stopId/activities` | Schedule an activity on a stop | Yes (Bearer) |
| `POST` | `/api/trips/:id/duplicate` | Duplicate / fork an existing trip | Yes (Bearer) |
| `GET` | `/api/trips/share/:slug` | Public read-only trip view by slug | No |
| `GET` | `/api/destinations` | Explore global destination catalog with filters | No |
| `POST` | `/api/wishlist/toggle` | Bookmark/unbookmark destination | Yes (Bearer) |
| `GET` | `/api/admin/analytics` | Admin KPI telemetry and category metrics | Yes (Admin) |
| `GET` | `/api/admin/users` | Admin user directory and role management | Yes (Admin) |

---

## License and Attribution
Designed and developed for the **Odoo Hackathon 2026**. Licensed under the [MIT License](LICENSE).
