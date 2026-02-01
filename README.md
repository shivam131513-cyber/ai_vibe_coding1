# 🏛️ CivicGuard Hub

**A modern civic engagement platform empowering citizens to report and track urban hazards, fostering community-driven accountability and safer cities.**

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![React](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Supabase](https://img.shields.io/badge/Supabase-Powered-green)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)

---

## 🌟 Core Features

### ✅ Fully Implemented

#### 📍 **Hazard Reporting System**
- **Multi-step Report Flow** - Intuitive 4-step process (Capture → Location → Details → Review)
- **Photo Upload** - Upload hazard photos with preview
- **GPS Location Capture** - "Use Current Location" button for precise coordinates
- **Comprehensive Details** - Hazard type, category, severity, and description
- **GPS Coordinates Display** - Prominently shown on review page with copy functionality
- **Ticket ID Generation** - Unique ticket IDs for tracking (format: CG-MI-3R7BV-NRJM3)
- **Urgency Score** - Automatic calculation based on severity and type
- **Success Confirmation** - Clear feedback with ticket ID

#### 📊 **Personal Dashboard**
- **User Statistics** - Total reports, resolved count, pending reports
- **Reputation Points** - Track your civic engagement score
- **Recent Reports List** - View all your submitted reports
- **Status Badges** - Visual indicators for report status
- **Quick Actions** - "View Details" links to full report pages
- **Responsive Cards** - Beautiful card-based layout

#### 🗺️ **Interactive Heatmap**
- **Card Grid View** - Visual display of all reports with location data
- **Advanced Filters** - Filter by severity (Low, Moderate, High, Critical)
- **Status Filtering** - Filter by status (Sent, Acknowledged, In Progress, Resolved)
- **Location Statistics** - Shows "X of Y reports have location data"
- **Dark Mode Support** - Properly styled filters for both themes
- **Responsive Grid** - Adapts to mobile, tablet, and desktop

#### 📄 **Report Detail Pages**
- **Full Report Information** - Complete hazard details
- **GPS Coordinates Section** - Latitude/Longitude with 6 decimal precision
- **Copy Coordinates** - One-click copy to clipboard
- **Google Maps Integration** - "View on Google Maps" button
- **Photo Display** - Full-size hazard photo
- **Status Timeline** - Track report progress
- **Share Functionality** - Share report links
- **Reporter Information** - User details (name, avatar)

#### 🔐 **Authentication & Security**
- **Email/Password Auth** - Secure authentication via Supabase
- **Protected Routes** - Authenticated-only pages
- **Session Management** - Persistent login sessions
- **Row Level Security** - Database-level access control
- **Secure File Upload** - Protected storage bucket

#### 🎨 **Modern UI/UX**
- **Dark Mode** - Full dark mode support with theme persistence
- **Responsive Design** - Works on mobile (320px+), tablet (768px+), desktop (1024px+)
- **shadcn/ui Components** - Beautiful, accessible UI components
- **Smooth Animations** - Polished transitions and interactions
- **Toast Notifications** - User-friendly feedback messages
- **Loading States** - Skeleton loaders and spinners
- **Error Handling** - Clear error messages with recovery options

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Supabase Account** ([sign up free](https://supabase.com))

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd civicguard-hub-main
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project:
- Go to [supabase.com](https://supabase.com) → Your Project
- Navigate to **Settings** → **API**
- Copy **Project URL** and **anon public** key

4. **Set up the database**

Run these SQL scripts in Supabase SQL Editor (in order):

```bash
# 1. Base schema
DATABASE-SETUP-CLEAN.sql

# 2. Add missing columns
FIX-ALL-MISSING-COLUMNS.sql

# 3. Fix status constraint
FIX-STATUS-CONSTRAINT.sql

# 4. Add RLS policies
FIX-REPORT-SUBMISSION-SIMPLE.sql
FIX-REPORT-VIEW-POLICY.sql

# 5. Add foreign key relationship
FIX-FOREIGN-KEY.sql
```

5. **Configure Storage Bucket**

In Supabase Dashboard:
- Go to **Storage** → Create new bucket: `hazard-photos`
- Make it **Public**
- Add policies for authenticated upload and public read

6. **Start the development server**
```bash
npm run dev
```

7. **Open your browser**
```
http://localhost:5173
```

---

## 📁 Project Structure

```
civicguard-hub-main/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── Navbar.tsx      # Navigation bar
│   │   └── Footer.tsx      # Footer component
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication state
│   ├── hooks/              # Custom React hooks
│   │   └── useUserProfile.tsx
│   ├── lib/                # Utilities and config
│   │   ├── supabase.ts     # Supabase client
│   │   └── utils.ts        # Helper functions
│   ├── pages/              # Page components
│   │   ├── Index.tsx       # Landing page
│   │   ├── Login.tsx       # Authentication
│   │   ├── Dashboard.tsx   # User dashboard
│   │   ├── Profile.tsx     # User profile
│   │   ├── ReportHazard.tsx # Report submission (4-step flow)
│   │   ├── ReportDetail.tsx # Individual report view
│   │   ├── Heatmap.tsx     # Map view with filters
│   │   └── NotFound.tsx    # 404 page
│   ├── App.tsx             # Main app with routing
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── DATABASE-SETUP-CLEAN.sql # Base database schema
├── FIX-*.sql              # Database fix scripts
├── package.json
└── README.md
```

---

## 🗄️ Database Schema

### Core Tables

**users**
- `id` - UUID (links to Supabase auth)
- `name` - User full name
- `email` - User email
- `avatar_url` - Profile picture URL
- `reputation_points` - Civic engagement score
- `total_reports` - Count of submitted reports
- `resolved_reports` - Count of resolved reports
- `created_at` - Account creation timestamp

**reports**
- `id` - UUID primary key
- `ticket_id` - Unique identifier (e.g., CG-MI-3R7BV-NRJM3)
- `user_id` - Foreign key to users
- `hazard_type` - Type of hazard
- `category` - Category (Roads, Water, Safety, etc.)
- `severity` - Low, Moderate, High, Critical
- `description` - Detailed description
- `location_lat` - Latitude (nullable)
- `location_lon` - Longitude (nullable)
- `location_address` - Address text
- `photo_url` - Uploaded photo URL
- `status` - sent, acknowledged, in_progress, resolved, verified
- `urgency_score` - 1-10 urgency rating
- `created_at` - Report submission timestamp
- `updated_at` - Last update timestamp

---

## 🎯 Usage Guide

### Reporting a Hazard

1. Click **"Report Hazard"** in navigation
2. **Step 1: Capture** - Upload a photo of the hazard
3. **Step 2: Location** - Click "Use Current Location" to capture GPS coordinates
4. **Step 3: Details** - Fill in:
   - Hazard Type (Pothole, Broken Light, etc.)
   - Category (Roads, Water, Safety, etc.)
   - Severity (Low, Moderate, High, Critical)
   - Description
5. **Step 4: Review** - Verify all details including GPS coordinates
6. **Submit** - Receive unique ticket ID

### Viewing Your Reports

1. Go to **Dashboard**
2. View statistics (total reports, resolved, pending)
3. Scroll to "My Reports" section
4. Click **"View Details"** on any report
5. See full report with GPS coordinates, photo, and status

### Using the Heatmap

1. Navigate to **Heatmap** page
2. Use filters to narrow down reports:
   - **Severity**: All, Low, Moderate, High, Critical
   - **Status**: All, Sent, Acknowledged, In Progress, Resolved
3. View reports in card grid format
4. Click on any card to view full details
5. See location statistics at the top

---

## 🛠️ Development

### Available Scripts

```bash
# Start development server (port 5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Tech Stack

**Frontend**
- React 18.2 with TypeScript
- Vite 5.4 (build tool)
- React Router DOM (routing)
- Tailwind CSS 3.4 (styling)
- shadcn/ui (UI components)

**Backend**
- Supabase (Auth, Database, Storage)
- PostgreSQL (database)
- Row Level Security (RLS)

**Libraries**
- Leaflet 1.9.4 (maps)
- React Leaflet 4.2.1 (React integration)
- Lucide React (icons)
- Sonner (toast notifications)
- date-fns (date formatting)
- @tanstack/react-query (data fetching)

---

## 🔒 Security Features

- ✅ Row Level Security (RLS) on all tables
- ✅ Users can only view/edit their own reports
- ✅ Authenticated-only routes
- ✅ Secure file upload with storage policies
- ✅ Environment variables for sensitive keys
- ✅ XSS protection via React
- ✅ CSRF protection via Supabase

---

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1439px
- **Large Desktop**: 1440px+

All components are fully responsive and tested across devices.

---

## 🚀 Deployment to Vercel

### Prerequisites
- GitHub account
- Vercel account ([sign up free](https://vercel.com))
- Supabase project set up

### Deployment Steps

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. **Import to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click **"New Project"**
- Import your GitHub repository
- Select **"civicguard-hub-main"** folder

3. **Configure Build Settings**
- Framework Preset: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

4. **Add Environment Variables**
In Vercel project settings, add:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. **Deploy!**
- Click **"Deploy"**
- Wait for build to complete
- Your app will be live at `https://your-project.vercel.app`

### Post-Deployment

1. **Update Supabase URL Settings**
   - Go to Supabase → Authentication → URL Configuration
   - Add your Vercel URL to allowed redirect URLs

2. **Test the Deployment**
   - Visit your Vercel URL
   - Test signup/login
   - Submit a test report
   - Verify all features work

---

## 🐛 Troubleshooting

### Build Errors

**"Module not found"**
- Solution: Run `npm install` to ensure all dependencies are installed

**"Environment variables not defined"**
- Solution: Check `.env` file exists and has correct Supabase credentials

### Database Errors

**"Could not find column"**
- Solution: Run all `FIX-*.sql` scripts in Supabase SQL Editor

**"Permission denied"**
- Solution: Check RLS policies are set up correctly

**"Could not find relationship"**
- Solution: Run `FIX-FOREIGN-KEY.sql` to add foreign key constraints

### Runtime Errors

**"Failed to upload image"**
- Solution: Create `hazard-photos` storage bucket in Supabase and set policies

**"Failed to load report details"**
- Solution: Ensure foreign key relationship exists between reports and users tables

**Map not loading**
- Solution: Check browser console for errors, ensure Leaflet CSS is loaded

---

## 📊 Project Status

### Completed Features (90%)
- ✅ User authentication and profiles
- ✅ Report submission with GPS
- ✅ Photo upload and storage
- ✅ Dashboard with statistics
- ✅ Report detail pages
- ✅ Heatmap with filters (card grid)
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Database schema and RLS

### Pending Features (10%)
- ⚠️ Admin panel for report management
- ⚠️ Interactive Leaflet map with markers
- ⚠️ Real-time updates via Supabase subscriptions
- ⚠️ Email notifications
- ⚠️ Advanced search and filtering

---

## 📄 License

MIT License - feel free to use for your own projects!

---

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Maps powered by [Leaflet](https://leafletjs.com)
- Backend by [Supabase](https://supabase.com)
- Icons by [Lucide](https://lucide.dev)

---

## 📞 Support

For issues or questions:
- Check this README
- Review Supabase logs for backend errors
- Check browser console for frontend errors
- Verify all SQL scripts have been run

---

**Made with ❤️ for safer, more engaged communities**

🌟 **Star this repo if you find it useful!**
