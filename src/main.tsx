import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Navbar from './components/Navbar.tsx'
import { BrowserRouter, Routes, Route } from 'react-router'
import { Gallery } from './Gallery.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>

  <Navbar/>

  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App/>} />
      <Route path="/gallery" element={<Gallery albumId='gQBYkyzXp0Ymrw8upnxe'/>} />
    </Routes>
  </BrowserRouter>

  </StrictMode>,
)
