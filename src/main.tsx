import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './Home.tsx'
import Contact from './Contact.tsx'
import Pricing from './Pricing.tsx'
import PublicAlbums from './PublicAlbums.tsx'
import Navbar from './components/Navbar.tsx'
import AdminFab from './components/AdminFab.tsx'
import Footer from './components/Footer.tsx'
import AdminDashboard from './AdminDashboard.tsx'
import AdminSignIn from './AdminSignIn.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AlbumView } from './AlbumView.tsx'
import { Toaster } from 'sonner'
import NotFound from './NotFound.tsx'
import License from './License'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Navbar />
      <AdminFab />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/albums" element={<PublicAlbums />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/license" element={<License />} />
        <Route path="/album/:id" element={<AlbumView/>} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/:albumId" element={<AdminDashboard />} />
        <Route path="/admin/signin" element={<AdminSignIn />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>

    <Toaster />
  </StrictMode>,
)
