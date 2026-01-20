import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Navbar from './components/Navbar.tsx'
import { BrowserRouter, Routes, Route } from 'react-router'
import { AlbumView } from './AlbumView.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>

  <Navbar/>

  <BrowserRouter basename="/Client-Website/">
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/album/:id" element={<AlbumView albumId=":id" />} />
      </Routes>
    </BrowserRouter>

  </StrictMode>,
)
