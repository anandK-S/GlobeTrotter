# GlobeTrotter - Comprehensive Process Flowcharts & Architecture Maps

This document contains detailed visual flowcharts for all core processes in the GlobeTrotter travel planning application.

---

## 1. Overall System Architecture & Data Flow

```mermaid
graph TD
    User([Traveler / User])
    Admin([System Admin])

    subgraph Client Layer [React 18 + Vite + TypeScript + Tailwind CSS]
        UI1[Auth Pages - Login / Signup / OTP]
        UI2[Dashboard & Trip List]
        UI3[Itinerary Builder & Drag-to-Reorder]
        UI4[Interactive Map & Leaflet Route Viewer]
        UI5[Chart.js Budget Analytics]
        UI6[Public Shareable Page]
        UI7[Admin Control Center]
    end

    subgraph Backend Layer [Node.js + Express API Server]
        API_Auth[Auth Controller & JWT Middleware]
        API_Trips[Trip & Stop Controller]
        API_Catalog[Destinations & Activity Catalog]
        API_Brevo[Brevo Transactional Email Service]
        API_Admin[Admin Analytics Controller]
    end

    subgraph Database Layer [SQLite Relational Storage]
        DB_Users[(users)]
        DB_Trips[(trips & trip_stops)]
        DB_Activities[(stop_activities)]
        DB_Catalog[(destinations_master)]
    end

    User --> UI1
    User --> UI2
    User --> UI3
    User --> UI4
    User --> UI5
    User --> UI6
    Admin --> UI7

    UI1 --> API_Auth
    UI2 & UI3 & UI4 --> API_Trips
    UI3 --> API_Catalog
    UI7 --> API_Admin

    API_Auth --> API_Brevo
    API_Auth --> DB_Users
    API_Trips --> DB_Trips
    API_Trips --> DB_Activities
    API_Catalog --> DB_Catalog
    API_Admin --> DB_Users & DB_Trips
```

---

## 2. Authentication & Brevo Transactional Email OTP Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant App as React Frontend
    participant API as Express Backend
    participant DB as SQLite DB
    participant Brevo as Brevo Email API

    Note over User, Brevo: Registration & Welcome Email Flow
    User->>App: Submits Sign Up Form (Name, Email, Password)
    App->>API: POST /api/auth/register
    API->>DB: Hash password & INSERT into users
    API->>Brevo: Send Transactional Welcome Email
    Brevo-->>User: Delivers Welcome Email
    API-->>App: Return JWT Token & User Profile
    App-->>User: Redirect to Dashboard

    Note over User, Brevo: Forgot Password OTP Flow
    User->>App: Clicks "Forgot Password" & Enters Email
    App->>API: POST /api/auth/forgot-password
    API->>DB: Generate 6-digit OTP & store with 10-min expiry
    API->>Brevo: Trigger OTP Email Payload
    Brevo-->>User: Email with 6-digit Security OTP
    User->>App: Enters OTP & New Password in Modal
    App->>API: POST /api/auth/verify-otp
    API->>DB: Verify OTP & update password_hash
    API-->>App: Password Updated Successfully
    App-->>User: Toast Notification & Prompt Login
```

---

## 3. Multi-City Trip Creation & Itinerary Building Flow

```mermaid
flowchart TD
    Start([User clicks 'Plan New Trip']) --> Step1[Enter Trip Name, Start & End Dates, Total Budget]
    Step1 --> ValidateDates{Is End Date >= Start Date?}
    ValidateDates -- No --> DateError[Display Error: Invalid Date Range] --> Step1
    ValidateDates -- Yes --> SelectCover[Choose Destination Cover Photo]
    SelectCover --> CreateTrip[POST /api/trips - Save Trip Record]
    
    CreateTrip --> Builder[Navigate to Itinerary Builder]
    Builder --> AddStop[Click 'Add City Stop']
    AddStop --> SearchCity[Search City Autocomplete from Master Destinations]
    SearchCity --> SetDuration[Set Arrival Date, Departure Date & Stay Cost]
    SetDuration --> SaveStop[POST /api/trips/:id/stops]
    
    SaveStop --> ReorderStops[Drag-and-Drop to Reorder City Sequence]
    ReorderStops --> AddActivity[Click 'Add Activity' to Stop]
    AddActivity --> CatalogSearch[Filter Activities by Vibe: Sightseeing/Food/Adventure]
    CatalogSearch --> SelectActivity[Select Activity, Cost, Duration & Time]
    SelectActivity --> SaveActivity[POST /api/trips/:id/activities]
    
    SaveActivity --> Recalc[Recalculate Cumulative Cost = Sum of Stays + Activities]
    Recalc --> BudgetCheck{Cumulative Cost > Total Budget?}
    BudgetCheck -- Yes --> OverBudget[Show Red Warning Badge & Doughnut Alert]
    BudgetCheck -- No --> NormalBudget[Show Green On-Track Badge]
    
    OverBudget & NormalBudget --> FinalView[Render Interactive Day-by-Day List & Leaflet Map]
```

---

## 4. Public Trip Sharing & Forking Flow

```mermaid
flowchart LR
    Owner[Trip Owner] -->|Clicks 'Share Trip'| GenerateSlug[Generate Unique Share Slug]
    GenerateSlug --> UpdateDB[SET is_public = true, share_slug = uuid]
    UpdateDB --> CopyLink[Copy URL: /share/:slug]
    
    CopyLink -->|Share via WhatsApp/Twitter/Direct| Friend[Friend / Visitor]
    Friend --> OpenURL[Access /share/:slug in Browser]
    OpenURL --> PublicView[Render Read-Only Public Itinerary Screen]
    
    PublicView --> ForkBtn[Click 'Fork / Copy Trip to My Account']
    ForkBtn --> CheckAuth{Is Visitor Logged In?}
    CheckAuth -- No --> RedirectLogin[Redirect to /login with Return URL]
    CheckAuth -- Yes --> API_Fork[POST /api/trips/:id/duplicate]
    
    API_Fork --> CloneTrip[Deep Clone Trip, Stops & Activities in SQLite]
    CloneTrip --> SuccessToast[Toast: 'Trip duplicated to your account!']
    SuccessToast --> MyTrips[Redirect to My Trips Screen]
```

---

## 5. Admin Analytics & User Control Flow

```mermaid
flowchart TD
    AdminUser([Admin User]) --> Login[Login with Admin Credentials]
    Login --> VerifyRole{Is Role == 'admin'?}
    VerifyRole -- No --> Deny[Access Denied - Redirect to /dashboard]
    VerifyRole -- Yes --> AdminDashboard[Access /admin Dashboard Screen]
    
    AdminDashboard --> MetricCards[Fetch Platform KPIs: Total Users, Total Trips, Cumulative Budget]
    AdminDashboard --> Charts[Render Platform Growth & Popular Destinations Charts]
    AdminDashboard --> UserTable[Render Interactive Users Table]
    
    UserTable --> SearchUser[Filter / Search User by Name or Email]
    UserTable --> ToggleStatus[Toggle User Active Status / Elevation]
    UserTable --> DeleteUser[Delete Inactive User Account]
    
    ToggleStatus & DeleteUser --> API_AdminAction[POST /api/admin/users/action]
    API_AdminAction --> UpdateDB[(Update SQLite DB)]
```
