import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { SessionContext } from '@/contexts/session'
import ConfirmModal from '@/components/ConfirmModal'

export default function MainLayout() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [logoutModal, setLogoutModal] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('agroGestion_session')
      if (raw) setSession(JSON.parse(raw))
    } catch (error) {
      // Log any errors when reading/parsing session to aid debugging
      console.error('Failed to read or parse agroGestion_session from localStorage:', error)
    }
  }, [])

  useEffect(() => {
    // Proteger rutas principales
    if (!session) {
      const raw = localStorage.getItem('agroGestion_session')
      if (!raw) navigate('/home', { replace: true })
    }
  }, [session, navigate])

  const logout = () => {
    // show modal handled in component state
    setLogoutModal(true)
  }

  const confirmLogout = () => {
    localStorage.removeItem('agroGestion_session')
    setSession(null)
    setLogoutModal(false)
    navigate('/home')
  }

  const cancelLogout = () => setLogoutModal(false)

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
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault()
              // Smooth-scroll to top. If we're already on the root route, just scroll.
              // If we're on another route, navigate to root first then scroll after a short delay.
              const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
              const isAtRoot = window.location.hash === '#/' || window.location.hash === '' || window.location.hash === '#'
              if (isAtRoot) {
                scrollTop()
              } else {
                navigate('/')
                // small delay to allow route change & content render
                setTimeout(scrollTop, 120)
              }
            }}
          >Inicio</a>
          <a href="#maquinaria" onClick={scrollTo('maquinaria')}>Maquinaria</a>
          <a href="#ganaderia" onClick={scrollTo('ganaderia')}>Ganadería</a>
          <a href="#siembra" onClick={scrollTo('siembra')}>Calculadora</a>
          <a href="#clima" onClick={scrollTo('clima')}>Clima</a>
          <a href="#bolsa" onClick={scrollTo('bolsa')}>Bolsa De Valores</a>
          {session?.email && <a href="#" id="logout-btn" className="logout-btn" onClick={(e)=>{e.preventDefault(); logout();}}>Cerrar Sesión</a>}
        </nav>
      </header>

      <ConfirmModal
        show={logoutModal}
        title="Cerrar sesión"
        message={"Se cerrará tu sesión actual y volverás a la página de inicio."}
        details={session?.email ? (<><strong>👤 {session.email}</strong></>) : null}
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />

      <Outlet />

      <footer className="footer"><p>© 2025 AgroGestión 360</p></footer>
    </SessionContext.Provider>
  )
}
