# Stock Weaver Dashboard

## Project Overview

**Stock Weaver Dashboard** is a comprehensive retail management dashboard built with React, TypeScript, and Tailwind CSS. It provides real-time analytics for stock management, sales tracking, and store performance monitoring.

### Key Features

- 📊 **Real-time Dashboard** - Overview of sales, stock levels, and performance metrics
- 🏪 **Multi-store Management** - Support for multiple store locations
- 📈 **Sales Analytics** - Detailed sales reports and trend analysis
- 📦 **Inventory Management** - Stock tracking, low stock alerts, and search functionality
- 🔐 **Authentication** - Secure login system
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

### API Integration

The dashboard connects to a backend API with the following endpoints:
- Authentication and user management
- Store management and KPIs
- Sales analytics and best-selling products
- Inventory tracking and stock management
- Period comparisons and evolution reports

## Project info

**URL**: https://lovable.dev/projects/7108e4f3-71f1-490c-acf1-1c0bec860306

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/7108e4f3-71f1-490c-acf1-1c0bec860306) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Configure the API endpoint
cp .env.example .env
# Edit .env file to set your backend API URL:
# VITE_API_BASE_URL=http://your-backend-url:port

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

### Backend Setup

Make sure your backend server is running and accessible. The dashboard expects the following API structure:

- Base URL: Configured in `.env` file (default: `http://localhost:8080`)
- All endpoints should follow the API documentation provided
- CORS should be properly configured to allow requests from your frontend domain

### API Endpoints Used

The dashboard integrates with these key endpoints:
- `POST /Login` - User authentication
- `GET /dashboardMagasins` - Store dashboard data
- `POST /getMagasins` - List of stores
- `POST /bestSalesPrds` - Best selling products
- `POST /GlobalStock` - Inventory data
- `GET /evolutionCA` - Sales evolution data
- And more (see `src/lib/api.ts` for complete list)

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript development
- **React** - Component-based UI library
- **shadcn-ui** - Modern UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Server state management
- **React Router** - Client-side routing
- **Recharts** - Chart visualization library
- **Lucide React** - Beautiful icon library

### Architecture

- **Design System**: Complete design system with semantic tokens defined in `src/index.css`
- **Component Library**: Reusable UI components in `src/components/ui/`
- **API Layer**: Centralized API service in `src/lib/api.ts`
- **Authentication**: Route guards and JWT-based authentication
- **Responsive**: Mobile-first responsive design
- **TypeScript**: Full type safety throughout the application

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/7108e4f3-71f1-490c-acf1-1c0bec860306) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
