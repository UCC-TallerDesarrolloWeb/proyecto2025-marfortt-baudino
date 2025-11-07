// session.js - comprueba sesión y redirige si no está activa
document.addEventListener("DOMContentLoaded", () => {
  try {
    const session = localStorage.getItem("agroGestion_session");
    if (!session) {
      // No hay sesión, redirigir a la página de inicio/login
      window.location.href = "home.html";
    }
  } catch (err) {
    // En caso de error con localStorage, redirigir por seguridad
    console.error("Error comprobando sesión:", err);
    window.location.href = "home.html";
  }
});
