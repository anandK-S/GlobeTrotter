# GlobeTrotter - Process Flowcharts & Architectural Diagrams

This document outlines the system architecture, sequence workflows, and data processing logic for the GlobeTrotter travel planning platform.

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

## 2. Authentication & Transactional Email Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant App as React Frontend
    participant API as Express Backend
    participant DB as SQLite DB
    participant Brevo as Brevo Email API

    Note over User, Brevo: User Registration Sequence
    User->>App: Submits Registration Credentials
    App->>API: POST /api/auth/register
    API->>DB: Hash password & store user record
    API->>Brevo: Trigger Welcome Email Payload
    Brevo-->>User: Delivers Welcome Confirmation
    API-->>App: Return JWT Token & User Profile
    App-->>User: Navigate to User Dashboard

    Note over User, Brevo: Password Reset OTP Sequence
    User->>App: Submits Password Reset Request
    App->>API: POST /api/auth/forgot-password
    API->>DB: Store 6-digit OTP with timestamp limit
    API->>Brevo: Dispatch Transactional Email Payload
    Brevo-->>User: Email containing OTP Code
    User->>App: Submits OTP & New Password
    App->>API: POST /api/auth/verify-otp
    API->>DB: Validate OTP & update password hash
    API-->>App: Return Confirmation Response
    App-->>User: Prompt User Authentication
```

---

## 3. Multi-City Trip Construction Workflow

```mermaid
flowchart TD
    Start([User Selects 'Plan New Trip']) --> Step1[Enter Title, Date Range & Budget]
    Step1 --> ValidateDates{Is End Date >= Start Date?}
    ValidateDates -- No --> DateError[Return Validation Error] --> Step1
    ValidateDates -- Yes --> SelectCover[Assign Cover Photo]
    SelectCover --> CreateTrip[POST /api/trips - Create Trip Instance]
    
    CreateTrip --> Builder[Navigate to Itinerary Builder]
    Builder --> AddStop[Add City Stop]
    AddStop --> SearchCity[Query Master Destinations Catalog]
    SearchCity --> SetDuration[Configure Arrival, Departure & Accommodation Cost]
    SetDuration --> SaveStop[POST /api/trips/:id/stops]
    
    SaveStop --> ReorderStops[Reorder Sequence via Drag-and-Drop]
    ReorderStops --> AddActivity[Add Activity to Stop]
    AddActivity --> CatalogSearch[Filter Activities by Category]
    CatalogSearch --> SelectActivity[Specify Activity Details & Cost]
    SelectActivity --> SaveActivity[POST /api/trips/:id/activities]
    
    SaveActivity --> Recalc[Compute Cumulative Expense]
    Recalc --> BudgetCheck{Expense > Allocated Budget?}
    BudgetCheck -- Yes --> OverBudget[Display Over-Budget Indicator]
    BudgetCheck -- No --> NormalBudget[Display Within-Budget Indicator]
    
    OverBudget & NormalBudget --> FinalView[Render Itinerary & Route Map]
```

---

## 4. Public Itinerary Sharing & Duplication Flow

```mermaid
flowchart LR
    Owner[Trip Owner] -->|Selects Share Option| GenerateSlug[Generate Unique Identifier]
    GenerateSlug --> UpdateDB[Update Record Public Status]
    UpdateDB --> CopyLink[Generate Public Link]
    
    CopyLink -->|Distribution| Visitor[External User]
    Visitor --> OpenURL[Access Public Route]
    OpenURL --> PublicView[Render Read-Only Itinerary]
    
    PublicView --> ForkBtn[Select Clone Itinerary Option]
    ForkBtn --> CheckAuth{Is Visitor Authenticated?}
    CheckAuth -- No --> RedirectLogin[Redirect to Login Route]
    CheckAuth -- Yes --> API_Fork[POST /api/trips/:id/duplicate]
    
    API_Fork --> CloneTrip[Duplicate Trip, Stops & Activities]
    CloneTrip --> SuccessToast[Display Confirmation]
    SuccessToast --> MyTrips[Redirect to User Trip Collection]
```

---

## 5. Administrative Analytics & Account Management Flow

```mermaid
flowchart TD
    AdminUser([Admin User]) --> Login[Authenticate Credentials]
    Login --> VerifyRole{Is Account Role Admin?}
    VerifyRole -- No --> Deny[Access Denied - Redirect to Dashboard]
    VerifyRole -- Yes --> AdminDashboard[Access Administration Panel]
    
    AdminDashboard --> MetricCards[Query Platform Key Metrics]
    AdminDashboard --> Charts[Render Platform Usage Visualizations]
    AdminDashboard --> UserTable[Render User Management Data]
    
    UserTable --> SearchUser[Filter Accounts by Identifier]
    UserTable --> ToggleStatus[Modify Account Status]
    UserTable --> DeleteUser[Remove Account]
    
    ToggleStatus & DeleteUser --> API_AdminAction[POST /api/admin/users/action]
    API_AdminAction --> UpdateDB[(Update Database State)]
```
