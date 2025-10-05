/**
 * Funcionalidad de autenticación para AgroGestión 360
 */

document.addEventListener("DOMContentLoaded", () => {
  /**
   * Función selectora abreviada para document.querySelector
   * @method $
   * @param {string} sel - Selector CSS del elemento a buscar
   * @returns {HTMLElement} Elemento DOM encontrado
   */
  const $ = (sel) => document.querySelector(sel);

  // Elementos del DOM
  const loginForm = $("#login-form");
  const registerForm = $("#register-form");
  const loginFormElement = $("#login-form-element");
  const registerFormElement = $("#register-form-element");
  const showRegisterLink = $("#show-register");
  const showLoginLink = $("#show-login");
  const authMessage = $("#auth-message");

  /**
   * Obtiene los datos del usuario registrado desde localStorage
   * @method getRegisteredUser
   * @returns {object|null} Datos del usuario o null si no existe
   */
  const getRegisteredUser = () => {
    const userData = localStorage.getItem('agroGestion_user');
    return userData ? JSON.parse(userData) : null;
  };

  /**
   * Muestra un mensaje al usuario (error o éxito)
   * @method showMessage
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de mensaje ('success' o 'error')
   */
  const showMessage = (message, type) => {
    authMessage.textContent = message;
    authMessage.className = `auth-message ${type}`;
    authMessage.style.display = "block";
    
    // Ocultar mensaje después de 5 segundos
    setTimeout(() => {
      authMessage.style.display = "none";
    }, 5000);
  };

  /**
   * Cambia entre formulario de login y registro
   * @method toggleForms
   * @param {string} formToShow - 'login' o 'register'
   */
  const toggleForms = (formToShow) => {
    if (formToShow === 'register') {
      loginForm.classList.remove('active');
      registerForm.classList.add('active');
    } else {
      registerForm.classList.remove('active');
      loginForm.classList.add('active');
    }
    // Limpiar mensajes al cambiar de formulario
    authMessage.style.display = "none";
  };

  /**
   * Valida las credenciales de login contra el usuario registrado
   * @method validateLogin
   * @param {string} email - Email ingresado
   * @param {string} password - Contraseña ingresada
   * @returns {boolean} True si las credenciales son válidas
   */
  const validateLogin = (email, password) => {
    const registeredUser = getRegisteredUser();
    if (!registeredUser) {
      return false; // No hay usuario registrado
    }
    return email === registeredUser.email && password === registeredUser.password;
  };

  /**
   * Valida los datos del formulario de registro
   * @method validateRegister
   * @param {string} name - Nombre completo
   * @param {string} email - Email
   * @param {string} password - Contraseña
   * @param {string} confirm - Confirmación de contraseña
   * @returns {object} Objeto con isValid y message
   */
  const validateRegister = (name, email, password, confirm) => {
    if (!name.trim()) {
      return { isValid: false, message: "El nombre es requerido" };
    }
    
    if (!email.includes('@')) {
      return { isValid: false, message: "Ingrese un email válido" };
    }
    
    // Verificar si ya existe un usuario con este email
    const existingUser = getRegisteredUser();
    if (existingUser && existingUser.email === email) {
      return { isValid: false, message: "Ya existe una cuenta con este email" };
    }
    
    if (password.length < 8) {
      return { isValid: false, message: "La contraseña debe tener al menos 8 caracteres" };
    }
    
    if (password !== confirm) {
      return { isValid: false, message: "Las contraseñas no coinciden" };
    }
    
    return { isValid: true, message: "Datos válidos" };
  };

  /**
   * Guarda los datos del usuario registrado en localStorage
   * @method saveUserData
   * @param {string} name - Nombre del usuario
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   */
  const saveUserData = (name, email, password) => {
    const userData = {
      name: name,
      email: email,
      password: password,
      registeredAt: new Date().toISOString()
    };
    localStorage.setItem('agroGestion_user', JSON.stringify(userData));
  };

  /**
   * Maneja el envío del formulario de login
   * @method handleLogin
   * @param {Event} e - Evento de envío del formulario
   */
  const handleLogin = (e) => {
    e.preventDefault();
    
    const email = $("#login-email").value.trim();
    const password = $("#login-password").value;

    if (!email || !password) {
      showMessage("Por favor, complete todos los campos", "error");
      return;
    }

    if (validateLogin(email, password)) {
      showMessage("¡Bienvenido a AgroGestión 360!", "success");
      
      // Guardar sesión
      localStorage.setItem('agroGestion_session', JSON.stringify({
        email: email,
        loginTime: new Date().toISOString()
      }));
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } else {
      const registeredUser = getRegisteredUser();
      if (!registeredUser) {
        showMessage("No hay usuario registrado. Por favor, regístrese primero.", "error");
      } else {
        showMessage("Credenciales incorrectas. Verifique su email y contraseña.", "error");
      }
      // Limpiar campos
      $("#login-password").value = "";
    }
  };

  /**
   * Maneja el envío del formulario de registro
   * @method handleRegister
   * @param {Event} e - Evento de envío del formulario
   */
  const handleRegister = (e) => {
    e.preventDefault();
    
    const name = $("#register-name").value.trim();
    const email = $("#register-email").value.trim();
    const password = $("#register-password").value;
    const confirm = $("#register-confirm").value;

    const validation = validateRegister(name, email, password, confirm);
    
    if (!validation.isValid) {
      showMessage(validation.message, "error");
      return;
    }

    // Guardar datos del usuario
    saveUserData(name, email, password);
    
    showMessage("¡Cuenta creada exitosamente! Ahora puede iniciar sesión.", "success");
    
    // Cambiar a formulario de login después de 2 segundos
    setTimeout(() => {
      toggleForms('login');
      // Pre-llenar email en login
      $("#login-email").value = email;
    }, 2000);
  };

  // Event listeners
  showRegisterLink.addEventListener("click", (e) => {
    e.preventDefault();
    toggleForms('register');
  });

  showLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    toggleForms('login');
  });

  loginFormElement.addEventListener("submit", handleLogin);
  registerFormElement.addEventListener("submit", handleRegister);

  // Inicialización: mostrar formulario apropiado
  const initializeForms = () => {
    // Siempre mostrar login por defecto
    toggleForms('login');
    
    const registeredUser = getRegisteredUser();
    if (registeredUser) {
      // Si hay usuario registrado, pre-llenar email
      $("#login-email").value = registeredUser.email;
    }
  };

  // Verificar si ya hay una sesión activa
  const existingSession = localStorage.getItem('agroGestion_session');
  if (existingSession) {
    const sessionData = JSON.parse(existingSession);
    showMessage(`Ya tienes una sesión activa como ${sessionData.email}`, "success");
    
    // Mostrar botón para ir directamente a la app
    setTimeout(() => {
      const overlay = $(".overlay");
      const goToAppBtn = document.createElement('a');
      goToAppBtn.href = "index.html";
      goToAppBtn.className = "btn";
      goToAppBtn.textContent = "Ir a la Aplicación";
      goToAppBtn.style.marginTop = "10px";
      overlay.appendChild(goToAppBtn);
    }, 1000);
  } else {
    // Inicializar formularios si no hay sesión activa
    initializeForms();
  }
});