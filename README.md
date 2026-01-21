# Lens Illumination

A modern, responsive photography portfolio web application built with React, TypeScript, and Firebase. Featuring dynamic album management, image uploads via Backblaze B2, and comprehensive admin controls.

![License: GPL-3.0](https://img.shields.io/badge/License-GPL%203.0-blue.svg)
![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript)

## ✨ Features

- **Dynamic Portfolio**: Showcase photography albums with public/private visibility control
- **Admin Dashboard**: Manage albums, upload photos, and edit site content
- **Image Management**: Upload, organize, and delete images with progress tracking
- **Responsive Design**: Mobile-first UI built with Tailwind CSS and shadcn/ui
- **Firestore Integration**: Real-time data sync for albums and images
- **B2 Storage**: Scalable cloud storage with Cloudflare Worker proxy
- **Hero Customization**: Admin controls to update homepage hero text and image
- **QR Code Sharing**: Generate QR codes for easy album sharing
- **Authentication**: Firebase Auth with secure admin routing
- **Debug Support**: Built-in debug album with Picsum Photos integration
- **GPL-3.0 Copyleft**: Free and open-source software

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or bun
- Firebase project
- Backblaze B2 account
- Cloudflare Workers account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/LensIllumination/Client-Website.git
   cd Client-Website
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Configure environment**
   Create `.env.local`:
   ```
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   # or
   bun run build
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Footer.tsx
│   ├── Navbar.tsx
│   └── ...
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── AdminDashboard.tsx  # Admin interface
├── Home.tsx            # Homepage
├── AlbumView.tsx       # Album display
├── Contact.tsx         # Contact page
├── firebase.ts         # Firebase config
└── main.tsx            # App entry point
```

## 🔧 Key Technologies

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Backblaze B2
- **Deployment**: Vercel, Cloudflare Workers
- **Icons**: Lucide React

## 🛠️ Admin Features

### Album Management
- Create, rename, and delete albums
- Toggle public/private visibility
- Set hero images per album
- View and manage album contents

### Image Management
- Upload multiple images with progress tracking
- Automatic thumbnail generation
- Bulk delete operations
- Download high-res and low-res versions
- Fullscreen image viewer

### Site Customization
- Edit homepage hero title and subtitle
- Upload custom hero image
- Manage site-wide settings

## 🔐 Firestore Security Rules

Ensure your Firestore rules allow public reads and admin writes:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public reads
    match /{document=**} {
      allow read: if true;
    }

    // Admin-only writes
    match /settings/{docId} {
      allow write: if request.auth != null
                   && request.auth.uid in ["ADMIN_UID_1", "ADMIN_UID_2"];
    }

    match /images/{imageId} {
      allow write: if request.auth != null
                   && request.auth.uid in ["ADMIN_UID_1", "ADMIN_UID_2"];
    }

    match /albums/{albumId} {
      allow write: if request.auth != null
                   && request.auth.uid in ["ADMIN_UID_1", "ADMIN_UID_2"];
    }
  }
}
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## 🌐 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

### Manual Deployment
```bash
npm run build
# Deploy dist/ folder to your hosting
```

## 📝 License

This project is licensed under the **GNU General Public License v3.0** - see [LICENSE](LICENSE) file for details.

This is a copyleft license - any modifications or derivative works must also be distributed under GPL-3.0.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Contact

For inquiries, visit the [Contact Page](https://lensillumination.ca/contact) or email contect@lensillumination.ca

## 👤 Created by

[Jacob Orr](https://github.com/Jquob)

---

**Repository**: [LensIllumination/Client-Website](https://github.com/LensIllumination/Client-Website)
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
