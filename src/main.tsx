import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './Home.tsx'
import Contact from './Contact.tsx'
import PublicAlbums from './PublicAlbums.tsx'
import Navbar from './components/Navbar.tsx'
import AdminDashboard from './AdminDashboard.tsx'
import AdminSignIn from './AdminSignIn.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AlbumView } from './AlbumView.tsx'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/albums" element={<PublicAlbums />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/album/:id" element={<AlbumView/>} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/signin" element={<AdminSignIn />} />
      </Routes>
    </BrowserRouter>

    <Toaster />
  </StrictMode>,
)
