import React, { createContext, useContext, useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

const SessionContext = createContext(null)
export const useSession = () => useContext(SessionContext)

export default function MainLayout() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('agroGestion_session')
      if (raw) setSession(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    // Proteger rutas principales
    if (!session) {
      const raw = localStorage.getItem('agroGestion_session')
      if (!raw) navigate('/home', { replace: true })
    }
  }, [session, navigate])

  const logout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      localStorage.removeItem('agroGestion_session')
      setSession(null)
      navigate('/home')
    }
  }

  const scrollTo = (id) => (e) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      <header className="site-header">
        <h1 className="site-title"><span className="logo">AgroGestión <span className="accent">360</span></span></h1>
        <div id="user-info" className="user-info">{session?.email ? `👤 ${session.email}` : ''}</div>
        <nav className="main-nav">
          <a href="#/" onClick={(e)=>{ e.preventDefault(); navigate('/'); }}>Inicio</a>
          <a href="#maquinaria" onClick={scrollTo('maquinaria')}>Maquinaria</a>
          <a href="#ganaderia" onClick={scrollTo('ganaderia')}>Ganadería</a>
          <a href="#siembra" onClick={scrollTo('siembra')}>Calculadora</a>
          <a href="#clima" onClick={scrollTo('clima')}>Clima</a>
          <a href="#bolsa" onClick={scrollTo('bolsa')}>Bolsa De Valores</a>
          {session?.email && <a href="#" id="logout-btn" className="logout-btn" onClick={(e)=>{e.preventDefault(); logout();}}>Cerrar Sesión</a>}
        </nav>
      </header>

      <Outlet />

      <footer className="footer"><p>© 2025 AgroGestión 360</p></footer>
    </SessionContext.Provider>
  )
}
