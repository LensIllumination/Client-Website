import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './Home.tsx'
import Navbar from './components/Navbar.tsx'
import AdminDashboard from './AdminDashboard.tsx'
import AdminSignIn from './AdminSignIn.tsx'
import { BrowserRouter, Routes, Route } from 'react-router'
import { AlbumView } from './AlbumView.tsx'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>

  <Navbar/>

  <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/album/:id" element={<AlbumView/>} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/signin" element={<AdminSignIn />} />
      </Routes>
    </BrowserRouter>

  <Toaster />

  </StrictMode>,
)
