
# TALA – Targeted Assistance for Local Awareness

  TALA is an offline-first health decision support system designed for Barangay Health Workers (BHWs) and community residents. 
  It provides triage guidance, health articles, and emergency contact access even without internet connectivity.

## Objectives

  - Provide accessible health triage for residents without requiring login
  - Enable BHW admins to manage health content and triage protocols
  - Support offline usage using local storage / caching
  - Deliver structured decision-making through a triage flow engine

## Features

### Resident App (No Login)
  - Get Started onboarding
  - Health triage flow
  - Emergency contacts
  - Health articles
  - Offline-first functionality

### Admin Dashboard (Login Required)
  - Secure login
  - Manage articles
  - Manage emergency contacts
  - Configure triage protocols
  - View analytics

## Project Structure

├───src
│   ├───app
│   │   ├───components
│   │   │   ├───layout
│   │   │   ├───shared
│   │   │   └───ui
│   │   ├───context
│   │   ├───hooks
│   │   ├───pages
│   │   │   ├───admin
│   │   │   └───resident
│   │   ├───services
│   │   ├───triage
│   │   │   └───steps
│   │   └───utils
│   │       └───supabase
│   ├───assets
│   │   ├───icons
│   │   ├───images
│   │   └───logo
│   └───styles
└───supabase
    └───functions
        └───server

## Installation

  1. Clone the repository:
  git clone https://github.com/your-username/tala-system.git
  
  2. Install dependencies:
  npm install
  
  3. Run the development server:
  npm run dev

## Environment Variables

  Create a .env file:
  
  VITE_SUPABASE_URL=your_url
  VITE_SUPABASE_ANON_KEY=your_key

## Usage

  - Resident App: http://localhost:5173/
  - Admin Login: http://localhost:5173/login
  - Admin Dashboard: http://localhost:5173/admin

## Project Status

  Capstone Phase 1 (50%)
  - UI and routing setup
  - Basic triage flow
  - Admin dashboard structure
  
  Planned (Phase 2)
  - Full backend integration
  - Advanced analytics
  - Deployment

## Authors

- Carl Andrie Santos– BSIT 3rd Year

# TALA – Targeted Assistance for Local Awareness

  TALA is an offline-first health decision support system designed for Barangay Health Workers (BHWs) and community residents. 
  It provides triage guidance, health articles, and emergency contact access even without internet connectivity.

## Objectives

  - Provide accessible health triage for residents without requiring login
  - Enable BHW admins to manage health content and triage protocols
  - Support offline usage using local storage / caching
  - Deliver structured decision-making through a triage flow engine

## Features

### Resident App (No Login)
  - Get Started onboarding
  - Health triage flow
  - Emergency contacts
  - Health articles
  - Offline-first functionality

### Admin Dashboard (Login Required)
  - Secure login
  - Manage articles
  - Manage emergency contacts
  - Configure triage protocols
  - View analytics

## Project Structure

├───src
│   ├───app
│   │   ├───components
│   │   │   ├───layout
│   │   │   ├───shared
│   │   │   └───ui
│   │   ├───context
│   │   ├───hooks
│   │   ├───pages
│   │   │   ├───admin
│   │   │   └───resident
│   │   ├───services
│   │   ├───triage
│   │   │   └───steps
│   │   └───utils
│   │       └───supabase
│   ├───assets
│   │   ├───icons
│   │   ├───images
│   │   └───logo
│   └───styles
└───supabase
    └───functions
        └───server

## Installation

  1. Clone the repository:
  git clone https://github.com/your-username/tala-system.git
  
  2. Install dependencies:
  npm install
  
  3. Run the development server:
  npm run dev

## Environment Variables

  Create a .env file:
  
  VITE_SUPABASE_URL=your_url
  VITE_SUPABASE_ANON_KEY=your_key

## Usage

  - Resident App: http://localhost:5173/
  - Admin Login: http://localhost:5173/login
  - Admin Dashboard: http://localhost:5173/admin

## Project Status

  Capstone Phase 1 (50%)
  - UI and routing setup
  - Basic triage flow
  - Admin dashboard structure
  
  Planned (Phase 2)
  - Full backend integration
  - Advanced analytics
  - Deployment

## Authors

- Carl Andrie Santos– BSIT 3rd Year