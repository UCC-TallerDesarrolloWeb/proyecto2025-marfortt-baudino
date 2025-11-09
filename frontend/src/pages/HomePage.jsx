import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/contexts/session';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Card from '@/components/Card';
import '@/styles/Pages.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { setSession } = useSession() || { setSession: ()=>{} };
  const [showRegister, setShowRegister] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Controlled form state (simple)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState({ email: '', password: '' });

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regErrors, setRegErrors] = useState({ name:'', email:'', password:'', confirm:'' });

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

  // Validaciones en tiempo real (onChange)
  useEffect(() => {
    setLoginErrors({
      email: loginEmail && !loginEmail.includes('@') ? 'Email inválido' : '',
      password: loginPassword && loginPassword.length < 8 ? 'Mínimo 8 caracteres' : ''
    })
  }, [loginEmail, loginPassword])

  useEffect(() => {
    setRegErrors({
      name: regName && !regName.trim() ? 'Nombre requerido' : '',
      email: regEmail && !regEmail.includes('@') ? 'Email inválido' : '',
      password: regPassword && regPassword.length < 8 ? 'Mínimo 8 caracteres' : '',
      confirm: regConfirm && regConfirm !== regPassword ? 'No coincide con contraseña' : ''
    })
  }, [regName, regEmail, regPassword, regConfirm])

  const saveUserData = (name, email, password) => {
    const userData = { name, email, password, registeredAt: new Date().toISOString() };
    localStorage.setItem('agroGestion_user', JSON.stringify(userData));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const registered = getRegisteredUser();
    if (!loginEmail || !loginPassword) { showTmpMessage('Por favor, complete todos los campos', 'error'); return; }
    if (registered && registered.email === loginEmail && registered.password === loginPassword) {
      const sess = { email: loginEmail, loginTime: new Date().toISOString() };
      localStorage.setItem('agroGestion_session', JSON.stringify(sess));
      if (setSession) setSession(sess);
      showTmpMessage('¡Bienvenido! Redirigiendo...', 'success');
      setTimeout(() => { navigate('/'); }, 800);
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
              <Input label="Correo Electrónico:" id="login-email" type="email" name="email" placeholder="Ingrese su correo electrónico" required value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} error={loginErrors.email} />
              <Input label="Contraseña:" id="login-password" type="password" name="password" placeholder="Ingrese su contraseña" required value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} error={loginErrors.password} />
              <Button type="submit" className="primary">Iniciar Sesión</Button>
            </form>
            <p className="auth-switch">¿No tienes cuenta? <a href="#" onClick={(e)=>{e.preventDefault(); setShowRegister(true);}}>Regístrate aquí</a></p>
          </div>

          <div id="register-form" className={`auth-form ${showRegister ? 'active' : ''}`}>
            <h2>Crear Cuenta</h2>
            <form id="register-form-element" onSubmit={handleRegister}>
              <Input label="Nombre Completo:" id="register-name" name="name" placeholder="Ingrese su nombre completo" required value={regName} onChange={e=>setRegName(e.target.value)} error={regErrors.name} />
              <Input label="Correo Electrónico:" id="register-email" type="email" name="email" placeholder="ejemplo@correo.com" required value={regEmail} onChange={e=>setRegEmail(e.target.value)} error={regErrors.email} />
              <Input label="Contraseña:" id="register-password" type="password" name="password" placeholder="Mínimo 8 caracteres" minLength={8} required value={regPassword} onChange={e=>setRegPassword(e.target.value)} error={regErrors.password} />
              <Input label="Confirmar Contraseña:" id="register-confirm" type="password" name="confirm" placeholder="Repita su contraseña" required value={regConfirm} onChange={e=>setRegConfirm(e.target.value)} error={regErrors.confirm} />
              <Button type="submit" className="primary">Crear Cuenta</Button>
            </form>
            <p className="auth-switch">¿Ya tienes cuenta? <a href="#" onClick={(e)=>{e.preventDefault(); setShowRegister(false);}}>Inicia sesión aquí</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
