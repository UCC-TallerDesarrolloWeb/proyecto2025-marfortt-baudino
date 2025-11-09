import React, { useEffect, useState } from 'react';
import WeatherPicker from '@/widgets/WeatherPicker';
import Button from '@/components/Button';
import '@/styles/Pages.css';

export default function IndexPage() {
  // Sesión de usuario (redirige a /home si no hay sesión)
  useEffect(() => {
    try {
      const s = localStorage.getItem('agroGestion_session');
      if (!s) {
        window.location.hash = '/home';
        return;
      }
      // const parsed = JSON.parse(s);
      // userEmail is no longer needed here; header shows session via context
    } catch (e) { console.error(e) }
  }, []);

  // ---------------- Maquinaria ----------------
  const [mName, setMName] = useState('');
  const [mType, setMType] = useState('');
  const [mCondition, setMCondition] = useState('');
  const [mPrice, setMPrice] = useState('');
  const [mNotes, setMNotes] = useState('');
  const [mPhoto, setMPhoto] = useState(null); // data URL
  const [machinery, setMachinery] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('agroGestion_machinery');
      if (stored) setMachinery(JSON.parse(stored));
  } catch (e) { console.error(e) }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('agroGestion_machinery', JSON.stringify(machinery)); } catch (e) { console.error(e) }
  }, [machinery]);

  const onPhotoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) { setMPhoto(null); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setMPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleMachinerySubmit = (e) => {
    e.preventDefault();
    const price = Number(mPrice);
    if (!mName || !mType || !mCondition || isNaN(price) || price < 0) {
      alert('Complete los campos requeridos con valores válidos.');
      return;
    }
    const item = { name: mName, type: mType, condition: mCondition, price, notes: mNotes, photo: mPhoto };
    setMachinery(prev => [...prev, item]);
    setMName(''); setMType(''); setMCondition(''); setMPrice(''); setMNotes(''); setMPhoto(null);
    const fileInput = document.getElementById('m-photo');
    if (fileInput) fileInput.value = '';
  };

  // ---------------- Ganadería ----------------
  const [bType, setBType] = useState('');
  const [bName, setBName] = useState('');
  const [bInitial, setBInitial] = useState('0');
  const [breeds, setBreeds] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('agroGestion_breeds');
      if (stored) setBreeds(JSON.parse(stored));
  } catch (e) { console.error(e) }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('agroGestion_breeds', JSON.stringify(breeds)); } catch (e) { console.error(e) }
  }, [breeds]);

  const handleBreedSubmit = (e) => {
    e.preventDefault();
    const count = Number(bInitial);
    if (!bType || !bName || isNaN(count) || count < 0) { alert('Complete los campos de ganadería correctamente.'); return; }
    setBreeds(prev => [...prev, { type: bType, name: bName, count }]);
    setBType(''); setBName(''); setBInitial('0');
  };

  // ---------------- Calculadora ----------------
  const [hectareas, setHectareas] = useState('');
  const [densidad, setDensidad] = useState('');
  const [precioSemilla, setPrecioSemilla] = useState('');
  const [fertil, setFertil] = useState('');
  const [labores, setLabores] = useState('');
  const [combustible, setCombustible] = useState('');
  const [otros, setOtros] = useState('');
  const [rendimiento, setRendimiento] = useState('');
  const [precioGrano, setPrecioGrano] = useState('');
  const [calc, setCalc] = useState(null);

  const handleCalcSubmit = (e) => {
    e.preventDefault();
    const n = (v) => { const x = Number(v); return isNaN(x) ? null : x; };
    const ha = n(hectareas), d = n(densidad), pSem = n(precioSemilla), f = n(fertil||0), l = n(labores||0), c = n(combustible||0), o = n(otros||0), r = n(rendimiento||0), pG = n(precioGrano||0);
    if ([ha,d,pSem].some(v => v===null) || ha<0 || d<0 || pSem<0) { alert('Complete los campos obligatorios de la calculadora.'); return; }
    const costoSemillaHa = d * pSem;
    const costoHa = costoSemillaHa + (f||0) + (l||0) + (c||0) + (o||0);
    const costoTotal = costoHa * ha;
    const ingresoTotal = (r||0) * (pG||0) * ha;
    const utilidad = ingresoTotal - costoTotal;
    setCalc({ costoTotal, ingresoTotal, utilidad });
  };

  // ---------------- Modal de confirmación ----------------
  const [modal, setModal] = useState({ show: false, title: '', message: '', details: null, onConfirm: null });
  const showModal = (title, message, details, onConfirm) => setModal({ show: true, title, message, details, onConfirm });
  const hideModal = () => setModal(m => ({ ...m, show: false, onConfirm: null }));

  const confirmDeleteMachinery = (item) => {
    const details = (
      <div className="detail-meta">
        <strong>{item.name}</strong><br/>
        Tipo: {item.type}<br/>
        Estado: {item.condition}<br/>
        Precio: USD {Number(item.price).toLocaleString()}
      </div>
    );
    showModal('Confirmar Eliminación', '¿Estás seguro de que quieres eliminar esta maquinaria?', details, () => {
      setMachinery(prev => prev.filter(x => x !== item));
      hideModal();
    });
  };

  const confirmDeleteBreed = (b) => {
    const details = (
      <div className="detail-meta">
        <strong>{b.type} - {b.name}</strong><br/>
        Cantidad actual: {b.count} {b.count===1 ? 'animal' : 'animales'}
      </div>
    );
    showModal('Confirmar Eliminación', '¿Estás seguro de que quieres eliminar esta raza completa?', details, () => {
      setBreeds(prev => prev.filter(x => x !== b));
      hideModal();
    });
  };

  // ---------------- Logout ----------------
  // Logout handled by MainLayout; no local handler here

  return (
    <div>
      <section id="inicio" className="hero">
        <div className="overlay">
          <h1>🌾 AgroGestión 360 🌾</h1>
          <p>Gestión integral para maquinaria, animales y costos de siembra en un solo lugar.</p>
        </div>
      </section>

      <section id="maquinaria" className="section">
        <h2>Organizador de Maquinaria</h2>
        <form id="machinery-form" className="card" encType="multipart/form-data" onSubmit={handleMachinerySubmit}>
          <label htmlFor="m-name">Nombre</label>
          <input id="m-name" placeholder="Nombre" required value={mName} onChange={e=>setMName(e.target.value)} />
          <label htmlFor="m-type">Tipo</label>
          <select id="m-type" required value={mType} onChange={e=>setMType(e.target.value)}>
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
          <select id="m-condition" required value={mCondition} onChange={e=>setMCondition(e.target.value)}>
            <option value="">Estado…</option>
            <option>Activo</option>
            <option>Inactivo</option>
          </select>
          <label htmlFor="m-price">Precio (USD)</label>
          <input id="m-price" type="number" placeholder="Precio USD" min="0" step="0.01" required value={mPrice} onChange={e=>setMPrice(e.target.value)} />
          <label htmlFor="m-notes">Notas</label>
          <input id="m-notes" placeholder="Notas" value={mNotes} onChange={e=>setMNotes(e.target.value)} />
          <label htmlFor="m-photo" className="file-label">Foto (opcional)</label>
          <input id="m-photo" type="file" accept="image/*" onChange={onPhotoChange} />
          <Button type="submit" className="primary">Agregar</Button>
        </form>
        <ul id="machinery-list" className="grid">
          {machinery.map((m, idx) => (
            <li key={idx} className="item machinery-item">
              {m.photo && (
                <div className="machinery-photo">
                  <img src={m.photo} alt={`Foto de ${m.name}`} className="machinery-image" />
                </div>
              )}
              <div className="machinery-info">
                <strong>{m.name}</strong> ({m.type}) - {m.condition} - USD {Number(m.price).toLocaleString()}<br/>
                <small>{m.notes || ''}</small><br/>
                <Button onClick={()=>confirmDeleteMachinery(m)}>Eliminar</Button>
              </div>
            </li>
          ))}
        </ul>
        {machinery.length === 0 && (<div id="machinery-empty" className="muted">No hay maquinaria cargada.</div>)}
      </section>

      <section id="ganaderia" className="section">
        <h2>Registro de Ganadería</h2>
        <form id="breed-form" className="card" onSubmit={handleBreedSubmit}>
          <label htmlFor="b-type">Tipo de animal</label>
          <select id="b-type" required value={bType} onChange={e=>setBType(e.target.value)}>
            <option value="">Seleccionar animal</option>
            <option>Vaca</option>
            <option>Toro</option>
            <option>Oveja</option>
            <option>Gallina</option>
            <option>Cerdo</option>
            <option>Caballo</option>
          </select>
          <label htmlFor="b-name">Raza</label>
          <input id="b-name" placeholder="Raza" required value={bName} onChange={e=>setBName(e.target.value)} />
          <label htmlFor="b-initial">Cantidad inicial</label>
          <input id="b-initial" type="number" min="0" value={bInitial} onChange={e=>setBInitial(e.target.value)} />
          <Button type="submit" className="primary">Agregar</Button>
        </form>
        <ul id="breeds-list" className="grid">
          {breeds.map((b, idx) => (
            <li key={idx} className="item">
              <strong>{b.type}</strong> - {b.name}: {b.count}
              <Button onClick={()=>{ setBreeds(prev => prev.map((x,i)=> i===idx ? {...x, count:x.count+1} : x)); }}>+1</Button>
              <Button onClick={()=>{ setBreeds(prev => prev.map((x,i)=> i===idx ? {...x, count: Math.max(0, x.count-1)} : x)); }}>-1</Button>
              <Button onClick={()=>confirmDeleteBreed(b)}>Eliminar</Button>
            </li>
          ))}
        </ul>
        {breeds.length === 0 && (<div id="breeds-empty" className="muted">No hay razas registradas.</div>)}
      </section>

      <section id="siembra" className="section">
        <h2>Calculadora de Costos de Siembra</h2>
        <form id="calc-form" className="card" onSubmit={handleCalcSubmit}>
          <label htmlFor="hectareas">Hectáreas</label>
          <input id="hectareas" type="number" placeholder="Hectáreas" min="0" required value={hectareas} onChange={e=>setHectareas(e.target.value)} />
          <label htmlFor="densidad">Dosis (kg/ha)</label>
          <input id="densidad" type="number" placeholder="Dosis (kg/ha)" min="0" required value={densidad} onChange={e=>setDensidad(e.target.value)} />
          <label htmlFor="precio-semilla">Precio semilla (USD/kg)</label>
          <input id="precio-semilla" type="number" placeholder="Precio semilla (USD/kg)" min="0" required value={precioSemilla} onChange={e=>setPrecioSemilla(e.target.value)} />
          <label htmlFor="fertil">Fertilizante (USD/ha)</label>
          <input id="fertil" type="number" placeholder="Fertilizante (USD/ha)" min="0" value={fertil} onChange={e=>setFertil(e.target.value)} />
          <label htmlFor="labores">Labores (USD/ha)</label>
          <input id="labores" type="number" placeholder="Labores (USD/ha)" min="0" value={labores} onChange={e=>setLabores(e.target.value)} />
          <label htmlFor="combustible">Combustible (USD/ha)</label>
          <input id="combustible" type="number" placeholder="Combustible (USD/ha)" min="0" value={combustible} onChange={e=>setCombustible(e.target.value)} />
          <label htmlFor="otros">Otros (USD/ha)</label>
          <input id="otros" type="number" placeholder="Otros (USD/ha)" min="0" value={otros} onChange={e=>setOtros(e.target.value)} />
          <label htmlFor="rendimiento">Rendimiento (t/ha)</label>
          <input id="rendimiento" type="number" placeholder="Rendimiento (t/ha)" min="0" value={rendimiento} onChange={e=>setRendimiento(e.target.value)} />
          <label htmlFor="precio-grano">Precio grano (USD/t)</label>
          <input id="precio-grano" type="number" placeholder="Precio grano (USD/t)" min="0" value={precioGrano} onChange={e=>setPrecioGrano(e.target.value)} />
          <Button type="submit" className="primary">Calcular</Button>
        </form>
        <div id="calc-results" className="card">
          {calc && (
            <>
              <p><strong>Costo total:</strong> USD {calc.costoTotal.toFixed(2)}</p>
              <p><strong>Ingreso esperado:</strong> USD {calc.ingresoTotal.toFixed(2)}</p>
              <p><strong>Utilidad estimada:</strong> USD {calc.utilidad.toFixed(2)}</p>
            </>
          )}
        </div>
      </section>

      <section id="clima" className="section">
        <h2>Clima</h2>
        <p>Seleccioná un punto en el mapa para ver el clima actual y la probabilidad de lluvia.</p>
        <div className="card">
          <div id="weather-picker-container">
            {/* El mapa y resultados los renderiza WeatherPicker */}
            <WeatherPicker />
          </div>
        </div>
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

      {modal.show && (
        <div className="modal-overlay show" onClick={(e)=>{ if (e.target === e.currentTarget) hideModal(); }}>
          <div className="modal-content">
            <div className="modal-header"><h3>{modal.title}</h3></div>
            <div className="modal-body">
              <p>{modal.message}</p>
              <div className="confirmation-details">{modal.details}</div>
            </div>
            <div className="modal-footer">
              <Button className="secondary" onClick={hideModal}>Cancelar</Button>
              <Button className="danger" onClick={()=>{ if (modal.onConfirm) modal.onConfirm(); }}>Confirmar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
