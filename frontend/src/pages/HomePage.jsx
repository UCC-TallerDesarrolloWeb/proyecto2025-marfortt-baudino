import React, { useState, useEffect } from 'react';
import '../pages/Pages.css';

export default function HomePage() {
  const [showRegister, setShowRegister] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Controlled form state (simple)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  useEffect(() => {
    // Pre-fill login email if user exists
    const user = localStorage.getItem('agroGestion_user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setLoginEmail(parsed?.email || '');
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const showTmpMessage = (text, type='success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text:'', type:'' }), 4000);
  };

  const getRegisteredUser = () => {
    const u = localStorage.getItem('agroGestion_user');
    return u ? JSON.parse(u) : null;
  };

  const validateRegister = (name, email, password, confirm) => {
    if (!name.trim()) return { isValid: false, message: 'El nombre es requerido' };
    if (!email.includes('@')) return { isValid: false, message: 'Ingrese un email válido' };
    const existingUser = getRegisteredUser();
    if (existingUser && existingUser.email === email) return { isValid: false, message: 'Ya existe una cuenta con este email' };
    if (password.length < 8) return { isValid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
    if (password !== confirm) return { isValid: false, message: 'Las contraseñas no coinciden' };
    return { isValid: true };
  };

  const saveUserData = (name, email, password) => {
    const userData = { name, email, password, registeredAt: new Date().toISOString() };
    localStorage.setItem('agroGestion_user', JSON.stringify(userData));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const registered = getRegisteredUser();
    if (!loginEmail || !loginPassword) { showTmpMessage('Por favor, complete todos los campos', 'error'); return; }
    if (registered && registered.email === loginEmail && registered.password === loginPassword) {
      localStorage.setItem('agroGestion_session', JSON.stringify({ email: loginEmail, loginTime: new Date().toISOString() }));
      showTmpMessage('¡Bienvenido! Redirigiendo...', 'success');
      setTimeout(() => { window.location.hash = '/'; }, 800);
    } else {
      if (!registered) showTmpMessage('No hay usuario registrado. Por favor, regístrese primero.', 'error');
      else showTmpMessage('Credenciales incorrectas. Verifique su email y contraseña.', 'error');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const v = validateRegister(regName, regEmail, regPassword, regConfirm);
    if (!v.isValid) { showTmpMessage(v.message, 'error'); return; }
    saveUserData(regName, regEmail, regPassword);
    showTmpMessage('¡Cuenta creada exitosamente! Ahora puede iniciar sesión.', 'success');
    setTimeout(() => { setShowRegister(false); setLoginEmail(regEmail); }, 800);
  };

  return (
    <div className="hero">
      <div className="overlay">
        <h1>🌱 Bienvenido a AgroGestión 360 🌱</h1>
        <p>La plataforma integral para gestión de maquinaria, ganadería y costos de siembra.</p>

        {message.text && (
          <div className={`auth-message ${message.type}`} style={{display:'block'}}>{message.text}</div>
        )}

        <div className="auth-container">
          <div id="login-form" className={`auth-form ${!showRegister ? 'active' : ''}`}>
            <h2>Iniciar Sesión</h2>
            <form id="login-form-element" onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="login-email">Correo Electrónico:</label>
                <input type="email" id="login-email" name="email" placeholder="Ingrese su correo electrónico" required value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="login-password">Contraseña:</label>
                <input type="password" id="login-password" name="password" placeholder="Ingrese su contraseña" required value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn primary">Iniciar Sesión</button>
            </form>
            <p className="auth-switch">¿No tienes cuenta? <a href="#" onClick={(e)=>{e.preventDefault(); setShowRegister(true);}}>Regístrate aquí</a></p>
          </div>

          <div id="register-form" className={`auth-form ${showRegister ? 'active' : ''}`}>
            <h2>Crear Cuenta</h2>
            <form id="register-form-element" onSubmit={handleRegister}>
              <div className="form-group">
                <label htmlFor="register-name">Nombre Completo:</label>
                <input type="text" id="register-name" name="name" placeholder="Ingrese su nombre completo" required value={regName} onChange={e=>setRegName(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="register-email">Correo Electrónico:</label>
                <input type="email" id="register-email" name="email" placeholder="ejemplo@correo.com" required value={regEmail} onChange={e=>setRegEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="register-password">Contraseña:</label>
                <input type="password" id="register-password" name="password" placeholder="Mínimo 8 caracteres" minLength={8} required value={regPassword} onChange={e=>setRegPassword(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="register-confirm">Confirmar Contraseña:</label>
                <input type="password" id="register-confirm" name="confirm" placeholder="Repita su contraseña" required value={regConfirm} onChange={e=>setRegConfirm(e.target.value)} />
              </div>
              <button type="submit" className="btn primary">Crear Cuenta</button>
            </form>
            <p className="auth-switch">¿Ya tienes cuenta? <a href="#" onClick={(e)=>{e.preventDefault(); setShowRegister(false);}}>Inicia sesión aquí</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

