import React, { useEffect, useState } from 'react';
import '../pages/Pages.css';

export default function IndexPage() {
  const [userEmail, setUserEmail] = useState('');

  // Verificar sesión y precargar email
  useEffect(() => {
    const s = localStorage.getItem('agroGestion_session');
    if (!s) {
      window.location.hash = '/home';
      return;
    }
    try {
      const parsed = JSON.parse(s);
      setUserEmail(parsed.email || '');
    } catch {}
  }, []);

  // Inyectar lógica legacy (app.js) al montar para maquinaria/ganadería/calculadora
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/pages/app.js';
    script.async = true;
    script.onload = () => {
      try { document.dispatchEvent(new Event('DOMContentLoaded')); } catch {}
    };
    document.body.appendChild(script);
    return () => {
      try { document.body.removeChild(script); } catch {}
    };
  }, []);

  const handleLogout = (e) => {
    e && e.preventDefault();
    const ok = window.confirm('¿Estás seguro de que quieres cerrar sesión?');
    if (ok) {
      localStorage.removeItem('agroGestion_session');
      window.location.hash = '/home';
    }
  };

  return (
    <div>
      <header className="site-header">
        <h1 className="site-title"><span className="logo">AgroGestión <span className="accent">360</span></span></h1>
        <div id="user-info" className="user-info">{userEmail ? `👤 ${userEmail}` : ''}</div>
        <nav className="main-nav">
          <a href="#/">Inicio</a>
          <a href="#maquinaria">Maquinaria</a>
          <a href="#ganaderia">Ganadería</a>
          <a href="#siembra">Calculadora</a>
          <a href="#bolsa">Bolsa De Valores</a>
          <a href="#" id="logout-btn" className="logout-btn" onClick={handleLogout}>Cerrar Sesión</a>
        </nav>
      </header>

      <section id="inicio" className="hero">
        <div className="overlay">
          <h1>🌾 AgroGestión 360 🌾</h1>
          <p>Gestión integral para maquinaria, animales y costos de siembra en un solo lugar.</p>
        </div>
      </section>

      <section id="maquinaria" className="section">
        <h2>Organizador de Maquinaria</h2>
        <form id="machinery-form" className="card" encType="multipart/form-data">
          <label htmlFor="m-name">Nombre</label>
          <input id="m-name" placeholder="Nombre" required />
          <label htmlFor="m-type">Tipo</label>
          <select id="m-type" required>
            <option value="">Seleccionar tipo</option>
            <option>Tractor</option>
            <option>Arado</option>
            <option>Sembradora</option>
            <option>Pulverizadoras</option>
            <option>Cosechadoras</option>
            <option>Mixer</option>
            <option>Cabezal</option>
          </select>
          <label htmlFor="m-condition">Estado</label>
          <select id="m-condition" required>
            <option value="">Estado…</option>
            <option>Activo</option>
            <option>Inactivo</option>
          </select>
          <label htmlFor="m-price">Precio (USD)</label>
          <input id="m-price" type="number" placeholder="Precio USD" min="0" step="0.01" required />
          <label htmlFor="m-notes">Notas</label>
          <input id="m-notes" placeholder="Notas" />
          <label htmlFor="m-photo" className="file-label">Foto (opcional)</label>
          <input id="m-photo" type="file" accept="image/*" />
          <button type="submit" className="btn primary">Agregar</button>
        </form>
        <ul id="machinery-list" className="grid"></ul>
        <div id="machinery-empty" className="muted">No hay maquinaria cargada.</div>
      </section>

      <section id="ganaderia" className="section">
        <h2>Registro de Ganadería</h2>
        <form id="breed-form" className="card">
          <label htmlFor="b-type">Tipo de animal</label>
          <select id="b-type" required>
            <option value="">Seleccionar animal</option>
            <option>Vaca</option>
            <option>Toro</option>
            <option>Oveja</option>
            <option>Gallina</option>
            <option>Cerdo</option>
            <option>Caballo</option>
          </select>
          <label htmlFor="b-name">Raza</label>
          <input id="b-name" placeholder="Raza" required />
          <label htmlFor="b-initial">Cantidad inicial</label>
          <input id="b-initial" type="number" min="0" defaultValue={0} />
          <button type="submit" className="btn primary">Agregar</button>
        </form>
        <ul id="breeds-list" className="grid"></ul>
        <div id="breeds-empty" className="muted">No hay razas registradas.</div>
      </section>

      <section id="siembra" className="section">
        <h2>Calculadora de Costos de Siembra</h2>
        <form id="calc-form" className="card">
          <label htmlFor="hectareas">Hectáreas</label>
          <input id="hectareas" type="number" placeholder="Hectáreas" min="0" required />
          <label htmlFor="densidad">Dosis (kg/ha)</label>
          <input id="densidad" type="number" placeholder="Dosis (kg/ha)" min="0" required />
          <label htmlFor="precio-semilla">Precio semilla (USD/kg)</label>
          <input id="precio-semilla" type="number" placeholder="Precio semilla (USD/kg)" min="0" required />
          <label htmlFor="fertil">Fertilizante (USD/ha)</label>
          <input id="fertil" type="number" placeholder="Fertilizante (USD/ha)" min="0" />
          <label htmlFor="labores">Labores (USD/ha)</label>
          <input id="labores" type="number" placeholder="Labores (USD/ha)" min="0" />
          <label htmlFor="combustible">Combustible (USD/ha)</label>
          <input id="combustible" type="number" placeholder="Combustible (USD/ha)" min="0" />
          <label htmlFor="otros">Otros (USD/ha)</label>
          <input id="otros" type="number" placeholder="Otros (USD/ha)" min="0" />
          <label htmlFor="rendimiento">Rendimiento (t/ha)</label>
          <input id="rendimiento" type="number" placeholder="Rendimiento (t/ha)" min="0" />
          <label htmlFor="precio-grano">Precio grano (USD/t)</label>
          <input id="precio-grano" type="number" placeholder="Precio grano (USD/t)" min="0" />
          <button type="submit" className="btn primary">Calcular</button>
        </form>
        <div id="calc-results" className="card"></div>
      </section>

      <section id="bolsa" className="section">
        <h2>Bolsa de Valores</h2>
        <div className="preview-grid">
          <a className="preview-card" href="https://www.cac.bcr.com.ar/es/precios-de-pizarra" target="_blank" rel="noopener noreferrer">
            <img src={encodeURI('/images/logo rosario.png')} alt="Bolsa de Rosario" />
            <div className="preview-info"><h3>Bolsa de Rosario</h3><p>Ver precios pizarra</p></div>
          </a>
          <a className="preview-card" href="https://www.bccba.org.ar/" target="_blank" rel="noopener noreferrer">
            <img src={encodeURI('/images/logo cba .png')} alt="Bolsa de Córdoba" />
            <div className="preview-info"><h3>Bolsa de Córdoba</h3><p>Ver precios pizarra</p></div>
          </a>
        </div>
      </section>

      <div id="confirmation-modal" className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirmation-title">
        <div className="modal-content">
          <div className="modal-header">
            <h3 id="confirmation-title">Confirmar acción</h3>
          </div>
          <div className="modal-body">
            <p id="confirmation-message">¿Estás seguro de que deseas continuar?</p>
            <div id="confirmation-details" className="confirmation-details"></div>
          </div>
          <div className="modal-footer">
            <button id="cancel-btn" className="btn secondary">Cancelar</button>
            <button id="confirm-btn" className="btn danger">Confirmar</button>
          </div>
        </div>
      </div>

      <footer className="footer"><p>© 2025 AgroGestión 360</p></footer>
    </div>
  );
}

