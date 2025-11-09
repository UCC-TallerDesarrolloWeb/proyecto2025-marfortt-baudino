import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import '@/styles/Pages.scss'
import MainLayout from '@/layouts/MainLayout'
import DashboardPage from '@/pages/IndexPage'
import HomePage from '@/pages/HomePage'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<MainLayout /> }>
          <Route path="/" element={<DashboardPage />} />
        </Route>
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </HashRouter>
  )
}

export default App
