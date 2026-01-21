# Lens Illumination

A modern, responsive photography portfolio web application built with React 19, TypeScript, and Firebase. Featuring dynamic album management, image uploads via Backblaze B2, comprehensive admin controls, and a beautiful user interface.

![License: GPL-3.0](https://img.shields.io/badge/License-GPL%203.0-blue.svg)
![Built with React](https://img.shields.io/badge/Built%20with-React%2019-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Styled%20with-Tailwind%204-38BDF8?logo=tailwindcss)

## ✨ Features

### Core Features
- **Dynamic Portfolio**: Showcase photography albums with public/private visibility control
- **Public Albums Page**: Browse all public albums with hero images and image counts
- **Responsive Design**: Mobile-first UI built with Tailwind CSS 4 and shadcn/ui components
- **Dark Mode**: System-aware theme with manual toggle
- **Active Page Indication**: Clear navigation with highlighted active pages

### Admin Features
- **Complete Album Management**: Create, rename, delete albums, and toggle visibility
- **Image Upload System**: Multi-image upload with progress tracking and thumbnail generation
- **Hero Image Selection**: Set custom hero images for albums and homepage
- **Content Management**: 
  - Edit homepage hero title and subtitle
  - Manage contact information (email, phone, location, Instagram)
  - Update pricing packages with descriptions and prices
- **QR Code Generation**: Share albums easily with generated QR codes
- **Bulk Operations**: Download and delete multiple images at once
- **Secure Authentication**: Firebase Auth with protected admin routes

### Technical Features
- **Firestore Integration**: Real-time data sync for albums and images
- **Backblaze B2 Storage**: Scalable cloud storage with Cloudflare Worker proxy
- **Image Optimization**: Automatic thumbnail generation for fast loading
- **Full-Screen Viewer**: Browse images with navigation controls
- **Error Handling**: Graceful error states with retry functionality
- **GPL-3.0 Copyleft**: Free and open-source software

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Firebase project with Firestore and Authentication enabled
- Backblaze B2 account for image storage
- Cloudflare Workers account for image proxy

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/LensIllumination/Client-Website.git
   cd Client-Website
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or with bun (recommended)
   bun install
   ```

3. **Configure Firebase**
   
   Create a `.env.local` file in the project root:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Set up Backblaze B2**
   - Create a B2 bucket
   - Generate application keys
   - Configure CORS settings to allow your domain
   - Deploy the Cloudflare Worker (see `worker.js` and `wrangler.toml`)

5. **Initialize Firestore**
   
   Create these collections and documents:
   ```
   settings/
     ├── hero (homepage content)
     ├── contact (contact information)
     └── pricing (pricing packages)
   
   albums/ (created via admin dashboard)
   images/ (created via admin dashboard)
   ```

6. **Configure Firebase Authentication**
   - Enable Email/Password authentication
   - Add admin user(s)
   - Update Firestore security rules with admin UIDs

7. **Start development server**
   ```bash
   npm run dev
   # or
   bun run dev
   ```
   Visit `http://localhost:5173`

8. **Build for production**
   ```bash
   npm run build
   # or
   bun run build
   ```

## 📁 Project Structure

```
├── public/
│   └── 404.html              # Custom 404 page
├── src/
│   ├── components/
│   │   ├── ui/               # shadcn/ui components (button, card, dialog, etc.)
│   │   ├── AdminFab.tsx      # Floating admin button
│   │   ├── Footer.tsx        # Site footer with navigation and auth
│   │   ├── GalleryImage.tsx  # Image component with loading states
│   │   ├── ImageErrorPanel.tsx # Error handling for images
│   │   ├── Navbar.tsx        # Navigation with active page highlighting
│   │   └── ProtectedRoute.tsx # Auth guard for admin routes
│   ├── hooks/
│   │   └── useAuth.ts        # Authentication hook
│   ├── lib/
│   │   ├── LoadAlbum.ts      # Album loading utilities
│   │   └── utils.ts          # Utility functions
│   ├── AdminDashboard.tsx    # Complete admin interface
│   ├── AdminSignIn.tsx       # Authentication page
│   ├── AdminUploader.tsx     # Image upload interface
│   ├── AlbumView.tsx         # Public album viewer
│   ├── Contact.tsx           # Contact page
│   ├── Home.tsx              # Homepage with hero
│   ├── NotFound.tsx          # 404 page
│   ├── Pricing.tsx           # Pricing packages page
│   ├── PublicAlbums.tsx      # Public albums gallery
│   ├── firebase.ts           # Firebase configuration
│   ├── index.css             # Global styles
│   └── main.tsx              # App entry point with routing
├── worker.js                 # Cloudflare Worker for B2 proxy
├── wrangler.toml             # Cloudflare Worker config
├── vite.config.ts            # Vite configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── vercel.json               # Vercel deployment config
```

## 🔧 Key Technologies

- **Frontend**: React 19, TypeScript 5, Vite 6
- **Styling**: Tailwind CSS 4, shadcn/ui, Lucide React icons
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Authentication
- **Storage**: Backblaze B2 with Cloudflare Workers proxy
- **Routing**: React Router v7
- **Image Processing**: Browser-based thumbnail generation
- **QR Codes**: qrcode.react
- **Deployment**: Vercel (frontend) + Cloudflare Workers (proxy)
- **Build Tool**: Vite with SWC compiler
- **Package Manager**: npm or Bun

## 🛠️ Admin Features

### Album Management
- Create new albums with custom names
- Rename existing albums
- Delete albums (with confirmation)
- Toggle public/private visibility
- Set hero images for albums
- View album statistics (image count, creation date)
- Bulk album operations

### Image Management
- **Multi-Image Upload**: Upload multiple images simultaneously with drag-and-drop
- **Progress Tracking**: Real-time upload progress for each image
- **Automatic Thumbnails**: Browser-based thumbnail generation for faster loading
- **Image Metadata**: Track file names, upload dates, and storage paths
- **Bulk Delete**: Select and delete multiple images at once
- **Download Options**: Download original or thumbnail versions
- **Full-Screen Viewer**: Navigate through album images with keyboard shortcuts
- **Error Handling**: Graceful handling of upload failures with retry options

### Content Management
- **Homepage Hero**:
  - Edit hero title and subtitle
  - Upload custom hero background image
  - Preview changes before saving
  
- **Contact Information**:
  - Email address
  - Phone number
  - Physical location
  - Instagram handle
  
- **Pricing Packages**:
  - Add/edit/remove pricing tiers
  - Set package name, description, and price
  - Reorder packages

### Navigation & UI
- **Protected Routes**: Secure admin-only areas with authentication
- **Admin FAB**: Floating action button for quick admin access
- **Active Page Highlighting**: Clear indication of current page in navigation
- **Mobile Responsive**: Full admin functionality on all devices
- **Dark Mode Support**: Complete theme consistency across admin interface

## 🔐 Firestore Security Rules

Configure your Firestore security rules to allow public reads and admin-only writes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             request.auth.uid in [
               "ADMIN_UID_1",  // Replace with actual admin UIDs
               "ADMIN_UID_2"
             ];
    }
    
    // Allow public reads for all documents
    match /{document=**} {
      allow read: if true;
    }
    
    // Settings collection (hero, contact, pricing)
    match /settings/{docId} {
      allow write: if isAdmin();
    }
    
    // Images collection
    match /images/{imageId} {
      allow create, update, delete: if isAdmin();
    }
    
    // Albums collection
    match /albums/{albumId} {
      allow create, update, delete: if isAdmin();
    }
  }
}
```

**Important**: Replace `ADMIN_UID_1` and `ADMIN_UID_2` with your actual Firebase user UIDs. You can find these in the Firebase Console under Authentication > Users.

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start Vite dev server (http://localhost:5173)
bun run dev          # Start with Bun runtime

# Production
npm run build        # TypeScript check + production build
bun run build        # Build with Bun
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint on all TypeScript files

# Deployment (if using gh-pages)
npm run predeploy    # Build before deploying
npm run deploy       # Deploy to GitHub Pages
```

## 🌐 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect the Vite configuration

3. **Configure Environment Variables**
   
   Add these in Vercel project settings:
   ```
   VITE_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN
   VITE_FIREBASE_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID
   VITE_FIREBASE_APP_ID
   ```

4. **Deploy**
   - Vercel will automatically deploy on push
   - Custom domain configuration available in settings

### Cloudflare Workers (B2 Proxy)

The included `worker.js` proxies requests to Backblaze B2:

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Configure `wrangler.toml`**
   ```toml
   name = "b2-proxy"
   main = "worker.js"
   compatibility_date = "2024-01-01"
   
   [vars]
   B2_ENDPOINT = "https://your-bucket.s3.us-west-001.backblazeb2.com"
   ```

3. **Add Secrets**
   ```bash
   wrangler secret put B2_ACCESS_KEY_ID
   wrangler secret put B2_SECRET_ACCESS_KEY
   ```

4. **Deploy**
   ```bash
   wrangler deploy
   ```

### Manual Deployment

For other hosting providers:

```bash
npm run build
```

Deploy the `dist/` folder to your static hosting service (Netlify, GitHub Pages, Firebase Hosting, etc.).

## 🎨 Features Overview

### Public Pages

#### Home (`/`)
- Hero section with customizable title, subtitle, and background image
- Call-to-action buttons for Albums and Contact
- Responsive design with mobile-optimized layout

#### Albums (`/albums`)
- Grid display of all public albums
- Hero images with image counts
- Click to view full album
- Loading states and empty states

#### Album View (`/album/:id`)
- Full album gallery with responsive grid
- Click to view images in fullscreen
- Keyboard navigation (← →) in fullscreen viewer
- Download options for individual images

#### Pricing (`/pricing`)
- Dynamic pricing packages loaded from Firestore
- Card-based layout with hover effects
- Direct contact button for inquiries

#### Contact (`/contact`)
- Contact information cards (Email, Phone, Location, Instagram)
- Direct action buttons (email, call, maps, follow)
- Admin edit button for authenticated users

### Admin Pages

#### Admin Dashboard (`/admin`)
- **Album Management Section**:
  - Create/rename/delete albums
  - Toggle public/private visibility
  - Set hero images
  - Navigate to album details
  
- **Hero Content Section**:
  - Edit homepage hero title and subtitle
  - Upload and preview hero background image
  
- **Contact Management Section**:
  - Update email, phone, location, Instagram
  
- **Pricing Management Section**:
  - Add/edit/delete pricing packages
  - Drag to reorder (if implemented)

#### Admin Uploader (`/admin/uploader/:albumId`)
- Drag-and-drop image upload
- Multi-file selection
- Real-time upload progress
- Image thumbnails with delete options
- Set album hero image
- Download images individually or in bulk

#### Admin Sign In (`/admin/signin`)
- Email/password authentication
- Error handling and validation
- Redirect after successful login

## 🔒 Security Features

- **Protected Routes**: Admin pages require authentication
- **Firebase Auth**: Secure email/password authentication
- **Firestore Rules**: Database-level security with admin-only writes
- **Environment Variables**: Sensitive credentials stored securely
- **CORS Configuration**: Proper CORS setup for B2 storage
- **No API Keys in Code**: All sensitive data in environment variables

## 🚧 Development Tips

### Local Development
```bash
# Install dependencies
bun install

# Start dev server with hot reload
bun run dev
```

### Adding New Pages
1. Create component in `src/`
2. Add route in `src/main.tsx`
3. Update navigation in `src/components/Navbar.tsx`
4. Update navigation in `src/components/Footer.tsx`

### Adding New UI Components
```bash
# shadcn/ui components can be added with:
npx shadcn@latest add [component-name]
```

### Environment Variables
Never commit `.env.local` to version control. Add it to `.gitignore`.

### TypeScript
The project uses strict TypeScript. Run `npm run build` to check for type errors.

## 📝 License

This project is licensed under the **GNU General Public License v3.0** - see [LICENSE](LICENSE) file for details.

This is a copyleft license - any modifications or derivative works must also be distributed under GPL-3.0.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and passes all type checks.

## 📧 Contact

For inquiries, visit the [Contact Page](https://lensillumination.ca/contact) or email contect@lensillumination.ca

## 👤 Created By

**Jacob Orr**
- GitHub: [@Jquob](https://github.com/Jquob)
- Website: [lensillumination.ca](https://lensillumination.ca)

---

**Live Site**: [lensillumination.ca](https://lensillumination.ca)  
**Repository**: [LensIllumination/Client-Website](https://github.com/LensIllumination/Client-Website)  
**License**: GPL-3.0-only
